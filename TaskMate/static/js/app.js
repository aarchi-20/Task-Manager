/* ===========================================================
   TASK MATE — app.js
   Single shared script for all pages.

   SCOPE: This file is purely cosmetic/UI behavior. It does NOT
   handle authentication, task data, form submission, filtering,
   search, or anything that depends on the database. All of that
   is Django's job now:
     - Forms should be plain <form method="post" action="...">
       elements with {% csrf_token %} inside them.
     - Task lists should be rendered server-side with
       {% for task in tasks %} in the templates.
     - Filtering/search/sort should happen via query params
       handled by Django views, or be left for a later JS pass
       once the backend exists.

   What THIS file covers: theme toggle, mobile sidebar open/close,
   modal open/close animations, toast notifications, and the
   "+ New category" field reveal in the task form. Nothing here
   reads or writes task/user data.
   =========================================================== */

const UI = {
  /* ---- Theme ---- */
  initTheme(){
    const saved = sessionStorage.getItem('tm-theme-pref') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  },
  setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('tm-theme-pref', theme);
  },
  toggleTheme(){
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },
  wireThemeToggle(btnId, checkboxId){
    const btn = btnId ? document.getElementById(btnId) : null;
    const checkbox = checkboxId ? document.getElementById(checkboxId) : null;
    const sync = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      if(btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
      if(checkbox) checkbox.checked = theme === 'dark';
    };
    sync();
    if(btn) btn.addEventListener('click', () => { UI.toggleTheme(); sync(); });
    if(checkbox) checkbox.addEventListener('change', () => { UI.toggleTheme(); sync(); });
  },

  /* ---- Toast (purely visual; call UI.toast(msg, type) from inline
     template logic or after a page reload if you want a confirmation
     message — e.g. via a Django messages framework + a small script
     in the template that reads the message and calls this.) ---- */
  toast(msg, type = 'info'){
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const colors = { success: 'var(--emerald)', error: 'var(--rose)', info: 'var(--indigo)' };
    let wrap = document.getElementById('toastWrap');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'toastWrap';
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    const iconSpan = document.createElement('span');
    iconSpan.style.color = colors[type];
    iconSpan.style.fontWeight = '700';
    iconSpan.style.fontSize = '1rem';
    iconSpan.textContent = icons[type];
    const msgSpan = document.createElement('span');
    msgSpan.textContent = msg;
    el.appendChild(iconSpan);
    el.appendChild(msgSpan);
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = '.3s';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }
};

/* ===========================================================
   GLOBAL: runs on every page
   Theme + mobile sidebar — both purely visual, no data involved.
   =========================================================== */
(function initGlobalChrome(){
  UI.initTheme();

  // Theme toggle button (topbar icon) — present on most inner pages
  UI.wireThemeToggle('themeToggle', null);

  // Mobile sidebar open/close — present on dashboard.html / profile.html
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if(menuBtn && sidebar){
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
})();

/* ===========================================================
   PAGE: profile.html
   The Appearance section has its own dark-mode checkbox that
   needs to stay in sync with the topbar toggle (both control the
   same theme, just two different controls on the same page).
   =========================================================== */
(function initProfilePageVisuals(){
  const darkModeToggle = document.getElementById('darkModeToggle');
  if(!darkModeToggle) return; // not the profile page

  UI.wireThemeToggle(null, 'darkModeToggle');
})();

/* ===========================================================
   PAGE: dashboard.html
   Modal open/close animations only. No task data, no save/
   delete logic, no filtering — just showing and hiding the
   modal elements. Wire your Django form actions directly onto
   the <form> tags inside these modals separately.
   =========================================================== */
(function initDashboardModals(){
  const taskModal = document.getElementById('taskModal');
  if(!taskModal) return; // not the dashboard page

  const deleteTaskModal = document.getElementById('deleteTaskModal');
  const categorySelect = document.getElementById('taskCategory');
  const newCategoryGroup = document.getElementById('newCategoryGroup');

  function openModal(modal){ modal?.classList.add('open'); }
  function closeModal(modal){ modal?.classList.remove('open'); }

  // Open the "Add Task" modal — fill in real field resets/defaults
  // in your Django template or via a tiny page-specific script once
  // the form is wired to the backend.
  document.getElementById('addTaskBtn')?.addEventListener('click', () => openModal(taskModal));
  document.getElementById('fabAddBtn')?.addEventListener('click', () => openModal(taskModal));
  document.getElementById('cancelTaskBtn')?.addEventListener('click', () => closeModal(taskModal));
  taskModal.addEventListener('click', (e) => { if(e.target === taskModal) closeModal(taskModal); });

  // Edit/delete buttons on individual task cards are rendered by
  // Django per task, so wire their click handlers in the template
  // (e.g. data attributes + a small inline script) or re-add page
  // logic here once task data flows through the backend.

  document.getElementById('cancelDeleteTaskBtn')?.addEventListener('click', () => closeModal(deleteTaskModal));
  deleteTaskModal?.addEventListener('click', (e) => { if(e.target === deleteTaskModal) closeModal(deleteTaskModal); });

  // Purely visual: reveal the "new category name" field when the
  // select's "+ New category..." option is chosen.
  categorySelect?.addEventListener('change', () => {
    if(newCategoryGroup){
      newCategoryGroup.style.display = categorySelect.value === '__new__' ? 'block' : 'none';
    }
  });
})();

/* ===========================================================
   PAGE: profile.html
   Modal open/close animations for "Clear All Tasks" and
   "Delete Account" confirmations. No deletion logic lives here —
   the confirm buttons should be real submit buttons inside
   Django <form> elements pointing at your backend views.
   =========================================================== */
(function initProfileModals(){
  const clearTasksModal = document.getElementById('clearTasksModal');
  const deleteModal = document.getElementById('deleteModal');
  if(!clearTasksModal && !deleteModal) return; // not the profile page

  function openModal(modal){ modal?.classList.add('open'); }
  function closeModal(modal){ modal?.classList.remove('open'); }

  document.getElementById('clearTasksBtn')?.addEventListener('click', () => openModal(clearTasksModal));
  document.getElementById('cancelClearTasksBtn')?.addEventListener('click', () => closeModal(clearTasksModal));
  clearTasksModal?.addEventListener('click', (e) => { if(e.target === clearTasksModal) closeModal(clearTasksModal); });

  document.getElementById('openDeleteModalBtn')?.addEventListener('click', () => openModal(deleteModal));
  document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal(deleteModal));
  deleteModal?.addEventListener('click', (e) => { if(e.target === deleteModal) closeModal(deleteModal); });
})();