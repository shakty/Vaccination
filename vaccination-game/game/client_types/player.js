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
const J = ngc.JSUS;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {


    let channel = gameRoom.channel;
    let node = gameRoom.node;


    settings.popRate = J.shuffle(settings.popRate);
    let quizTextA = {

      mainText:
          'Which one of the choices below is one of the symptoms of the disease?',
      choices: [
          'Fever',
          'Paralysis',
          'Leg pain'
      ],
    }

    let quizTextO = {

      mainText:
          'What is the infection rate of the disease ?',
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

    stager.extendStep('introduction', {
            frame: 'introduction.htm',
            cb: function() {
            var s;
            // Note: we need to specify node.game.settings,
            // and not simply settings, because this code is
            // executed on the client.
            s = node.game.settings;
            // Replace variables in the instructions.
            W.setInnerHTML('coins', s.COINS);
            W.setInnerHTML('exchange-rate', (s.COINS * s.EXCHANGE_RATE));
        }
        });



    stager.extendStep('desease', {
          frame: 'disease.htm',
          cb: function() {
          var options;

          options = {
              id: 'disease',
              title: false,
              mainText: 'Answer the following question to check ' +
                        'your understanding of the terms.',
              choices: [ "There are 5 infected people.",
              "Every infected person infects 5 others on average.",
              "5% of the population are infected."] ,
              correctChoice: 1,
              shuffleChoices: true,
              orientation: 'v',
              className: 'centered'

          };


          /////////////////////////////////////////////////////////////
          // nodeGame hint: the widget collection
          //
          // Widgets are re-usable components with predefined methods,
          // such as: hide, highlight, disable, getValues, etc.
          ////////////////////////////////////////////////////////////////
          this.quest = node.widgets.append('ChoiceTable',
                                           W.gid('quiz'),
                                           options);

          W.cssRule('.choicetable-left, .choicetable-right ' +
                    '{ width: 200px !important; }');

      },

      done: function() {
            var answers, isTimeup;
            answers = this.quest.getValues();
            isTimeup = node.game.timer.isTimeup();
            if (!answers.choice && !isTimeup) {
                this.quest.highlight();
                return false;
            }
            return answers;
        }
      });




    stager.extendStep('treat', {
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
                        mainText: 'What is the death rate of the disease ?',
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
        frame: 'popVac.htm',
        cb: function() {

          var s;
          var r;
          s = node.game.settings;
          r = node.game.getRound();

          // Replace variables in the instructions.
          W.setInnerHTML('popRate', s.popRate[r-1]);
          W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
          W.cssRule('.choicetable-left, .choicetable-right ' +
                    '{ width: 200px !important; }');


        },

        widget: {
            name: 'ChoiceTable',
            ref: 'vac',
            options: {
                id: 'vac',
                mainText:
                '<br> <br> Will you vaccinate? <br>' ,
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

    stager.extendStep('response', {
        frame: 'vac.htm',
        cb: function() {
            // Ask for the outcome to server.
            node.get('decision', function(data) {
                // Display information to screen.
                W.setInnerHTML('decision', data.vaccinate ?
                    'vaccinate' : 'not vaccinate');

            });
        }
    });

    stager.extendStep('opend', {
      cb: function() {
        W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
        W.cssRule('.choicetable-left, .choicetable-right ' +
                  '{ width: 200px !important; }');
        parent.scrollTo(0,0);
    },
        widget: {
        name: 'Feedback',
        options: {
            title: false,
            panel: false,
            mainText: 'Can you briefly explain why you make this decision ? <br> <br>',
            sent: 'send',
            id: 'opend',
            requiredChoice: true,
            rows: 5,
            showSubmit: false,
            width: "100%"
        }
    }
    });

    stager.extendStep('demographics', {
      cb: function() {
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
                    id: 'agegroup',
                    mainText: 'What is your age group?',
                    choices: [ '18-19', '20-29', '30-39', '40-49',
                               '50-59', '60-69', '70-79', '80+' ],
                    hidden: false,
                    shuffleChoices: false
                },
                {
                    name: "ChoiceTable",
                    id: "MaritalStatus",
                    mainText: "With how many family members do you interact with on a weekly basis?",
                    choices: [
                        "0",
                        "1",
                        "2 or 3",
                        "4 or 5",
                        "6 or more"],
                        hidden: false,
                        shuffleChoices: false
                },
                {
                    name: "ChoiceTable",
                    id: "Education",
                    mainText: "What is the highest degree or level of education you have completed?",
                    choices: [
                        "No educational degree",
                        "Primary School",
                        "High School",
                        "Vocational training",
                        "Bachelor's Degree",
                        "Master's Degree",
                        "Ph.D. or higher",
                        "Trade School",
                        "Prefer not to say"
                    ],
                    hidden: false,
                    shuffleChoices: false
                },
                {
                    name: "ChoiceTable",
                    id: "Country of Origin",
                    mainText: "Where were you born?",
                    choices: [
                        "East Asia",
                        "Middle East",
                        "Africa",
                        "Central America",
                        "Europe",
                        "North America",
                        "Oceania",
                        "South America",
                        "Other",
                        "Prefer not to say"
                    ],
                    hidden: false,
                    shuffleChoices: false
                },
                {
                    name: "ChoiceTable",
                    id: "Income",
                    mainText: "Here are different levels of income. We would " +
                    "like to know in what group you would place yourself, " +
                    "counting all wages, salaries, pensions and other incomes that come in.",
                    choices: [
                        "No income",
                        "Lower income level",
                        "Middle underclass income level",
                        "Middle income level",
                        "Middle upperclass income level",
                        "Upper income level",
                        "Prefer not to say"
                    ],
                    hidden: false,
                    shuffleChoices: false
                },
                {
                    name: "ChoiceTable",
                    id: "Occupation",
                    mainText: "Which of the following best describes your current occupation?",
                    choices: [
                        "Management Occupations",
                        "Sales and Related Occupations",
                        "Building and Grounds Cleaning and Maintenance Occupations",
                        "Personal Care and Service Occupations",
                        "Arts, Design, Entertainment, Sports, and Media Occupations",
                        "Architecture and Engineering Occupations",
                        "Community and Social Service Occupations",
                        "Education, Training, and Library Occupations",
                        "Protective Service Occupations",
                        "Construction and Extraction Occupations",
                        "Farming, Fishing, and Forestry Occupations",
                        "Healthcare Support Occupations",
                        "Office and Administrative Support Occupations",
                        "Life, Physical, and Social Science Occupations",
                        "Legal Occupations",
                        "Food Preparation and Serving Related Occupations",
                        "Production Occupations",
                        "Installation, Maintenance, and Repair Occupations",
                        "Computer and Mathematical Occupations",
                        "Business and Financial Operations Occupations",
                        "Transportation and Materials Moving Occupations",
                        "Healthcare Practitioners and Technical Occupations",
                        "Other",
                        "Prefer not to say"
                    ],
                    hidden: false,
                    shuffleChoices: false,
                    orientation: 'V'
                }
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
        W.setInnerHTML('pagetitle', 'Survey: Your Social and Political Persona');
        W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
        W.cssRule('.choicetable-left, .choicetable-right ' +
                  '{ width: 200px !important; }');
        parent.scrollTo(0,0);
    },

    widget: {
        name: 'ChoiceTable',
        id: 'pol',
        options: {
            mainText: 'A few more questions and we are done.',
            forms: [
                {
                    name: 'ChoiceTable',
                    id: 'Community Service',
                    mainText: "Have you been a volunteer in the last 12 months"+
                    " for any social or community service and if yes, " +
                    " how often have you carried out this volunteering " +
                    "within the past 12 months?",
                    choices: [
                        "I did not volunteer in the last 12 months",
                        "Very ocassionally",
                        "A couple of times last year",
                        "One or two days a month",
                        "One day a week or more",
                    ],
                    hidden: false,
                    shuffleChoices: false
                },
                {
                    name: 'ChoiceTableGroup',
                    id: 'confidence',
                  options:  {
                    id: 'confidence',
                    mainText: "I am going to name a number of organizations." +
                    " For each one, could you tell me how much confidence" +
                    " you have in them?",
                    items: [
                        'The government (in your nation’s capital)',
                        'Political Parties',
                        'Parliament',
                        'Major Companies'],
                        choices: [ "A great deal",
                                    "Quite a lot",
                                    "Not very much",
                                    "None at all",
                                    "Prefer not to say"],
                                    shuffleItems: false,
                                    requiredChoice: true,
                                    left: 'Lowest',
                                    right: 'Highest'
                                },
                },
                {
                    name: 'ChoiceTable',
                    id: 'libcons',
                    mainText: 'On a scale from 1 to 7, where 1 means ' +
                        '"very liberal" and 7 means "very ' +
                        'conservative" where do you position yourself?',
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
	widget: {
	name: 'RiskGauge',
	root: 'container',
    id: "Risk",
	options: {
             method: 'Bomb',
             title: false,
             probBomb: 0.5,
             revealProbBomb: true,
             totBoxes: 50,
             maxBoxes: 25,
            }
		}
	});

//      risk.getValues();

//      {
//          value: 34,        // number of boxes opened.
//          isCorrect: true,  // TRUE, if the user has clicked on the 'Open boxes' button
//          isWinner: false,  // TRUE, if the user did not find the bomb after clicking on the 'Open boxes' button.
//          reward: 0,        // Total reward for the user.
//          time: 4444609,    // Time in milliseconds from the creation of the widget
//          totalMove: 57    // Total movement of the slider.
//      }



    stager.extendStep('end', {
        widget: 'EndScreen',
        init: function() {
            node.game.visualTimer.destroy();
            node.game.doneButton.destroy();
        }
    });
};
