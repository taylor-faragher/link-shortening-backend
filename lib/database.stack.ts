import {Duration, RemovalPolicy, StackProps} from 'aws-cdk-lib';
import {InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, Vpc} from 'aws-cdk-lib/aws-ec2';
import {
    Credentials,
    DatabaseInstance,
    DatabaseInstanceEngine,
    DatabaseSecret,
    PostgresEngineVersion,
} from 'aws-cdk-lib/aws-rds';
import {Construct} from 'constructs';

interface DataBaseStackProps extends StackProps {
    myVpc: Vpc;
}

export class DataBaseStack extends Construct {
    constructor(scope: Construct, id: string, props: DataBaseStackProps) {
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

        const databaseSecurityGroup = new SecurityGroup(this, 'DatabaseSecurityGroup', {
            securityGroupName: 'DatabaseSecurityGroup',
            vpc: props.myVpc,
        });

        databaseSecurityGroup.addIngressRule(
            Peer.ipv4(props.myVpc.vpcCidrBlock),
            Port.tcp(port),
            `Allow port ${port} for database connection from only within the VPC (${props.myVpc.vpcId})`
        );

        new DatabaseInstance(this, `${dbName}`, {
            vpc: props.myVpc,
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
