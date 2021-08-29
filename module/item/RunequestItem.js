import {RQG} from '../config.js';

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class RunequestItem extends Item {
    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
      super.prepareData();
  
      // Get the Item's data
      const itemData = this.data;
      const actorData = this.actor ? this.actor.data : {};
      const data = itemData.data;
      data.total=data.base+data.increase+data.modifier;
    }
    // Roll function to trigger from Actor
    async roll({configureDialog=true, rollMode, createMessage=true, testmodifier=0}={}) {
      let item = this;
      const actor = this.actor;
  
      // Reference aspects of the item data necessary for usage
      const id = this.data.data;                // Item data
      console.log("actor");
      console.log(actor);
      console.log("item");
      console.log(item);
      switch(item.type) {
        case "attack":
          this._attackroll(item,actor,testmodifier);
          break;
        case "skill":
          this._skillroll(item,actor);
          break;
        default:
          break;
      }
    }
    // Gain Roll function for Skill and Passion gain roll
    async gainroll({configureDialog=true, rollMode, createMessage=true, testmodifier=0}={}) {
      let item = this;
      const actor = this.actor;
  
      // Reference aspects of the item data necessary for usage
      const id = this.data.data;                // Item data
      console.log("actor");
      console.log(actor);
      console.log("item");
      console.log(item);
      switch(item.type) {
        case "passion":
          this._passiongainroll(item,actor,testmodifier);
          break;
        case "skill":
          this._skillgainroll(item,actor);
          break;
        default:
          break;
      }
    }

    _attackroll(attack,actor,testmodifier) {
      const data = actor.data;
      let categoryid = attack.data.data.attacktype+"weapons";
      console.log(actor);
      console.log(attack);
      const damagebonus = data.data.attributes.damagebonus;
      //console.log("skillname:"+skillname);
      //let skills= actor.itemTypes["skill"];

      const skillused = actor.getEmbeddedDocument("Item",attack.data.data.skillused);
      const skillname = skillused.name;
      console.log(skillused);
      const categorymod = data.data.skillcategory[categoryid].modifier;
      console.log("categoryid:"+categoryid+" / "+categorymod);
      let target= skillused.data.data.total+categorymod+attack.data.data.modifier+testmodifier;
      const critical = Math.max(Math.round(target/20),1);
      const special = Math.round(target/5);
      const fumblerange= Math.round((100-target)/20);
      const fumble = 100-Math.max(fumblerange,0);
      let roll;
      roll = new Roll("1d100").roll();
      let result;
      console.log(attack);
  
      if((roll.total < 96 && roll.total <= target) || roll.total <= 5) { //This is a success we check type of success
        if(roll.total <= critical) {
          result = "critical";
        }
        else {
          if(roll.total <= special) {
            result= "special";
          }
          else {
            result = "success"
          }
        }
      }
      else {
        if(roll.total >= fumble) {
          result = "fumble"; 
        }
        else {
          result = "failure";
        }
      }
      console.log(damagebonus);
      console.log("Finish attack roll in item")
      this.htmldamageroll(roll,target,result,attack,damagebonus);
  
    }
    async _skillroll(skill,actor){
      console.log("skillroll in item");
      console.log(skill);
      console.log(actor);
      let skillname = skill.data.name;
      const categoryid= skill.data.data.skillcategory;
      let catmodifier = actor.data.data.skillcategory[categoryid].modifier;
      let skillvalue = skill.data.data.total;
      let result="failure";

      var dialogOptions;
      dialogOptions = {
        title: "Skill Roll",
        template : "/systems/runequest/templates/chat/skill-dialog.html",
        // Prefilled dialog data

        data : {
          "skillname": skillname,
          "skillvalue": skillvalue,
          "catmodifier": catmodifier,
          "skillid":skill._id
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          skillname =    html.find('[name="skillname"]').val();
          console.log(skillname);
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          catmodifier = Number(html.find('[name="catmodifier"]').val());
          skillvalue =   Number(html.find('[name="skillvalue"]').val());
          let skillid = html.find('[name="skillid"]').val();
          console.log("In skillroll callback with skill._id = "+skillid);
          const target = (skillvalue+catmodifier+testmodifier);
          let result = this.basicRoll(skillname,target);
         
          return result;
        }
      };
      result = renderTemplate(dialogOptions.template, dialogOptions.data).then(dlg =>
        {
          new Dialog(
          {
            title: dialogOptions.title,
            content: dlg,
            buttons:
            {
              rollButton:
              {
                label: game.i18n.localize("Roll"),
                callback: html => dialogOptions.callback(html)
              }
            },
            default: "rollButton"
          }).render(true);
        });     
    }
    async htmldamageroll(roll,target,result,attack,damagebonus) {
      //const itemData = this.data.data;
      const actorData = this.actor.data.data;
      const flags = this.actor.data.flags || {};
      console.log("htmldamageroll- damagebonus"+damagebonus);
      console.log(attack);
      if(!attack.data.data.db) {
        damagebonus="0";
      }
      let attackcontent;
      let damagecontent;
      let damageData = this.getdamagedata(attack,damagebonus);
  
      let rollMode = game.settings.get("core", "rollMode");
      if( result== "success") {
        damageData.damage.roll();
        damageData.damagebonus.roll();
        damageData.totaldamage = damageData.damage.total+ damageData.damagebonus.total;
      }
      else if(result=="special") {  
        damageData.specialdamage.roll();
        damageData.damagebonus.roll();
        damageData.totaldamage = damageData.specialdamage.total + damageData.damagebonus.total;
      }
      else if(result=="critical") {
        damageData.criticaldamage.roll();
        damageData.damagebonus.roll();
        damageData.totaldamage = damageData.criticaldamage.total + damageData.damagebonus.total;
      }
      let hitlocationtable = RollTables.instance.getName("Hit Location - Humanoid");
      console.log("Hit Location - Humanoid loading")
      console.log(hitlocationtable);
      let hitlocation = await hitlocationtable.draw({displayChat: false});
      console.log("Hitlocation drawn:");
      console.log(hitlocation);
  
  
      const templateData = {
        actor: this.actor,
        item: this,
        attack: attack,
        target: target,
        roll: roll,
        result: result,
        damageData: damageData,
        hitlocation: hitlocation.results[0].data.text
      };
  
      // Render the chat card template
      
      const template = `systems/runequest/templates/chat/attackdamage-card.html`;
      const html = await renderTemplate(template, templateData);
      
      // Basic chat message data
  
      const chatData = {
        user: game.user._id,
        content: html,
        speaker: {
          actor: this.actor._id,
          token: this.actor.token,
          alias: this.actor.name
        }
      };
      // Toggle default roll mode
      //let rollMode = game.settings.get("core", "rollMode");
      //if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
      //if ( rollMode === "blindroll" ) chatData["blind"] = true;
  
      // Create the chat message
  
      ChatMessage.create(chatData);
    }  
    getdamagedata(attack,damagebonus) {
      console.log("getdamagedata starting with:");
      console.log(attack);
      console.log(damagebonus);
      let specialdamage;
      let critdamage;
      let maxeddamagebonus = new Roll();
      let maxedspecialdamage;
      let damageData={
        damagebonus: new Roll(damagebonus),
        damage: new Roll(attack.data.data.damage)
      }
      console.log(damageData);
      switch (attack.data.data.specialtype) {
        case "I":
        case "S":
          let specialroll= new Roll(damageData.damage.formula);
          specialroll=specialroll.alter(2,0);
          damageData.specialdamage= new Roll(specialroll.formula);
          critdamage = damageData.specialdamage.clone().evaluate({maximize: true}).total;
          damageData.criticaldamage = new Roll(""+critdamage);
          break;
        case "C":
        default:
          specialdamage = damageData.damage.formula+"+"+damageData.damagebonus.clone().evaluate({maximize: true}).total;
          console.log(specialdamage);
          damageData.specialdamage= new Roll(specialdamage);
          console.log(damageData.specialdamage);
          critdamage = damageData.specialdamage.clone().evaluate({maximize: true}).total;
          console.log(critdamage);
          damageData.criticaldamage = new Roll(""+critdamage);
          break;
      }
      return damageData;
    }
    async _skillgainroll(skill,actor) {

      console.log("skillgainroll in item");
      console.log(skill);
      console.log(actor);
      let skillname = skill.data.name;
      const categoryid= skill.data.data.skillcategory;
      let catmodifier = actor.data.data.skillcategory[categoryid].modifier;
      let skillvalue = skill.data.data.total;
      const critical = Math.max(Math.round(skillvalue/20),1);
      const special = Math.round(skillvalue/5);
      const fumblerange= Math.round((100-skillvalue)/20);
      const fumble = 100-Math.max(fumblerange,0);
      let roll;
      roll = new Roll("1d100+@catmodifier",{catmodifier: catmodifier}).roll();
      console.log(roll);

      let result;
  
      if((roll.total < 96 && roll.total <= skillvalue) || roll.total <= 5) { //This is a success we check type of success
        if(roll.total <= critical) {
          result = "critical - No gain";
        }
        else {
          if(roll.total <= special) {
            result= "special - No Gain";
          }
          else {
            result = "success - No Gain"
          }
        }
      }
      else {
        if(roll.total >= fumble) {
          result = "fumble - You gain 1d6"; 
        }
        else {
          result = "failure - You gain 1d6";
        }
      }


      const templateData = {
        actor: actor,
        item: skill,
        charname: skillname,
        target: skillvalue,
        roll: roll,
        result: result
      };
      // Render the chat card template
      
      
      const template = `systems/runequest/templates/chat/skill-card.html`;
      const html = await renderTemplate(template, templateData);

      // Basic chat message data
  
      const chatData = {
        user: game.user._id,
        content: html,
        speaker: {
          actor: this.actor._id,
          token: this.actor.token,
          alias: this.actor.name
        }
      };
  
      
      // Toggle default roll mode
      let rollMode = game.settings.get("core", "rollMode");
      if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
      if ( rollMode === "blindroll" ) chatData["blind"] = true;
  
      // Create the chat message
  
      ChatMessage.create(chatData);
      return result;
      
    }

    async basicRoll(charname, target) {
      const critical = Math.max(Math.round(target/20),1);
      const special = Math.round(target/5);
      const fumblerange= Math.round((100-target)/20);
      const fumble = 100-Math.max(fumblerange,0);
      let roll;
      roll = new Roll("1d100").roll();
      let result;
      console.log(this);
      if((roll.total < 96 && roll.total <= target) || roll.total <= 5) { //This is a success we check type of success
        if(roll.total <= critical) {
          result = "critical";
        }
        else {
          if(roll.total <= special) {
            result= "special";
          }
          else {
            result = "success"
          }
        }
        console.log("experience:"+this.data.data.experience);
        await this.update({["data.experience"]:true});
        console.log("updated experience"+this.data.data.experience);
        //this.update(this.data);
      }
      else {
        if(roll.total >= fumble) {
          result = "fumble"; 
        }
        else {
          result = "failure";
        }
      }
      
      const templateData = {
        actor: this.actor,
        item: this.data,
        charname: charname,
        target: target,
        roll: roll,
        result: result
      };
      // Render the chat card template
      
      const template = `systems/runequest/templates/chat/skill-card.html`;
      const html = await renderTemplate(template, templateData);
      
      // Basic chat message data
  
      const chatData = {
        user: game.user._id,
        content: html,
        speaker: {
          actor: this.actor._id,
          token: this.actor.token,
          alias: this.actor.name
        }
      };
  
  
      // Toggle default roll mode
      let rollMode = game.settings.get("core", "rollMode");
      if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
      if ( rollMode === "blindroll" ) chatData["blind"] = true;
  
      // Create the chat message
  
      ChatMessage.create(chatData);
      return result;
    }
}
  