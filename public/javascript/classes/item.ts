export class Item {
    private id: number;
    private level: number;

    constructor(id: number, level: number) {
        this.id = id;
        this.level = level;
    }

    /* 
        Getters
    */
    public getLevel(): number {
        return this.level;
    }
}