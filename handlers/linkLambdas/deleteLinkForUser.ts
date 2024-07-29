import {LinkShorteningResponse} from '../../lib/types/types';
import {getDBClient} from '../utils/getDBClient';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    const linkId = event.pathParameters.linkId;

    if (!linkId) {
        return {statusCode: 400, body: 'invalid request, you are missing path parameters'};
    }

    await using client = await getDBClient();

    const query = `
        DELETE FROM links 
        WHERE link_id = $1
    `;

    const params = [linkId];

    try {
        let record = {};
        const result = await client.query(query, params);
        if (result.status == 'DELETE 1') {
            record = {
                status: 'Successfully Deleted',
            };
        } else {
            return {statusCode: 400, body: 'Deletion Failed!'};
        }
        return {
            statusCode: 200,
            body: JSON.stringify(record),
        };
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
