export class Cast {
    private timestamp: Date;
    private event: string;
    private targetName: string;
    private name: string = "Melee";
    private id: number = -1;
    private amount: number;
    private overhealing: number = 0;
    private critical: boolean = false;
    private glancing: boolean = false;
    private crushing: boolean = false;

    /*
        Constructors
    */
    constructor(body: JSON) {
        this.timestamp = new Date(body["timestamp"]);
        this.event = body["event"];
        this.targetName = body["targetName"];

        if (this.event == "SPELL_DAMAGE" || this.event == "SPELL_PERIODIC_DAMAGE" || this.event == "RANGE_DAMAGE") {
            this.name = body["name"];
            this.id = Number(body["id"]);
        } else if (this.event == "SPELL_HEAL" || this.event == "SPELL_PERIODIC_HEAL") {
            this.overhealing = Number(body["overhealing"]);
        }

        this.amount = Number(body["amount"]);

        if (typeof body["isCritical"] !== "undefined" && body["isCritical"] != "nil") this.critical = true;
        if (typeof body["isGlancing"] !== "undefined" && body["isGlancing"] != "nil") this.glancing = true;
        if (typeof body["isCrushing"] !== "undefined" && body["isCrushing"] != "nil") this.crushing = true;
    }

    /*
        Getters
    */
    public getEvent(): string {
        return this.event;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getOverhealing(): number {
        return this.overhealing;
    }
};