export module IDConverters {

    interface IDConversion {
        [key: number]: Array<string>;
    };

    const specIDConversion: IDConversion = {
        250: ["Death Knight", "Blood"],
        251: ["Death Knight", "Frost"],
        252: ["Death Knight", "Unholy"]
    };

}