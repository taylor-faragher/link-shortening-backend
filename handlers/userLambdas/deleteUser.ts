import {LinkShorteningResponse} from '../../lib/types/types';
import {getDBClient} from '../utils/getDBClient';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.pathParameters.userId) {
        return {statusCode: 400, body: 'invalid request, you are missing a path parameter'};
    }

    const userId = event.pathParameters.userId;

    await using client = await getDBClient();

    const linkIdToUserIdQuery = `
        DELETE FROM linkuseridtolinksid
        USING linkuser
        WHERE linkuseridtolinksid.user_id = linkuser.user_id
        AND linkuser.user_id = $1;
    `;

    const linkQuery = `
        DELETE FROM links
        WHERE link_id IN (
            SELECT link_id FROM linkuseridtolinksid WHERE user_id = $1
        );
    `;

    const linkUserQuery = `
        DELETE FROM linkuser
        WHERE user_id = $1;
    `;

    const params = [userId];

    try {
        await client.query(linkIdToUserIdQuery, params);
        await client.query(linkQuery, params);
        await client.query(linkUserQuery, params);
        return {
            statusCode: 200,
            body: `User and links deleted`,
        };
    } catch (dbError) {
        return {statusCode: 500, body: `database error: ${dbError}`};
    }
};
