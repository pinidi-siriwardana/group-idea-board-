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
    const filterInput = document.getElementById('filterInput');

    // State
    let members = JSON.parse(localStorage.getItem('ib_members')) || [];
    let ideas = JSON.parse(localStorage.getItem('ib_ideas')) || [];
    let isDarkMode = localStorage.getItem('ib_theme') === 'dark';
    let filterText = '';

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
        
        const filteredIdeas = ideas.filter(idea => 
            idea.text.toLowerCase().includes(filterText.toLowerCase()) || 
            idea.author.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filteredIdeas.length === 0) {
            const message = filterText 
                ? `No ideas found matching "${filterText}"`
                : 'No ideas yet. Be the first to share!';
            ideasList.innerHTML = `<p style="text-align: center; opacity: 0.5; padding: 2rem;">${message}</p>`;
            return;
        }

        filteredIdeas.slice().reverse().forEach((idea) => {
            const div = document.createElement('div');
            div.className = 'idea-item';
            div.innerHTML = `
                <div class="idea-content">
                    <p class="idea-text">${idea.text}</p>
                    <p class="idea-meta">Shared by <span class="author-name">${idea.author}</span> on ${idea.date}</p>
                </div>
                <button class="delete-idea-btn" title="Delete Idea">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;

            const deleteBtn = div.querySelector('.delete-idea-btn');
            deleteBtn.onclick = () => deleteIdea(idea.id);

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

    const deleteIdea = (id) => {
        if (confirm('Are you sure you want to delete this idea?')) {
            ideas = ideas.filter(idea => idea.id !== id);
            localStorage.setItem('ib_ideas', JSON.stringify(ideas));
            renderIdeas();
            updateStats();
        }
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

    // Event Listeners
    submitIdeaBtn.addEventListener('click', submitIdea);
    clearAllBtn.addEventListener('click', clearAllIdeas);
    
    filterInput.addEventListener('input', (e) => {
        filterText = e.target.value;
        renderIdeas();
    });

    // Run app
    init();
});
