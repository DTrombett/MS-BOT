import{b as t}from"../chunk-L6YZVJZB.js";import"../chunk-UUWUPXYS.js";import{InteractionType as o}from"discord-api-types/v10";var n=t({name:"interactionCreate",async on(e){let m;switch(e.type){case o.ApplicationCommand:this.client.commands.find(s=>s.data.some(a=>a.type===e.commandType&&a.name===e.commandName))?.run(e);break;case o.MessageComponent:[m]=e.customId.split("-"),this.client.commands.get(m)?.component(e);break;case o.ApplicationCommandAutocomplete:this.client.commands.get(e.commandName)?.autocomplete(e);break;case o.ModalSubmit:[m]=e.customId.split("-"),this.client.commands.get(m)?.modalSubmit(e);break;default:}}});export{n as event};
//# sourceMappingURL=interactionCreate.js.map