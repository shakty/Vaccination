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

  // Quiz questions for the Quiz stage.
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
    this.backButton = node.widgets.append('BackButton', header, {
      hidden: true,
      acrossStages: true
    });
    this.doneButton = node.widgets.append('DoneButton', header);



    // No need to show the wait for other players screen in single-player
    // games.
    W.init({ waitScreen: false });

    // Additional debug information while developing the game.
    // this.debugInfo = node.widgets.append('DebugInfo', header)
  });

  stager.extendStep('introduction', {

    init: function() {
      // node.game.visualTimer.show();
    },
    frame: 'introduction.htm',
    cb: function() {
      var s;
      // Note: we need to specify node.game.settings,
      // and not simply settings, because this code is
      // executed on the client.
      s = node.game.settings;
      // Replace variables in the instructions.
      W.setInnerHTML('time', s.COMPLETE_TIME);
      W.setInnerHTML('coins', s.COINS);
      // W.setInnerHTML('exchange-rate', (s.EXCHANGE_RATE));
    }
  });




  stager.extendStep('disease', {
    name: 'Terminology',
    init: function() {
      // No need for the timer.
      node.game.visualTimer.hide();
    },

    frame: 'disease.htm',
    widget: {
      name: 'ChoiceManager',
      id: 'disease',
      options: {
        forms: [
          {
            name: 'ChoiceTable',
            id: 'infectionRate',
            mainText: '<br>What does an infection rate of' +
            ' X mean?  <br><br>',
            choices: [ "There are X infected people.",
            "Every infected person infects X others on average.",
            "X% of the population are infected."],
            correctChoice: 1
          },
        ],

        formsOptions: {
          requiredChoice: false,
          shuffleChoices: true,
          orientation: 'v',
        },

        className: 'centered',
        panel: false,
        required: true
      }
    }
  });



  // Show the treatment scenario.
  // Check settings for related scenario.
  stager.extendStep('treat', {
    name: 'Scenario',
    frame: settings.scenario,
    init: function() {
      node.game.backButton.hide();
    },
  });



  stager.extendStep('quiz', {
    init: function() {
      // Show backbutton.
      // Player can go back one stage back.
      node.game.backButton.show();
    },
    cb: function() {
      // Modify CSS rules on the fly.
      W.cssRule('.choicetable-left, .choicetable-right ' +
      '{ width: 200px !important; }');

      W.cssRule('table.choicetable td { text-align: left !important; ' +
      'font-weight: normal; padding-left: 10px; }');
    },

    // ChoiceManager widget for the questions.
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
        },
        required: true
      }
    }
  });

  stager.extendStep('vaccination', {
    name: 'Your Decision',
    init: function() {

      node.game.backButton.hide();
      node.game.visualTimer.hide();
      node.game.visualRound.show();
    },
    frame: 'popVac.htm',
    cb: function() {

      var s;
      var r;
      s = node.game.settings;
      r = node.game.getRound();

      // Replace variables in the html file according to round.
      W.setInnerHTML('popRate', s.popRate[r-1]);
      W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
      W.cssRule('.choicetable-left, .choicetable-right ' +
      '{ width: 200px !important; }');


    },

    widget: {
      name: 'ChoiceTable',
      ref:'vac',
      options: {
        id: 'vac',
        mainText: ' Will you vaccinate? ' ,
        choices: [ 'Vaccinate', 'Not Vaccinate' ],
        requiredChoice: true,
        panel: false,
        title: false
      }
    },
    done: function(values) {

      var s;
      var r;


      s = node.game.settings;
      r = node.game.getRound();

      // With done, return related information.
      return {
        vaccinate: values.value === 'Vaccinate',
        treatment: s.treat,
        poprate: s.popRate[r-1]
      };
    }
  });

  stager.extendStep('response', {

    frame: 'vac.htm',
    cb: function() {

      var s;
      var r;
      s = node.game.settings;
      r = node.game.getRound();

      // Replace variables in the instructions.
      W.setInnerHTML('popRate', s.popRate[r-1]);
      // Ask for the decision of the player to server.
      node.get('vaccination', function(data) {
        // Display information to screen.
        W.setInnerHTML('decision', data.vaccinate ?
        'to vaccinate' : 'not to vaccinate');

      });
    },
    // Go to next stage when time up.
    timeup: function() {
      node.done();
    }
  });

  stager.extendStep('opend', {
    frame: 'opend.htm',
    init: function() {
      node.game.visualTimer.hide();
    },
    cb: function() {

      var s;

      s = node.game.settings;

      // All decisions
      node.get('decisions', function(data) {


        // Display information to screen.
        W.setInnerHTML('decision1', data.decisions[0] ?
        'to vaccinate' : 'not to vaccinate');
        W.setInnerHTML('decision2', data.decisions[1] ?
        'to vaccinate' : 'not to vaccinate');
        W.setInnerHTML('decision3', data.decisions[2] ?
        'to vaccinate' : 'not to vaccinate');
        W.setInnerHTML('decision4', data.decisions[3] ?
        'to vaccinate' : 'not to vaccinate');
        W.setInnerHTML('decision5', data.decisions[4] ?
        'to vaccinate' : 'not to vaccinate');

        W.setInnerHTML('popRate1', s.popRate[0]);
        W.setInnerHTML('popRate2', s.popRate[1]);
        W.setInnerHTML('popRate3', s.popRate[2]);
        W.setInnerHTML('popRate4', s.popRate[3]);
        W.setInnerHTML('popRate5', s.popRate[4]);

      });

    },
    // Feedback
    widget: {
      name: 'Feedback',
      options: {
        title: false,
        panel: false,
        mainText: 'Can you briefly explain why you made these decisions?',
        sent: 'send',
        id: 'opend',
        rows: 5,
        showSubmit: false,
        width: "100%",
        minChars: 150,
        requiredChoice: true
      },

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
        mainText: 'Please answer now a brief survery about your demographics.',
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
            mainText: "With how many family members do you interact" +
            " with on a weekly basis?",
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
              mainText: "What is the highest degree or level of" +
              " education you have completed?",
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
              id: "CountryofOrigin",
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
              "counting all wages, salaries, pensions and other" +
              "incomes that come in.",
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
              mainText: "Which of the following best describes your" +
              " current occupation?",
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
              orientation: "V",
              hidden: false,
              shuffleChoices: false,
            }
          ],
          formsOptions: {
            requiredChoice: true,
          },
          required: true,

          className: 'centered'
        }
      },
      done: function(values) {
        // With done, return related information.
        return {
          gender: values.forms.gender.value ,
          othergender: values.forms.othergender.value,
          agegroup: values.forms.agegroup.value,
          maritalStatus: values.forms.MaritalStatus.value,
          education: values.forms.Education.value,
          countryOfOrigin: values.forms.CountryofOrigin.value,
          income: values.forms.Income.value,
          occupation: values.forms.Occupation.value
        };
      }
    });


    stager.extendStep('politics', {

      cb: function() {
        W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
        W.cssRule('.choicetable-left, .choicetable-right ' +
        '{ width: 200px !important; }');
        parent.scrollTo(0,0);
      },

      widget: {
        name: 'ChoiceManager',
        ref: 'poli',
        options: {
          id: "pol",
          mainText: 'Please answer a few more questions about politics.',
          forms: [
            {
              name: 'ChoiceTable',
              id: 'CommunityService',
              mainText: "Have you been a volunteer in the last 12 months"+
              " for any social or community service and if yes," +
              " how often have you carried out this volunteering " +
              "within the past 12 months?",
              choices: [
                "Never",
                "Once",
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
              mainText: "I am going to name a number of organizations." +
              " For each one, could you tell me how much confidence" +
              " you have in them?",
              items: [
                'The national/federal government',
                'Political parties',
                'Parliament',
                'Major Corporations'
              ],
                choices: [
                    "None at all",
                    "Not very much",
                    "Quite a lot",
                    "A great deal",
                  "Prefer not to say"
                ],
                  shuffleItems: false,
                  requiredChoice: true,
                  left: 'Lowest',
                  right: 'Highest'
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
              required: true,
              className: 'centered'
            }
          },
          done: function(values) {

            let vfc = values.forms.confidence;

            // With done, return related information.
            return {
              communityService: values.forms.CommunityService.value ,
              confGov: vfc.items['The national/federal government'].value,
              confPolParties: vfc.items['Political parties'].value,
              confParliament: vfc.items.Parliament.value,
              confCompanies: vfc.items['Major Corporations'].value,
              libCons: values.forms.libcons.value,

            };
          }

        });


        stager.extendStep('health', {

          cb: function() {
            W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
            W.cssRule('.choicetable-left, .choicetable-right ' +
            '{ width: 200px !important; }');
            parent.scrollTo(0,0);
          },

          widget: {
            name: 'ChoiceManager',
            ref: 'health',
            options: {
              id: "health",
              mainText: 'Please answer a few questions about your life style.',
              forms: [
                {
                  name: 'Slider',
                  id: 'Perception',
                  mainText: "On a scale of 1 to 10, how healthy do you" +
                  "consider yourself?",
                  min: 1,
                  max: 10,
                  initialValue: 5,
                  displayValue: true
                },
                {
                  name: 'ChoiceTable',
                  id: 'eating',
                  mainText: "What best describes your eating habits?",
                  choices: [ "Fairly regular and mostly consisting of" +
                  " home-cooked meals.",
                  "Fairly regular and not consisting of" +
                  " home-cooked meals.",
                  "Not regular and mostly consisting of" +
                  " home-cooked meals.",
                  "Not regular and not consisting of" +
                  " home-cooked meals.",
                ],
                shuffleItems: false,
              },
              {
                name: 'ChoiceTable',
                id: 'exercises',
                mainText: "We define exercising as a moderate- to high-intensity " +
                "workout. How often do you exercise?",
                choices: ["Never or almost never.",
                "Once to three times a month.",
                "Once a week.",
                "Two to four times a week.",
                "Five or more times a week."],
                shuffleItems: false,
              }
            ],
            formsOptions: {
              requiredChoice: true,
            },
            required: true,

            className: 'centered'
          }
        },
        done: function(values) {

          // With done, return related information.
          return {
            perception: values.forms.Perception.value ,
            eating: values.forms.eating.value,
            exercises: values.forms.exercises.value
          };
        }
      });


      stager.extendStep('health', {

        cb: function() {
          W.cssRule('.choicetable-maintext { padding-bottom: 20px; }');
          W.cssRule('.choicetable-left, .choicetable-right ' +
          '{ width: 200px !important; }');
          parent.scrollTo(0,0);
        },

        widget: {
          name: 'ChoiceManager',
          ref: 'health',
          options: {
            id: "health",
            mainText: 'Please answer a last <em>optional</em> question about your experience with Covid-19 virus.',
            hint: 'If you are uncomfortable answering the question below, please select "Prefer not to answer."',
            forms: [
              {
                name: 'ChoiceTable',
                id: 'covid',
                mainText: "Do you know somebody close to you (including yourself) who tested positive to the Covid-19 virus?",
                choices: [ "Yes", "No", "Prefer not to answer" ],
              shuffleItems: false,
              },

          ],
          formsOptions: {
            requiredChoice: true,
          },
          required: true,

          className: 'centered'
        }
      },
      done: function(values) {

        // With done, return related information.
        return {
          covidYou: values.forms.covid.value,
        };
      }
    });




      stager.extendStep('risk', {
        widget: {
          name: 'RiskGauge',
          root: 'container',
          id: "risk",
          options: {
            method: 'Bomb',
            title: false,
            probBomb: 0.5,
            revealProbBomb: true,
            totBoxes: 50,
            maxBoxes: 49,
          }
        },
        done: function(values) {

          // With done, return related information.
          return {
            risk: values.value ,
            totalMove: values.totalMove,
            reward: values.reward
          };
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
