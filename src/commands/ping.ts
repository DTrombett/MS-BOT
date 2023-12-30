import { DiscordSnowflake } from "@sapphire/snowflake";
import {
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponseCallbackData,
	APIMessageComponentInteraction,
	ApplicationCommandType,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
} from "discord-api-types/v10";
import { createCommand } from "../util";

const pong = (
	interaction:
		| APIChatInputApplicationCommandInteraction
		| APIMessageComponentInteraction,
): APIInteractionResponseCallbackData => ({
	content: `Ritardo totale: **${
		Date.now() - Number(DiscordSnowflake.deconstruct(interaction.id).timestamp)
	}ms**`,
	components: [
		{
			type: ComponentType.ActionRow,
			components: [
				{
					type: ComponentType.Button,
					custom_id: "ping",
					label: "Pong!",
					style: ButtonStyle.Success,
					emoji: { name: "🏓" },
				},
			],
		},
	],
});

export const ping = createCommand({
	data: [
		{
			name: "ping",
			description: "Pong!",
			type: ApplicationCommandType.ChatInput,
		},
	],
	run(interaction, { reply }) {
		reply({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: pong(interaction),
		});
	},
	component(interaction, { reply }) {
		reply({
			type: InteractionResponseType.UpdateMessage,
			data: pong(interaction),
		});
	},
});
