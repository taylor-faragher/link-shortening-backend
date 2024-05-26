import {connect} from 'ts-postgres';
import {LinkShorteningResponse} from '../../lib/types/types';
import {getSecretValue} from '../utils/getSecretValue';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }
    const {password, username, host, dbname} = await getSecretValue('LinkShortenerMasterSecret');

    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    try {
        const result = await client.query('SELECT * FROM links');
        console.log(`items: ${item} \n results: ${JSON.stringify(result)}`);
        return {
            statusCode: 200,
            body: `User Created`,
        };
    } catch (dbError) {
        const errorResponse = `database error: ${dbError}`;
        return {statusCode: 500, body: errorResponse};
    }
};
