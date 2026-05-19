

const BOOT_CAMP = {
    easy: {
        title: "Boot Camp - Easy (Gray)",
        problems: [
            "abc139_b", "abc156_c", "abc121_b", "abc086_b", "abc142_c",
            "abc068_b", "abc160_c", "abc150_c", "abc074_b", "abc094_b"
        ]
    },
    medium: {
        title: "Boot Camp - Medium (Brown)",
        problems: [
            "abc065_b", "abc066_b", "abc072_c", "abc087_c", "abc107_b",
            "abc116_c", "abc122_c", "abc131_c", "abc133_b", "abc161_c"
        ]
    },
    hard: {
        title: "Boot Camp - Hard (Green)",
        problems: [
            "abc136_d", "abc057_c", "abc129_c", "abc054_c", "abc125_c",
            "abc151_d", "abc064_c", "abc130_d", "abc084_d", "abc088_d"
        ]
    }
};

// Helper to determine Kenkoooo difficulty color
function getDifficultyColorClass(difficulty) {
    if (difficulty === undefined || difficulty === null) return 'diff-unknown';
    if (difficulty < 400) return 'diff-gray';
    if (difficulty < 800) return 'diff-brown';
    if (difficulty < 1200) return 'diff-green';
    if (difficulty < 1600) return 'diff-cyan';
    if (difficulty < 2000) return 'diff-blue';
    if (difficulty < 2400) return 'diff-yellow';
    if (difficulty < 2800) return 'diff-orange';
    return 'diff-red';
}
