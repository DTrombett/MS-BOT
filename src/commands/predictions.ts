import {
	ActionRowBuilder,
	ButtonBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
} from "@discordjs/builders";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	InteractionResponseType,
	MessageFlags,
	TextInputStyle,
} from "discord-api-types/v10";
import { Command, Prediction, loadMatches, type MatchData } from "../util";

const predictionExamples = [
	"1",
	"X",
	"2",
	"1X",
	"12",
	"X2",
	"1 (1-0)",
	"1 (2-1)",
	"2 (0-1)",
	"2 (1-2)",
	"X (0-0)",
	"X (1-1)",
];
const predictionRegex =
	/^(1|x|2|1x|12|x2|((?<prediction>1|2|x)\s*\(\s*(?<first>\d+)\s*-\s*(?<second>\d+)\s*\)))$/;
const buildModal = (
	matches: MatchData[],
	{
		part = 0,
		predictions,
		locale = "",
	}: Partial<{
		part: number;
		predictions: Pick<Prediction, "matchId" | "prediction">[];
		locale: string;
	}> = {},
) => {
	const { matchday, round } = matches[0]!;
	const firstRound = round.metaData.type === "GROUP_STANDINGS";

	return new ModalBuilder()
		.setCustomId(`predictions-${matchday.id}-${part}`)
		.setTitle(
			`Pronostici ${firstRound ? matchday.translations.longName[locale] ?? matchday.longName : round.translations.name[locale] ?? round.metaData.name} (${part + 1}/${Math.ceil(matches.length / 5)})`,
		)
		.addComponents(
			matches.slice(part * 5, (part + 1) * 5).map((match) => {
				const textInput = new TextInputBuilder()
					.setCustomId(match.id)
					.setLabel(
						`${
							match.homeTeam.translations.displayName[locale] ??
							match.homeTeam.internationalName
						} - ${
							match.awayTeam.translations.displayName[locale] ??
							match.awayTeam.internationalName
						}`,
					)
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
					.setPlaceholder(
						`es. ${predictionExamples[Math.floor(Math.random() * predictionExamples.length)]}`,
					);
				const found = predictions?.find(
					(prediction) => prediction.matchId === match.id,
				);

				if (found) textInput.setValue(found.prediction);
				return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					textInput,
				);
			}),
		);
};

export const predictions = new Command({
	data: [
		{
			name: "predictions",
			description:
				"Invia e modifica i tuoi pronostici calcistici per divertirti con i risultati sportivi",
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: "send",
					description: "Invia i tuoi pronostici per la prossima giornata",
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: "edit",
					description: "Modifica i tuoi pronostici per la prossima giornata",
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: "view",
					description:
						"Visualizza i tuoi pronostici o quelli di un altro utente",
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: "reminder",
					description:
						"Imposta un promemoria per ricordarti di inserire i pronostici",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "before",
							required: true,
							description:
								"Quanto tempo prima dell'inizio della giornata inviare il promemoria. Imposta 0 per eliminarlo",
						},
					],
				},
			],
		},
	],
	async run() {
		// const subCommand = interaction.data.options!.find(
		// 	(o): o is APIApplicationCommandInteractionDataSubcommandOption =>
		// 		o.type === ApplicationCommandOptionType.Subcommand,
		// )!;
		// if (subCommand.name === "reminder") {
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: { content: "Questo comando non è ancora disponibile :(" },
		// 	});
		// 	return;
		// }
		// const options: Record<string, boolean | number | string> = {};
		// if (subCommand.options)
		// 	for (const option of subCommand.options)
		// 		options[option.name] = option.value;
		// const [matchDay, matches, existingPredictions] = await getMatchDayData(
		// 	env,
		// 	(interaction.member ?? interaction).user!.id,
		// );
		// if (!(matchDay as MatchDay | null)) {
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: {
		// 			flags: MessageFlags.Ephemeral,
		// 			content: "Non c'è nessuna giornata disponibile al momento!",
		// 		},
		// 	});
		// 	return;
		// }
		// const startTime = new Date(matchDay.startDate).getTime() - 1_000 * 60 * 15;
		// if (subCommand.name === "view") {
		// 	const user = (interaction.member ?? interaction).user!;
		// 	if (!existingPredictions.length) {
		// 		reply({
		// 			type: InteractionResponseType.ChannelMessageWithSource,
		// 			data: {
		// 				content: "Non hai inviato alcun pronostico per la giornata!",
		// 				flags: MessageFlags.Ephemeral,
		// 			},
		// 		});
		// 		return;
		// 	}
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: {
		// 			embeds: [
		// 				{
		// 					author: {
		// 						name: user.global_name ?? user.username,
		// 						icon_url:
		// 							user.avatar == null
		// 								? rest.cdn.defaultAvatar(
		// 										user.discriminator === "0"
		// 											? Number(BigInt(user.id) >> 22n) % 6
		// 											: Number(user.discriminator) % 5,
		// 									)
		// 								: rest.cdn.avatar(user.id, user.avatar, {
		// 										size: 4096,
		// 										extension: "png",
		// 									}),
		// 					},
		// 					color: 0x3498db,
		// 					fields: matches.map((m) => ({
		// 						name: `${[m.home_team_name, m.away_team_name]
		// 							.map(normalizeTeamName)
		// 							.join(" - ")} (<t:${Math.round(
		// 							new Date(m.date_time).getTime() / 1_000,
		// 						)}:F>)`,
		// 						value:
		// 							existingPredictions.find(
		// 								(predict) => predict.matchId === m.match_id,
		// 							)?.prediction ?? "*Non presente*",
		// 					})),
		// 					thumbnail: {
		// 						url: "https://img.legaseriea.it/vimages/64df31f4/Logo-SerieA_TIM_RGB.jpg",
		// 					},
		// 					title: `${matchDay.day}ª Giornata Serie A TIM`,
		// 					url: "https://legaseriea.it/it/serie-a",
		// 				},
		// 			],
		// 			flags: MessageFlags.Ephemeral,
		// 		},
		// 	});
		// 	return;
		// }
		// if (Date.now() >= startTime) {
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: {
		// 			content:
		// 				"Puoi inviare i pronostici solo fino a 15 minuti dall'inizio del primo match della giornata!",
		// 			flags: MessageFlags.Ephemeral,
		// 		},
		// 	});
		// 	return;
		// }
		// if (
		// 	subCommand.name === "send" &&
		// 	existingPredictions.length === matches.length
		// ) {
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: {
		// 			content:
		// 				"Hai già inviato i pronostici per questa giornata! Clicca il pulsante se vuoi modificarli.",
		// 			components: [
		// 				new ActionRowBuilder<ButtonBuilder>()
		// 					.addComponents(
		// 						new ButtonBuilder()
		// 							.setCustomId(`predictions-${matchDay.day}-1-${startTime}`)
		// 							.setEmoji({ name: "✏️" })
		// 							.setLabel("Modifica")
		// 							.setStyle(ButtonStyle.Success),
		// 					)
		// 					.toJSON(),
		// 			],
		// 			flags: MessageFlags.Ephemeral,
		// 		},
		// 	});
		// 	return;
		// }
		// reply({
		// 	type: InteractionResponseType.Modal,
		// 	data: buildModal(matches, matchDay, 1, existingPredictions).toJSON(),
		// });
	},
	async modalSubmit(interaction, { reply, env }) {
		const [, matchDayId, partString] = interaction.data.custom_id.split("-");
		const part = Number(partString) || 0;
		const matches = await loadMatches(matchDayId);

		if (matches.length <= part * 5) {
			reply({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: "Non è presente nessuna partita disponibile!",
					flags: MessageFlags.Ephemeral,
				},
			});
			return;
		}
		if (
			matches.some(
				(m) =>
					m.awayTeam.teamTypeDetail === "FAKE" ||
					m.homeTeam.teamTypeDetail === "FAKE",
			)
		)
			if (
				Date.now() >=
				Date.parse(matches[0]!.kickOffTime.dateTime) - 15 * 60 * 1000
			) {
				reply({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content:
							"Puoi inviare o modificare i pronostici solo fino a 15 minuti dall'inizio del primo match della giornata!",
						flags: MessageFlags.Ephemeral,
					},
				});
				return;
			}
		const userId = (interaction.member ?? interaction).user!.id;
		const total = Math.ceil(matches.length / 5);
		const invalid: string[] = [];
		const resolved: Record<string, string | undefined> = {};
		const newPredictions: Prediction[] = [];
		const locale = interaction.locale.split("-")[0]!.toUpperCase();
		const { results: existingPredictions } = await env.DB.prepare(
			`SELECT Predictions.matchId,
									Predictions.prediction
								FROM Predictions
									JOIN Users ON Predictions.userId = Users.id
								WHERE Users.id = ?
									AND Predictions.matchId IN (${Array(matches.length).fill("?").join(", ")})`,
		)
			.bind(
				(interaction.member ?? interaction).user?.id,
				...matches.map((m) => m.id),
			)
			.all<Pick<Prediction, "matchId" | "prediction">>();

		for (const {
			components: [field],
		} of interaction.data.components) {
			const value = field!.value.trim();
			const match = value.toLowerCase().match(predictionRegex);

			if (
				!match?.groups ||
				(match[0].startsWith("x") &&
					match.groups.first !== match.groups.second) ||
				(match[0].startsWith("1") &&
					match.groups.first &&
					match.groups.first <= match.groups.second!) ||
				(match[0].startsWith("2") &&
					match.groups.first &&
					match.groups.first >= match.groups.second!) ||
				(match.groups.first && Number(match.groups.first) > 999) ||
				(match.groups.second && Number(match.groups.second) > 999)
			) {
				const found = matches.find((m) => m.id === field!.custom_id)!;

				invalid.push(
					`${
						found.homeTeam.translations.displayName[locale] ??
						found.homeTeam.internationalName
					} - ${
						found.awayTeam.translations.displayName[locale] ??
						found.awayTeam.internationalName
					}`,
				);
			} else if (
				existingPredictions.find((p) => p.matchId === field?.custom_id)
					?.prediction !==
				(resolved[field!.value] ??= match.groups.prediction
					? `${match.groups.prediction.toUpperCase()} (${
							match.groups.first
						} - ${match.groups.second})`
					: value.toUpperCase())
			)
				newPredictions.push({
					matchId: field!.custom_id,
					userId,
					prediction: resolved[field!.value]!,
				});
		}
		if (newPredictions.length) {
			const predictionsQuery = env.DB.prepare(
				`INSERT OR REPLACE INTO Predictions (matchId, userId, prediction) VALUES ${"\n(?, ?, ?),".repeat(
					newPredictions.length,
				)}`.slice(0, -1),
			).bind(
				...newPredictions.flatMap((m) => [m.matchId, userId, m.prediction]),
			);

			if (existingPredictions.length) await predictionsQuery.run();
			else
				await env.DB.batch([
					env.DB.prepare(
						`INSERT
											OR IGNORE INTO Users(id)
										VALUES (?)`,
					).bind(userId),
					predictionsQuery,
				]);
		}
		if (invalid.length) {
			reply({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: `I pronostici inviati nei seguenti risultati non sono validi: ${invalid
						.map((text) => `**${text}**`)
						.join(", ")}`,
					components: [
						new ActionRowBuilder<ButtonBuilder>()
							.addComponents(
								new ButtonBuilder()
									.setCustomId(`predictions-${matchDayId}-e-${part}`)
									.setEmoji({ name: "✏️" })
									.setLabel("Modifica")
									.setStyle(ButtonStyle.Danger),
							)
							.toJSON(),
					],
					flags: MessageFlags.Ephemeral,
				},
			});
			return;
		}
		if (part + 1 === total)
			reply({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: "Pronostici inviati correttamente!",
					components: [
						new ActionRowBuilder<ButtonBuilder>()
							.addComponents(
								new ButtonBuilder()
									.setCustomId(`predictions-${matchDayId}-e`)
									.setEmoji({ name: "✏️" })
									.setLabel("Modifica")
									.setStyle(ButtonStyle.Success),
							)
							.toJSON(),
					],
					flags: MessageFlags.Ephemeral,
				},
			});
		else
			reply({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: `Parte **${part + 1} di ${total}** inviata correttamente! Clicca il pulsante per continuare...`,
					components: [
						new ActionRowBuilder<ButtonBuilder>()
							.addComponents(
								new ButtonBuilder()
									.setCustomId(`predictions-${matchDayId}-e-${part + 1}`)
									.setEmoji({ name: "⏩" })
									.setLabel("Continua")
									.setStyle(ButtonStyle.Primary),
							)
							.toJSON(),
					],
					flags: MessageFlags.Ephemeral,
				},
			});
	},
	async component(interaction, { reply, env }) {
		const [, matchDayId, action, partString] =
			interaction.data.custom_id.split("-");
		const part = Number(partString) || 0;

		if (action === "e") {
			const matches = await loadMatches(matchDayId);

			if (matches.length <= part * 5) {
				reply({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: "Non è presente nessuna partita disponibile!",
						flags: MessageFlags.Ephemeral,
					},
				});
				return;
			}
			if (
				matches.some(
					(m) =>
						m.awayTeam.teamTypeDetail === "FAKE" ||
						m.homeTeam.teamTypeDetail === "FAKE",
				)
			)
				if (
					Date.now() >=
					Date.parse(matches[0]!.kickOffTime.dateTime) - 15 * 60 * 1000
				) {
					reply({
						type: InteractionResponseType.ChannelMessageWithSource,
						data: {
							content:
								"Puoi inviare o modificare i pronostici solo fino a 15 minuti dall'inizio del primo match della giornata!",
							flags: MessageFlags.Ephemeral,
						},
					});
					return;
				}
			const { results: existingPredictions } = await env.DB.prepare(
				`SELECT Predictions.matchId,
									Predictions.prediction
								FROM Predictions
									JOIN Users ON Predictions.userId = Users.id
								WHERE Users.id = ?
									AND Predictions.matchId IN (${Array(matches.length).fill("?").join(", ")})`,
			)
				.bind(
					(interaction.member ?? interaction).user?.id,
					...matches.map((m) => m.id),
				)
				.all<Pick<Prediction, "matchId" | "prediction">>();

			reply({
				type: InteractionResponseType.Modal,
				data: buildModal(matches, {
					locale: interaction.locale.split("-")[0]!.toUpperCase(),
					part,
					predictions: existingPredictions,
				}).toJSON(),
			});
			return;
		}
		// const time = parseInt(timestamp!);

		// if (actionOrDay === "start") {
		// 	if (Date.now() < time) {
		// 		reply({
		// 			type: InteractionResponseType.ChannelMessageWithSource,
		// 			data: {
		// 				content: `La giornata inizia <t:${Math.round(time / 1_000)}:R>!`,
		// 				flags: MessageFlags.Ephemeral,
		// 			},
		// 		});
		// 		return;
		// 	}
		// 	reply({
		// 		type: InteractionResponseType.UpdateMessage,
		// 		data: {
		// 			content: `## ${day}ª Giornata iniziata!\n\nSegui i risultati live e controlla i pronostici degli altri utenti qui in basso.`,
		// 			components: [],
		// 		},
		// 	});
		// 	await startPredictions(
		// 		env,
		// 		interaction,
		// 		parseInt(day!),
		// 		parseInt(partOrCategoryId!),
		// 	);
		// 	return;
		// }
		// if (actionOrDay === "update") {
		// 	if (Date.now() < time) {
		// 		reply({
		// 			type: InteractionResponseType.ChannelMessageWithSource,
		// 			data: {
		// 				content: `Puoi aggiornare nuovamente i dati <t:${Math.round(
		// 					time / 1_000,
		// 				)}:R>`,
		// 				flags: MessageFlags.Ephemeral,
		// 			},
		// 		});
		// 		return;
		// 	}
		// 	const [users, matches] = await getPredictionsData(
		// 		env,
		// 		parseInt(partOrCategoryId!),
		// 	);
		// 	const finished = matches.every((match) => match.match_status === 2);
		// 	const leaderboard = resolveLeaderboard(users, matches);
		// 	const minute = Date.now() + 1_000 * 60;

		// 	reply({
		// 		type: InteractionResponseType.UpdateMessage,
		// 		data: {
		// 			embeds: getLiveEmbed(
		// 				users,
		// 				matches,
		// 				leaderboard,
		// 				parseInt(day!),
		// 				finished,
		// 			),
		// 			components: finished
		// 				? []
		// 				: [
		// 						new ActionRowBuilder<ButtonBuilder>()
		// 							.addComponents(
		// 								new ButtonBuilder()
		// 									.setCustomId(
		// 										`predictions-update-${partOrCategoryId}-${
		// 											matches.some((match) => match.match_status === 1)
		// 												? minute
		// 												: Math.max(
		// 														Date.parse(
		// 															matches.find(
		// 																(match) => match.match_status === 0,
		// 															)?.date_time ?? "",
		// 														) || minute,
		// 														minute,
		// 													)
		// 										}-${day}`,
		// 									)
		// 									.setEmoji({ name: "🔄" })
		// 									.setLabel("Aggiorna")
		// 									.setStyle(ButtonStyle.Primary),
		// 							)
		// 							.toJSON(),
		// 					],
		// 		},
		// 	});
		// 	if (finished)
		// 		await closeMatchDay(env, leaderboard, matches, parseInt(day!));
		// 	return;
		// }
		// if (Date.now() >= time) {
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: {
		// 			content:
		// 				"Puoi inviare i pronostici solo fino a 15 minuti dall'inizio del primo match della giornata!",
		// 			flags: MessageFlags.Ephemeral,
		// 		},
		// 	});
		// 	return;
		// }
		// const [matchDay, matches, existingPredictions] = await getMatchDayData(
		// 	env,
		// 	(interaction.member ?? interaction).user!.id,
		// );

		// if (!(matchDay as MatchDay | null)) {
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: {
		// 			flags: MessageFlags.Ephemeral,
		// 			content: "Non c'è nessuna giornata disponibile al momento!",
		// 		},
		// 	});
		// 	return;
		// }
		// if (parseInt(actionOrDay!) !== matchDay.day) {
		// 	reply({
		// 		type: InteractionResponseType.ChannelMessageWithSource,
		// 		data: {
		// 			content: "Questi pronostici sono scaduti!",
		// 			flags: MessageFlags.Ephemeral,
		// 		},
		// 	});
		// 	return;
		// }
		// reply({
		// 	type: InteractionResponseType.Modal,
		// 	data: buildModal(
		// 		matches,
		// 		matchDay,
		// 		parseInt(partOrCategoryId!),
		// 		existingPredictions,
		// 	).toJSON(),
		// });
	},
});
