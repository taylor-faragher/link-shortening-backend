export const mapUserInfo = arrayOfArrays => {
    const newArray = arrayOfArrays.map(innerArray => {
        if (innerArray.length !== 5) {
            throw new Error(`Inner array does not have exactly 4 elements.`);
        }
        return {
            userId: innerArray[0],
            username: innerArray[1],
            email: innerArray[2],
            profile: innerArray[3],
            timeStamp: innerArray[4],
        };
    });
    return newArray;
};
