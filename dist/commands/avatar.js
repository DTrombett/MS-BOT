import{a as r}from"../chunk-SIYDC5FB.js";import"../chunk-R24UT4ZV.js";import{ApplicationCommandOptionType as s,ApplicationCommandType as c,ButtonStyle as l,ComponentType as p}from"discord-api-types/v10";import{escapeMarkdown as d,GuildMember as u}from"discord.js";var b=r({data:[{name:"avatar",description:"Mostra l'avatar di un utente",type:c.ChatInput,options:[{name:"user",description:"L'utente di cui mostrare l'avatar",type:s.User}]}],async run(n){let{guild:a}=n,i=n.options.data.find(m=>m.type===s.User)??n,t=i.user??n.user,e=i.member?i.member:a?await a.members.fetch(t.id).catch(()=>t):t,o="client"in e?e.displayAvatarURL({extension:"png",size:4096}):e.avatar!=null?this.client.rest.cdn.guildMemberAvatar(a.id,t.id,e.avatar,{size:4096,extension:"png"}):t.displayAvatarURL({extension:"png",size:4096});await n.reply({content:`Avatar di **[${d(e instanceof u?e.displayName:"nick"in e&&e.nick!=null?e.nick:t.username)}](${o} )**:`,components:[{type:p.ActionRow,components:[{type:p.Button,url:o,style:l.Link,label:"Apri l'originale"}]}]})}});export{b as command};
//# sourceMappingURL=avatar.js.map