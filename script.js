document.addEventListener('DOMContentLoaded', () => {
    const ideaInput = document.getElementById('idea-input');
    const personSelect = document.getElementById('person-select');
    const addIdeaBtn = document.getElementById('add-idea-btn');
    const clearInputBtn = document.getElementById('clear-input-btn');
    const ideaList = document.getElementById('idea-list');
    const totalCount = document.getElementById('total-count');
    const emptyState = document.getElementById('empty-state');

    let ideas = [];

    // Auto-expand textarea
    ideaInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    const updateView = () => {
        totalCount.textContent = ideas.length;
        
        if (ideas.length === 0) {
            emptyState.style.display = 'block';
            ideaList.style.display = 'none';
        } else {
            emptyState.style.display = 'grid';
            emptyState.style.display = 'grid';
            emptyState.style.display = 'none';
            ideaList.style.display = 'grid';
        }
    };

    const addIdea = () => {
        const text = ideaInput.value.trim();
        const author = personSelect.value;

        if (!text) {
            highlightError(ideaInput);
            return;
        }

        if (!author) {
            highlightError(personSelect);
            return;
        }

        const newIdea = {
            id: Date.now(),
            text,
            author
        };

        ideas.unshift(newIdea);
        renderIdea(newIdea);
        updateView();
        clearFields();
    };

    const renderIdea = (idea) => {
        const li = document.createElement('li');
        li.className = 'idea-item';
        li.innerHTML = `
            <p class="idea-text">${idea.text}</p>
            <div class="idea-footer">
                <div class="author-tag">Suggested by ${idea.author}</div>
            </div>
        `;
        
        if (ideaList.firstChild) {
            ideaList.insertBefore(li, ideaList.firstChild);
        } else {
            ideaList.appendChild(li);
        }
    };

    const clearFields = () => {
        ideaInput.value = '';
        ideaInput.style.height = 'auto';
        personSelect.selectedIndex = 0;
        resetError(ideaInput);
        resetError(personSelect);
    };

    const highlightError = (el) => {
        el.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        el.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
        el.focus();
    };

    const resetError = (el) => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
    };

    addIdeaBtn.addEventListener('click', addIdea);
    clearInputBtn.addEventListener('click', clearFields);

    // Enter key (Shift+Enter for new line in textarea)
    ideaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addIdea();
        }
    });

    // Initialize UI
    updateView();
});
