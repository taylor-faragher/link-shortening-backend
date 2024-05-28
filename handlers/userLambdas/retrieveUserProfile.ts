import {connect} from 'ts-postgres';
import {LinkShorteningResponse} from '../../lib/types/types';
import {getSecretValue} from '../utils/getSecretValue';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.pathParameters.userId) {
        return {statusCode: 400, body: 'invalid request, you are missing a path parameter'};
    }

    const userId = event.pathParameters.userId;

    const {password, username, host, dbname} = await getSecretValue('LinkShortenerMasterSecret');

    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    const query = `
        SELECT profileInfo FROM linkuser
        WHERE user_id = $1;
    `;

    const params = [userId];

    try {
        const result = await client.query(query, params);

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (dbError) {
        const errorResponse = `database error: ${dbError}`;
        return {statusCode: 500, body: errorResponse};
    }
};
