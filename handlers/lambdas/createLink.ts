import {v4 as uuidv4} from 'uuid';
import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const linkId = uuidv4();

    try {
        //POST code
        return {statusCode: 200, body: `Created id ${linkId} for item: ${JSON.stringify(item.url)}`};
    } catch (dbError) {
        const errorResponse = 'database error';
        return {statusCode: 500, body: errorResponse};
    }
};
