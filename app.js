// Global State
const state = {
    problems: [], // [{ id, contest_id, problem_index, name, title }]
    problemModels: {}, // { problem_id: { difficulty, is_experimental } }
    contests: [], // [{ id, start_epoch_second, duration_second, title, rate_change }]
    userSubmissions: new Set(), // Set of solved problem IDs
    userSubmissionsFull: [], // Full submission objects for analytics
    username: localStorage.getItem('atcoder_username') || '',
    loading: true
};

// DOM Elements
const elements = {
    loadingOverlay: document.getElementById('loading-overlay'),
    usernameInput: document.getElementById('username-input'),
    updateUserBtn: document.getElementById('update-user-btn'),
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view'),
    curriculumContainer: document.getElementById('curriculum-container'),
    recentContestsContainer: document.getElementById('recent-contests-container'),
    dashboardContainer: document.getElementById('dashboard-container'),
    bootcampContainer: document.getElementById('bootcamp-container'),
    difficultyContainer: document.getElementById('difficulty-container'),
    overallProgressFill: document.getElementById('overall-progress-fill'),
    overallProgressText: document.getElementById('overall-progress-text')
};

// Initialize App
async function init() {
    lucide.createIcons();
    setupEventListeners();
    elements.usernameInput.value = state.username;
    
    await fetchData();
    
    if (state.username) {
        await fetchUserSubmissions(state.username);
    }
    
    renderRoadmap();
    renderRecentContests();
    renderDashboard();
    renderBootCamp();
    renderDifficultyTable();
    
    state.loading = false;
    elements.loadingOverlay.classList.add('hidden');
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // Update Active Nav
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch View
            elements.views.forEach(view => {
                if (view.id === targetId) {
                    view.classList.add('active');
                    view.classList.remove('hidden');
                } else {
                    view.classList.remove('active');
                    view.classList.add('hidden');
                }
            });
        });
    });
    
    // User Update
    elements.updateUserBtn.addEventListener('click', async () => {
        const username = elements.usernameInput.value.trim();
        if (username) {
            localStorage.setItem('atcoder_username', username);
            state.username = username;
            
            elements.loadingOverlay.classList.remove('hidden');
            elements.loadingOverlay.querySelector('p').textContent = 'Fetching User Submissions...';
            
            await fetchUserSubmissions(username);
            renderRoadmap(); // Re-render to update status
            renderRecentContests();
            renderDashboard();
            renderBootCamp();
            renderDifficultyTable();
            
            elements.loadingOverlay.classList.add('hidden');
            elements.loadingOverlay.querySelector('p').textContent = 'Syncing Kenkoooo Data...';
        }
    });

    elements.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.updateUserBtn.click();
        }
    });
}

// API Calls
async function fetchData() {
    try {
        const [problemsRes, modelsRes, contestsRes] = await Promise.all([
            fetch('https://kenkoooo.com/atcoder/resources/problems.json'),
            fetch('https://kenkoooo.com/atcoder/resources/problem-models.json'),
            fetch('https://kenkoooo.com/atcoder/resources/contests.json')
        ]);
        
        state.problems = await problemsRes.json();
        state.problemModels = await modelsRes.json();
        state.contests = await contestsRes.json();
    } catch (error) {
        console.error('Failed to fetch data from Kenkoooo', error);
        alert('Failed to connect to AtCoder Problems API. Please try again later.');
    }
}

async function fetchUserSubmissions(username) {
    try {
        const res = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${username}&from_second=0`);
        if (!res.ok) throw new Error('Network response was not ok');
        const submissions = await res.json();
        
        state.userSubmissionsFull = submissions;
        state.userSubmissions.clear();
        submissions.forEach(sub => {
            if (sub.result === 'AC') {
                state.userSubmissions.add(sub.problem_id);
            }
        });
    } catch (error) {
        console.error('Failed to fetch user submissions', error);
        alert('Could not fetch submissions for user: ' + username);
    }
}

// Rendering
function renderRoadmap() {
    elements.curriculumContainer.innerHTML = '';
    
    let totalProblems = 0;
    let totalSolved = 0;
    
    const problemMap = new Map(state.problems.map(p => [p.id, p]));

    CURRICULUM.forEach((topic, index) => {
        let topicSolved = 0;
        
        const problemHtml = topic.problems.map(probId => {
            totalProblems++;
            const isSolved = state.userSubmissions.has(probId);
            if (isSolved) {
                topicSolved++;
                totalSolved++;
            }
            
            const probData = problemMap.get(probId);
            const title = probData ? probData.title : probId;
            const model = state.problemModels[probId] || {};
            const diffClass = getDifficultyColorClass(model.difficulty);
            const url = probData ? `https://atcoder.jp/contests/${probData.contest_id}/tasks/${probId}` : '#';
            
            return `
                <a href="${url}" target="_blank" class="problem-item">
                    <div class="problem-info">
                        <div class="problem-status ${isSolved ? 'solved' : ''}">
                            <i data-lucide="check"></i>
                        </div>
                        <span class="problem-name">${title}</span>
                    </div>
                    <div class="problem-meta">
                        <div class="difficulty-circle ${diffClass}" title="Difficulty: ${model.difficulty !== undefined ? model.difficulty : 'Unknown'}"></div>
                    </div>
                </a>
            `;
        }).join('');
        
        const section = document.createElement('div');
        section.className = `topic-section ${index === 0 ? 'open' : ''}`;
        section.innerHTML = `
            <div class="topic-header">
                <div class="topic-title-group">
                    <span class="topic-title">${topic.title}</span>
                    <span class="topic-stats">${topicSolved} / ${topic.problems.length}</span>
                </div>
                <i data-lucide="chevron-down" class="chevron-icon"></i>
            </div>
            <div class="topic-content">
                <div class="problem-list">
                    ${problemHtml}
                </div>
            </div>
        `;
        
        // Accordion Toggle
        const header = section.querySelector('.topic-header');
        header.addEventListener('click', () => {
            section.classList.toggle('open');
        });
        
        elements.curriculumContainer.appendChild(section);
    });
    
    // Update Overall Progress
    const progressPercent = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;
    elements.overallProgressFill.style.width = `${progressPercent}%`;
    elements.overallProgressText.textContent = `${totalSolved} / ${totalProblems} Solved`;
    
    lucide.createIcons();
}

function renderRecentContests() {
    elements.recentContestsContainer.innerHTML = `
        <div class="contest-tabs">
            <button class="contest-tab active" data-category="abc">ABC</button>
            <button class="contest-tab" data-category="arc">ARC</button>
            <button class="contest-tab" data-category="agc">AGC</button>
            <button class="contest-tab" data-category="others">Others</button>
        </div>
        <div class="contests-grid" id="contests-grid-content"></div>
    `;

    const tabs = elements.recentContestsContainer.querySelectorAll('.contest-tab');
    const gridContent = document.getElementById('contests-grid-content');

    // Group contests
    const categorizedContests = {
        abc: [],
        arc: [],
        agc: [],
        others: []
    };

    state.contests.forEach(c => {
        if (c.id.startsWith('abc')) categorizedContests.abc.push(c);
        else if (c.id.startsWith('arc')) categorizedContests.arc.push(c);
        else if (c.id.startsWith('agc')) categorizedContests.agc.push(c);
        else categorizedContests.others.push(c);
    });

    // Sort each category descending
    Object.keys(categorizedContests).forEach(cat => {
        categorizedContests[cat].sort((a, b) => b.start_epoch_second - a.start_epoch_second);
    });

    const problemsByContest = {};
    state.problems.forEach(p => {
        if (!problemsByContest[p.contest_id]) {
            problemsByContest[p.contest_id] = [];
        }
        problemsByContest[p.contest_id].push(p);
    });

    function renderGrid(category) {
        gridContent.innerHTML = '';
        const allContests = categorizedContests[category]; // show all contests

        let htmlString = '';
        allContests.forEach(contest => {
            const contestProblems = problemsByContest[contest.id] || [];
            contestProblems.sort((a, b) => a.problem_index.localeCompare(b.problem_index));
            
            const date = new Date(contest.start_epoch_second * 1000).toLocaleDateString();
            
            const problemsHtml = contestProblems.map(p => {
                const model = state.problemModels[p.id] || {};
                const diffClass = getDifficultyColorClass(model.difficulty);
                const isSolved = state.userSubmissions.has(p.id);
                
                return `
                    <a href="https://atcoder.jp/contests/${contest.id}/tasks/${p.id}" target="_blank" class="contest-problem-link">
                        <div class="difficulty-circle ${diffClass}"></div>
                        <span class="contest-problem-title">${p.problem_index}. ${p.name}</span>
                        ${isSolved ? '<i data-lucide="check" style="color: var(--success); width: 14px; height: 14px; margin-left: auto;"></i>' : ''}
                    </a>
                `;
            }).join('');
            
            htmlString += `
                <div class="contest-card">
                    <a href="https://atcoder.jp/contests/${contest.id}" target="_blank" class="contest-title">${contest.title}</a>
                    <div class="contest-meta">Date: ${date}</div>
                    <div class="contest-problems">
                        ${problemsHtml}
                    </div>
                </div>
            `;
        });
        
        gridContent.innerHTML = htmlString;
        lucide.createIcons();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderGrid(tab.getAttribute('data-category'));
        });
    });

    // Initial render
    renderGrid('abc');
}

function renderDashboard() {
    if (!state.username) {
        elements.dashboardContainer.innerHTML = '<p style="color: var(--text-muted);">Please enter your AtCoder handle in the sidebar to view your dashboard.</p>';
        return;
    }

    // 1. Calculate AC count
    const totalAC = state.userSubmissions.size;

    // 2. Calculate Streaks
    // Get first AC timestamp for each problem
    const acTimes = [];
    const firstAcMap = new Map();
    state.userSubmissionsFull.forEach(sub => {
        if (sub.result === 'AC') {
            if (!firstAcMap.has(sub.problem_id) || sub.epoch_second < firstAcMap.get(sub.problem_id)) {
                firstAcMap.set(sub.problem_id, sub.epoch_second);
            }
        }
    });
    
    // Group by unique dates in user's timezone (simple approach)
    const activeDates = new Set();
    firstAcMap.forEach(epoch => {
        const d = new Date(epoch * 1000);
        // Using local timezone date string (YYYY-MM-DD)
        const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        activeDates.add(dateStr);
    });

    const sortedDates = Array.from(activeDates).sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    sortedDates.forEach(dateStr => {
        const currDate = new Date(dateStr);
        if (prevDate) {
            const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                tempStreak++;
            } else if (diffDays > 1) {
                tempStreak = 1;
            }
        } else {
            tempStreak = 1;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        prevDate = currDate;
    });

    // Check if current streak is still active (today or yesterday)
    if (prevDate) {
        const today = new Date();
        const diffFromToday = Math.round((today.setHours(0,0,0,0) - prevDate.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
        if (diffFromToday <= 1) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 0;
        }
    }

    // 3. Difficulty Pie/Bar Chart
    const diffCounts = {
        'diff-gray': 0, 'diff-brown': 0, 'diff-green': 0, 'diff-cyan': 0,
        'diff-blue': 0, 'diff-yellow': 0, 'diff-orange': 0, 'diff-red': 0, 'diff-unknown': 0
    };

    state.userSubmissions.forEach(problem_id => {
        const model = state.problemModels[problem_id] || {};
        const colorClass = getDifficultyColorClass(model.difficulty);
        if (diffCounts[colorClass] !== undefined) {
            diffCounts[colorClass]++;
        }
    });

    const colorHex = {
        'diff-gray': '#808080', 'diff-brown': '#804000', 'diff-green': '#008000', 'diff-cyan': '#00C0C0',
        'diff-blue': '#0000FF', 'diff-yellow': '#C0C000', 'diff-orange': '#FF8000', 'diff-red': '#FF0000', 'diff-unknown': '#333'
    };

    let barsHtml = '';
    const maxCount = Math.max(...Object.values(diffCounts), 1);
    Object.keys(diffCounts).forEach(color => {
        if (color === 'diff-unknown') return;
        const count = diffCounts[color];
        const height = (count / maxCount) * 100;
        barsHtml += `
            <div class="chart-bar-container" title="${count} solved">
                <div class="chart-bar" style="height: ${height}%; background-color: ${colorHex[color]};"></div>
                <div class="chart-label">${count}</div>
            </div>
        `;
    });

    elements.dashboardContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <i data-lucide="check-circle" class="stat-icon" style="color: var(--success)"></i>
                <div class="stat-value">${totalAC}</div>
                <div class="stat-label">Total Accepted</div>
            </div>
            <div class="stat-card">
                <i data-lucide="flame" class="stat-icon" style="color: #FF8000"></i>
                <div class="stat-value">${currentStreak} <span style="font-size: 1rem; color: var(--text-muted)">days</span></div>
                <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-card">
                <i data-lucide="trophy" class="stat-icon" style="color: #C0C000"></i>
                <div class="stat-value">${longestStreak} <span style="font-size: 1rem; color: var(--text-muted)">days</span></div>
                <div class="stat-label">Longest Streak</div>
            </div>
        </div>

        <div class="chart-section">
            <h3>Difficulty Distribution</h3>
            <div class="bar-chart">
                ${barsHtml}
            </div>
        </div>
    `;
    lucide.createIcons();
}

function renderBootCamp() {
    elements.bootcampContainer.innerHTML = '';
    
    if (typeof BOOT_CAMP === 'undefined') return;

    const problemMap = new Map(state.problems.map(p => [p.id, p]));

    Object.keys(BOOT_CAMP).forEach(level => {
        const track = BOOT_CAMP[level];
        let solvedCount = 0;

        const problemHtml = track.problems.map((probId, idx) => {
            const isSolved = state.userSubmissions.has(probId);
            if (isSolved) solvedCount++;
            
            const probData = problemMap.get(probId);
            const title = probData ? probData.title : probId;
            const model = state.problemModels[probId] || {};
            const diffClass = getDifficultyColorClass(model.difficulty);
            const url = probData ? \`https://atcoder.jp/contests/\${probData.contest_id}/tasks/\${probId}\` : '#';
            
            return \`
                <a href="\${url}" target="_blank" class="problem-item">
                    <div class="problem-info">
                        <div class="problem-status \${isSolved ? 'solved' : ''}">
                            <i data-lucide="check"></i>
                        </div>
                        <span class="problem-name" style="width: 30px; color: var(--text-muted)">#\${idx + 1}</span>
                        <span class="problem-name">\${title}</span>
                    </div>
                    <div class="problem-meta">
                        <div class="difficulty-circle \${diffClass}"></div>
                    </div>
                </a>
            \`;
        }).join('');

        const progressPercent = (solvedCount / track.problems.length) * 100;

        elements.bootcampContainer.innerHTML += \`
            <div class="topic-section open">
                <div class="topic-header" style="cursor: default">
                    <div class="topic-title-group">
                        <span class="topic-title">\${track.title}</span>
                    </div>
                    <span class="topic-stats">\${solvedCount} / \${track.problems.length}</span>
                </div>
                <div class="progress-bar" style="border-radius: 0; height: 4px;">
                    <div class="progress-fill" style="width: \${progressPercent}%"></div>
                </div>
                <div class="topic-content" style="display: block">
                    <div class="problem-list">
                        \${problemHtml}
                    </div>
                </div>
            </div>
        \`;
    });
    lucide.createIcons();
}

function renderDifficultyTable() {
    const diffGroups = {
        'diff-gray': [], 'diff-brown': [], 'diff-green': [], 'diff-cyan': [],
        'diff-blue': [], 'diff-yellow': [], 'diff-orange': [], 'diff-red': []
    };

    const colorNames = {
        'diff-gray': 'Gray', 'diff-brown': 'Brown', 'diff-green': 'Green', 'diff-cyan': 'Cyan',
        'diff-blue': 'Blue', 'diff-yellow': 'Yellow', 'diff-orange': 'Orange', 'diff-red': 'Red'
    };

    state.problems.forEach(p => {
        const model = state.problemModels[p.id];
        if (model && model.difficulty !== undefined && model.difficulty < 3200) {
            const colorClass = getDifficultyColorClass(model.difficulty);
            if (diffGroups[colorClass]) {
                diffGroups[colorClass].push(p);
            }
        }
    });

    let html = '<div class="difficulty-grid-container">';
    Object.keys(diffGroups).forEach(colorClass => {
        const problems = diffGroups[colorClass];
        problems.sort((a, b) => {
            const da = state.problemModels[a.id].difficulty;
            const db = state.problemModels[b.id].difficulty;
            return da - db;
        });

        let squaresHtml = '';
        problems.forEach(p => {
            const isSolved = state.userSubmissions.has(p.id);
            squaresHtml += \`<a href="https://atcoder.jp/contests/\${p.contest_id}/tasks/\${p.id}" target="_blank" class="diff-square \${isSolved ? 'solved ' + colorClass : ''}" title="\${p.title}"></a>\`;
        });

        html += \`
            <div class="diff-column">
                <div class="diff-col-header \${colorClass}-text">\${colorNames[colorClass]}</div>
                <div class="diff-squares">
                    \${squaresHtml}
                </div>
            </div>
        \`;
    });
    html += '</div>';

    elements.difficultyContainer.innerHTML = html;
}

// Start
document.addEventListener('DOMContentLoaded', init);
