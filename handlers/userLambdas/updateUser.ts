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

    const user = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const getUsername = user.username;
    const email = user.email;
    const profileInfo = user.profile;

    if (!getUsername || !email || !profileInfo) {
        return {statusCode: 400, body: 'invalid request, you are missing items from the body'};
    }

    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    const query = `
        UPDATE linkuser 
        SET username = $1,
        email = $2,
        profileInfo = $3
            WHERE user_id = $4;
    `;

    const params = [getUsername, email, profileInfo, userId];

    try {
        await client.query(query, params);
        return {
            statusCode: 200,
            body: 'User Updated Successfully',
        };
    } catch (dbError) {
        const errorResponse = `database error: ${dbError}`;
        return {statusCode: 500, body: errorResponse};
    }
};
