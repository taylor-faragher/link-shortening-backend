import {App, Stack, StackProps} from 'aws-cdk-lib';
import {DataBaseStack} from './database.stack';
import {LambdaStack} from './lambda.stack';
import {SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2';

interface LinkShorteningStackProps extends StackProps {
    customConfig: Record<string, string>;
}

export class LinkShorteningStack extends Stack {
    constructor(parent: App, id: string, props: LinkShorteningStackProps) {
        super(parent, id, props);

        const myVpc = new Vpc(this, 'LinkShortenerVPC', {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'ingress',
                    subnetType: SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'compute',
                    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        });

        new DataBaseStack(this, `DataBaseStack`, {
            myVpc,
        });

        new LambdaStack(this, `LinkShorteningLambdaStack`, {
            myVpc,
            env: {
                account: process.env.AWS_ACCOUNT_NUMBER,
            },
        });
    }
}
