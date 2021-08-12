import { Cast } from "./cast.js";
import { IDConverters } from "../idconverters.js";

export class Creature {
    private UID: string;
    private name: string = "nil";
    private realm: string = "nil";
    private totalDamageDone: number;
    private totalHealingDone: number;
    private DPS: number;
    private HPS: number;

    private factionID: number;
    private specID: number;
    private specProperties: IDConverters.SpecInformation = {
        class: {
            name: "nil",
            color: "nil"
        },
        imageURL: "nil",
        name: "nil"
    };

    private casts: Array<Cast>;
    private pets: Array<Creature>;

    /*
        Constructors
    */
    constructor(UID: string, name: string) {
        this.UID = UID;
        this.name = name.split('-')[0];
        this.realm = name.split('-')[1];

        this.totalDamageDone = 0;
        this.totalHealingDone = 0;
        this.DPS = 0;
        this.HPS = 0;

        this.factionID = -1;
        this.specID = -1;

        this.casts = Array<Cast>();
        this.pets = Array<Creature>();
    }

    /*
        Getters
    */
    public getUID(): string {
        return this.UID;
    }

    public getPets(): Array<Creature> {
        return this.pets;
    }

    public getCasts(): Array<Cast> {
        return this.casts;
    }

    public getTotalDamageDone(): number {
        return this.totalDamageDone;
    }

    public getTotalHealingDone(): number {
        return this.totalHealingDone;
    }

    public isPlayer(): boolean {
        return this.UID.includes("Player");
    }

    public getName(): string {
        return this.name;
    }

    public getDPS(): number {
        return this.DPS;
    }

    public getHPS(): number {
        return this.HPS;
    }

    public getClassColor(): string {
        return this.specProperties.class.color;
    }

    public getSpecImageURL(): string {
        return this.specProperties.imageURL;
    }

    /*
        Setters/Adders
    */
    public setFactionID(factionID: number): void {
        this.factionID = factionID;
    }

    public setSpecID(specID: number): void {
        this.specID = specID;

        let specProperties: IDConverters.SpecInformation = IDConverters.specIDConversion[specID];
        if (typeof specProperties !== "undefined") {
            this.specProperties = specProperties;
        } else {
            console.log(`Unknown spec ID: ${this.specID}`);
        }
    }

    public setDPS(amount: number): void {
        this.DPS = amount;
    }

    public setHPS(amount: number): void {
        this.HPS = amount;
    }

    public addCast(cast: Cast): void {
        this.casts.push(cast);
    }

    public addPet(pet: Creature): void {
        this.pets.push(pet);
    }

    public addToTotalDamageDone(amount: number): void {
        this.totalDamageDone += amount;
    }

    public addToTotalHealingDone(amount: number): void {
        this.totalHealingDone += amount;
    }
}