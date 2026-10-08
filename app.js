/**
 * WP - Wisdom pro — Enhanced Cominvi Motion Engine
 * Motion, Cursor Physics, Counter Animation & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCustomCursor();
  initScrollEffects();
  initStatsCounter();
  initRevealAnimations();
  initPillarModals();
  initModulesManager();
  initGalleryLightbox();
  initSearchSpotlight();
  initContactForm();
  initQuickActions();
  initQuoteGenerator();
  initReferenceComparison();
  initCard3DTilt();
  init3DWorkstationControls();
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode with LocalStorage)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  
  const savedTheme = localStorage.getItem('campuslearn-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    if (themeIconSun) themeIconSun.classList.remove('hidden');
    if (themeIconMoon) themeIconMoon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    if (themeIconSun) themeIconSun.classList.add('hidden');
    if (themeIconMoon) themeIconMoon.classList.remove('hidden');
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('campuslearn-theme', isDark ? 'dark' : 'light');
      
      if (themeIconSun && themeIconMoon) {
        themeIconSun.classList.toggle('hidden', !isDark);
        themeIconMoon.classList.toggle('hidden', isDark);
      }
      
      showToast(isDark ? '🌙 Dark mode activated' : '☀️ Light mode activated');
      if (window.WisdomPro3D && typeof window.WisdomPro3D.updateTheme === 'function') {
        window.WisdomPro3D.updateTheme(isDark ? 'dark' : 'light');
      }
    });
  }
}

/* ==========================================================================
   2. Cominvi Smooth Custom Cursor with Magnetic Physics
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const dot = document.getElementById('custom-cursor-dot');
  if (!cursor || !dot) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  }, { passive: true });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover detection for interactive targets
  const interactiveSelectors = 'a, button, input, textarea, [data-pillar], [data-gallery-idx], .module-table-row, .cominvi-card';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });
}

/* ==========================================================================
   3. Scroll Effects & Progress Bar (Cominvi-style)
   ========================================================================== */
function initScrollEffects() {
  const progressBar = document.getElementById('scroll-progress');
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }
    
    if (header) {
      if (scrollTop > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, { passive: true });
}

/* ==========================================================================
   4. Animated Stats Counter (Cominvi-style)
   ========================================================================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-count');
  let animated = false;

  function runCounters() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10) || 0;
      const duration = 1400;
      const startTime = performance.now();

      function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);
        
        stat.textContent = target >= 1000 ? current.toLocaleString() + '+' : current;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          stat.textContent = target >= 1000 ? target.toLocaleString() + '+' : target;
        }
      }
      requestAnimationFrame(updateNumber);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        runCounters();
      }
    });
  }, { threshold: 0.25 });

  const statsSection = document.getElementById('stats-bar');
  if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   5. Viewport Scroll-Driven Reveals (IntersectionObserver)
   ========================================================================== */
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });
    
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }
}

/* ==========================================================================
   6. 3D Tilt Effect on Cards (Perspective Motion)
   ========================================================================== */
function initCard3DTilt() {
  const tiltCards = document.querySelectorAll('[data-tilt]');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ==========================================================================
   7. Interactive 4 Pillars Deep-Dive Drawer / Modal
   ========================================================================== */
const pillarData = {
  learn: {
    title: 'Learn — Core Concepts & Terminology',
    badge: 'Foundation Phase',
    description: 'Master the fundamental building blocks of computing, binary abstractions, computer architecture, memory systems, and modern runtime environments.',
    features: [
      'Binary & Boolean Logic: How transistors calculate truth values.',
      'Von Neumann Architecture: CPU, Memory, Bus, and I/O devices.',
      'Data Representation: Integers, floating points, ASCII, and Unicode.',
      'Algorithm Complexity: Introduction to Big-O performance.'
    ],
    interactiveSnippet: `// Try converting decimal to binary:
function toBinary(num) {
  return (num >>> 0).toString(2);
}
console.log("Decimal 42 in binary is:", toBinary(42)); // "101010"`
  },
  practice: {
    title: 'Practice — Problem Solving & Coding',
    badge: 'Hands-on Labs',
    description: 'Transition theory into working code through interactive weekly programming challenges, debugging exercises, and algorithmic thinking.',
    features: [
      'Interactive syntax drills with instant feedback.',
      'Flowcharts and pseudocode problem decomposition.',
      'Step-through debugging and tracing variable states.',
      'Automated unit testing for student submissions.'
    ],
    interactiveSnippet: `// Practice algorithm: Sum of first N numbers
function sumRange(n) {
  return (n * (n + 1)) / 2;
}
console.log("Sum of numbers 1 to 100:", sumRange(100)); // 5050`
  },
  build: {
    title: 'Build — First-Year Project Portfolio',
    badge: 'Project Phase',
    description: 'Apply combined knowledge of programming, HTML, and CSS to construct tangible, portfolio-worthy web applications and utility tools.',
    features: [
      'Project 1: Interactive Terminal Calculator.',
      'Project 2: Personal Student Portfolio Website with Semantic HTML & CSS.',
      'Project 3: Interactive Quiz Engine with JavaScript DOM manipulation.',
      'Version control fundamentals using Git and GitHub.'
    ],
    interactiveSnippet: `<!-- Sample project card markup -->
<div class="project-preview">
  <h4>Personal Student Portfolio</h4>
  <p>HTML5 • CSS Grid • Responsive Design</p>
</div>`
  },
  grow: {
    title: 'Grow — Confidence & Advanced Horizons',
    badge: 'Advancement',
    description: 'Bridge from introductory fundamentals toward data structures, full-stack systems, machine learning, and collaborative software engineering.',
    features: [
      'Peer-reviewed group study sessions and code reviews.',
      'Preparation guides for Data Structures & Algorithms (CS-201).',
      'Guest lectures from alumni software engineers at top tech firms.',
      'Career readiness: internship preparation and open-source contributions.'
    ],
    interactiveSnippet: `const studentMilestones = [
  "Mastered Control Flow", 
  "Built 3 Web Projects", 
  "Prepared for CS-201 Data Structures"
];
console.log("Your roadmap:", studentMilestones.join(" ➔ "));`
  }
};

function initPillarModals() {
  const modalBackdrop = document.getElementById('pillar-modal');
  const modalTitle = document.getElementById('pillar-modal-title');
  const modalBadge = document.getElementById('pillar-modal-badge');
  const modalDesc = document.getElementById('pillar-modal-desc');
  const modalFeatures = document.getElementById('pillar-modal-features');
  const modalSnippet = document.getElementById('pillar-modal-snippet');
  const modalClose = document.getElementById('pillar-modal-close');
  
  document.querySelectorAll('[data-pillar]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-pillar');
      const data = pillarData[type];
      if (!data) return;
      
      modalTitle.textContent = data.title;
      modalBadge.textContent = data.badge;
      modalDesc.textContent = data.description;
      
      modalFeatures.innerHTML = data.features.map(f => `
        <li class="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
          <span class="text-blue-600 dark:text-blue-400 font-bold">✓</span>
          <span>${f}</span>
        </li>
      `).join('');
      
      modalSnippet.textContent = data.interactiveSnippet;
      modalBackdrop.classList.add('open');
    });
  });
  
  if (modalClose) {
    modalClose.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  }
  
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
    });
  }
}

/* ==========================================================================
   8. Course Modules Manager (Filters, Accordion, Progress Calculation)
   ========================================================================== */
const modulesState = [
  {
    id: 1,
    topic: 'Introduction to Computers',
    week: 'Week 1',
    status: 'Completed',
    statusClass: 'badge-completed',
    dotColor: '#10b981',
    lessons: ['Hardware Architecture', 'Memory & Storage Systems', 'Binary & Bits', 'History of Computing'],
    hours: '6 hours',
    hasLab: true
  },
  {
    id: 2,
    topic: 'Programming Basics',
    week: 'Week 2 – 3',
    status: 'In Progress',
    statusClass: 'badge-inprogress',
    dotColor: '#f59e0b',
    lessons: ['Variables & Data Types', 'Conditionals & Branching', 'Loops & Iterations', 'Functions & Scope'],
    hours: '12 hours',
    hasLab: true
  },
  {
    id: 3,
    topic: 'Web Technologies (HTML & CSS)',
    week: 'Week 4 – 5',
    status: 'Not Started',
    statusClass: 'badge-notstarted',
    dotColor: '#94a3b8',
    lessons: ['Semantic HTML5 Tags', 'CSS Box Model & Flexbox', 'Responsive Media Queries', 'Forms & Inputs'],
    hours: '12 hours',
    hasLab: true
  },
  {
    id: 4,
    topic: 'Problem Solving & Logic',
    week: 'Week 6',
    status: 'Not Started',
    statusClass: 'badge-notstarted',
    dotColor: '#94a3b8',
    lessons: ['Algorithmic Thinking', 'Flowcharts & Pseudocode', 'Search & Sort Concepts', 'Final Project Prep'],
    hours: '8 hours',
    hasLab: true
  }
];

function initModulesManager() {
  const container = document.getElementById('modules-container');
  const filterBtns = document.querySelectorAll('.module-filter-btn');
  const progressBar = document.getElementById('overall-progress-fill');
  const progressText = document.getElementById('overall-progress-text');
  
  function updateProgress() {
    const completedCount = modulesState.filter(m => m.status === 'Completed').length;
    const inProgressCount = modulesState.filter(m => m.status === 'In Progress').length;
    const percent = Math.round(((completedCount * 1.0) + (inProgressCount * 0.5)) / modulesState.length * 100);
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}% Completed (${completedCount}/${modulesState.length} Modules)`;
  }
  
  function renderModules(filter = 'all') {
    if (!container) return;
    
    const filtered = modulesState.filter(m => {
      if (filter === 'all') return true;
      if (filter === 'completed') return m.status === 'Completed';
      if (filter === 'inprogress') return m.status === 'In Progress';
      if (filter === 'notstarted') return m.status === 'Not Started';
      return true;
    });
    
    container.innerHTML = filtered.map(m => `
      <div class="module-table-row p-4 sm:p-5 transition-all hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer" data-id="${m.id}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-4">
            <span class="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-bold flex items-center justify-center text-sm border border-blue-200 dark:border-blue-800">
              0${m.id}
            </span>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white text-base hover:text-blue-600 transition-colors">
                ${m.topic}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                ${m.week} &bull; ${m.hours} &bull; 4 Lessons
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 self-end sm:self-center">
            <span class="badge-status ${m.statusClass}">
              <span class="pulse-dot" style="background-color: ${m.dotColor}"></span>
              ${m.status}
            </span>
            <button class="toggle-accordion-btn text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-transform">
              <svg class="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Accordion Detail (Expanded on Click) -->
        <div class="module-details hidden mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p class="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Curriculum Syllabus:</p>
              <ul class="space-y-1.5 text-slate-600 dark:text-slate-400">
                ${m.lessons.map(l => `<li class="flex items-center gap-2"><span class="text-blue-500">&bull;</span><span>${l}</span></li>`).join('')}
              </ul>
            </div>
            <div class="flex flex-col justify-between">
              <div>
                <p class="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Interactive State:</p>
                <div class="flex gap-2">
                  <button class="status-btn px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100" data-status="Completed" data-id="${m.id}">Mark Done</button>
                  <button class="status-btn px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100" data-status="In Progress" data-id="${m.id}">In Progress</button>
                  <button class="status-btn px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100" data-status="Not Started" data-id="${m.id}">Reset</button>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-3 font-semibold">
                <button class="action-slides-btn text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
                  <span>📥 Lecture Slides</span>
                </button>
                <span class="text-slate-300 dark:text-slate-700">|</span>
                <button class="action-lab-btn text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
                  <span>💻 Launch Cloud Lab</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // Add Click listeners for Accordion
    container.querySelectorAll('.module-table-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.status-btn') || e.target.closest('.action-slides-btn') || e.target.closest('.action-lab-btn')) {
          return;
        }
        const details = row.querySelector('.module-details');
        const arrow = row.querySelector('.toggle-accordion-btn svg');
        const isHidden = details.classList.contains('hidden');
        
        details.classList.toggle('hidden', !isHidden);
        if (arrow) arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    });
    
    // Status Switcher buttons
    container.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'));
        const newStatus = btn.getAttribute('data-status');
        const targetMod = modulesState.find(m => m.id === id);
        
        if (targetMod) {
          targetMod.status = newStatus;
          if (newStatus === 'Completed') {
            targetMod.statusClass = 'badge-completed';
            targetMod.dotColor = '#10b981';
            showToast(`🎉 Module ${id} marked as Completed!`);
            triggerConfetti();
          } else if (newStatus === 'In Progress') {
            targetMod.statusClass = 'badge-inprogress';
            targetMod.dotColor = '#f59e0b';
            showToast(`⚡ Module ${id} updated to In Progress.`);
          } else {
            targetMod.statusClass = 'badge-notstarted';
            targetMod.dotColor = '#94a3b8';
            showToast(`Module ${id} reset.`);
          }
          
          updateProgress();
          renderModules(filter);
        }
      });
    });
    
    // Slides & Lab simulation
    container.querySelectorAll('.action-slides-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('📄 Downloading Lecture Slides PDF...');
      });
    });
    container.querySelectorAll('.action-lab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('🚀 Launching Cloud Programming Sandbox...');
      });
    });
  }
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
        b.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
      });
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
      
      const filter = btn.getAttribute('data-filter');
      renderModules(filter);
    });
  });
  
  renderModules('all');
  updateProgress();
}

/* ==========================================================================
   9. Photo Gallery Lightbox Modal
   ========================================================================== */
const galleryItems = [
  {
    title: 'Learning to Code',
    desc: 'First-year students working on foundational programming logic, learning syntax, variable scopes, and iterative constructs with modern IDE tools.',
    img: 'assets/exact_gallery_1.png',
    tags: ['IDE', 'Python', 'Web Dev', 'Syntax']
  },
  {
    title: 'Study Materials',
    desc: 'Comprehensive lecture notes, reference textbooks, cheat sheets, and practice exercise sets curated specifically for Computer Science Fundamentals.',
    img: 'assets/exact_gallery_2.png',
    tags: ['Textbooks', 'PDF Notes', 'Lab Worksheets']
  },
  {
    title: 'Team Learning',
    desc: 'Collaborative peer problem solving in the computer labs, pair programming workshops, and weekly TA office hours for project guidance.',
    img: 'assets/exact_gallery_3.png',
    tags: ['Pair Programming', 'Study Groups', 'Mentorship']
  }
];

function initGalleryLightbox() {
  const modalBackdrop = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('gallery-modal-img');
  const modalTitle = document.getElementById('gallery-modal-title');
  const modalDesc = document.getElementById('gallery-modal-desc');
  const modalTags = document.getElementById('gallery-modal-tags');
  const modalClose = document.getElementById('gallery-modal-close');
  
  document.querySelectorAll('[data-gallery-idx]').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-gallery-idx'));
      const item = galleryItems[idx];
      if (!item) return;
      
      modalImg.src = item.img;
      modalImg.alt = item.title;
      modalTitle.textContent = item.title;
      modalDesc.textContent = item.desc;
      
      modalTags.innerHTML = item.tags.map(t => `
        <span class="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
          #${t}
        </span>
      `).join('');
      
      modalBackdrop.classList.add('open');
    });
  });
  
  if (modalClose) {
    modalClose.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  }
  
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
    });
  }
}

/* ==========================================================================
   10. Search Spotlight (Cmd+K / Ctrl+K & Instant Search)
   ========================================================================== */
const searchableItems = [
  { title: 'Module 1: Introduction to Computers', category: 'Course Module', link: '#modules' },
  { title: 'Module 2: Programming Basics', category: 'Course Module', link: '#modules' },
  { title: 'Module 3: Web Technologies (HTML & CSS)', category: 'Course Module', link: '#modules' },
  { title: 'Module 4: Problem Solving & Logic', category: 'Course Module', link: '#modules' },
  { title: 'Assignment 1 Due (Apr 15, 2025)', category: 'Upcoming Event', link: '#events' },
  { title: 'Quiz 1 (Apr 25, 2025)', category: 'Upcoming Event', link: '#events' },
  { title: 'Midterm Exam (May 10, 2025)', category: 'Upcoming Event', link: '#events' },
  { title: 'Course Syllabus PDF', category: 'Resource', link: '#quick-links' },
  { title: 'Download Notes (PDF)', category: 'Resource', link: '#quick-links' },
  { title: 'W3Schools (HTML & CSS Tutorial)', category: 'Useful Link', link: '#useful-links' },
  { title: 'JavaScript Tutorial Guide', category: 'Useful Link', link: '#useful-links' },
  { title: 'GitHub Student Projects Repository', category: 'Useful Link', link: '#useful-links' },
  { title: 'MDN Web Docs Reference', category: 'Useful Link', link: '#useful-links' },
  { title: 'Coursera Free CS Courses', category: 'Useful Link', link: '#useful-links' },
  { title: 'What is a Computer?', category: 'Key Topic', link: '#key-topics' },
  { title: 'Operating Systems & Process Management', category: 'Key Topic', link: '#key-topics' },
  { title: 'Programming Languages & Compilers', category: 'Key Topic', link: '#key-topics' },
  { title: 'Problem Solving Techniques & Algorithms', category: 'Key Topic', link: '#key-topics' },
  { title: 'Frequently Asked Questions (FAQ)', category: 'General', link: '#faq' }
];

function initSearchSpotlight() {
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchTriggers = document.querySelectorAll('.search-trigger-btn');
  const searchClose = document.getElementById('search-modal-close');
  
  function openSearch() {
    searchModal.classList.add('open');
    setTimeout(() => searchInput.focus(), 50);
    renderResults('');
  }
  
  function closeSearch() {
    searchModal.classList.remove('open');
    searchInput.value = '';
  }
  
  searchTriggers.forEach(btn => btn.addEventListener('click', openSearch));
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchModal.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    } else if (e.key === 'Escape' && searchModal.classList.contains('open')) {
      closeSearch();
    }
  });
  
  function renderResults(query) {
    const q = query.trim().toLowerCase();
    const matches = searchableItems.filter(item => 
      !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
    
    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="py-8 text-center text-slate-400 text-sm font-mono">
          No matches found for "<span class="font-medium text-slate-600 dark:text-slate-300">${query}</span>"
        </div>
      `;
      return;
    }
    
    searchResults.innerHTML = matches.map((item, i) => `
      <a href="${item.link}" class="search-result-item flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors group" data-idx="${i}">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-mono flex items-center justify-center text-xs font-bold border border-blue-200 dark:border-blue-800">
            ${item.category[0]}
          </span>
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            ${item.title}
          </span>
        </div>
        <span class="text-[11px] font-mono px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md border border-slate-200 dark:border-slate-700">
          ${item.category}
        </span>
      </a>
    `).join('');
    
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => closeSearch());
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });
  }
  
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }
}

/* ==========================================================================
   11. Contact Form Validation, Loading State & Celebration
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const charCount = document.getElementById('contact-char-count');
  
  if (messageInput && charCount) {
    messageInput.addEventListener('input', () => {
      charCount.textContent = `${messageInput.value.length}/500`;
    });
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name) {
      showToast('⚠️ Please enter your name');
      nameInput.focus();
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showToast('⚠️ Please enter a valid email address');
      emailInput.focus();
      return;
    }
    
    if (!message) {
      showToast('⚠️ Please enter your message');
      messageInput.focus();
      return;
    }
    
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending...
    `;
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      form.reset();
      if (charCount) charCount.textContent = '0/500';
      
      showToast('📬 Message received! Our course staff will reply to your email shortly.');
      triggerConfetti();
    }, 900);
  });
}

/* ==========================================================================
   12. Quick Actions (PDF Download, Calendar Export)
   ========================================================================== */
function initQuickActions() {
  const downloadNotesBtn = document.getElementById('action-download-notes');
  if (downloadNotesBtn) {
    downloadNotesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('📥 Preparing CS101_Lecture_Notes_Full.pdf...');
      
      setTimeout(() => {
        const blob = new Blob([
          `WP - Wisdom pro: Computer Science Fundamentals
Complete Course Notes & Study Syllabus (2025 Edition)
Instructor: Department of Computer Science & Engineering
University of Technology • CS-101

Table of Contents:
1. Introduction to Computers & Binary Architecture
2. Variables, Control Flow & Functions
3. HTML5 Semantic Elements & CSS Box Model
4. Problem Solving Strategies & Algorithm Design
`
        ], { type: 'text/plain;charset=utf-8' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'WP - Wisdom pro_CS_Fundamentals_Notes.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('✅ Download complete: WP - Wisdom pro_CS_Fundamentals_Notes.txt');
      }, 1100);
    });
  }
  
  document.querySelectorAll('.add-to-cal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const eventTitle = btn.getAttribute('data-event-title') || 'WP - Wisdom pro Event';
      const eventDate = btn.getAttribute('data-event-date') || '2025-04-15';
      
      const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WP - Wisdom pro//CS Fundamentals//EN
BEGIN:VEVENT
SUMMARY:${eventTitle}
DESCRIPTION:WP - Wisdom pro - Computer Science Fundamentals deadline.
DTSTART:${eventDate.replace(/-/g, '')}T090000Z
DTEND:${eventDate.replace(/-/g, '')}T100000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
      
      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${eventTitle.replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`📅 Calendar invite saved for ${eventTitle}`);
    });
  });
}

/* ==========================================================================
   13. Motivational Quote Generator
   ========================================================================== */
const motivationalQuotes = [
  "Small steps today, big dreams tomorrow!",
  "First, solve the problem. Then, write the code.",
  "The expert in anything was once a beginner.",
  "Code is like humor. When you have to explain it, it’s bad.",
  "Any fool can write code that a computer understands. Good programmers write code humans can understand.",
  "Make it work, make it right, make it fast."
];

function initQuoteGenerator() {
  const quoteCard = document.getElementById('sidebar-quote-card');
  const quoteText = document.getElementById('sidebar-quote-text');
  if (!quoteCard || !quoteText) return;
  
  let currentIdx = 0;
  quoteCard.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % motivationalQuotes.length;
    quoteText.style.opacity = '0';
    quoteText.style.transform = 'translateY(6px)';
    
    setTimeout(() => {
      quoteText.textContent = `"${motivationalQuotes[currentIdx]}"`;
      quoteText.style.opacity = '1';
      quoteText.style.transform = 'translateY(0)';
    }, 200);
    
    showToast('✨ Daily inspiration refreshed!');
  });
}

/* ==========================================================================
   14. Reference Comparison Overlay Drawer
   ========================================================================== */
function initReferenceComparison() {
  const toggleBtn = document.getElementById('ref-toggle-btn');
  const refDrawer = document.getElementById('ref-drawer');
  const refClose = document.getElementById('ref-drawer-close');
  
  if (toggleBtn && refDrawer) {
    toggleBtn.addEventListener('click', () => {
      refDrawer.classList.toggle('hidden');
    });
  }
  
  if (refClose && refDrawer) {
    refClose.addEventListener('click', () => {
      refDrawer.classList.add('hidden');
    });
  }
}

/* ==========================================================================
   15. Toast Notification Utility
   ========================================================================== */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="text-blue-500 font-bold">•</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ==========================================================================
   16. Confetti Explosion
   ========================================================================== */
function triggerConfetti() {
  const colors = ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'];
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.top = '50%';
    confetti.style.left = '50%';
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = `${Math.random() * 8 + 6}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = '2px';
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 300 + 100;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity - 100;
    
    document.body.appendChild(confetti);
    
    confetti.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${destX}px, ${destY}px) rotate(${Math.random() * 720}deg) scale(0)`, opacity: 0 }
    ], {
      duration: Math.random() * 800 + 700,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }).onfinish = () => confetti.remove();
  }
}


/* ==========================================================================
   17. 3D Workstation Stage & Hero Controls
   ========================================================================== */
function init3DWorkstationControls() {
  const btn3D = document.getElementById('view-mode-3d');
  const btnPhoto = document.getElementById('view-mode-photo');
  const stage3D = document.getElementById('hero-3d-stage-wrapper');
  const stagePhoto = document.getElementById('hero-photo-wrapper');

  if (btn3D && btnPhoto && stage3D && stagePhoto) {
    btn3D.addEventListener('click', () => {
      stage3D.classList.remove('hidden');
      stagePhoto.classList.add('hidden');
      btn3D.classList.add('bg-blue-600', 'text-white');
      btn3D.classList.remove('text-slate-400');
      btnPhoto.classList.remove('bg-blue-600', 'text-white');
      btnPhoto.classList.add('text-slate-400');
      showToast('🖥️ Switched to Interactive 3D Workstation');
      if (window.WisdomPro3D && typeof window.WisdomPro3D.resetCamera === 'function') {
        window.dispatchEvent(new Event('resize'));
      }
    });

    btnPhoto.addEventListener('click', () => {
      stage3D.classList.add('hidden');
      stagePhoto.classList.remove('hidden');
      btnPhoto.classList.add('bg-blue-600', 'text-white');
      btnPhoto.classList.remove('text-slate-400');
      btn3D.classList.remove('bg-blue-600', 'text-white');
      btn3D.classList.add('text-slate-400');
      showToast('📷 Switched to Studio Reference Photography');
    });
  }

  // 3D Dock Controls
  const btnScreen = document.getElementById('btn-screen-mode');
  const btnBacklight = document.getElementById('btn-backlight');
  const btnAutoRotate = document.getElementById('btn-autorotate');
  const btnExploded = document.getElementById('btn-exploded');
  const btnResetCam = document.getElementById('btn-reset-cam');

  if (btnScreen) {
    btnScreen.addEventListener('click', () => {
      if (window.WisdomPro3D) {
        window.WisdomPro3D.cycleScreenMode();
      }
    });
  }

  if (btnBacklight) {
    btnBacklight.addEventListener('click', () => {
      if (window.WisdomPro3D) {
        window.WisdomPro3D.cycleBacklight();
      }
    });
  }

  if (btnAutoRotate) {
    btnAutoRotate.addEventListener('click', () => {
      if (window.WisdomPro3D) {
        window.WisdomPro3D.toggleAutoRotate();
      }
    });
  }

  if (btnExploded) {
    btnExploded.addEventListener('click', () => {
      if (window.WisdomPro3D) {
        window.WisdomPro3D.toggleExplodedView();
      }
    });
  }

  if (btnResetCam) {
    btnResetCam.addEventListener('click', () => {
      if (window.WisdomPro3D) {
        window.WisdomPro3D.resetCamera();
        showToast('🎯 3D Camera view reset to center');
      }
    });
  }
}
