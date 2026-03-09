document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const newMemberInput = document.getElementById('newMemberInput');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const memberList = document.getElementById('memberList');
    const memberSelect = document.getElementById('memberSelect');
    const ideaInput = document.getElementById('ideaInput');
    const submitIdeaBtn = document.getElementById('submitIdeaBtn');
    const ideasList = document.getElementById('ideasList');
    const totalIdeasSpan = document.getElementById('totalIdeas');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // State
    let members = JSON.parse(localStorage.getItem('ib_members')) || [];
    let ideas = JSON.parse(localStorage.getItem('ib_ideas')) || [];
    let isDarkMode = localStorage.getItem('ib_theme') === 'dark';

    // Initialization
    const init = () => {
        applyTheme();
        renderMembers();
        renderIdeas();
        updateStats();
    };

    // Theme Management
    const applyTheme = () => {
        if (isDarkMode) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<span class="icon">☀️</span>';
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<span class="icon">🌙</span>';
        }
    };

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('ib_theme', isDarkMode ? 'dark' : 'light');
        applyTheme();
    });

    // Member Management
    const renderMembers = () => {
        memberList.innerHTML = '';
        memberSelect.innerHTML = '<option value="" disabled selected>Choose a member...</option>';
        
        members.forEach((member, index) => {
            // Add to list
            const li = document.createElement('li');
            li.textContent = member;
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.style.background = 'none';
            deleteBtn.style.color = '#ef4444';
            deleteBtn.style.fontSize = '1.2rem';
            deleteBtn.style.padding = '0 5px';
            deleteBtn.onclick = () => removeMember(index);
            li.appendChild(deleteBtn);
            memberList.appendChild(li);

            // Add to dropdown
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            memberSelect.appendChild(option);
        });
    };

    const addMember = () => {
        const name = newMemberInput.value.trim();
        if (name && !members.includes(name)) {
            members.push(name);
            localStorage.setItem('ib_members', JSON.stringify(members));
            newMemberInput.value = '';
            renderMembers();
        } else if (members.includes(name)) {
            alert('Member already exists!');
        }
    };

    const removeMember = (index) => {
        members.splice(index, 1);
        localStorage.setItem('ib_members', JSON.stringify(members));
        renderMembers();
    };

    addMemberBtn.addEventListener('click', addMember);
    newMemberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addMember();
    });

    // Idea Management
    const renderIdeas = () => {
        ideasList.innerHTML = '';
        if (ideas.length === 0) {
            ideasList.innerHTML = '<p style="text-align: center; opacity: 0.5; padding: 2rem;">No ideas yet. Be the first to share!</p>';
            return;
        }

        ideas.slice().reverse().forEach((idea) => {
            const div = document.createElement('div');
            div.className = 'idea-item';
            div.innerHTML = `
                <p class="idea-text">${idea.text}</p>
                <p class="idea-meta">Shared by <span class="author-name">${idea.author}</span> on ${idea.date}</p>
            `;
            ideasList.appendChild(div);
        });
    };

    const submitIdea = () => {
        const author = memberSelect.value;
        const text = ideaInput.value.trim();

        if (!author) {
            alert('Please select a member!');
            return;
        }
        if (!text) {
            alert('Please enter an idea!');
            return;
        }

        const newIdea = {
            id: Date.now(),
            author,
            text,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        ideas.push(newIdea);
        localStorage.setItem('ib_ideas', JSON.stringify(ideas));
        
        ideaInput.value = '';
        renderIdeas();
        updateStats();
    };

    const updateStats = () => {
        totalIdeasSpan.textContent = ideas.length;
    };

    const clearAllIdeas = () => {
        if (ideas.length === 0) return;
        if (confirm('Are you sure you want to clear all ideas? This cannot be undone.')) {
            ideas = [];
            localStorage.setItem('ib_ideas', JSON.stringify(ideas));
            renderIdeas();
            updateStats();
        }
    };

    submitIdeaBtn.addEventListener('click', submitIdea);
    clearAllBtn.addEventListener('click', clearAllIdeas);

    // Run app
    init();
});
