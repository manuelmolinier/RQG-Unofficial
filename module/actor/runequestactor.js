/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class RunequestActor extends Actor {

  /** @override */

  static async create(data, options) {

    // Case of compendium global import
    if (data instanceof Array) {
      return super.create(data, options);
    }
    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
    if (data.items) {
      let actor = super.create(data, options);
      return actor;
    }
    // We don't prefill skills for NPCs
    if(data.type == 'character') {
      const competences = await this.loadCompendium("runequest.skills");
      data.items = competences.map(i => i.toObject());
    }
    return super.create(data, options);
  }

  getRollData() {
    const data = super.getRollData();
    const shorthand = game.settings.get("Runequest", "macroShorthand");

    // Re-map all attributes onto the base roll data
    if ( !!shorthand ) {
      for ( let [k, v] of Object.entries(data.attributes) ) {
        if ( !(k in data) ) data[k] = v.value;
      }
      //delete data.attributes;
    }
    // Map all items data using their slugified names
    data.items = this.data.items.reduce((obj, i) => {
      let key = i.name.slugify({strict: true});
      let itemData = duplicate(i.data);
      /*
      if ( !!shorthand ) {
        for ( let [k, v] of Object.entries(itemData.attributes) ) {
          if ( !(k in itemData) ) itemData[k] = v.value;
        }
        delete itemData["attributes"];
      }*/
      obj[key] = itemData;
      return obj;
    }, {});
    return data;
  }

  prepareData() {
    super.prepareData();
    const  actorData = this.data;
    const  data = actorData.data;
    this._prepareCharacterFlags(actorData);
    for (const [index, charac] of Object.entries(data.characteristics)) {
      const characid=charac.label;
      let modifier= Number(charac.modifier);
      const characvalue=Number(charac.base)+modifier;
      data.characteristics[index].value=characvalue;
      //data.defense.value = Number(attr.agility.value)+Number(attr.dodge.value);    
    }
    this._prepareattributes(data);
    this._prepareskillcategoriesmodifier(data);
    if(actorData.type == 'character') {
      this.prepareItems();
    }
    else {
      this.prepareNPCItems();
    }
    if(!data['data.flags.locked']) {
      data['data.flags.locked'] = true;
    }
  }

  prepareDerivedData(){
    super.prepareDerivedData();
  }

  _prepareCharacterFlags(sheetData) {
    sheetData.flags.runequestspell= {
      "bladesharp": 0,
      "trueweapon": false,
      "strength": 0
    };
  }
  // Prepare character items
  prepareItems(){
    let actor = this;
    let context = this.data;
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
      "spiritweapons": [],
      "others": []
    };
    const runes = {
      "elemental": [],
      "power": [],
      "form": [],
      "condition": [],
      "others": []
    };
    const attacks = {
      "melee": [],
      "missile": [],
      "natural":[],
      "spirit": []
    }
    const spells = {
      "spirit": [],
      "rune": [],
      "sorcery":[]
    }
    const passions = [];
    const cults = [];
    const mpstorage = [];
    var armors = [];
    var hitlocations =[];
    let totalwounds = 0;
    let magicpointreservemax =0;
    let magicpointreservecurrent =0;
    const familyhistory=[];

    const features = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      if (i.type === 'armor') {
        armors.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        this.prepareSkill(i); // To be removed once fix is found
        if (i.data.data.skillcategory != undefined) {
          if(i.data.data.skillcategory == "shields"){
            defense.push(i);
          }
          if(i.data.name == "Dodge") {
            i.data.data.base=context.data.characteristics.dexterity.value*2;
            this.prepareSkill(i);
            defense.push(i);
          }
          if(i.data.name == "Jump") {
            i.data.data.base=context.data.characteristics.dexterity.value*3;
            this.prepareSkill(i);
          }
          let spiritcombat = game.i18n.localize("RQG.SpiritCombat");
          if(i.data.name == spiritcombat) {
            skills["spiritweapons"].push(i);            
          }
          skills[i.data.data.skillcategory].push(i);          
        }
        else {
          skills["others"].push(i);
        }
      }
      else if (i.type === 'rune') {
        console.log("handling a rune in Actor with:"+i.name);
        console.log(i);
        console.log(i.data.data.type);
        if(i.data.data.type != "") {
          runes[i.data.data.type].push(i);
        }
        else {
          runes["others"].push(i);
        }
      }
      else if (i.type === 'attack') {
        attacks[i.data.data.attacktype].push(i);
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
        totalwounds+= Number(i.data.data.wounds);
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
        //Update MagicStoragePoints data
        if(i.data.data.equiped) {
          magicpointreservemax+= i.data.data.maxmp;
          magicpointreservecurrent+= i.data.data.currentmp;  
        }
        mpstorage.push(i);
      }
      else if(i.type === 'meleeattack' || i.type === 'missileattack' || i.type === 'naturalattack') {
        console.log(i);
      }
      else if(i.type === 'familyhistory') {
        familyhistory.push(i);
      }
    }
    totalwounds+= context.data.attributes.generalwounds;
    // Assign and return
    console.log("In prepareItems with hitlocations.length = "+hitlocations.length);
    console.log(hitlocations); 
    if(hitlocations.length < 1 && context.data.attributes.hitlocationstype !== "Others") {
      console.log(context.data.attributes);
      let hitlocationslist = this._preparehitlocationtype(context.data.attributes.hitlocationstype).then(function(result) {
        console.log(result);
        console.log(actor);
        let hitlocations=actor.createEmbeddedDocuments("Item",result);
        console.log(hitlocations);    
      });
    }
    hitlocations.sort(function(a, b) {
      if (a.data.data.rangestart < b.data.data.rangestart) {
          return -1;
      }
      if (a.data.data.rangestart > b.data.data.rangestart) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
    defense.sort(function(a, b) {
      if (a.data.data.total < b.data.data.total) {
          return -1;
      }
      if (a.data.data.total > b.data.data.total) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
    defense.reverse();    
    context.data.gear = gear;
    context.data.features = features;
    context.data.spells = spells;
    context.data.skills = skills;
    context.data.gear = gear;
    context.data.skills = skills;
    context.data.runes = runes;
    context.data.attacks = attacks;
    context.data.spells = spells;
    context.data.hitlocations = hitlocations;
    context.data.passions = passions;
    context.data.cults = cults;
    context.data.defense = defense;
    context.data.mpstorage = mpstorage;
    context.data.armors = armors;
    context.data.familyhistory = familyhistory;
    context.data.attributes.hitpoints.value = context.data.attributes.hitpoints.max - totalwounds;
    context.data.attributes.magicpointsreserve.max = magicpointreservemax;
    context.data.attributes.magicpointsreserve.value = magicpointreservecurrent;
  }
  prepareNPCItems(){
    let actor = this;
    let context = this.data;
    const gear = [];
    const defense = [];
    const skills = [];
    const runes = {
      "elemental": [],
      "power": [],
      "form": [],
      "condition": [],
      "others": []
    };
    const attacks = {
      "melee": [],
      "missile": [],
      "natural":[],
      "spirit": []
    }
    const spells = {
      "spirit": [],
      "rune": [],
      "sorcery":[]
    }
    const cults = [];
    const mpstorage = [];
    var hitlocations =[];
    let totalwounds = 0;
    let magicpointreservemax =0;
    let magicpointreservecurrent =0;
    const features = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        this.prepareSkill(i); // To be removed once fix is found
        skills.push(i);
        if(i.data.data.skillcategory == "shields"){
          defense.push(i);
        }
        if(i.data.name == "Dodge") {
          defense.push(i);
        }
      }
      else if (i.type === 'rune') {
        console.log("handling a rune in Actor with:"+i.name);
        console.log(i);
        console.log(i.data.data.type);
        if(i.data.data.type != "") {
          runes[i.data.data.type].push(i);
        }
        else {
          runes["others"].push(i);
        }
      }
      else if (i.type === 'attack') {
        attacks[i.data.data.attacktype].push(i);
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
        totalwounds+= Number(i.data.data.wounds);
        hitlocations.push(i);
      }
      else if (i.type === 'cult') {
        cults.push(i);
      }
      else if(i.type === 'mpstorage') {
        //Update MagicStoragePoints data
        if(i.data.data.equiped) {
          magicpointreservemax+= i.data.data.maxmp;
          magicpointreservecurrent+= i.data.data.currentmp;  
        }
        mpstorage.push(i);
      }
      else if(i.type === 'meleeattack' || i.type === 'missileattack' || i.type === 'naturalattack') {
        console.log("error with incorrect item type" + i._id);
      }
    }
    totalwounds+= context.data.attributes.generalwounds;
    // Assign and return
    console.log("In prepareItems with hitlocations.length = "+hitlocations.length);
    console.log(hitlocations); 
    if(hitlocations.length < 1 && context.data.attributes.hitlocationstype !== "Others") {
      console.log(context.data.attributes);
      let hitlocationslist = this._preparehitlocationtype(context.data.attributes.hitlocationstype).then(function(result) {
        console.log(result);
        console.log(actor);
        let hitlocations=actor.createEmbeddedDocuments("Item",result);
        console.log(hitlocations);    
      });
    }
    hitlocations.sort(function(a, b) {
      if (a.data.data.rangestart < b.data.data.rangestart) {
          return -1;
      }
      if (a.data.data.rangestart > b.data.data.rangestart) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
    defense.sort(function(a, b) {
      if (a.data.data.total < b.data.data.total) {
          return -1;
      }
      if (a.data.data.total > b.data.data.total) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
    defense.reverse();      
    context.data.gear = gear;
    context.data.features = features;
    context.data.spells = spells;
    context.data.skills = skills;
    context.data.gear = gear;
    context.data.runes = runes;
    context.data.attacks = attacks;
    context.data.spells = spells;
    context.data.hitlocations = hitlocations;
    context.data.cults = cults;
    context.data.defense = defense;
    context.data.mpstorage = mpstorage;
    context.data.attributes.hitpoints.value = context.data.attributes.hitpoints.max - totalwounds;
    context.data.attributes.magicpointsreserve.max = magicpointreservemax;
    context.data.attributes.magicpointsreserve.value = magicpointreservecurrent;
  }
  /**
   * Prepares a skill Item.
   * 
   * Preparation of a skill is simply determining the `total` value, base + increases + modifier+ skillcategory mod.
   * 
   * @param   {Object} skill    'skill' type Item 
   * @return  {Object} skill    Processed skill, with total value calculated
   */
  prepareSkill(skill) 
  {
    let actorData = this.data;
    skill.data.data.total=skill.data.data.base+skill.data.data.increase+skill.data.data.modifier;
    return skill;
  }
  preparePassion(passion) 
  {
    let actorData = this.data
    passion.data.total=passion.data.base+passion.data.increase+passion.data.modifier;
    return passion;
  }  
  _prepareattributes(data) {
    //Magic Points
    data.attributes.magicpoints.max = data.characteristics.power.value;
    // Total HP
    data.attributes.hitpoints.max = this._preparehitpointstotal(data);
    //Damage Bonus
    data.attributes.damagebonus= this._preparedamagebonus(data);
    // HP Modifier
    data.attributes.hpmodifier = this._preparehpmodifier(data.attributes.hitpoints.max);
    data.attributes.dexsr=this._preparedexsr(data.characteristics.dexterity);
    data.attributes.sizsr=this._preparesizsr(data.characteristics.size);
    data.attributes.spiritcombatdamage=this._preparespiritcombatdamage(data.characteristics.power,data.characteristics.charisma);
  }
  _preparedexsr(dex) {
    const value=dex.value;
    if(value > 18) {
       return 0;
    }
    else if(value > 15) {
      return 1;
    }
    else if(value >12) {
      return 2;
    }
    else if(value > 8){
      return 3;
    }
    else if(value > 5) {
      return 4;
    }
    else {
      return 5;
    }
  }
  _preparesizsr(siz) {
    const value=siz.value;
    if(value > 21) {
       return 0;
    }
    else if(value > 14) {
      return 1;
    }
    else if(value >6) {
      return 2;
    }
    else {
      return 3;
    }
  }

  _preparehitpointstotal(data) {
    let hptotal=data.characteristics.constitution.value;
    if(data.characteristics.size.value < 5) {
      hptotal += -2;
    }
    else if(data.characteristics.size.value < 9) {
      hptotal += -1;
    }
    else if(data.characteristics.size.value >= 13){
      hptotal += Math.ceil((data.characteristics.size.value-13)/4);
    }
    if(data.characteristics.power.value < 5) {
      hptotal += -1;
    }
    else if(data.characteristics.power.value >= 17){
      hptotal += Math.ceil((data.characteristics.power.value-17)/4);
    }
    return hptotal;
  }

  _preparedamagebonus(data) {
    var statvalue=data.characteristics.strength.value+data.characteristics.size.value;
    if(statvalue < 13) {
      return "-1D4";
    }
    else if(statvalue < 25) {
      return "0";
    }
    else if(statvalue < 33) {
      return "1D4";
    }
    else if(statvalue < 41) {
      return "1D6";
    }
    else {
      let damagebonusdice = 1+Math.ceil((statvalue-40)/16);
      return damagebonusdice+"D6";
    }
  }
  _prepareskillcategoriesmodifier(data) {
    for (const [index, category] of Object.entries(data.skillcategory)) {
      let categoryid=index;
      let modifiervalue=0;
      switch (categoryid) {
        case "agility":
          modifiervalue=this._categoryminorpositive(data.characteristics.strength.value)+this._categoryminornegative(data.characteristics.size.value)+this._categorymajorpositive(data.characteristics.dexterity.value)+this._categoryminorpositive(data.characteristics.power.value);
          break;
        case "communication":
          modifiervalue=this._categoryminorpositive(data.characteristics.intelligence.value)+this._categorymajorpositive(data.characteristics.charisma.value)+this._categoryminorpositive(data.characteristics.power.value);
          break;
        case "knowledge":
          modifiervalue=this._categoryminorpositive(data.characteristics.power.value)+this._categorymajorpositive(data.characteristics.intelligence.value);
          break;
        case "magic":
          modifiervalue=this._categoryminorpositive(data.characteristics.charisma.value)+this._categorymajorpositive(data.characteristics.power.value);
          break;
        case "manipulation":
        case "meleeweapons":
        case "missileweapons":
        case "shields":
        case "naturalweapons":
          modifiervalue=this._categoryminorpositive(data.characteristics.strength.value)+this._categoryminorpositive(data.characteristics.power.value)+this._categorymajorpositive(data.characteristics.dexterity.value)+this._categorymajorpositive(data.characteristics.intelligence.value);
          break;
        case "perception":
          modifiervalue=this._categoryminorpositive(data.characteristics.power.value)+this._categorymajorpositive(data.characteristics.intelligence.value);
          break;
        case "stealth":
          modifiervalue=this._categorymajorpositive(data.characteristics.intelligence.value)+this._categorymajornegative(data.characteristics.size.value)+this._categorymajorpositive(data.characteristics.dexterity.value)+this._categoryminornegative(data.characteristics.power.value);
          break;           
        default:
          categoryid="others";
          modifiervalue=0;
          break;
      }
      data.skillcategory[index].modifier=modifiervalue;
    }
  }
  _categoryminorpositive(statvalue){
    var bonus = 0;
    if (statvalue < 5) {
      bonus = -5;
    }else if (statvalue >16 && statvalue < 21){
      bonus = 5;
    }else if (statvalue >20){
      bonus = 5+(Math.ceil((statvalue-20)/4)*5);
    }
    return bonus;
  }
  _categorymajorpositive(statvalue){
    var bonus = 0;
    if (statvalue < 5) {
      bonus = -10;
    }else if(statvalue >= 5 && statvalue <= 8){
      bonus = -5;
    }else if(statvalue >= 13 && statvalue <= 16){
      bonus = 5;
    }else if(statvalue >= 17 && statvalue <= 20){
      bonus = 10;
    }else if (statvalue >20){
      bonus = (10+(Math.ceil((statvalue-20)/4)*5));
    }    
    return bonus;
  }
  _categoryminornegative(statvalue){
    var bonus = 0;
    if (statvalue < 5) {
      bonus = 5;
    } else if(statvalue >16 && statvalue < 21){
      bonus = -5;
    }else if (statvalue >20){
      bonus = -5 - (Math.ceil((statvalue-20)/4)*5);
    }
    return bonus;
  }
  _categorymajornegative(statvalue){
    var bonus= 0;
    if (statvalue < 5) {
      bonus = 10;
    }else if(statvalue >= 5 && statvalue <= 8){
      bonus = 5;
    }else if(statvalue >= 13 && statvalue <= 16){
      bonus = -5;
    }else if(statvalue >= 17 && statvalue <= 20){
      bonus = -10;
    }else if (statvalue >20){
      bonus = bonus - (10+(Math.ceil((statvalue-20)/4)*5));
    }
    return bonus;    
  }
  _preparehpmodifier(hp) {
    //compute Max HP modifier
    let modifier=0;
    if(hp < 13) {
      modifier=Math.ceil((hp-13)/3);
    }
    else if(hp > 15) {
      modifier=Math.ceil((hp-15)/3);
    }
    return modifier;    
  }
  _preparePassion(passion) {
    passion.data.total=passion.data.base+passion.data.increase+passion.data.modifier;
  }
  _preparehitlocation(hitlocation, actorData) {
    // Prepare the HitLocations by calculating the Max HP of the location and the remaining HP based on wounds
    console.log(hitlocation);
    hitlocation.data.data.maxhp = hitlocation.data.data.basehp + actorData.data.attributes.hpmodifier;
    hitlocation.data.data.currenthp = hitlocation.data.data.maxhp - hitlocation.data.data.wounds;
  }
  async _preparehitlocationtype(hitlocationtype) {
    console.log("hitlocations was empty so we load them");
    const compendiumname = "runequest."+hitlocationtype+"locations";
    const hitlocationslist = await RunequestActor.loadCompendium(compendiumname);
    const hitlocations = hitlocationslist.map(i => i.toObject());
    console.log(hitlocations);
    return hitlocations;
  }
  async toggleActorFlag (flagName) {
    const flagValue = !this.data.data.flags[flagName]
    const name = `data.flags.${flagName}`
    await this.update({ [name]: flagValue })
  }
  _preparespiritcombatdamage(power,charisma) {
    const attr=power.value+charisma.value;
    if(attr < 13) {
      return "1D3";
    }
    else if(attr < 25) {
      return "1D6";
    }
    else if(attr < 33) {
      return "1D6+1";
    }
    else if(attr < 41) {
      return "1D6+3";
    }
    else if(attr < 57) {
      return "2D6+3";
    }
    else if(attr < 72) {
      return "3D6+4";
    }
    else if(attr < 88) {
      return "4D6+5"
    }
    else {
      return "5D6+6";
    }
  }    
  /* -------------------------------------------- */
  static async loadCompendiumData(compendium) {
    const pack = game.packs.get(compendium);
    return await pack?.getDocuments() ?? [];
  }

  /* -------------------------------------------- */
  static async loadCompendium(compendium, filter = item => true) {
    console.log("Loading compendium:"+compendium);
    let compendiumData = await RunequestActor.loadCompendiumData(compendium);
    return compendiumData.filter(filter);
  }
  rollAbility(ability) {
    let charac = this.data.data.characteristics[ability];
    let charname = game.i18n.localize(charac.label);
    let charvalue= charac.value;
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
  }
  async rolldefense() {
    let dialogOptions = {
      title: "Defense Roll",
      template : "/systems/runequest/templates/chat/defense-dialog.html",
      'z-index': 100,
      // Prefilled dialog data

      data : {
        "defenses": data.data.defense,
        "data": data.data,
      },
      callback : (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.prepareTest() has finished and the user confirms the dialog
        let defenseid = html.find('[name="defensename"]').val();
        let testmodifier =   Number(html.find('[name="testmodifier"]').val());
        let defense = this.actor.getOwnedItem(defenseid);
        let testData = {"testmodifier":testmodifier};
        //("_onAttackRoll-attack");
        //(attack);
        //attack.roll(testData);
        //this.genericAttackRoll(attack);
        let testData = {"testmodifier":testmodifier};
        result = defense.basicRoll(defense.data.name, defense.data.data.total+testmodifier);
        return {defense: defense, result: result};
      }
    };
    return await renderTemplate(dialogOptions.template, dialogOptions.data).then(dlg =>
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
}
