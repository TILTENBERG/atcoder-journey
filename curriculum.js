const CURRICULUM = [
    {
        id: "intro",
        title: "Introductory Problems",
        problems: [
            "abc086_a", // Product
            "abc081_a", // Placing Marbles
            "abc081_b", // Shift only
            "abc087_b", // Coins
            "abc083_b", // Some Sums
            "abc088_b", // Card Game for Two
            "abc085_b", // Kagami Mochi
            "abc085_c", // Otoshidama
            "abc049_c", // Daydream
            "abc086_c"  // Traveling
        ] // These are the famous AtCoder Beginners Selection (ABS)
    },
    {
        id: "dp",
        title: "Dynamic Programming (Educational DP Contest)",
        problems: [
            "dp_a", // Frog 1
            "dp_b", // Frog 2
            "dp_c", // Vacation
            "dp_d", // Knapsack 1
            "dp_e", // Knapsack 2
            "dp_f", // LCS
            "dp_g", // Longest Path
            "dp_h", // Grid 1
            "dp_i", // Coins
            "dp_j"  // Sushi
        ]
    },
    {
        id: "sorting_searching",
        title: "Sorting and Searching",
        problems: [
            "abc156_c", // Rally
            "abc121_c", // Energy Drink Collector
            "abc157_c", // Guess The Number
            "abc200_c", // Ringo's Favorite Numbers 2
            "abc143_d"  // Triangles
        ]
    },
    {
        id: "graph",
        title: "Graph Algorithms",
        problems: [
            "abc166_c", // Peaks
            "abc167_d", // Teleporter
            "abc168_d", // .. (Double Dots)
            "abc170_d", // Not Divisible
            "abc177_d"  // Friends
        ]
    },
    {
        id: "math",
        title: "Math & Number Theory",
        problems: [
            "abc148_c", // Snack (LCM)
            "abc169_b", // Multiplication 2
            "abc180_c", // Cream puff (Divisors)
            "abc182_c", // To 3
            "abc186_c"  // Unlucky 7
        ]
    },
    {
        id: "data_structures",
        title: "Data Structures",
        problems: [
            "abc185_f", // Range Xor Query (Segment Tree)
            "abc187_d", // Choose Me (Sorting/Priority Queue)
            "abc194_e", // Mex Min
            "abc228_d", // Linear Probing
            "arc114_a"  // Not coprime
        ]
    },
    {
        id: "greedy",
        title: "Greedy Algorithms",
        problems: [
            "abc083_c", // Multiple Gift
            "abc091_c", // 2D Plane 2N Points
            "abc103_d", // Islands War
            "abc131_d", // Megalomania
            "abc137_d"  // Summer Vacation
        ]
    }
];

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
