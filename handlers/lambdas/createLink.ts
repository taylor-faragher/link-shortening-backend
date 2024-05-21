import {connect} from 'ts-postgres';
import {LinkShorteningResponse} from '../../lib/types/types';
import {getRandomValue} from '../utils/getRandomValue';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';

const secrets = new SecretsManager({});

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }
    const {password, username, host, dbname} = await getSecretValue('db-master-user-secret');

    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const linkId = getRandomValue();
    console.log('generated linkid: ', linkId);
    console.log('host: ', host);
    console.log('dbname: ', dbname);
    console.log('username: ', username);
    console.log('password: ', password);

    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });
    console.log('connected successfully');

    const query =
        'CREATE TABLE IF NOT EXISTS Links(id SERIAL PRIMARY KEY,url VARCHAR(2048) NOT NULL,description TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)';

    try {
        const result = await client.query(query);
        return {
            statusCode: 200,
            body: `Created id ${linkId} for item: ${JSON.stringify(item.url)}. Also here are the results: ${result}`,
        };
    } catch (dbError) {
        const errorResponse = 'database error';
        return {statusCode: 500, body: errorResponse};
    }
};

// const getSecretValue = secretId => {
//     return new Promise((resolve, reject) => {
//         secrets.getSecretValue({SecretId: secretId}, (err, data) => {
//             if (err) return reject(err);
//             if (data.SecretString) {
//                 return resolve(JSON.parse(data.SecretString));
//             }
//         });
//     });
// };

const getSecretValue = async secret => {
    const data = await secrets.getSecretValue({SecretId: secret});
    return JSON.parse(data.SecretString as string);
};
