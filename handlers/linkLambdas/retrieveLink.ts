import {LinkShorteningResponse} from '../../lib/types/types';
import {getDBClient} from '../utils/getDBClient';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    const linkId = event.pathParameters.linkId;

    if (!linkId) {
        return {statusCode: 400, body: 'invalid request, you are missing path parameters'};
    }

    await using client = await getDBClient();

    const query = `
        SELECT * FROM links 
        WHERE link_id = $1
    `;

    const params = [linkId];

    try {
        const result = await client.query(query, params);
        const row = result.rows[0];
        const record = {
            link_id: row.get('link_id'),
            link_url: row.get('link_url'),
            description: row.get('description'),
        };
        return {statusCode: 200, body: JSON.stringify(record)};
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
