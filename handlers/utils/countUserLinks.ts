export const countUserLinks = async (client, userId): Promise<boolean> => {
    const query = `
        SELECT user_id, COUNT(*) AS link_count
        FROM linkuseridtolinksid
        WHERE user_id = $1
        GROUP BY user_id;
    `;

    let count = '0';
    const result = await client.query(query, [userId]);
    // this is done because the response has a BigInt in it so it needs to be handled
    // https://github.com/GoogleChromeLabs/jsbi/issues/30
    if (result.row > 0) {
        const linkCount = JSON.parse(
            JSON.stringify(
                result,
                (_key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
            )
        );
        count = linkCount.rows[0][1];
    }
    const countNumber: number = +count;
    return countNumber >= 10;
};
