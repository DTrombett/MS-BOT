import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	ComponentType,
} from "discord-api-types/v10";
import { escapeMarkdown, GuildMember } from "discord.js";
import { createCommand } from "../util";

export const command = createCommand({
	data: [
		{
			name: "avatar",
			description: "Mostra l'avatar di un utente",
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: "user",
					description: "L'utente di cui mostrare l'avatar",
					type: ApplicationCommandOptionType.User,
				},
			],
		},
		{
			name: "Avatar",
			type: ApplicationCommandType.User,
		},
	],
	async run(interaction) {
		const option = interaction.options.data.find(
			(o) => o.type === ApplicationCommandOptionType.User
		);
		const user = option?.user;

		if (!user) {
			await interaction.reply({
				content: "Utente non trovato!",
				ephemeral: true,
			});
			return;
		}
		const { guild } = interaction;
		const member = option.member
			? option.member
			: guild
			? await guild.members.fetch(user.id).catch(() => user)
			: user;
		const url =
			"client" in member
				? member.displayAvatarURL({
						extension: "png",
						size: 4096,
				  })
				: member.avatar != null
				? this.client.rest.cdn.guildMemberAvatar(
						guild!.id,
						user.id,
						member.avatar
				  )
				: user.displayAvatarURL({
						extension: "png",
						size: 4096,
				  });

		await interaction.reply({
			content: `Avatar di **[${escapeMarkdown(
				member instanceof GuildMember
					? member.displayName
					: "nick" in member && member.nick != null
					? member.nick
					: user.username
			)}](${url})**:`,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							url,
							style: ButtonStyle.Link,
							label: "Apri l'originale",
						},
					],
				},
			],
		});
	},
});
