import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (): Promise<LinkShorteningResponse> => {
    //define params here

    try {
        //retrieve all for a user code
        return {statusCode: 200, body: 'Retrieved all the things!'};
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
