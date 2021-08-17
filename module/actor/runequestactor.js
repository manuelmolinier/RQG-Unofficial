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

    const competences = await this.loadCompendium("runequest.skills");
    data.items = competences.map(i => i.toObject());
    
    return super.create(data, options);
  }

  /*
  static async create(data, options) {
    console.log("Entering create for Actor");
    console.log(data);
    console.log(options);
    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
    if (data.items)
    {
      return super.create(data, options);
    }

    // Initialize empty items
    data.items = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    const pack = game.packs.find(p => p.collection == "runequest.skills")
    var myskills;
    await pack.getIndex().then(index => myskills = index);
    console.log(myskills);
    for (let sk of myskills)
    {
      let skillItem = undefined;
      await pack.getEntity(sk._id).then(skill => skillItem = skill);
      console.log(skillItem);
      let skilldata = {"name":skillItem.data.name,"type":skillItem.data.type,"data":skillItem.data.data};
      let skill = new Item(skilldata);
      console.log(skill);
      data.items.push(skill);
    }
    console.log(data);
    return super.create(data, options);
  }
  */  

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
    console.log("prepareData for: "+this.data.name);
    console.log(this.data);
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
    this.prepareItems();
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
  prepareItems(){
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
          skills[i.data.data.skillcategory].push(i);          
        }
        else {
          skills["others"].push(i);
        }
      }
      else if (i.type === 'attack') {
        attacks[i.data.data.attacktype].push(i);
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
    context.data.gear = gear;
    context.data.features = features;
    context.data.spells = spells;
    context.data.skills = skills;
    context.data.gear = gear;
    context.data.skills = skills;
    context.data.attacks = attacks;
    context.data.spells = spells;
    context.data.hitlocations = hitlocations;
    context.data.passions = passions;
    context.data.cults = cults;
    context.data.defense = defense;
    context.data.mpstorage = mpstorage;
    context.data.attributes.hitpoints.value = context.data.attributes.hitpoints.max - totalwounds;
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
    console.log("prepare attributes in Actor");
    console.log(data);
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
    console.log(data.attributes);
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
      hptotal += 1+Math.ceil((data.characteristics.size.value-13)/4);
    }
    if(data.characteristics.power.value < 5) {
      hptotal += -1;
    }
    else if(data.characteristics.power.value >= 17){
      hptotal += 1+Math.ceil((data.characteristics.power.value-17)/4);
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
    console.log("Starting _preparehpmodifier");
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
    console.log("_preparehitlocation");
    console.log(hitlocation);
    let humanoidlocations={
      "RQG.HEAD": 5,
      "RQG.LARM": 4,
      "RQG.RARM": 4,
      "RQG.CHEST": 6,
      "RQG.ABDOMEN": 5,
      "RQG.LLEG": 5,
      "RQG.RLEG": 5
    };
    hitlocation.data.data.maxhp = humanoidlocations[hitlocation.name] + actorData.data.attributes.hpmodifier;
    hitlocation.data.data.currenthp = hitlocation.data.data.maxhp - hitlocation.data.data.wounds;
  }
  /* -------------------------------------------- */
  static async loadCompendiumData(compendium) {
    const pack = game.packs.get(compendium);
    return await pack?.getDocuments() ?? [];
  }

  /* -------------------------------------------- */
  static async loadCompendium(compendium, filter = item => true) {
    let compendiumData = await RunequestActor.loadCompendiumData(compendium);
    return compendiumData.filter(filter);
  }    
}
