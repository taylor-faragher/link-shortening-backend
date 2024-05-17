import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    const requestedItemId = event.pathParameters.id;
    if (!requestedItemId) {
        return {statusCode: 400, body: `Error: You are missing the path parameter id`};
    }
    //define params for request here
    try {
        //DELETE CODE
        return {statusCode: 200, body: `Deleted item: ${requestedItemId}`};
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
