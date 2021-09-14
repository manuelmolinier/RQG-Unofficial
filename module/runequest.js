/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { RunequestActor } from "./actor/runequestactor.js";
import { RunequestItem } from "./item/RunequestItem.js";
import { RunequestItemSheet } from "./item/RunequestItem-Sheet.js";
import { RunequestActorSheet } from "./actor/runequestactor-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { RQG } from "./config.js"; // Config for RQG

console.log("importing RQGTools");
import { RQGTools } from "./tools/rqgtools.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Runequest System`);

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
  CONFIG.Combat.initiative = {
    formula: '@characteristics.dexterity.value',
    decimals: 2
  }

  // Record Configuration Values
  CONFIG.RQG = RQG;
	// Define custom Entity classes
  CONFIG.Actor.entityClass = RunequestActor;
  CONFIG.Item.entityClass = RunequestItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Runequest Glorantha", RunequestActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("RunequestGlorantha", RunequestItemSheet, {makeDefault: true});


  // Register system settings
  game.settings.register("Runequest", "macroShorthand", {
    name: "Shortened Macro Syntax",
    hint: "Enable a shortened macro syntax which allows referencing attributes directly, for example @str instead of @attributes.str.value. Disable this setting if you need the ability to reference the full attribute model, for example @attributes.str.label.",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.Runequest = {
    macros: {
      itemRoll: RQGTools.itemRollMacro
    }
  }

  
  preloadHandlebarsTemplates();
});
Hooks.on('hotbarDrop', async (bar, data, slot) =>
  RQGTools.createMacro(bar, data, slot)
)

// Added Helpers to Handlebars
Handlebars.registerHelper("skillcategorymodifier", function(skillcategories, skillcategory) {
  console.log("skillcategorymodifier with:"+skillcategory)
  if(skillcategory == "others") {
    return 0;
  }
  var skillcat = skillcategories[skillcategory];
  var modifier = skillcat.modifier;
  return modifier;
});
Handlebars.registerHelper("getcharacterattackskills", function(actorid, attacktype) {
  const actor = game.actors.get(actorid);
  const skillcategory = attacktype+"weapons";
  let attacks = actor.data.data.skills[skillcategory];
  if(attacktype === "melee") {
    //Add the Shield skills to melee attack possible skills
    attacks=attacks.concat(actor.data.data.skills["shields"]);
    console.log(attacks);
  }
  return attacks;
});
// Added Helpers to Handlebars
Handlebars.registerHelper("getruneletter", function(runeid) {
  const runes= {
    "air": "A",
    "fire": "f",
    "darkness": "D",
    "water": "Z",
    "earth": "e",
    "moon": "6",
    "man": "M",
    "beast": "B",
    "fertility": "X",
    "death": "T",
    "harmony": "H",
    "disorder": "J",
    "truth": "Y",
    "illusion": "I",
    "stasis": "U",
    "movement": "V",
    "chaos": "C"
  }
  return runes[runeid];
});
Handlebars.registerHelper('isdefined', function (value) {
  return value !== undefined;
});
Handlebars.registerHelper("getcharacterhitlocations", function(actorid) {
  const actor = game.actors.get(actorid);
  let hitlocations = actor.data.data.hitlocations;
  return hitlocations;
});
Handlebars.registerHelper("displayDescription", function(description) {
  return new Handlebars.SafeString(description);
});