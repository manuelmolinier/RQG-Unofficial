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
    // NPC Sheet Partial
    "systems/runequest/templates/actor/parts/npc/npc-sheetheader.html",
    "systems/runequest/templates/actor/parts/npc/npc-summary.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-characteristics.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-skilltable.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-hitlocations.html",
    "systems/runequest/templates/actor/parts/npc/npc-partial-attacks.html",
    "systems/runequest/templates/actor/parts/npc/npc-magic.html"
    // Item Sheet Partials
  ]);
};
