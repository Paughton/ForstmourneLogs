import { Encounter } from "./encounter.js";
import { Creature } from "./creature.js";
import { Cast } from "./cast.js";

export class LogParser {
    private body: JSON;
    private version: string = "1.0";
    private logVersion: number;
    private gameBuild: string;
    private programVersion: string;
    private encounters: Array<Encounter>;
    private mostValuablePlayer: string;

    constructor(body: JSON, logVersion: number, gameBuild: string, programVersion: string) {
        this.body = body;
        this.logVersion = logVersion;
        this.programVersion = programVersion;
        this.gameBuild = gameBuild;
        this.programVersion = programVersion;

        this.encounters = Array<Encounter>();
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
            let newEncounter = new Encounter(encounter["timestamp"], encounter["timestampEnd"], encounter);
            this.encounters.push(newEncounter);
        });

        // Add creatures to the encounter and their casts that were casted during the encounter
        // Also set the creatures encounter information (if applicable)
        // Also add their pets and their casts that were casted during the encounter
        this.body["entities"].forEach((creature: JSON) => {
            // Grab Casts
            creature["events"].forEach((event: JSON) => {
                switch (event["event"]) {
                    case "DAMAGE":
                    case "HEAL":
                        var encounter: Encounter = this.encounters.find((obj: Encounter) => { return obj.timestampWasDuring(event["timestamp"]); });

                        if (typeof encounter !== "undefined") {
                            let creatureCaster: Creature = this.getCreatureWithUIDInEncounter(encounter, creature["UID"], creature["name"]);
                            let newCast: Cast = new Cast(event);

                            creatureCaster.addCast(newCast);
                        }
                        break;

                    case "COMBATANT":
                        var encounter: Encounter = this.encounters.find((obj: Encounter) => { return obj.timestampWasDuring(event["timestamp"]); });

                        if (typeof encounter !== "undefined") {
                            let combatant: Creature = this.getCreatureWithUIDInEncounter(encounter, creature["UID"], creature["name"]);
                            
                            combatant.setFactionID(Number(event["factionID"]));
                            combatant.setSpecID(Number(event["specID"]));
                        }
                        break;
                }
            });
            
            // Grab Pet Casts
            creature["pets"].forEach((pet: JSON) => {
                pet["events"].forEach((event: JSON) => {
                    switch (event["event"]) {
                        case "DAMAGE":
                        case "HEAL":
                            let encounter: Encounter = this.encounters.find((obj: Encounter) => { return obj.timestampWasDuring(event["timestamp"]); });
                            
                            if (typeof encounter !== "undefined") {
                                let creatureOwner: Creature = this.getCreatureWithUIDInEncounter(encounter, creature["UID"], creature["name"]);
                                let creaturePet: Creature = this.getPetWithUIDInCreature(creatureOwner, pet["UID"], pet["name"]);
                                let newCast: Cast = new Cast(event);

                                creaturePet.addCast(newCast);
                            }
                            break;
                    }
                });
            });
        });

        // Calculate all creatures: DPS, HPS, Damage Done, Healing Done, and Item Level
        this.encounters.forEach((encounter: Encounter) => {
            encounter.getCreatures().forEach((creature: Creature) => {
                // Add creature casts amount to total damage/healing done
                creature.getCasts().forEach((cast: Cast) => {
                    if (cast.getEvent() == "DAMAGE") creature.addToTotalDamageDone(cast.getAmount());
                    else if (cast.getEvent() == "HEAL") creature.addToTotalHealingDone(cast.getAmount() - cast.getOverhealing());
                });

                // Add the creatures pets casts amount to toal damage/healing done (and to pets)
                creature.getPets().forEach((pet: Creature) => {
                    pet.getCasts().forEach((cast: Cast) => {
                        if (cast.getEvent() == "DAMAGE") {
                            creature.addToTotalDamageDone(cast.getAmount());
                            pet.addToTotalDamageDone(cast.getAmount());
                        } else if (cast.getEvent() == "HEAL") {
                            creature.addToTotalHealingDone(cast.getAmount());
                            pet.addToTotalHealingDone(cast.getAmount());
                        }
                    });

                    pet.setDPS(pet.getTotalDamageDone() / (encounter.getDurationInMilliseconds() / 1000));
                    pet.setHPS(pet.getTotalHealingDone() / (encounter.getDurationInMilliseconds() / 1000));
                });

                // If the creature is a player then add it's damage done to the whole encounter
                if (creature.isPlayer()) {
                    encounter.addToTotalGroupDamage(creature.getTotalDamageDone());
                    encounter.addToTotalGroupHealing(creature.getTotalHealingDone());
                }

                // Calculate DPS and HPS (for player) and Item Level
                creature.setDPS(creature.getTotalDamageDone() / (encounter.getDurationInMilliseconds() / 1000));
                creature.setHPS(creature.getTotalHealingDone() / (encounter.getDurationInMilliseconds() / 1000));
            });
        });

        // Get the most valuable player
        let tempCreatures: Object = {};
        this.encounters.forEach((encounter: Encounter) => {
            encounter.getCreatures().forEach((creature: Creature) => {
                if (creature.isPlayer()) {
                    if (typeof(tempCreatures[creature.getUID()]) === "undefined") tempCreatures[creature.getUID()] = {name: creature.getName(), totalDamageDone: creature.getTotalDamageDone(), totalHealingdone: creature.getTotalHealingDone()};
                    else {
                        tempCreatures[creature.getUID()].totalDamageDone += creature.getTotalDamageDone();
                        tempCreatures[creature.getUID()].totalHealingDone += creature.getTotalHealingDone();
                    }
                }
            });
        });

        // Grab MVP
        let mvpIndex: string = Object.keys(tempCreatures).sort((a: string, b: string) => {
            return (tempCreatures[b].totalDamageDone + tempCreatures[b].totalHealingDone) - (tempCreatures[a].totalDamageDone + tempCreatures[a].totalHealingDone);
        })[0];

        this.mostValuablePlayer = tempCreatures[mvpIndex].name;

        delete this.body;
    }

    public getEncounters(): Array<Encounter> {
        return this.encounters;
    }

    public getProgramVersion(): string {
        return this.programVersion;
    }

    public getMostValuablePlayer(): string {
        return this.mostValuablePlayer;
    }
};