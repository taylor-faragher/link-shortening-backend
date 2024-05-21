import {Duration, RemovalPolicy} from 'aws-cdk-lib';
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
import {
    Credentials,
    DatabaseInstance,
    DatabaseInstanceEngine,
    DatabaseSecret,
    PostgresEngineVersion,
} from 'aws-cdk-lib/aws-rds';
import {Construct} from 'constructs';

export class DataBaseStack extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const engine = DatabaseInstanceEngine.postgres({version: PostgresEngineVersion.VER_16_2});
        const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.MICRO);
        const port = 5432;
        const dbName = 'TestDataBase';
        const credsName = 'db-master-user-secret';

        const creds = new DatabaseSecret(this, 'PostGreSQLRdsCredentials', {
            secretName: credsName,
            username: 'faragher6',
        });

        const myVpc = new Vpc(this, 'LinkShortenerVPC', {
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
                {
                    cidrMask: 28,
                    name: 'rds',
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });

        const databaseSecurityGroup = new SecurityGroup(this, 'DatabaseSecurityGroup', {
            securityGroupName: 'DatabaseSecurityGroup',
            vpc: myVpc,
        });

        databaseSecurityGroup.addIngressRule(
            Peer.ipv4(myVpc.vpcCidrBlock),
            Port.tcp(port),
            `Allow port ${port} for database connection from only within the VPC (${myVpc.vpcId})`
        );

        new DatabaseInstance(this, `${dbName}`, {
            vpc: myVpc,
            instanceType,
            engine,
            port,
            securityGroups: [databaseSecurityGroup],
            databaseName: dbName,
            credentials: Credentials.fromSecret(creds),
            backupRetention: Duration.days(0), // disable automatic DB snapshot retention
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
            instanceIdentifier: dbName,
        });

        // const initializer = new CustomResourceStack(this, 'CreateDatabaseTables', {
        //     config: {
        //         credsName,
        //     },
        //     fnLogRetention: RetentionDays.FIVE_MONTHS,
        //     fnCode: DockerImageCode.fromImageAsset(`${__dirname}/create-database-tables`, {}),
        //     fnTimeout: Duration.minutes(2),
        //     fnSecurityGroups: [],
        //     vpc: myVpc,
        //     subnetsSelection: myVpc.selectSubnets({
        //         subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        //     }),
        // });

        // initializer.customResource.node.addDependency(linkDatabase);

        // linkDatabase.connections.allowFrom(initializer.function, Port.tcp(port));

        // creds.grantRead(initializer.function);
    }
}
