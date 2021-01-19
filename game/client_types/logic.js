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

      // numeric values for the risk stage.
      this.riskStage = node.game.plot.normalizeGameStage('risk');

    // Feedback.
    memory.view('feedback').save('feedback.csv', {
      header: [ 'time', 'timestamp', 'player','stage', 'feedback' ],
      keepUpdated: true
    });

    // // Email.
    // memory.view('email').save('email.csv', {
    //   header: [ 'timestamp', 'player', 'email' ],
    //   keepUpdated: true
    // });


    // Vaccination.
    memory.view('vaccinate').save('vaccination.csv', {
      header: [
        'session', 'player', 'round', 'vaccinate','treatment','poprate'
      ],
      keepUpdated: true
    });

    // Demo1.
    memory.view('gender').save('demo1.csv', {
      header: [
        'session', 'player', 'gender','othergender','agegroup',
        'maritalStatus',
        'education','countryOfOrigin','income','occupation'
      ],
      keepUpdated: true
    });

    // Pols.
    memory.view('communityService').save('pols.csv', {
      header: [
        'session', 'player', 'communityService', 'confGov',
        'confPolParties', 'confParliament' , 'confCompanies', 'libCons'
      ],
      keepUpdated: true
    });

    // Health.
    memory.view('perception').save('health.csv', {
      header: [
        'session', 'player', 'perception', 'eating','exercises'
      ],
      keepUpdated: true
    });


    // Risk.
    memory.view('risk').save('risk.csv', {
      header: [
        'session', 'player','risk', 'totalMove'
      ],
      keepUpdated: true
    });

    // Risk.
    memory.view('covid').save('covid.csv', {
      header: [
        'session', 'player','covid'
      ],
      keepUpdated: true
    });


    // Notify the player about his/her decision.
    node.on('get.vaccination', function(msg) {
      let item = memory.player[msg.from].last();
      return {
        vaccinate: item.vaccinate
      };
    });

    // All decisions.
    node.on('get.decisions',function() {

      let item1 = memory.stage['5.1.1'].last();
      let item2 = memory.stage['5.1.2'].last();
      let item3 = memory.stage['5.1.3'].last();
      let item4 = memory.stage['5.1.4'].last();
      let item5 = memory.stage['5.1.5'].last();

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

      });

    });

    node.on.data('end', function(msg) {

        let client = channel.registry.getClient(msg.from);
        if (!client) return;

        if (client.checkout) {
            // Just resend bonus
            gameRoom.computeBonus({
                clients: [ msg.from ],
                dump: false
             });
        }
        else {


            // Bonus from the RiskGauge.
            let item = memory.stage[this.riskStage].last();

            // Coins for the questions.
            gameRoom.updateWin(msg.from, (settings.COINS + item.reward), {
                clear: true
            });

            // Compute total win.
            gameRoom.computeBonus({
                clients: [ msg.from ]
            });

            // Mark client checked out.
            channel.registry.checkOut(msg.from);

            // Select all 'done' items and save everything as json.
            memory.select('done').save('memory_all.json');

        }

    });

  };
