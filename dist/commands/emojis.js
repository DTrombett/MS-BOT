import{a as $,c as h,e as y}from"../chunk-SIYDC5FB.js";import{d as w}from"../chunk-R24UT4ZV.js";import{ApplicationCommandOptionType as u,ApplicationCommandType as L,ButtonStyle as f,ComponentType as c,GuildPremiumTier as v}from"discord-api-types/v10";import{escapeMarkdown as b}from"discord.js";var C={[v.None]:50,[v.Tier1]:100,[v.Tier2]:150,[v.Tier3]:250},j=async(e,i)=>e.user.id!==i&&!e.memberPermissions.has("ManageEmojisAndStickers")?(await e.reply({content:"Hai bisogno del permesso **Gestire emoji e adesivi**",ephemeral:!0}),!0):!1,S=async(e,i,s,n)=>{if(!s){await e.reply({content:"Emoji non valida!",ephemeral:!0});return}if(e.appPermissions?.has("ManageEmojisAndStickers")!==!0){await e.reply({content:"Ho bisogno del permesso **Gestire emoji e adesivi**!",ephemeral:!0});return}let t=await i.emojis.delete(s,n||void 0).catch(h);if(t instanceof Error){await y(e,t);return}await e.reply({content:"Emoji rimossa con successo!"})},A=async(e,i,s)=>{if(!i){await e.reply({content:"Non hai specificato un'emoji valida!",ephemeral:!0});return}let n=Math.round(i.createdTimestamp/1e3),{roles:t}=i;await e.reply({content:`${i.toString()} [${i.name??"emoji"}](${i.url}) (${i.id})

Animata: **${i.animated??!1?"S\xEC":"No"}**
Creata <t:${n}:F> (<t:${n}:R>)
Gestita da un integrazione: **${i.managed===!0?"S\xEC":"No"}**${i.author?`
Autore: <@${i.author.id}> (**${b(i.author.tag)}**)`:""}${t.cache.size>0?`
Ruoli consentiti: ${t.cache.map(o=>`<@&${o.id}>`).join(", ")}`:""}`,ephemeral:s,components:[{type:c.ActionRow,components:[{type:c.Button,custom_id:`emoji-${i.id}-i`,style:f.Primary,label:"Info"},{type:c.Button,custom_id:`emoji-${i.id}-r`,style:f.Danger,label:"Rimuovi"}]}]})},T=$({data:[{type:L.ChatInput,name:"emoji",description:"Gestisci le emoji del server",options:[{type:u.Subcommand,name:"add",description:"Aggiungi un emoji",options:[{type:u.Attachment,name:"emoji",description:"L'emoji da aggiungere",required:!0},{type:u.String,name:"name",description:"Il nome dell'emoji"},{type:u.String,name:"roles",description:"Lista di ruoli che possono usare l'emoji",autocomplete:!0},{type:u.String,name:"reason",description:"La motivazione per l'aggiunta, se presente"}]},{type:u.Subcommand,name:"remove",description:"Rimuovi un emoji",options:[{type:u.String,name:"emoji",description:"L'emoji da rimuovere",required:!0,autocomplete:!0},{type:u.String,name:"reason",description:"La motivazione per la rimozione, se presente"}]},{type:u.Subcommand,name:"edit",description:"Modifica un emoji",options:[{type:u.String,name:"emoji",description:"L'emoji da modificare",required:!0,autocomplete:!0},{type:u.String,name:"name",description:"Il nuovo nome dell'emoji"},{type:u.String,name:"roles",description:"Lista di ruoli che possono usare l'emoji",autocomplete:!0},{type:u.String,name:"reason",description:"La motivazione per la modifica, se presente"}]},{type:u.Subcommand,name:"info",description:"Mostra le informazioni di un emoji",options:[{type:u.String,name:"emoji",description:"L'emoji da cercare",required:!0,autocomplete:!0}]}]}],async run(e){if(!e.inCachedGuild()){await e.reply({content:"Questo comando pu\xF2 essere usato solo all'interno di un server!",ephemeral:!0});return}let[{options:i,name:s}]=e.options.data;if(!i){await e.reply({content:"Questo comando non \xE8 attualmente disponibile!",ephemeral:!0});return}let{guild:n}=e;if(s==="add"){if(await j(e,n.ownerId))return;let t,o,d,m;for(let a of i)a.name==="emoji"?t=a.attachment:a.name==="name"?o=typeof a.value=="string"?a.value:void 0:a.name==="roles"?m=(typeof a.value=="string"?a.value:void 0)?.split(/\s*,\s*/).map(l=>(l=l.toLowerCase(),/^\d{17,20}$/.test(l)?l:/^<@&\d{17,20}>$/.test(l)?l.slice(3,-1):n.roles.cache.find(p=>p.name.toLowerCase().startsWith(l))?.id)).filter(l=>l!==void 0):a.name==="reason"&&(d=typeof a.value=="string"?a.value:void 0);if(!t||!["image/png","image/jpeg","image/jpg","image/gif"].includes(t.contentType)){await e.reply({content:"Emoji non valida!",ephemeral:!0});return}if(o||=t.name?.split(".")[0],!o){await e.reply({content:"Non hai specificato un nome per l'emoji e l'immagine non ha un nome valido!",ephemeral:!0});return}if(o.length<2||o.length>32){await e.reply({content:"Il nome dell'emoji deve essere compreso tra 2 e 32 caratteri!",ephemeral:!0});return}if(!/^[a-zA-Z0-9-_]+$/.test(o)){await e.reply({content:"Il nome dell'emoji contiene caratteri non validi!",ephemeral:!0});return}if(t.size>=256*1024){await e.reply({content:"L'emoji deve essere pi\xF9 piccola di 256kb!",ephemeral:!0});return}if(n.emojis.cache.size>=C[n.premiumTier]){await e.reply({content:`Hai raggiunto il limite di emoji per questo server! (${C[n.premiumTier]})!`,ephemeral:!0});return}if(e.appPermissions?.has("ManageEmojisAndStickers")!==!0){await e.reply({content:"Ho bisogno del permesso **Gestire emoji e adesivi**!",ephemeral:!0});return}let[r]=await Promise.all([n.emojis.create({attachment:t.url,name:o,reason:d||void 0,roles:m}).catch(h),e.deferReply().catch(w.printToStderr)]);if(r instanceof Error){await y(e,r);return}let g=Math.round(r.createdTimestamp/1e3);await e.editReply({content:`${r.toString()} Emoji [${r.name}](${r.url}) (${r.id}) aggiunta con successo!

Animata: **${r.animated??!1?"S\xEC":"No"}**
Creata <t:${g}:F> (<t:${g}:R>)${m&&m.length>0?`
Ruoli consentiti: ${m.map(a=>`<@&${a}>`).join(", ")}`:""}`,components:[{type:c.ActionRow,components:[{type:c.Button,custom_id:`emoji-${r.id}-i`,style:f.Primary,label:"Info"},{type:c.Button,custom_id:`emoji-${r.id}-r`,style:f.Danger,label:"Rimuovi"}]}]});return}if(s==="remove"){if(await j(e,n.ownerId))return;let t,o;for(let d of i)if(d.name==="emoji"){if(typeof d.value!="string")continue;let m=d.value.trim().toLowerCase();t=/^\d{17,20}$/.test(m)?m:/^<a?:[a-zA-Z0-9-_]+:\d{17,20}>$/.test(m)?m.replace(/^<:[a-zA-Z0-9-_]+:/,"").replace(/>$/,""):n.emojis.cache.find(r=>r.deletable&&r.name?.toLowerCase()===m)?.id}else d.name==="reason"&&(o=typeof d.value=="string"?d.value:void 0);await S(e,n,t,o);return}if(s==="edit"){if(await j(e,n.ownerId))return;let t,o,d,m;for(let a of i)if(a.name==="emoji"){if(typeof a.value!="string")continue;let l=a.value.trim().toLowerCase();t=/^\d{17,20}$/.test(l)?l:/^<a?:[a-zA-Z0-9-_]+:\d{17,20}>$/.test(l)?l.replace(/^<:[a-zA-Z0-9-_]+:/,"").replace(/>$/,""):n.emojis.cache.find(p=>p.deletable&&p.name?.toLowerCase()===l)?.id}else a.name==="name"?o=typeof a.value=="string"?a.value:void 0:a.name==="roles"?m=(typeof a.value=="string"?a.value:void 0)?.split(/\s*,\s*/).map(l=>(l=l.toLowerCase(),/^\d{17,20}$/.test(l)?l:/^<@&\d{17,20}>$/.test(l)?l.slice(3,-1):n.roles.cache.find(p=>p.name.toLowerCase().startsWith(l))?.id)).filter(l=>l!==void 0):a.name==="reason"&&(d=typeof a.value=="string"?a.value:void 0);if(!t){await e.reply({content:"Non hai specificato un'emoji valida!",ephemeral:!0});return}if(o){if(o.length<2||o.length>32){await e.reply({content:"Il nome dell'emoji deve essere compreso tra 2 e 32 caratteri!",ephemeral:!0});return}if(!/^[a-zA-Z0-9-_]+$/.test(o)){await e.reply({content:"Il nome dell'emoji contiene caratteri non validi!",ephemeral:!0});return}}if(e.appPermissions?.has("ManageEmojisAndStickers")!==!0){await e.reply({content:"Ho bisogno del permesso **Gestire emoji e adesivi**!",ephemeral:!0});return}let r=await n.emojis.edit(t,{name:o,reason:d||void 0,roles:m}).catch(h);if(r instanceof Error){await y(e,r);return}let g=Math.round(r.createdTimestamp/1e3);await e.reply({content:`${r.toString()} Emoji [${r.name}](${r.url}) (${r.id}) modificata con successo!

Animata: **${r.animated??!1?"S\xEC":"No"}**
Creata <t:${g}:F> (<t:${g}:R>)${m&&m.length>0?`
Ruoli consentiti: ${m.map(a=>`<@&${a}>`).join(", ")}`:""}`,components:[{type:c.ActionRow,components:[{type:c.Button,custom_id:`emoji-${r.id}-i`,style:f.Primary,label:"Info"},{type:c.Button,custom_id:`emoji-${r.id}-r`,style:f.Danger,label:"Rimuovi"}]}]});return}if(s==="info"){let t=i.find(o=>o.name==="emoji")?.value;if(typeof t!="string"){await e.reply({content:"Non hai specificato un'emoji valida!",ephemeral:!0});return}t=t.trim().toLowerCase(),await A(e,await(/^\d{17,20}$/.test(t)?n.emojis.fetch(t).catch(()=>{}):/^<a?:[a-zA-Z0-9-_]+:\d{17,20}>$/.test(t)?n.emojis.fetch(t.replace(/(^<:[a-zA-Z0-9-_]+:)|(>$)/,"")).catch(()=>{}):n.emojis.cache.find(o=>o.name?.toLowerCase()===t)))}},async component(e){if(!e.inCachedGuild()){await e.reply({content:"Questo comando pu\xF2 essere usato solo all'interno di un server!",ephemeral:!0});return}let[,i,s]=e.customId.split("-"),{guild:n}=e;if(s==="r"){if(await j(e,n.ownerId))return;await S(e,n,i);return}s==="i"&&await A(e,await n.emojis.fetch(i).catch(()=>{}),!0)},async autocomplete(e){if(!e.inCachedGuild())return;let{guild:i}=e,s=e.options.getFocused(!0);if(typeof s.value=="string"){if(s.name==="emoji"){s.value=s.value.trim().toLowerCase();let n=s.value?/^\d{2,20}$/.test(s.value)?i.emojis.cache.filter(t=>t.id.startsWith(s.value)&&t.name!=null):i.emojis.cache.filter(t=>t.name?.toLowerCase().startsWith(s.value)??!1):i.emojis.cache.filter(t=>t.name!=null);await e.respond(n.first(25).map(t=>({name:t.name,value:t.id})));return}if(s.name==="roles"){s.value=s.value.trim();let n=s.value.split(/\s*,\s*/),t=n.slice(0,-1),o=n.at(-1).toLowerCase(),d=s.value?/^\d{2,20}$/.test(o)?i.roles.cache.filter(m=>m.id.startsWith(o)&&!t.includes(m.name)):i.roles.cache.filter(m=>m.name.toLowerCase().startsWith(o)&&!t.includes(m.name)):i.roles.cache;await e.respond(d.map(m=>{let r=t.concat([m.name]).join(", ");return{name:r,value:r}}))}}}});export{T as command};
//# sourceMappingURL=emojis.js.map