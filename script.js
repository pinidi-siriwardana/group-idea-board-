document.addEventListener('DOMContentLoaded', () => {
    const ideaInput = document.getElementById('ideaInput');
    const personSelect = document.getElementById('personSelect');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const ideasList = document.getElementById('ideasList');
    const totalCount = document.getElementById('totalCount');

    let ideas = [];

    const updateStats = () => {
        totalCount.textContent = ideas.length;
    };

    const renderIdeas = () => {
        ideasList.innerHTML = '';
        ideas.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'idea-item';
            li.innerHTML = `
                <span class="idea-text">${item.text}</span>
                <span class="idea-author">— Suggested by ${item.author}</span>
            `;
            ideasList.appendChild(li);
        });
        updateStats();
    };

    const addIdea = () => {
        const text = ideaInput.value.trim();
        const author = personSelect.value;

        if (text === '') {
            ideaInput.focus();
            return;
        }

        const newIdea = {
            text,
            author,
            timestamp: new Date()
        };

        ideas.unshift(newIdea); // Add to beginning of list
        renderIdeas();
        ideaInput.value = '';
        ideaInput.focus();
    };

    const clearInput = () => {
        ideaInput.value = '';
        ideaInput.focus();
    };

    addBtn.addEventListener('click', addIdea);

    clearBtn.addEventListener('click', clearInput);

    ideaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addIdea();
        }
    });
});
