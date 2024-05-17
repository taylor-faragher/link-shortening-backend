import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {LinkShorteningStack} from '../lib/linkShorteningStack';
import {getCdkConfig} from './getCdkConfig';

const app = new cdk.App();

const env = app.node.tryGetContext('env') || 'dev';

const config = getCdkConfig(env);

new LinkShorteningStack(app, `LinkShorteningStack-${env}`, {
    customConfig: config,
    env: {
        account: process.env.AWS_ACCOUNT_NUMBER,
        region: config.region,
    },
});

app.synth();
