export class Cast {
    private timestamp: Date;
    private event: string;
    private targetName: string;
    private name: string = "Melee";
    private id: number = -1;
    private amount: number;
    private overhealing: number = 0;
    private critical: boolean = false;

    /*
        Constructors
    */
    constructor(body: JSON) {
        this.timestamp = new Date(body["timestamp"]);
        this.event = body["event"];
        this.targetName = body["targetName"];

        switch (this.event) {
            case "DAMAGE":
                if (typeof body["spellName"] !== "undefined") {
                    this.name = body["spellName"];
                    this.id = Number(body["spellID"]);
                }
                break;

            case "HEAL":
                this.overhealing = Number(body["overhealing"]);
                break;
        }

        this.amount = Number(body["amount"]);

        if (typeof body["isCritical"] !== "undefined" && body["isCritical"] != "nil") this.critical = true;
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