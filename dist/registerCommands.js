import{a as i}from"./chunk-B7NPBJ6H.js";import{REST as p}from"@discordjs/rest";import{APIVersion as d,Routes as t}from"discord-api-types/v10";import{config as l}from"dotenv";import{promises as c}from"node:fs";import{env as r,exit as f}from"node:process";import{URL as u}from"node:url";r.DISCORD_TOKEN==null&&l();console.time("Register slash commands");var{DISCORD_CLIENT_ID:a,DISCORD_TOKEN:C,TEST_GUILD:I,NODE_ENV:n}=r,s=new p({version:d}).setToken(C),e=await c.readdir(new u(i.commandsFolderName,import.meta.url)).then(o=>Promise.all(o.filter(m=>m.endsWith(".js")).map(async m=>(await import(`./${i.commandsFolderName}/${m}`)).command))),[P,D]=await Promise.all([s.put(t.applicationGuildCommands(a,I),{body:e.filter(o=>n!=="production"||o.isPublic!==!0).map(o=>o.data.toJSON())}),n==="production"?s.put(t.applicationCommands(a),{body:e.filter(o=>o.isPublic).map(o=>o.data.toJSON())}):[]]);console.log("Public commands:",D);console.log("Private commands:",P);console.timeEnd("Register slash commands");f(0);
//# sourceMappingURL=registerCommands.js.map