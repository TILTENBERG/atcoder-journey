// Global State
const state = {
    problems: [], // [{ id, contest_id, problem_index, name, title }]
    problemModels: {}, // { problem_id: { difficulty, is_experimental } }
    contests: [], // [{ id, start_epoch_second, duration_second, title, rate_change }]
    userSubmissions: new Set(), // Set of solved problem IDs
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
    elements.recentContestsContainer.innerHTML = '';
    
    // Sort contests by start time descending
    const sortedContests = [...state.contests].sort((a, b) => b.start_epoch_second - a.start_epoch_second);
    
    // Get latest 12 valid contests
    const recentContests = sortedContests.slice(0, 12);
    
    const problemsByContest = {};
    state.problems.forEach(p => {
        if (!problemsByContest[p.contest_id]) {
            problemsByContest[p.contest_id] = [];
        }
        problemsByContest[p.contest_id].push(p);
    });
    
    const grid = document.createElement('div');
    grid.className = 'contests-grid';
    
    recentContests.forEach(contest => {
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
        
        grid.innerHTML += `
            <div class="contest-card">
                <a href="https://atcoder.jp/contests/${contest.id}" target="_blank" class="contest-title">${contest.title}</a>
                <div class="contest-meta">Date: ${date}</div>
                <div class="contest-problems">
                    ${problemsHtml}
                </div>
            </div>
        `;
    });
    
    elements.recentContestsContainer.appendChild(grid);
    lucide.createIcons();
}

// Start
document.addEventListener('DOMContentLoaded', init);
