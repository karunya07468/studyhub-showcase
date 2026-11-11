(() => {
  'use strict';

  const STORE_KEY = 'studyhub.workspace.v2';
  const today = new Date();
  const dateKey = date => {
    const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 10);
  };
  const shiftDate = days => { const d = new Date(); d.setDate(d.getDate() + days); return dateKey(d); };
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const initials = name => String(name || 'S').trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'S';
  const readStore = () => {
    try { const parsed = JSON.parse(localStorage.getItem(STORE_KEY)); if (parsed && parsed.version === 2) return parsed; } catch { /* Use a clean workspace if saved data is unavailable. */ }
    return null;
  };
  const initialState = () => ({
    version: 2,
    profile: { name: 'Student', course: 'Computer Science' },
    theme: 'light',
    tasks: [
      { id: uid(), title: 'Review notes from today’s lecture', due: shiftDate(0), priority: 'high', done: false },
      { id: uid(), title: 'Finish the group project outline', due: shiftDate(1), priority: 'medium', done: false },
      { id: uid(), title: 'Read chapter 4 before class', due: shiftDate(2), priority: 'low', done: false },
      { id: uid(), title: 'Organize study materials for the week', due: shiftDate(-1), priority: 'medium', done: true, completedAt: shiftDate(0) }
    ],
    notes: [
      { id: uid(), title: 'A better way to study', body: 'Start with one clear goal.\n\nTry active recall: close your notes and write what you remember. Then check the gaps.\n\nNext up\n- Break the reading into small sections\n- Take a short walk between study blocks', updatedAt: new Date().toISOString() },
      { id: uid(), title: 'Project ideas', body: 'Things I want to explore this semester:\n\n- Build a small tool that solves a real problem\n- Ask classmates for feedback early\n- Keep a simple changelog as I work', updatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: uid(), title: 'Week 1 — class notes', body: 'Questions to bring to the next study group:\n\n1. Which concepts should we practice together?\n2. What is the best way to split up the assignment?\n3. When should we meet again?', updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() }
    ],
    students: [
      { id: uid(), name: 'Ava Patel', email: 'ava.patel@campus.edu', course: 'Computer Science', cgpa: 8.8 },
      { id: uid(), name: 'Noah Williams', email: 'noah.w@campus.edu', course: 'Information Systems', cgpa: 8.4 },
      { id: uid(), name: 'Mia Chen', email: 'mia.chen@campus.edu', course: 'Computer Science', cgpa: 9.2 },
      { id: uid(), name: 'Liam Johnson', email: 'liam.j@campus.edu', course: 'Data Science', cgpa: 7.9 },
      { id: uid(), name: 'Sofia Garcia', email: 'sofia.g@campus.edu', course: 'Information Systems', cgpa: 8.6 },
      { id: uid(), name: 'Ethan Kim', email: 'ethan.kim@campus.edu', course: 'Computer Science', cgpa: 8.1 }
    ],
    attempts: [],
    focusSessions: []
  });

  let state = readStore() || initialState();
  let view = location.hash.replace('#', '') || 'dashboard';
  let taskFilter = 'all';
  let noteSearch = '';
  let selectedNoteId = state.notes[0]?.id || null;
  let directorySearch = '';
  let directorySort = 'name';
  let quizIndex = 0;
  let quizAnswers = [];
  let quizFinished = false;
  let searchQuery = '';
  let focusSeconds = 25 * 60;
  let focusTimer = null;
  let autosaveTimer = null;
  let noteSaveTimer = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const main = $('#mainContent');
  const relativeDate = date => {
    if (!date) return 'No date';
    const value = new Date(`${date}T00:00:00`);
    if (Number.isNaN(value.getTime())) return 'No date';
    const days = Math.round((value - new Date(`${dateKey(new Date())}T00:00:00`)) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  const prettyDate = date => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeAgo = iso => {
    const hours = Math.max(0, Math.floor((Date.now() - new Date(iso || Date.now()).getTime()) / 3600000));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  };
  const notify = (message, error = false) => {
    const toast = document.createElement('div'); toast.className = `toast${error ? ' error' : ''}`; toast.textContent = message;
    $('#toastRegion').append(toast); window.setTimeout(() => toast.remove(), 3000);
  };
  function save(showStatus = true) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      if (showStatus) {
        const status = $('#saveStatus');
        if (status) status.textContent = 'Saved on this device';
      }
    } catch {
      const status = $('#saveStatus'); if (status) status.textContent = 'Could not save';
      notify('This browser could not save your changes. Try freeing up browser storage.', true);
    }
  }
  const updateProfileBits = () => {
    const name = state.profile.name || 'Student'; const initial = initials(name);
    $('#sidebarUserName').textContent = name; $('#sidebarAvatar').textContent = initial; $('#topAvatar').textContent = initial;
    $('.workspace-avatar').textContent = initial;
    document.body.classList.toggle('dark', state.theme === 'dark');
    const use = $('.theme-toggle use'); if (use) use.setAttribute('href', state.theme === 'dark' ? '#i-sun' : '#i-moon');
  };
  const viewNames = { dashboard: 'Overview', tasks: 'My tasks', notes: 'Notes', quiz: 'Quick quiz', students: 'Classmates', search: 'Search results' };
  function navigate(next) {
    view = viewNames[next] ? next : 'dashboard';
    history.replaceState(null, '', `#${view === 'search' ? 'dashboard' : view}`);
    if (view !== 'search') searchQuery = '';
    $('#globalSearch').value = '';
    $('#sidebar').classList.remove('menu-open'); document.body.classList.remove('menu-open');
    render(); main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function header(eyebrow, title, description, actions = '') {
    return `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`;
  }
  function button(label, action, soft = false, symbol = 'plus') {
    return `<button class="button ${soft ? 'button-soft' : 'button-primary'}" data-action="${action}">${icon(symbol)}${label}</button>`;
  }
  function completedCount() { return state.tasks.filter(task => task.done).length; }
  function unfinishedCount() { return state.tasks.filter(task => !task.done).length; }
  function totalQuizScore() { return state.attempts.length ? Math.round(state.attempts.reduce((sum, item) => sum + item.percent, 0) / state.attempts.length) : null; }
  function taskRow(task, compact = false) {
    const dueClass = task.due && task.due < dateKey(new Date()) && !task.done ? ' overdue' : '';
    return `<div class="task-item${task.done ? ' completed' : ''}" data-task-row="${escapeHtml(task.id)}"><button class="task-checkbox" data-task-toggle="${escapeHtml(task.id)}" aria-label="Mark ${escapeHtml(task.title)} ${task.done ? 'incomplete' : 'complete'}">${icon('check')}</button><span class="task-title">${escapeHtml(task.title)}</span><span class="task-meta${dueClass}"><i class="priority-dot priority-${escapeHtml(task.priority)}"></i>${compact ? '' : `${escapeHtml(task.priority[0].toUpperCase() + task.priority.slice(1))} · `}${escapeHtml(relativeDate(task.due))}</span></div>`;
  }
  function dashboard() {
    const pending = unfinishedCount(); const notes = state.notes.length; const score = totalQuizScore(); const sessions = state.focusSessions.length;
    const firstName = escapeHtml((state.profile.name || 'Student').trim().split(/\s+/)[0]);
    const hour = new Date().getHours(); const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
    const dueSoon = [...state.tasks].filter(task => !task.done).sort((a, b) => String(a.due || '').localeCompare(String(b.due || ''))).slice(0, 4);
    const recentNotes = [...state.notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);
    const stats = [
      ['check', 'yellow', pending, 'Tasks to do', pending ? 'Keep the momentum' : 'All caught up'],
      ['note', '', notes, 'Notes saved', notes ? 'Your ideas, in one place' : 'Start your first note'],
      ['spark', 'lavender', score === null ? '—' : `${score}%`, 'Quiz average', state.attempts.length ? `${state.attempts.length} sprint${state.attempts.length === 1 ? '' : 's'} completed` : 'Try a quick sprint'],
      ['clock', 'blue', sessions, 'Focus sessions', sessions ? 'Nice work showing up' : 'Make time for a deep breath']
    ];
    return `${header(greeting, `Welcome back, ${firstName}.`, prettyDate(new Date()))}
      <section class="welcome-panel"><div class="welcome-copy"><span class="eyebrow">A FRESH START, EVERY DAY</span><h2>Your space to focus, grow, and get things done.</h2><p>Keep your classes, thoughts, and little wins together. You’ve got this.</p><button class="button button-primary" data-action="start-focus">Start a focus session ${icon('arrow')}</button></div><div class="welcome-art" aria-hidden="true"><div class="art-sun"></div><div class="art-plant"><i class="art-leaf one"></i><i class="art-leaf two"></i><i class="art-leaf three"></i><i class="art-pot"></i></div><span class="art-scribble">take it easy</span></div></section>
      <section class="metric-grid" aria-label="Your study summary">${stats.map(([symbol, color, number, label, trend]) => `<article class="metric-card"><span class="metric-icon ${color}">${icon(symbol)}</span><div><div class="metric-number">${number}</div><div class="metric-label">${label}</div></div><span class="metric-trend">${trend}</span></article>`).join('')}</section>
      <section class="dashboard-grid"><div class="dashboard-column"><article class="panel"><div class="panel-heading"><div><h3>Your week at a glance</h3><p>A few focused minutes make a difference.</p></div><span class="tag">THIS WEEK</span></div>${weekChart()}</article><article class="panel"><div class="panel-heading"><div><h3>Coming up</h3><p>A little plan goes a long way.</p></div><button class="panel-link" data-view="tasks">All tasks ${icon('arrow')}</button></div><div class="task-list">${dueSoon.length ? dueSoon.map(task => taskRow(task, true)).join('') : '<div class="empty-inline">You’re all caught up. Enjoy the breathing room.</div>'}</div></article></div><div class="dashboard-column"><article class="panel"><div class="panel-heading"><div><h3>Your progress</h3><p>Every small win adds up.</p></div></div><div class="course-progress"><div class="progress-ring" style="--progress:${state.tasks.length ? Math.round(completedCount() / state.tasks.length * 100) : 0}%"><strong>${state.tasks.length ? Math.round(completedCount() / state.tasks.length * 100) : 0}%</strong></div><div class="progress-info"><strong>${state.profile.course ? escapeHtml(state.profile.course) : 'Your study space'}</strong><p>${completedCount()} of ${state.tasks.length} tasks checked off. Keep going at your own pace.</p></div></div></article><article class="panel"><div class="panel-heading"><div><h3>Recently opened</h3><p>Your latest thoughts and notes.</p></div><button class="panel-link" data-view="notes">All notes ${icon('arrow')}</button></div>${recentNotes.length ? recentNotes.map(note => `<div class="note-preview" data-open-note="${escapeHtml(note.id)}"><strong>${escapeHtml(note.title || 'Untitled note')}</strong><small>${timeAgo(note.updatedAt)} · ${(escapeHtml(note.body || '').slice(0, 58) || 'No content yet')}</small></div>`).join('') : '<div class="empty-inline">Your next bright idea starts here.</div>'}</article><article class="panel"><div class="panel-heading"><div><h3>Quick links</h3><p>Pick up where you left off.</p></div></div><div class="quick-links"><button class="panel-link" data-view="notes">Open your notes ${icon('arrow')}</button><button class="panel-link" data-view="quiz">Take a 2-minute quiz ${icon('arrow')}</button></div></article></div></section>`;
  }
  function weekChart() {
    const labels = []; const done = []; const focus = [];
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date(); date.setDate(date.getDate() - offset); const key = dateKey(date);
      labels.push(date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2));
      done.push(state.tasks.filter(task => task.done && task.completedAt === key).length);
      focus.push(state.focusSessions.filter(session => session.date === key).length);
    }
    const max = Math.max(2, ...done, ...focus);
    return `<div class="weekly-chart">${labels.map((day, index) => `<div class="chart-day"><div class="bar-pair"><i class="bar" title="${done[index]} tasks completed" style="height:${Math.max(4, done[index] / max * 86)}px"></i><i class="bar primary" title="${focus[index]} focus sessions" style="height:${Math.max(4, focus[index] / max * 86)}px"></i></div><span>${day}</span></div>`).join('')}</div><div class="chart-legend"><span><i class="legend-dot"></i>Tasks finished</span><span><i class="legend-dot strong"></i>Focus sessions</span></div>`;
  }
  function tasksPage() {
    const list = state.tasks.filter(task => taskFilter === 'all' || (taskFilter === 'open' && !task.done) || (taskFilter === 'done' && task.done)).sort((a, b) => Number(a.done) - Number(b.done) || String(a.due || '').localeCompare(String(b.due || '')));
    const done = completedCount(); const total = state.tasks.length; const pct = total ? Math.round(done / total * 100) : 0;
    const filters = [['all', 'All tasks'], ['open', 'To do'], ['done', 'Completed']];
    return `${header('YOUR PLAN, YOUR PACE', 'My tasks.', 'A clear list makes room for clear thinking.', button('Add a task', 'focus-task-form'))}
      <section class="tasks-page-grid"><article class="panel"><form class="task-form" id="taskForm"><input class="text-input task-text-field" name="title" maxlength="100" required placeholder="What do you need to do?" aria-label="New task title"><input class="text-input" name="due" type="date" aria-label="Due date" value="${shiftDate(0)}"><select class="select-input" name="priority" aria-label="Priority"><option value="medium">Medium</option><option value="high">High</option><option value="low">Low</option></select><button class="button button-primary" type="submit">${icon('plus')}Add</button></form><div class="toolbar-row"><div class="segmented">${filters.map(([id, label]) => `<button class="segment ${taskFilter === id ? 'active' : ''}" data-task-filter="${id}">${label}${id === 'open' ? ` (${unfinishedCount()})` : ''}</button>`).join('')}</div></div><div class="task-list task-view-list">${list.length ? list.map(task => taskRow(task)).join('') : `<div class="empty-state"><span class="empty-icon">${icon('check-circle')}</span><h3>${taskFilter === 'done' ? 'No completed tasks yet' : 'Nothing on your plate'}</h3><p>${taskFilter === 'done' ? 'Your finished tasks will show up here.' : 'Add a task above and take it one small step at a time.'}</p></div>`}</div></article><aside class="panel task-side-card"><span class="eyebrow">YOUR MOMENTUM</span><h3>A steady rhythm beats a rush.</h3><p>You’re making progress, one task at a time.</p><div class="task-side-stat"><strong>${done}<small style="font-size:13px;color:#829483"> / ${total}</small></strong><span>tasks finished</span></div><div class="thin-progress"><i style="width:${pct}%"></i></div><div class="task-tip">Tip: try breaking a big assignment into two or three tiny next steps. It makes getting started feel easier.</div><button class="button button-primary" style="margin-top:15px;width:100%" data-action="start-focus">${icon('clock')}Start focus timer</button></aside></section>`;
  }
  function notesPage() {
    const notes = [...state.notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).filter(note => `${note.title} ${note.body}`.toLowerCase().includes(noteSearch.toLowerCase()));
    if (!notes.some(note => note.id === selectedNoteId)) selectedNoteId = notes[0]?.id || null;
    const selected = state.notes.find(note => note.id === selectedNoteId);
    return `${header('YOUR OWN LITTLE LIBRARY', 'Notes.', 'Catch a thought before it slips away.', button('New note', 'new-note'))}<section class="notes-layout"><aside class="notes-list-pane"><div class="notes-list-head"><strong>All notes <span class="tag">${state.notes.length}</span></strong><button class="icon-button" data-action="new-note" aria-label="Create a note">${icon('plus')}</button></div><input class="notes-search" id="noteSearch" type="search" placeholder="Find a note..." value="${escapeHtml(noteSearch)}" aria-label="Find a note">${notes.map(note => `<div class="note-row ${note.id === selectedNoteId ? 'active' : ''}" data-note-select="${escapeHtml(note.id)}"><strong>${escapeHtml(note.title || 'Untitled note')}</strong><small>${escapeHtml((note.body || 'No content yet').replace(/\s+/g, ' ').slice(0, 48))}</small></div>`).join('')}${notes.length ? '' : '<div class="empty-inline">No notes match that search.</div>'}</aside>${selected ? `<article class="note-editor" data-note-editor="${escapeHtml(selected.id)}"><div class="note-editor-tools"><button class="editor-tool" data-format="heading" title="Insert a heading">H1</button><button class="editor-tool" data-format="bold" title="Make selection bold"><b>B</b></button><button class="editor-tool" data-format="bullet" title="Start a bullet">• List</button><span class="note-save-label" id="noteSaveLabel">Saved ${timeAgo(selected.updatedAt)}</span></div><input class="note-title-input" id="noteTitle" maxlength="100" placeholder="Untitled note" value="${escapeHtml(selected.title)}" aria-label="Note title"><div class="note-editor-meta"><span>${icon('clock')} ${timeAgo(selected.updatedAt)}</span><span>${escapeHtml(state.profile.course || 'Personal')}</span></div><textarea class="note-body-input" id="noteBody" placeholder="Start writing here...\n\nYour ideas belong here.">${escapeHtml(selected.body)}</textarea><div class="note-bottom"><span>Autosaved to this browser</span><button class="note-delete" data-note-delete="${escapeHtml(selected.id)}">Delete note</button></div></article>` : `<article class="note-editor"><div class="empty-state" style="margin:auto"><span class="empty-icon">${icon('note')}</span><h3>Give your ideas a home.</h3><p>Create a note to keep your thoughts, lecture summaries, and plans together.</p><button class="button button-primary" data-action="new-note">${icon('plus')}Create your first note</button></div></article>`}</section>`;
  }
  const quizQuestions = [
    { q: 'Which approach helps you remember information by practicing retrieval?', options: ['Re-reading the same page several times', 'Active recall with notes closed', 'Highlighting every paragraph', 'Studying only the night before'], answer: 1 },
    { q: 'What is a good first step when a project feels overwhelming?', options: ['Wait for inspiration', 'Break it into a small next action', 'Work on everything at once', 'Skip planning entirely'], answer: 1 },
    { q: 'Why are short breaks useful during focused study?', options: ['They help restore attention', 'They make the work disappear', 'They replace sleep', 'They guarantee a perfect score'], answer: 0 },
    { q: 'Which schedule is most likely to support long-term learning?', options: ['One long session once a month', 'Several shorter sessions over time', 'Only reviewing the day before', 'No review after class'], answer: 1 },
    { q: 'When checking your understanding, which question is most useful?', options: ['Did I read every line?', 'Can I explain this idea in my own words?', 'Did I copy all the slides?', 'Was the session long enough?'], answer: 1 },
    { q: 'What makes a study goal easier to act on?', options: ['Keeping it vague', 'Choosing one specific task and a time', 'Adding as many tasks as possible', 'Waiting until the week is over'], answer: 1 },
    { q: 'If a practice answer is wrong, what is a helpful next step?', options: ['Ignore it and move on', 'Check why and try a similar problem', 'Stop studying that topic forever', 'Memorize the letter only'], answer: 1 },
    { q: 'Which is a realistic way to build a steady routine?', options: ['Start with a manageable habit', 'Change every habit in one day', 'Study only when you feel like it', 'Set goals you cannot measure'], answer: 0 }
  ];
  function quizPage() {
    const average = totalQuizScore(); const best = state.attempts.length ? Math.max(...state.attempts.map(attempt => attempt.percent)) : null;
    const stats = `<div class="quiz-stats"><div class="quiz-stat"><strong>${state.attempts.length}</strong><span>Sprints completed</span></div><div class="quiz-stat"><strong>${best === null ? '—' : `${best}%`}</strong><span>Personal best</span></div><div class="quiz-stat"><strong>${average === null ? '—' : `${average}%`}</strong><span>Average score</span></div></div>`;
    const hero = `<section class="quiz-hero"><div class="quiz-hero-copy"><span class="eyebrow">A LITTLE BRAIN BREAK</span><h2>Make learning stick.</h2><p>Try a quick study-skills sprint. Eight questions, a couple of minutes, and a useful idea to take with you.</p><button class="button button-primary" data-action="quiz-start">${icon('spark')}${quizFinished ? 'Try again' : 'Start a quick quiz'} ${icon('arrow')}</button></div><div class="quiz-hero-art" aria-hidden="true"><span class="quiz-star one">✦</span><span class="quiz-star two">✳</span><div class="quiz-card-illustration"><i></i><i></i><i></i><i></i><i></i></div></div></section>${stats}`;
    if (quizFinished) {
      const correct = quizQuestions.reduce((sum, question, index) => sum + (quizAnswers[index] === question.answer ? 1 : 0), 0);
      const pct = Math.round(correct / quizQuestions.length * 100);
      return `${header('QUICK QUIZ', 'A little brain break.', 'Practice good study habits in a few minutes.')}${hero}<section class="quiz-stage"><div class="quiz-result"><div class="result-orb">${icon('check-circle')}</div><h2>${pct >= 75 ? 'Nicely done.' : 'Good practice.'}</h2><p>You answered ${correct} out of ${quizQuestions.length} correctly. Every round is a chance to learn something.</p><div class="result-score">${pct}%</div><button class="button button-primary" data-action="quiz-start">Take it again ${icon('arrow')}</button></div></section>`;
    }
    if (quizAnswers.length) {
      const index = quizIndex; const current = quizQuestions[index]; const selected = quizAnswers[index];
      return `${header('QUICK QUIZ', 'A little brain break.', 'Practice good study habits in a few minutes.')}${hero}<section class="quiz-stage"><div class="quiz-stage-top"><span>QUESTION ${index + 1} OF ${quizQuestions.length}</span><span>${Math.round((index + 1) / quizQuestions.length * 100)}% complete</span></div><div class="quiz-progress"><i style="width:${(index + 1) / quizQuestions.length * 100}%"></i></div><h2 class="question-text">${escapeHtml(current.q)}</h2><div class="answer-list">${current.options.map((option, i) => `<button class="answer-option ${selected === i ? 'selected' : ''}" data-answer="${i}">${String.fromCharCode(65 + i)}. &nbsp;${escapeHtml(option)}</button>`).join('')}</div><div class="quiz-stage-actions"><button class="button button-quiet" data-action="quiz-prev" ${index === 0 ? 'disabled' : ''}>Back</button><button class="button button-primary" data-action="quiz-next">${index === quizQuestions.length - 1 ? 'See my score' : 'Next question'} ${icon('arrow')}</button></div></section>`;
    }
    return `${header('QUICK QUIZ', 'A little brain break.', 'Practice good study habits in a few minutes.')}${hero}<section class="panel" style="margin-top:15px"><div class="panel-heading"><div><h3>Your recent sprints</h3><p>Your scores stay private in this browser.</p></div></div>${state.attempts.length ? [...state.attempts].reverse().slice(0, 5).map((attempt, index) => `<div class="leaderboard-row"><span class="leaderboard-rank">${String(index + 1).padStart(2, '0')}</span><span class="leaderboard-avatar">${initials(state.profile.name)}</span><span class="leaderboard-name">${escapeHtml(state.profile.name)} <small style="display:block;color:#9aa49d;font-size:8px;font-weight:400">${new Date(attempt.date).toLocaleDateString()}</small></span><span class="leaderboard-score">${attempt.percent}%</span></div>`).join('') : '<div class="empty-inline">Your first score will appear here after a quiz.</div>'}</section>`;
  }
  function studentsPage() {
    const courses = [...new Set(state.students.map(student => student.course).filter(Boolean))].sort();
    const list = state.students.filter(student => `${student.name} ${student.email} ${student.course}`.toLowerCase().includes(directorySearch.toLowerCase())).sort((a, b) => directorySort === 'cgpa' ? Number(b.cgpa || 0) - Number(a.cgpa || 0) : a.name.localeCompare(b.name));
    return `${header('YOUR STUDY CIRCLE', 'Classmates.', 'Keep your study group close and your ideas moving.', button('Add classmate', 'new-student'))}<div class="directory-toolbar"><label class="directory-search">${icon('search')}<input class="text-input" id="studentSearch" type="search" placeholder="Search name, course, or email..." value="${escapeHtml(directorySearch)}"></label><select class="select-input" id="studentSort" style="width:auto"><option value="name" ${directorySort === 'name' ? 'selected' : ''}>Name A–Z</option><option value="cgpa" ${directorySort === 'cgpa' ? 'selected' : ''}>Highest CGPA</option></select><span class="tag">${state.students.length} people</span></div><article class="panel"><div class="table-wrap"><table class="directory-table"><thead><tr><th>Student</th><th>Course</th><th>CGPA / 10</th><th></th></tr></thead><tbody>${list.map(student => `<tr><td><div class="student-cell"><span class="student-avatar">${initials(student.name)}</span><span><span class="student-name">${escapeHtml(student.name)}</span><small class="student-email">${escapeHtml(student.email)}</small></span></div></td><td>${escapeHtml(student.course || '—')}</td><td>${student.cgpa === '' || student.cgpa === null || student.cgpa === undefined ? '<span class="tag">Not added</span>' : `<span class="cgpa-pill">${Number(student.cgpa).toFixed(2)}</span>`}</td><td><div class="row-actions"><button class="row-action" data-student-delete="${escapeHtml(student.id)}" aria-label="Remove ${escapeHtml(student.name)}">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table>${list.length ? '' : `<div class="no-results">No classmates found. Try another search or add a classmate.</div>`}</div><div class="directory-foot"><span>Personal directory · stored on this device</span><span>Sample profiles can be edited or removed.</span></div></article>`;
  }
  function searchPage() {
    const q = searchQuery.toLowerCase();
    const tasks = state.tasks.filter(task => task.title.toLowerCase().includes(q));
    const notes = state.notes.filter(note => `${note.title} ${note.body}`.toLowerCase().includes(q));
    const students = state.students.filter(student => `${student.name} ${student.email} ${student.course}`.toLowerCase().includes(q));
    return `${header('YOUR WORKSPACE', `Results for “${escapeHtml(searchQuery)}”`, 'Search across your tasks, notes, and study circle.')}${tasks.length + notes.length + students.length ? `<section class="search-results">${tasks.length ? `<article class="panel"><div class="panel-heading"><h3>Tasks · ${tasks.length}</h3><button class="panel-link" data-view="tasks">See all ${icon('arrow')}</button></div>${tasks.map(task => taskRow(task, true)).join('')}</article>` : ''}${notes.length ? `<article class="panel"><div class="panel-heading"><h3>Notes · ${notes.length}</h3><button class="panel-link" data-view="notes">See all ${icon('arrow')}</button></div>${notes.map(note => `<div class="note-preview" data-open-note="${escapeHtml(note.id)}"><strong>${escapeHtml(note.title || 'Untitled note')}</strong><small>${escapeHtml((note.body || '').slice(0, 80))}</small></div>`).join('')}</article>` : ''}${students.length ? `<article class="panel"><div class="panel-heading"><h3>Classmates · ${students.length}</h3><button class="panel-link" data-view="students">See all ${icon('arrow')}</button></div>${students.map(student => `<div class="leaderboard-row"><span class="leaderboard-avatar">${initials(student.name)}</span><span class="leaderboard-name">${escapeHtml(student.name)}</span><span class="leaderboard-score">${escapeHtml(student.course)}</span></div>`).join('')}</article>` : ''}</section>` : `<article class="panel empty-state"><span class="empty-icon">${icon('search')}</span><h3>No matches found</h3><p>Try a different name, task, or phrase.</p></article>`}`;
  }
  function render() {
    updateProfileBits();
    $$('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === view));
    $('#breadcrumbPage').textContent = viewNames[view] || 'Overview';
    $('#taskNavCount').textContent = unfinishedCount();
    main.innerHTML = view === 'dashboard' ? dashboard() : view === 'tasks' ? tasksPage() : view === 'notes' ? notesPage() : view === 'quiz' ? quizPage() : view === 'students' ? studentsPage() : searchPage();
    const status = $('#saveStatus'); if (status) status.textContent = 'Saved on this device';
  }
  function createNote() {
    const note = { id: uid(), title: '', body: '', updatedAt: new Date().toISOString() };
    state.notes.unshift(note); selectedNoteId = note.id; noteSearch = ''; save(); view = 'notes'; history.replaceState(null, '', '#notes'); render();
    setTimeout(() => $('#noteTitle')?.focus(), 20);
  }
  function updateNote(field, value) {
    const note = state.notes.find(item => item.id === selectedNoteId); if (!note) return;
    note[field] = value; note.updatedAt = new Date().toISOString(); save(false);
    const label = $('#noteSaveLabel'); if (label) label.textContent = 'Saving…';
    clearTimeout(noteSaveTimer); noteSaveTimer = setTimeout(() => {
      const current = state.notes.find(item => item.id === selectedNoteId); if (!current) return;
      const row = $(`.note-row[data-note-select="${CSS.escape(current.id)}"]`);
      if (row) { $('strong', row).textContent = current.title || 'Untitled note'; $('small', row).textContent = (current.body || 'No content yet').replace(/\s+/g, ' ').slice(0, 48); }
      const meta = $('.note-editor-meta span'); if (meta) meta.innerHTML = `${icon('clock')} ${timeAgo(current.updatedAt)}`;
      const status = $('#noteSaveLabel'); if (status) status.textContent = `Saved ${timeAgo(current.updatedAt)}`;
      const footer = $('#saveStatus'); if (footer) footer.textContent = 'Saved on this device';
    }, 450);
  }
  function focusTextareaFormat(type) {
    const area = $('#noteBody'); if (!area) return;
    const start = area.selectionStart; const end = area.selectionEnd; const chosen = area.value.slice(start, end);
    let before = ''; let after = ''; let insertion = '';
    if (type === 'heading') { before = '\n## '; insertion = chosen || 'Heading'; after = '\n'; }
    else if (type === 'bullet') { before = '\n- '; insertion = chosen || 'List item'; }
    else if (type === 'bold') { before = '**'; insertion = chosen || 'bold text'; after = '**'; }
    area.setRangeText(`${before}${insertion}${after}`, start, end, 'end'); area.focus(); updateNote('body', area.value);
  }
  function startQuiz() { quizIndex = 0; quizAnswers = []; quizFinished = false; render(); document.querySelector('.quiz-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  function finishQuiz() {
    const correct = quizQuestions.reduce((sum, question, index) => sum + (quizAnswers[index] === question.answer ? 1 : 0), 0);
    state.attempts.push({ id: uid(), percent: Math.round(correct / quizQuestions.length * 100), correct, total: quizQuestions.length, date: new Date().toISOString() });
    quizFinished = true; save(); render();
  }
  function openProfile() {
    $('#profileName').value = state.profile.name === 'Student' ? '' : state.profile.name;
    $('#profileCourse').value = state.profile.course || '';
    $('#profileDialog').showModal();
  }
  function startFocus() { $('#focusDialog').showModal(); }
  function updateFocusTimer() {
    const minutes = Math.floor(focusSeconds / 60); const seconds = focusSeconds % 60;
    $('#focusTimer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  function focusTick() {
    focusSeconds -= 1; updateFocusTimer();
    if (focusSeconds <= 0) {
      clearInterval(focusTimer); focusTimer = null; focusSeconds = 0;
      state.focusSessions.push({ id: uid(), date: dateKey(new Date()), minutes: 25 }); save(); render();
      $('#focusLabel').textContent = 'You showed up for yourself.'; $('#focusToggle').textContent = 'Start another session'; notify('Focus session complete. Nicely done!');
    }
  }
  function exportData() {
    const data = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(data);
    const link = document.createElement('a'); link.href = url; link.download = `studyhub-backup-${dateKey(new Date())}.json`; link.click(); URL.revokeObjectURL(url);
    notify('Your StudyHub backup is ready.');
  }

  document.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) { navigate(viewButton.dataset.view); return; }
    const taskToggle = event.target.closest('[data-task-toggle]');
    if (taskToggle) {
      const task = state.tasks.find(item => item.id === taskToggle.dataset.taskToggle); if (!task) return;
      task.done = !task.done; task.completedAt = task.done ? dateKey(new Date()) : null; save(); render(); return;
    }
    const filter = event.target.closest('[data-task-filter]');
    if (filter) { taskFilter = filter.dataset.taskFilter; render(); return; }
    const noteSelect = event.target.closest('[data-note-select]');
    if (noteSelect) { selectedNoteId = noteSelect.dataset.noteSelect; render(); return; }
    const openNote = event.target.closest('[data-open-note]');
    if (openNote) { selectedNoteId = openNote.dataset.openNote; noteSearch = ''; view = 'notes'; history.replaceState(null, '', '#notes'); render(); return; }
    const noteDelete = event.target.closest('[data-note-delete]');
    if (noteDelete) { state.notes = state.notes.filter(item => item.id !== noteDelete.dataset.noteDelete); selectedNoteId = state.notes[0]?.id || null; save(); render(); notify('Note deleted.'); return; }
    const studentDelete = event.target.closest('[data-student-delete]');
    if (studentDelete) { const person = state.students.find(item => item.id === studentDelete.dataset.studentDelete); if (!person) return; state.students = state.students.filter(item => item.id !== person.id); save(); render(); notify(`${person.name} removed from your directory.`); return; }
    const format = event.target.closest('[data-format]'); if (format) { focusTextareaFormat(format.dataset.format); return; }
    const answer = event.target.closest('[data-answer]');
    if (answer) { quizAnswers[quizIndex] = Number(answer.dataset.answer); render(); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'new-note') createNote();
    else if (action === 'profile') openProfile();
    else if (action === 'theme') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); render(); }
    else if (action === 'open-menu') document.body.classList.add('menu-open');
    else if (action === 'close-menu') document.body.classList.remove('menu-open');
    else if (action === 'new-student') $('#studentDialog').showModal();
    else if (action === 'start-focus') startFocus();
    else if (action === 'close-focus') { clearInterval(focusTimer); focusTimer = null; $('#focusDialog').close(); }
    else if (action === 'focus-toggle') {
      if (focusTimer) { clearInterval(focusTimer); focusTimer = null; $('#focusToggle').textContent = 'Resume focus'; }
      else if (focusSeconds <= 0) { focusSeconds = 25 * 60; $('#focusLabel').textContent = 'A little quiet time.'; $('#focusToggle').textContent = 'Pause focus'; focusTimer = setInterval(focusTick, 1000); }
      else { $('#focusToggle').textContent = 'Pause focus'; focusTimer = setInterval(focusTick, 1000); }
    } else if (action === 'focus-reset') { clearInterval(focusTimer); focusTimer = null; focusSeconds = 25 * 60; $('#focusLabel').textContent = 'A little quiet time.'; $('#focusToggle').textContent = 'Start focus'; updateFocusTimer(); }
    else if (action === 'export-data') exportData();
    else if (action === 'quiz-start') startQuiz();
    else if (action === 'quiz-prev') { quizIndex = Math.max(0, quizIndex - 1); render(); }
    else if (action === 'quiz-next') {
      if (quizAnswers[quizIndex] === undefined) { notify('Choose an answer to continue.', true); return; }
      if (quizIndex === quizQuestions.length - 1) finishQuiz(); else { quizIndex += 1; render(); }
    } else if (action === 'focus-task-form') { $('#taskForm input[name="title"]')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  document.addEventListener('submit', event => {
    if (event.target.id === 'taskForm') {
      event.preventDefault(); const form = new FormData(event.target); const title = String(form.get('title') || '').trim(); if (!title) return;
      state.tasks.unshift({ id: uid(), title, due: String(form.get('due') || ''), priority: String(form.get('priority') || 'medium'), done: false }); save(); render(); notify('Task added to your list.');
    }
    if (event.target.id === 'profileForm') {
      event.preventDefault(); state.profile.name = $('#profileName').value.trim() || 'Student'; state.profile.course = $('#profileCourse').value.trim(); save(); $('#profileDialog').close(); render(); notify('Your profile is updated.');
    }
    if (event.target.id === 'studentForm') {
      event.preventDefault(); const name = $('#studentName').value.trim(); const email = $('#studentEmail').value.trim(); const course = $('#studentCourse').value.trim() || state.profile.course || 'General'; const cgpaText = $('#studentCgpa').value;
      if (!name || !email) return;
      state.students.push({ id: uid(), name, email, course, cgpa: cgpaText === '' ? '' : Number(cgpaText) }); save(); $('#studentDialog').close(); directorySearch = ''; render(); event.target.reset(); notify(`${name} added to your directory.`);
    }
  });
  document.addEventListener('input', event => {
    if (event.target.id === 'noteTitle') updateNote('title', event.target.value);
    if (event.target.id === 'noteBody') updateNote('body', event.target.value);
    if (event.target.id === 'noteSearch') { noteSearch = event.target.value; const cursor = event.target.selectionStart; clearTimeout(autosaveTimer); autosaveTimer = setTimeout(() => { render(); const field = $('#noteSearch'); if (field) { field.focus(); field.setSelectionRange(cursor, cursor); } }, 120); }
    if (event.target.id === 'studentSearch') { directorySearch = event.target.value; const cursor = event.target.selectionStart; clearTimeout(autosaveTimer); autosaveTimer = setTimeout(() => { render(); const field = $('#studentSearch'); if (field) { field.focus(); field.setSelectionRange(cursor, cursor); } }, 120); }
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'studentSort') { directorySort = event.target.value; render(); }
  });
  $('#globalSearch').addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const query = event.currentTarget.value.trim(); if (!query) return;
    searchQuery = query; view = 'search'; render(); event.currentTarget.blur();
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#globalSearch').focus(); }
    if (event.key === 'Escape') document.body.classList.remove('menu-open');
  });
  $('#profileDialog').addEventListener('click', event => { if (event.target === $('#profileDialog')) $('#profileDialog').close(); });
  $('#studentDialog').addEventListener('click', event => { if (event.target === $('#studentDialog')) $('#studentDialog').close(); });
  $('#focusDialog').addEventListener('click', event => { if (event.target === $('#focusDialog')) { clearInterval(focusTimer); focusTimer = null; $('#focusDialog').close(); } });
  window.addEventListener('storage', event => { if (event.key === STORE_KEY && event.newValue) { try { const latest = JSON.parse(event.newValue); if (latest.version === 2) { state = latest; render(); notify('StudyHub was updated in another tab.'); } } catch { /* Ignore invalid cross-tab data. */ } } });

  if (!location.hash || !viewNames[view]) { view = 'dashboard'; history.replaceState(null, '', '#dashboard'); }
  if (view === 'search') view = 'dashboard';
  save(false); updateFocusTimer(); render();
})();
