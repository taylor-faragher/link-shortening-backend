import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    //define params for request here
    try {
        //DELETE CODE
        return {statusCode: 200, body: `Deleted item for user`};
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
