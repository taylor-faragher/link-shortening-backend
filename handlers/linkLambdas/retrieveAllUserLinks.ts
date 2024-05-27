import {connect} from 'ts-postgres';
import {LinkShorteningResponse} from '../../lib/types/types';
import {getSecretValue} from '../utils/getSecretValue';
import {mapAllUserLinks} from '../utils/mapAllUserLinks';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.pathParameters.userId) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
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
        SELECT l.* FROM links l
        JOIN linkuseridtolinksid lt ON l.link_id = lt.link_id
        WHERE lt.user_id = $1;
    `;

    const params = [userId];

    try {
        const result = await client.query(query, params);

        const records = mapAllUserLinks(result.rows);

        return {
            statusCode: 200,
            body: JSON.stringify(records),
        };
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
