import {LinkShorteningResponse} from '../../lib/types/types';
import {mapAllUserLinks} from '../utils/mapAllUserLinks';
import {countUserLinks} from '../utils/countUserLinks';
import {getDBClient} from '../utils/getDBClient';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.pathParameters.userId) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }
    const userId = event.pathParameters.userId;

    await using client = await getDBClient();

    const {countNumber} = await countUserLinks(client, userId);

    const query = `
        SELECT l.* FROM links l
        JOIN linkuseridtolinksid lt ON l.link_id = lt.link_id
        WHERE lt.user_id = $1;
    `;

    const params = [userId];

    try {
        const result = await client.query(query, params);

        const mappedResult = mapAllUserLinks(result.rows);

        const records = {
            count: countNumber,
            links: mappedResult,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(records),
        };
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
