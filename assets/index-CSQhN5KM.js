(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{constructor(){this._events={}}on(e,t){return this._events[e]||(this._events[e]=[]),this._events[e].push(t),()=>this.off(e,t)}off(e,t){this._events[e]&&(this._events[e]=this._events[e].filter(e=>e!==t))}emit(e,t){this._events[e]&&this._events[e].forEach(n=>{try{n(t)}catch(t){console.error(`Error executing listener for event "${e}":`,t)}})}},t=class extends e{constructor(e){super(),this.storageKey=e}getEffectiveKey(){let e=localStorage.getItem(`todozen_current_user`);return e?`todozen_user_${e}_${this.storageKey}`:`todozen_anonymous_${this.storageKey}`}load(e){let t=this.getEffectiveKey();try{let n=localStorage.getItem(t);return n?JSON.parse(n):e}catch(n){return console.error(`Error loading state for key "${t}":`,n),e}}save(e){let t=this.getEffectiveKey();try{localStorage.setItem(t,JSON.stringify(e)),this.emit(`change`,e)}catch(e){console.error(`Error saving state for key "${t}":`,e)}}},n=class extends t{constructor(){super(`todozen_tasks`),this.tasks=this.load([]),this.lists=this._loadLists();let e=localStorage.getItem(`todozen_current_user`);this.tasks.length===0&&e===`teacher`&&this._seedInitialTasks()}_seedInitialTasks(){let e=new Date().toLocaleDateString(`sv`),t=new Date;t.setDate(t.getDate()+1);let n=t.toLocaleDateString(`sv`),r=[{id:`task-seed-1`,title:`Complete KAJ Semestral Work Submission Form`,notes:`Selected Teacher: Zdeněk Vlach.
Ensure all URLs (GitHub, Documentation, Pages) are correct before submitting.`,quadrant:1,priority:`high`,completed:!1,deleted:!1,dueDate:e,location:{latitude:50.0755,longitude:14.4378,name:`CTU Faculty of Information Technology`},attachments:[],listId:`study`,tags:[`kaj`,`admin`,`submission`],createdAt:new Date().toISOString()},{id:`task-seed-2`,title:`Review KAJ criteria and verify implementations`,notes:`Checked and confirmed:
1. 11 HTML5 browser APIs integrated.
2. PWA manifest & Service Worker caches offline.
3. History API routing.
4. Audio programmatical playback.
5. Custom dialogue card components (replaced native confirmations!).`,quadrant:2,priority:`high`,completed:!0,deleted:!1,dueDate:e,location:null,attachments:[],listId:`study`,tags:[`kaj`,`review`],createdAt:new Date().toISOString()},{id:`task-seed-3`,title:`Read Clean Code Chapter 5: Formatting`,notes:`Keep formatting consistency across all modular ES6 Javascript view modules.`,quadrant:2,priority:`medium`,completed:!1,deleted:!1,dueDate:n,location:null,attachments:[],listId:`life`,tags:[`reading`,`clean-code`],createdAt:new Date().toISOString()},{id:`task-seed-4`,title:`Buy groceries for dinner celebration`,notes:`Get pasta, olive oil, parmesan cheese, and garlic.`,quadrant:3,priority:`low`,completed:!1,deleted:!1,dueDate:``,location:null,attachments:[],listId:`shopping`,tags:[`life`],createdAt:new Date().toISOString()},{id:`task-seed-5`,title:`Obsolete backup tasks entry`,notes:`This task was soft-deleted to verify the Trash restore and purge lifecycles.`,quadrant:4,priority:`low`,completed:!1,deleted:!0,dueDate:``,location:null,attachments:[],listId:`inbox`,tags:[`test`],createdAt:new Date().toISOString()}];this.tasks=r,this.save(this.tasks)}_loadLists(){try{let e=localStorage.getItem(`todozen_current_user`),t=e?`todozen_user_${e}_custom_lists`:`todozen_custom_lists`,n=localStorage.getItem(t);if(n)return JSON.parse(n)}catch(e){console.error(`Error loading custom lists:`,e)}return[{id:`study`,name:`Study`,icon:`📝`,color:`#74b9ff`},{id:`life`,name:`Life`,icon:`🏡`,color:`#00b894`},{id:`shopping`,name:`Shopping`,icon:`🛍️`,color:`#ffeaa7`},{id:`wishlist`,name:`Wishlist`,icon:`🦄`,color:`#a29bfe`},{id:`work`,name:`Work`,icon:`💼`,color:`#ff7675`}]}_saveLists(){try{let e=localStorage.getItem(`todozen_current_user`),t=e?`todozen_user_${e}_custom_lists`:`todozen_custom_lists`;localStorage.setItem(t,JSON.stringify(this.lists)),this.emit(`listsChanged`,this.lists)}catch(e){console.error(`Error saving custom lists:`,e)}}getAllLists(){return this.lists}addList(e){if(!e||e.trim()===``)throw Error(`List name cannot be empty.`);let t=e.trim().toLowerCase().replace(/\s+/g,`-`);if(this.lists.some(e=>e.id===t))throw Error(`List name already exists.`);let n={id:t,name:e.trim(),icon:`📂`,color:`#8f7eff`};return this.lists.push(n),this._saveLists(),n}deleteList(e){let t=this.lists.length;if(this.lists=this.lists.filter(t=>t.id!==e),this.lists.length!==t){this._saveLists();let t=this.tasks.length;return this.tasks=this.tasks.filter(t=>t.listId!==e),this.tasks.length!==t&&this.save(this.tasks),this.emit(`listDeleted`,e),!0}return!1}getAllTasks(){return this.tasks}getTaskById(e){return this.tasks.find(t=>t.id===e)||null}addTask({title:e,notes:t=``,quadrant:n=4,priority:r=`medium`,dueDate:i=``,location:a=null,attachments:o=[],listId:s=`inbox`,tags:c=[]}){if(!e||e.trim()===``)throw Error(`Task title cannot be empty.`);let l={id:typeof crypto.randomUUID==`function`?crypto.randomUUID():this._generateId(),title:e.trim(),notes:t.trim(),quadrant:parseInt(n)||4,priority:r,completed:!1,deleted:!1,dueDate:i,location:a,attachments:o,listId:s,tags:Array.isArray(c)?c:[],createdAt:new Date().toISOString()};return this.tasks.push(l),this.save(this.tasks),this.emit(`taskAdded`,l),l}updateTask(e,t){let n=this.tasks.findIndex(t=>t.id===e);if(n===-1)return null;let r={...this.tasks[n],...t,title:t.title===void 0?this.tasks[n].title:t.title.trim()};if(t.title!==void 0&&r.title===``)throw Error(`Task title cannot be empty.`);return this.tasks[n]=r,this.save(this.tasks),this.emit(`taskUpdated`,r),r}toggleTask(e){let t=this.getTaskById(e);return t?this.updateTask(e,{completed:!t.completed}):null}deleteTask(e){let t=this.getTaskById(e);return t?t.deleted?this.deleteTaskPermanently(e):(this.updateTask(e,{deleted:!0}),this.emit(`taskDeleted`,e),!0):!1}restoreTask(e){return this.getTaskById(e)?this.updateTask(e,{deleted:!1}):null}deleteTaskPermanently(e){let t=this.tasks.length;return this.tasks=this.tasks.filter(t=>t.id!==e),this.tasks.length===t?!1:(this.save(this.tasks),this.emit(`taskDeleted`,e),!0)}getAllTags(){let e=new Set;return this.tasks.forEach(t=>{!t.deleted&&Array.isArray(t.tags)&&t.tags.forEach(t=>{let n=t.trim().toLowerCase();n&&e.add(n)})}),Array.from(e).sort()}_generateId(){return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)}},r=class extends t{constructor(){super(`todozen_habits`),this.habits=this.load([]);let e=localStorage.getItem(`todozen_current_user`);this.habits.length===0&&e===`teacher`&&this._seedInitialHabits()}_seedInitialHabits(){let e=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,t=e(new Date),n=new Date;n.setDate(n.getDate()-1);let r=e(n),i=new Date;i.setDate(i.getDate()-2);let a=e(i),o=[{id:`habit-seed-1`,name:`Drink 2L Water daily`,historyDates:[a,r,t],streak:3,createdAt:new Date().toISOString()},{id:`habit-seed-2`,name:`Read 15 pages of a book`,historyDates:[a,r],streak:2,createdAt:new Date().toISOString()},{id:`habit-seed-3`,name:`Perform 20 pushups daily`,historyDates:[a],streak:0,createdAt:new Date().toISOString()}];this.habits=o,this.save(this.habits)}getAllHabits(){return this.habits}addHabit(e){if(!e||e.trim()===``)throw Error(`Habit name cannot be empty.`);let t={id:typeof crypto.randomUUID==`function`?crypto.randomUUID():this._generateId(),name:e.trim(),historyDates:[],streak:0,createdAt:new Date().toISOString()};return this.habits.push(t),this.save(this.habits),this.emit(`habitAdded`,t),t}deleteHabit(e){let t=this.habits.length;return this.habits=this.habits.filter(t=>t.id!==e),this.habits.length===t?!1:(this.save(this.habits),this.emit(`habitDeleted`,e),!0)}toggleHabitDate(e,t){let n=this.habits.findIndex(t=>t.id===e);if(n===-1)return null;let r=this.habits[n],i=r.historyDates.indexOf(t);return i===-1?r.historyDates.push(t):r.historyDates.splice(i,1),r.historyDates.sort(),r.streak=this._calculateStreak(r.historyDates),this.habits[n]=r,this.save(this.habits),this.emit(`habitUpdated`,r),r}_calculateStreak(e){if(e.length===0)return 0;let t=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=t(new Date),r=new Date;r.setDate(r.getDate()-1);let i=t(r);if(!e.includes(n)&&!e.includes(i))return 0;let a=0,o=e.includes(n)?new Date:r;for(;;){let n=t(o);if(e.includes(n))a++,o.setDate(o.getDate()-1);else break}return a}_generateId(){return Math.random().toString(36).substring(2,15)}},i=class extends t{constructor(){super(`todozen_pomodoro`);let e={workDuration:1500,breakDuration:300,secondsLeft:1500,sessionType:`work`,totalCompleted:0},t=this.load(e);this.workDuration=t.workDuration||e.workDuration,this.breakDuration=t.breakDuration||e.breakDuration,this.secondsLeft=t.secondsLeft===void 0?e.secondsLeft:t.secondsLeft,this.sessionType=t.sessionType||e.sessionType,this.totalCompleted=t.totalCompleted===void 0?e.totalCompleted:t.totalCompleted,this.isRunning=!1,this.timerInterval=null}getState(){return{secondsLeft:this.secondsLeft,sessionType:this.sessionType,totalCompleted:this.totalCompleted,isRunning:this.isRunning,duration:this.sessionType===`work`?this.workDuration:this.breakDuration}}start(){this.isRunning||(this.isRunning=!0,this.emit(`statusChanged`,this.getState()),this.timerInterval=setInterval(()=>{this.tick()},1e3))}pause(){this.isRunning&&(this.isRunning=!1,clearInterval(this.timerInterval),this.timerInterval=null,this.persistState(),this.emit(`statusChanged`,this.getState()))}reset(){this.pause(),this.secondsLeft=this.sessionType===`work`?this.workDuration:this.breakDuration,this.persistState(),this.emit(`reset`,this.getState())}tick(){this.secondsLeft>0?(this.secondsLeft--,this.persistState(),this.emit(`tick`,this.getState())):this.sessionCompleted()}sessionCompleted(){this.pause(),this.sessionType===`work`?(this.totalCompleted++,this.sessionType=`break`,this.secondsLeft=this.breakDuration,this.emit(`sessionFinished`,{type:`work`,nextType:`break`,state:this.getState()})):(this.sessionType=`work`,this.secondsLeft=this.workDuration,this.emit(`sessionFinished`,{type:`break`,nextType:`work`,state:this.getState()})),this.persistState(),this.emit(`statusChanged`,this.getState())}persistState(){this.save({workDuration:this.workDuration,breakDuration:this.breakDuration,secondsLeft:this.secondsLeft,sessionType:this.sessionType,totalCompleted:this.totalCompleted})}configureDurations(e,t){this.pause(),this.workDuration=e*60,this.breakDuration=t*60,this.secondsLeft=this.sessionType===`work`?this.workDuration:this.breakDuration,this.persistState(),this.emit(`reset`,this.getState())}},a=class{constructor(){this.routes={},this.currentPath=null,this.basePath=`/kaj-todo`,window.addEventListener(`popstate`,()=>{let e=this._normalizePath(window.location.pathname);this._handleRoute(e,!1)})}addRoute(e,t){this.routes[e]=t}start(){document.body.addEventListener(`click`,e=>{let t=e.target.closest(`a[data-route]`);if(t){e.preventDefault();let n=t.getAttribute(`data-route`);this.navigate(n)}});let e=window.location.pathname,t=this._normalizePath(e);this._handleRoute(t,!0)}navigate(e){this.currentPath!==e&&this._handleRoute(e,!0)}_handleRoute(e,t){let n=this.routes[e]||this.routes[`/`];if(this.currentPath=e,t){let t=this.basePath+(e===`/`?`/`:e);window.history.pushState({path:e},``,t)}n&&n()}_normalizePath(e){let t=e;if(t.endsWith(`/`)&&t.length>1&&(t=t.slice(0,-1)),t.startsWith(this.basePath)){let e=t.substring(this.basePath.length);return e===``?`/`:e}return t||`/`}},o=class{constructor(e){this.container=e}renderHTML(e){this.container.innerHTML=e}destroy(){}};function s(e,t){return new Promise(n=>{let r=document.createElement(`div`);r.className=`custom-dialog-overlay`,r.innerHTML=`
            <div class="custom-dialog-card">
                <div class="custom-dialog-header">
                    <h4>⚠️ ${e}</h4>
                </div>
                <div class="custom-dialog-body">
                    <p>${t}</p>
                </div>
                <div class="custom-dialog-footer">
                    <button class="dialog-btn btn-cancel" id="dialog-cancel-btn">Cancel</button>
                    <button class="dialog-btn btn-confirm" id="dialog-confirm-btn">Confirm</button>
                </div>
            </div>
        `,document.body.appendChild(r),setTimeout(()=>r.classList.add(`show`),10);let i=e=>{r.classList.remove(`show`),setTimeout(()=>{r.remove(),n(e)},300)};r.querySelector(`#dialog-cancel-btn`).addEventListener(`click`,()=>i(!1)),r.querySelector(`#dialog-confirm-btn`).addEventListener(`click`,()=>i(!0)),r.addEventListener(`click`,e=>{e.target===r&&i(!1)});let a=e=>{e.key===`Escape`?(e.preventDefault(),window.removeEventListener(`keydown`,a),i(!1)):e.key===`Enter`&&(e.preventDefault(),window.removeEventListener(`keydown`,a),i(!0))};window.addEventListener(`keydown`,a)})}function c(e,t){return new Promise(n=>{let r=document.createElement(`div`);r.className=`custom-dialog-overlay`,r.innerHTML=`
            <div class="custom-dialog-card">
                <div class="custom-dialog-header">
                    <h4>🔔 ${e}</h4>
                </div>
                <div class="custom-dialog-body">
                    <p>${t}</p>
                </div>
                <div class="custom-dialog-footer">
                    <button class="dialog-btn btn-confirm" id="dialog-ok-btn" style="width:100%;">OK</button>
                </div>
            </div>
        `,document.body.appendChild(r),setTimeout(()=>r.classList.add(`show`),10);let i=()=>{r.classList.remove(`show`),setTimeout(()=>{r.remove(),n()},300)};r.querySelector(`#dialog-ok-btn`).addEventListener(`click`,()=>i()),r.addEventListener(`click`,e=>{e.target===r&&i()});let a=e=>{(e.key===`Escape`||e.key===`Enter`)&&(e.preventDefault(),window.removeEventListener(`keydown`,a),i())};window.addEventListener(`keydown`,a)})}var l=class extends o{constructor(e,t,n,r=`inbox`){super(e),this.taskModel=t,this.modalElement=n,this.listId=r,this.currentFilter=`all`,this.unsubscribeAdded=this.taskModel.on(`taskAdded`,()=>this.render()),this.unsubscribeUpdated=this.taskModel.on(`taskUpdated`,()=>this.render()),this.unsubscribeDeleted=this.taskModel.on(`taskDeleted`,()=>this.render()),this.unsubscribeListDeleted=this.taskModel.on(`listDeleted`,e=>{this.listId===e&&(this.listId=`inbox`,this.render())})}destroy(){this.unsubscribeAdded(),this.unsubscribeUpdated(),this.unsubscribeDeleted(),this.unsubscribeListDeleted()}setList(e){this.listId=e,this.render()}setFilter(e){this.currentFilter=e,this.render()}render(){let e=this.taskModel.getAllTasks(),t=`Inbox`,n=`📥`;if(this.listId===`today`)t=`Today`,n=`📅`;else if(this.listId===`next-7-days`)t=`Next 7 Days`,n=`🗓️`;else if(this.listId===`completed`)t=`Completed`,n=`☑️`;else if(this.listId===`trash`)t=`Trash Bin`,n=`🗑️`;else if(this.listId.startsWith(`tag-`))t=`Tag: #${this.listId.substring(4)}`,n=`🏷️`;else if(this.listId.startsWith(`filter-`)){let e=this.listId.substring(7);n=`⚡️`,e===`priority-high`?t=`High Priority Tasks`:e===`has-date`?t=`Tasks with Due Date`:e===`has-location`?t=`Tasks with Location`:e===`has-image`&&(t=`Tasks with Images`)}else{let e=this.taskModel.getAllLists().find(e=>e.id===this.listId);e&&(t=e.name,n=e.icon||`📂`)}let r=e,i=new Date().toLocaleDateString(`sv`);if(this.listId===`trash`)r=e.filter(e=>e.deleted);else if(this.listId===`completed`)r=e.filter(e=>!e.deleted&&e.completed);else if(this.listId===`today`)r=e.filter(e=>!e.deleted&&!e.completed&&e.dueDate===i);else if(this.listId===`next-7-days`){let t=new Date;t.setHours(0,0,0,0);let n=new Date;n.setDate(t.getDate()+7),n.setHours(23,59,59,999),r=e.filter(e=>{if(e.deleted||e.completed||!e.dueDate)return!1;let r=new Date(e.dueDate);return r>=t&&r<=n})}else if(this.listId.startsWith(`tag-`)){let t=this.listId.substring(4);r=e.filter(e=>!e.deleted&&!e.completed&&Array.isArray(e.tags)&&e.tags.includes(t))}else if(this.listId.startsWith(`filter-`)){let t=this.listId.substring(7);t===`priority-high`?r=e.filter(e=>!e.deleted&&!e.completed&&e.priority===`high`):t===`has-date`?r=e.filter(e=>!e.deleted&&!e.completed&&e.dueDate!==``):t===`has-location`?r=e.filter(e=>!e.deleted&&!e.completed&&e.location!==null):t===`has-image`&&(r=e.filter(e=>!e.deleted&&!e.completed&&e.attachments&&e.attachments.length>0))}else r=e.filter(e=>!e.deleted&&!e.completed&&e.listId===this.listId);let a=this.listId===`completed`||this.listId===`trash`||this.listId.startsWith(`tag-`)||this.listId.startsWith(`filter-`);a||(this.currentFilter===`active`?r=r.filter(e=>!e.completed):this.currentFilter===`completed`&&(r=e.filter(e=>!e.deleted&&e.completed&&e.listId===this.listId))),r.sort((e,t)=>new Date(t.createdAt)-new Date(e.createdAt));let o=this.listId===`completed`||this.listId===`trash`,s=`
            <div class="inbox-container">
                <header class="inbox-header">
                    <h2><span class="header-icon">${n}</span> ${t}</h2>
                    ${a?``:`
                        <div class="filters">
                            <button class="${this.currentFilter===`all`?`active`:``}" data-filter="all">All</button>
                            <button class="${this.currentFilter===`active`?`active`:``}" data-filter="active">Active</button>
                            <button class="${this.currentFilter===`completed`?`active`:``}" data-filter="completed">Completed</button>
                        </div>
                    `}
                </header>

                ${o?``:`
                    <form class="add-task-form" id="quick-add-form">
                        <input type="text" id="quick-title" placeholder="Add a task to ${t}... (Press Enter)" required autocomplete="off" />
                        <button type="submit">Add Task</button>
                    </form>
                `}

                <section class="task-list" id="tasks-list-container">
                    ${r.length===0?`
                        <div class="empty-state">
                            <svg viewBox="0 0 200 200" class="empty-svg">
                                <defs>
                                    <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#8f7eff" stop-opacity="0.2"/>
                                        <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0.05"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="100" cy="100" r="80" fill="url(#emptyGrad)" />
                                <rect x="70" y="60" width="60" height="80" rx="8" fill="none" stroke="var(--primary-color)" stroke-width="3" />
                                <line x1="80" y1="80" x2="120" y2="80" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" />
                                <line x1="80" y1="95" x2="110" y2="95" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" />
                                <line x1="80" y1="110" x2="100" y2="110" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" />
                                <path d="M140 50 L150 60 L125 85 L115 85 L115 75 Z" fill="var(--warning-color)" />
                                <path d="M115 85 L118 78 L122 82 Z" fill="#2d3436" />
                            </svg>
                            <h3>All clear!</h3>
                            <p>No tasks found in this section.</p>
                        </div>
                    `:r.map(e=>this._generateTaskTemplate(e)).join(``)}
                </section>
            </div>
        `;this.renderHTML(s),this._setupListeners()}_generateTaskTemplate(e){if(this.listId===`trash`)return`
                <article class="task-item completed" data-id="${e.id}" style="cursor: default;">
                    <div class="task-left">
                        <span class="task-title" style="margin-left: 0;">${this._escapeHTML(e.title)}</span>
                    </div>

                    <div class="task-meta">
                        <button class="btn-restore-task" data-id="${e.id}">♻️ Restore</button>
                        <button class="btn-purge-task" data-id="${e.id}">🗑️ Purge</button>
                    </div>
                </article>
            `;let t=e.priority===`high`;return`
            <article class="task-item ${e.completed?`completed`:``}" data-id="${e.id}">
                <div class="task-left">
                    <label class="task-checkbox-wrapper">
                        <input type="checkbox" class="task-checkbox" data-id="${e.id}" ${e.completed?`checked`:``} />
                    </label>
                    <span class="task-title">${this._escapeHTML(e.title)}</span>
                </div>

                <div class="task-meta">
                    ${e.tags&&e.tags.length>0?e.tags.map(e=>`<span class="task-due-badge" style="background:rgba(108,92,231,0.06); margin-right:4px;">#${e}</span>`).join(``):``}
                    ${e.location?`<span title="Location Tagged">📍</span>`:``}
                    ${e.attachments&&e.attachments.length>0?`<span title="${e.attachments.length} Images Attached">🖼️</span>`:``}
                    ${e.dueDate?`<span class="task-due-badge" title="Due Date">📅 ${e.dueDate}</span>`:``}
                    
                    <button class="star-btn ${t?`active`:``}" data-id="${e.id}" title="Toggle High Priority">
                        <svg viewBox="0 0 24 24" id="star-svg-${e.id}">
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                        </svg>
                    </button>
                    
                    <button class="delete-btn" data-id="${e.id}" title="Delete Task">×</button>
                </div>
            </article>
        `}_setupListeners(){let e=this.container,t=e.querySelector(`#quick-add-form`);t&&t.addEventListener(`submit`,t=>{t.preventDefault();let n=e.querySelector(`#quick-title`),r=n.value.trim();if(r!==``){let e=`inbox`,t=``;this.listId!==`today`&&this.listId!==`next-7-days`&&this.listId!==`completed`&&this.listId!==`trash`&&!this.listId.startsWith(`tag-`)&&!this.listId.startsWith(`filter-`)&&(e=this.listId),this.listId===`today`&&(t=new Date().toLocaleDateString(`sv`)),this.taskModel.addTask({title:r,listId:e,dueDate:t}),n.value=``}});let n=e.querySelector(`.filters`);n&&n.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-filter]`);t&&this.setFilter(t.getAttribute(`data-filter`))});let r=e.querySelector(`#tasks-list-container`);r&&(r.addEventListener(`click`,e=>{let t=e.target;if(t.classList.contains(`task-checkbox`)){e.stopPropagation();let n=t.getAttribute(`data-id`);this.taskModel.toggleTask(n),navigator.vibrate&&navigator.vibrate(15);return}let n=t.closest(`.star-btn`);if(n){e.stopPropagation();let t=n.getAttribute(`data-id`),r=this.taskModel.getTaskById(t).priority===`high`?`medium`:`high`,i=n.querySelector(`svg`);r===`high`?(i.setAttribute(`stroke-width`,`1px`),i.setAttribute(`fill`,`var(--warning-color)`)):(i.setAttribute(`stroke-width`,`2px`),i.setAttribute(`fill`,`none`)),this.taskModel.updateTask(t,{priority:r}),navigator.vibrate&&navigator.vibrate(15);return}let r=t.closest(`.delete-btn`);if(r){e.stopPropagation();let t=r.getAttribute(`data-id`);s(`Move to Trash`,`Delete this task to Trash?`).then(e=>{e&&(this.taskModel.deleteTask(t),navigator.vibrate&&navigator.vibrate(20))});return}let i=t.closest(`.btn-restore-task`);if(i){e.stopPropagation();let t=i.getAttribute(`data-id`);this.taskModel.restoreTask(t),navigator.vibrate&&navigator.vibrate(15);return}let a=t.closest(`.btn-purge-task`);if(a){e.stopPropagation();let t=a.getAttribute(`data-id`);s(`Permanent Delete`,`CRITICAL: This will permanently delete this task. Proceed?`).then(e=>{e&&(this.taskModel.deleteTaskPermanently(t),navigator.vibrate&&navigator.vibrate(30))});return}if(this.listId!==`trash`){let e=t.closest(`.task-item`);if(e){let t=e.getAttribute(`data-id`),n=this.taskModel.getTaskById(t);n&&this.modalElement.open(n,e=>{this.taskModel.updateTask(t,e)})}}}),r.addEventListener(`mouseover`,e=>{let t=e.target.closest(`.star-btn`);t&&!t.classList.contains(`active`)&&t.querySelector(`svg`).setAttribute(`stroke-width`,`1.5px`)}),r.addEventListener(`mouseout`,e=>{let t=e.target.closest(`.star-btn`);t&&!t.classList.contains(`active`)&&t.querySelector(`svg`).setAttribute(`stroke-width`,`2px`)}))}_escapeHTML(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}};function u(e,t,n){return(t=_(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function d(){return d=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},d.apply(null,arguments)}function f(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?f(Object(n),!0).forEach(function(t){u(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):f(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function m(e,t){if(e==null)return{};var n,r,i=h(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function h(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function g(e,t){if(typeof e!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(typeof r!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function _(e){var t=g(e,`string`);return typeof t==`symbol`?t:t+``}function v(e){"@babel/helpers - typeof";return v=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},v(e)}var y=`1.15.7`;function b(e){if(typeof window<`u`&&window.navigator)return!!navigator.userAgent.match(e)}var x=b(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i),S=b(/Edge/i),C=b(/firefox/i),w=b(/safari/i)&&!b(/chrome/i)&&!b(/android/i),T=b(/iP(ad|od|hone)/i),ee=b(/chrome/i)&&b(/android/i),E={capture:!1,passive:!1};function D(e,t,n){e.addEventListener(t,n,!x&&E)}function O(e,t,n){e.removeEventListener(t,n,!x&&E)}function k(e,t){if(t){if(t[0]===`>`&&(t=t.substring(1)),e)try{if(e.matches)return e.matches(t);if(e.msMatchesSelector)return e.msMatchesSelector(t);if(e.webkitMatchesSelector)return e.webkitMatchesSelector(t)}catch{return!1}return!1}}function te(e){return e.host&&e!==document&&e.host.nodeType&&e.host!==e?e.host:e.parentNode}function A(e,t,n,r){if(e){n||=document;do{if(t!=null&&(t[0]===`>`?e.parentNode===n&&k(e,t):k(e,t))||r&&e===n)return e;if(e===n)break}while(e=te(e))}return null}var ne=/\s+/g;function j(e,t,n){e&&t&&(e.classList?e.classList[n?`add`:`remove`](t):e.className=((` `+e.className+` `).replace(ne,` `).replace(` `+t+` `,` `)+(n?` `+t:``)).replace(ne,` `))}function M(e,t,n){var r=e&&e.style;if(r){if(n===void 0)return document.defaultView&&document.defaultView.getComputedStyle?n=document.defaultView.getComputedStyle(e,``):e.currentStyle&&(n=e.currentStyle),t===void 0?n:n[t];!(t in r)&&t.indexOf(`webkit`)===-1&&(t=`-webkit-`+t),r[t]=n+(typeof n==`string`?``:`px`)}}function N(e,t){var n=``;if(typeof e==`string`)n=e;else do{var r=M(e,`transform`);r&&r!==`none`&&(n=r+` `+n)}while(!t&&(e=e.parentNode));var i=window.DOMMatrix||window.WebKitCSSMatrix||window.CSSMatrix||window.MSCSSMatrix;return i&&new i(n)}function re(e,t,n){if(e){var r=e.getElementsByTagName(t),i=0,a=r.length;if(n)for(;i<a;i++)n(r[i],i);return r}return[]}function P(){return document.scrollingElement||document.documentElement}function F(e,t,n,r,i){if(!(!e.getBoundingClientRect&&e!==window)){var a,o,s,c,l,u,d;if(e!==window&&e.parentNode&&e!==P()?(a=e.getBoundingClientRect(),o=a.top,s=a.left,c=a.bottom,l=a.right,u=a.height,d=a.width):(o=0,s=0,c=window.innerHeight,l=window.innerWidth,u=window.innerHeight,d=window.innerWidth),(t||n)&&e!==window&&(i||=e.parentNode,!x))do if(i&&i.getBoundingClientRect&&(M(i,`transform`)!==`none`||n&&M(i,`position`)!==`static`)){var f=i.getBoundingClientRect();o-=f.top+parseInt(M(i,`border-top-width`)),s-=f.left+parseInt(M(i,`border-left-width`)),c=o+a.height,l=s+a.width;break}while(i=i.parentNode);if(r&&e!==window){var p=N(i||e),m=p&&p.a,h=p&&p.d;p&&(o/=h,s/=m,d/=m,u/=h,c=o+u,l=s+d)}return{top:o,left:s,bottom:c,right:l,width:d,height:u}}}function ie(e,t,n){for(var r=L(e,!0),i=F(e)[t];r;){var a=F(r)[n],o=void 0;if(o=n===`top`||n===`left`?i>=a:i<=a,!o)return r;if(r===P())break;r=L(r,!1)}return!1}function ae(e,t,n,r){for(var i=0,a=0,o=e.children;a<o.length;){if(o[a].style.display!==`none`&&o[a]!==Q.ghost&&(r||o[a]!==Q.dragged)&&A(o[a],n.draggable,e,!1)){if(i===t)return o[a];i++}a++}return null}function oe(e,t){for(var n=e.lastElementChild;n&&(n===Q.ghost||M(n,`display`)===`none`||t&&!k(n,t));)n=n.previousElementSibling;return n||null}function I(e,t){var n=0;if(!e||!e.parentNode)return-1;for(;e=e.previousElementSibling;)e.nodeName.toUpperCase()!==`TEMPLATE`&&e!==Q.clone&&(!t||k(e,t))&&n++;return n}function se(e){var t=0,n=0,r=P();if(e)do{var i=N(e),a=i.a,o=i.d;t+=e.scrollLeft*a,n+=e.scrollTop*o}while(e!==r&&(e=e.parentNode));return[t,n]}function ce(e,t){for(var n in e)if(e.hasOwnProperty(n)){for(var r in t)if(t.hasOwnProperty(r)&&t[r]===e[n][r])return Number(n)}return-1}function L(e,t){if(!e||!e.getBoundingClientRect)return P();var n=e,r=!1;do if(n.clientWidth<n.scrollWidth||n.clientHeight<n.scrollHeight){var i=M(n);if(n.clientWidth<n.scrollWidth&&(i.overflowX==`auto`||i.overflowX==`scroll`)||n.clientHeight<n.scrollHeight&&(i.overflowY==`auto`||i.overflowY==`scroll`)){if(!n.getBoundingClientRect||n===document.body)return P();if(r||t)return n;r=!0}}while(n=n.parentNode);return P()}function le(e,t){if(e&&t)for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e}function ue(e,t){return Math.round(e.top)===Math.round(t.top)&&Math.round(e.left)===Math.round(t.left)&&Math.round(e.height)===Math.round(t.height)&&Math.round(e.width)===Math.round(t.width)}var de;function fe(e,t){return function(){if(!de){var n=arguments,r=this;n.length===1?e.call(r,n[0]):e.apply(r,n),de=setTimeout(function(){de=void 0},t)}}}function pe(){clearTimeout(de),de=void 0}function me(e,t,n){e.scrollLeft+=t,e.scrollTop+=n}function he(e){var t=window.Polymer,n=window.jQuery||window.Zepto;return t&&t.dom?t.dom(e).cloneNode(!0):n?n(e).clone(!0)[0]:e.cloneNode(!0)}function ge(e,t,n){var r={};return Array.from(e.children).forEach(function(i){if(!(!A(i,t.draggable,e,!1)||i.animated||i===n)){var a=F(i);r.left=Math.min(r.left??1/0,a.left),r.top=Math.min(r.top??1/0,a.top),r.right=Math.max(r.right??-1/0,a.right),r.bottom=Math.max(r.bottom??-1/0,a.bottom)}}),r.width=r.right-r.left,r.height=r.bottom-r.top,r.x=r.left,r.y=r.top,r}var R=`Sortable`+new Date().getTime();function _e(){var e=[],t;return{captureAnimationState:function(){e=[],this.options.animation&&[].slice.call(this.el.children).forEach(function(t){if(!(M(t,`display`)===`none`||t===Q.ghost)){e.push({target:t,rect:F(t)});var n=p({},e[e.length-1].rect);if(t.thisAnimationDuration){var r=N(t,!0);r&&(n.top-=r.f,n.left-=r.e)}t.fromRect=n}})},addAnimationState:function(t){e.push(t)},removeAnimationState:function(t){e.splice(ce(e,{target:t}),1)},animateAll:function(n){var r=this;if(!this.options.animation){clearTimeout(t),typeof n==`function`&&n();return}var i=!1,a=0;e.forEach(function(e){var t=0,n=e.target,o=n.fromRect,s=F(n),c=n.prevFromRect,l=n.prevToRect,u=e.rect,d=N(n,!0);d&&(s.top-=d.f,s.left-=d.e),n.toRect=s,n.thisAnimationDuration&&ue(c,s)&&!ue(o,s)&&(u.top-s.top)/(u.left-s.left)===(o.top-s.top)/(o.left-s.left)&&(t=ye(u,c,l,r.options)),ue(s,o)||(n.prevFromRect=o,n.prevToRect=s,t||=r.options.animation,r.animate(n,u,s,t)),t&&(i=!0,a=Math.max(a,t),clearTimeout(n.animationResetTimer),n.animationResetTimer=setTimeout(function(){n.animationTime=0,n.prevFromRect=null,n.fromRect=null,n.prevToRect=null,n.thisAnimationDuration=null},t),n.thisAnimationDuration=t)}),clearTimeout(t),i?t=setTimeout(function(){typeof n==`function`&&n()},a):typeof n==`function`&&n(),e=[]},animate:function(e,t,n,r){if(r){M(e,`transition`,``),M(e,`transform`,``);var i=N(this.el),a=i&&i.a,o=i&&i.d,s=(t.left-n.left)/(a||1),c=(t.top-n.top)/(o||1);e.animatingX=!!s,e.animatingY=!!c,M(e,`transform`,`translate3d(`+s+`px,`+c+`px,0)`),this.forRepaintDummy=ve(e),M(e,`transition`,`transform `+r+`ms`+(this.options.easing?` `+this.options.easing:``)),M(e,`transform`,`translate3d(0,0,0)`),typeof e.animated==`number`&&clearTimeout(e.animated),e.animated=setTimeout(function(){M(e,`transition`,``),M(e,`transform`,``),e.animated=!1,e.animatingX=!1,e.animatingY=!1},r)}}}}function ve(e){return e.offsetWidth}function ye(e,t,n,r){return Math.sqrt((t.top-e.top)**2+(t.left-e.left)**2)/Math.sqrt((t.top-n.top)**2+(t.left-n.left)**2)*r.animation}var be=[],xe={initializeByDefault:!0},Se={mount:function(e){for(var t in xe)xe.hasOwnProperty(t)&&!(t in e)&&(e[t]=xe[t]);be.forEach(function(t){if(t.pluginName===e.pluginName)throw`Sortable: Cannot mount plugin ${e.pluginName} more than once`}),be.push(e)},pluginEvent:function(e,t,n){var r=this;this.eventCanceled=!1,n.cancel=function(){r.eventCanceled=!0};var i=e+`Global`;be.forEach(function(r){t[r.pluginName]&&(t[r.pluginName][i]&&t[r.pluginName][i](p({sortable:t},n)),t.options[r.pluginName]&&t[r.pluginName][e]&&t[r.pluginName][e](p({sortable:t},n)))})},initializePlugins:function(e,t,n,r){for(var i in be.forEach(function(r){var i=r.pluginName;if(!(!e.options[i]&&!r.initializeByDefault)){var a=new r(e,t,e.options);a.sortable=e,a.options=e.options,e[i]=a,d(n,a.defaults)}}),e.options)if(e.options.hasOwnProperty(i)){var a=this.modifyOption(e,i,e.options[i]);a!==void 0&&(e.options[i]=a)}},getEventProperties:function(e,t){var n={};return be.forEach(function(r){typeof r.eventProperties==`function`&&d(n,r.eventProperties.call(t[r.pluginName],e))}),n},modifyOption:function(e,t,n){var r;return be.forEach(function(i){e[i.pluginName]&&i.optionListeners&&typeof i.optionListeners[t]==`function`&&(r=i.optionListeners[t].call(e[i.pluginName],n))}),r}};function Ce(e){var t=e.sortable,n=e.rootEl,r=e.name,i=e.targetEl,a=e.cloneEl,o=e.toEl,s=e.fromEl,c=e.oldIndex,l=e.newIndex,u=e.oldDraggableIndex,d=e.newDraggableIndex,f=e.originalEvent,m=e.putSortable,h=e.extraEventProperties;if(t||=n&&n[R],t){var g,_=t.options,v=`on`+r.charAt(0).toUpperCase()+r.substr(1);window.CustomEvent&&!x&&!S?g=new CustomEvent(r,{bubbles:!0,cancelable:!0}):(g=document.createEvent(`Event`),g.initEvent(r,!0,!0)),g.to=o||n,g.from=s||n,g.item=i||n,g.clone=a,g.oldIndex=c,g.newIndex=l,g.oldDraggableIndex=u,g.newDraggableIndex=d,g.originalEvent=f,g.pullMode=m?m.lastPutMode:void 0;var y=p(p({},h),Se.getEventProperties(r,t));for(var b in y)g[b]=y[b];n&&n.dispatchEvent(g),_[v]&&_[v].call(t,g)}}var we=[`evt`],z=function(e,t){var n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},r=n.evt,i=m(n,we);Se.pluginEvent.bind(Q)(e,t,p({dragEl:V,parentEl:H,ghostEl:U,rootEl:W,nextEl:Te,lastDownEl:Ee,cloneEl:G,cloneHidden:K,dragStarted:Re,putSortable:Y,activeSortable:Q.active,originalEvent:r,oldIndex:De,oldDraggableIndex:Oe,newIndex:q,newDraggableIndex:J,hideGhostForTarget:nt,unhideGhostForTarget:rt,cloneNowHidden:function(){K=!0},cloneNowShown:function(){K=!1},dispatchSortableEvent:function(e){B({sortable:t,name:e,originalEvent:r})}},i))};function B(e){Ce(p({putSortable:Y,cloneEl:G,targetEl:V,rootEl:W,oldIndex:De,oldDraggableIndex:Oe,newIndex:q,newDraggableIndex:J},e))}var V,H,U,W,Te,Ee,G,K,De,q,Oe,J,ke,Y,Ae=!1,je=!1,Me=[],Ne,X,Pe,Fe,Ie,Le,Re,ze,Be,Ve=!1,He=!1,Ue,Z,We=[],Ge=!1,Ke=[],qe=typeof document<`u`,Je=T,Ye=S||x?`cssFloat`:`float`,Xe=qe&&!ee&&!T&&`draggable`in document.createElement(`div`),Ze=function(){if(qe){if(x)return!1;var e=document.createElement(`x`);return e.style.cssText=`pointer-events:auto`,e.style.pointerEvents===`auto`}}(),Qe=function(e,t){var n=M(e),r=parseInt(n.width)-parseInt(n.paddingLeft)-parseInt(n.paddingRight)-parseInt(n.borderLeftWidth)-parseInt(n.borderRightWidth),i=ae(e,0,t),a=ae(e,1,t),o=i&&M(i),s=a&&M(a),c=o&&parseInt(o.marginLeft)+parseInt(o.marginRight)+F(i).width,l=s&&parseInt(s.marginLeft)+parseInt(s.marginRight)+F(a).width;if(n.display===`flex`)return n.flexDirection===`column`||n.flexDirection===`column-reverse`?`vertical`:`horizontal`;if(n.display===`grid`)return n.gridTemplateColumns.split(` `).length<=1?`vertical`:`horizontal`;if(i&&o.float&&o.float!==`none`){var u=o.float===`left`?`left`:`right`;return a&&(s.clear===`both`||s.clear===u)?`vertical`:`horizontal`}return i&&(o.display===`block`||o.display===`flex`||o.display===`table`||o.display===`grid`||c>=r&&n[Ye]===`none`||a&&n[Ye]===`none`&&c+l>r)?`vertical`:`horizontal`},$e=function(e,t,n){var r=n?e.left:e.top,i=n?e.right:e.bottom,a=n?e.width:e.height,o=n?t.left:t.top,s=n?t.right:t.bottom,c=n?t.width:t.height;return r===o||i===s||r+a/2===o+c/2},et=function(e,t){var n;return Me.some(function(r){var i=r[R].options.emptyInsertThreshold;if(!(!i||oe(r))){var a=F(r),o=e>=a.left-i&&e<=a.right+i,s=t>=a.top-i&&t<=a.bottom+i;if(o&&s)return n=r}}),n},tt=function(e){function t(e,n){return function(r,i,a,o){var s=r.options.group.name&&i.options.group.name&&r.options.group.name===i.options.group.name;if(e==null&&(n||s))return!0;if(e==null||e===!1)return!1;if(n&&e===`clone`)return e;if(typeof e==`function`)return t(e(r,i,a,o),n)(r,i,a,o);var c=(n?r:i).options.group.name;return e===!0||typeof e==`string`&&e===c||e.join&&e.indexOf(c)>-1}}var n={},r=e.group;(!r||v(r)!=`object`)&&(r={name:r}),n.name=r.name,n.checkPull=t(r.pull,!0),n.checkPut=t(r.put),n.revertClone=r.revertClone,e.group=n},nt=function(){!Ze&&U&&M(U,`display`,`none`)},rt=function(){!Ze&&U&&M(U,`display`,``)};qe&&!ee&&document.addEventListener(`click`,function(e){if(je)return e.preventDefault(),e.stopPropagation&&e.stopPropagation(),e.stopImmediatePropagation&&e.stopImmediatePropagation(),je=!1,!1},!0);var it=function(e){if(V){e=e.touches?e.touches[0]:e;var t=et(e.clientX,e.clientY);if(t){var n={};for(var r in e)e.hasOwnProperty(r)&&(n[r]=e[r]);n.target=n.rootEl=t,n.preventDefault=void 0,n.stopPropagation=void 0,t[R]._onDragOver(n)}}},at=function(e){V&&V.parentNode[R]._isOutsideThisEl(e.target)};function Q(e,t){if(!(e&&e.nodeType&&e.nodeType===1))throw`Sortable: \`el\` must be an HTMLElement, not ${{}.toString.call(e)}`;this.el=e,this.options=t=d({},t),e[R]=this;var n={group:null,sort:!0,disabled:!1,store:null,handle:null,draggable:/^[uo]l$/i.test(e.nodeName)?`>li`:`>*`,swapThreshold:1,invertSwap:!1,invertedSwapThreshold:null,removeCloneOnHide:!0,direction:function(){return Qe(e,this.options)},ghostClass:`sortable-ghost`,chosenClass:`sortable-chosen`,dragClass:`sortable-drag`,ignore:`a, img`,filter:null,preventOnFilter:!0,animation:0,easing:null,setData:function(e,t){e.setData(`Text`,t.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:`data-id`,delay:0,delayOnTouchOnly:!1,touchStartThreshold:(Number.parseInt?Number:window).parseInt(window.devicePixelRatio,10)||1,forceFallback:!1,fallbackClass:`sortable-fallback`,fallbackOnBody:!1,fallbackTolerance:0,fallbackOffset:{x:0,y:0},supportPointer:Q.supportPointer!==!1&&`PointerEvent`in window&&(!w||T),emptyInsertThreshold:5};for(var r in Se.initializePlugins(this,e,n),n)!(r in t)&&(t[r]=n[r]);for(var i in tt(t),this)i.charAt(0)===`_`&&typeof this[i]==`function`&&(this[i]=this[i].bind(this));this.nativeDraggable=t.forceFallback?!1:Xe,this.nativeDraggable&&(this.options.touchStartThreshold=1),t.supportPointer?D(e,`pointerdown`,this._onTapStart):(D(e,`mousedown`,this._onTapStart),D(e,`touchstart`,this._onTapStart)),this.nativeDraggable&&(D(e,`dragover`,this),D(e,`dragenter`,this)),Me.push(this.el),t.store&&t.store.get&&this.sort(t.store.get(this)||[]),d(this,_e())}Q.prototype={constructor:Q,_isOutsideThisEl:function(e){!this.el.contains(e)&&e!==this.el&&(ze=null)},_getDirection:function(e,t){return typeof this.options.direction==`function`?this.options.direction.call(this,e,t,V):this.options.direction},_onTapStart:function(e){if(e.cancelable){var t=this,n=this.el,r=this.options,i=r.preventOnFilter,a=e.type,o=e.touches&&e.touches[0]||e.pointerType&&e.pointerType===`touch`&&e,s=(o||e).target,c=e.target.shadowRoot&&(e.path&&e.path[0]||e.composedPath&&e.composedPath()[0])||s,l=r.filter;if(ht(n),!V&&!(/mousedown|pointerdown/.test(a)&&e.button!==0||r.disabled)&&!c.isContentEditable&&!(!this.nativeDraggable&&w&&s&&s.tagName.toUpperCase()===`SELECT`)&&(s=A(s,r.draggable,n,!1),!(s&&s.animated)&&Ee!==s)){if(De=I(s),Oe=I(s,r.draggable),typeof l==`function`){if(l.call(this,e,s,this)){B({sortable:t,rootEl:c,name:`filter`,targetEl:s,toEl:n,fromEl:n}),z(`filter`,t,{evt:e}),i&&e.preventDefault();return}}else if(l&&(l=l.split(`,`).some(function(r){if(r=A(c,r.trim(),n,!1),r)return B({sortable:t,rootEl:r,name:`filter`,targetEl:s,fromEl:n,toEl:n}),z(`filter`,t,{evt:e}),!0}),l)){i&&e.preventDefault();return}r.handle&&!A(c,r.handle,n,!1)||this._prepareDragStart(e,o,s)}}},_prepareDragStart:function(e,t,n){var r=this,i=r.el,a=r.options,o=i.ownerDocument,s;if(n&&!V&&n.parentNode===i){var c=F(n);if(W=i,V=n,H=V.parentNode,Te=V.nextSibling,Ee=n,ke=a.group,Q.dragged=V,Ne={target:V,clientX:(t||e).clientX,clientY:(t||e).clientY},Ie=Ne.clientX-c.left,Le=Ne.clientY-c.top,this._lastX=(t||e).clientX,this._lastY=(t||e).clientY,V.style[`will-change`]=`all`,s=function(){if(z(`delayEnded`,r,{evt:e}),Q.eventCanceled){r._onDrop();return}r._disableDelayedDragEvents(),!C&&r.nativeDraggable&&(V.draggable=!0),r._triggerDragStart(e,t),B({sortable:r,name:`choose`,originalEvent:e}),j(V,a.chosenClass,!0)},a.ignore.split(`,`).forEach(function(e){re(V,e.trim(),ct)}),D(o,`dragover`,it),D(o,`mousemove`,it),D(o,`touchmove`,it),a.supportPointer?(D(o,`pointerup`,r._onDrop),!this.nativeDraggable&&D(o,`pointercancel`,r._onDrop)):(D(o,`mouseup`,r._onDrop),D(o,`touchend`,r._onDrop),D(o,`touchcancel`,r._onDrop)),C&&this.nativeDraggable&&(this.options.touchStartThreshold=4,V.draggable=!0),z(`delayStart`,this,{evt:e}),a.delay&&(!a.delayOnTouchOnly||t)&&(!this.nativeDraggable||!(S||x))){if(Q.eventCanceled){this._onDrop();return}a.supportPointer?(D(o,`pointerup`,r._disableDelayedDrag),D(o,`pointercancel`,r._disableDelayedDrag)):(D(o,`mouseup`,r._disableDelayedDrag),D(o,`touchend`,r._disableDelayedDrag),D(o,`touchcancel`,r._disableDelayedDrag)),D(o,`mousemove`,r._delayedDragTouchMoveHandler),D(o,`touchmove`,r._delayedDragTouchMoveHandler),a.supportPointer&&D(o,`pointermove`,r._delayedDragTouchMoveHandler),r._dragStartTimer=setTimeout(s,a.delay)}else s()}},_delayedDragTouchMoveHandler:function(e){var t=e.touches?e.touches[0]:e;Math.max(Math.abs(t.clientX-this._lastX),Math.abs(t.clientY-this._lastY))>=Math.floor(this.options.touchStartThreshold/(this.nativeDraggable&&window.devicePixelRatio||1))&&this._disableDelayedDrag()},_disableDelayedDrag:function(){V&&ct(V),clearTimeout(this._dragStartTimer),this._disableDelayedDragEvents()},_disableDelayedDragEvents:function(){var e=this.el.ownerDocument;O(e,`mouseup`,this._disableDelayedDrag),O(e,`touchend`,this._disableDelayedDrag),O(e,`touchcancel`,this._disableDelayedDrag),O(e,`pointerup`,this._disableDelayedDrag),O(e,`pointercancel`,this._disableDelayedDrag),O(e,`mousemove`,this._delayedDragTouchMoveHandler),O(e,`touchmove`,this._delayedDragTouchMoveHandler),O(e,`pointermove`,this._delayedDragTouchMoveHandler)},_triggerDragStart:function(e,t){t||=e.pointerType==`touch`&&e,!this.nativeDraggable||t?this.options.supportPointer?D(document,`pointermove`,this._onTouchMove):t?D(document,`touchmove`,this._onTouchMove):D(document,`mousemove`,this._onTouchMove):(D(V,`dragend`,this),D(W,`dragstart`,this._onDragStart));try{document.selection?gt(function(){document.selection.empty()}):window.getSelection().removeAllRanges()}catch{}},_dragStarted:function(e,t){if(Ae=!1,W&&V){z(`dragStarted`,this,{evt:t}),this.nativeDraggable&&D(document,`dragover`,at);var n=this.options;!e&&j(V,n.dragClass,!1),j(V,n.ghostClass,!0),Q.active=this,e&&this._appendGhost(),B({sortable:this,name:`start`,originalEvent:t})}else this._nulling()},_emulateDragOver:function(){if(X){this._lastX=X.clientX,this._lastY=X.clientY,nt();for(var e=document.elementFromPoint(X.clientX,X.clientY),t=e;e&&e.shadowRoot&&(e=e.shadowRoot.elementFromPoint(X.clientX,X.clientY),e!==t);)t=e;if(V.parentNode[R]._isOutsideThisEl(e),t)do{if(t[R]){var n=void 0;if(n=t[R]._onDragOver({clientX:X.clientX,clientY:X.clientY,target:e,rootEl:t}),n&&!this.options.dragoverBubble)break}e=t}while(t=te(t));rt()}},_onTouchMove:function(e){if(Ne){var t=this.options,n=t.fallbackTolerance,r=t.fallbackOffset,i=e.touches?e.touches[0]:e,a=U&&N(U,!0),o=U&&a&&a.a,s=U&&a&&a.d,c=Je&&Z&&se(Z),l=(i.clientX-Ne.clientX+r.x)/(o||1)+(c?c[0]-We[0]:0)/(o||1),u=(i.clientY-Ne.clientY+r.y)/(s||1)+(c?c[1]-We[1]:0)/(s||1);if(!Q.active&&!Ae){if(n&&Math.max(Math.abs(i.clientX-this._lastX),Math.abs(i.clientY-this._lastY))<n)return;this._onDragStart(e,!0)}if(U){a?(a.e+=l-(Pe||0),a.f+=u-(Fe||0)):a={a:1,b:0,c:0,d:1,e:l,f:u};var d=`matrix(${a.a},${a.b},${a.c},${a.d},${a.e},${a.f})`;M(U,`webkitTransform`,d),M(U,`mozTransform`,d),M(U,`msTransform`,d),M(U,`transform`,d),Pe=l,Fe=u,X=i}e.cancelable&&e.preventDefault()}},_appendGhost:function(){if(!U){var e=this.options.fallbackOnBody?document.body:W,t=F(V,!0,Je,!0,e),n=this.options;if(Je){for(Z=e;M(Z,`position`)===`static`&&M(Z,`transform`)===`none`&&Z!==document;)Z=Z.parentNode;Z!==document.body&&Z!==document.documentElement?(Z===document&&(Z=P()),t.top+=Z.scrollTop,t.left+=Z.scrollLeft):Z=P(),We=se(Z)}U=V.cloneNode(!0),j(U,n.ghostClass,!1),j(U,n.fallbackClass,!0),j(U,n.dragClass,!0),M(U,`transition`,``),M(U,`transform`,``),M(U,`box-sizing`,`border-box`),M(U,`margin`,0),M(U,`top`,t.top),M(U,`left`,t.left),M(U,`width`,t.width),M(U,`height`,t.height),M(U,`opacity`,`0.8`),M(U,`position`,Je?`absolute`:`fixed`),M(U,`zIndex`,`100000`),M(U,`pointerEvents`,`none`),Q.ghost=U,e.appendChild(U),M(U,`transform-origin`,Ie/parseInt(U.style.width)*100+`% `+Le/parseInt(U.style.height)*100+`%`)}},_onDragStart:function(e,t){var n=this,r=e.dataTransfer,i=n.options;if(z(`dragStart`,this,{evt:e}),Q.eventCanceled){this._onDrop();return}z(`setupClone`,this),Q.eventCanceled||(G=he(V),G.removeAttribute(`id`),G.draggable=!1,G.style[`will-change`]=``,this._hideClone(),j(G,this.options.chosenClass,!1),Q.clone=G),n.cloneId=gt(function(){z(`clone`,n),!Q.eventCanceled&&(n.options.removeCloneOnHide||W.insertBefore(G,V),n._hideClone(),B({sortable:n,name:`clone`}))}),!t&&j(V,i.dragClass,!0),t?(je=!0,n._loopId=setInterval(n._emulateDragOver,50)):(O(document,`mouseup`,n._onDrop),O(document,`touchend`,n._onDrop),O(document,`touchcancel`,n._onDrop),r&&(r.effectAllowed=`move`,i.setData&&i.setData.call(n,r,V)),D(document,`drop`,n),M(V,`transform`,`translateZ(0)`)),Ae=!0,n._dragStartId=gt(n._dragStarted.bind(n,t,e)),D(document,`selectstart`,n),Re=!0,window.getSelection().removeAllRanges(),w&&M(document.body,`user-select`,`none`)},_onDragOver:function(e){var t=this.el,n=e.target,r,i,a,o=this.options,s=o.group,c=Q.active,l=ke===s,u=o.sort,d=Y||c,f,m=this,h=!1;if(Ge)return;function g(o,s){z(o,m,p({evt:e,isOwner:l,axis:f?`vertical`:`horizontal`,revert:a,dragRect:r,targetRect:i,canSort:u,fromSortable:d,target:n,completed:v,onMove:function(n,i){return st(W,t,V,r,n,F(n),e,i)},changed:y},s))}function _(){g(`dragOverAnimationCapture`),m.captureAnimationState(),m!==d&&d.captureAnimationState()}function v(r){return g(`dragOverCompleted`,{insertion:r}),r&&(l?c._hideClone():c._showClone(m),m!==d&&(j(V,Y?Y.options.ghostClass:c.options.ghostClass,!1),j(V,o.ghostClass,!0)),Y!==m&&m!==Q.active?Y=m:m===Q.active&&Y&&(Y=null),d===m&&(m._ignoreWhileAnimating=n),m.animateAll(function(){g(`dragOverAnimationComplete`),m._ignoreWhileAnimating=null}),m!==d&&(d.animateAll(),d._ignoreWhileAnimating=null)),(n===V&&!V.animated||n===t&&!n.animated)&&(ze=null),!o.dragoverBubble&&!e.rootEl&&n!==document&&(V.parentNode[R]._isOutsideThisEl(e.target),!r&&it(e)),!o.dragoverBubble&&e.stopPropagation&&e.stopPropagation(),h=!0}function y(){q=I(V),J=I(V,o.draggable),B({sortable:m,name:`change`,toEl:t,newIndex:q,newDraggableIndex:J,originalEvent:e})}if(e.preventDefault!==void 0&&e.cancelable&&e.preventDefault(),n=A(n,o.draggable,t,!0),g(`dragOver`),Q.eventCanceled)return h;if(V.contains(e.target)||n.animated&&n.animatingX&&n.animatingY||m._ignoreWhileAnimating===n)return v(!1);if(je=!1,c&&!o.disabled&&(l?u||(a=H!==W):Y===this||(this.lastPutMode=ke.checkPull(this,c,V,e))&&s.checkPut(this,c,V,e))){if(f=this._getDirection(e,n)===`vertical`,r=F(V),g(`dragOverValid`),Q.eventCanceled)return h;if(a)return H=W,_(),this._hideClone(),g(`revert`),Q.eventCanceled||(Te?W.insertBefore(V,Te):W.appendChild(V)),v(!0);var b=oe(t,o.draggable);if(!b||dt(e,f,this)&&!b.animated){if(b===V)return v(!1);if(b&&t===e.target&&(n=b),n&&(i=F(n)),st(W,t,V,r,n,i,e,!!n)!==!1)return _(),b&&b.nextSibling?t.insertBefore(V,b.nextSibling):t.appendChild(V),H=t,y(),v(!0)}else if(b&&ut(e,f,this)){var x=ae(t,0,o,!0);if(x===V)return v(!1);if(n=x,i=F(n),st(W,t,V,r,n,i,e,!1)!==!1)return _(),t.insertBefore(V,x),H=t,y(),v(!0)}else if(n.parentNode===t){i=F(n);var S=0,C,w=V.parentNode!==t,T=!$e(V.animated&&V.toRect||r,n.animated&&n.toRect||i,f),ee=f?`top`:`left`,E=ie(n,`top`,`top`)||ie(V,`top`,`top`),D=E?E.scrollTop:void 0;ze!==n&&(C=i[ee],Ve=!1,He=!T&&o.invertSwap||w),S=ft(e,n,i,f,T?1:o.swapThreshold,o.invertedSwapThreshold==null?o.swapThreshold:o.invertedSwapThreshold,He,ze===n);var O;if(S!==0){var k=I(V);do k-=S,O=H.children[k];while(O&&(M(O,`display`)===`none`||O===U))}if(S===0||O===n)return v(!1);ze=n,Be=S;var te=n.nextElementSibling,ne=!1;ne=S===1;var N=st(W,t,V,r,n,i,e,ne);if(N!==!1)return(N===1||N===-1)&&(ne=N===1),Ge=!0,setTimeout(lt,30),_(),ne&&!te?t.appendChild(V):n.parentNode.insertBefore(V,ne?te:n),E&&me(E,0,D-E.scrollTop),H=V.parentNode,C!==void 0&&!He&&(Ue=Math.abs(C-F(n)[ee])),y(),v(!0)}if(t.contains(V))return v(!1)}return!1},_ignoreWhileAnimating:null,_offMoveEvents:function(){O(document,`mousemove`,this._onTouchMove),O(document,`touchmove`,this._onTouchMove),O(document,`pointermove`,this._onTouchMove),O(document,`dragover`,it),O(document,`mousemove`,it),O(document,`touchmove`,it)},_offUpEvents:function(){var e=this.el.ownerDocument;O(e,`mouseup`,this._onDrop),O(e,`touchend`,this._onDrop),O(e,`pointerup`,this._onDrop),O(e,`pointercancel`,this._onDrop),O(e,`touchcancel`,this._onDrop),O(document,`selectstart`,this)},_onDrop:function(e){var t=this.el,n=this.options;if(q=I(V),J=I(V,n.draggable),z(`drop`,this,{evt:e}),H=V&&V.parentNode,q=I(V),J=I(V,n.draggable),Q.eventCanceled){this._nulling();return}Ae=!1,He=!1,Ve=!1,clearInterval(this._loopId),clearTimeout(this._dragStartTimer),_t(this.cloneId),_t(this._dragStartId),this.nativeDraggable&&(O(document,`drop`,this),O(t,`dragstart`,this._onDragStart)),this._offMoveEvents(),this._offUpEvents(),w&&M(document.body,`user-select`,``),M(V,`transform`,``),e&&(Re&&(e.cancelable&&e.preventDefault(),!n.dropBubble&&e.stopPropagation()),U&&U.parentNode&&U.parentNode.removeChild(U),(W===H||Y&&Y.lastPutMode!==`clone`)&&G&&G.parentNode&&G.parentNode.removeChild(G),V&&(this.nativeDraggable&&O(V,`dragend`,this),ct(V),V.style[`will-change`]=``,Re&&!Ae&&j(V,Y?Y.options.ghostClass:this.options.ghostClass,!1),j(V,this.options.chosenClass,!1),B({sortable:this,name:`unchoose`,toEl:H,newIndex:null,newDraggableIndex:null,originalEvent:e}),W===H?q!==De&&q>=0&&(B({sortable:this,name:`update`,toEl:H,originalEvent:e}),B({sortable:this,name:`sort`,toEl:H,originalEvent:e})):(q>=0&&(B({rootEl:H,name:`add`,toEl:H,fromEl:W,originalEvent:e}),B({sortable:this,name:`remove`,toEl:H,originalEvent:e}),B({rootEl:H,name:`sort`,toEl:H,fromEl:W,originalEvent:e}),B({sortable:this,name:`sort`,toEl:H,originalEvent:e})),Y&&Y.save()),Q.active&&((q==null||q===-1)&&(q=De,J=Oe),B({sortable:this,name:`end`,toEl:H,originalEvent:e}),this.save()))),this._nulling()},_nulling:function(){z(`nulling`,this),W=V=H=U=Te=G=Ee=K=Ne=X=Re=q=J=De=Oe=ze=Be=Y=ke=Q.dragged=Q.ghost=Q.clone=Q.active=null;var e=this.el;Ke.forEach(function(t){e.contains(t)&&(t.checked=!0)}),Ke.length=Pe=Fe=0},handleEvent:function(e){switch(e.type){case`drop`:case`dragend`:this._onDrop(e);break;case`dragenter`:case`dragover`:V&&(this._onDragOver(e),ot(e));break;case`selectstart`:e.preventDefault();break}},toArray:function(){for(var e=[],t,n=this.el.children,r=0,i=n.length,a=this.options;r<i;r++)t=n[r],A(t,a.draggable,this.el,!1)&&e.push(t.getAttribute(a.dataIdAttr)||mt(t));return e},sort:function(e,t){var n={},r=this.el;this.toArray().forEach(function(e,t){var i=r.children[t];A(i,this.options.draggable,r,!1)&&(n[e]=i)},this),t&&this.captureAnimationState(),e.forEach(function(e){n[e]&&(r.removeChild(n[e]),r.appendChild(n[e]))}),t&&this.animateAll()},save:function(){var e=this.options.store;e&&e.set&&e.set(this)},closest:function(e,t){return A(e,t||this.options.draggable,this.el,!1)},option:function(e,t){var n=this.options;if(t===void 0)return n[e];var r=Se.modifyOption(this,e,t);r===void 0?n[e]=t:n[e]=r,e===`group`&&tt(n)},destroy:function(){z(`destroy`,this);var e=this.el;e[R]=null,O(e,`mousedown`,this._onTapStart),O(e,`touchstart`,this._onTapStart),O(e,`pointerdown`,this._onTapStart),this.nativeDraggable&&(O(e,`dragover`,this),O(e,`dragenter`,this)),Array.prototype.forEach.call(e.querySelectorAll(`[draggable]`),function(e){e.removeAttribute(`draggable`)}),this._onDrop(),this._disableDelayedDragEvents(),Me.splice(Me.indexOf(this.el),1),this.el=e=null},_hideClone:function(){if(!K){if(z(`hideClone`,this),Q.eventCanceled)return;M(G,`display`,`none`),this.options.removeCloneOnHide&&G.parentNode&&G.parentNode.removeChild(G),K=!0}},_showClone:function(e){if(e.lastPutMode!==`clone`){this._hideClone();return}if(K){if(z(`showClone`,this),Q.eventCanceled)return;V.parentNode==W&&!this.options.group.revertClone?W.insertBefore(G,V):Te?W.insertBefore(G,Te):W.appendChild(G),this.options.group.revertClone&&this.animate(V,G),M(G,`display`,``),K=!1}}};function ot(e){e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),e.cancelable&&e.preventDefault()}function st(e,t,n,r,i,a,o,s){var c,l=e[R],u=l.options.onMove,d;return window.CustomEvent&&!x&&!S?c=new CustomEvent(`move`,{bubbles:!0,cancelable:!0}):(c=document.createEvent(`Event`),c.initEvent(`move`,!0,!0)),c.to=t,c.from=e,c.dragged=n,c.draggedRect=r,c.related=i||t,c.relatedRect=a||F(t),c.willInsertAfter=s,c.originalEvent=o,e.dispatchEvent(c),u&&(d=u.call(l,c,o)),d}function ct(e){e.draggable=!1}function lt(){Ge=!1}function ut(e,t,n){var r=F(ae(n.el,0,n.options,!0)),i=ge(n.el,n.options,U),a=10;return t?e.clientX<i.left-a||e.clientY<r.top&&e.clientX<r.right:e.clientY<i.top-a||e.clientY<r.bottom&&e.clientX<r.left}function dt(e,t,n){var r=F(oe(n.el,n.options.draggable)),i=ge(n.el,n.options,U),a=10;return t?e.clientX>i.right+a||e.clientY>r.bottom&&e.clientX>r.left:e.clientY>i.bottom+a||e.clientX>r.right&&e.clientY>r.top}function ft(e,t,n,r,i,a,o,s){var c=r?e.clientY:e.clientX,l=r?n.height:n.width,u=r?n.top:n.left,d=r?n.bottom:n.right,f=!1;if(!o){if(s&&Ue<l*i){if(!Ve&&(Be===1?c>u+l*a/2:c<d-l*a/2)&&(Ve=!0),Ve)f=!0;else if(Be===1?c<u+Ue:c>d-Ue)return-Be}else if(c>u+l*(1-i)/2&&c<d-l*(1-i)/2)return pt(t)}return f||=o,f&&(c<u+l*a/2||c>d-l*a/2)?c>u+l/2?1:-1:0}function pt(e){return I(V)<I(e)?1:-1}function mt(e){for(var t=e.tagName+e.className+e.src+e.href+e.textContent,n=t.length,r=0;n--;)r+=t.charCodeAt(n);return r.toString(36)}function ht(e){Ke.length=0;for(var t=e.getElementsByTagName(`input`),n=t.length;n--;){var r=t[n];r.checked&&Ke.push(r)}}function gt(e){return setTimeout(e,0)}function _t(e){return clearTimeout(e)}qe&&D(document,`touchmove`,function(e){(Q.active||Ae)&&e.cancelable&&e.preventDefault()}),Q.utils={on:D,off:O,css:M,find:re,is:function(e,t){return!!A(e,t,e,!1)},extend:le,throttle:fe,closest:A,toggleClass:j,clone:he,index:I,nextTick:gt,cancelNextTick:_t,detectDirection:Qe,getChild:ae,expando:R},Q.get=function(e){return e[R]},Q.mount=function(){var e=[...arguments];e[0].constructor===Array&&(e=e[0]),e.forEach(function(e){if(!e.prototype||!e.prototype.constructor)throw`Sortable: Mounted plugin must be a constructor function, not ${{}.toString.call(e)}`;e.utils&&(Q.utils=p(p({},Q.utils),e.utils)),Se.mount(e)})},Q.create=function(e,t){return new Q(e,t)},Q.version=y;var $=[],vt,yt,bt=!1,xt,St,Ct,wt;function Tt(){function e(){for(var e in this.defaults={scroll:!0,forceAutoScrollFallback:!1,scrollSensitivity:30,scrollSpeed:10,bubbleScroll:!0},this)e.charAt(0)===`_`&&typeof this[e]==`function`&&(this[e]=this[e].bind(this))}return e.prototype={dragStarted:function(e){var t=e.originalEvent;this.sortable.nativeDraggable?D(document,`dragover`,this._handleAutoScroll):this.options.supportPointer?D(document,`pointermove`,this._handleFallbackAutoScroll):t.touches?D(document,`touchmove`,this._handleFallbackAutoScroll):D(document,`mousemove`,this._handleFallbackAutoScroll)},dragOverCompleted:function(e){var t=e.originalEvent;!this.options.dragOverBubble&&!t.rootEl&&this._handleAutoScroll(t)},drop:function(){this.sortable.nativeDraggable?O(document,`dragover`,this._handleAutoScroll):(O(document,`pointermove`,this._handleFallbackAutoScroll),O(document,`touchmove`,this._handleFallbackAutoScroll),O(document,`mousemove`,this._handleFallbackAutoScroll)),Dt(),Et(),pe()},nulling:function(){Ct=yt=vt=bt=wt=xt=St=null,$.length=0},_handleFallbackAutoScroll:function(e){this._handleAutoScroll(e,!0)},_handleAutoScroll:function(e,t){var n=this,r=(e.touches?e.touches[0]:e).clientX,i=(e.touches?e.touches[0]:e).clientY,a=document.elementFromPoint(r,i);if(Ct=e,t||this.options.forceAutoScrollFallback||S||x||w){Ot(e,this.options,a,t);var o=L(a,!0);bt&&(!wt||r!==xt||i!==St)&&(wt&&Dt(),wt=setInterval(function(){var a=L(document.elementFromPoint(r,i),!0);a!==o&&(o=a,Et()),Ot(e,n.options,a,t)},10),xt=r,St=i)}else{if(!this.options.bubbleScroll||L(a,!0)===P()){Et();return}Ot(e,this.options,L(a,!1),!1)}}},d(e,{pluginName:`scroll`,initializeByDefault:!0})}function Et(){$.forEach(function(e){clearInterval(e.pid)}),$=[]}function Dt(){clearInterval(wt)}var Ot=fe(function(e,t,n,r){if(t.scroll){var i=(e.touches?e.touches[0]:e).clientX,a=(e.touches?e.touches[0]:e).clientY,o=t.scrollSensitivity,s=t.scrollSpeed,c=P(),l=!1,u;yt!==n&&(yt=n,Et(),vt=t.scroll,u=t.scrollFn,vt===!0&&(vt=L(n,!0)));var d=0,f=vt;do{var p=f,m=F(p),h=m.top,g=m.bottom,_=m.left,v=m.right,y=m.width,b=m.height,x=void 0,S=void 0,C=p.scrollWidth,w=p.scrollHeight,T=M(p),ee=p.scrollLeft,E=p.scrollTop;p===c?(x=y<C&&(T.overflowX===`auto`||T.overflowX===`scroll`||T.overflowX===`visible`),S=b<w&&(T.overflowY===`auto`||T.overflowY===`scroll`||T.overflowY===`visible`)):(x=y<C&&(T.overflowX===`auto`||T.overflowX===`scroll`),S=b<w&&(T.overflowY===`auto`||T.overflowY===`scroll`));var D=x&&(Math.abs(v-i)<=o&&ee+y<C)-(Math.abs(_-i)<=o&&!!ee),O=S&&(Math.abs(g-a)<=o&&E+b<w)-(Math.abs(h-a)<=o&&!!E);if(!$[d])for(var k=0;k<=d;k++)$[k]||($[k]={});($[d].vx!=D||$[d].vy!=O||$[d].el!==p)&&($[d].el=p,$[d].vx=D,$[d].vy=O,clearInterval($[d].pid),(D!=0||O!=0)&&(l=!0,$[d].pid=setInterval(function(){r&&this.layer===0&&Q.active._onTouchMove(Ct);var t=$[this.layer].vy?$[this.layer].vy*s:0,n=$[this.layer].vx?$[this.layer].vx*s:0;typeof u==`function`&&u.call(Q.dragged.parentNode[R],n,t,e,Ct,$[this.layer].el)!==`continue`||me($[this.layer].el,n,t)}.bind({layer:d}),24))),d++}while(t.bubbleScroll&&f!==c&&(f=L(f,!1)));bt=l}},30),kt=function(e){var t=e.originalEvent,n=e.putSortable,r=e.dragEl,i=e.activeSortable,a=e.dispatchSortableEvent,o=e.hideGhostForTarget,s=e.unhideGhostForTarget;if(t){var c=n||i;o();var l=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:t,u=document.elementFromPoint(l.clientX,l.clientY);s(),c&&!c.el.contains(u)&&(a(`spill`),this.onSpill({dragEl:r,putSortable:n}))}};function At(){}At.prototype={startIndex:null,dragStart:function(e){var t=e.oldDraggableIndex;this.startIndex=t},onSpill:function(e){var t=e.dragEl,n=e.putSortable;this.sortable.captureAnimationState(),n&&n.captureAnimationState();var r=ae(this.sortable.el,this.startIndex,this.options);r?this.sortable.el.insertBefore(t,r):this.sortable.el.appendChild(t),this.sortable.animateAll(),n&&n.animateAll()},drop:kt},d(At,{pluginName:`revertOnSpill`});function jt(){}jt.prototype={onSpill:function(e){var t=e.dragEl,n=e.putSortable||this.sortable;n.captureAnimationState(),t.parentNode&&t.parentNode.removeChild(t),n.animateAll()},drop:kt},d(jt,{pluginName:`removeOnSpill`}),Q.mount(new Tt),Q.mount(jt,At);var Mt=class extends o{constructor(e,t,n){super(e),this.taskModel=t,this.modalElement=n,this.sortables=[],this.unsubscribeAdded=this.taskModel.on(`taskAdded`,()=>this.render()),this.unsubscribeUpdated=this.taskModel.on(`taskUpdated`,()=>this.render()),this.unsubscribeDeleted=this.taskModel.on(`taskDeleted`,()=>this.render())}destroy(){this._destroySortable(),this.unsubscribeAdded(),this.unsubscribeUpdated(),this.unsubscribeDeleted()}_destroySortable(){this.sortables.forEach(e=>e.destroy()),this.sortables=[]}render(){this._destroySortable();let e=this.taskModel.getAllTasks().filter(e=>!e.completed),t=e.filter(e=>e.quadrant===1),n=e.filter(e=>e.quadrant===2),r=e.filter(e=>e.quadrant===3),i=e.filter(e=>e.quadrant===4),a=`
            <div class="matrix-container">
                <h2>Eisenhower Matrix</h2>
                <div class="matrix-grid">
                    
                    <!-- Q1: Urgent & Important -->
                    <section class="matrix-quadrant q1" aria-labelledby="q1-title">
                        <div class="quadrant-header">
                            <h3 id="q1-title">🔥 Urgent & Important</h3>
                            <span class="badge" id="q1-count">${t.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-1" data-quadrant="1">
                            ${t.map(e=>this._generateCardTemplate(e)).join(``)}
                        </div>
                    </section>

                    <!-- Q2: Important & Not Urgent -->
                    <section class="matrix-quadrant q2" aria-labelledby="q2-title">
                        <div class="quadrant-header">
                            <h3 id="q2-title">⭐️ Important & Not Urgent</h3>
                            <span class="badge" id="q2-count">${n.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-2" data-quadrant="2">
                            ${n.map(e=>this._generateCardTemplate(e)).join(``)}
                        </div>
                    </section>

                    <!-- Q3: Urgent & Not Important -->
                    <section class="matrix-quadrant q3" aria-labelledby="q3-title">
                        <div class="quadrant-header">
                            <h3 id="q3-title">⚡️ Urgent & Not Important</h3>
                            <span class="badge" id="q3-count">${r.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-3" data-quadrant="3">
                            ${r.map(e=>this._generateCardTemplate(e)).join(``)}
                        </div>
                    </section>

                    <!-- Q4: Not Urgent & Not Important -->
                    <section class="matrix-quadrant q4" aria-labelledby="q4-title">
                        <div class="quadrant-header">
                            <h3 id="q4-title">💤 Not Urgent & Not Important</h3>
                            <span class="badge" id="q4-count">${i.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-4" data-quadrant="4">
                            ${i.map(e=>this._generateCardTemplate(e)).join(``)}
                        </div>
                    </section>

                </div>
            </div>
        `;this.renderHTML(a),this._setupSortable(),this._setupListeners()}_generateCardTemplate(e){return`
            <div class="matrix-card" data-id="${e.id}">
                <span class="card-text">${this._escapeHTML(e.title)}</span>
                <div class="card-actions">
                    <button class="delete-card-btn" data-id="${e.id}" title="Delete Task">×</button>
                </div>
            </div>
        `}_setupSortable(){let e=this;this.container.querySelectorAll(`.quadrant-list`).forEach(t=>{let n=Q.create(t,{group:`matrix-kanban`,animation:200,ghostClass:`sortable-ghost`,onEnd:function(t){let n=t.item.getAttribute(`data-id`),r=t.to,i=parseInt(r.getAttribute(`data-quadrant`));if(n&&i)try{e.taskModel.updateTask(n,{quadrant:i})}catch(t){console.error(`Failed to update task drag status:`,t),e.render()}}});this.sortables.push(n)})}_setupListeners(){let e=this.container.querySelector(`.matrix-grid`);e&&e.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`.delete-card-btn`);if(n){e.stopPropagation();let t=n.getAttribute(`data-id`);s(`Delete Task`,`Are you sure you want to delete this task?`).then(e=>{e&&this.taskModel.deleteTask(t)});return}let r=t.closest(`.matrix-card`);if(r){let e=r.getAttribute(`data-id`),t=this.taskModel.getTaskById(e);t&&this.modalElement.open(t,t=>{this.taskModel.updateTask(e,t)})}})}_escapeHTML(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}},Nt=class{constructor(e,t,n,r){this.x=e,this.y=t,this.color=n,this.size=Math.random()*8+6,this.speedX=r===`left`?Math.random()*14+6:Math.random()*-14-6,this.speedY=Math.random()*-18-8,this.gravity=.35,this.drag=.98,this.opacity=1,this.fade=Math.random()*.015+.008,this.rotation=Math.random()*360,this.rotationSpeed=Math.random()*12-6}update(){this.speedX*=this.drag,this.speedY*=this.drag,this.speedY+=this.gravity,this.x+=this.speedX,this.y+=this.speedY,this.opacity-=this.fade,this.rotation+=this.rotationSpeed}draw(e){e.save(),e.translate(this.x,this.y),e.rotate(this.rotation*Math.PI/180),e.globalAlpha=Math.max(0,this.opacity),e.fillStyle=this.color,e.fillRect(-this.size/2,-this.size/2,this.size,this.size),e.restore()}},Pt=class extends o{constructor(e,t){super(e),this.habitModel=t,this.unsubscribeAdded=this.habitModel.on(`habitAdded`,()=>this.render()),this.unsubscribeUpdated=this.habitModel.on(`habitUpdated`,()=>this.render()),this.unsubscribeDeleted=this.habitModel.on(`habitDeleted`,()=>this.render()),this.confettiActive=!1,this.particles=[]}destroy(){this.unsubscribeAdded(),this.unsubscribeUpdated(),this.unsubscribeDeleted(),this.confettiActive=!1}render(){let e=this.habitModel.getAllHabits(),t=this._getLocalDateString(new Date),n=`
            <div class="habits-container">
                <header class="habits-header">
                    <h2>Habit Tracker</h2>
                </header>

                <div class="habits-layout">
                    <!-- Left Side: Habits list and creator -->
                    <section class="habits-list-section">
                        <form class="add-task-form" id="add-habit-form" style="margin-bottom: 12px;">
                            <input type="text" id="habit-name" placeholder="Enter new habit name... (e.g. Read 15 mins)" required autocomplete="off" />
                            <button type="submit">Create Habit</button>
                        </form>

                        <div class="task-list" id="habits-list-container">
                            ${e.length===0?`
                                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                    No habits tracked yet. Create one above to begin!
                                </div>
                            `:e.map(e=>{let n=e.historyDates.includes(t);return`
                                    <article class="habit-item" data-id="${e.id}">
                                        <div class="habit-info">
                                            <h4>${this._escapeHTML(e.name)}</h4>
                                            <p>${e.historyDates.length} total completions</p>
                                        </div>

                                        <div class="habit-check-group">
                                            <span class="streak-badge">
                                                🔥 ${e.streak} day streak
                                            </span>
                                            
                                            <button class="check-btn ${n?`checked`:``}" data-id="${e.id}" aria-label="Mark completed for today">
                                                <svg viewBox="0 0 24 24">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>

                                            <button class="delete-btn delete-habit-btn" data-id="${e.id}" title="Delete Habit">×</button>
                                        </div>
                                    </article>
                                `}).join(``)}
                        </div>
                    </section>

                    <!-- Right Side: HTML5 Canvas stats -->
                    <section class="habits-stats-section">
                        <h3>Last 7 Days Statistics</h3>
                        <!-- Renders statistical visual trends on canvas -->
                        <canvas id="habits-canvas" width="600" height="400" style="width:100%; aspect-ratio: 3/2;"></canvas>
                    </section>
                </div>
            </div>
        `;this.renderHTML(n),this._setupListeners(),setTimeout(()=>this._drawStatsChart(),20)}_drawStatsChart(){let e=this.container.querySelector(`#habits-canvas`);if(!e)return;let t=e.getContext(`2d`),n=this.habitModel.getAllHabits(),r=document.body.classList.contains(`dark-mode`),i=r?`#a4b0be`:`#636e72`,a=r?`rgba(255,255,255,0.06)`:`rgba(0,0,0,0.05)`,o=r?`#8f7eff`:`#6c5ce7`,s=r?`rgba(143, 126, 255, 0.25)`:`rgba(108, 92, 231, 0.2)`;t.clearRect(0,0,e.width,e.height);let c={top:40,right:30,bottom:50,left:50},l=e.width-c.left-c.right,u=e.height-c.top-c.bottom,d=[],f=[],p=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`];for(let e=6;e>=0;e--){let t=new Date;t.setDate(t.getDate()-e),d.push(this._getLocalDateString(t)),f.push(p[t.getDay()])}let m=d.map(e=>n.length===0?0:n.filter(t=>t.historyDates.includes(e)).length/n.length);t.lineWidth=1,t.strokeStyle=a,t.fillStyle=i,t.font=`500 16px Outfit, sans-serif`,t.textAlign=`right`,t.textBaseline=`middle`,[0,.25,.5,.75,1].forEach(n=>{let r=c.top+u*(1-n);t.beginPath(),t.moveTo(c.left,r),t.lineTo(e.width-c.right,r),t.stroke(),t.fillText(`${n*100}%`,c.left-12,r)}),t.textAlign=`center`,t.textBaseline=`top`;let h=[];if(f.forEach((n,r)=>{let i=c.left+l/6*r;h.push(i),t.fillText(n,i,e.height-c.bottom+12)}),n.length===0){t.fillStyle=i,t.font=`italic 18px Outfit, sans-serif`,t.fillText(`Create habits to view visual trends`,e.width/2+10,e.height/2);return}t.beginPath(),t.moveTo(h[0],c.top+u),h.forEach((e,n)=>{let r=c.top+u*(1-m[n]);t.lineTo(e,r)}),t.lineTo(h[6],c.top+u),t.closePath();let g=t.createLinearGradient(0,c.top,0,c.top+u);g.addColorStop(0,s),g.addColorStop(1,`rgba(0,0,0,0)`),t.fillStyle=g,t.fill(),t.beginPath(),h.forEach((e,n)=>{let r=c.top+u*(1-m[n]);n===0?t.moveTo(e,r):t.lineTo(e,r)}),t.lineWidth=4,t.strokeStyle=o,t.lineCap=`round`,t.lineJoin=`round`,t.shadowBlur=10,t.shadowColor=o,t.stroke(),t.shadowBlur=0,h.forEach((e,n)=>{let r=c.top+u*(1-m[n]);t.beginPath(),t.arc(e,r,7,0,Math.PI*2),t.fillStyle=o,t.fill(),t.beginPath(),t.arc(e,r,4,0,Math.PI*2),t.fillStyle=`#ffffff`,t.fill()})}_triggerConfetti(){let e=document.getElementById(`confetti-canvas`);if(!e)return;let t=e.getContext(`2d`),n=window.innerWidth,r=window.innerHeight;e.width=n,e.height=r,this.particles=[];let i=[`#6c5ce7`,`#ff007f`,`#00f0ff`,`#00b894`,`#fbc531`,`#e84118`];for(let e=0;e<70;e++){let e=i[Math.floor(Math.random()*i.length)];this.particles.push(new Nt(0,r,e,`left`))}for(let e=0;e<70;e++){let e=i[Math.floor(Math.random()*i.length)];this.particles.push(new Nt(n,r,e,`right`))}this.confettiActive||(this.confettiActive=!0,this._animateConfetti(e,t))}_animateConfetti(e,t){this.confettiActive&&(t.clearRect(0,0,e.width,e.height),this.particles.forEach(e=>{e.update(),e.draw(t)}),this.particles=this.particles.filter(e=>e.opacity>0),this.particles.length>0?requestAnimationFrame(()=>this._animateConfetti(e,t)):(this.confettiActive=!1,t.clearRect(0,0,e.width,e.height)))}_setupListeners(){let e=this.container,t=e.querySelector(`#add-habit-form`);t&&t.addEventListener(`submit`,t=>{t.preventDefault();let n=e.querySelector(`#habit-name`),r=n.value.trim();r!==``&&(this.habitModel.addHabit(r),n.value=``)});let n=e.querySelector(`#habits-list-container`);n&&n.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`.check-btn`);if(n){let e=n.getAttribute(`data-id`),t=this._getLocalDateString(new Date),r=n.classList.contains(`checked`);this.habitModel.toggleHabitDate(e,t),r||(this._triggerConfetti(),navigator.vibrate&&navigator.vibrate([20,40,20]));return}let r=t.closest(`.delete-habit-btn`);if(r){let e=r.getAttribute(`data-id`);s(`Delete Habit`,`Are you sure you want to delete this habit?`).then(t=>{t&&this.habitModel.deleteHabit(e)});return}})}_getLocalDateString(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}_escapeHTML(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}},Ft=class extends o{constructor(e,t){super(e),this.pomodoroModel=t,this.ambientAudio=document.createElement(`audio`),this.ambientAudio.loop=!0,this.ambientAudio.id=`todozen-ambient-audio`,document.body.appendChild(this.ambientAudio),this.alarmAudio=document.createElement(`audio`),this.alarmAudio.id=`todozen-alarm-audio`,document.body.appendChild(this.alarmAudio),this._generateSyntheticAlarm(),this.unsubTick=this.pomodoroModel.on(`tick`,e=>this._updateUI(e)),this.unsubReset=this.pomodoroModel.on(`reset`,e=>this._updateUI(e)),this.unsubStatus=this.pomodoroModel.on(`statusChanged`,e=>{this._updateButtons(e),this._updateUI(e),this._handleAmbientPlayback(e)}),this.unsubFinished=this.pomodoroModel.on(`sessionFinished`,e=>{this._playAlarm(),c(`Focus Session Finished`,`Session complete! Take a ${e.nextType===`break`?`5-minute break`:`25-minute work focus`}.`)})}destroy(){this.unsubTick(),this.unsubReset(),this.unsubStatus(),this.unsubFinished(),this.ambientAudio.pause(),this.ambientAudio.remove(),this.alarmAudio.pause(),this.alarmAudio.remove()}render(){let e=this.pomodoroModel.getState();this.renderHTML(`
            <div class="focus-container">
                <div class="focus-card">
                    <h2 class="focus-title">Focus Timer</h2>
                    <div class="canvas-wrapper">
                        <canvas id="pomodoro-canvas" width="440" height="440"></canvas>
                        <div class="timer-display">
                            <span id="pomodoro-time">25:00</span>
                            <span id="pomodoro-session-type" class="session-badge work">WORK</span>
                        </div>
                    </div>
                    
                    <div class="focus-controls">
                        <button id="pomodoro-start" class="btn-primary">Start</button>
                        <button id="pomodoro-pause" class="btn-secondary" disabled>Pause</button>
                        <button id="pomodoro-reset" class="btn-tertiary">Reset</button>
                    </div>

                    <div class="focus-soundscape">
                        <div class="soundscape-control">
                            <label for="white-noise-select">Ambient Sound</label>
                            <select id="white-noise-select">
                                <option value="none">None</option>
                                <option value="synth-noise">White Noise</option>
                                <option value="synth-rain">Pink Rain</option>
                                <option value="synth-waves">Brown Waves</option>
                            </select>
                        </div>
                        <div class="soundscape-control">
                            <label for="white-noise-volume">Volume</label>
                            <input type="range" id="white-noise-volume" min="0" max="1" step="0.05" value="0.5" />
                        </div>
                    </div>
                </div>
            </div>
        `),this.canvas=this.container.querySelector(`#pomodoro-canvas`),this.timeText=this.container.querySelector(`#pomodoro-time`),this.sessionTypeBadge=this.container.querySelector(`#pomodoro-session-type`),this.startBtn=this.container.querySelector(`#pomodoro-start`),this.pauseBtn=this.container.querySelector(`#pomodoro-pause`),this.resetBtn=this.container.querySelector(`#pomodoro-reset`),this.soundSelect=this.container.querySelector(`#white-noise-select`),this.volumeSlider=this.container.querySelector(`#white-noise-volume`),this._setupListeners(),this._updateUI(e),this._updateButtons(e)}_setupListeners(){this.startBtn.addEventListener(`click`,()=>this.pomodoroModel.start()),this.pauseBtn.addEventListener(`click`,()=>this.pomodoroModel.pause()),this.resetBtn.addEventListener(`click`,()=>this.pomodoroModel.reset()),this.soundSelect.addEventListener(`change`,()=>{this._loadSelectedAmbientSound();let e=this.pomodoroModel.getState();this._handleAmbientPlayback(e)}),this.volumeSlider.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);this.ambientAudio.volume=t})}_updateUI(e){if(!this.timeText)return;let t=Math.floor(e.secondsLeft/60),n=e.secondsLeft%60;this.timeText.textContent=`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`,this.sessionTypeBadge&&(this.sessionTypeBadge.textContent=e.sessionType.toUpperCase(),this.sessionTypeBadge.className=`session-badge ${e.sessionType}`),this._drawProgressRing(e.secondsLeft,e.duration,e.sessionType)}_updateButtons(e){!this.startBtn||!this.pauseBtn||(e.isRunning?(this.startBtn.disabled=!0,this.pauseBtn.disabled=!1):(this.startBtn.disabled=!1,this.pauseBtn.disabled=!0))}_drawProgressRing(e,t,n){if(!this.canvas)return;let r=this.canvas.getContext(`2d`),i=this.canvas.width,a=i/2-20,o=i/2;r.clearRect(0,0,i,i);let s=document.body.classList.contains(`dark-mode`),c=s?`rgba(255, 255, 255, 0.05)`:`rgba(0, 0, 0, 0.04)`,l=n===`work`?s?`#8f7eff`:`#6c5ce7`:s?`#4cd137`:`#00b894`;r.beginPath(),r.arc(o,o,a,0,Math.PI*2),r.lineWidth=16,r.strokeStyle=c,r.stroke();let u=t>0?(t-e)/t:0,d=-Math.PI/2,f=d+Math.PI*2*u;r.beginPath(),r.arc(o,o,a,d,f),r.lineWidth=16,r.strokeStyle=l,r.lineCap=`round`,r.shadowBlur=12,r.shadowColor=l,r.stroke(),r.shadowBlur=0}_handleAmbientPlayback(e){this.soundSelect&&(e.isRunning&&this.soundSelect.value!==`none`?(this.ambientAudio.src||this._loadSelectedAmbientSound(),this.ambientAudio.play().catch(e=>{console.warn(`Media play failed due to browser user-gesture requirements:`,e)})):this.ambientAudio.pause())}_loadSelectedAmbientSound(){if(!this.soundSelect)return;let e=this.soundSelect.value;if(this.ambientAudio.pause(),e===`none`){this.ambientAudio.removeAttribute(`src`);return}let t;if(e===`synth-noise`?t=this._createSyntheticNoiseBlob(`white`):e===`synth-rain`?t=this._createSyntheticNoiseBlob(`pink`):e===`synth-waves`&&(t=this._createSyntheticNoiseBlob(`brown`)),t){let e=URL.createObjectURL(t);this.ambientAudio.src=e,this.ambientAudio.volume=parseFloat(this.volumeSlider.value)}}_playAlarm(){this.alarmAudio.play().catch(e=>console.warn(`Alarm failed to play:`,e))}_createSyntheticNoiseBlob(e){let t=44100,n=t*4,r=new Float32Array(n),i=0;for(let t=0;t<n;t++){let n=Math.random()*2-1;e===`white`?r[t]=n:e===`pink`?(r[t]=(i+.02*n)/1.02,i=r[t],r[t]*=3.5):e===`brown`&&(r[t]=(i+.05*n)/1.05,i=r[t],r[t]*=3.5)}let a=new ArrayBuffer(44+n*2),o=new DataView(a);this._writeString(o,0,`RIFF`),o.setUint32(4,36+n*2,!0),this._writeString(o,8,`WAVE`),this._writeString(o,12,`fmt `),o.setUint32(16,16,!0),o.setUint16(20,1,!0),o.setUint16(22,1,!0),o.setUint32(24,t,!0),o.setUint32(28,t*2,!0),o.setUint16(32,2,!0),o.setUint16(34,16,!0),this._writeString(o,36,`data`),o.setUint32(40,n*2,!0);let s=44;for(let e=0;e<n;e++){let t=Math.max(-1,Math.min(1,r[e]));o.setInt16(s,t<0?t*32768:t*32767,!0),s+=2}return new Blob([a],{type:`audio/wav`})}_generateSyntheticAlarm(){let e=44100,t=e*1,n=new Float32Array(t);for(let r=0;r<t;r++){let t=r/e,i=Math.exp(-4*t),a=t>.15?Math.exp(-4*(t-.15)):0;n[r]=Math.sin(2*Math.PI*880*t)*i*.4+Math.sin(2*Math.PI*1200*t)*a*.4}let r=new ArrayBuffer(44+t*2),i=new DataView(r);this._writeString(i,0,`RIFF`),i.setUint32(4,36+t*2,!0),this._writeString(i,8,`WAVE`),this._writeString(i,12,`fmt `),i.setUint32(16,16,!0),i.setUint16(20,1,!0),i.setUint16(22,1,!0),i.setUint32(24,e,!0),i.setUint32(28,e*2,!0),i.setUint16(32,2,!0),i.setUint16(34,16,!0),this._writeString(i,36,`data`),i.setUint32(40,t*2,!0);let a=44;for(let e=0;e<t;e++){let t=Math.max(-1,Math.min(1,n[e]));i.setInt16(a,t<0?t*32768:t*32767,!0),a+=2}let o=new Blob([r],{type:`audio/wav`});this.alarmAudio.src=URL.createObjectURL(o)}_writeString(e,t,n){for(let r=0;r<n.length;r++)e.setUint8(t+r,n.charCodeAt(r))}},It=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:`open`}),this.task=null,this.onSubmitCallback=null,this.tempAttachments=[],this.tempLocation=null,this.weatherForecasts=[{icon:`☀️`,temp:`22°C`,text:`Sunny focus weather`},{icon:`🌤️`,temp:`19°C`,text:`Partly Cloudy`},{icon:`☁️`,temp:`16°C`,text:`Overcast skies`},{icon:`🌧️`,temp:`13°C`,text:`Rainy study day`},{icon:`🍃`,temp:`20°C`,text:`Pleasant Breeze`}]}connectedCallback(){this.render()}open(e=null,t=null){this.task=e,this.onSubmitCallback=t,this.tempAttachments=e?[...e.attachments||[]]:[],this.tempLocation=e?e.location:null,this.render(),this.shadowRoot.querySelector(`.modal-overlay`).classList.add(`open`),this.setAttribute(`aria-hidden`,`false`),setTimeout(()=>{let e=this.shadowRoot.querySelector(`#task-title`);e&&e.focus()},50),this._setupListeners(),this._setupDragAndDrop()}close(){let e=this.shadowRoot.querySelector(`.modal-overlay`);e&&e.classList.remove(`open`),this.setAttribute(`aria-hidden`,`true`),this.task=null,this.onSubmitCallback=null,this.tempAttachments=[],this.tempLocation=null}render(){let e=!!this.task,t=e?`Edit Task Details`:`Add New Task`,n=this.task?this.task.title:``,r=this.task?this.task.notes:``,i=this.task?this.task.quadrant:4,a=this.task?this.task.priority:`medium`,o=this.task?this.task.dueDate:``,s=this.task&&Array.isArray(this.task.tags)?this.task.tags.join(`, `):``,c=this._getMockWeather(this.tempLocation);this.shadowRoot.innerHTML=`
            <style>
                :host {
                    --primary-color: #6c5ce7;
                    --primary-glow: rgba(108, 92, 231, 0.3);
                    --text-main: #2d3436;
                    --text-muted: #636e72;
                    --border-color: rgba(0, 0, 0, 0.1);
                    --panel-bg: #ffffff;
                    --border-radius: 16px;
                    --warning-color: #fbc531;
                }

                /* Dark mode context matching body class */
                :host-context(.dark-mode) {
                    --text-main: #f5f6fa;
                    --text-muted: #a4b0be;
                    --border-color: rgba(255, 255, 255, 0.1);
                    --panel-bg: #1e1e2f;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 99999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .modal-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                /* 3D Card Flip Box Container */
                .flip-container {
                    width: 500px;
                    height: 600px;
                    perspective: 1500px;
                }

                .flip-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .flip-container.flipped .flip-inner {
                    transform: rotateY(180deg);
                }

                .card-front, .card-back {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    border-radius: var(--border-radius);
                    background: var(--panel-bg);
                    color: var(--text-main);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    padding: 26px;
                    box-sizing: border-box;
                    overflow-y: auto;
                    transition: border-color 0.2s, background-color 0.2s;
                }

                /* Drag & Drop Upload glows */
                .card-front.drag-over {
                    border: 2px dashed var(--primary-color) !important;
                    background: rgba(108, 92, 231, 0.05) !important;
                }

                .card-back {
                    transform: rotateY(180deg);
                    background: linear-gradient(135deg, rgba(108, 92, 231, 0.04) 0%, rgba(0,0,0,0) 100%), var(--panel-bg);
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 12px;
                }

                .header h3 {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                }

                .flip-trigger {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    transition: all 0.2s;
                }

                .flip-trigger:hover {
                    color: var(--primary-color);
                    border-color: var(--primary-color);
                    background: rgba(108, 92, 231, 0.05);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 10px;
                }

                .form-group label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .form-group input, .form-group textarea, .form-group select {
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: rgba(0,0,0,0.02);
                    color: var(--text-main);
                    font-family: inherit;
                    font-size: 0.95rem;
                    outline: none;
                }

                .form-group textarea {
                    resize: none;
                    height: 54px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .widget-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    border: 1px dashed var(--border-color);
                    border-radius: 8px;
                    margin-bottom: 10px;
                }

                .widget-info {
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .widget-btn {
                    padding: 6px 12px;
                    border: 1px solid var(--border-color);
                    background: rgba(0,0,0,0.02);
                    color: var(--text-main);
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .widget-btn:hover {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .attachments-preview {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 4px;
                    margin-bottom: 8px;
                }

                .attachment-thumb {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }

                .attachment-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .attachment-thumb .remove-attachment {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 14px;
                    height: 14px;
                    font-size: 8px;
                    cursor: pointer;
                    display: grid;
                    place-content: center;
                }

                .footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    border-top: 1px solid var(--border-color);
                    padding-top: 14px;
                }

                .footer button {
                    padding: 10px 18px;
                    font-family: inherit;
                    font-weight: 600;
                    border-radius: 8px;
                    cursor: pointer;
                    border: none;
                }

                .cancel-btn {
                    background: transparent;
                    color: var(--text-muted);
                    border: 1px solid var(--border-color) !important;
                }

                .submit-btn {
                    background: var(--primary-color);
                    color: white;
                }

                .submit-btn:hover { background: #5b4bc4; }

                /* Back Side Metadata widgets */
                .metadata-title {
                    font-weight: 700;
                    color: var(--primary-color);
                }

                .metadata-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 8px;
                }

                .metadata-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .metadata-value {
                    font-size: 0.95rem;
                    font-weight: 500;
                }

                .map-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.85rem;
                    margin-top: 4px;
                }

                .map-link:hover { text-decoration: underline; }

                /* Weather Badge layout (Fulfills weather mashup) */
                .weather-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    background: rgba(9, 132, 227, 0.08);
                    border: 1px solid rgba(9, 132, 227, 0.15);
                    border-radius: 8px;
                    margin-top: 8px;
                    color: var(--text-main);
                }

                .weather-icon { font-size: 1.4rem; }
                .weather-temp { font-weight: 700; font-size: 0.95rem; }
                .weather-text { font-size: 0.8rem; color: var(--text-muted); }
            </style>
            
            <div class="modal-overlay">
                <div class="flip-container">
                    <div class="flip-inner">
                        
                        <!-- FRONT CARD (Add / Edit Form) -->
                        <form id="task-form" class="card-front" novalidate>
                            <div class="header">
                                <h3>${t}</h3>
                                <button type="button" class="flip-trigger" id="flip-to-back" title="Show Detailed Metadata">
                                    🎴 Detailed Info
                                </button>
                            </div>

                            <div class="form-group">
                                <label for="task-title">Task Title *</label>
                                <input type="text" id="task-title" placeholder="What needs to be done?" required value="${n}" />
                            </div>

                            <div class="form-group">
                                <label for="task-notes">Description Notes</label>
                                <textarea id="task-notes" placeholder="Add descriptive notes...">${r}</textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="task-priority">Priority</label>
                                    <select id="task-priority">
                                        <option value="low" ${a===`low`?`selected`:``}>Low</option>
                                        <option value="medium" ${a===`medium`?`selected`:``}>Medium</option>
                                        <option value="high" ${a===`high`?`selected`:``}>High</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="task-quadrant">Eisenhower Quadrant</label>
                                    <select id="task-quadrant">
                                        <option value="1" ${i===1?`selected`:``}>Q1: Urgent & Important</option>
                                        <option value="2" ${i===2?`selected`:``}>Q2: Important & Not Urgent</option>
                                        <option value="3" ${i===3?`selected`:``}>Q3: Urgent & Not Important</option>
                                        <option value="4" ${i===4?`selected`:``}>Q4: Not Urgent & Not Important</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Tags Input field -->
                            <div class="form-group">
                                <label for="task-tags">Tags (comma-separated)</label>
                                <input type="text" id="task-tags" placeholder="e.g. study, life, work" value="${s}" />
                            </div>

                            <div class="form-group">
                                <label for="task-duedate">Due Date</label>
                                <input type="date" id="task-duedate" value="${o}" />
                            </div>

                            <!-- File Attachments Section (File API) -->
                            <div class="widget-section" id="drag-drop-zone">
                                <div class="widget-info" id="file-widget-text">
                                    Attachments (${this.tempAttachments.length})
                                </div>
                                <button type="button" class="widget-btn" id="attach-file-btn">Upload / Drop Image</button>
                                <input type="file" id="task-file-input" accept="image/*" style="display: none;" />
                            </div>
                            <div class="attachments-preview" id="attachments-container"></div>

                            <!-- Geolocation Tagging Section (Geolocation API) -->
                            <div class="widget-section">
                                <div class="widget-info" id="location-widget-text">
                                    ${this.tempLocation?`📍 Location Tagged`:`Location Not Set`}
                                </div>
                                <button type="button" class="widget-btn" id="location-btn">
                                    ${this.tempLocation?`Update Location`:`Tag Location`}
                                </button>
                            </div>

                            <div class="footer">
                                <button type="button" class="cancel-btn" id="close-modal-btn">Cancel</button>
                                <button type="submit" class="submit-btn">${e?`Save Changes`:`Create Task`}</button>
                            </div>
                        </form>

                        <!-- BACK CARD (Detailed Metadata View & 3D Flip) -->
                        <div class="card-back">
                            <div class="header">
                                <h3 class="metadata-title">Detailed Metadata</h3>
                                <button type="button" class="flip-trigger" id="flip-to-front" title="Back to Edit">
                                    ✏️ Form Editor
                                </button>
                            </div>

                            <div class="metadata-item">
                                <span class="metadata-label">Task Status</span>
                                <span class="metadata-value">${e&&this.task.completed?`🟢 Completed`:`🔴 Active`}</span>
                            </div>

                            <div class="metadata-item">
                                <span class="metadata-label">Created Timestamp</span>
                                <span class="metadata-value">${e?new Date(this.task.createdAt).toLocaleString():`Saving soon...`}</span>
                            </div>

                            <div class="metadata-item">
                                <span class="metadata-label">Geographic Coordinates</span>
                                <span class="metadata-value" id="meta-coords">
                                    ${this.tempLocation?`Lat: ${this.tempLocation.latitude.toFixed(6)}, Lng: ${this.tempLocation.longitude.toFixed(6)}`:`No coordinates tagged.`}
                                </span>
                                ${this.tempLocation?`
                                    <a class="map-link" href="https://www.google.com/maps/search/?api=1&query=${this.tempLocation.latitude},${this.tempLocation.longitude}" target="_blank">
                                        🌐 View on Google Maps
                                    </a>
                                `:``}

                                <!-- Integrated Geolocation Weather Forecast -->
                                ${c?`
                                    <div class="weather-card">
                                        <span class="weather-icon">${c.icon}</span>
                                        <div>
                                            <div class="weather-temp">${c.temp}</div>
                                            <div class="weather-text">${c.text}</div>
                                        </div>
                                    </div>
                                `:``}
                            </div>

                            <div class="metadata-item" style="border-bottom: none; flex-grow: 1;">
                                <span class="metadata-label">Attached Images Preview</span>
                                <div class="attachments-preview" id="meta-attachments" style="margin-top: 10px;">
                                    ${this.tempAttachments.length===0?`<span style="font-size:0.9rem; color:var(--text-muted);">No images attached.</span>`:``}
                                </div>
                            </div>

                            <div class="footer">
                                <button type="button" class="cancel-btn" id="close-modal-back-btn">Close Info</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `,this._renderTempAttachments()}_renderTempAttachments(){let e=this.shadowRoot.querySelector(`#attachments-container`),t=this.shadowRoot.querySelector(`#meta-attachments`);e&&(e.innerHTML=``,t&&this.tempAttachments.length>0&&(t.innerHTML=``),this.tempAttachments.forEach((n,r)=>{let i=document.createElement(`div`);if(i.className=`attachment-thumb`,i.innerHTML=`
                <img src="${n.data}" alt="${n.name}" />
                <button type="button" class="remove-attachment" data-idx="${r}">×</button>
            `,e.appendChild(i),t){let e=document.createElement(`div`);e.className=`attachment-thumb`,e.style.width=`70px`,e.style.height=`70px`,e.innerHTML=`
                    <a href="${n.data}" target="_blank" title="View Full Size">
                        <img src="${n.data}" alt="${n.name}" />
                    </a>
                `,t.appendChild(e)}}))}_getMockWeather(e){if(!e)return null;let t=Math.floor(Math.abs(e.latitude+e.longitude)*100)%this.weatherForecasts.length;return this.weatherForecasts[t]}_handleFile(e){if(!e.type.startsWith(`image/`)){c(`Attachment Error`,`Only image attachments are allowed.`);return}if(e.size>500*1024){c(`File Too Large`,`For LocalStorage stability, image attachments are capped at 500KB per file.`);return}let t=new FileReader;t.onload=t=>{this.tempAttachments.push({name:e.name,type:e.type,data:t.target.result});let n=this.shadowRoot.querySelector(`#file-widget-text`);n&&(n.textContent=`Attachments (${this.tempAttachments.length})`),this._renderTempAttachments()},t.readAsDataURL(e)}_setupDragAndDrop(){let e=this.shadowRoot.querySelector(`.card-front`);[`dragenter`,`dragover`].forEach(t=>{e.addEventListener(t,t=>{t.preventDefault(),t.stopPropagation(),e.classList.add(`drag-over`)},!1)}),[`dragleave`,`drop`].forEach(t=>{e.addEventListener(t,t=>{t.preventDefault(),t.stopPropagation(),e.classList.remove(`drag-over`)},!1)}),e.addEventListener(`drop`,e=>{let t=e.dataTransfer.files;t&&t.length>0&&Array.from(t).forEach(e=>this._handleFile(e))},!1)}_setupListeners(){let e=this.shadowRoot,t=e.querySelector(`#task-form`),n=e.querySelector(`.modal-overlay`),r=e.querySelector(`.flip-container`);e.querySelector(`#close-modal-btn`).addEventListener(`click`,()=>this.close()),e.querySelector(`#close-modal-back-btn`).addEventListener(`click`,()=>this.close()),e.querySelector(`#flip-to-back`).addEventListener(`click`,()=>{r.classList.add(`flipped`)}),e.querySelector(`#flip-to-front`).addEventListener(`click`,()=>{r.classList.remove(`flipped`)}),n.addEventListener(`click`,e=>{e.target===n&&this.close()});let i=e.querySelector(`#task-file-input`);e.querySelector(`#attach-file-btn`).addEventListener(`click`,()=>{i.click()}),i.addEventListener(`change`,e=>{let t=e.target.files[0];t&&this._handleFile(t)}),e.querySelector(`#attachments-container`).addEventListener(`click`,t=>{if(t.target.classList.contains(`remove-attachment`)){let n=parseInt(t.target.getAttribute(`data-idx`));this.tempAttachments.splice(n,1),e.querySelector(`#file-widget-text`).textContent=`Attachments (${this.tempAttachments.length})`,this._renderTempAttachments()}});let a=e.querySelector(`#location-btn`),o=e.querySelector(`#location-widget-text`);a.addEventListener(`click`,()=>{if(!navigator.geolocation){c(`Geolocation Error`,`Geolocation is not supported.`);return}o.textContent=`🔄 Querying position...`,navigator.geolocation.getCurrentPosition(e=>{this.tempLocation={latitude:e.coords.latitude,longitude:e.coords.longitude},o.textContent=`📍 Location Tagged`,a.textContent=`Update Location`,this.render(),this._setupListeners(),this._setupDragAndDrop(),r.classList.add(`flipped`)},e=>{console.error(`Geolocation error:`,e),o.textContent=`❌ Tag failed`,c(`Geolocation Error`,`Failed: ${e.message}`)},{enableHighAccuracy:!0,timeout:8e3})}),t.addEventListener(`submit`,t=>{t.preventDefault();let n=e.querySelector(`#task-title`);if(!n.value||n.value.trim()===``){n.style.borderColor=`#d63031`,c(`Validation Error`,`Task title is required.`);return}let r=e.querySelector(`#task-tags`).value.split(`,`).map(e=>e.trim().toLowerCase()).filter(e=>e!==``),i={title:n.value.trim(),notes:e.querySelector(`#task-notes`).value.trim(),priority:e.querySelector(`#task-priority`).value,quadrant:parseInt(e.querySelector(`#task-quadrant`).value),dueDate:e.querySelector(`#task-duedate`).value,attachments:this.tempAttachments,location:this.tempLocation,tags:r};this.onSubmitCallback&&this.onSubmitCallback(i),this.close()})}};customElements.get(`task-modal`)||customElements.define(`task-modal`,It);var Lt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:`open`}),this.activeTab=`profile`,this.deferredPrompt=null,this.profile=this._loadProfile()}connectedCallback(){this.render(),this._applyTheme(this.profile.theme),this._setupPWAInstaller()}open(){this.render(),this.shadowRoot.querySelector(`.modal-overlay`).classList.add(`open`),this.setAttribute(`aria-hidden`,`false`),this._setupListeners()}close(){let e=this.shadowRoot.querySelector(`.modal-overlay`);e&&e.classList.remove(`open`),this.setAttribute(`aria-hidden`,`true`)}setDeferredPrompt(e){this.deferredPrompt=e,this.activeTab===`system`&&(this.render(),this._setupListeners())}_loadProfile(){try{let e=localStorage.getItem(`todozen_current_user`),t=e?`todozen_profile_${e}`:`todozen_profile`,n=localStorage.getItem(t);if(n)return JSON.parse(n)}catch(e){console.error(`Error loading settings profile:`,e)}let e=localStorage.getItem(`todozen_current_user`)||`anonymous`;return{username:e===`teacher`?`KAJ Grading Teacher`:e,avatar:``,premium:!0,theme:`classic-light`,pomodoroWork:25,pomodoroBreak:5}}_saveProfile(){try{let e=localStorage.getItem(`todozen_current_user`),t=e?`todozen_profile_${e}`:`todozen_profile`;localStorage.setItem(t,JSON.stringify(this.profile)),this._applyTheme(this.profile.theme),this.dispatchEvent(new CustomEvent(`settingsChanged`,{detail:this.profile,bubbles:!0,composed:!0}))}catch(e){console.error(`Error saving settings profile:`,e)}}_applyTheme(e){document.body.classList.remove(`theme-classic-light`,`theme-deep-dark`,`theme-cyber-neon`,`theme-frosted-blue`),document.body.classList.add(`theme-${e}`),e===`deep-dark`||e===`cyber-neon`?document.body.classList.replace(`light-mode`,`dark-mode`):document.body.classList.replace(`dark-mode`,`light-mode`)}_setupPWAInstaller(){window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),this.deferredPrompt=e,this.activeTab===`system`&&(this.render(),this._setupListeners())})}render(){let e=this.profile,t=e.avatar||`https://img.icons8.com/color/96/000000/circled-user-male-skin-type-1-2.png`,n=this.getAttribute(`aria-hidden`)===`false`;this.shadowRoot.innerHTML=`
            <style>
                :host {
                    --primary-color: #6c5ce7;
                    --text-main: #2d3436;
                    --text-muted: #636e72;
                    --border-color: rgba(0, 0, 0, 0.1);
                    --panel-bg: #ffffff;
                    --border-radius: 16px;
                }

                :host-context(.dark-mode) {
                    --text-main: #f5f6fa;
                    --text-muted: #a4b0be;
                    --border-color: rgba(255, 255, 255, 0.1);
                    --panel-bg: #1e1e2f;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 99999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .modal-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                .settings-card {
                    width: 680px;
                    height: 520px;
                    background: var(--panel-bg);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                    display: flex;
                    overflow: hidden;
                }

                /* Left Tabs Sidebar */
                .settings-sidebar {
                    width: 200px;
                    background: rgba(0, 0, 0, 0.02);
                    border-right: 1px solid var(--border-color);
                    padding: 24px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sidebar-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 20px;
                    padding-left: 8px;
                }

                .tab-btn {
                    width: 100%;
                    padding: 10px 14px;
                    border: none;
                    background: transparent;
                    color: var(--text-main);
                    font-family: inherit;
                    font-weight: 600;
                    text-align: left;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }

                .tab-btn:hover {
                    background: rgba(0,0,0,0.04);
                }

                .tab-btn.active {
                    background: var(--primary-color);
                    color: white;
                }

                /* Right Content Area */
                .settings-content {
                    flex: 1;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }

                .tab-pane {
                    display: none;
                    flex-direction: column;
                    gap: 18px;
                    height: 100%;
                }

                .tab-pane.active {
                    display: flex;
                }

                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 14px;
                    margin-bottom: 8px;
                }

                .content-header h3 {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1.3rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: rgba(0,0,0,0.05);
                    color: #d63031;
                }

                /* Input Elements styling */
                .setting-row {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .setting-row label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .setting-row input[type="text"], .setting-row select {
                    padding: 10px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    color: var(--text-main);
                    font-family: inherit;
                    font-size: 0.95rem;
                    outline: none;
                }

                .avatar-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 10px;
                }

                .avatar-preview {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid var(--primary-color);
                    position: relative;
                }

                .avatar-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .upload-btn {
                    padding: 8px 16px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .upload-btn:hover {
                    background: #5b4bc4;
                }

                .checkbox-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                }

                .checkbox-row input {
                    width: 18px;
                    height: 18px;
                    accent-color: var(--primary-color);
                    cursor: pointer;
                }

                /* Themes Grid Layout */
                .themes-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .theme-card {
                    padding: 16px;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .theme-card.active {
                    border-color: var(--primary-color);
                    background: rgba(108, 92, 231, 0.05);
                }

                .theme-preview-colors {
                    display: flex;
                    gap: 6px;
                    margin-top: 4px;
                }

                .preview-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                }

                /* Shortcuts Table layout */
                .shortcuts-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .shortcuts-table th, .shortcuts-table td {
                    padding: 8px 12px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }

                .shortcuts-table th {
                    font-weight: 700;
                    color: var(--text-muted);
                }

                .shortcut-key {
                    background: rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border-color);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-weight: bold;
                }

                /* Action Footer */
                .settings-footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    border-top: 1px solid var(--border-color);
                    padding-top: 16px;
                }

                .btn-save {
                    padding: 10px 20px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .btn-save:hover { background: #5b4bc4; }

                .btn-danger {
                    padding: 10px 16px;
                    background: #d63031;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .btn-danger:hover { background: #b82324; }

                .btn-pwa {
                    padding: 10px 16px;
                    background: #00b894;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }
                .btn-pwa:hover:not(:disabled) { background: #009678; }
                .btn-pwa:disabled {
                    background: var(--border-color);
                    color: var(--text-muted);
                    cursor: not-allowed;
                    opacity: 0.6;
                }


                .slider-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .slider-group input {
                    flex: 1;
                    accent-color: var(--primary-color);
                }
            </style>
            
            <div class="modal-overlay ${n?`open`:``}">
                <div class="settings-card">
                    
                    <!-- Left Sidebar Menu -->
                    <aside class="settings-sidebar">
                        <div class="sidebar-title">Settings</div>
                        <button class="tab-btn ${this.activeTab===`profile`?`active`:``}" data-tab="profile">
                            👤 Profile
                        </button>
                        <button class="tab-btn ${this.activeTab===`themes`?`active`:``}" data-tab="themes">
                            🎨 Themes
                        </button>
                        <button class="tab-btn ${this.activeTab===`focus`?`active`:``}" data-tab="focus">
                            ⏱️ Focus Settings
                        </button>
                        <button class="tab-btn ${this.activeTab===`shortcuts`?`active`:``}" data-tab="shortcuts">
                            ⌨️ Shortcuts
                        </button>
                        <button class="tab-btn ${this.activeTab===`system`?`active`:``}" data-tab="system">
                            ⚙️ System
                        </button>
                    </aside>

                    <!-- Right Pane View Container -->
                    <main class="settings-content">
                        <div class="content-header">
                            <h3>${this._getTabTitle()}</h3>
                            <button type="button" class="close-btn" id="close-settings-btn" title="Close Settings">×</button>
                        </div>

                        <!-- PROFILE TAB -->
                        <section class="tab-pane ${this.activeTab===`profile`?`active`:``}" id="pane-profile">
                            <div class="avatar-section">
                                <div class="avatar-preview">
                                    <img src="${t}" id="avatar-img-preview" alt="User Profile Avatar" />
                                </div>
                                <button type="button" class="upload-btn" id="upload-avatar-btn">Upload Avatar Image</button>
                                <input type="file" id="settings-avatar-input" accept="image/*" style="display: none;" />
                            </div>

                            <div class="setting-row">
                                <label for="settings-username">Display Username</label>
                                <input type="text" id="settings-username" placeholder="Enter username..." value="${this._escapeHTML(e.username)}" />
                            </div>

                            <div class="checkbox-row" style="margin-top: 10px;">
                                <input type="checkbox" id="settings-premium" ${e.premium?`checked`:``} />
                                <label for="settings-premium">🏅 Gold Premium Account Badge</label>
                            </div>

                            <div class="settings-footer">
                                <button type="button" class="btn-save" id="save-profile-btn">Apply Settings</button>
                            </div>
                        </section>

                        <!-- THEMES TAB -->
                        <section class="tab-pane ${this.activeTab===`themes`?`active`:``}" id="pane-themes">
                            <div class="themes-grid">
                                <div class="theme-card ${e.theme===`classic-light`?`active`:``}" data-theme="classic-light">
                                    <span>Classic Light</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#f5f7fb;"></div>
                                        <div class="preview-dot" style="background:#6c5ce7;"></div>
                                    </div>
                                </div>

                                <div class="theme-card ${e.theme===`deep-dark`?`active`:``}" data-theme="deep-dark">
                                    <span>Deep Dark</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#09090e;"></div>
                                        <div class="preview-dot" style="background:#8f7eff;"></div>
                                    </div>
                                </div>

                                <div class="theme-card ${e.theme===`cyber-neon`?`active`:``}" data-theme="cyber-neon">
                                    <span>Cyber Neon</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#0a0e17;"></div>
                                        <div class="preview-dot" style="background:#ff007f;"></div>
                                    </div>
                                </div>

                                <div class="theme-card ${e.theme===`frosted-blue`?`active`:``}" data-theme="frosted-blue">
                                    <span>Frosted Blue</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#ebf3fa;"></div>
                                        <div class="preview-dot" style="background:#0984e3;"></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- FOCUS TAB -->
                        <section class="tab-pane ${this.activeTab===`focus`?`active`:``}" id="pane-focus">
                            <div class="setting-row">
                                <label for="focus-work-slider">Pomodoro Focus Time: <span id="focus-work-value">${e.pomodoroWork}</span> mins</label>
                                <div class="slider-group">
                                    <input type="range" id="focus-work-slider" min="15" max="60" step="5" value="${e.pomodoroWork}" />
                                </div>
                            </div>

                            <div class="setting-row">
                                <label for="focus-break-slider">Break Time: <span id="focus-break-value">${e.pomodoroBreak}</span> mins</label>
                                <div class="slider-group">
                                    <input type="range" id="focus-break-slider" min="3" max="15" step="1" value="${e.pomodoroBreak}" />
                                </div>
                            </div>

                            <div class="settings-footer">
                                <button type="button" class="btn-save" id="save-focus-btn">Save Configurations</button>
                            </div>
                        </section>

                        <!-- SHORTCUTS TAB -->
                        <section class="tab-pane ${this.activeTab===`shortcuts`?`active`:``}" id="pane-shortcuts">
                            <table class="shortcuts-table">
                                <thead>
                                    <tr>
                                        <th>Hotkeys</th>
                                        <th>Target Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span class="shortcut-key">N</span></td>
                                        <td>Add new Focus / Task detail dialog popup</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">I</span></td>
                                        <td>Navigate to Inbox Workspace list</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">M</span></td>
                                        <td>Navigate to Eisenhower quadrant matrix</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">H</span></td>
                                        <td>Navigate to Habit checklist tracker dashboard</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">F</span></td>
                                        <td>Navigate to full-screen Pomodoro Focus space</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">S</span></td>
                                        <td>Toggle Profile settings menu</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">Space</span></td>
                                        <td>Start / Pause timer cycle inside Focus screen</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">Esc</span></td>
                                        <td>Close overlay dialogs / editors</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <!-- SYSTEM TAB -->
                        <section class="tab-pane ${this.activeTab===`system`?`active`:``}" id="pane-system">
                            <div class="setting-row">
                                <label>Install Mobile / Desktop App</label>
                                <p style="font-size:0.9rem; color:var(--text-muted);">Install TodoZen directly onto your desktop or mobile screen for offline standalone capabilities.</p>
                                <div style="margin-top:5px;">
                                    <button type="button" class="btn-pwa" id="pwa-install-btn" ${this.deferredPrompt?``:`disabled`}>
                                        ${this.deferredPrompt?`📲 Install App Standalone`:`📲 Standalone App Ready (Offline Shell)`}
                                    </button>
                                </div>
                            </div>

                            <div class="setting-row" style="margin-top:20px;">
                                <label>Log Out Session</label>
                                <p style="font-size:0.9rem; color:var(--text-muted);">Logout from current user account workspace. All local data is securely saved in your browser storage.</p>
                                <div style="margin-top:5px;">
                                    <button type="button" class="btn-save" id="logout-session-btn" style="background:var(--accent-color);">🔒 Log Out Account</button>
                                </div>
                            </div>

                            <div class="setting-row" style="margin-top:20px;">
                                <label>Factory Reset Storage</label>
                                <p style="font-size:0.9rem; color:var(--text-muted);">Permanently purge all lists, active/archived tasks, and calendar database check-ins.</p>
                                <div style="margin-top:5px;">
                                    <button type="button" class="btn-danger" id="factory-reset-btn">Purge Database forever</button>
                                </div>
                            </div>
                        </section>

                    </main>

                </div>
            </div>
        `}_getTabTitle(){switch(this.activeTab){case`profile`:return`User Profile Configurations`;case`themes`:return`Manage Color Themes`;case`focus`:return`Pomodoro Focus Cycles`;case`shortcuts`:return`Interactive Keyboard Shortcuts`;case`system`:return`System Settings`;default:return`Settings`}}_escapeHTML(e){return e?e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}_setupListeners(){let e=this.shadowRoot;if(e.querySelector(`#close-settings-btn`).addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),this.close()}),e.querySelector(`.modal-overlay`).addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation(),t.target===e.querySelector(`.modal-overlay`)&&this.close()}),e.querySelectorAll(`.tab-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation(),this.activeTab=e.getAttribute(`data-tab`),this.render(),this._setupListeners()})}),this.activeTab===`profile`){let t=e.querySelector(`#settings-avatar-input`);e.querySelector(`#upload-avatar-btn`).addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),t.click()}),t.addEventListener(`change`,t=>{let n=t.target.files[0];if(!n)return;if(!n.type.startsWith(`image/`)){c(`File Error`,`Only image avatars are allowed.`);return}let r=new FileReader;r.onload=t=>{this.profile.avatar=t.target.result,e.querySelector(`#avatar-img-preview`).src=t.target.result},r.readAsDataURL(n)}),e.querySelector(`#save-profile-btn`).addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation();let n=e.querySelector(`#settings-username`),r=e.querySelector(`#settings-premium`);if(!n.value.trim()){c(`Validation Error`,`Username cannot be empty.`);return}this.profile.username=n.value.trim(),this.profile.premium=r.checked,this._saveProfile(),this.close(),c(`Success`,`Profile updated successfully!`)})}if(this.activeTab===`themes`&&e.querySelectorAll(`.theme-card`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation();let n=e.getAttribute(`data-theme`);this.profile.theme=n,this._saveProfile(),this.render(),this._setupListeners()})}),this.activeTab===`focus`){let t=e.querySelector(`#focus-work-slider`),n=e.querySelector(`#focus-break-slider`),r=e.querySelector(`#focus-work-value`),i=e.querySelector(`#focus-break-value`);t.addEventListener(`input`,e=>{r.textContent=e.target.value}),n.addEventListener(`input`,e=>{i.textContent=e.target.value}),e.querySelector(`#save-focus-btn`).addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),this.profile.pomodoroWork=parseInt(t.value),this.profile.pomodoroBreak=parseInt(n.value),this._saveProfile(),this.close(),c(`Success`,`Focus timer cycles updated successfully!`)})}if(this.activeTab===`system`){let t=e.querySelector(`#pwa-install-btn`);t&&this.deferredPrompt&&t.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),t.disabled=!0,this.deferredPrompt.prompt(),this.deferredPrompt.userChoice.then(e=>{e.outcome===`accepted`?(console.log(`User accepted the PWA install prompt`),this.deferredPrompt=null,this.render(),this._setupListeners()):(console.log(`User dismissed the PWA install prompt`),t.disabled=!1)})});let n=e.querySelector(`#logout-session-btn`);n&&n.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),s(`Log Out`,`Are you sure you want to log out of your session?`).then(e=>{e&&(localStorage.removeItem(`todozen_current_user`),window.location.reload())})}),e.querySelector(`#factory-reset-btn`).addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),s(`Factory Reset`,`CRITICAL WARNING: This will permanently erase all data, lists, habits, and tasks from this application. This cannot be undone! Proceed?`).then(e=>{e&&(localStorage.clear(),window.location.reload())})})}}};customElements.get(`settings-modal`)||customElements.define(`settings-modal`,Lt);var Rt=class{constructor(){this.taskModel=new n,this.habitModel=new r,this.pomodoroModel=new i,this.routerViewContainer=document.getElementById(`router-view`),this.taskModalElement=document.getElementById(`task-detail-modal`),this.settingsModal=document.getElementById(`settings-modal`),this.currentView=null,this.currentListId=`inbox`,this.taskModel.on(`listsChanged`,e=>this._renderCustomLists(e)),this.taskModel.on(`listDeleted`,()=>{this._renderCustomLists(this.taskModel.getAllLists()),this._updateSmartListCounts()}),this.router=new a,this._setupRoutes(),this._setupConnectionMonitoring()}start(){if(!localStorage.getItem(`todozen_current_user`)){this._showLoginOverlay();return}let e=document.querySelector(`.app-container`);e&&(e.style.display=`grid`),this._renderCustomLists(this.taskModel.getAllLists()),this._renderTags(),this._renderFilters(),this._setupSidebarNav(),this._setupDesktopUIControls(),this._setupKeyboardShortcuts();let t=this.settingsModal.profile;this._updateProfileUI(t),this.pomodoroModel.configureDurations(t.pomodoroWork,t.pomodoroBreak),this.settingsModal.addEventListener(`settingsChanged`,e=>{this._updateProfileUI(e.detail),this.pomodoroModel.configureDurations(e.detail.pomodoroWork,e.detail.pomodoroBreak)});let n=()=>{this._updateSmartListCounts(),this._renderTags()};this.taskModel.on(`taskAdded`,n),this.taskModel.on(`taskUpdated`,n),this.taskModel.on(`taskDeleted`,n),this.taskModel.on(`listDeleted`,n),this.router.start(),n()}_showLoginOverlay(){let e=document.querySelector(`.app-container`);e&&(e.style.display=`none`);let t=JSON.parse(localStorage.getItem(`todozen_accounts`)||`[]`);t.some(e=>e.username===`teacher`)||(t.push({username:`teacher`,password:`kaj`}),localStorage.setItem(`todozen_accounts`,JSON.stringify(t)));let n=document.createElement(`div`);n.className=`login-overlay`,n.innerHTML=`
            <div class="login-card">
                <div class="login-brand">
                    <div class="brand-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;color:white;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1>TodoZen</h1>
                    <p>A premium task management & focus dashboard</p>
                </div>

                <div class="login-tabs">
                    <button type="button" class="login-tab-btn active" data-tab="login">Sign In</button>
                    <button type="button" class="login-tab-btn" data-tab="register">Sign Up</button>
                </div>

                <form class="login-form" id="login-auth-form">
                    <div class="login-row">
                        <label for="auth-username">Username</label>
                        <input type="text" id="auth-username" placeholder="Enter your username..." required autocomplete="off" />
                    </div>
                    
                    <div class="login-row">
                        <label for="auth-password">Password</label>
                        <input type="password" id="auth-password" placeholder="Enter your password..." required />
                    </div>

                    <button type="submit" class="btn-submit" id="auth-submit-btn">Sign In Account</button>
                </form>
            </div>
        `,document.body.appendChild(n);let r=`login`,i=n.querySelectorAll(`.login-tab-btn`),a=n.querySelector(`#auth-submit-btn`),o=n.querySelector(`#auth-username`),s=n.querySelector(`#auth-password`),l=n.querySelector(`#login-auth-form`);i.forEach(e=>{e.addEventListener(`click`,()=>{i.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),r=e.getAttribute(`data-tab`),r===`login`?a.textContent=`Sign In Account`:a.textContent=`Create Workspace`})}),l.addEventListener(`submit`,e=>{e.preventDefault();let t=o.value.trim().toLowerCase(),n=s.value;if(!t){c(`Validation Error`,`Username cannot be empty.`);return}if(n.length<3){c(`Validation Error`,`Password must be at least 3 characters.`);return}let i=JSON.parse(localStorage.getItem(`todozen_accounts`)||`[]`);if(r===`login`){let e=i.find(e=>e.username===t);e&&e.password===n?(localStorage.setItem(`todozen_current_user`,t),window.location.reload()):c(`Authentication Failed`,`Invalid username or password.`)}else i.some(e=>e.username===t)?c(`Registration Failed`,`This username is already registered. Please choose another.`):(i.push({username:t,password:n}),localStorage.setItem(`todozen_accounts`,JSON.stringify(i)),localStorage.setItem(`todozen_current_user`,t),window.location.reload())})}_setupRoutes(){this.router.addRoute(`/`,()=>{this._cleanupCurrentView(),this.currentView=new l(this.routerViewContainer,this.taskModel,this.taskModalElement,this.currentListId),this.currentView.render(),this._updateActiveNav(`/`)}),this.router.addRoute(`/focus`,()=>{this._cleanupCurrentView(),this.currentView=new Ft(this.routerViewContainer,this.pomodoroModel),this.currentView.render(),this._updateActiveNav(`/focus`)}),this.router.addRoute(`/matrix`,()=>{this._cleanupCurrentView(),this.currentView=new Mt(this.routerViewContainer,this.taskModel,this.taskModalElement),this.currentView.render(),this._updateActiveNav(`/matrix`)}),this.router.addRoute(`/habits`,()=>{this._cleanupCurrentView(),this.currentView=new Pt(this.routerViewContainer,this.habitModel),this.currentView.render(),this._updateActiveNav(`/habits`)})}_updateSmartListCounts(){let e=this.taskModel.getAllTasks().filter(e=>!e.completed&&!e.deleted),t=new Date().toLocaleDateString(`sv`),n=e.filter(e=>e.dueDate===t).length,r=new Date;r.setHours(0,0,0,0);let i=new Date;i.setDate(r.getDate()+7),i.setHours(23,59,59,999);let a=e.filter(e=>{if(!e.dueDate)return!1;let t=new Date(e.dueDate);return t>=r&&t<=i}).length,o=e.filter(e=>e.listId===`inbox`).length,s=document.getElementById(`count-today`),c=document.getElementById(`count-next-7-days`),l=document.getElementById(`count-inbox`);s&&(s.textContent=n>0?n:`0`),c&&(c.textContent=a>0?a:`0`),l&&(l.textContent=o>0?o:`0`)}_renderTags(){let e=document.getElementById(`tags-container`);if(!e)return;let t=this.taskModel.getAllTags();if(t.length===0){e.innerHTML=`<li style="padding: 10px 14px; font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No tags added</li>`;return}e.innerHTML=t.map(e=>`
            <li>
                <a href="#" data-tag-name="${e}" class="${this.currentListId===`tag-${e}`?`active`:``}">
                    <span class="list-icon">🏷️</span> #${e}
                </a>
            </li>
        `).join(``)}_renderFilters(){let e=document.getElementById(`filters-container`);e&&(e.innerHTML=[{id:`priority-high`,name:`High Priority`,icon:`🔥`},{id:`has-date`,name:`Has Due Date`,icon:`📅`},{id:`has-location`,name:`Has Location`,icon:`📍`},{id:`has-image`,name:`Has Images`,icon:`🖼️`}].map(e=>`
            <li>
                <a href="#" data-filter-id="${e.id}" class="${this.currentListId===`filter-${e.id}`?`active`:``}">
                    <span class="list-icon">${e.icon}</span> ${e.name}
                </a>
            </li>
        `).join(``))}_renderCustomLists(e){let t=document.getElementById(`custom-lists-container`);t&&(t.innerHTML=e.map(e=>`
            <li class="custom-list-item">
                <a href="#" data-list-id="${e.id}" class="${this.currentListId===e.id?`active`:``}">
                    <span class="list-icon">${e.icon||`📂`}</span>
                    <span class="list-name">${e.name}</span>
                </a>
                <button class="delete-list-btn" data-list-id="${e.id}" title="Delete List">×</button>
            </li>
        `).join(``))}_setupSidebarNav(){let e=document.querySelector(`.sidebar`);e&&e.addEventListener(`click`,e=>{let t=e.target.closest(`.delete-list-btn`);if(t){e.preventDefault(),e.stopPropagation();let n=t.getAttribute(`data-list-id`);s(`Delete List`,`Are you sure you want to delete this list and all its tasks?`).then(e=>{e&&(this.taskModel.deleteList(n),this.currentListId===n&&this._selectList(`inbox`))});return}let n=e.target.closest(`a[data-list-id]`);if(n){e.preventDefault();let t=n.getAttribute(`data-list-id`);this._selectList(t);return}let r=e.target.closest(`a[data-tag-name]`);if(r){e.preventDefault();let t=r.getAttribute(`data-tag-name`);this._selectList(`tag-${t}`);return}let i=e.target.closest(`a[data-filter-id]`);if(i){e.preventDefault();let t=i.getAttribute(`data-filter-id`);this._selectList(`filter-${t}`);return}});let t=document.getElementById(`add-list-btn`),n=document.getElementById(`create-list-form`),r=document.getElementById(`new-list-name`);t&&n&&(t.addEventListener(`click`,e=>{e.stopPropagation(),n.classList.toggle(`hidden`),n.classList.contains(`hidden`)||r.focus()}),n.addEventListener(`submit`,e=>{e.preventDefault();let t=r.value.trim();if(t)try{let e=this.taskModel.addList(t);r.value=``,n.classList.add(`hidden`),this._selectList(e.id)}catch(e){c(`Error Creating List`,e.message)}}),document.addEventListener(`click`,e=>{!n.contains(e.target)&&e.target!==t&&n.classList.add(`hidden`)}))}_setupDesktopUIControls(){document.getElementById(`sidebar-profile-btn`).addEventListener(`click`,()=>{this.settingsModal.open()}),document.getElementById(`sidebar-settings-btn`).addEventListener(`click`,()=>{this.settingsModal.open()});let e=document.getElementById(`sidebar-sync-btn`);e.addEventListener(`click`,()=>{e.classList.add(`rotating`);let t=document.getElementById(`connection-toast`);t.className=`toast-notification show online`,t.querySelector(`.toast-text`).textContent=`Synchronizing tasks and habits data with cloud...`,t.querySelector(`.toast-icon`).textContent=`🔄`,setTimeout(()=>{e.classList.remove(`rotating`),t.classList.remove(`show`)},1200)}),document.getElementById(`sidebar-bell-btn`).addEventListener(`click`,()=>{let e=this.taskModel.getAllTasks().filter(e=>!e.completed&&!e.deleted),t=new Date().toLocaleDateString(`sv`),n=e.filter(e=>e.dueDate===t),r=document.getElementById(`connection-toast`);r.className=`toast-notification show online`,r.querySelector(`.toast-icon`).textContent=`🔔`,n.length>0?r.querySelector(`.toast-text`).textContent=`Reminder: You have ${n.length} tasks scheduled for today!`:r.querySelector(`.toast-text`).textContent=`All clean! No scheduled tasks pending for today.`,setTimeout(()=>r.classList.remove(`show`),3500)})}_setupKeyboardShortcuts(){let e=(t=document)=>{let n=t.activeElement;return n?n.shadowRoot&&n.shadowRoot.activeElement?e(n.shadowRoot):n:null};document.addEventListener(`keydown`,t=>{let n=t.code,r=e();if(r){let e=r.tagName;if(e===`INPUT`||e===`TEXTAREA`||r.isContentEditable)return}let i=this.settingsModal&&this.settingsModal.getAttribute(`aria-hidden`)===`false`,a=this.taskModalElement&&this.taskModalElement.getAttribute(`aria-hidden`)===`false`,o=document.querySelector(`.custom-dialog-overlay`);if(!((i||a||o)&&n!==`Escape`))if(n===`KeyN`){t.preventDefault(),this.settingsModal.close();let e=`inbox`,n=``;this.currentListId!==`today`&&this.currentListId!==`next-7-days`&&this.currentListId!==`completed`&&this.currentListId!==`trash`&&(e=this.currentListId),this.currentListId===`today`&&(n=new Date().toLocaleDateString(`sv`)),this.taskModalElement.open(null,t=>{this.taskModel.addTask({...t,listId:e,dueDate:n})})}else n===`KeyI`?(t.preventDefault(),this._selectList(`inbox`)):n===`KeyM`?(t.preventDefault(),this.router.navigate(`/matrix`)):n===`KeyH`?(t.preventDefault(),this.router.navigate(`/habits`)):n===`KeyF`?(t.preventDefault(),this.router.navigate(`/focus`)):n===`KeyS`?(t.preventDefault(),this.settingsModal.open()):n===`Space`&&this.router.currentPath===`/focus`?(t.preventDefault(),this.pomodoroModel.getState().isRunning?this.pomodoroModel.pause():this.pomodoroModel.start()):n===`Escape`&&(this.settingsModal.close(),this.taskModalElement.close())})}_updateProfileUI(e){let t=document.getElementById(`sidebar-avatar-wrapper`),n=document.getElementById(`sidebar-avatar-fallback`),r=document.getElementById(`sidebar-premium-badge`);if(!t)return;e.premium?(r.style.display=`block`,t.style.borderColor=`var(--warning-color)`):(r.style.display=`none`,t.style.borderColor=`var(--primary-color)`);let i=t.querySelector(`.avatar-img-element`);e.avatar?(i||(i=document.createElement(`img`),i.className=`avatar-img-element`,t.appendChild(i)),i.src=e.avatar,n.style.display=`none`):(i&&i.remove(),n.style.display=`block`)}_selectList(e){this.currentListId=e,document.querySelectorAll(`.sidebar a[data-list-id], .sidebar a[data-tag-name], .sidebar a[data-filter-id]`).forEach(t=>{let n=t.getAttribute(`data-list-id`)===e,r=t.getAttribute(`data-tag-name`)&&`tag-${t.getAttribute(`data-tag-name`)}`===e,i=t.getAttribute(`data-filter-id`)&&`filter-${t.getAttribute(`data-filter-id`)}`===e;n||r||i?t.classList.add(`active`):t.classList.remove(`active`)}),this.router.currentPath===`/`?this.currentView&&typeof this.currentView.setList==`function`&&this.currentView.setList(e):this.router.navigate(`/`)}_cleanupCurrentView(){this.currentView&&=(this.currentView.destroy(),null),this.taskModalElement&&this.taskModalElement.close()}_updateActiveNav(e){document.querySelectorAll(`#mini-nav a`).forEach(t=>{t.getAttribute(`data-route`)===e?t.classList.add(`active`):t.classList.remove(`active`)})}_setupConnectionMonitoring(){let e=document.getElementById(`connection-toast`),t=e.querySelector(`.toast-text`),n=e.querySelector(`.toast-icon`),r=(r,i)=>{e.className=`toast-notification show ${r}`,t.textContent=i,n.textContent=r===`online`?`⚡️`:`⚠️`,setTimeout(()=>{e.classList.remove(`show`)},4e3)};window.addEventListener(`online`,()=>{r(`online`,`Connection Restored! Data synchronized offline.`)}),window.addEventListener(`offline`,()=>{r(`offline`,`You are offline. Running on local cache.`)}),navigator.onLine||setTimeout(()=>r(`offline`,`Starting in offline mode.`),500)}};document.addEventListener(`DOMContentLoaded`,()=>{console.log(`TodoZen Premium Suite Initializing...`),(()=>{let e=localStorage.getItem(`todozen_profile`),t=`classic-light`;if(e)try{t=JSON.parse(e).theme||`classic-light`}catch(e){console.warn(`Could not parse profile theme settings:`,e)}document.body.classList.remove(`theme-classic-light`,`theme-deep-dark`,`theme-cyber-neon`,`theme-frosted-blue`),document.body.classList.add(`theme-${t}`),t===`deep-dark`||t===`cyber-neon`?document.body.classList.replace(`light-mode`,`dark-mode`):document.body.classList.replace(`dark-mode`,`light-mode`)})(),(()=>{if(`serviceWorker`in navigator){if(window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`){navigator.serviceWorker.getRegistrations().then(e=>{for(let t of e)t.unregister(),console.log(`Unregistered active Service Worker on localhost for maximum dev performance.`)});return}window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/kaj-todo/service-worker.js`).then(e=>{console.log(`TodoZen Service Worker registered with scope:`,e.scope)}).catch(e=>{console.error(`TodoZen Service Worker registration failed:`,e)})})}})(),new Rt().start()});