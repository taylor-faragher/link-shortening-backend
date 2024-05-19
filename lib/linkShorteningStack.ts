import {App, Stack, StackProps} from 'aws-cdk-lib';
import {DataBaseStack} from './database.stack';
import {LambdaStack} from './lambda.stack';

interface LinkShorteningStackProps extends StackProps {
    customConfig: Record<string, string>;
}

export class LinkShorteningStack extends Stack {
    constructor(parent: App, id: string, props: LinkShorteningStackProps) {
        super(parent, id, props);
        new DataBaseStack(this, `DataBaseStack`);

        new LambdaStack(this, `LinkShorteningLambdaStack${props.env}`);
    }
}
