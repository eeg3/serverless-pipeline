'use strict';
var moment = require('moment');

exports.handler = (event, context, callback) => {

    var originURL = process.env.ORIGIN_URL || '*';

    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    const username = event.requestContext.authorizer.claims['cognito:username'];

    console.log('Received event: ' + event);
    var requestBody = JSON.parse(event.body);
    console.log('Request body:' + requestBody);

    emitLambdaAge();

    // This variable can be updated and checked in to your repository
    // to update the number of SAM squirrels on the screen.
    var samCount = 15;

    // Or you can update your Lambda function's environment variable.
    var samMultiplier = process.env.SAM_MULTIPLIER || 1;

    var totalSAMs = samCount * samMultiplier;

    console.log('The number of SAMs to show: ' + samCount);
    console.log('Multiplier to apply to SAMs: ' + samMultiplier);
    console.log('Total number of SAMs to show: ' + totalSAMs);

    callback(null, {
        "statusCode": 200,
        "body": totalSAMs,
        "headers":
        {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Origin": "*"
        }
    });
}

function emitLambdaAge() {
    var now = moment();
    var lambdaAnnouncement = moment('2014-11-04');

    var daysOld = now.diff(lambdaAnnouncement, 'days');

    console.log('Lambda is ' + daysOld + ' days old!');
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
