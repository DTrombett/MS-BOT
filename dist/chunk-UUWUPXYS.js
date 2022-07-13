var B={clientOnlineLabel:"Client online",commandsFolderName:"commands",databaseFolderName:"database",eventsFolderName:"events"},C={kick:"994260465402253442",bann:"994261301364801537"},r=B;import{ActivityType as $}from"discord-api-types/v10";import{Client as V,Collection as O,Options as E,Partials as o}from"discord.js";import{env as A,stderr as L,stdout as j}from"node:process";import{inspect as K}from"node:util";var N=(n,e)=>`\x1B[${e}m${n}\x1B[m`,w=N;import{createReadStream as I,createWriteStream as R}from"node:fs";var f=class{promises=[];wait(){let e,t=this.promises.at(-1)?.promise??Promise.resolve(),a=new Promise(i=>{e=i});return this.promises.push({resolve:e,promise:a}),t}next(){this.promises.shift()?.resolve()}},h=f;var d={},c={},y=async(n,e=!1)=>{if(await(d[n]??=new h).wait(),d[n].next(),c[n]!==void 0&&!e)return c[n];let t="";return new Promise((a,i)=>{I(`./${r.databaseFolderName}/${n}.json`).on("data",s=>t+=s).once("end",()=>{try{a(c[n]=JSON.parse(t))}catch(s){i(s)}}).once("error",i).setEncoding("utf8")})},g=async(n,e)=>{if(await(d[n]??=new h).wait(),c[n]===e)return;c[n]=e;let t=new Promise((a,i)=>{R(`./${r.databaseFolderName}/${n}.json`).once("error",i).setDefaultEncoding("utf8").end(JSON.stringify(e),a)});return t.finally(d[n].next.bind(d[n])),t};import{ApplicationCommandType as _}from"discord-api-types/v10";import{readdir as k}from"node:fs/promises";import{env as u}from"node:process";var v=class{client;data;isPrivate=!1;_autocomplete;_component;_modalSubmit;_execute;constructor(e,t){this.client=e,this.patch(t)}async autocomplete(e){try{(!this.isPrivate||u.OWNER_IDS?.includes(e.user.id)===!0)&&await this._autocomplete?.(e)}catch(t){p.printToStderr(t)}}async component(e){try{(!this.isPrivate||u.OWNER_IDS?.includes(e.user.id)===!0)&&await this._component?.(e)}catch(t){p.printToStderr(t)}}async modalSubmit(e){try{(!this.isPrivate||u.OWNER_IDS?.includes(e.user.id)===!0)&&await this._modalSubmit?.(e)}catch(t){p.printToStderr(t)}}patch(e){return e.data!==void 0&&(this.data=e.data),e.autocomplete!==void 0&&(this._autocomplete=e.autocomplete.bind(this)),e.component!==void 0&&(this._component=e.component.bind(this)),e.modalSubmit!==void 0&&(this._modalSubmit=e.modalSubmit.bind(this)),e.isPrivate!==void 0&&(this.isPrivate=e.isPrivate),e.run!==void 0&&(this._execute=e.run.bind(this)),this}async run(e){try{(!this.isPrivate||u.OWNER_IDS?.includes(e.user.id)===!0)&&await this._execute(e)}catch(t){p.printToStderr(t)}}},P=v;var F=async n=>{let e=await k(new URL(r.commandsFolderName,import.meta.url)),a=(await Promise.all(e.filter(i=>i.endsWith(".js")).map(i=>import(`./${r.commandsFolderName}/${i}`)))).map(i=>i.command);for(let i of a)n.commands.set(i.data.find(({type:s})=>s===_.ChatInput)?.name??i.data[0].name,new P(n,i))},x=F;import{promises as D}from"node:fs";import{URL as G}from"node:url";var b=class{client;name;on;once;constructor(e,t){this.client=e,this.name=t.name,this.patch(t)}patch(e){return this.removeListeners(),e.on!==void 0&&(this.on=e.on.bind(this)),e.once!==void 0&&(this.once=e.once.bind(this)),this.addListeners(),this}addListeners(){this.on&&this.client.on(this.name,this.on),this.once&&this.client.once(this.name,this.once)}removeListeners(){this.on&&this.client.off(this.name,this.on),this.once&&this.client.off(this.name,this.once)}},T=b;var W=async n=>{let e=await D.readdir(new G(r.eventsFolderName,import.meta.url)),a=(await Promise.all(e.filter(i=>i.endsWith(".js")).map(i=>import(`./${r.eventsFolderName}/${i}`)))).map(i=>i.event);for(let i of a)n.events.set(i.name,new T(n,i))},S=W;var m=class extends V{commands=new O;events=new O;constructor(){super({intents:["GuildMembers","Guilds","GuildPresences"],allowedMentions:{parse:[],repliedUser:!1,roles:[],users:[]},failIfNotExists:!1,rest:{invalidRequestWarningInterval:9999},makeCache:E.cacheWithLimits({...E.DefaultMakeCacheSettings,BaseGuildEmojiManager:100,GuildBanManager:10,GuildInviteManager:0,GuildMemberManager:1e3,GuildStickerManager:0,MessageManager:0,PresenceManager:{maxSize:0,keepOverLimit:(e,t)=>A.OWNER_IDS?.includes(t)===!0},ReactionManager:0,ReactionUserManager:0,StageInstanceManager:0,ThreadMemberManager:0,UserManager:1e3,VoiceStateManager:0,ApplicationCommandManager:0,GuildScheduledEventManager:0}),presence:{activities:[{name:"MS Gaming",type:$.Watching}]},shards:"auto",partials:[o.Channel,o.GuildMember,o.Message,o.Reaction,o.User,o.GuildScheduledEvent,o.ThreadMember],waitGuildTimeout:1e3})}static inspect(e){switch(typeof e){case"string":return e;case"bigint":case"number":case"boolean":case"function":case"symbol":return e.toString();case"object":return K(e);default:return"undefined"}}static printToStdout(e){j.write(`${m.inspect(e)}
`)}static printToStderr(e){L.write(w(`${m.inspect(e)}
`,31))}async login(e){return await Promise.all([x(this),S(this),y("timeouts").then(t=>{t=t.filter(a=>a.date>Date.now());for(let{args:a,date:i,name:s}of t)setTimeout(async()=>{await Promise.all([import(`./util/timeouts/${s}.js`).then(l=>l.default(...a)),y("timeouts").then(l=>g("timeouts",l.filter(M=>M.date!==i)))])},i-Date.now()).unref();return g("timeouts",t)})]),super.login(e)}},p=m;export{B as a,C as b,r as c,m as d,p as e};
//# sourceMappingURL=chunk-UUWUPXYS.js.map