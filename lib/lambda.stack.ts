import {Stack, StackProps} from 'aws-cdk-lib';
import {
    LambdaIntegration,
    MockIntegration,
    PassthroughBehavior,
    RestApi,
    IResource,
    EndpointType,
} from 'aws-cdk-lib/aws-apigateway';
import { ManagedPolicy, ServicePrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
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
            resources: [`arn:aws:secretsmanager:us-east-1:${props?.env?.account}:secret:db-master-user-secret-*`], // specify the secret ARN
        })

        const lambdaIamRole = new Role(this, 'LinkShortenerLambdaIamRole', {
            roleName: 'LinkShortenerLambdaIamRole',
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
                ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
            ]
        })

        lambdaIamRole.addToPolicy(policyStatement);

        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: ['aws-sdk'],
            },
            depsLockFilePath: path.join(__dirname, '../', 'yarn.lock'),
            runtime: Runtime.NODEJS_20_X,
            role: lambdaIamRole,
            vpc: props.myVpc
        };
        

        // Create a Lambda function for each of the CRUD operations
        const createLinkLambda = new NodejsFunction(this, 'createLinkFunction', {
            entry: path.join(__dirname, '../handlers/lambdas', 'createLink.ts'),
            functionName: `${stackPrefix}_createLink`,
            ...nodeJsFunctionProps,
        });
        const retrieveLinkLambda = new NodejsFunction(this, 'retrieveLinkFunction', {
            entry: path.join(__dirname, '../handlers/lambdas', 'retrieveLink.ts'),
            functionName: `${stackPrefix}_retrieveLink`,
            ...nodeJsFunctionProps,
        });
        const retrieveAllLinkLambda = new NodejsFunction(this, 'retrieveAllLinkFunction', {
            entry: path.join(__dirname, '../handlers/lambdas', 'retrieveAllLink.ts'),
            functionName: `${stackPrefix}_retrieveAllLink`,
            ...nodeJsFunctionProps,
        });
        const updateLinkLambda = new NodejsFunction(this, 'updateLinkFunction', {
            entry: path.join(__dirname, '../handlers/lambdas', 'updateLink.ts'),
            functionName: `${stackPrefix}_updateLink`,
            ...nodeJsFunctionProps,
        });
        const deleteLinkLambda = new NodejsFunction(this, 'deleteLinkFunction', {
            entry: path.join(__dirname, '../handlers/lambdas', 'deleteLink.ts'),
            functionName: `${stackPrefix}_deleteLink`,
            ...nodeJsFunctionProps,
        });

        // Integrate the Lambda functions with the API Gateway resource
        const retrieveAllLinkIntegration = new LambdaIntegration(retrieveAllLinkLambda);
        const createLinkIntegration = new LambdaIntegration(createLinkLambda);
        const retrieveLinkIntegration = new LambdaIntegration(retrieveLinkLambda);
        const updateLinkIntegration = new LambdaIntegration(updateLinkLambda);
        const deleteLinkIntegration = new LambdaIntegration(deleteLinkLambda);

        // Create an API Gateway resource for each of the CRUD operations
        const api = new RestApi(this, 'LinkShorteningApiGateway', {
            restApiName: 'LinkShorteningApi',
            endpointConfiguration: {
                types: [EndpointType.REGIONAL],
            },
        });

        const items = api.root.addResource('link');
        items.addMethod('GET', retrieveAllLinkIntegration);
        items.addMethod('POST', createLinkIntegration);
        addCorsOptions(items);

        const singleItem = items.addResource('{id}');
        singleItem.addMethod('GET', retrieveLinkIntegration);
        singleItem.addMethod('PATCH', updateLinkIntegration);
        singleItem.addMethod('DELETE', deleteLinkIntegration);
        addCorsOptions(singleItem);
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
