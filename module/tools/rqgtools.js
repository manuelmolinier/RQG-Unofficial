export class RQGTools {
    static async getcompendiumdata(cp) {
        //extract the content of the compendium given as a parameter
        return await cp.getcontent();
    }
}

