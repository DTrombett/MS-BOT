import { EmbedBuilder, GuildTextBasedChannel, Message } from "discord.js";
import ms from "ms";
import { setTimeout as setPromiseTimeout } from "node:timers/promises";
import { WebSocket } from "undici";
import { Document, MatchDay, User } from "../models";
import loadMatches from "./loadMatches";
import { printToStderr, printToStdout } from "./logger";
import normalizeTeamName from "./normalizeTeamName";
import { MatchesData } from "./types";

type Leaderboard = [Document<typeof User>, number, number][];
const dayPoints = [3, 2, 1];
const resolveMatches = (matches: Extract<MatchesData, { success: true }>) =>
	matches.data
		.map(
			(match) =>
				`- ${match.match_status === 1 ? "🔴 " : ""}[${normalizeTeamName(
					match.home_team_name,
				)} - ${normalizeTeamName(match.away_team_name)}](https://legaseriea.it${
					match.slug
				}): ${
					match.match_status === 0
						? `<t:${Math.round(new Date(match.date_time).getTime() / 1_000)}:F>`
						: `**${match.home_goal ?? 0} - ${match.away_goal ?? 0}**`
				}`,
		)
		.join("\n");
const resolveLeaderboard = (
	users: Document<typeof User>[],
	matches: Extract<MatchesData, { success: true }>,
) => {
	let lastIndex = 0;
	const leaderboard = users
		.map(
			(
				user,
			): [
				user: Document<typeof User>,
				matchPoints: number,
				dayPoints: number,
			] => [
				user,
				matches.data.reduce((points, match) => {
					if (match.match_status === 0) return points;
					const teams =
						`${match.home_team_name} - ${match.away_team_name}`.toLowerCase();
					const prediction = user.predictions?.find(
						(p) => teams === p.teams.toLowerCase(),
					);

					match.home_goal ??= 0;
					match.away_goal ??= 0;
					if (!prediction) return points - 1;
					const result =
						match.home_goal > match.away_goal
							? "1"
							: match.home_goal < match.away_goal
							? "2"
							: "X";
					const matched = prediction.prediction.match(
						/(?<type>(X|1|2){1,2})( \((?<home>(?<=\()\d+) - (?<away>\d+(?=\))))?/,
					)?.groups;

					if (!matched) return points - 1;
					const { type, home, away } = matched as {
						type: "1" | "2" | "X";
						home?: `${number}`;
						away?: `${number}`;
					};
					if (type === result)
						if (
							home !== undefined &&
							Number(home) === match.home_goal &&
							Number(away) === match.away_goal
						)
							return points + 3;
						else return points + 2;
					if (type.includes(result)) return points + 1;
					if (type.length === 2) return points - 1;
					return points;
				}, 0),
				0,
			],
		)
		.sort((a, b) => b[1] - a[1]);

	for (let i = 0; i < leaderboard.length; i++) {
		const [, points] = leaderboard[i];
		const toAdd = dayPoints[leaderboard.findIndex(([, p]) => points === p)];

		if (!toAdd) break;
		leaderboard[i][2] = toAdd;
		lastIndex = i;
	}
	const last = leaderboard.at(-1)!;

	if (leaderboard.length - lastIndex > 1 && last[1] !== leaderboard.at(-2)![1])
		last[2] = -1;
	return leaderboard;
};
const createLeaderboardDescription = (leaderboard: Leaderboard) =>
	[...leaderboard]
		.sort((a, b) => b[1] - a[1])
		.map(
			([user, points]) =>
				`${leaderboard.findIndex(([, p]) => points === p) + 1}\\. <@${
					user._id
				}>: **${points}** Punt${points === 1 ? "o" : "i"} Partita`,
		)
		.join("\n");
const createFinalLeaderboard = (leaderboard: Leaderboard) =>
	[...leaderboard]
		.sort(
			(a, b) => (b[0].dayPoints ?? 0) + b[2] - ((a[0].dayPoints ?? 0) + a[2]),
		)
		.map(([user, , points], _i, array) => {
			const newPoints = (user.dayPoints ?? 0) + points;

			return `${
				array.findIndex(([u, , p]) => (u.dayPoints ?? 0) + p === newPoints) + 1
			}\\. <@${user._id}>: **${newPoints}** Punt${
				Math.abs(newPoints) === 1 ? "o" : "i"
			} Giornata`;
		})
		.join("\n");
const closeMatchDay = (
	message: Message,
	users: Document<typeof User>[],
	matches: Extract<MatchesData, { success: true }>,
	matchDay: Document<typeof MatchDay>,
	embeds: EmbedBuilder[],
) => {
	const leaderboard = resolveLeaderboard(users, matches);
	const toEdit = [];

	matchDay.finished = true;
	for (const [user, , points] of leaderboard)
		if (points) {
			user.dayPoints = (user.dayPoints ?? 0) + points;
			toEdit.push(user);
		}
	return Promise.all([
		message.edit({
			embeds: [
				embeds[0].setTitle(`Risultati Finali ${matchDay.day}° Giornata`),
				embeds[1]
					.setTitle(
						`⚽ Classifica Definitiva Pronostici ${matchDay.day}° Giornata`,
					)
					.setFields({
						name: "Classifica Generale",
						value: createFinalLeaderboard(leaderboard),
					}),
			],
		}),
		matchDay.save(),
		...toEdit.map((user) => user.save()),
	]);
};
const startWebSocket = (
	matches: Extract<MatchesData, { success: true }>,
	users: Document<typeof User>[],
	embeds: EmbedBuilder[],
	message: Message,
	matchDay: Document<typeof MatchDay>,
) => {
	let resolve: (value: PromiseLike<void> | void) => void;

	let timeout: NodeJS.Timeout | undefined;
	const ws = new WebSocket(
		"wss://www.legaseriea.it/socket.io/?EIO=4&transport=websocket",
	);

	ws.addEventListener("open", () => {
		printToStdout(`[${new Date().toISOString()}] Waiting for ping.`);
	});
	ws.addEventListener("close", (event) => {
		printToStderr(
			`[${new Date().toISOString()}] WebSocket closed with code ${
				event.code
			} and reason ${event.reason}`,
		);
	});
	ws.addEventListener("message", async (event) => {
		const type = parseInt(event.data);
		const start = type.toString().length;
		const data:
			| {
					sid: string;
					upgrades: [];
					pingInterval: number;
					pingTimeout: number;
					maxPayload: number;
			  }
			| [string, string]
			| undefined =
			(event.data as string).length === start
				? undefined
				: JSON.parse((event.data as string).slice(start));

		if (type === 0) {
			if (!data || !("pingInterval" in data)) return;
			ws.send("40");
			timeout ??= setTimeout(() => {
				if (
					ws.readyState === WebSocket.CLOSED ||
					ws.readyState === WebSocket.CLOSING
				)
					return;
				printToStderr(
					`[${new Date().toISOString()}] Didn't receive ping in time. Trying to restart the websocket...`,
				);
				ws.close(1002);
				resolve(startWebSocket(matches, users, embeds, message, matchDay));
			}, data.pingInterval + data.pingTimeout);
			printToStdout(`[${new Date().toISOString()}] Live scores ready.`);
		} else if (type === 2) {
			ws.send("3");
			timeout?.refresh();
			printToStdout(`[${new Date().toISOString()}] Ping acknowledged.`);
		} else if (type === 42) {
			if (!Array.isArray(data) || data[0] !== "callApi") return;
			const updateData: {
				ora: string;
				match_id: number;
				away_goal: number;
				home_goal: number;
				match_day_id: number;
				match_status: number;
			}[] = JSON.parse(data[1]);

			printToStdout(`[${new Date().toISOString()}] Received updated data.`);
			printToStdout(updateData);
			for (const update of updateData) {
				const found = matches.data.find(
					(match) => match.match_id === update.match_id,
				);

				if (!found) continue;
				found.away_goal = update.away_goal;
				found.home_goal = update.home_goal;
				found.match_status = update.match_status;
			}
			const leaderboard = resolveLeaderboard(users, matches);

			embeds[0].setDescription(resolveMatches(matches));
			embeds[1]
				.setDescription(createLeaderboardDescription(leaderboard))
				.setTimestamp();
			embeds[1].setFields({
				name: "Classifica Generale Provvisoria",
				value: createFinalLeaderboard(leaderboard),
			});
			message.edit({ embeds }).catch(printToStderr);
			if (matches.data.every((match) => match.match_status !== 1)) {
				const next = matches.data.find((match) => match.match_status === 0);

				if (next) {
					const delay = new Date(next.date_time).getTime() - Date.now();

					if (delay < 1_000) return;
					ws.close(1000);
					printToStdout(
						`[${new Date().toISOString()}] No match live. Waiting for the next match in ${ms(
							delay,
						)}.`,
					);
					await setPromiseTimeout(delay);
					resolve(
						startWebSocket(
							await loadMatches(matchDay._id),
							users,
							embeds,
							message,
							matchDay,
						),
					);
				} else {
					ws.close(1001);
					printToStdout(
						`[${new Date().toISOString()}] All matches ended. Marking match day as finished.`,
					);
					await closeMatchDay(message, users, matches, matchDay, embeds);
					resolve();
				}
				return;
			}
			printToStdout(`[${new Date().toISOString()}] Matches data updated.`);
		}
	});
	return new Promise<void>((res) => {
		resolve = res;
	});
};

export const liveScore = async (
	matchDay: Document<typeof MatchDay>,
	channel: GuildTextBasedChannel,
) => {
	const users = await User.find({
		$or: [
			{ predictions: { $exists: true, $type: "array", $ne: [] } },
			{ dayPoints: { $exists: true, $ne: null } },
		],
	});

	if (!users.length || !users.find((u) => u.predictions?.length)) {
		matchDay.finished = true;
		await matchDay.save();
		return;
	}
	let matches = await loadMatches(matchDay._id);
	const leaderboard = resolveLeaderboard(users, matches);
	const embeds = [
		new EmbedBuilder()
			.setThumbnail(
				"https://img.legaseriea.it/vimages/64df31f4/Logo-SerieA_TIM_RGB.jpg",
			)
			.setTitle(`🔴 Risultati Live ${matchDay.day}° Giornata`)
			.setDescription(resolveMatches(matches))
			.setAuthor({
				name: "Serie A TIM",
				url: "https://legaseriea.it/it/serie-a",
			})
			.setColor("Red"),
		new EmbedBuilder()
			.setThumbnail(
				"https://img.legaseriea.it/vimages/64df31f4/Logo-SerieA_TIM_RGB.jpg",
			)
			.setTitle(`🔴 Classifica Live Pronostici ${matchDay.day}° Giornata`)
			.setDescription(createLeaderboardDescription(leaderboard))
			.setFooter({ text: "Ultimo aggiornamento" })
			.addFields({
				name: "Classifica Generale Provvisoria",
				value: createFinalLeaderboard(leaderboard),
			})
			.setAuthor({
				name: "Serie A TIM",
				url: "https://legaseriea.it/it/serie-a",
			})
			.setColor("Blue")
			.setTimestamp(),
	];
	const message = await (matchDay.messageId == null
		? channel.send({ embeds })
		: channel.messages.fetch(matchDay.messageId));

	if (matchDay.messageId == null) {
		matchDay.messageId = message.id;
		matchDay.save().catch(printToStderr);
	} else if (
		embeds.some(
			(d, i) => d.data.description !== message.embeds[i]?.description,
		) ||
		embeds[1].data.fields?.[0].value !== message.embeds[1]?.fields[0].value
	)
		message.edit({ embeds }).catch(printToStderr);
	if (matches.data.every((match) => match.match_status !== 1)) {
		const next = matches.data.find((match) => match.match_status === 0);

		if (next) {
			const delay = new Date(next.date_time).getTime() - Date.now();

			if (delay > 1_000) {
				printToStdout(
					`[${new Date().toISOString()}] No match live. Waiting for the next match in ${ms(
						delay,
					)}.`,
				);
				await setPromiseTimeout(delay);
				matches = await loadMatches(matchDay._id);
			}
		} else {
			await closeMatchDay(message, users, matches, matchDay, embeds);
			return;
		}
	}
	await startWebSocket(matches, users, embeds, message, matchDay);
};

export default liveScore;
