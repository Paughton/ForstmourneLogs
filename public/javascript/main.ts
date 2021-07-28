import { LogParser } from "./classes/logparser.js";
import { Encounter } from "./classes/encounter.js";
import { Creature } from "./classes/creature.js";
import { numberFormat } from "./util.js";

const GLOBALS = {
    currentEncounter: 0,
    currentField: "damagedone"
};

window.onload = function(): void {
    const xmlHTTP: XMLHttpRequest = new XMLHttpRequest();
    
    xmlHTTP.onreadystatechange = function(): void {
        if (xmlHTTP.readyState == XMLHttpRequest.DONE) {
            let body: JSON = JSON.parse(xmlHTTP.responseText);
            let version: number = Number(body["programVersion"]);
            let gameBuild: string = body["buildVersion"];
            let programVersion: string = body["programVersion"];

            const logParser: LogParser = new LogParser(body, version, gameBuild, programVersion);
            logParser.parse();

            // Append dropdowns to the encoutner selector
            document.getElementById("encounterSelector").innerHTML = "";
            logParser.getEncounters().forEach((encounter: Encounter, encounterIndex: number) => {
                let selectOptionResult: string = (`
                    <option value="${encounterIndex}">${encounter.getName()} (${encounter.getDurationFormat()})</option>
                `);

                document.getElementById("encounterSelector").insertAdjacentHTML("beforeend", selectOptionResult);
            });

            // When the encounter selector is changed, display the new data
            document.getElementById("encounterSelector").onchange = () => {
                GLOBALS.currentEncounter = Number((<HTMLInputElement>document.getElementById("encounterSelector")).value);
                displayData(logParser);
            };

            // When the selector field is changed, display the new data
            document.getElementById("selectedFieldSelector").onchange = () => {
                GLOBALS.currentField = (<HTMLInputElement>document.getElementById("selectedFieldSelector")).value;
                displayData(logParser);
            };
            
            // Display data
            displayData(logParser);
        }
    }

    xmlHTTP.open("GET", "http://localhost:8080/frostmournelogs/public/logs/output.json", true);
    xmlHTTP.send();
};

// Appends all the data into the table, depending on the currentEncoutner and currentField
function displayData(logParser: LogParser): void {
    if (typeof logParser.getEncounters()[GLOBALS.currentEncounter] === "undefined") return;
    let encounter: Encounter = logParser.getEncounters()[GLOBALS.currentEncounter];

    document.getElementById("resultContainer").innerHTML = "";

    // Sort the arrays according to what the currentField is
    // i.e. if currentField == damagDone then sort by damage done
    let sortedArray: Array<Creature> = encounter.getCreatures();
    switch (GLOBALS.currentField) {
        case "damagedone":
            sortedArray = sortedArray.sort((a: Creature, b: Creature) => (a.getTotalDamageDone() < b.getTotalDamageDone() ? 1 : -1));
            document.getElementById("perSecondColumnHead").innerHTML = "DPS";
            break;

        case "healingdone":
            sortedArray = sortedArray.sort((a: Creature, b: Creature) => (a.getTotalHealingDone() < b.getTotalHealingDone() ? 1 : -1));
            document.getElementById("perSecondColumnHead").innerHTML = "HPS";
            break;
    }

    // Define variables
    let topPlayer: Creature;
    let currentPosition: number = 0;

    // For each creature make sure it is a player before displaying it's data
    sortedArray.forEach((creature: Creature) => {
        if (!creature.isPlayer() || creature.getName() == "unknown") return;
        currentPosition++;

        // The bar width for the top player will always be 100%
        // The other bars are based on how close they are to the top player (percantage wise)
        let amountBarWidth: number = 100; // 100%
        if (currentPosition == 1) topPlayer = creature;
        else {
            if (GLOBALS.currentField == "damagedone") amountBarWidth = Math.floor(creature.getTotalDamageDone() / topPlayer.getTotalDamageDone() * 100);
            else if (GLOBALS.currentField == "healingdone") amountBarWidth = Math.floor(creature.getTotalHealingDone() / topPlayer.getTotalHealingDone() * 100);
        }
        
        // Create the table row for the result
        let result: string = (``);
        switch (GLOBALS.currentField) {
            case "damagedone":
                result = (`
                    <tr>
                        <td class="centerText" data-border="true">${currentPosition}</td>
                        <td data-border="true">
                            <img src="images/${creature.getSpecImageURL()}" class="specImage"> 
                            <font class="unselectable" color="${creature.getClassColor()}">
                                ${creature.getName()}
                            </font>
                        </td>
                        <td class="centerText" data-border="true">${creature.getItemLevel()}</td>
                        <td data-border="true">
                            <div class="progressBarContainer" data-theme="dark">
                                <div class="progressBar" style="width: ${amountBarWidth}%; background-color: ${creature.getClassColor()};">&nbsp;</div>
                                <div class="textContainer textShadowDark">${numberFormat(Math.floor(creature.getTotalDamageDone()))} (${Math.floor(creature.getTotalDamageDone() / encounter.getTotalGroupDamage() * 100)}%)</div>
                            </div>
                        </td>
                        <td class="centerText" data-border="true">${numberFormat(Math.floor(creature.getDPS()))}
                    </tr>
                `);
                break;

            case "healingdone":
                result = (`
                    <tr>
                        <td class="centerText" data-border="true">${currentPosition}</td>
                        <td data-border="true">
                            <img src="images/${creature.getSpecImageURL()}" class="specImage"> 
                            <font class="unselectable" color="${creature.getClassColor()}">
                                ${creature.getName()}
                            </font>
                        </td>
                        <td class="centerText" data-border="true">${creature.getItemLevel()}</td>
                        <td data-border="true">
                            <div class="progressBarContainer" data-theme="dark">
                                <div class="progressBar" style="width: ${amountBarWidth}%; background-color: ${creature.getClassColor()};">&nbsp;</div>
                                <div class="textContainer">${numberFormat(Math.floor(creature.getTotalHealingDone()))} (${Math.floor(creature.getTotalHealingDone() / encounter.getTotalGroupHealing() * 100)}%)</div>
                            </div>
                        </td>
                        <td class="centerText" data-border="true">${numberFormat(Math.floor(creature.getHPS()))}
                    </tr>
                `);
                break;
        }

        // Append the result
        document.getElementById("resultContainer").insertAdjacentHTML("beforeend", result);
    });
}