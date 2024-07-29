import {LinkShorteningResponse} from '../../lib/types/types';
import {getDBClient} from '../utils/getDBClient';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    await using client = await getDBClient();

    const user = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const userId = user.userId;
    const linkUserName = user.username;
    const email = user.email;
    const profileInfo = user.profile;

    const query = `
        INSERT INTO linkuser (user_id, username, email, profileInfo) 
        VALUES ($1, $2, $3, $4);
    `;

    const params = [userId, linkUserName, email, profileInfo];

    try {
        const result = await client.query(query, params);
        const record = {
            result: result,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(record),
        };
    } catch (dbError) {
        const errorResponse = `database error: ${dbError}`;
        return {statusCode: 500, body: errorResponse};
    }
};
