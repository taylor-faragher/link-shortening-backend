import {connect} from 'ts-postgres';
import {LinkShorteningResponse} from '../../lib/types/types';
import {getSecretValue} from '../utils/getSecretValue';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    if (!event.pathParameters.userId) {
        return {statusCode: 400, body: 'invalid request, you are missing path parameters'};
    }
    const userId = event.pathParameters.userId;
    const {password, username, host, dbname} = await getSecretValue('LinkShortenerMasterSecret');

    const profileInfo = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    const query = `
        UPDATE linkuser
        SET profileInfo = $1
        WHERE user_id = $2;
    `;

    const params = [profileInfo, userId];
    try {
        await client.query(query, params);
        return {
            statusCode: 200,
            body: 'Profile Updated!',
        };
    } catch (dbError) {
        const errorResponse = `database error: ${dbError}`;
        return {statusCode: 500, body: errorResponse};
    }
};
// Leaving these here in case I, or someone else, wants to use them

// Query for setting specific field
// UPDATE linkuser
// SET profile = jsonb_set(profile, '{age}', '32')
// WHERE user_id = 1;

// -- Example line below to update nested value
// -- SET profile = jsonb_set(profile, '{preferences,theme}', '"dark"')
