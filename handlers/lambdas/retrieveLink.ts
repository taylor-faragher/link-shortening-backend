import {LinkShorteningResponse} from '../../lib/types/types';

export const handler = async (): Promise<LinkShorteningResponse> => {
    //define params here

    try {
        //retrieve 1 link code here
        return {statusCode: 200, body: 'Retrieved one of the things!'};
    } catch (dbError) {
        return {statusCode: 500, body: JSON.stringify(dbError)};
    }
};
