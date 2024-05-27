export const mapAllUserLinks = arrayOfArrays => {
    const newArray = arrayOfArrays.map(innerArray => {
        if (innerArray.length !== 4) {
            throw new Error(`Inner array does not have exactly 4 elements.`);
        }
        return {
            linkId: innerArray[0],
            link: innerArray[1],
            description: innerArray[2],
            timeStamp: innerArray[3],
        };
    });
    return newArray;
};
