/**
 * # Player type implementation of the game stages
 * Copyright(c) 2020 KLC <->
 * MIT Licensed
 *
 * Each client type must extend / implement the stages defined in `game.stages`.
 * Upon connection each client is assigned a client type and it is automatically
 * setup with it.
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

const ngc = require('nodegame-client');

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {



    let quizTextA = {

      mainText:
          'Which one of the choices below is one of the symptoms of the desease ?',
      choices: [
          'fever',
          'paralysis',
          'leg pain'
      ],
    }

    let quizTextO = {

      mainText:
          'What is the infection rate of the desease ?',
      choices: [
          settings.infectRate,
          0.5,
          15
      ],
    }




    // Make the player step through the steps without waiting for other players.
    stager.setDefaultStepRule(ngc.stepRules.SOLO);

    stager.setOnInit(function() {

        // Initialize the client.

        var header;

        // Setup page: header + frame.
        header = W.generateHeader();
        W.generateFrame();

        // Add widgets.
        this.visuaStage = node.widgets.append('VisualStage', header);
        this.visualRound = node.widgets.append('VisualRound', header);
        this.visualTimer = node.widgets.append('VisualTimer', header, {
            hidden: true // Initially hidden.
        });
        this.doneButton = node.widgets.append('DoneButton', header);

        // No need to show the wait for other players screen in single-player
        // games.
        W.init({ waitScreen: false });

        // Additional debug information while developing the game.
        // this.debugInfo = node.widgets.append('DebugInfo', header)
    });

    stager.extendStep('instructions', {
        frame: 'instructions.htm',
        cb: function() {
            var s;
            // Note: we need to specify node.game.settings,
            // and not simply settings, because this code is
            // executed on the client.
            s = node.game.settings;
            // Replace variables in the instructions.
            W.setInnerHTML('coins', s.COINS);
            W.setInnerHTML('rounds', s.ROUNDS);
            W.setInnerHTML('exchange-rate', (s.COINS * s.EXCHANGE_RATE));
        }
    });



    stager.extendStep('desease', {
        frame: settings.scenario,

    });





    stager.extendStep('quiz', {
        cb: function() {
            // Modify CSS rules on the fly.
            W.cssRule('.choicetable-left, .choicetable-right ' +
                      '{ width: 200px !important; }');

            W.cssRule('table.choicetable td { text-align: left !important; ' +
                      'font-weight: normal; padding-left: 10px; }');
        },

        // Make a widget step.
        widget: {
            name: 'ChoiceManager',
            id: 'quiz',
            options: {
                mainText: 'Answer the following questions to check ' +
                          'your understanding of the scenario.',
                forms: [
                    {
                        name: 'ChoiceTable',
                        id: 'deathRate',
                        mainText: 'What is the death rate of the desease ?',
                        choices: [ 1, 2, 5, 10 ],
                        correctChoice: 1
                    },
                    {
                        name: 'ChoiceTable',
                        id: 'infRate',
                        mainText: treatmentName === "groupA" ? quizTextA.mainText :
                        quizTextO.mainText,

                        choices: treatmentName === "groupA" ? quizTextA.choices :
                        quizTextO.choices,
                        correctChoice: 0
                    }
                ],
                // Settings here apply to all forms.
                formsOptions: {
                    shuffleChoices: true
                }
            }
        }
    });

    stager.extendStep('vaccination', {

        widget: {
            name: 'ChoiceTable',
            ref: 'vac',
            options: {
                id: 'vac',
                mainText:
                'There is a vaccine exists that already proven effective against' +
                'the desease. This vaccine has already been given to ' +
                  settings.popRate[3] + ' of the population. ' +
                '<br> <br> Will you vaccinate ? <br>',
                choices: [ 'Vaccinate', 'Not Vaccinate' ],
                requiredChoice: true,
                shuffleChoices: true,
                panel: false,
                title: false
            }
        },
        done: function(values) {
            return {
                vaccinate: values.value === 'Vaccinate'
            };
        }
    });

    stager.extendStep('opend', {
        frame: 'vac.htm',
        cb: function() {
            // Ask for the outcome to server.
            node.get('decision', function(data) {
                // Display information to screen.
                W.setInnerHTML('decision', data.vaccinate ?
                    'vaccinate' : 'not vaccinate');

            });
        },
        widget: {
        name: 'Feedback',
        options: {
            title: false,
            panel: false,
            mainText: 'Can you shortly explain why you make this decision ? <br> <br>',
            sent: 'send',
            id: 'opend',
            requiredChoice: true,
            rows: 5,
            showSubmit: false,

        }
    }
    });

    stager.extendStep('demographics', {
      cb: function() {
        W.setInnerHTML('pagetitle', 'Survey: Demographics');
        W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
        W.cssRule('.choicetable-left, .choicetable-right ' +
                  '{ width: 200px !important; }');
        parent.scrollTo(0,0);
    },
    widget: {
        name: 'ChoiceManager',
        ref: 'demo1',
        options: {
            id: 'demo1',
            mainText: 'Your demographics.',
            forms: [
                {
                    name: 'ChoiceTable',
                    id: 'gender',
                    mainText: 'What is your gender?',
                    choices: [ 'Male', 'Female', 'Other' ],
                    shuffleChoices: false,
                    onclick: function(value, removed) {
                        var w;
                        w = node.widgets.lastAppended.formsById.othergender;
                        if ((value === 2) && !removed) w.show();
                        else w.hide();
                        W.adjustFrameHeight();
                    },
                    preprocess: function(input) {
                        var str;
                        str = input.value;
                        str = str.charAt(0).toUpperCase() + str.substr(1);
                        input.value = str;
                    }
                },
                {
                    name: 'CustomInput',
                    id: 'othergender',
                    mainText: 'Please name your gender.',
                    width: '100%',
                    hidden: true
                },
                {
                    name: 'ChoiceTable',
                    id: 'race',
                    selectMultiple: true,
                    mainText: 'Do you identify with any ' +
                        'of the following races/ethnic groups?',
                    choices: [ 'White', 'African American',
                               'Latino', 'Asian',
                               'American Indian',
                               'Alaska Native',
                               'Native Hawaiian', 'Pacific Islander' ]
                },
                {
                    name: 'ChoiceTable',
                    id: 'agegroup',
                    mainText: 'What is your age group?',
                    choices: [ '18-19', '20-29', '30-39', '40-49',
                               '50-59', '60-69', '70-79', '80+' ],
                    hidden: false,
                    shuffleChoices: false
                },
              ],
              formsOptions: {
                requiredChoice: true,
            },

            className: 'centered'
        }
    }
  });


    stager.extendStep('politics', {

      cb: function() {
        W.setInnerHTML('pagetitle', 'Survey: Your Political Persona');
        W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
        W.cssRule('.choicetable-left, .choicetable-right ' +
                  '{ width: 200px !important; }');
        parent.scrollTo(0,0);
    },
    widget: {
        name: 'ChoiceManager',
        id: 'pol',
        options: {
            mainText: 'Your political orientation.',
            forms: [
                {
                    name: 'ChoiceTable',
                    id: 'followpol',
                    mainText: 'On a scale from 1 to 7, where 1 means ' +
                        '"not at all" and 7 means "very closely," how ' +
                        'closely do you follow US politics?',
                    choices: [1,2,3,4,5,6,7],
                    left: 'Not at all',
                    right: 'Very closely'
                },
                {
                    name: 'ChoiceTable',
                    id: 'demrep',
                    mainText: 'On a scale from 1 to 7, where 1 means ' +
                        '"strong Democrat" and 7 means "strong ' +
                        'Republican," where do you position yourself?',
                    choices: [1,2,3,4,5,6,7],
                    left: 'Democratic',
                    right: 'Republican'
                },
                {
                    name: 'ChoiceTable',
                    id: 'libcons',
                    mainText: 'On a scale from 1 to 7, where 1 means ' +
                        '"very liberal" and 7 means "very ' +
                        'conservative," where do you position yourself?',
                    choices: [1,2,3,4,5,6,7],
                    left: 'Liberal',
                    right: 'Conservative'
                }
              ],
              formsOptions: {
                requiredChoice: true,
            },

            className: 'centered'
        }
    }
});



    stager.extendStep('risk', {
      /////////////////////////////////////////////////////////////
      // nodeGame hint: the widget property
      //
      // It is a shortcut to create widget-steps.
      //
      // In a widget-step, the following operations are performed:
      //
      //   1- The widget is loaded, possibly appended. If no frame
      //      is specified, the default page
      //      '/pages/default.html' will be loaded.
      //   2- Upon `node.done`, the current values of the widget
      //      are validated, and if valid, and not timeup will be
      //      sent to server.
      //   3- Upon exiting the step, the widget will be destroyed.
      //
      // As a string, it just includes the name of the widget:
      //
      // ```
      // widget: 'MoodGauge'
      // ```
      //
      // As an object, additional options can be set:
      //
      // ```
      // widget: {
      //     name: 'MoodGauge',
      //     id: 'myid',
      //     ref: 'myref', // It will be added as node.game[ref]
      //     options: { ... }, // Options passed to `node.widgets.append()`
      //     append: false,
      //     checkAnswers: false,
      //     root: ...
      //     destroyOnExit: false
      // }
      // ```
      //////
      widget: {
          name: 'RiskGauge',
          options: {
              panel: false,
              title: false
          }
      }
  });



    stager.extendStep('end', {
        widget: 'EndScreen',
        init: function() {
            node.game.visualTimer.destroy();
            node.game.doneButton.destroy();
        }
    });
};
