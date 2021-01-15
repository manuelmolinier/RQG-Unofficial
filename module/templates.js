/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Shared Partials
    //"systems/dnd5e/templates/actors/parts/active-effects.html",

    // Actor Sheet Partials
    "systems/runequest/templates/actor/parts/actor-summary.html"

    // Item Sheet Partials
  ]);
};
