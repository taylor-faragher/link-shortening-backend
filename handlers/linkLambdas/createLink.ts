import {connect} from 'ts-postgres';
import {LinkShorteningResponse} from '../../lib/types/types';
import {createLinkId} from '../utils/createLinkId';
import {getSecretValue} from '../utils/getSecretValue';
import {countUserLinks} from '../utils/countUserLinks';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }
    const {password, username, host, dbname} = await getSecretValue('LinkShortenerMasterSecret');

    const link = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const url = link.url;
    const description = link.description;
    const userId = link.userId;
    if (!userId || !description || !url) {
        return {statusCode: 400, body: 'invalid request, you are missing items from the body'};
    }
    await using client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    const linkCount = await countUserLinks(client, userId);
    if (!linkCount) {
        return {statusCode: 400, body: `We're sorry. You have created too many links.`};
    }

    const linkId = await createLinkId(client);

    const linkQuery = `
        INSERT INTO links (link_id, link_url, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const linkUserQuery = `
        INSERT INTO linkuseridtolinksid (user_id, link_id) 
        VALUES ($1, $2)
    `;

    const linkParams = [linkId, url, description];
    const linkUserParams = [userId, linkId];
    try {
        const result = await client.query(linkQuery, linkParams);
        await client.query(linkUserQuery, linkUserParams);
        const row = result.rows[0];
        const record = {
            link_id: row.get('link_id'),
            link_url: row.get('link_url'),
            description: row.get('description'),
            status: result.status,
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
