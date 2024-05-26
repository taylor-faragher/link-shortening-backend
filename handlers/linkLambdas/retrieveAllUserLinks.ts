import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    try {
        //retrieve all for a user code
        return {statusCode: 200, body: 'Retrieved all the things!'};
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
