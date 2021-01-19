/**
 * # Game stages definition file
 * Copyright(c) 2020 KLC <->
 * MIT Licensed
 *
 * Stages are defined using the stager API
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(stager, settings) {

    stager
        .next('introduction')
        .next('disease')
        .next('treat')
        .next('quiz')
        .repeat('game', settings.ROUNDS)
        .step('vaccination')
        .step('response')
        .next('opend')
        .next('demographics')
        .next('politics')
        .next('health')
        .next('risk')
        .next('feedback')
        .next('end')
        .gameover();

        // Modify the stager to skip one stage.
        // stager.skip('instructions');
        // stager.skip('disease');
        // stager.skip('treat');
        // stager.skip('quiz');
        // stager.skip('game');
        // stager.skip('opend');
        // stager.skip('demographics');
        // stager.skip('politics');
        // stager.skip('health');
        // stager.skip('risk');
        // stager.skip('end')

        // To skip a step within a stage use:
        // stager.skip('stageName', 'stepName');
        // Notice: here all stages have just one step.
};
