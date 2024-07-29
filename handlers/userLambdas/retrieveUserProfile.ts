import {LinkShorteningResponse} from '../../lib/types/types';
import {getDBClient} from '../utils/getDBClient';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.pathParameters.userId) {
        return {statusCode: 400, body: 'invalid request, you are missing a path parameter'};
    }

    const userId = event.pathParameters.userId;

    await using client = await getDBClient();

    const query = `
        SELECT profileInfo FROM linkuser
        WHERE user_id = $1;
    `;

    const params = [userId];

    try {
        const result = await client.query(query, params);
        const record = result.rows[0][0];

        return {
            statusCode: 200,
            body: JSON.stringify(record),
        };
    } catch (dbError) {
        const errorResponse = `database error: ${dbError}`;
        return {statusCode: 500, body: errorResponse};
    }
};
