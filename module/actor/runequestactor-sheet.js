import {RQG} from '../config.js';

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
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "summary"}]
    });
  }

  /* -------------------------------------------- */

  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    console.log("getData() starting");
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.actor.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    // Commented until new Active effects are added
    //context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /** @override */
  /**
  getData(options) {
    console.log("getData(options) started");
    const data = super.getData(options);
    const actorData = data.data;
    data.dtypes = ["String", "Number", "Boolean"];
    data.config = CONFIG.RQG;
    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
      //this._prepareCharacterFlags(data);
    }
    data.actor = actorData;
    data.data = actorData.data;
    return data;
  }
   */
  /**
   * Organize and prepare Flags for Character sheets. For testing purpose may set some flags
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
   _prepareCharacterData(context) {
  }

  /**
 * Organize and classify Items for Character sheets.
 *
 * @param {Object} actorData The actor to prepare.
 *
 * @return {undefined}
 */
  _prepareItems(context) {
    /*
    // Initialize containers.
    const gear = [];
    const defense = [];
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
    const mpstorage = [];
    var hitlocations =[];
    let totalwounds = 0;
    const features = [];
    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.data.spellLevel != undefined) {
          spells[i.data.spellLevel].push(i);
        }
      }
      // Append to skills.
      else if (i.type === 'skill') {
        this._prepareSkill(i); // To be removed once fix is found
        if (i.data.skillcategory != undefined) {
          if(i.data.skillcategory == "shields"){
            defense.push(i);
          }
          if(i.data.name == "Dodge") {
            i.data.base=context.data.characteristics.dexterity.value*2;
            this._prepareSkill(i);
            defense.push(i);
          }
          if(i.data.name == "Jump") {
            i.data.base=context.data.characteristics.dexterity.value*3;
            this._prepareSkill(i);
          }
          skills[i.data.skillcategory].push(i);          
        }
        else {
          skills["others"].push(i);
        }
      }
      else if (i.type === 'attack') {
        attacks[i.data.attacktype].push(i);
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
        //update hitlocation
        this._preparehitlocation(i,context);
        totalwounds+= Number(i.data.wounds);
        hitlocations.push(i);
      }
      else if (i.type === 'passion') {
        this._preparePassion(i);
        passions.push(i);
      }
      else if (i.type === 'cult') {
        cults.push(i);
      }
      else if(i.type === 'mpstorage') {
        mpstorage.push(i);
      }        
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.skills = skills;
    context.gear = gear;
    context.skills = skills;
    context.attacks = attacks;
    context.spells = spells;
    context.hitlocations = hitlocations;
    context.passions = passions;
    context.cults = cults;
    context.defense = defense;
    context.mpstorage = mpstorage;
    context.data.attributes.hitpoints.value = context.data.attributes.hitpoints.max - totalwounds;
    */
  }
  

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
    const defense = [];
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
    const mpstorage = [];
    var hitlocations =[];
    let totalwounds = 0;
    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    console.log(actorData);
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        this._prepareSkill(i); // To be removed once fix is found
        if (i.data.skillcategory != undefined) {
          if(i.data.skillcategory == "shields"){
            defense.push(i);
          }
          if(i.data.name == "Dodge") {
            i.data.base=actorData.data.data.characteristics.dexterity.value*2;
            this._prepareSkill(i);
            defense.push(i);
          }
          if(i.data.name == "Jump") {
            i.data.base=actorData.data.data.characteristics.dexterity.value*3;
            this._prepareSkill(i);
          }
          skills[i.data.skillcategory].push(i);          
        }
        else {
          skills["others"].push(i);
        }
      }
      else if (i.type === 'attack') {
        attacks[i.data.attacktype].push(i);
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
        //update hitlocation
        this._preparehitlocation(i,actorData);
        totalwounds+= Number(i.data.wounds);
        hitlocations.push(i);
      }
      else if (i.type === 'passion') {
        this._preparePassion(i);
        passions.push(i);
      }
      else if (i.type === 'cult') {
        cults.push(i);
      }
      else if(i.type === 'mpstorage') {
        mpstorage.push(i);
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
    actorData.defense = defense;
    actorData.mpstorage = mpstorage;
    actorData.data.data.attributes.hitpoints.value = actorData.data.data.attributes.hitpoints.max - totalwounds;
    actorData.data.gear = gear;
    actorData.data.skills = skills;
    actorData.data.attacks = attacks;
    actorData.data.spells = spells;
    actorData.data.hitlocations = hitlocations;
    actorData.data.passions = passions;
    actorData.data.cults = cults;
    actorData.data.defense = defense;
    actorData.data.mpstorage = mpstorage;
    actorData.data.data.attributes.hitpoints.value = actorData.data.data.attributes.hitpoints.max - totalwounds;
    console.log("ActorSheet - Prepare Items");
    console.log(actorData);
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
      if(event.button == 0) {}
      else {return;}
      const row= event.target.parentElement.parentElement;
      const characid = row.dataset["characteristic"];
      let charname = game.i18n.localize(data.data.characteristics[characid].label);
      let charvalue= data.data.characteristics[characid].value;
      let difficultymultiplier = 5;
      let dialogOptions = {
        title: "Passion Roll",
        template : "/systems/runequest/templates/chat/char-dialog.html",
        'z-index': 100,
        // Prefilled dialog data

        data : {
          "charname": charname,
          "charvalue": charvalue,
          "difficultymultiplier": difficultymultiplier
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          charname =    html.find('[name="charname"]').val();
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          difficultymultiplier = Number(html.find('[name="difficultymultiplier"]').val());
          charvalue =   Number(html.find('[name="charvalue"]').val());
          const target = (charvalue*difficultymultiplier+testmodifier);
          this.basicRoll(charname,target);              
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
    // Roll for Spirit Spells
    html.find('.spiritspell-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      if(event.button == 0) {}
      else {return;}      
      const row= event.target.parentElement.parentElement;
      const spellname = row.dataset["spellname"];
      const target = (data.data.characteristics.power.value)*5;
      this.basicRoll(spellname,target);
    });
    // Roll for Passions
    html.find('.passion-roll-old').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      if(event.button == 0) {}
      else {return;}      
      const row= event.target.parentElement.parentElement;
      console.log(row);
      let passionname = row.dataset["passionname"];
      const passionid = row.dataset["itemId"];
      console.log("passionname:"+passionname+" - passionid:"+passionid);
      const passion = this.actor.getOwnedItem(passionid);
      console.log(passion);
      let dialogOptions = {
        title: "Passion Roll",
        template : "/systems/runequest/templates/chat/skill-dialog.html",
        'z-index': 100,
        // Prefilled dialog data

        data : {
          "skillname": passionname,
          "skillvalue": passion.data.data.total,
          "catmodifier": 0
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          passionname =    html.find('[name="skillname"]').val();
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          let catmodifier = Number(html.find('[name="catmodifier"]').val());
          let skillvalue =   Number(html.find('[name="skillvalue"]').val());
          const target = (skillvalue+catmodifier+testmodifier);
          this.basicRoll(passionname,target);              
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
    html.find('.passion-roll').mousedown(event => this._onPassionRoll(event));
    // Roll for Rune Spells
    html.find('.runespell-roll').mousedown(event => {
      console.log("casting a runespell");
      console.log(event);
      console.log(event.button);
      event.preventDefault();
      const data = this.getData();
      if(event.button == 0) {}
      else {return;}
      const row= event.target.parentElement.parentElement;
      const runename = row.dataset["rune"];
      console.log(runename);
      const spellname = row.dataset["spellname"]+" ("+runename+")";
      const rune = this._findrune(data,runename);
      const target = rune.value;
      this.basicRoll(spellname,target);
    });

    html.find('.elementalrunes-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData().data;
      console.log(data);
      if(event.button == 0) {}
      else {return;}
      const runerow= event.target.parentElement.parentElement;
      const runeid = runerow.dataset["rune"];
      const charname = game.i18n.localize(data.elementalrunes[runeid].label);
      const target = (data.elementalrunes[runeid].value);
      this.basicRoll(charname,target);
    });
    html.find('.powerrunes-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      if(event.button == 0) {}
      else {return;}      
      const runepairrow= event.target.parentElement.parentElement;
      const pairid = runepairrow.dataset["runepair"];
      const runerow=event.target; //.parentElement;
      const runeid=runerow.dataset["rune"];
      const charname = game.i18n.localize(data.data.powerrunes[pairid][runeid].label);
      const target = (data.data.powerrunes[pairid][runeid].value);
      this.basicRoll(charname,target);
    });
    html.find('.skill-roll').mousedown(event => this._onSkillRoll(event));
    html.find('.meleeattack-roll').mousedown(event => {
      event.preventDefault();
      const data = this.getData();
      if(event.button == 0) {}
      else {return;}
      const attackrow = event.target.parentElement.parentElement;
      const categoryid = "meleeweapons";
      const attackid = attackrow.dataset["itemId"];
      const attack = data.actor.attacks["melee"].find(function(element) {
        return element._id==attackid;
      });
      let attackname = attack.name;
      // Find the appropriate skillname
      let skillname= game.i18n.localize(RQG.weaponskills[attack.data.skillused]);
      const skill = data.actor.skills[categoryid].find(function(element) {
        return element.name==skillname;
      });
      let damagebonus = data.data.attributes.damagebonus;
      let catmodifier = data.data.skillcategory[skill.data.skillcategory].modifier;
      let skillvalue = skill.data.total;
      let modifier= attack.data.modifier;
      if(data.actor.flags.runequestspell["bladesharp"]) {
        modifier = modifier+(data.actor.flags.runequestspell["bladesharp"]*5);
      }
      let dialogOptions = {
        title: "Melee Attack Rolls",
        template : "/systems/runequest/templates/chat/meleeattack-dialog.html",
        'z-index': 100,
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
      if(event.button == 0) {}
      else {return;}
      const attackrow = event.target.parentElement.parentElement;
      const categoryid = "naturalweapons";
      const attackid = attackrow.dataset["itemId"];
      const attack = data.actor.attacks["natural"].find(function(element) {
        return element._id==attackid;
      });
      let attackname = attack.name;
      let skillname= game.i18n.localize(RQG.weaponskills[attack.data.skillused]);
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
        'z-index': 100,
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
      if(event.button == 0) {}
      else {return;}
      const attackrow = event.target.parentElement.parentElement;
      const categoryid = "missileweapons";
      const attackid = attackrow.dataset["itemId"];
      const attack = data.actor.attacks["missile"].find(function(element) {
        return element._id==attackid;
      });
      let attackname = attack.name;
      let skillname= game.i18n.localize(RQG.weaponskills[attack.data.skillused]);
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
        'z-index': 100,
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
      if(event.button == 0) {}
      else {return;}
      const skillrow = event.target.parentElement;
      const skillid = skillrow.dataset["itemId"];
      const skillname = skillrow.dataset["skillname"];
      const skill = this.object.getOwnedItem(skillid);
      if(skill.data.data.experience){
        skill.data.data.experience = false;
      }
      else {
        skill.data.data.experience = true;
      }
    });
    html.find('.summary-skill-roll').mousedown(event => this._onSkillRoll(event));
    html.find('.summary-characteristic-roll').click(event => this._onCharacteristicRoll(event));
    html.find('.attack-roll').click(event => this._onAttackRoll(event)); 
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
    return this.actor.createOwnedItem(itemData);
  }

  _onAttackRoll(event) {
    event.preventDefault();
    const data = this.getData();
    console.log("starting _onAttackRoll");
    console.log(data.data);
    if(event.button == 0) {}
    else {return;}
    const attackrow = event.target.parentElement.parentElement;
    const attackid = attackrow.dataset["itemId"];
    if(!attackid) {
      let dialogOptions = {
        title: "Attack Roll",
        template : "/systems/runequest/templates/chat/attack-dialog.html",
        'z-index': 100,
        // Prefilled dialog data

        data : {
          "attacks": data.data.attacks,
          "data": data.data
        },
        callback : (html) => {
          // When dialog confirmed, fill testData dialog information
          // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
          let attackid = html.find('[name="attackname"]').val();
          let testmodifier =   Number(html.find('[name="testmodifier"]').val());
          let attack = this.actor.getOwnedItem(attackid);
          let testData = {"testmodifier":testmodifier};
          console.log("_onAttackRoll-attack");
          console.log(attack);
          attack.roll(testData);
          //this.genericAttackRoll(attack);
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
                label: game.i18n.localize("RQG.Roll"),
                callback: html => dialogOptions.callback(html)
              }
            },
            default: "rollButton"
          }).render(true);
        });
    }
    else {
      let attack = this.actor.getOwnedItem(attackid);
      console.log("_onAttackRoll-attack");
      console.log(attack);
      attack.roll();      
    }      
  }
  _onCharacteristicRoll(event) {
    event.preventDefault();
    const characid = event.currentTarget.closest(".characteristic").dataset.characteristicId;
    const data = this.getData();
    if(event.button == 0) {}
    else {return;}
    const row= event.target.parentElement.parentElement;
    let charname = game.i18n.localize(data.data.characteristics[characid].label);
    let charvalue= data.data.characteristics[characid].value;
    let difficultymultiplier = 5;
    let dialogOptions = {
      title: "Characteristic Roll",
      template : "/systems/runequest/templates/chat/char-dialog.html",
      'z-index': 100,
      // Prefilled dialog data

      data : {
        "charname": charname,
        "charvalue": charvalue,
        "difficultymultiplier": difficultymultiplier
      },
      callback : (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
        charname =    html.find('[name="charname"]').val();
        let testmodifier =   Number(html.find('[name="testmodifier"]').val());
        difficultymultiplier = Number(html.find('[name="difficultymultiplier"]').val());
        charvalue =   Number(html.find('[name="charvalue"]').val());
        const target = (charvalue*difficultymultiplier+testmodifier);
        this.basicRoll(charname,target);              
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

    //return item.roll();    
  }
  _onSkillRoll(event) {
    event.preventDefault();
    const data = this.getData();
    console.log(event);
    if(event.button == 0) {
      if(event.ctrlKey == true){
        const skillid = event.currentTarget.dataset.itemid;
        let skill = this.actor.getOwnedItem(skillid);
        console.log(skill)
        skill.gainroll();
        return;
      }
    }
    else if(event.button == 2) {
      if(event.altKey == true){
        this.actor.deleteOwnedItem(event.currentTarget.dataset.itemid);
        return;
      }
      const item = this.actor.getOwnedItem(event.currentTarget.dataset.itemid);
      item.sheet.render(true);
      return;
    }
    else {return;}
    //const catrow = event.target.parentElement.parentElement.parentElement;
    const skillid = event.currentTarget.dataset.itemid;
    let skill = this.actor.getOwnedItem(skillid);
    console.log("_onSkillRoll");
    console.log(skill);
    skill.roll();       
  }
  _onPassionRoll(event) {
    event.preventDefault();
    const data = this.getData();
    console.log(event);
    if(event.button == 0) {
      if(event.ctrlKey == true){
        const passionid = event.currentTarget.dataset.itemId;
        let passion = this.actor.getOwnedItem(passionid);
        console.log(passion)
        passion.gainroll();
        return;
      }
    }
    else if(event.button == 2) {
      if(event.altKey == true){
        this.actor.deleteOwnedItem(event.currentTarget.dataset.itemid);
        return;
      }
      const item = this.actor.getOwnedItem(event.currentTarget.dataset.itemid);
      item.sheet.render(true);
      return;
    }
    else {return;}
    //const catrow = event.target.parentElement.parentElement.parentElement;
    const passionid = event.currentTarget.dataset.itemId;
    let passion = this.actor.getOwnedItem(passionid);
    console.log("_onPassionRoll");
    console.log(passion);
    passion.roll();       
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
  async gainRoll(charname, target) {
    const critical = Math.max(Math.round(target/20),1);
    const special = Math.round(target/5);
    const fumblerange= Math.round((100-target)/20);
    const fumble = 100-Math.max(fumblerange,0);
    let roll;
    roll = new Roll("1d100").roll();
    let result;

    if((roll.total < 96 && roll.total <= target) || roll.total <= 5) { //This is a success we check type of success
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
    /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  _onItemRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);
    return item.roll();
  }

  genericAttackRoll(attack) {
    const data = this.getData();
    let categoryid = attack.data.data.attacktype+"weapons"
    const skillname = game.i18n.localize(RQG.weaponskills[attack.data.data.skillused]);
    const damagebonus = attack.options.actor.data.data.attributes.damagebonus;
    const skillused = data.actor.skills[categoryid].find(function(element) {
      return element.name==skillname;
    });
    const categorymod = attack.options.actor.data.data.skillcategory[categoryid].modifier;
    let target= skillused.data.total+categorymod;
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
    this.htmldamageroll(roll,target,result,attack,damagebonus);
  }
  _findrune(data,runename) {
    if(typeof data.data.elementalrunes[runename] != 'undefined') {
      return data.data.elementalrunes[runename];
    }
    else {
      for (let rp in data.data.powerrunes) {
        if(typeof data.data.powerrunes[rp][runename] != 'undefined') {
          return data.data.powerrunes[rp][runename];
        }        
      }
      return data.data.elementalrunes.air;  
    }
  }  
  async _updateObject(event, formData) {
    console.log("_updateObjet");
    console.log(event);
    console.log(formData);
    const actor = this.getData().actor
    const skills = actor.data.data.skills;
    const hitLocations = actor.data.data.hitlocations;
    if (event.target) {
      console.log(event.currentTarget.classList);
      if( event.currentTarget.classList){
        console.log(event.currentTarget.classList);
        if(event.currentTarget.classList.contains('hitloc-wounds')){
          console.log(event.currentTarget.closest('.item').dataset);
					let hl = this.actor.items.get( event.currentTarget.closest('.item').dataset.itemid);
          console.log(hl);
          
          if(hl){
            const value = event.currentTarget.value? parseInt(event.currentTarget.value) : null;
            console.log("value:"+value);
            console.log("name:"+event.currentTarget.name);
            if( !event.currentTarget.value) {
              await hl.update( {[event.currentTarget.name]: null});
            }
            else if( !isNaN(value)) {
               await hl.update( {[event.currentTarget.name]: value});           
						}
            console.log(hl);
          }        
        }
        if(event.currentTarget.classList.contains('mpstorage-current')) {
          console.log(event.currentTarget.closest('.item').dataset);
					let mpstorage = this.actor.items.get( event.currentTarget.closest('.item').dataset.itemId);
          console.log(mpstorage);
          if(mpstorage){
            const value = event.currentTarget.value? parseInt(event.currentTarget.value) : null;
            console.log("value:"+value);
            console.log("name:"+event.currentTarget.name);
            if( !event.currentTarget.value) {
              await mpstorage.update( {[event.currentTarget.name]: null});
            }
            else if( !isNaN(value)) {
               await mpstorage.update( {[event.currentTarget.name]: value});           
						}
            console.log(mpstorage);
          }
        }
        if(event.currentTarget.classList.contains('mpstorage-equiped')) {
          console.log(event.currentTarget.closest('.item').dataset);
					let mpstorage = this.actor.items.get( event.currentTarget.closest('.item').dataset.itemId);
          console.log(mpstorage);
          console.log(event.currentTarget.value);
          if(mpstorage){
            const value = event.currentTarget.checked? true : false;
            console.log("value:"+value);
            console.log("name:"+event.currentTarget.name);
            await mpstorage.update( {[event.currentTarget.name]: value});           
            console.log(mpstorage);
          }
        }
        if(event.currentTarget.classList.contains('skill-experience')) {
          console.log(event.currentTarget.closest('.item').dataset);
					let skill = this.actor.items.get( event.currentTarget.closest('.item').dataset.itemid);
          console.log(skill);
          console.log(event.currentTarget.value);
          if(skill){
            const value = event.currentTarget.checked? true : false;
            console.log("value:"+value);
            console.log("name:"+event.currentTarget.name);
            await skill.update( {[event.currentTarget.name]: value});           
            console.log(skill);
          }
        }                 
      }
    }
    return this.object.update(formData);
  }
  _prepareSkill(skill) {
    skill.data.total=skill.data.base+skill.data.increase;
  }
  _preparePassion(passion) {
    passion.data.total=passion.data.base+passion.data.increase+passion.data.modifier;
  }
  _preparehitlocation(hitlocation, actorData) {
    // Prepare the HitLocations by calculating the Max HP of the location and the remaining HP based on wounds
    let humanoidlocations={
      "RQG.HEAD": 5,
      "RQG.LARM": 4,
      "RQG.RARM": 4,
      "RQG.CHEST": 6,
      "RQG.ABDOMEN": 5,
      "RQG.LLEG": 5,
      "RQG.RLEG": 5
    };
    hitlocation.data.maxhp = humanoidlocations[hitlocation.name] + actorData.data.attributes.hpmodifier;
    hitlocation.data.currenthp = hitlocation.data.maxhp - hitlocation.data.wounds;
  }
}
