import { Creature } from "./creature.js";

export class Encounter {
    private startTime: Date;
    private endTime: Date;

    private difficultyID: number;
    private name: string;
    private groupSize: number;

    private creatures: Array<Creature>;
    private combatants: Array<Object>;

    /*
        Constructor
    */
    constructor(startTimestamp: string, endTimestamp: string, body: JSON) {
        this.startTime = new Date(startTimestamp);
        this.endTime = new Date(endTimestamp);

        this.difficultyID = Number(body["difficultyID"]);
        this.name = body["encounterName"];
        this.groupSize = Number(body["groupsize"]);

        this.creatures = new Array<Creature>();
        this.combatants = body["combatants"];
    }

    /*
        Misc.
    */
    public timestampWasDuring(timestamp: string): boolean {
        let time: Date = new Date(timestamp);

        return (time.getTime() > this.startTime.getTime() && time.getTime() < this.endTime.getTime());
    }

    /*
        Getters
    */
    public getDurationInMilliseconds(): number {
        return this.endTime.getTime() - this.startTime.getTime();
    }

    public getCreatures(): Array<Creature> {
        return this.creatures;
    }

    public getCombatants(): Array<Object> {
        return this.combatants;
    }

    /*
        Setters/Adders
    */
    public addCreature(creature: Creature): void {
        this.creatures.push(creature);
    }

    public getName(): string {
        return this.name;
    }
};