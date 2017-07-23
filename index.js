const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    const username = event.requestContext.authorizer.claims['cognito:username'];

    var originURL = process.env.ORIGIN_URL || '*';

    console.log('Received event: ' + event);
    var requestBody = JSON.parse(event.body);
    console.log('Request body:' + requestBody);

    switch (event.httpMethod) {
        case 'GET':
            var params = {
                TableName: 'Projects'
            };
            ddb.scan(params, function(err, data) {
                if (err) {
                    errorResponse(err.message, context.awsRequestId, callback);
                } else {
                    successResponse(data, callback);
                }
            });
            break;
        case 'POST':
            var params = {
                TableName: 'Projects',
                Item: {
                    ProjectId: toUrlString(randomBytes(16)),
                    User: username,
                    Date: new Date().toISOString(),
                }
            };
            ddb.put(params, function(err, data) {
                if (err) {
                    errorResponse(err.message, context.awsRequestId, callback);
                } else {
                    successResponse("Success", callback);
                }
            });
            break;
        //case 'PUT':
        //    dynamo.updateItem(JSON.parse(event.body), done);
        //    break;
        //case 'DELETE':
        //    dynamo.deleteItem(JSON.parse(event.body), done);
        //    break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }

    var done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        headers: {
            'Access-Control-Allow-Origin': originURL,
        },
        body: err ? err.message : JSON.stringify(res)
    });

};

function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': originURL,
    },
  });
}

function successResponse(data, callback) {
  callback(null, {
    statusCode: 201,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Origin': originURL,
    },
  });
}
