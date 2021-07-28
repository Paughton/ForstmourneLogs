import { Encounter } from "./encounter.js";
import { Creature } from "./creature.js";
import { Cast } from "./cast.js";
import { numberFormat } from "../util.js";
import { Item } from "./item.js";

export class LogParser {
    private body: JSON;
    private version: number;
    private gameBuild: string;
    private programVersion: string;
    private encounters: Array<Encounter>;
    private currentEncounterIndex: number = 0;
    private currentSelectedField: string = "damagedone";

    private damageDealtEvents: Array<string> = [
        "SPELL_DAMAGE",
        "RANGE_DAMAGE",
        "SPELL_PERIODIC_DAMAGE",
        "SWING_DAMAGE_LANDED"
    ];

    private healEvents: Array<string> = [
        "SPELL_HEAL",
        "SPELL_PERIODIC_HEAL",
        "SPELL_ABSORBED"
    ];

    constructor(body: JSON, version: number, gameBuild: string, programVersion: string) {
        this.body = body;
        this.version = version;
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
        // Also add all items to players
        this.encounters.forEach((encounter: Encounter) => {
            encounter.getCombatants().forEach((combatant: Object) => {
                let creature: Creature = this.getCreatureWithUIDInEncounter(encounter, combatant["combatantUID"]);
                creature.setFactionID(Number(combatant["factionID"]));
                creature.setSpecID(Number(combatant["specID"]));

                combatant["items"].forEach((item: JSON) => {
                    if (item["level"] == "1" || item["level"] == "0") return;
                    let newItem: Item = new Item(Number(item["ID"]), Number(item["level"]));
                    creature.addItem(newItem);
                });
            });
        });

        // Calculate all creatures: DPS, HPS, Damage Done, Healing Done, and Item Level
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

                // Get the item levels of all items
                creature.getItems().forEach((item: Item) => {
                    creature.addToTotalItemLevel(item.getLevel());
                });

                // If the creature is a player then add it's damage done to the whole encounter
                if (creature.isPlayer()) {
                    encounter.addToTotalGroupDamage(creature.getTotalDamageDone());
                    encounter.addToTotalGroupHealing(creature.getTotalHealingDone());
                }

                // Calculate DPS and HPS (for player) and Item Level
                creature.setDPS(creature.getTotalDamageDone() / (encounter.getDurationInMilliseconds() / 1000));
                creature.setHPS(creature.getTotalHealingDone() / (encounter.getDurationInMilliseconds() / 1000));
                creature.setItemLevel(Math.round(creature.getTotalItemLevel() / creature.getItems().length));
            });
        });

        // Append dropdowns to the encoutner selector
        document.getElementById("encounterSelector").innerHTML = "";
        this.encounters.forEach((encounter: Encounter, encounterIndex: number) => {
            let selectOptionResult: string = (`
                <option value="${encounterIndex}">${encounter.getName()} (${encounter.getDurationFormat()})</option>
            `);

            document.getElementById("encounterSelector").insertAdjacentHTML("beforeend", selectOptionResult);
        });

        // When the encounter selector is changed, display the corresponding encounter
        document.getElementById("encounterSelector").onchange = () => {
            this.currentEncounterIndex = Number((<HTMLInputElement>document.getElementById("encounterSelector")).value);
            this.displayData();
        };

        // When the selector field is changed
        document.getElementById("selectedFieldSelector").onchange = () => {
            this.currentSelectedField = (<HTMLInputElement>document.getElementById("selectedFieldSelector")).value;
            this.displayData();
        };
    }

    public displayData(): void {
        let encounter: Encounter = this.encounters[this.currentEncounterIndex];
        if (typeof encounter === "undefined") return;

        document.getElementById("resultContainer").innerHTML = "";

        let sortedCreatureArray: Array<Creature> = encounter.getCreatures();
        if (this.currentSelectedField == "damagedone"){
            sortedCreatureArray = encounter.getCreatures().sort((a: Creature, b: Creature) => (a.getTotalDamageDone() < b.getTotalDamageDone() ? 1 : -1));
            document.getElementById("perSecondColumnHead").innerHTML = "DPS";
        } else if (this.currentSelectedField == "healingdone") {
            sortedCreatureArray = encounter.getCreatures().sort((a: Creature, b: Creature) => (a.getTotalHealingDone() < b.getTotalHealingDone() ? 1 : -1));
            document.getElementById("perSecondColumnHead").innerHTML = "HPS";
        }
        
        let topPlayer: Creature;
        let currentPosition: number = 0;
        sortedCreatureArray.forEach((creature: Creature) => {
            if (creature.isPlayer() && creature.getName() != "unknown") {
                currentPosition++;

                let barWidth: number = 100;
                if (currentPosition == 1) topPlayer = creature;
                if (topPlayer != creature) {
                    if (this.currentSelectedField == "damagedone") barWidth = Math.floor(creature.getTotalDamageDone() / topPlayer.getTotalDamageDone() * 100);
                    else if (this.currentSelectedField == "healingdone") barWidth = Math.floor(creature.getTotalHealingDone() / topPlayer.getTotalHealingDone() * 100);
                }

                let tableResult: string = (``);
                switch (this.currentSelectedField) {
                    case "damagedone":
                        tableResult = (`
                            <tr>
                                <td class="centerText" data-border="true">${currentPosition}</td>
                                <td data-border="true">
                                    <img src="images/${creature.getSpecImageURL()}" class="specImage"> 
                                    <font color="${creature.getClassColor()}">
                                        ${creature.getName()}
                                    </font>
                                </td>
                                <td class="centerText" data-border="true">${creature.getItemLevel()}</td>
                                <td data-border="true">
                                    <div class="progressBarContainer" data-theme="dark">
                                        <div class="progressBar" style="width: ${barWidth}%; background-color: ${creature.getClassColor()};">&nbsp;</div>
                                        <div class="textContainer textShadowDark">${numberFormat(Math.floor(creature.getTotalDamageDone()))} (${Math.floor(creature.getTotalDamageDone() / encounter.getTotalGroupDamage() * 100)}%)</div>
                                    </div>
                                </td>
                                <td class="centerText" data-border="true">${numberFormat(Math.floor(creature.getDPS()))}
                            </tr>
                        `);
                        break;

                    case "healingdone":
                        tableResult = (`
                            <tr>
                                <td class="centerText" data-border="true">${currentPosition}</td>
                                <td data-border="true">
                                    <img src="images/${creature.getSpecImageURL()}" class="specImage"> 
                                    <font color="${creature.getClassColor()}">
                                        ${creature.getName()}
                                    </font>
                                </td>
                                <td class="centerText" data-border="true">${creature.getItemLevel()}</td>
                                <td data-border="true">
                                    <div class="progressBarContainer" data-theme="dark">
                                        <div class="progressBar" style="width: ${barWidth}%; background-color: ${creature.getClassColor()};">&nbsp;</div>
                                        <div class="textContainer">${numberFormat(Math.floor(creature.getTotalHealingDone()))} (${Math.floor(creature.getTotalHealingDone() / encounter.getTotalGroupHealing() * 100)}%)</div>
                                    </div>
                                </td>
                                <td class="centerText" data-border="true">${numberFormat(Math.floor(creature.getHPS()))}
                            </tr>
                        `);
                        break;
                }
                

                document.getElementById("resultContainer").insertAdjacentHTML("beforeend", tableResult);
            }
        });
    }

    public displayNextEncounter(): void {
        this.currentEncounterIndex++;
        if (this.currentEncounterIndex >= this.encounters.length) this.currentEncounterIndex = 0;

        this.displayData();
    }

    public displayPreviousEncounter(): void {
        this.currentEncounterIndex++;
        if (this.currentEncounterIndex < 0) this.currentEncounterIndex = this.encounters.length - 1;

        this.displayData();
    }
};