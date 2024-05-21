import {Duration, Stack} from 'aws-cdk-lib';
import {ISecurityGroup, IVpc, SecurityGroup, SubnetSelection} from 'aws-cdk-lib/aws-ec2';
import {ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {DockerImageCode, DockerImageFunction} from 'aws-cdk-lib/aws-lambda';
import {RetentionDays} from 'aws-cdk-lib/aws-logs';
import {AwsCustomResource, AwsCustomResourcePolicy, AwsSdkCall, PhysicalResourceId} from 'aws-cdk-lib/custom-resources';
import {Construct} from 'constructs';

export interface CustomResourceStackProps {
    vpc: IVpc;
    subnetsSelection: SubnetSelection;
    fnSecurityGroups: ISecurityGroup[];
    fnTimeout: Duration;
    fnCode: DockerImageCode;
    fnLogRetention: RetentionDays;
    fnMemorySize?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
}

export class CustomResourceStack extends Construct {
    public readonly customResource: AwsCustomResource;
    public readonly function;
    public readonly response: string;
    constructor(scope: Construct, id: string, props: CustomResourceStackProps) {
        super(scope, id);

        const stack = Stack.of(this);

        const CustomResourceSecurityGroup = new SecurityGroup(this, 'CustomResourceSecurityGroup', {
            securityGroupName: 'CustomResourceSecurityGroup',
            vpc: props.vpc,
            allowAllOutbound: true,
        });

        const customResource = new DockerImageFunction(this, 'ResourceInitializerFn', {
            memorySize: props.fnMemorySize || 128,
            functionName: `CustomResourceStack-${id}`,
            code: props.fnCode,
            vpcSubnets: props.vpc.selectSubnets(props.subnetsSelection),
            vpc: props.vpc,
            securityGroups: [CustomResourceSecurityGroup, ...props.fnSecurityGroups],
            timeout: props.fnTimeout,
            logRetention: props.fnLogRetention,
        });

        const payload: string = JSON.stringify({
            params: {
                config: props.config,
            },
        });

        const sdkCall: AwsSdkCall = {
            service: 'Lambda',
            action: 'invoke',
            parameters: {
                FunctionName: customResource.functionName,
                Payload: payload,
            },
            physicalResourceId: PhysicalResourceId.of(`${id}-AwsSdkCall`),
        };

        const customResourceStackRole = new Role(this, 'AwsCustomResourceRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')],
        });

        customResourceStackRole.addToPolicy(
            new PolicyStatement({
                resources: [`arn:aws:lambda:${stack.region}:${stack.account}:function:CustomResourceStack-${id}`],
                actions: ['lambda:InvokeFunction'],
            })
        );

        this.customResource = new AwsCustomResource(this, 'AwsCustomResource', {
            policy: AwsCustomResourcePolicy.fromSdkCalls({resources: AwsCustomResourcePolicy.ANY_RESOURCE}),
            onUpdate: sdkCall,
            timeout: Duration.minutes(10),
            role: customResourceStackRole,
        });

        this.response = this.customResource.getResponseField('Payload');

        this.function = customResource;
    }
}
