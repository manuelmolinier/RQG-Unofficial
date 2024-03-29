import ActiveEffectRunequest from "../active-effect.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class RunequestItemSheet extends ItemSheet {

    /** @override */
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
              classes: ["rqg", "sheet", "item"],
              template: "systems/runequest/templates/item/item-sheet.html",
              width: 520,
              height: 480,
              tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "details"}]
        });
    }
  
    /* -------------------------------------------- */

    /** @override */
    get template() {
      const path = "systems/runequest/templates/item";
      // REturn a unique sheet per item type      
      const itemsheet = `${path}/${this.item.data.type}-sheet.html`;
      return itemsheet;
    }

    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      const data = super.getData();
      const itemData = data.data;
      data.config = CONFIG.RQG;
      data.dtypes = ["String", "Number", "Boolean"];
      /*
      if(data.entity.type == "item") {
        for ( let attr of Object.values(data.data.attributes) ) {
          attr.isCheckbox = attr.dtype === "Boolean";
        }
      }
      */
      data.item = itemData;
      data.data = itemData.data;
      data.effects = ActiveEffectRunequest.prepareActiveEffectCategories(this.item.effects);
      return data;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    setPosition(options={}) {
      const position = super.setPosition(options);
      const sheetBody = this.element.find(".sheet-body");
      const bodyHeight = position.height - 192;
      sheetBody.css("height", bodyHeight);
      return position;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
      activateListeners(html) {
      super.activateListeners(html);
  
      // Everything below here is only needed if the sheet is editable
      if (!this.options.editable) return;
  
      // Add or Remove Attribute
      html.find(".attributes").on("click", ".attribute-control", this._onClickAttributeControl.bind(this));
      html.find('.dropable').on('drop', event => this._onDrop(event));    
      html.find('.dropable').on('dragend', event => this._onDrop(event));
      html.find(".effect-control").click(ev => {
        if ( this.item.isOwned ) return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.")
        ActiveEffectRunequest.onManageActiveEffect(ev, this.item)
      });

    }
  
    /* -------------------------------------------- */
  
    /**
     * Listen for click events on an attribute control to modify the composition of attributes in the sheet
     * @param {MouseEvent} event    The originating left click event
     * @private
     */
    async _onClickAttributeControl(event) {
      event.preventDefault();
      const a = event.currentTarget;
      const action = a.dataset.action;
      const attrs = this.object.data.data.attributes;
      const form = this.form;
  
      // Add new attribute
      if ( action === "create" ) {
        const nk = Object.keys(attrs).length + 1;
        let newKey = document.createElement("div");
        newKey.innerHTML = `<input type="text" name="data.attributes.attr${nk}.key" value="attr${nk}"/>`;
        newKey = newKey.children[0];
        form.appendChild(newKey);
        await this._onSubmit(event);
      }
  
      // Remove existing attribute
      else if ( action === "delete" ) {
        const li = a.closest(".attribute");
        li.parentElement.removeChild(li);
        await this._onSubmit(event);
      }
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _updateObject(event, formData) {
      if(this.object.data.type == "item") {
        // Handle the free-form attributes list
        const formAttrs = expandObject(formData).data.attributes || {};
        const attributes = Object.values(formAttrs).reduce((obj, v) => {
          let k = v["key"].trim();
          if ( /[\s\.]/.test(k) )  return ui.notifications.error("Attribute keys may not contain spaces or periods");
          delete v["key"];
          obj[k] = v;
          return obj;
        }, {});
        
          // Remove attributes which are no longer used
          for ( let k of Object.keys(this.object.data.data.attributes) ) {
            if ( !attributes.hasOwnProperty(k) ) attributes[`-=${k}`] = null;
          }
        // Re-combine formData
        formData = Object.entries(formData).filter(e => !e[0].startsWith("data.attributes")).reduce((obj, e) => {
          obj[e[0]] = e[1];
          return obj;
        }, {id: this.object.id, "data.attributes": attributes});
      } 
      // Update the Item
      return this.object.update(formData);
    }

    _onItemCreate(event) {
      event.preventDefault();
      const header = event.currentTarget;
      // Get the type of item to create.
      const type = header.dataset.type;
      // Grab any data associated with this control.
      const data = duplicate(header.dataset);
      // Initialize a default name.
      const name = `New ${type.capitalize()}`;
      // Prepare the item object.
      const itemData = {
        name: name,
        type: type,
        data: data
      };
      // Remove the type from the dataset since it's in the itemData.type prop.
      delete itemData.data["type"];
  
      // Finally, create the item!
      return this.actor.createOwnedItem(itemData);
    }
}
  