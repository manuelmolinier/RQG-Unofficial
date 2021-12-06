import {RQG} from '../config.js';

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class RunequestItem extends Item {
  /**
   * Dictionnary for chatTemplates to render Item "rolls" in Chats
   */
  chatTemplate = {
    "attack": "systems/runequest/templates/chat/partials/attack-card.hbs",
    "runespell": "systems/runequest/templates/chat/partials/runespell-card.hbs",
    "spiritspell": "systems/runequest/templates/chat/partials/spiritspell-card.hbs",
    "skill": "systems/runequest/templates/chat/partials/skill-card.hbs",
    "passion": "systems/runequest/templates/chat/partials/passion-card.hbs",
    "default":"systems/runequest/templates/chat/partials/default-card.hbs"
  }
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
    //("In Item prepareData for: "+itemData.name+" and type: "+itemData.type);
    //(actorData);
    if(itemData.type !== "attack") {
      data.total=data.base+data.increase+data.modifier;
    }
    else if(typeof actorData !== 'undefined'){
      //Setup the value from the attack skill
      let skill;
      if(actorData && data.skillused !== "") {
        try {
          skill = this.actor.getEmbeddedDocument("Item",data.skillused).data.data;
          data.skillvalue= skill.total;
        }
        catch (error)  {
          data.skillvalue= 0;
        }
      }
      else {
        data.skillvalue= 0;
      }

      //Setup the values for the attack.
      //(data.skillvalue+"+"+data.modifier);
      data.attacktotal=data.skillvalue+data.modifier;
    }
  }
  // Roll function to trigger from Actor
  async roll({configureDialog=true, rollMode, createMessage=true, testmodifier=0}={}) {
    let item = this;
    const actor = this.actor;
    console.log(arguments);
    // Reference aspects of the item data necessary for usage
    const id = this.data.data;                // Item data
    //("actor");
    //(actor);
    //("item");
    //(item);
    switch(item.type) {
      case "attack":
        let targetdefense = arguments[0].targetdefense?arguments[0].targetdefense:null;
        console.log(targetdefense);
        this._attackroll(item,actor,testmodifier,targetdefense);
        break;
      case "skill":
        this._skillroll(item,actor);
        break;
      case "passion":
          this._passionroll(item,actor);
          break;          
      case "rune":
        this._runeroll(item,actor);
        break;
      case "spiritspell":
        this._spiritspellroll(item,actor);          
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
    //("actor");
    //(actor);
    //("item");
    //(item);
    this._skillgainroll(item,actor);
  }

  async _attackroll(attack,actor,testmodifier,targetdefense) {
    const data = actor.data;
    let categoryid = attack.data.data.attacktype+"weapons";
    const damagebonus = data.data.attributes.damagebonus;
    const skillused = actor.getEmbeddedDocument("Item",attack.data.data.skillused);
    const skillname = skillused.name;
    let result;
    const categorymod = (categoryid == "spiritweapons")?data.data.skillcategory["magic"].modifier:data.data.skillcategory[categoryid].modifier;
    let attackskill= (skillused.data.data.total+categorymod+attack.data.data.modifier+testmodifier+data.data.attributes.inspiration)*data.data.attributes.attackmultiplier;
    let attackroll;
    attackroll = await new Roll("1d100").roll();
    let attackresult;
    let defenseroll = await new Roll("1d100").roll();
    let defenseskill
    let defenseresult;
    if(targetdefense) {
      defenseskill = targetdefense.data.data.total;
      // Compare the attack and defense value to apply difference if one or both are over 100%
      if(attackskill > 100 || defenseskill > 100) {
        if(attackskill > defenseskill) {
          // Attacker have the advantage and defense will be decreased as much
          let diff = attackskill - 100;
          attackskill -= diff;
          defenseskill -= diff;
        }
        else {
          // Defender have the advantage and attack will be decreased as much
          let diff = defenseskill - 100;
          attackskill -= diff;
          defenseskill -= diff;          
        }
      }
      defenseresult = this.runequestroll(defenseroll,defenseskill);
      attackresult = this.runequestroll(attackroll,attackskill);
      result = this._compareOpposedParryRoll(attackresult,defenseresult);
    }
    else {
      attackresult = this.runequestroll(attackroll,attackskill);
      result = attackresult;
    }
    this.htmldamageroll(attackroll,attackskill,result,attack,damagebonus,attackresult, targetdefense, defenseroll, defenseskill, defenseresult);
  }
  async _skillroll(skill,actor){
    //("skillroll in item");
    //(skill);
    //(actor);
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
        "skillid":skill.id
      },
      callback : (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
        skillname =    html.find('[name="skillname"]').val();
        //(skillname);
        let testmodifier =   Number(html.find('[name="testmodifier"]').val());
        catmodifier = Number(html.find('[name="catmodifier"]').val());
        skillvalue =   Number(html.find('[name="skillvalue"]').val());
        let skillid = html.find('[name="skillid"]').val();
        //("In skillroll callback with skill.id = "+skillid);
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
  async _passionroll(passion,actor){
    //("passionroll in item");
    //(passion);
    //(actor);
    let passionname = passion.data.name;
    let passionvalue = passion.data.data.total;
    let result="failure";

    var dialogOptions;
    dialogOptions = {
      title: "Passion Roll",
      template : "/systems/runequest/templates/chat/skill-dialog.html",
      // Prefilled dialog data

      data : {
        "skillname": passionname,
        "skillvalue": passionvalue,
        "catmodifier": 0,
        "skillid":passion.id
      },
      callback : (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
        passionname =    html.find('[name="skillname"]').val();
        //(passionname);
        let testmodifier =   Number(html.find('[name="testmodifier"]').val());
        passionvalue =   Number(html.find('[name="skillvalue"]').val());
        let passionid = html.find('[name="skillid"]').val();
        //("In passionroll callback with passion.id = "+passionid);
        const target = (passionvalue+testmodifier);
        let result = this.basicRoll(passionname,target);
        
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
  async _runeroll(rune,actor){
    let runename = rune.data.name;
    let runevalue = rune.data.data.total;
    let result="failure";

    var dialogOptions;
    dialogOptions = {
      title: "Rune Roll",
      template : "/systems/runequest/templates/chat/skill-dialog.html",
      // Prefilled dialog data

      data : {
        "skillname": runename,
        "skillvalue": runevalue,
        "catmodifier": 0,
        "skillid":rune.id
      },
      callback : (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
        runename =    html.find('[name="skillname"]').val();
        //(runename);
        let testmodifier =   Number(html.find('[name="testmodifier"]').val());
        runevalue =   Number(html.find('[name="skillvalue"]').val());
        let runeid = html.find('[name="skillid"]').val();
        //("In runeroll callback with rune.id = "+runeid);
        const target = (runevalue+testmodifier);
        let result = this.basicRoll(runename,target);
        
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
  _spiritspellroll(spell,actor) {
    let spellname = spell.data.name;
    let spellskill = actor.data.data.characteristics.power.value*5;
    let result="failure";

    var dialogOptions;
    dialogOptions = {
      title: "Spirit Spell Roll",
      template : "/systems/runequest/templates/chat/skill-dialog.html",
      // Prefilled dialog data

      data : {
        "skillname": spellname,
        "skillvalue": spellskill,
        "catmodifier": 0,
        "skillid":spell.id
      },
      callback : (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
        spellname =    html.find('[name="skillname"]').val();
        let testmodifier =   Number(html.find('[name="testmodifier"]').val());
        spellskill =   Number(html.find('[name="skillvalue"]').val());
        let spellid = html.find('[name="skillid"]').val();
        const target = (spellskill+testmodifier);
        let result = this.basicRoll(spellname,target);
        
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
  async htmldamageroll(attackroll,attackskill,result,attack,damagebonus,attackresult, targetdefense, defenseroll, defenseskill, defenseresult) {
    const actorData = this.actor.data.data;
    const flags = this.actor.data.flags || {};
    if(!attack.data.data.db) {
      damagebonus="0";
    }
    let damageData = await this.getdamagedata(attack,damagebonus);
    let rollMode = game.settings.get("core", "rollMode");
    let isCritical = (result=="critical");
    let isSpecial= (result=="special");
    let isSuccess= (result== "success");
    let isFailure= (result== "failure");
    let isFumble= (result== "fumble");

    if( result== "success") {
      damageData.damage = await damageData.damage.roll();
      damageData.damagebonus = await damageData.damagebonus.roll();
      damageData.totaldamage = damageData.damage.total+ damageData.damagebonus.total;
    }
    else if(result=="special") {  
      damageData.specialdamage = await damageData.specialdamage.roll();
      damageData.damagebonus = await damageData.damagebonus.roll();
      damageData.totaldamage = damageData.specialdamage.total + damageData.damagebonus.total;
    }
    else if(result=="critical") {
      damageData.criticaldamage = await damageData.criticaldamage.roll();
      if(attack.data.data.specialtype != "C") {
        damageData.damagebonus = await damageData.damagebonus.roll();        
      }
      else {
        damageData.damagebonus = new Roll("0");
        damageData.damagebonus = await damageData.damagebonus.roll();        
      }
      damageData.totaldamage = damageData.criticaldamage.total + damageData.damagebonus.total;
    }

    let hitlocationtable = RollTables.instance.getName("Hit Location - Humanoid");
    //("Hit Location - Humanoid loading")
    //(hitlocationtable);
    let hitlocation = await hitlocationtable.draw({displayChat: false});
    //("Hitlocation drawn:");
    //(hitlocationtable);


    const templateData = {
      isCritical: isCritical,
      isSpecial: isSpecial,
      isSuccess: isSuccess,
      isFailure: isFailure,
      isFumble: isFumble,
      actor: this.actor,
      item: this,
      attack: attack,
      result: result,
      attackskill: attackskill,
      attackroll: attackroll,
      attackresult: attackresult,
      defenseresult: defenseresult,
      defenseroll: defenseroll,
      targetdefense: targetdefense,
      defenseskill: defenseskill,
      damageData: damageData,
      hitlocation: hitlocation.results[0].data.text
    };

    // Render the chat card template
    
    const template = `systems/runequest/templates/chat/attackdamage-card.html`;
    const html = await renderTemplate(template, templateData);
    
    // Basic chat message data

    const chatData = {
      user: game.user.id,
      content: html,
      speaker: {
        actor: this.actor.id,
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
  async getdamagedata(attack,damagebonus) {
    //("getdamagedata starting with:");
    //(attack);
    //(damagebonus);
    let specialdamage;
    let critdamage;
    let maxeddamagebonus = new Roll();
    let maxedspecialdamage;
    let damageData={
      damagebonus: new Roll(damagebonus),
      damage: new Roll(attack.data.data.damage)
    }
    //(damageData);
    switch (attack.data.data.specialtype) {
      case "C":
        specialdamage = damageData.damage.formula+"+"+damageData.damagebonus.clone().evaluate({maximize: true}).total;
        //(specialdamage);
        damageData.specialdamage= new Roll(specialdamage);
        //(damageData.specialdamage);
        critdamage = damageData.specialdamage.clone().evaluate({maximize: true}).total+"+"+damageData.damagebonus.clone().evaluate({maximize: true}).total;
        //(critdamage);
        damageData.criticaldamage = new Roll(""+critdamage);
        break;
      case "I":
      case "S":        
      default:
        let specialroll= new Roll(damageData.damage.formula);
        specialroll=specialroll.alter(2,0);
        damageData.specialdamage= new Roll(specialroll.formula);
        critdamage = damageData.specialdamage.clone().evaluate({maximize: true}).total;
        damageData.criticaldamage = new Roll(""+critdamage);
        break;
    }
    return damageData;
  }
  async _skillgainroll(skill,actor) {
    let skillname = skill.data.name;
    const categoryid= skill.data.data.skillcategory;
    if(!skill.data.data.experience) { return; }
    skill.data.data.experience = false;
    let catmodifier = skill.type == 'skill'?actor.data.data.skillcategory[categoryid].modifier:0;
    let skillvalue = skill.data.data.total;
    const critical = Math.max(Math.round(skillvalue/20),1);
    const special = Math.round(skillvalue/5);
    const fumblerange= Math.round((100-skillvalue)/20);
    const fumble = 100-Math.max(fumblerange,0);
    let roll;
    roll = await new Roll("1d100+@catmodifier",{catmodifier: catmodifier}).roll();
    //(roll);

    let result;

    if((roll.total < 96 && roll.total <= skillvalue) || roll.total <= 5) { //This is a success we check type of success
      if(roll.total <= critical) {
        result = "No gain";
      }
      else {
        if(roll.total <= special) {
          result= "No Gain";
        }
        else {
          result = "No Gain"
        }
      }
    }
    else {
      if(roll.total >= fumble) {
        result = "You gain [[1d6]]"; 
      }
      else {
        result = "You gain [[1d6]]";
      }
    }

    //let skillroll = await roll.toMessage({}, {create:true});
    //let skillrolled = await skillroll.getHTML();
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
      user: game.user.id,
      content: html,
      speaker: {
        actor: this.actor.id,
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
    roll = await new Roll("1d100").roll();
    let result;
    //(this);
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
      //("experience:"+this.data.data.experience);
      await this.update({["data.experience"]:true});
      //("updated experience"+this.data.data.experience);
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
      user: game.user.id,
      content: html,
      speaker: {
        actor: this.actor.id,
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
  async _gethitlocations(hitlocationtype) {
    //("hitlocations was empty so we load them");
    const compendiumname = "runequest."+hitlocationtype+"locations";
    const hitlocationslist = await RunequestActor.loadCompendium(compendiumname);
    const hitlocations = hitlocationslist.map(i => i.toObject());
    //(hitlocations);
    return hitlocations;
  } 
  /* -------------------------------------------- */
  static async loadCompendiumData(compendium) {
    const pack = game.packs.get(compendium);
    return await pack?.getDocuments() ?? [];
  }

  /* -------------------------------------------- */
  static async loadCompendium(compendium, filter = item => true) {
    //("Loading compendium:"+compendium);
    let compendiumData = await RunequestActor.loadCompendiumData(compendium);
    return compendiumData.filter(filter);
  }
  runequestroll(roll,target) {
    const critical = Math.max(Math.round(target/20),1);
    const special = Math.round(target/5);
    const fumblerange= Math.round((100-target)/20);
    const fumble = 100-Math.max(fumblerange,0);
    let result;
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
    return result;
  }
  _compareOpposedParryRoll(attackresult,defenseresult) {
    if(attackresult == "critical") {
      switch (defenseresult) {
        case "critical":
          return "special";
        default:
          return "critical";
      }
    }
    if(attackresult == "special") {
      switch (defenseresult) {
        case "critical":
          return "failure";
        case "special":
          return "success";
        default:
          return "special";          
      }
    }
    if(attackresult == "success") {
      switch (defenseresult) {
        case "critical":
        case "special":
        case "success":
          return "failure";
        default:
          return "success";          
      }
    }
    if(attackresult == "failure") {
      switch (defenseresult) {
        case "fumble":
          return "success";
        default:
          return "failure";          
      }
    }
    return "fumble";
  }
}
  