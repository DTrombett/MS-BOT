import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../util";
import { icon } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("icon")
		.setDescription("Mostra l'icona del server"),
	isPublic: true,
	async run(interaction) {
		if (!interaction.inCachedGuild()) {
			await interaction.reply({
				content: "Questo comando è disponibile solo all'interno dei server!",
				ephemeral: true,
			});
			return;
		}
		const options = await icon(this.client, interaction.guildId);

		await interaction.reply(options);
	},
};
