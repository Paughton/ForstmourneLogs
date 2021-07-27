import { Encounter } from "./encounter.js";
import { Creature } from "./creature.js";
import { Cast } from "./cast.js";
import { numberFormat } from "../util.js";

export class LogParser {
    private body: JSON;
    private version: number;
    private gameBuild: string;
    private programVersion: string;
    private encounters: Array<Encounter>;
    private creatures: Array<Creature>;
    private currentEncounterIndex: number = 0;

    private damageDealtEvents: Array<string> = [
        "SPELL_DAMAGE",
        "RANGE_DAMAGE",
        "SPELL_PERIODIC_DAMAGE",
        "SWING_DAMAGE_LANDED"
    ];

    private healEvents: Array<string> = [
        "SPELL_HEAL",
        "SPELL_PERIODIC_HEAL"
    ];

    constructor(body: JSON, version: number, gameBuild: string, programVersion: string) {
        this.body = body;
        this.version = version;
        this.gameBuild = gameBuild;
        this.programVersion = programVersion;

        this.encounters = Array<Encounter>();
        this.creatures = Array<Creature>();
    }

    // Get creature in encounter
    private getCreatureWithUIDInEncounter(encounter: Encounter, creatureUID: string, creatureName: string = "unknown"): Creature {
        let foundCreature: Creature = encounter.getCreatures().find((obj: Creature) => { return obj.getUID() == creatureUID; });

        if (typeof foundCreature === "undefined") {
            foundCreature = new Creature(creatureUID, creatureName);
            encounter.addCreature(foundCreature);
        }

        return foundCreature;
    }

    // Get pet in creature
    private getPetWithUIDInCreature(creature: Creature, petUID: string, petName: string): Creature {
        let foundPet: Creature = creature.getPets().find((obj: Creature) => { return obj.getUID() == petUID; });

        if (typeof foundPet === "undefined") {
            foundPet = new Creature(petUID, petName);
            creature.addPet(foundPet);
        }

        return foundPet;
    }

    // Parse the combat log
    public parse(): void {
        // Create the encounters
        this.body["encounters"].forEach((encounter: JSON) => {
            let newEncounter = new Encounter(encounter["startTimestamp"], encounter["endTimestamp"], encounter);
            this.encounters.push(newEncounter);
        });

        // Add creatures to the encounter and their casts that were casted during the encounter
        // Also add their pets and their casts that were casted during the encounter
        this.body["creatures"].forEach((creature: JSON) => {
            // Grab Casts
            creature["casts"].forEach((cast: JSON) => {
                let encounter: Encounter = this.encounters.find((obj: Encounter) => { return obj.timestampWasDuring(cast["timestamp"]); });

                if (typeof encounter !== "undefined") {
                    let creatureCaster: Creature = this.getCreatureWithUIDInEncounter(encounter, creature["UID"], creature["name"]);
                    let newCast: Cast = new Cast(cast);

                    creatureCaster.addCast(newCast);
                }
            });
            
            // Grab Pet Casts
            creature["pets"].forEach((pet: JSON) => {
                pet["casts"].forEach((cast: JSON) => {
                    let encounter: Encounter = this.encounters.find((obj: Encounter) => { return obj.timestampWasDuring(cast["timestamp"]); });
                    
                    if (typeof encounter !== "undefined") {
                        let creatureOwner: Creature = this.getCreatureWithUIDInEncounter(encounter, creature["UID"], creature["name"]);
                        let creaturePet: Creature = this.getPetWithUIDInCreature(creatureOwner, pet["UID"], pet["name"]);
                        let newCast: Cast = new Cast(cast);

                        creaturePet.addCast(newCast);
                    }
                });
            });
        });

        // Set all the player factionIDs and specIDs
        this.encounters.forEach((encounter: Encounter) => {
            encounter.getCombatants().forEach((combatant: Object) => {
                let creature: Creature = this.getCreatureWithUIDInEncounter(encounter, combatant["combatantUID"]);
                creature.setFactionID(Number(combatant["factionID"]));
                creature.setSpecID(Number(combatant["specID"]));
            });
        });

        // Calculate all creatures: DPS, HPS, Damage Done, and Healing Done
        this.encounters.forEach((encounter: Encounter) => {
            encounter.getCreatures().forEach((creature: Creature) => {
                // Add creature casts amount to total damage/healing done
                creature.getCasts().forEach((cast: Cast) => {
                    if (this.damageDealtEvents.includes(cast.getEvent())) creature.addToTotalDamageDone(cast.getAmount());
                    else if (this.healEvents.includes(cast.getEvent())) creature.addToTotalHealingDone(cast.getAmount() - cast.getOverhealing());
                });

                // Add the creatures pets casts amount to toal damage/healing done (and to pets)
                creature.getPets().forEach((pet: Creature) => {
                    pet.getCasts().forEach((cast: Cast) => {
                        if (this.damageDealtEvents.includes(cast.getEvent())) {
                            creature.addToTotalDamageDone(cast.getAmount());
                            pet.addToTotalDamageDone(cast.getAmount());
                        } else if (this.healEvents.includes(cast.getEvent())) {
                            creature.addToTotalHealingDone(cast.getAmount());
                            pet.addToTotalDamageDone(cast.getAmount());
                        }
                    });
                });

                // Calculate DPS and HPS (for player)
                creature.setDPS(creature.getTotalDamageDone() / (encounter.getDurationInMilliseconds() / 1000));
                creature.setHPS(creature.getTotalHealingDone() / (encounter.getDurationInMilliseconds() / 1000));
            });
        });
    }

    public displayData(): void {
        let encounter: Encounter = this.encounters[this.currentEncounterIndex];
        if (typeof encounter === "undefined") return;

        document.getElementById("encounterNameContainer").innerHTML = encounter.getName();

        let sortedCreaturesByDamage: Array<Creature> = encounter.getCreatures().sort((a: Creature, b: Creature) => (a.getTotalDamageDone() < b.getTotalDamageDone() ? 1 : -1));
        let currentPosition: number = 0;
        sortedCreaturesByDamage.forEach((creature: Creature) => {
            if (creature.isPlayer() && creature.getName() != "unknown") {
                currentPosition++;
                let result = (`
                    <tr>
                        <td>${currentPosition}</td>
                        <td>
                            <img src="images/${creature.getSpecImageURL()}" class="specImage"> 
                            <font color="${creature.getClassColor()}">
                                ${creature.getName()}
                            </font>
                        </td>
                        <td>${numberFormat(Math.floor(creature.getTotalDamageDone()))}</td>
                        <td>${numberFormat(Math.floor(creature.getDPS()))}
                    </tr>
                `);

                document.getElementById("resultContainer").insertAdjacentHTML("beforeend", result);
            }
        });
    }

    public displayNextEncounter(): void {
        this.currentEncounterIndex++;
        if (this.currentEncounterIndex >= this.encounters.length) this.currentEncounterIndex = 0;

        document.getElementById("resultContainer").innerHTML = "";
        this.displayData();
    }

    public displayPreviousEncounter(): void {
        this.currentEncounterIndex++;
        if (this.currentEncounterIndex < 0) this.currentEncounterIndex = this.encounters.length - 1;

        document.getElementById("resultContainer").innerHTML = "";
        this.displayData();
    }
};