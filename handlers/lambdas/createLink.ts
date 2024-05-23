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

    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    try {
        const result = await client.query('SELECT * FROM links');
        return {
            statusCode: 200,
            body: `Created id ${linkId} for item: ${JSON.stringify(item.url)}. Also here are the results: ${JSON.stringify(result)}`,
        };
    } catch (dbError) {
        const errorResponse = `database error: ${dbError}`;
        return {statusCode: 500, body: errorResponse};
    }
};

const getSecretValue = async secret => {
    const data = await secrets.getSecretValue({SecretId: secret});
    return JSON.parse(data.SecretString as string);
};
