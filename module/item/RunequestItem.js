/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class RunequestItem extends Item {
    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
      super.prepareData();
  
      // Get the Item's data
      const itemData = this.data;
      const actorData = this.actor ? this.actor.data : {};
      const data = itemData.data;
      data.total=data.base+data.increase+data.modifier;
    }
/*
    // Roll function to trigger from Actor
    async roll({configureDialog=true, rollMode, createMessage=true}={}) {
      let item = this;
      const actor = this.actor;
  
      // Reference aspects of the item data necessary for usage
      const id = this.data.data;                // Item data
      //const isSpell = this.type === "spell";    // Does the item require a spell slot?
  
      // Display a configuration dialog to customize the usage
      if (configureDialog && needsConfiguration) {
        const configuration = await AbilityUseDialog.create(this);
        if (!configuration) return; 
      }
  
      // Determine whether the item can be used by testing for resource consumption
      const usage = item._getUsageUpdates({consumeRecharge, consumeResource, consumeSpellSlot, consumeUsage, consumeQuantity});
      if ( !usage ) return;
      const {actorUpdates, itemUpdates, resourceUpdates} = usage;
  
      // Commit pending data updates
      if ( !isObjectEmpty(itemUpdates) ) await item.update(itemUpdates);
      if ( consumeQuantity && (item.data.data.quantity === 0) ) await item.delete();
      if ( !isObjectEmpty(actorUpdates) ) await actor.update(actorUpdates);
      if ( !isObjectEmpty(resourceUpdates) ) {
        const resource = actor.items.get(id.consume?.target);
        if ( resource ) await resource.update(resourceUpdates);
      }
 
      // Create or return the Chat Message data
      return item.displayCard({rollMode, createMessage});
    }
  */
  }
  