/**
 * UCSC Colombo Dashboard Controller
 * Advanced GPA logic with "What-If" analysis and honors branding.
 * RESTORED: Stable Version.
 */
class DashboardController {
    constructor() {
        this.initTheme();
        this.initNavigation();
        this.initGPACalculator();
        this.initTimer();
        this.initIdeaBoard();
        this.syncDashboardStats();
    }

    save(key, data) { localStorage.setItem(`ucsc_stable_${key}`, JSON.stringify(data)); }
    load(key) { return JSON.parse(localStorage.getItem(`ucsc_stable_${key}`)); }

    initTheme() {
        const themeCheckbox = document.getElementById('themeCheckbox');
        const body = document.body;
        if (localStorage.getItem('ucsc_theme') === 'dark') {
            body.classList.add('dark-mode');
            themeCheckbox.checked = true;
        }
        themeCheckbox.addEventListener('change', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem('ucsc_theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-target');
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                sections.forEach(s => s.classList.toggle('active', s.id === targetId));
            });
        });
    }

    initGPACalculator() {
        const gpaBody = document.getElementById('gpaBody');
        const addRowBtn = document.getElementById('addRowBtn');
        const calculateBtn = document.getElementById('calculateGpaBtn');
        const whatIfBtn = document.getElementById('whatIfBtn');
        
        const createRow = () => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" placeholder="e.g. SCS 1201" class="course-name"></td>
                <td><input type="number" placeholder="3" class="course-credits"></td>
                <td>
                    <select class="course-grade">
                        <option value="4.0">A / A+</option><option value="3.7">A-</option>
                        <option value="3.3">B+</option><option value="3.0">B</option>
                        <option value="2.7">B-</option><option value="2.3">C+</option>
                        <option value="2.0">C</option><option value="1.5">C-</option>
                        <option value="1.0">D</option><option value="0.0">F</option>
                    </select>
                </td>
                <td><button class="remove-row" style="background:none; border:none; color: #E53E3E; cursor:pointer; font-size:1.2rem;">&times;</button></td>
            `;
            tr.querySelector('.remove-row').onclick = () => { if (gpaBody.rows.length > 1) tr.remove(); };
            return tr;
        };

        addRowBtn.onclick = () => gpaBody.appendChild(createRow());

        calculateBtn.onclick = () => {
            const credits = document.querySelectorAll('.course-credits');
            const grades = document.querySelectorAll('.course-grade');
            let totalPoints = 0, totalCredits = 0;

            credits.forEach((c, i) => {
                const val = parseFloat(c.value);
                const grade = parseFloat(grades[i].value);
                if (!isNaN(val) && val > 0) { totalPoints += (val * grade); totalCredits += val; }
            });

            const finalGpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
            this.updateGpaUI(parseFloat(finalGpa));
            this.save('last_gpa', finalGpa);
            this.save('total_credits', totalCredits);
            this.syncDashboardStats();
        };

        whatIfBtn.onclick = () => {
            const targetGpa = parseFloat(document.getElementById('targetGpaInput').value);
            const remainingCredits = parseFloat(document.getElementById('remainingCreditsInput').value);
            const currentGpa = parseFloat(this.load('last_gpa') || 0);
            const currentCredits = parseFloat(this.load('total_credits') || 0);
            const resultDiv = document.getElementById('whatIfResult');

            if (isNaN(targetGpa) || isNaN(remainingCredits)) return alert("Please enter valid data.");

            const currentPoints = currentGpa * currentCredits;
            const requiredGpa = ((targetGpa * (currentCredits + remainingCredits)) - currentPoints) / remainingCredits;

            resultDiv.style.display = 'block';
            if (requiredGpa > 4.0) resultDiv.innerHTML = `⚠️ To reach ${targetGpa.toFixed(2)}, you need a GPA of ${requiredGpa.toFixed(2)} in remaining modules (Impossible).`;
            else if (requiredGpa <= 0) resultDiv.innerHTML = `🎉 Target already reached!`;
            else resultDiv.innerHTML = `📈 You need a GPA of <strong>${requiredGpa.toFixed(2)}</strong> in remaining ${remainingCredits} credits to reach ${targetGpa.toFixed(2)}.`;
        };

        gpaBody.querySelector('.remove-row').onclick = (e) => { if (gpaBody.rows.length > 1) e.target.closest('tr').remove(); };
    }

    updateGpaUI(gpa) {
        document.getElementById('finalGpaDisplay').textContent = gpa.toFixed(2);
        document.getElementById('gpaMeterFill').style.width = `${(gpa / 4.0) * 100}%`;
        
        const badge = document.getElementById('standingBadge');
        const mBox = document.getElementById('motivationBox');
        const mText = document.getElementById('motivationText');

        badge.style.display = 'inline-block';
        mBox.style.display = 'block';

        let standing = "General Pass", color = "var(--pass)", advice = "Consistency is key!";
        if (gpa >= 3.70) { standing = "First Class"; color = "var(--first-class)"; advice = "Exceptional performance!"; }
        else if (gpa >= 3.30) { standing = "2nd Upper"; color = "var(--second-upper)"; advice = "Great job, aim for First Class!"; }
        else if (gpa >= 3.00) { standing = "2nd Lower"; color = "var(--second-lower)"; advice = "Solid standing!"; }
        else if (gpa < 2.00) { standing = "Warning"; color = "#E53E3E"; advice = "Improvement needed!"; }

        badge.textContent = standing;
        badge.style.backgroundColor = color;
        mText.textContent = advice;
    }

    initTimer() {
        const display = document.getElementById('timerDisplay');
        const startBtn = document.getElementById('startTimerBtn');
        const status = document.getElementById('timerStatus');
        const stage = document.getElementById('timerStage');
        const progressCircle = document.getElementById('timerProgress');
        const historyList = document.getElementById('timerHistoryList');
        const totalStats = document.getElementById('totalFocusStats');
        
        const circumference = 2 * Math.PI * 135; // 2 * pi * r
        const totalSeconds = 25 * 60;
        let timeLeft = totalSeconds;
        let timerId = null;
        let isRunning = false;

        // History Management
        this.timerHistory = this.load('timer_history') || [];

        const updateHistoryUI = () => {
            if (this.timerHistory.length === 0) {
                historyList.innerHTML = '<p class="empty-msg">No sessions recorded yet. Stay focused!</p>';
                totalStats.textContent = 'Total: 0 mins';
                return;
            }

            historyList.innerHTML = '';
            let totalMins = 0;
            this.timerHistory.slice().reverse().forEach(session => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `<span>${session.duration} min session</span> <span>${session.time}</span>`;
                historyList.appendChild(item);
                totalMins += session.duration;
            });
            totalStats.textContent = `Total Focus: ${totalMins} mins`;
        };

        const saveSession = (duration) => {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            this.timerHistory.push({ duration, time: timeStr, date: now.toLocaleDateString() });
            this.save('timer_history', this.timerHistory);
            updateHistoryUI();
        };

        const setProgress = (percent) => {
            const offset = circumference - (percent / 100 * circumference);
            progressCircle.style.strokeDashoffset = offset;
        };

        const update = () => {
            const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
            display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            const percent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
            setProgress(percent);
        };

        startBtn.onclick = () => {
            if (isRunning) {
                clearInterval(timerId);
                isRunning = false;
                startBtn.textContent = "Resume Session";
                status.textContent = "Paused";
                stage.classList.remove('timer-active');
            } else {
                isRunning = true;
                startBtn.textContent = "Pause Session";
                status.textContent = "Focusing...";
                stage.classList.add('timer-active');
                timerId = setInterval(() => {
                    timeLeft--;
                    update();
                    if (timeLeft <= 0) {
                        clearInterval(timerId);
                        isRunning = false;
                        stage.classList.remove('timer-active');
                        saveSession(25); // Save 25 min session
                        alert("Focus Complete! Session recorded.");
                        startBtn.textContent = "Start Session";
                        timeLeft = totalSeconds;
                        update();
                    }
                }, 1000);
            }
        };

        document.getElementById('resetTimerBtn').onclick = () => {
            clearInterval(timerId);
            timeLeft = totalSeconds;
            isRunning = false;
            update();
            startBtn.textContent = "Start Session";
            status.textContent = "Ready";
            stage.classList.remove('timer-active');
        };
        
        // Initial setup
        setProgress(0);
        updateHistoryUI();
    }

    initIdeaBoard() {
        this.members = this.load('members') || []; this.ideas = this.load('ideas') || [];
        const render = (filterTerm = '') => {
            const mList = document.getElementById('memberList'), s = document.getElementById('memberSelect');
            if (mList && s) {
                mList.innerHTML = ''; s.innerHTML = '<option value="" disabled selected>Select Author</option>';
                this.members.forEach((m, i) => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span>${m}</span> <button onclick="window.dashboard.delM(${i})" style="color:#ff4444; background:none; border:none; cursor:pointer;">&times;</button>`;
                    mList.appendChild(li);
                    const opt = document.createElement('option'); opt.value = m; opt.textContent = m; s.appendChild(opt);
                });
            }

            const feed = document.getElementById('ideasList');
            if (feed) {
                feed.innerHTML = '';
                const filtered = this.ideas.map((id, index) => ({ ...id, originalIndex: index }))
                    .filter(id => 
                        id.author.toLowerCase().includes(filterTerm.toLowerCase()) || 
                        id.text.toLowerCase().includes(filterTerm.toLowerCase())
                    );
                
                if (filtered.length === 0) {
                    feed.innerHTML = `<p class="empty-msg" style="grid-column: 1/-1; margin-top: 4rem;">${filterTerm ? 'No ideas match your search.' : 'No batch ideas yet. Be the first to post!'}</p>`;
                } else {
                    filtered.slice().reverse().forEach(id => {
                        const initial = id.author.charAt(0).toUpperCase();
                        const div = document.createElement('div'); div.className = 'idea-item';
                        div.innerHTML = `
                            <div class="idea-header">
                                <div class="author-meta">
                                    <div class="author-avatar">${initial}</div>
                                    <h4>${id.author}</h4>
                                </div>
                                <button onclick="window.dashboard.delI(${id.originalIndex})" class="del-idea-btn" title="Remove Idea">&times;</button>
                            </div>
                            <p>${id.text}</p>
                            <div class="idea-footer">
                                <span class="idea-tag">💡 Proposal</span>
                                <small>${id.date}</small>
                            </div>
                        `;
                        feed.appendChild(div);
                    });
                }
            }
        };

        const filterInput = document.getElementById('filterInput');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => render(e.target.value.trim()));
        }

        document.getElementById('addMemberBtn').onclick = () => {
            const v = document.getElementById('newMemberInput').value.trim();
            if (v && !this.members.includes(v)) { this.members.push(v); this.save('members', this.members); render(); }
        };
        document.getElementById('submitIdeaBtn').onclick = () => {
            const a = document.getElementById('memberSelect').value, t = document.getElementById('ideaInput').value.trim();
            if (a && t) { 
                this.ideas.push({ author: a, text: t, date: new Date().toLocaleString() }); 
                this.save('ideas', this.ideas); 
                document.getElementById('ideaInput').value = '';
                render(); 
            }
        };
        window.dashboard = { 
            delM: (i) => { this.members.splice(i, 1); this.save('members', this.members); render(); },
            delI: (i) => { if(confirm('Delete this idea?')) { this.ideas.splice(i, 1); this.save('ideas', this.ideas); render(); } }
        };
        render();
    }

    syncDashboardStats() {
        const hGpa = document.getElementById('homeGpa'), hB = document.getElementById('homeBadge');
        const hFocus = document.getElementById('homeFocusTime'), hIdea = document.getElementById('homeIdeaCount');
        const greeting = document.getElementById('greetingText');
        
        // Personal Greeting
        const hour = new Date().getHours();
        const msg = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
        if (greeting) greeting.textContent = `${msg}, Scholar! 🎓`;

        // GPA Stats
        const g = parseFloat(this.load('last_gpa') || 0);
        if (hGpa) hGpa.textContent = g.toFixed(2);
        if (g > 0 && hB) {
            hB.style.display = 'inline-block';
            hB.textContent = g >= 3.7 ? "First Class" : g >= 3.3 ? "2nd Upper" : g >= 3.0 ? "2nd Lower" : "Pass";
            hB.style.backgroundColor = g >= 3.7 ? "var(--first-class)" : g >= 3.3 ? "var(--second-upper)" : "var(--pass)";
        }

        // Focus Stats
        const history = this.load('timer_history') || [];
        const totalFocus = history.reduce((acc, curr) => acc + curr.duration, 0);
        if (hFocus) hFocus.textContent = `${totalFocus} mins`;

        // Idea Stats
        const ideas = this.load('ideas') || [];
        if (hIdea) hIdea.textContent = ideas.length;

        // Quotes System
        const quotes = [
            { t: "The beautiful thing about learning is that no one can take it away from you.", a: "B.B. King" },
            { t: "Education is the most powerful weapon which you can use to change the world.", a: "Nelson Mandela" },
            { t: "An investment in knowledge pays the best interest.", a: "Benjamin Franklin" },
            { t: "Success is the sum of small efforts, repeated day in and day out.", a: "Robert Collier" }
        ];
        const quoteObj = quotes[Math.floor(Math.random() * quotes.length)];
        const qElem = document.getElementById('dailyQuote'), aElem = document.getElementById('quoteAuthor');
        if (qElem) qElem.textContent = `"${quoteObj.t}"`;
        if (aElem) aElem.textContent = `— ${quoteObj.a}`;
    }
}

document.addEventListener('DOMContentLoaded', () => new DashboardController());
