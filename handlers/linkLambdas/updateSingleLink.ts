import {connect} from 'ts-postgres';
import {LinkShorteningResponse} from '../../lib/types/types';
import {getSecretValue} from '../utils/getSecretValue';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    const link = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const url = link.url;
    const description = link.description;
    const userId = link.userId;
    if (!userId || !description || !url) {
        return {statusCode: 400, body: 'invalid request, you are missing items from the body'};
    }

    const editedLinkId = event.pathParameters.linkId;
    if (!editedLinkId) {
        return {statusCode: 400, body: 'invalid request, you are missing a path parameter'};
    }

    const {password, username, host, dbname} = await getSecretValue('LinkShortenerMasterSecret');

    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    const query = `
        UPDATE links SET link_url = $1, description = $2
        WHERE link_id = $3
    `;

    const params = [url, description, editedLinkId];

    try {
        await client.query(query, params);
        return {
            statusCode: 204,
            body: 'Updated Successfully!',
        };
    } catch (dbError) {
        return {statusCode: 500, body: `Failed to update. Error: ${dbError}`};
    }
};
