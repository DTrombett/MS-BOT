import"../chunk-4KDV7KKW.js";import{u as r}from"../chunk-OT6DYTTJ.js";import"../chunk-B7NPBJ6H.js";import{SlashCommandBuilder as o}from"@discordjs/builders";var n={data:new o().setName("love").setDescription("Calcola l'amore tra due utenti!").addUserOption(e=>e.setName("user1").setDescription("Il primo utente").setRequired(!0)).addUserOption(e=>e.setName("user2").setDescription("Il secondo utente (default: tu)")),isPublic:!0,async run(e){let t=e.options.getUser("user1",!0),s=e.options.getUser("user2")??e.user;await e.reply(await r(this.client,t.id,s.id,t.discriminator,s.discriminator))}};export{n as command};
//# sourceMappingURL=love.js.map