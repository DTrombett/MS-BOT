import{a as h}from"../chunk-L6YZVJZB.js";import{d as f}from"../chunk-UUWUPXYS.js";import{codeBlock as y}from"@discordjs/builders";import{ApplicationCommandOptionType as p,ApplicationCommandType as I}from"discord-api-types/v10";import{Colors as S,escapeCodeBlock as w}from"discord.js";import{Buffer as C}from"node:buffer";import B,{once as E}from"node:events";import{performance as v}from"node:perf_hooks";import{nextTick as b}from"node:process";import{REPL_MODE_STRICT as A,start as L}from"node:repl";import{Readable as P,Writable as R}from"node:stream";var g=new P({highWaterMark:1e6,encoding:"utf8",read:()=>{}}),d=new B({captureRejections:!0}),r=L({input:g,output:new R({defaultEncoding:"utf8",highWaterMark:1e6,decodeStrings:!1,write:(e,n,i)=>{d.emit("data",e),i()}}),prompt:"",replMode:A}),x=e=>{r.context.command=k,r.context.replServer=r,r.context.interaction=e,r.context.client=e.client},O=e=>{let{options:n}=r.writer,s=e.guild?.presences.cache.get(e.user.id)?.clientStatus?.mobile==null;n.colors=e.options.getBoolean("file")===!0?!1:s,n.showHidden=e.options.getBoolean("show-hidden")??!1,n.depth=e.options.getInteger("depth")??3,n.showProxy=e.options.getBoolean("show-proxy")??!0,n.maxArrayLength=e.options.getInteger("max-array-length")??100,n.maxStringLength=e.options.getInteger("max-string-length")??1e3,n.breakLength=s?66:39},k=h({data:[{name:"eval",description:"Esegui del codice JavaScript",type:I.ChatInput,options:[{type:p.String,name:"code",description:"Codice da eseguire",required:!0,autocomplete:!0},{type:p.Boolean,name:"ephemeral",description:"Se il risultato pu\xF2 essere visto solo da te (default: true)"},{type:p.Boolean,name:"file",description:"Se il risultato deve essere inviato come file (default: false)"},{type:p.Boolean,name:"show-hidden",description:"Se mostrare le propriet\xE0 nascoste (default: false)"},{type:p.Integer,name:"depth",description:"Profondit\xE0 di esecuzione (default: 3)"},{type:p.Boolean,name:"show-proxy",description:"Se includere le propriet\xE0 proxy (default: true)"},{type:p.Integer,name:"max-array-length",description:"Il numero massimo di elementi da mostrare in un array (default: 100)"},{type:p.Integer,name:"max-string-length",description:"Il numero massimo di caratteri da mostrare in una stringa (default: 1000)"}]}],isPrivate:!0,async run(e){let n=e.options.getString("code",!0),i=e.options.getBoolean("ephemeral")??!0,s,m=v.now(),[l]=await Promise.all([new Promise(a=>{let c="",t,o=u=>{clearImmediate(t),s=v.now()-m,c+=u,t=setImmediate(()=>{a(c.trim()),d.removeListener("data",o),delete r.context.interaction})};d.on("data",o),O(e),x(e),g.push(`${n}
`)}),e.deferReply({ephemeral:i}).catch(f.printToStderr)]);await e.editReply(e.options.getBoolean("file")??!1?{files:[{attachment:C.from(l,"utf8"),name:"eval.txt",description:`Eval elaborato in ${s}ms`}]}:{content:`Eval elaborato in ${s}ms`,embeds:[{author:{name:e.user.tag,icon_url:e.user.displayAvatarURL()},title:"Eval output",description:y("ansi",w(l).slice(0,4096-11)),color:S.Blurple,timestamp:new Date().toISOString(),fields:[{name:"Input",value:y("js",w(n).slice(0,1024-9))}]}]})},async autocomplete(e){let n=e.options.getFocused(!0);if(n.name!=="code")return;if(n.value.length>=100){await e.respond([]);return}x(e);let[i,s]=await new Promise(t=>{r.completer(n.value,(o,u)=>{o&&f.printToStderr(o),t(u??[[],""])})});if(i.length===0){await e.respond([]),delete r.context.interaction;return}let m=[],l=[],a=i.find(t=>i.every(o=>o.startsWith(t)));for(let t of i){if(!t||l.length>=25){m.push(l),l=[];continue}if(a&&a===t)continue;let o=n.value.replace(new RegExp(`${s}$`),t);o.length>100||l.push({name:o,value:o})}m.push(l);let c=m.reverse().flat().slice(0,25);if(a&&s===n.value){let{options:t}=r.writer;t.colors=!1,t.showHidden=!1,t.depth=2,t.showProxy=!1,t.maxArrayLength=10,t.maxStringLength=100,t.breakLength=1/0,t.compact=!0,b(()=>g.push(`${a}
`));let[o]=await E(d,"data");if(o=o.trim(),o.length>100&&(o=`${o.slice(0,97).trimEnd()}...`),o){delete r.context.interaction,a=a.slice(0,100),await e.respond([{name:o,value:a},{name:a,value:a},...c]);return}}delete r.context.interaction,await e.respond(c)}});export{k as command};
//# sourceMappingURL=eval.js.map