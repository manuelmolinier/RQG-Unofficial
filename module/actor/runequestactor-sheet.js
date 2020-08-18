/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class RunequestActorSheet extends ActorSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["worldbuilding", "sheet", "actor"],
  	  template: "systems/runequest/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
      //this._prepareCharacterFlags(data);
    }

    return data;
  }
  /**
   * Organize and prepare Flags for Character sheets. For testing purpose may set some flags
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
/*
  _prepareCharacterFlags(sheetData) {
    const actorData = sheetData.actor;
    console.log(actorData.flags);
    actorData.flags.runequestspell= {
      "bladesharp": 0,
      "trueweapon": false,
      "strength": 0
    };
  }
*/
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const skills = {
      "agility": [],
      "communication": [],
      "knowledge": [],
      "magic": [],
      "manipulation": [],
      "perception": [],
      "stealth": [],
      "meleeweapons": [],
      "missileweapons": [],
      "shields": [],
      "naturalweapons": [],
      "others": []
    };
    const attacks = {
      "melee": [],
      "missile": [],
      "natural":[]
    }
    const spells = {
      "spirit": [],
      "rune": [],
      "sorcery":[]
    }
    const passions = [];
    const cults = [];
    var hitlocations =[];
    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        if (i.data.skillcategory != undefined) {
          skills[i.data.skillcategory].push(i);
        }
        else {
          skills["others"].push(i);
        }
      }
      else if (i.type === 'meleeattack') {
        attacks["melee"].push(i);
      }
      else if (i.type === 'missileattack') {
        attacks["missile"].push(i);
      }
      else if (i.type === 'naturalattack') {
        attacks["natural"].push(i);
      }
      else if (i.type === 'spiritspell') {
        spells["spirit"].push(i);
      }
      else if (i.type === 'runespell') {
        spells["rune"].push(i);
      }
      else if (i.type === 'sorceryspell') {
        spells["sorcery"].push(i);
      }
      else if (i.type === 'hitlocation') {
        hitlocations.push(i);
      }
      else if (i.type === 'passion') {
        passions.push(i);
      }
      else if (i.type === 'cult') {
        cults.push(i);
      }      
    }
    // Assign and return
    actorData.gear = gear;
    actorData.skills = skills;
    actorData.attacks = attacks;
    actorData.spells = spells;
    actorData.hitlocations = hitlocations;
    actorData.passions = passions;
    actorData.cults = cults;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Roll Characteristics
    html.find('.characteristic-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const row= event.target.parentElement.parentElement;
      const characid = row.dataset["characteristic"];
      const charname = game.i18n.localize(data.data.characteristics[characid].label);
      const target = (data.data.characteristics[characid].value)*5;
      this.basicRoll(charname,target);
    });
    // Roll for Spirit Spells
    html.find('.spiritspell-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const row= event.target.parentElement.parentElement;
      console.log(row);
      const spellname = row.dataset["spellname"];
      const target = (data.data.characteristics.power.value)*5;
      this.basicRoll(spellname,target);
    });
    // Roll for Passions
    html.find('.passion-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const row= event.target.parentElement.parentElement;
      console.log(row);
      const passionname = row.dataset["passionname"];
      const passionid = row.dataset["itemId"];
      const passion = data.actor.passions.find(function(element) {
        return element._id==passionid;
      });
      console.log(passion);
      const target = (passion.data.total);
      this.basicRoll(passionname,target);
    });

    // Roll for Rune Spells
    html.find('.runespell-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const row= event.target.parentElement.parentElement;
      console.log(row);
      const runename = row.dataset["rune"];
      const spellname = row.dataset["spellname"]+" ("+runename+")";
      const rune = this._findrune(data,runename);
      const target = rune.value;
      this.basicRoll(spellname,target);
    });

    html.find('.elementalrunes-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const runerow= event.target.parentElement.parentElement;
      const runeid = runerow.dataset["rune"];
      const charname = game.i18n.localize(data.data.elementalrunes[runeid].label);
      const target = (data.data.elementalrunes[runeid].value);
      this.basicRoll(charname,target);
    });
    html.find('.powerrunes-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const runepairrow= event.target.parentElement.parentElement;
      console.log(runepairrow);
      const pairid = runepairrow.dataset["runepair"];
      console.log(pairid);
      const runerow=event.target; //.parentElement;
      console.log(runerow);
      const runeid=runerow.dataset["rune"];
      console.log(runeid);
      const charname = game.i18n.localize(data.data.powerrunes[pairid][runeid].label);
      const target = (data.data.powerrunes[pairid][runeid].value);
      this.basicRoll(charname,target);
    });
    html.find('.skill-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const catrow = event.target.parentElement.parentElement.parentElement;
      const skillrow = event.target.parentElement.parentElement;
      const categoryid = catrow.dataset["skillcategory"];
      const skillid = skillrow.dataset["itemId"];
      let skillname = skillrow.dataset["skillname"];
      const skill = data.actor.skills[categoryid].find(function(element) {
        return element._id==skillid;
      });
      let catmodifier = data.data.skillcategory[skill.data.skillcategory].modifier;
      let skillvalue = skill.data.total;
      /*
      const dialogoptions = {
        "skillname": skillname,
        "skillvalue": skillvalue,
        "catmodifier": catmodifier
      }
      */
      let dialogOptions = {
        title: "Skill Roll",
        template : "/systems/runequest/templates/chat/skill-dialog.html",
        // Prefilled dialog data

        data : {
          "skillname": skillname,
          "skillvalue": skillvalue,
          "catmodifier": catmodifier
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          skillname =    html.find('[name="skillname"]').val();
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          catmodifier = Number(html.find('[name="catmodifier"]').val());
          skillvalue =   Number(html.find('[name="skillvalue"]').val());
          const target = (skillvalue+catmodifier+testmodifier);
          this.basicRoll(skillname,target);              
        }
      };
      renderTemplate(dialogOptions.template, dialogOptions.data).then(dlg =>
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
    });
    html.find('.meleeattack-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const attackrow = event.target.parentElement.parentElement;
      const categoryid = "meleeweapons";
      const attackid = attackrow.dataset["itemId"];
      const attack = data.actor.attacks["melee"].find(function(element) {
        return element._id==attackid;
      });
      let attackname = attack.name;
      let skillname= attack.data.skillused;
      const skill = data.actor.skills[categoryid].find(function(element) {
        return element.name==skillname;
      });
      let damagebonus = data.data.attributes.damagebonus;
      let catmodifier = data.data.skillcategory[skill.data.skillcategory].modifier;
      let skillvalue = skill.data.total;
      let modifier= attack.data.modifier;
      console.log(data.actor.flags.runequestspell["bladesharp"]);
      if(data.actor.flags.runequestspell["bladesharp"]) {
        modifier = modifier+(data.actor.flags.runequestspell["bladesharp"]*5);
      }
      let dialogOptions = {
        title: "Melee Attack Roll",
        template : "/systems/runequest/templates/chat/meleeattack-dialog.html",
        // Prefilled dialog data

        data : {
          "skillname": skillname,
          "skillvalue": skillvalue,
          "catmodifier": catmodifier,
          "damagebonus": damagebonus
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          skillname =    html.find('[name="skillname"]').val();
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          catmodifier = Number(html.find('[name="catmodifier"]').val());
          skillvalue =   Number(html.find('[name="skillvalue"]').val());
          damagebonus =  html.find('[name="damagebonus"]').val();
          const target = (skillvalue+catmodifier+modifier+testmodifier);
          this.attackRoll(attack,target,damagebonus);
    
        }
      };
      renderTemplate(dialogOptions.template, dialogOptions.data).then(dlg =>
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
    });
    html.find('.naturalattack-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      console.log(data);
      const attackrow = event.target.parentElement.parentElement;
      console.log(attackrow);
      const categoryid = "naturalweapons";
      const attackid = attackrow.dataset["itemId"];
      console.log(attackid);
      const attack = data.actor.attacks["natural"].find(function(element) {
        return element._id==attackid;
      });
      console.log(attack);
      let attackname = attack.name;
      let skillname= attack.data.skillused;
      const skill = data.actor.skills[categoryid].find(function(element) {
        return element.name==skillname;
      });
      let damagebonus = data.data.attributes.damagebonus;
      let catmodifier = data.data.skillcategory[skill.data.skillcategory].modifier;
      let skillvalue = skill.data.total;
      let modifier= attack.data.modifier;
      let dialogOptions = {
        title: "Natural Attack Roll",
        template : "/systems/runequest/templates/chat/meleeattack-dialog.html",
        // Prefilled dialog data

        data : {
          "skillname": skillname,
          "skillvalue": skillvalue,
          "catmodifier": catmodifier,
          "damagebonus": damagebonus
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          skillname =    html.find('[name="skillname"]').val();
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          catmodifier = Number(html.find('[name="catmodifier"]').val());
          skillvalue =   Number(html.find('[name="skillvalue"]').val());
          damagebonus =  html.find('[name="damagebonus"]').val();
          const target = (skillvalue+catmodifier+modifier+testmodifier);
          this.attackRoll(attack,target,damagebonus);
    
        }
      };
      renderTemplate(dialogOptions.template, dialogOptions.data).then(dlg =>
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
    });
    html.find('.missileattack-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      console.log(data);
      const attackrow = event.target.parentElement.parentElement;
      console.log(attackrow);
      const categoryid = "missileweapons";
      const attackid = attackrow.dataset["itemId"];
      console.log(attackid);
      const attack = data.actor.attacks["missile"].find(function(element) {
        return element._id==attackid;
      });
      console.log(attack);
      let attackname = attack.name;
      let skillname= attack.data.skillused;
      const skill = data.actor.skills[categoryid].find(function(element) {
        return element.name==skillname;
      });
      let damagebonus = data.data.attributes.damagebonus;
      let catmodifier = data.data.skillcategory[skill.data.skillcategory].modifier;
      let skillvalue = skill.data.total;
      let modifier= attack.data.modifier;

      let dialogOptions = {
        title: "Missile Attack Roll",
        template : "/systems/runequest/templates/chat/meleeattack-dialog.html",
        // Prefilled dialog data

        data : {
          "skillname": skillname,
          "skillvalue": skillvalue,
          "catmodifier": catmodifier,
          "damagebonus": damagebonus
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          skillname =    html.find('[name="skillname"]').val();
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          catmodifier = Number(html.find('[name="catmodifier"]').val());
          skillvalue =   Number(html.find('[name="skillvalue"]').val());
          damagebonus =  html.find('[name="damagebonus"]').val();
          const target = (skillvalue+catmodifier+modifier);
          this.missileattackRoll(attack,target,damagebonus);
        }
      };
      renderTemplate(dialogOptions.template, dialogOptions.data).then(dlg =>
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
    });
    html.find('.experiencecheck').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      const skillrow = event.target.parentElement;
      const skillid = skillrow.dataset["itemId"];
      const skillname = skillrow.dataset["skillname"];
      console.log(this.object.getOwnedItem(skillid));
      const skill = this.object.getOwnedItem(skillid);
      console.log(skill);
      if(skill.data.data.experience){
        skill.data.data.experience = false;
      }
      else {
        skill.data.data.experience = true;
      }
    });
  }
  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    console.log(itemData);
    return this.actor.createOwnedItem(itemData);
  }


  async basicRoll(charname, target) {
    const critical = Math.max(Math.round(target/20),1);
    const special = Math.round(target/5);
    const fumblerange= Math.round((100-target)/20);
    const fumble = 100-Math.max(fumblerange,0);
    let roll;
    roll = new Roll("1d100").roll();
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
    
    console.log(this.object.data);


    const templateData = {
      actor: this.actor,
      item: this.object.data,
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

  attackRoll(attack, target,damagebonus) {
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
    this.htmldamageroll(roll,target,result,attack,damagebonus);
  }
  damageroll(roll,target,result,attack,damagebonus) {
    let content;
    console.log(attack);
    let damageroll = new Roll(attack.data.damage);
    let damagebonusroll = new Roll(damagebonus);

    if(result=="fumble" || result == "failure") {
      content = `rolling ${attack.name}: ${roll.toMessage()} vs ${target} - ${result}`;
    }
    else if( result== "success") {
      damageroll.roll();
      damagebonusroll.roll();
      content= `rolling - ${attack.name}: ${roll.toMessage()} vs ${target} - ${result} - Damage: ${damageroll.total+damagebonusroll.total} (${damageroll.result}+${damagebonusroll.result})`
    }
    else {
      let totaldamage;
      switch (attack.data.specialtype) {
        case "I":
        case "S":
          damageroll.alter(0,2);
          damageroll.roll();
          damagebonusroll.roll();
          console.log(damageroll);
          console.log(damagebonusroll);
          if(result=="special") {
            totaldamage=damageroll.total+damagebonusroll.total;
            content= `rolling - ${attack.name}: ${roll.toMessage()} vs ${target} - ${result} - Damage: ${totaldamage} (${damageroll.result}+${damagebonusroll.result})`;
          }
          else {
            totaldamage = Roll.maximize(damageroll.formula).total+damagebonusroll.total;
            content= `rolling - ${attack.name}: ${roll.toMessage()} vs ${target} - ${result} - Damage: ${totaldamage} (${Roll.maximize(damageroll.formula).result}+${damagebonusroll.result})`;
          }
          break;
        case "C":
        default:
          damageroll.roll();
          damagebonusroll.roll();
          if(result=="special") {
            totaldamage=damageroll.total+damagebonusroll.total+Roll.maximize(damagebonusroll.formula).total;
            content= `rolling - ${attack.name}: ${roll.toMessage()} vs ${target} - ${result} - Damage: ${totaldamage} (${damageroll.result}+${damagebonusroll.result}+${Roll.maximize(damagebonusroll.formula).result})`;
          }
          else {
            totaldamage = Roll.maximize(damageroll.formula).total+damagebonusroll.total+Roll.maximize(damagebonusroll.formula).total;
            content= `rolling - ${attack.name}: ${roll.toMessage()} vs ${target} - ${result} - Damage: ${totaldamage} (${Roll.maximize(damageroll.formula).result}+${damagebonusroll.result})+${Roll.maximize(damagebonusroll.formula).result})`;
          }
          break;
      }
    }
    ChatMessage.create({
      user: game.user._id,
      speaker: this.getData(),
      content: content
    });
    let hitlocationtable = RollTables.instance.getName("Hit Location - Humanoid");
    console.log(hitlocationtable);
    let hitlocation = hitlocationtable.roll();
    console.log(hitlocation);
    hitlocationtable.draw(hitlocation,true);
    //hitlocationtable.toMessage(hitlocation.results);
  }  
  missileattackRoll(attack, target,damagebonus) {
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
    this.missiledamageroll(roll,target,result,attack,damagebonus);
  }
  missiledamageroll(roll,target,result,attack,damagebonus) {
    let content;
    console.log(attack);
    let damageroll = new Roll(attack.data.damage);
    let damagebonusroll;
    if(attack.data.db) {
      damagebonusroll = new Roll(damagebonus);
    }
    else {
      damagebonusroll = new Roll("0");
    }
    console.log(damagebonusroll);
    if(result=="fumble" || result == "failure") {
      content = `rolling ${attack.name}: ${roll.total} vs ${target} - ${result}`;
    }
    else if( result== "success") {
      damageroll.roll();
      damagebonusroll.roll();
      content= `rolling - ${attack.name}: ${roll.total} vs ${target} - ${result} - Damage: ${damageroll.total+Math.ceil(damagebonusroll.total/2)}`
    }
    else {
      let totaldamage;
      switch (attack.data.specialtype) {
        case "I":
        case "S":
          damageroll.alter(0,2);
          damageroll.roll();
          damagebonusroll.roll();
          if(result=="special") {
            totaldamage=damageroll.total+Math.ceil(damagebonusroll.total/2);
            content= `rolling - ${attack.name}: ${roll.total} vs ${target} - ${result} - Damage: ${totaldamage}`;
          }
          else {
            totaldamage = Roll.maximize(damageroll.formula).total+Math.ceil(damagebonusroll.total/2);
            content= `rolling - ${attack.name}: ${roll.total} vs ${target} - ${result} - Damage: ${totaldamage}`;
          }
          break;
        case "C":
        default:
          damageroll.roll();
          damagebonusroll.roll();
          if(result=="special") {
            totaldamage=damageroll.total+Math.ceil(damagebonusroll.total/2)+Math.ceil(Roll.maximize(damagebonusroll.formula).total/2);
            content= `rolling - ${attack.name}: ${roll.total} vs ${target} - ${result} - Damage: ${totaldamage}`;
          }
          else {
            totaldamage = Roll.maximize(damageroll.formula).total+Math.ceil(damagebonusroll.total/2)+Math.ceil(Roll.maximize(damagebonusroll.formula).total/2);
            content= `rolling - ${attack.name}: ${roll.total} vs ${target} - ${result} - Damage: ${totaldamage}`;
          }
          break;
      }
    }
    ChatMessage.create({
      user: game.user._id,
      speaker: this.getData(),
      content: content
    });
    let hitlocationtable = RollTables.instance.getName("Hit Location - Humanoid");
    console.log(hitlocationtable);
    let hitlocation = hitlocationtable.roll();
    console.log(hitlocation);
    hitlocationtable.toMessage(hitlocation.results);
  }
  _findrune(data,runename) {
    if(typeof data.data.elementalrunes[runename] != 'undefined') {
      return data.data.elementalrunes[runename];
    }
    else {
      console.log(data.data.powerrunes);
      for (let rp in data.data.powerrunes) {
        if(typeof data.data.powerrunes[rp][runename] != 'undefined') {
          return data.data.powerrunes[rp][runename];
        }        
      }
      console.log("Rune not found - default to air");
      return data.data.elementalrunes.air;  
    }
  }  
  async betterdamageroll(roll,target,result,attack,damagebonus) {
    //const itemData = this.data.data;
    const actorData = this.actor.data.data;
    const flags = this.actor.data.flags || {};
    //console.log(itemData);
    console.log(attack);
    console.log(flags);
    let attackcontent;
    let damagecontent;
    let damageData = this.getdamagedata(attack,damagebonus);
    let totaldamage=0;
    let dmgcontent;
    let dmgbonuscontent;
    let damagechatData = {speaker: ChatMessage.getSpeaker({actor: this.actor}),flavor: "Weapon Damage",rollMode: game.settings.get("core", "rollMode")};
    let damagebonuschatData = {speaker: ChatMessage.getSpeaker({actor: this.actor}),flavor: "Damage Bonus",rollMode: game.settings.get("core", "rollMode")};

    let rollMode = game.settings.get("core", "rollMode");
    if( result== "success") {
      damageData.damage.roll();
      damageData.damagebonus.roll();
      totaldamage = damageData.damage.total+ damageData.damagebonus.total;
      dmgcontent= await damageData.damage.toMessage(damagechatData,rollMode,false);
      dmgbonuscontent= await damageData.damagebonus.toMessage(damagebonuschatData,rollMode,false);
    }
    else if(result=="special") {  
      damageData.specialdamage.roll();
      damageData.damagebonus.roll();
      totaldamage = damageData.specialdamage.total + damageData.damagebonus.total;
      dmgcontent= await damageData.specialdamage.toMessage(damagechatData,rollMode,false);
      dmgbonuscontent= await damageData.damagebonus.toMessage(damagebonuschatData,rollMode,false);
    }
    else if(result=="critical") {
      damageData.damagebonus.roll();
      totaldamage = damageData.criticaldamage.total + damageData.damagebonus.total;
      dmgcontent= await damageData.criticaldamage.toMessage(damagechatData,rollMode,false);
      dmgbonuscontent= await damageData.damagebonus.toMessage(damagebonuschatData,rollMode,false);
    }
    attackcontent = `${attack.name} - skill: ${attack.data.skillused} - ${target}%`;
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      flavor: attackcontent,
      rollMode: game.settings.get("core", "rollMode")
    });
    console.log(dmgcontent);
    console.log(dmgbonuscontent);
    if (result != "failure" && result != "fumble") {
      damagecontent = `${attack.name} - ${result}`;
      damagecontent = damagecontent + ` - damage: ${dmgcontent.data.content} + ${dmgbonuscontent.data.content} - total: ${totaldamage}`;
      ChatMessage.create({
        user: game.user._id,
        speaker: this.getData(),
        content: damagecontent
      });  
    }
    let hitlocationtable = RollTables.instance.getName("Hit Location - Humanoid");
    console.log(hitlocationtable);
    let hitlocation = hitlocationtable.roll();
    console.log(hitlocation);
    hitlocationtable.draw(hitlocation,true);
    //hitlocationtable.toMessage(hitlocation.results);
  }  
  getdamagedata(attack,damagebonus) {
    let damageData={
      damagebonus: new Roll(damagebonus),
      damage: new Roll(attack.data.damage)
    }
    switch (attack.data.specialtype) {
      case "I":
      case "S":
        let specialroll= new Roll(damageData.damage.formula);
        specialroll=specialroll.alter(2,0);
        damageData.specialdamage= new Roll(specialroll.formula);
        damageData.criticaldamage = Roll.maximize(damageData.specialdamage.formula);
        break;
      case "C":
      default:
        damageData.specialdamage= new Roll(attack.data.damage+"+"+Roll.maximize(damageData.damagebonus.formula).total);
        damageData.criticaldamage = Roll.maximize(damageData.specialdamage.formula);
        break;
    }
    console.log(damageData);
    return damageData;
  }
  async htmldamageroll(roll,target,result,attack,damagebonus) {
    //const itemData = this.data.data;
    const actorData = this.actor.data.data;
    const flags = this.actor.data.flags || {};
    //console.log(itemData);
    console.log(attack);
    console.log(flags);
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
      damageData.damagebonus.roll();
      damageData.totaldamage = damageData.criticaldamage.total + damageData.damagebonus.total;
    }
    let hitlocationtable = RollTables.instance.getName("Hit Location - Humanoid");
    console.log(hitlocationtable);
    let hitlocation = hitlocationtable.roll();
    console.log(hitlocation);

    const templateData = {
      actor: this.actor,
      item: this.object.data,
      attack: attack,
      target: target,
      roll: roll,
      result: result,
      damageData: damageData,
      hitlocation: hitlocation.results[0].text
    };

    // Render the chat card template
    
    const template = `systems/runequest/templates/chat/attack-card.html`;
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
    console.log(game.settings);
    // Toggle default roll mode
    //let rollMode = game.settings.get("core", "rollMode");
    //if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    //if ( rollMode === "blindroll" ) chatData["blind"] = true;

    // Create the chat message

    ChatMessage.create(chatData);
  }  

}
