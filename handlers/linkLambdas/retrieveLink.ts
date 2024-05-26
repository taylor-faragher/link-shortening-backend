import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    try {
        //retrieve 1 link code here
        return {statusCode: 200, body: 'Retrieved one of the things!'};
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
