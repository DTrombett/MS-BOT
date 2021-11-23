import {
	bold,
	codeBlock,
	Embed,
	inlineCode,
	SlashCommandBuilder,
	time,
	TimestampStyles,
} from "@discordjs/builders";
import { exec as nativeExec, spawn } from "child_process";
import { Constants, Util } from "discord.js";
import { promisify } from "util";
import type { CommandOptions } from "../util";
import { commands, events, parseEval } from "../util";

const enum SubCommands {
	shell = "shell",
	evalCmd = "eval",
	test = "test",
	ram = "ram",
	reload = "reload",
	restart = "restart",
	shutdown = "shutdown",
	uptime = "uptime",
}
const enum SubCommandOptions {
	cmd = "cmd",
	ephemeral = "ephemeral",
	reloadCommands = "commands",
	reloadEvents = "events",
	process = "process",
}

const exec = promisify(nativeExec);

export const command: CommandOptions = {
	reserved: true,
	data: new SlashCommandBuilder()
		.setName("dev")
		.setDescription("Comandi privati disponibili solo ai sviluppatori")
		.addSubcommand((shell) =>
			shell
				.setName(SubCommands.shell)
				.setDescription("Esegue un comando nel terminal")
				.addStringOption((cmd) =>
					cmd
						.setName(SubCommandOptions.cmd)
						.setDescription("Comando da eseguire")
						.setRequired(true)
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
						.setRequired(false)
				)
		)
		.addSubcommand((evalCmd) =>
			evalCmd
				.setName(SubCommands.evalCmd)
				.setDescription("Esegue del codice")
				.addStringOption((cmd) =>
					cmd
						.setName(SubCommandOptions.cmd)
						.setDescription("Codice da eseguire")
						.setRequired(true)
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
						.setRequired(false)
				)
		)
		.addSubcommand((test) =>
			test.setName(SubCommands.test).setDescription("Un comando di test")
		)
		.addSubcommand((ram) =>
			ram
				.setName(SubCommands.ram)
				.setDescription("Mostra la RAM utilizzata")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
						.setRequired(false)
				)
		)
		.addSubcommand((reload) =>
			reload
				.setName(SubCommands.reload)
				.setDescription("Ricarica i comandi e/o gli eventi del bot")
				.addBooleanOption((reloadCommands) =>
					reloadCommands
						.setName(SubCommandOptions.reloadCommands)
						.setDescription("Se ricaricare i comandi (default: true)")
				)
				.addBooleanOption((reloadEvents) =>
					reloadEvents
						.setName(SubCommandOptions.reloadEvents)
						.setDescription("Se ricaricare gli eventi (default: true)")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
						.setRequired(false)
				)
		)
		.addSubcommand((restart) =>
			restart
				.setName(SubCommands.restart)
				.setDescription("Riavvia il bot")
				.addBooleanOption((process) =>
					process
						.setName(SubCommandOptions.process)
						.setDescription("Se riavviare il processo (default: true)")
				)
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
						.setRequired(false)
				)
		)
		.addSubcommand((shutdown) =>
			shutdown
				.setName(SubCommands.shutdown)
				.setDescription("Spegni il bot")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
						.setRequired(false)
				)
		)
		.addSubcommand((uptime) =>
			uptime
				.setName(SubCommands.uptime)
				.setDescription("Mostra l'uptime del bot")
				.addBooleanOption((ephemeral) =>
					ephemeral
						.setName(SubCommandOptions.ephemeral)
						.setDescription(
							"Scegli se mostrare il risultato privatamente (default: true)"
						)
						.setRequired(false)
				)
		),
	async run(interaction) {
		await interaction.deferReply({
			ephemeral:
				interaction.options.getBoolean(SubCommandOptions.ephemeral) ?? true,
		});

		const now = Date.now();
		switch (interaction.options.getSubcommand()) {
			case SubCommands.shell:
				const cmd = interaction.options.getString(SubCommandOptions.cmd, true);
				const [stdout, stderr] = await exec(cmd)
					.catch((e: Awaited<ReturnType<typeof exec>>) => e)
					.then((e) => [
						e.stdout.toString().trim(),
						e.stderr.toString().trim(),
					]);
				const embeds: Embed[] = [];

				if (stdout) {
					console.log(stdout);
					embeds.push(
						new Embed()
							.setAuthor({
								name: interaction.user.tag,
								iconURL: interaction.user.displayAvatarURL(),
							})
							.setTitle("Stdout")
							.setDescription(
								codeBlock(Util.escapeCodeBlock(stdout.slice(0, 4096 - 7)))
							)
							.setColor(Constants.Colors.GREEN)
							.setTimestamp()
					);
				}
				if (stderr) {
					console.error(stderr);
					embeds.push(
						new Embed()
							.setAuthor({
								name: interaction.user.tag,
								iconURL: interaction.user.displayAvatarURL(),
							})
							.setTitle("Stderr")
							.setDescription(
								codeBlock(Util.escapeCodeBlock(stderr.slice(0, 4096 - 7)))
							)
							.setColor(Constants.Colors.RED)
							.setTimestamp()
					);
				}

				await interaction.editReply({
					content: `Comando eseguito in ${Date.now() - now}ms\n${inlineCode(
						`${process.cwd()}> ${Util.escapeInlineCode(
							cmd.slice(0, 2000 - 100)
						)}`
					)}`,
					embeds: embeds.map((e) => e.toJSON()),
				});
				break;
			case SubCommands.evalCmd:
				const code = interaction.options.getString(SubCommandOptions.cmd, true);
				const parsed = await parseEval(code, this);
				const evalEmbed = new Embed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle("Eval")
					.setDescription(
						codeBlock(
							"js",
							Util.escapeCodeBlock(parsed || '""').slice(0, 4096 - 9)
						)
					)
					.addField({
						name: "Code",
						value: codeBlock(
							"js",
							Util.escapeCodeBlock(code).slice(0, 2048 - 9)
						),
					})
					.setColor(Constants.Colors.BLURPLE)
					.setTimestamp();

				await interaction.editReply({
					content: `Eval elaborato in ${Date.now() - now}ms`,
					embeds: [evalEmbed.toJSON()],
				});
				break;
			case SubCommands.ram:
				const mem = process.memoryUsage();
				const ramEmbed = new Embed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle("RAM")
					.setDescription(
						`${bold("Resident Set Size")}: ${
							Math.round((mem.rss / 1024 / 1024) * 100) / 100
						} MB\n${bold("Heap Total")}: ${
							Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
						} MB\n${bold("Heap Used")}: ${
							Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100
						} MB\n${bold("External")}: ${
							Math.round((mem.external / 1024 / 1024) * 100) / 100
						} MB`
					)
					.setColor(Constants.Colors.BLURPLE)
					.setTimestamp();

				await interaction.editReply({
					content: `Memoria calcolata in ${Date.now() - now}`,
					embeds: [ramEmbed.toJSON()],
				});
				break;
			case SubCommands.reload:
				await exec("npm run build");

				if (
					interaction.options.getBoolean(SubCommandOptions.reloadCommands) ??
					true
				)
					await Promise.all(commands.map((c) => c.reload()));
				if (
					interaction.options.getBoolean(SubCommandOptions.reloadEvents) ??
					true
				)
					await Promise.all(events.map((e) => e.reload()));

				await interaction.editReply({
					content: `Ricaricato in ${Date.now() - now}ms`,
				});
				break;
			case SubCommands.restart:
				if (interaction.options.getBoolean(SubCommandOptions.process) ?? true) {
					const argvs = process.argv
						.map((arg) => inlineCode(Util.escapeInlineCode(arg)))
						.join("\n");

					await interaction.editReply({
						content: `Sto facendo ripartire il programma con i seguenti argv:\n${argvs}`,
					});
					process.once("exit", () => {
						spawn(process.argv[0], process.argv.slice(1), {
							cwd: process.cwd(),
							detached: true,
							stdio: "inherit",
						}).unref();
					});
					this.client.destroy();
					process.exit(0);
				} else {
					this.client.destroy();
					this.client.token = process.env.DISCORD_TOKEN!;
					await this.client.login();
					await interaction.editReply({
						content: `Ricollegato in ${Date.now() - now}ms.`,
					});
				}
				break;
			case SubCommands.shutdown:
				await interaction.editReply({
					content: `Sto spegnendo il bot...`,
				});
				this.client.destroy();
				return process.exit(0);
			case SubCommands.uptime:
				const processUptime = new Date(Date.now() - process.uptime() * 1000);
				const botUptime = new Date(Date.now() - this.client.uptime!);
				const uptimeEmbed = new Embed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle("Uptime")
					.setDescription(
						`${bold("Processo")}: ${time(
							processUptime,
							TimestampStyles.RelativeTime
						)} (${time(processUptime)})\n${bold("Bot")}: ${time(
							botUptime,
							TimestampStyles.RelativeTime
						)} (${time(botUptime)})`
					)
					.setColor(Constants.Colors.BLURPLE)
					.setTimestamp();

				await interaction.editReply({
					content: `Process uptime calcolato in ${Date.now() - now}ms`,
					embeds: [uptimeEmbed.toJSON()],
				});
				break;

			case SubCommands.test:
				await interaction.editReply({
					content: "Nothing to see here.",
				});
				break;
			default:
				await interaction.editReply("Comando non riconosciuto");
		}

		return undefined;
	},
};
