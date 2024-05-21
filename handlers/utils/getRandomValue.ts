const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const getRandomValue = () => {
    let result = '';
    for (let i = 8; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};
