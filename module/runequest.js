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
  
  preloadHandlebarsTemplates();
});

// Added Helpers to Handlebars
Handlebars.registerHelper("skillcategorymodifier", function(skillcategories, skillcategory) {
  if(skillcategory == "others") {
    return 0;
  }
  var skillcat = skillcategories[skillcategory];
  var modifier = skillcat.modifier;
  return modifier;
});
