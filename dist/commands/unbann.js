import"../chunk-IFQFNU44.js";import{B as t}from"../chunk-XV3K5JED.js";import"../chunk-B7NPBJ6H.js";import{SlashCommandBuilder as n}from"@discordjs/builders";var r={data:new n().setName("unbann").setDescription("Revoca il bann di un utente").addUserOption(e=>e.setName("utente").setDescription("L'utente bannato").setRequired(!0)).addStringOption(e=>e.setName("motivo").setDescription("Il motivo per cui revocare il bann")),isPublic:!0,async run(e){if(!e.inCachedGuild()){await e.reply({content:"Questo comando \xE8 disponibile solo all'interno dei server!",ephemeral:!0});return}let[o]=await Promise.all([t(this.client,e.options.getUser("utente",!0).id,e.guildId,e.user.id,e.options.getString("motivo",!0)),e.deferReply()]);await e.editReply(o)}};export{r as command};
//# sourceMappingURL=unbann.js.map