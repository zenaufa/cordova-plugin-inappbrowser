var azdev = require("azure-devops-node-api")
var atob = require('atob');
var configurations = require('./configurations.json');

if(configurations.testPipelineArgs == null) {
    throw new Error("Missing testPipelineArg from configurations");
}

if(process.env.npm_config_jsonString == null) {
    throw new Error("Missing JSON string with appIDs and platforms");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function executePipeline(appID, plugin, platformVersion, azureProject, pipelineId) {
    const orgUrl = 'https://dev.azure.com/OutSystemsRD'
    const authHandler = azdev.getPersonalAccessTokenHandler('3ceo73no3f5qpooa5cm6kwexmnvhyniihacqgix7wsyqe24py7vq');
    const connection = new azdev.WebApi(orgUrl, authHandler);
    const buildApi = await connection.getBuildApi();
    const testApi = await connection.getTestApi();
    const build = {
        templateParameters: {
            "APP_ID": appID,
            "DATACENTER": "eu",
            "DEVICE_VERSION": platformVersion,
            "KEY": " ",
            "MABS": "latest",
            "PLUGIN_NAME": plugin,
            "RETRY": "1",
            "TAGS": " ",
            "TEST_TYPE": "native",
            "THREADS": "3",
            "TYPE_OF_DEVICE": "real",
            "USER": " ",
        },
    };
    const url = `${orgUrl}/${azureProject}/_apis/pipelines/${pipelineId}/runs`;
    const reqOpts = {
        acceptHeader: 'application/json;api-version=6.0-preview.1',
    };
    const queuedBuild = await buildApi.rest.create(url, build, reqOpts);
    const id = queuedBuild.result.id;
    let triggeredBuild = await buildApi.getBuild(azureProject, id);
    console.log(`Tests execution for ${triggeredBuild.buildNumber} has started`);
    while (!triggeredBuild.finishTime) {
        await sleep(30000);
        triggeredBuild = await buildApi.getBuild(azureProject, id);
        console.log(`Pipeline execution in progress... ${triggeredBuild._links.web.href}`)
    }
    triggeredBuild = await buildApi.getBuild(azureProject, id);
    const buildReport = await buildApi.getBuildReport(azureProject, id);
    console.log(`Tests finished: ${triggeredBuild.result == 8 ? 'failed' : 'passed'}`);
    const buildResults = await testApi.getTestResultsByBuild(azureProject, id);
    const runResults = await testApi.getTestResults(azureProject, buildResults[0].runId);
    console.log(`Passed tests: ${runResults.filter((test) => test.outcome == "Passed").map((test) => `\n${test.testCase.name}` )}\n`);
    console.log(`Failed tests with bugs: ${runResults.filter((test) => test.outcome != "Passed" && !test.stackTrace.includes('**Unstable**')).map((test) => `${test.testCase.name}\n` )}\n`);
    console.log(`Failed tests without bugs: ${runResults.filter((test) => test.outcome != "Passed" && test.stackTrace.includes('**Unstable**')).map((test) => `${test.testCase.name}\n` )}\n`);
}

var jsonStringBase64 = process.env.npm_config_jsonString;
var testPipelineArgs = configurations.testPipelineArgs;

console.log("JSON64:" + jsonStringBase64);
console.log("testPipelineArgs:" + testPipelineArgs);

var jsonString = atob(jsonStringBase64);
var json = JSON.parse(jsonString);

console.log("JSON:" + jsonString);

json.forEach(function(run) {
    executePipeline(run.appID, testPipelineArgs.plugin, 10, 'fc594814-b424-4140-ad9f-82e3cb736325', run.platform == 'android' ? testPipelineArgs.androidPipelineID : testPipelineArgs.iosPipelineID);
});