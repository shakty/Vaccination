/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2020 KLC <->
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

const ngc = require('nodegame-client');
const J = ngc.JSUS;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    let node = gameRoom.node;
    let channel = gameRoom.channel;
    let memory = node.game.memory;

    // Make the logic independent from players position in the game.
    stager.setDefaultStepRule(ngc.stepRules.SOLO);

    // Must implement the stages here.

    stager.setOnInit(function() {

        // Feedback.
        memory.view('feedback').save('feedback.csv', {
            header: [ 'time', 'timestamp', 'player', 'feedback' ],
            keepUpdated: true
        });

        // Email.
        memory.view('email').save('email.csv', {
            header: [ 'timestamp', 'player', 'email' ],
            keepUpdated: true
        });

        // Win.
        memory.view('decision').save('vaccination.csv', {
            header: [
                'session', 'player', 'round', 'vaccination',
            ],
            keepUpdated: true
        });

        // Update player's guess with information if he or she won.

        node.on('get.decision', function(msg) {
            let item = memory.player[msg.from].last();
            return {
                vaccinate: item.vaccinate
            };
        });

        node.on.data('done', function(msg) {

            let id = msg.from;
            let step = node.game.getStepId(msg.stage);

            if (step === 'opend' &&
                msg.stage.round === settings.ROUNDS) {

                

                let db = memory.player[id];
                // Select all 'done' items and save its time.
                db.select('done').save('times.csv', {
                    header: [
                        'session', 'player', 'stage', 'step', 'round',
                        'time', 'timeup'
                    ],
                    append: true
                });
            }
        });
    });

    stager.setOnGameOver(function() {
        // Something to do.
    });
};
