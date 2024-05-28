export const countUserLinks = async (client, userId) => {
    const query = `
        SELECT user_id, COUNT(*) AS link_count
        FROM linkuseridtolinksid
        WHERE user_id = $1
        GROUP BY user_id;
    `;

    const result = await client.query(query, [userId]);
    // this is done because the response has a BigInt in it so it needs to be handled
    // https://github.com/GoogleChromeLabs/jsbi/issues/30
    const linkCount = JSON.parse(
        JSON.stringify(
            result,
            (_key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
        )
    );
    const count = linkCount.rows[0][1];
    const countNumber: number = +count;
    const valid = countNumber >= 10;
    return {valid, countNumber};
};
