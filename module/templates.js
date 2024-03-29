/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    // Actor Sheet Partials
    "systems/runequest/templates/actor/parts/character/actor-summary.html",
    "systems/runequest/templates/actor/parts/character/actor-combat.html",
    "systems/runequest/templates/actor/parts/character/actor-skills.html",
    "systems/runequest/templates/actor/parts/character/actor-herosoul.html",
    "systems/runequest/templates/actor/parts/character/actor-sheetheader.html",
    "systems/runequest/templates/actor/parts/character/actor-magic.html",
    "systems/runequest/templates/actor/parts/character/actor-skills.html",
    "systems/runequest/templates/actor/parts/character/actor-inventory.html",
    "systems/runequest/templates/actor/parts/character/actor-partial-attacks.html",
    "systems/runequest/templates/actor/parts/character/actor-partial-hitlocations.html",
    "systems/runequest/templates/actor/parts/character/actor-partial-armors.html",
    "systems/runequest/templates/actor/parts/character/actor-partial-skilltable.html",
    "systems/runequest/templates/actor/parts/character/actor-partial-characteristics.html",
    "systems/runequest/templates/actor/parts/character/actor-backstory.html",
    "systems/runequest/templates/actor/parts/character/actor-runesandpassions.html",
    "systems/runequest/templates/actor/parts/character/actor-runesandpassionsv2.html",
    "systems/runequest/templates/actor/parts/actor-gmtools.html",
    // NPC Sheet Partial
    "systems/runequest/templates/actor/parts/npc/npc-sheetheader.html",
    "systems/runequest/templates/actor/parts/npc/npc-summary.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-characteristics.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-skilltable.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-hitlocations.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-attacks.html",
    "systems/runequest/templates/actor/parts/npc/npc-magic.html",
    "systems/runequest/templates/actor/parts/actor-activeeffects.html",
    "systems/runequest/templates/actor/parts/actor-activeeffectsv2.html",     
    // Item Sheet Partials
    "systems/runequest/templates/item/parts/origin-skills.html",
    "systems/runequest/templates/item/parts/origin-skilltable.html",
    // Starter Set Style CS Partials
    "systems/runequest/templates/actor/starterset/parts/general.html",
    "systems/runequest/templates/actor/starterset/parts/game.html",
    "systems/runequest/templates/actor/starterset/parts/skills-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/hitlocations-ss-partial.html", 
    "systems/runequest/templates/actor/starterset/parts/attributes-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/runespells-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/cults-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/spiritspells-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/runes-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/passions-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/mpstorage-ss-partial.html",
    "systems/runequest/templates/actor/starterset/parts/backstory.html"               
  ]);
};
