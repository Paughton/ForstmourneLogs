export module IDConverters {
    export interface ClassInformation {
        name: string;
        color: string;
    };

    export interface SpecInformation {
        class: ClassInformation;
        imageURL: string;
        name: string;
    };

    interface IDConversion {
        [key: number]: SpecInformation;
    };

    const DeathKnightClass: ClassInformation = {
        name: "Death Knight",
        color: "#C41E3A"
    };

    const HunterClass: ClassInformation = {
        name: "Hunter",
        color: "#AAD372"
    };

    const ShamanClass: ClassInformation = {
        name: "Shaman",
        color: "#0070DD"
    };

    const DruidClass: ClassInformation = {
        name: "Druid",
        color: "#FF7C0A"
    };

    const WarriorClass: ClassInformation = {
        name: "Warrior",
        color: "#C69B6D"
    };

    const PaladinClass: ClassInformation = {
        name: "Paladin",
        color: "#F48CBA"
    };

    const WarlockClass: ClassInformation = {
        name: "Warlock",
        color: "#8788EE"
    };

    const DemonHunterClass: ClassInformation = {
        name: "Demon Hunter",
        color: "#A330C9"
    };

    const MageClass: ClassInformation = {
        name: "Mage",
        color: "#3FC7EB"
    };

    const MonkClass: ClassInformation = {
        name: "Monk",
        color: "#00FF98"
    };

    const RogueClass: ClassInformation = {
        name: "Rogue",
        color: "#FFF468"
    }

    const PriestClass: ClassInformation = {
        name: "Priest",
        color: "#FFFFFF"
    }

    // specID: ["Class Name", "Spec Image", "Spec Name"]
    export const specIDConversion: IDConversion = {
        250: {
            class: DeathKnightClass,
            imageURL: "deathknight_blood.png",
            name: "Blood"
        },
        251: {
            class: DeathKnightClass,
            imageURL: "deathknight_frost.png",
            name: "Frost"
        },
        252: {
            class: DeathKnightClass,
            imageURL: "deathknight_unholy.png",
            name: "Unholy"
        },
        253: {
            class: HunterClass,
            imageURL: "hunter_beastmastery.png",
            name: "Beast Master"
        },
        254: {
            class: HunterClass,
            imageURL: "hunter_marksmanship.png",
            name: "Marksmanship"
        },
        255: {
            class: HunterClass,
            imageURL: "hunter_survival.png",
            name: "Survival"
        },
        262: {
            class: ShamanClass,
            imageURL: "shaman_elemental.png",
            name: "Elemental"
        },
        263: {
            class: ShamanClass,
            imageURL: "shaman_enhancement.png",
            name: "Enhancement"
        },
        264: {
            class: ShamanClass,
            imageURL: "shaman_restoration.png",
            name: "Restoration"
        },
        102: {
            class: DruidClass,
            imageURL: "druid_balance.png",
            name: "Balance"
        },
        103: {
            class: DruidClass,
            imageURL: "druid_feral.png",
            name: "Feral"
        },
        104: {
            class: DruidClass,
            imageURL: "druid_guardian.png",
            name: "Guardian"
        },
        105: {
            class: DruidClass,
            imageURL: "druid_restoration.png",
            name: "Restoraion"
        },
        71: {
            class: WarriorClass,
            imageURL: "warrior_arms.png",
            name: "Arms"
        },
        72: {
            class: WarriorClass,
            imageURL: "warrior_fury.png",
            name: "Fury"
        },
        73: {
            class: WarriorClass,
            imageURL: "warrior_protection.png",
            name: "Protection"
        },
        65: {
            class: PaladinClass,
            imageURL: "paladin_holy.png",
            name: "Holy"
        },
        66: {
            class: PaladinClass,
            imageURL: "paladin_protection.png",
            name: "Protection"
        },
        70: {
            class: PaladinClass,
            imageURL: "paladin_retribution.png",
            name: "Retribution"
        },
        265: {
            class: WarlockClass,
            imageURL: "warlock_affliction.png",
            name: "Affliction"
        },
        266: {
            class: WarlockClass,
            imageURL: "warlock_demonology.png",
            name: "Demonology"
        },
        267: {
            class: WarlockClass,
            imageURL: "warlock_destruction.png",
            name: "Destruction"
        },
        577: {
            class: DemonHunterClass,
            imageURL: "demonhunter_havoc.png",
            name: "Havoc"
        },
        581: {
            class: DemonHunterClass,
            imageURL: "demonhunter_vengeance.png",
            name: "Vengeance"
        },
        62: {
            class: MageClass,
            imageURL: "mage_arcane.png",
            name: "Arcane"
        },
        63: {
            class: MageClass,
            imageURL: "mage_fire.png",
            name: "Fire"
        },
        64: {
            class: MageClass,
            imageURL: "mage_frost.png",
            name: "Frost"
        },
        268: {
            class: MonkClass,
            imageURL: "monk_brewmaster.png",
            name: "Brewmaster"
        },
        269: {
            class: MonkClass,
            imageURL: "monk_windwalker.png",
            name: "Windwalker"
        },
        270: {
            class: MonkClass,
            imageURL: "monk_mistweaver.png",
            name: "Mistweaver"
        },
        259: {
            class: RogueClass,
            imageURL: "rogue_assassination.png",
            name: "Assassination"
        },
        260: {
            class: RogueClass,
            imageURL: "rogue_outlaw.png",
            name: "Outlaw"
        },
        261: {
            class: RogueClass,
            imageURL: "rogue_subtlety.png",
            name: "Subtlety"
        },
        256: {
            class: PriestClass,
            imageURL: "priest_discipline.png",
            name: "Discipline"
        },
        257: {
            class: PriestClass,
            imageURL: "priest_holy.png",
            name: "Holy"
        },
        258: {
            class: PriestClass,
            imageURL: "priest_shadow.png",
            name: "Shadow"
        }
    };
};