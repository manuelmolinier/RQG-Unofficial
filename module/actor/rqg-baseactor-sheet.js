import {RQG} from '../config.js';
import { RQGTools } from '../tools/rqgtools.js';
import {skillMenuOptions} from "../menu/skill-context.js";
import {attackMenuOptions} from "../menu/attack-context.js";
import ActiveEffectRunequest from "../active-effect.js";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class RunequestBaseActorSheet extends ActorSheet {

  static confirmItemDelete(actor, itemId) {
    actor.deleteEmbeddedDocuments("Item",[itemId]);
  }
  /* -------------------------------------------- */

  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    //("getData() starting");
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.actor.data;

    //Load config
    context.config = CONFIG.RQG;

    //Collect if user is Owner and if User is GM
    context.isOwner = this.actor.isOwner;
    context.isGM = game.user.isGM;
    if(game.user.isGM) {
      context.gmitems = game.items;
    }
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

    // Prepare the Active Effects
    context.effects = ActiveEffectRunequest.prepareActiveEffectCategories(this.actor.effects);

    // Commented until new Active effects are added
    //context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

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
    //(actorData);
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
    //("ActorSheet - Prepare Items");
    //(actorData);
  }

  static async loadCompendiumData(compendium) {
    const pack = game.packs.get(compendium);
    return await pack?.getDocuments() ?? [];
  }
  /* -------------------------------------------- */
  static async loadCompendium(compendium, filter = item => true) {
    console.log("Loading compendium:"+compendium);
    let compendiumData = await RunequestBaseActorSheet.loadCompendiumData(compendium);
    return compendiumData.filter(filter);
  }    
}
