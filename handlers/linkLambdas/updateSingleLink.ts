import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (event): Promise<LinkShorteningResponse> => {
    if (!event.body) {
        return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
    }

    const editedItemId = event.pathParameters.id;
    if (!editedItemId) {
        return {statusCode: 400, body: 'invalid request, you are missing the path parameter id'};
    }

    //check if it is an object and parse if it is
    const editedItem = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

    const editedItemProperties = Object.keys(editedItem);
    if (!editedItem || editedItemProperties.length < 1) {
        return {statusCode: 400, body: 'invalid request, no arguments provided'};
    }

    try {
        //CODE TO UPDATE!
        return {statusCode: 204, body: `Edited item to now be ${editedItem}`};
    } catch (dbError) {
        return {statusCode: 500, body: 'Failed to update. sorry'};
    }
};
