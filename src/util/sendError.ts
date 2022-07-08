import type { ReceivedInteraction } from ".";

export const sendError = (interaction: ReceivedInteraction, error: Error) =>
	interaction[interaction.deferred ? "editReply" : "reply"]({
		content: `Couldn't unban user: \`${error.message.slice(0, 1000)}\``,
		ephemeral: true,
	});

export default sendError;
