import { LogParser } from "./classes/logparser.js";

window.onload = function(): void {
    const xmlHTTP: XMLHttpRequest = new XMLHttpRequest();
    
    xmlHTTP.onreadystatechange = function(): void {
        if (xmlHTTP.readyState == XMLHttpRequest.DONE) {
            let body: JSON = JSON.parse(xmlHTTP.responseText);
            let version: number = Number(body["programVersion"]);
            let gameBuild: string = body["buildVersion"];
            let programVersion: string = body["programVersion"];

            const logParser = new LogParser(body, version, gameBuild, programVersion);
            logParser.parse();

            document.getElementById("previousEncounterButton").onclick = () => { logParser.displayPreviousEncounter() };
            document.getElementById("nextEncounterButton").onclick = () => { logParser.displayNextEncounter() };
        }
    }

    xmlHTTP.open("GET", "http://localhost:8080/frostmournelogs/public/logs/output.json", true);
    xmlHTTP.send();
};