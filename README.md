# Serverless Pipeline
This repo contains a combination of two projects created by AWS that demonstrate the functionality of the Serverless Application Model (SAM) as well as Continuous Integration / Continuous Deployment (CI/CD) of the entire process.
The parent projects this project uses are:

1. [Serverless Web Application Workshop](https://github.com/awslabs/aws-serverless-workshops/tree/master/WebApplication/)
2. [aws-serverless-samfarm](https://github.com/awslabs/aws-serverless-samfarm)

## Functionality

The process starts by deploying the `deploy.json` file inside CloudFormation. The `deploy.json` template will ask for the following parameters:

1. **AppName**: Name of the S3 Bucket to create that should house the website. This must be unique.
3. **CodeBuildImage**: Name of the CodeBuild container image to use. Default should be fine, but customizable if desired.
4. **CognitoPool**: Name of the Cognito Pool to create to use for authentication purposes.
5. **GitHubRepoBranch**: Branch of the GitHub repo that houses the application code.
6. **GitHubRepName**: Name of the GitHub repo that houses the application code.
7. **GitHubToken**: GitHub token to use for authentication to the GitHub account. Configurable inside Github: https://github.com/settings/tokens. Token needs `repo_hook` permissions.
8. **GitHubUser**: GitHub Username.
9. **SAMInputFile**: Serverless transform file. By default, this is the included `sam.json` file.
10. **SAMOutputFile**: The filename for the output file from the buildspec file. This doesn't need to be changed unless the artifact file inside the `buildspec.yml` file is changed to a different name.

The files referenced (e.g. SAMInputFile) are expected to exist within the GitHub repository. The CloudFormation deployment will warn that it is created IAM permissions. This is because it creates roles and policies for the pipeline to use.

The initial CloudFormation Stack should be created after `deploy.json` is launched. Once that stack is created, the CodePipeline will then create the pipeline stack after a period of time. The pipeline stack will be called ``{parent-stack}-serverless-stack``.

After initial deployment, the site will not be fully functional as the `config.js` file still needs to be updated so the site knows how to utilize the services. Within the parent Stack, the Outputs tab should display the following items:

1. **UserPoolClientId**
2. **BucketName**
3. **UserPoolId**
4. **OriginURL**

Within the child pipeline Stack, the Outputs tab should display the following items:

1. **ApiUrl**

The `UserPoolClientId`, `UserPoolId`, `OriginURL`, and `ApiUrl` should all now be placed into the `website/js/config.js` file so that the website knows how to use the services provisioned; this is a one-time process. Once the `config.js` file is updated, push the change to the GitHub repo; this will automatically update the application with the new config through the pipeline.

The site should now work as expected. Browse to the URL defined within `OriginURL`, and select "Register" from the top right drop-down. Enter an email address and password, and select Register. You will receive a verification code from Cognito. Once received, select "Verify" from the top right drop-down; on the verify page, enter your email and verification code provided.

Try browsing to the "Squirrel Farm". If you have not logged in, you should be redirected to the Sign-In page. Enter your credentials, and you should now be taken to the "Squirrel Farm". Within the graphic in the middle of the page, one SAM Squirrel should initially be displayed, and then it should increase to 15 shortly thereafter, once it has reached out and asked API Gateway/Lambda how many it should display.

You can also browse directly to the API Gateway/Lambda function and see how many Squirrels should be displayed. You can do this by browsing to the "ApiUrl" listed in the pipeline Stack and appending '/sam' to the end (e.g. https://od3tfr5l1a.execute-api.us-east-1.amazonaws.com/Prod/sam). By default, it should return '15'.

As the website or serverless function is updated, simply perform the modifications and then push them to the GitHub repo. Once checked in to Github, CodePipeline will handle the rest automatically. To test this functionality, browse to the CodePipeline page and view the pipeline while pushing a change. The pipeline will show the process from Source -> Build -> Deploy. If there are any failures, they will be visible within the pipeline.

## Services

This project leverages the following AWS services:
1. [CloudFormation](https://aws.amazon.com/cloudformation/): Used to deploy the entire stack.
2. [AWS Serverless Application Model](https://aws.amazon.com/about-aws/whats-new/2016/11/introducing-the-aws-serverless-application-model/): Used to provision Lambda/API Gateway.
3. [S3](https://aws.amazon.com/s3/): Used to provide static website hosting and to store our build artifacts.
4. [Lambda](https://aws.amazon.com/lambda/): Used to perform Functions-as-a-Service.
5. [API Gateway](https://aws.amazon.com/api-gateway/): Used to provide an integration point to our Lambda functions.
6. [Cognito](https://aws.amazon.com/cognito/): Used to provide authentication for our website.
7. [IAM](https://aws.amazon.com/iam/): Provides security controls for our process.
8. [CodePipeline](https://aws.amazon.com/codepipeline/): Used to provide the pipeline functionality for our CI/CD process.
9. [Code Build](https://aws.amazon.com/codebuild/): Used to build the project as part of CodePipeline process.
10. [GitHub](http://www.github.com): Used as the source code repository. Could theoretically be replaced with CodeCommit.

## Components

### Website

The code for the website are placed within the website/ folder.

1. **index.html**: Entry page.
2. **farm.html**: Squirrel farm page that displays squirrels based on Lambda function.
3. **register.html**: Sign-up page for Cognito account.
4. **signin.html**: Sign-in page with Cognito account.
5. **verify.html**: Verify account page for Cognito account after sign-up.
6. **js/vendor/**: Bootstrap, Cognito SDK, and jQuery.
7. **js/farm.js**: Phaser.js based Squirrel farm.
8. **js/config.js**: Configuration file for site to put API Gateway and Cognito details.
9. **js/cognito-auth.js**: Cognito helper functions.

### Pipeline

The code for the pipeline resides within the root.

1. **deploy.json**: Launcher for the core services within CloudFormation (S3, CodePipeline, CodeBuild, Cognito). These are not modified by the pipeline on changes, but it does include setting up the pipeline itself. This is the CloudFormation template to launch to get setup started.
2. **buildspec.yml**: This file is used by CodeBuild to tell it what to do on every build.
3. **sam.json**: CloudFormation Serverless Transformation template for SAM.
4. **package.json**: Package file for the Lambda function.
5. **index.js**: Node.js code for Lambda function.

## Modifications from Original Sources

### Serverless Web Application Workshop

1. Stripped down Web Site custom pages from the WildRydes' site to a more basic baseline that could be easily built upon.
2. Removed ride page and code, which will be replaced with the samfarm page instead.
3. Vendor code (js/css/fonts) stripped down to just Bootstrap, jQuery, FontAwesome, and AWS Cognito SDK.
4. Some components of the Workshop had CloudFormation YAML code to deploy them (though some did not). This was merged with samfarm CloudFormation code, and converted to JSON instead of YAML.
5. Refactored Cognito CloudFormation to use regular resources instead of Lambda functions to create.
6. ServerlessBackend and RESTfulAPIs components are integrated through Serverless Application Model.
7. Authentication for API Gateway / Lambda function removed, but authentication kept for website itself. Code left in, but disabled pending some CORS improvements to SAM.

### AWS-Serverless-Samfarm

1. Added functionality to update the website to S3 as part of the CI/CD pipeline (previously just updated Lambda/API).
2. Merged separate CloudFormation templates into one single template.
3. Modified from YAML to JSON.
4. Removed Template Configuration file (`beta.json`) for simplicity.
5. Merged website into Serverless Web Application Workshop site.
6. Integrated CloudFormation functionality from Serverless Web Application Workshop into deployment CloudFormation template.
7. Added some additional IAM permissions to allow tagging of Lambda functions.
8. Added the API URL into the Stack Outputs.

## Notes

1. If you want to delete the stack, make sure to delete the pipeline-created stack first and then delete the parent stack. If you delete the parent first, the IAM role is deleted and you'll have to tinker around with permissions to get the stack to actually gracefully delete.

### (Optional) Add API Gateway Authentication for Lambda Function

1. If you'd like to provide authentication for the Lambda function, follow Module 4 of the Serverless Web Application tutorial: [RESTful APIs with AWS Lambda and Amazon API Gateway](https://github.com/awslabs/aws-serverless-workshops/tree/master/WebApplication/4_RESTfulAPIs).
2. Replace the API Gateway address that is generated from CloudFormation with the manually created API Gateway address inside `config.js`.
3. Edit the ``$.ajax()`` call within `farm.js` to pass the authorization token within the AJAX call.
4. Uncomment the authorization code within the Lambda function inside `index.js`.
