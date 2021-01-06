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



          memory.view('feedback').save('feedback.csv', {
              header: [ 'time', 'timestamp', 'player','stage', 'feedback' ],
              keepUpdated: true
          });

        // Email.
        memory.view('email').save('email.csv', {
            header: [ 'timestamp', 'player', 'email' ],
            keepUpdated: true
        });



        memory.view('vaccinate').save('vaccination.csv', {
            header: [
                'session', 'player', 'round', 'vaccinate','treatment','poprate'
            ],

            keepUpdated: true
        });

        memory.view('gender').save('demo1.csv', {
            header: [
                'session', 'player', 'gender','othergender','agegroup','maritalStatus',
                'education','countryOfOrigin','income','occupation'
            ],

            keepUpdated: true
        });

        memory.view('communityService').save('pols.csv', {
            header: [
                'session', 'player', 'communityService', 'confGovernment',
                'confPolParties', 'confParliament' , 'confCompanies', 'libCons'
            ],

            keepUpdated: true
        });

        memory.view('perception').save('health.csv', {
            header: [
                'session', 'player', 'perception', 'eating','exercises'
            ],

            keepUpdated: true
        });

        memory.view('risk').save('risk.csv', {
            header: [
                'session', 'player','risk', 'totalMove'
            ],

            keepUpdated: true
        });






        node.on('get.vaccination', function(msg) {
            let item = memory.player[msg.from].last();
            return {
                vaccinate: item.vaccinate
            };
        });

        node.on('get.decisions',function() {

          let item1 = memory.stage['5.1.1'].last();
          let item2 = memory.stage['5.1.2'].last();
          let item3 = memory.stage['5.1.3'].last();
          let item4 = memory.stage['5.1.4'].last();
          let item5 = memory.stage['5.1.5'].last();

        gameRoom.updateWin(node.game.pl.first().id, settings.COINS);


          return {
            decisions: [item1.vaccinate,item2.vaccinate,item3.vaccinate,
              item4.vaccinate,item5.vaccinate]

          };
        });





        node.on.data('done', function() {
                // Select all 'done' items and save its time.
                memory.select('done').save('times.csv', {
                    header: [
                        'session', 'player', 'stage', 'step', 'round',
                        'time'
                    ],
                    append: true
                });

                let item = memory.stage['10.1.1'].last();

                gameRoom.updateWin(node.game.pl.first().id,item.reward);

                memory.select('done').save('memory_all.json');

                gameRoom.computeBonus();

        });




    });

    stager.setOnGameOver(function() {



    });
};
