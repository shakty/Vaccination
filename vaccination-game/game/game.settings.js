/**
 * # Game settings definition file
 * Copyright(c) 2020 KLC <->
 * MIT Licensed
 *
 * The variables in this file will be sent to each client and saved under:
 *
 *   `node.game.settings`
 *
 * The name of the chosen treatment will be added as:
 *
 *    `node.game.settings.treatmentName`
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // Variables shared by all treatments.

    // #nodeGame properties:

    /**
     * ### TIMER (object) [nodegame-property]
     *
     * Maps the names of the steps of the game to timer durations
     *
     * If a step name is found here, then the value of the property is
     * used to initialize the game timer for the step.
     */
    TIMER: {
      instructions: 50000,
      treatment: 50000,
      quiz: 50000,
      guess: 50000,
      demographics: 50000,
      politics: 50000,
      risk: 50000
    },

    // # Game specific properties

    // Number of game rounds to repeat.
    ROUNDS: 5,

    // Number of coins available each round.
    COINS: 1,

    // Exchange rate coins to dollars.
    EXCHANGE_RATE: 1,

    // Rate of Vaccinated population.
    popRate: [0,"<b>5%<b>", "<b>23%<b>", "<b>51%<b>", "<b>72%<b>", "<b>90%<b>"],

    // # Treatments definition.

    // They can contain any number of properties, and also overwrite
    // those defined above.

    // If the `treatments` object is missing a treatment named _standard_
    // will be created automatically, and will contain all variables.

    treatments: {

        groupA: {
            description: "Not mention infection rate",
            scenario: "groupA.htm"

        },

        groupB: {
            description: "Infection rate 1",
            infectRate: 1,
            scenario: "groupB.htm"
        },

        groupC: {
            description: "Infection rate 5",
            infectRate: 5,
            scenario: "groupC.htm"
        },

        groupD: {
            description: "Infection rate 10",
            infectRate: 10,
            scenario: "groupD.htm"
        }


    }
};
