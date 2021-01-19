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
      // introduction: 50000,
      response: 10000
    },

    // # Game specific properties

    // Number of game rounds to repeat.
    ROUNDS: 5,

    // Number of coins available each round.
    COINS: 1.5,

    // Minutes to complete the task.
    COMPLETE_TIME: 10,

    // Exchange rate coins to dollars.
    EXCHANGE_RATE: 1,

    // Rate of Vaccinated population.
    popRate:[5, 23, 51, 72, 90],

    // # Treatments definition.

    // They can contain any number of properties, and also overwrite
    // those defined above.

    // If the `treatments` object is missing a treatment named _standard_
    // will be created automatically, and will contain all variables.

    treatments: {

        groupA: {
            description: "Not mention infection rate",
            scenario: "groupA.htm",
            treat:"A"

        },

        groupB: {
            description: "Infection rate 1",
            infectRate: 1,
            scenario: "groupB.htm",
            treat:"B"

        },

        groupC: {
            description: "Infection rate 5",
            infectRate: 5,
            scenario: "groupC.htm",
            treat:"C"
        },

        groupD: {
            description: "Infection rate 10",
            infectRate: 10,
            scenario: "groupD.htm",
            treat:"D"
        }


    }
};
