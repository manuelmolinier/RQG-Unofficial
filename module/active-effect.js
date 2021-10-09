/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class ActiveEffectRunequest extends ActiveEffect {
  /**
   * Is this active effect currently suppressed?
   * @type {boolean}
   */
  isSuppressed = false;

  /* --------------------------------------------- */

  /** @inheritdoc */
  apply(actor, change) {
    if ( this.isSuppressed ) return null;
    return super.apply(actor, change);
  }

  /* --------------------------------------------- */

  /**
   * Determine whether this Active Effect is suppressed or not.
   */
  determineSuppression() {
    this.isSuppressed = false;
    if ( this.data.disabled || (this.parent.documentName !== "Actor") ) return;
    const [parentType, parentId, documentType, documentId] = this.data.origin?.split(".") ?? [];
    if ( (parentType !== "Actor") || (parentId !== this.parent.id) || (documentType !== "Item") ) return;
    const item = this.parent.items.get(documentId);
    if ( !item ) return;
    const itemData = item.data.data;
    // If an item is not equipped, or it is equipped but it requires attunement and is not attuned, then disable any
    // Active Effects that might have originated from it.
    this.isSuppressed = itemData.equipped === false;
  }

  /* --------------------------------------------- */

  /**
   * Manage Active Effect instances through the Actor Sheet via effect control buttons.
   * @param {MouseEvent} event      The left-click event on the effect control
   * @param {Actor|Item} owner      The owning entity which manages this effect
   */
  static onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const div = a.closest("div");
    const effect = div.dataset.effectId ? owner.effects.get(div.dataset.effectId) : null;
    switch ( a.dataset.action ) {
      case "create":
        return owner.createEmbeddedDocuments("ActiveEffect", [{
          label: game.i18n.localize("RQG.NewEffect"),
          icon: "icons/svg/sword.svg",
          origin: owner.uuid,
          "duration.rounds": div.dataset.effectType === "temporary" ? 1 : undefined,
          disabled: div.dataset.effectType === "inactive"
        }]);
      case "edit":
        return effect.sheet.render(true);
      case "delete":
        return effect.delete();
      case "toggle":
        return effect.update({disabled: !effect.data.disabled});
    }
  }

  /* --------------------------------------------- */

  /**
   * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
   * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
   * @return {object}                   Data for rendering
   */
  static prepareActiveEffectCategories(effects) {
    // Define effect header categories
    const categories = {
      temporary: {
        type: "temporary",
        label: game.i18n.localize("RQG.EffectTemporary"),
        effects: []
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("RQG.EffectPassive"),
        effects: []
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("RQG.EffectInactive"),
        effects: []
      },
      suppressed: {
        type: "suppressed",
        label: game.i18n.localize("RQG.EffectUnavailable"),
        effects: [],
        info: [game.i18n.localize("RQG.EffectUnavailableInfo")]
      }
    };

    // Iterate over active effects, classifying them into categories
    for ( let e of effects ) {
      e._getSourceName(); // Trigger a lookup for the source name
      if ( e.isSuppressed ) categories.suppressed.effects.push(e);
      else if ( e.data.disabled ) categories.inactive.effects.push(e);
      else if ( e.isTemporary ) categories.temporary.effects.push(e);
      else categories.passive.effects.push(e);
    }

    categories.suppressed.hidden = !categories.suppressed.effects.length;
    return categories;
  }
}
