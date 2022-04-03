import type { EventOptions } from "../../util";
import { CustomClient, EventType } from "../../util";

export const event: EventOptions<EventType.Process, "unhandledRejection"> = {
	name: "unhandledRejection",
	type: EventType.Process,
	on(message) {
		void CustomClient.printToStderr(message, true);
	},
};
