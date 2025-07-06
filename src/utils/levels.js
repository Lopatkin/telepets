export const levelTable = [
    { level: 1, minExp: 0, maxExp: 10 },
    { level: 2, minExp: 11, maxExp: 30 },
    { level: 3, minExp: 31, maxExp: 60 },
    { level: 4, minExp: 61, maxExp: 100 },
    { level: 5, minExp: 101, maxExp: 150 },
    { level: 6, minExp: 151, maxExp: 210 },
    { level: 7, minExp: 211, maxExp: 280 },
    { level: 8, minExp: 281, maxExp: 360 },
    { level: 9, minExp: 361, maxExp: 450 },
    { level: 10, minExp: 451, maxExp: 550 },
    { level: 11, minExp: 551, maxExp: 660 },
    { level: 12, minExp: 661, maxExp: 780 },
    { level: 13, minExp: 781, maxExp: 910 },
    { level: 14, minExp: 911, maxExp: 1050 },
    { level: 15, minExp: 1051, maxExp: 1200 },
    { level: 16, minExp: 1201, maxExp: 1360 },
    { level: 17, minExp: 1361, maxExp: 1530 },
    { level: 18, minExp: 1531, maxExp: 1710 },
    { level: 19, minExp: 1711, maxExp: 1900 },
    { level: 20, minExp: 1901, maxExp: 2100 },
    { level: 21, minExp: 2101, maxExp: 2310 },
    { level: 22, minExp: 2311, maxExp: 2530 },
    { level: 23, minExp: 2531, maxExp: 2760 },
    { level: 24, minExp: 2761, maxExp: 3000 },
    { level: 25, minExp: 3001, maxExp: 3250 },
    { level: 26, minExp: 3251, maxExp: 3510 },
    { level: 27, minExp: 3511, maxExp: 3780 },
    { level: 28, minExp: 3781, maxExp: 4060 },
    { level: 29, minExp: 4061, maxExp: 4350 },
    { level: 30, minExp: 4351, maxExp: 4650 },
    { level: 31, minExp: 4651, maxExp: 4960 },
    { level: 32, minExp: 4961, maxExp: 5280 },
    { level: 33, minExp: 5281, maxExp: 5610 },
    { level: 34, minExp: 5611, maxExp: 5950 },
    { level: 35, minExp: 5951, maxExp: 6300 },
    { level: 36, minExp: 6301, maxExp: 6660 },
    { level: 37, minExp: 6661, maxExp: 7030 },
    { level: 38, minExp: 7031, maxExp: 7410 },
    { level: 39, minExp: 7411, maxExp: 7800 },
    { level: 40, minExp: 7801, maxExp: 8200 },
    { level: 41, minExp: 8201, maxExp: 8610 },
    { level: 42, minExp: 8611, maxExp: 9030 },
    { level: 43, minExp: 9031, maxExp: 9460 },
    { level: 44, minExp: 9461, maxExp: 9900 },
    { level: 45, minExp: 9901, maxExp: 10350 },
    { level: 46, minExp: 10351, maxExp: 10810 },
    { level: 47, minExp: 10811, maxExp: 11280 },
    { level: 48, minExp: 11281, maxExp: 11760 },
    { level: 49, minExp: 11761, maxExp: 12250 },
    { level: 50, minExp: 12251, maxExp: Infinity }
];

export const getLevelInfo = (exp) => {
    for (let i = levelTable.length - 1; i >= 0; i--) {
        if (exp >= levelTable[i].minExp) {
            return {
                level: levelTable[i].level,
                currentExp: exp,
                maxExp: levelTable[i].maxExp,
                totalMaxExp: levelTable[i].maxExp
            };
        }
    }

    return {
        level: 1,
        currentExp: exp,
        maxExp: 10,
        totalMaxExp: 10
    };
};