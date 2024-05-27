const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const createLinkId = async (client): Promise<string> => {
    const idQuery = `
        SELECT link_id from links
        WHERE link_id = $1
    `;

    let isValid = false;
    let result: string = '';
    while (!isValid) {
        result = '';
        for (let i = 8; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        const checkId = await client.query(idQuery, [result]);
        if (checkId.status == 'SELECT 0') {
            isValid = true;
        }
    }
    return result;
};
