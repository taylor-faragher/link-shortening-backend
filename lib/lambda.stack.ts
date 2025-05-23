import {Stack, StackProps} from 'aws-cdk-lib';
import {
    LambdaIntegration,
    MockIntegration,
    PassthroughBehavior,
    RestApi,
    IResource,
    EndpointType,
} from 'aws-cdk-lib/aws-apigateway';
import {ManagedPolicy, ServicePrincipal, PolicyStatement, Role} from 'aws-cdk-lib/aws-iam';
import {SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction, NodejsFunctionProps} from 'aws-cdk-lib/aws-lambda-nodejs';
import {Construct} from 'constructs';
import * as path from 'path';

interface LambdaStackProps extends StackProps {
    myVpc: Vpc;
}

export class LambdaStack extends Construct {
    constructor(parent: Stack, id: string, props: LambdaStackProps) {
        super(parent, id);
        const stackPrefix = 'LinkShortener';

        const policyStatement = new PolicyStatement({
            actions: ['secretsmanager:GetSecretValue'],
            resources: [`arn:aws:secretsmanager:us-east-1:${parent.account}:secret:LinkShortenerMasterSecret-*`],
        });

        const lambdaIamRole = new Role(this, 'LinkShortenerLambdaIamRole', {
            roleName: 'LinkShortenerLambdaIamRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
                ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
            ],
        });

        lambdaIamRole.addToPolicy(policyStatement);

        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: ['aws-sdk'],
            },
            depsLockFilePath: path.join(__dirname, '../', 'yarn.lock'),
            runtime: Runtime.NODEJS_20_X,
            role: lambdaIamRole,
            vpc: props.myVpc,
            vpcSubnets: {subnetType: SubnetType.PRIVATE_WITH_EGRESS},
        };

        // Create a Lambda function for each of the CRUD operations for link table
        const createLinkLambda = new NodejsFunction(this, 'createLinkFunction', {
            entry: path.join(__dirname, '../handlers/linkLambdas', 'createLink.ts'),
            functionName: `${stackPrefix}_createLink`,
            ...nodeJsFunctionProps,
        });
        const deleteLinkForUserLambda = new NodejsFunction(this, 'deleteLinkForUserFunction', {
            entry: path.join(__dirname, '../handlers/linkLambdas', 'deleteLinkForUser.ts'),
            functionName: `${stackPrefix}_deleteLink`,
            ...nodeJsFunctionProps,
        });
        const retrieveAllUserLinksLambda = new NodejsFunction(this, 'retrieveAllUserLinksFunction', {
            entry: path.join(__dirname, '../handlers/linkLambdas', 'retrieveAllUserLinks.ts'),
            functionName: `${stackPrefix}_retrieveAllLinks`,
            ...nodeJsFunctionProps,
        });
        const retrieveLinkLambda = new NodejsFunction(this, 'retrieveLinkFunction', {
            entry: path.join(__dirname, '../handlers/linkLambdas', 'retrieveLink.ts'),
            functionName: `${stackPrefix}_retrieveLink`,
            ...nodeJsFunctionProps,
        });
        const updateSingleLinkLambda = new NodejsFunction(this, 'updateSingleLinkFunction', {
            entry: path.join(__dirname, '../handlers/linkLambdas', 'updateSingleLink.ts'),
            functionName: `${stackPrefix}_updateLink`,
            ...nodeJsFunctionProps,
        });

        // Create a Lambda function for each of the CRUD operations for user table
        const createUserLambda = new NodejsFunction(this, 'createUserFunction', {
            entry: path.join(__dirname, '../handlers/userLambdas', 'createUser.ts'),
            functionName: `${stackPrefix}_createUser`,
            ...nodeJsFunctionProps,
        });

        const deleteUserLambda = new NodejsFunction(this, 'deleteUserFunction', {
            entry: path.join(__dirname, '../handlers/userLambdas', 'deleteUser.ts'),
            functionName: `${stackPrefix}_deleteUser`,
            ...nodeJsFunctionProps,
        });

        const retrieveUserInfoLambda = new NodejsFunction(this, 'retrieveUserInfoFunction', {
            entry: path.join(__dirname, '../handlers/userLambdas', 'retrieveUserInfo.ts'),
            functionName: `${stackPrefix}_retrieveUserInfo`,
            ...nodeJsFunctionProps,
        });

        const updateUserLambda = new NodejsFunction(this, 'updateUserFunction', {
            entry: path.join(__dirname, '../handlers/userLambdas', 'updateUser.ts'),
            functionName: `${stackPrefix}_updateUser`,
            ...nodeJsFunctionProps,
        });

        const updateUserProfileLambda = new NodejsFunction(this, 'updateUserProfileFunction', {
            entry: path.join(__dirname, '../handlers/userLambdas', 'updateUserProfile.ts'),
            functionName: `${stackPrefix}_updateUserProfile`,
            ...nodeJsFunctionProps,
        });

        const retrieveUserProfileLambda = new NodejsFunction(this, 'retrieveUserProfileFunction', {
            entry: path.join(__dirname, '../handlers/userLambdas', 'retrieveUserProfile.ts'),
            functionName: `${stackPrefix}_retrieveUserProfile`,
            ...nodeJsFunctionProps,
        });

        // Integrate the Link Lambda functions with the API Gateway resource
        const createLinkIntegration = new LambdaIntegration(createLinkLambda);
        const deleteLinkForUserIntegration = new LambdaIntegration(deleteLinkForUserLambda);
        const retrieveAllUserLinkIntegration = new LambdaIntegration(retrieveAllUserLinksLambda);
        const retrieveLinkIntegration = new LambdaIntegration(retrieveLinkLambda);
        const updateLinkIntegration = new LambdaIntegration(updateSingleLinkLambda);

        // Integrate the User Lambda functions with the API Gateway resource
        const createUserIntegration = new LambdaIntegration(createUserLambda);
        const deleteUserIntegration = new LambdaIntegration(deleteUserLambda);
        const retrieveUserInfoIntegration = new LambdaIntegration(retrieveUserInfoLambda);
        const updateUserIntegration = new LambdaIntegration(updateUserLambda);
        const updateUserProfileIntegration = new LambdaIntegration(updateUserProfileLambda);
        const retrieveUserProfileIntegration = new LambdaIntegration(retrieveUserProfileLambda);

        // Create an API Gateway resource for each of the CRUD operations
        const api = new RestApi(this, 'LinkShorteningApiGateway', {
            restApiName: 'LinkShorteningApi',
            endpointConfiguration: {
                types: [EndpointType.REGIONAL],
            },
        });
        // Design for Link Endpoint
        const link = api.root.addResource('link');
        link.addMethod('POST', createLinkIntegration);
        addCorsOptions(link);

        const linkId = link.addResource('{linkId}');
        linkId.addMethod('GET', retrieveLinkIntegration);
        linkId.addMethod('Put', updateLinkIntegration);
        linkId.addMethod('DELETE', deleteLinkForUserIntegration);
        addCorsOptions(linkId);

        // Design for User Endpoint
        const linkUser = api.root.addResource('user');
        linkUser.addMethod('POST', createUserIntegration);
        addCorsOptions(linkUser);

        const userId = linkUser.addResource('{userId}');
        userId.addMethod('DELETE', deleteUserIntegration);
        userId.addMethod('PUT', updateUserIntegration);
        userId.addMethod('GET', retrieveUserInfoIntegration);

        addCorsOptions(userId);

        // Design for User Profile Endpoint
        const profile = api.root.addResource('profile');
        const profileForUser = profile.addResource('{userId}');
        profileForUser.addMethod('GET', retrieveUserProfileIntegration);
        profileForUser.addMethod('PATCH', updateUserProfileIntegration);
        addCorsOptions(profileForUser);

        // Design for userlinks Endpoint
        const userLinks = api.root.addResource('userlinks');
        const userLinksId = userLinks.addResource('{userId}');
        userLinksId.addMethod('GET', retrieveAllUserLinkIntegration);
    }
}

export const addCorsOptions = (apiResource: IResource) => {
    apiResource.addMethod(
        'OPTIONS',
        new MockIntegration({
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                        'method.response.header.Access-Control-Allow-Credentials': "'false'",
                        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
                    },
                },
            ],
            passthroughBehavior: PassthroughBehavior.NEVER,
            requestTemplates: {
                'application/json': '{"statusCode": 200}',
            },
        }),
        {
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                        'method.response.header.Access-Control-Allow-Credentials': true,
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                },
            ],
        }
    );
};
