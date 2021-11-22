/**
 * Extend the base Combat entity.
 * @extends {Combat}
 */
export class RunequestCombat extends Combat {
    _sortCombatants(a, b) {
        const initA = Number.isNumeric(a.initiative) ? a.initiative : 13;
        const initB = Number.isNumeric(b.initiative) ? b.initiative : 13;

        return initB - initA;
    }
    _prepareCombatant(c, scene, players, settings={}) {
        let combatant = super._prepareCombatant(c, scene, players, settings);
        combatant.flags.sr = Number.isNumeric(combatant.flags.sr) ? Number(combatant.flags.sr) : 0;

        return combatant;
    }
    async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
        await super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
        return this.update({ turn: 0});
    }
    async startCombat() {
        await this.setupTurns();
        return super.startCombat();
    }
}