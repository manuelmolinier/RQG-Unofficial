**V0.1.11**
**Bug Fixes**
- Not listed (yes bad habit but spent too long on it to recall)
- Possibly new bugs :(
**Additional features**
- Added a new Character Sheet inspired by the Starter Set folio. It is available in Sheet -> This sheet -> RQG.CharacterSheetStarterSet or to change the default.

**V0.1.10**
**Bug Fixes**
- Fixed issue with the header font color that was making it hard to read
- Possibly other bug fixes :(
- Possibly new bugs :(
**Additional features**
- Added first round of support for Active Effect. They can now be added to spell and items and will be added to the characters when spells are added.
- Added support for Spell toggling active effect. When Spell is active the Active effect(s) associated will be active / disabled
- Added first support for opposed attack / defense rolls:
    - When another Token is targeted it will automatically roll the best defense and adjust final result
    - It will take in account Skills over 100% in Rules as Written and adjust the combatant skills accordingly
    - It isn't yet giving opportunity to chose defense (coming "soon") nor implemented the different behaviors between Parry and Dodge :(
**V0.1.9**
**Bug Fixes**
- Fix for Crush Criticals, they will now follow the Errata from BRP forum
- Fix for the Skill gain rolls
- Possibly other bug fixes :)
**Additional features**
- Reworked the CS display:
    - Increased font-size
    - Added a parameter to select the Text color
    - Added a parameter to select the Font used for text.
    - Added Runes icons in the Rune sheet
    - Moved the menu on the side.
- Added an NPC sheet for GMs. Note it need to be reworked for the UI to align on CS changes
**V0.1.7**
**Bug Fixes**
- Fixes for HP computation on edge cases
- Fixed a nasty bug that broke CS for "attack" imported from Item List or Compendium.
**Additional features**
- Added Description display back.

**V0.1.7**
**Bug Fixes**
- Fixes for Crush Crit that were only using one time Max DB and not twice max DB.
**Additional features**
- Added Drag and Drop of Items to create Macros. Working for Skills, Attacks and Passions. known issues with Spells (Spirit and Rune).

**V0.1.6**
**Bug Fixes**
- Fixed reported bugs on existing features
- Fixed missing localization strings when identified. More to follow.
**Additional features**
- Made changes to the Data model to support new features
- Added first step of armors support. Players can now add armors on the CS. Hitlocations covered and Automation of AP on HL is not available
- Added the Gear section which will allow to add various items to the CS.
- Moved MPStorage and Armors to the Gear tab with all the rest of the equipment.
- Moved Passions to the Runes & Passions tab as attributes.
- Added a start of Family History.

**V0.1.5**
**Bug Fixes**
-Fixed reported bugs on existing features
**Additional features**
- Added a locked / unlocked flag to display CS differently based on the flag and allow quick switch between game / roll and edition
- REvamping of the CS starting.
- Refactoring some of the templates
- Start moving the stuff around to make the summary-tab useless


**V0.1.4**
**Bug Fixes**
- Fixes bugs for HP total computation. SIZ and POW where adding 1 HP too much when above 13.
- Fixes issues that Gain Roll message was not clear: now it just says if you gain experience or not and how much.
**Additional features**
- Added Scorpionmen Hitlocation type
- Added an "Others" HitLocation type that remove automation of inserting HL so GM can add monsters.
- Added experience checks for Passions & Runes just as skills.

**V0.1.3**
**Bug Fixes**
- Fixes bugs in Experience checks for skills
- Fixes bug for Attacks handling
- Fixes bug in HP and MP tracking
- Fixes issue with MPStorage items
- Fixes some display issues on Summary sheet`
**Additional features**
- Added experience check for Passions and Runes
- Added support for MPStorage items
- Added better visual effect for Passions, attacks and Defense on Summary Sheet.
- Added automation for handling automated addition of Hitlocations in Character.
- Added management for available MPStores if they are equipped.
- Added a General Wound that is deducted from General HP as well as wounds to Hit Locations to allow better calculation of HP Loss.`