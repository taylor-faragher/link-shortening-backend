import {Duration, RemovalPolicy, Stack} from 'aws-cdk-lib';
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    Peer,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc,
} from 'aws-cdk-lib/aws-ec2';
import {Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion} from 'aws-cdk-lib/aws-rds';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';
import {Construct} from 'constructs';

export class DataBaseStack extends Construct {
    constructor(parent: Stack, id: string) {
        super(parent, id);

        const engine = DatabaseInstanceEngine.postgres({version: PostgresEngineVersion.VER_16_2});
        const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);
        const port = 5432;
        const dbName = 'TestDataBase';

        const masterUserSecret = new Secret(this, 'master-secret', {
            secretName: 'db-master-user-secret',
            description: 'Database master user credentials',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({username: 'faragher6'}),
                generateStringKey: 'password',
                passwordLength: 16,
                excludePunctuation: true,
            },
        });

        const myVpc = Vpc.fromLookup(this, 'my-vpc', {vpcId: 'vpc-09e16c7a60f69c143'});

        const databaseSecurityGroup = new SecurityGroup(this, 'DatabaseSecurityGroup', {
            securityGroupName: 'DatabaseSecurityGroup',
            vpc: myVpc,
        });

        databaseSecurityGroup.addIngressRule(
            Peer.ipv4(myVpc.vpcCidrBlock),
            Port.tcp(port),
            `Allow port ${port} for database connection from only within the VPC (${myVpc.vpcId})`
        );

        new DatabaseInstance(this, 'TestDatabase', {
            vpc: myVpc,
            vpcSubnets: {subnetType: SubnetType.PUBLIC},
            instanceType,
            engine,
            port,
            securityGroups: [databaseSecurityGroup],
            databaseName: dbName,
            credentials: Credentials.fromSecret(masterUserSecret),
            backupRetention: Duration.days(0), // disable automatic DB snapshot retention
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
