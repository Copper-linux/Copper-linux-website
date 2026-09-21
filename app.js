/**
 * =====================================================================
 * COPPER LINUX — app.js
 * SPA router, interactive terminal, scroll animations, cursor glow,
 * page transitions, typing effects, and dynamic data fetching.
 * =====================================================================
 */

/* ------------------------------------------------------------------
   ROUTER
   ------------------------------------------------------------------ */
const ROUTES = {
    '/':              pageHome,
    '/daily-driving': pageDailyDriving,
    '/security':      pageSecurity,
    '/tools':         pageTools,
    '/contributions': pageContributions,
    '/contributors':  pageContributors,
    '/docs':          pageDocs,
};

function getHash() { return location.hash.slice(1) || '/'; }

function navigate() {
    const hash = getHash();
    const app  = document.getElementById('app');
    const pt   = document.getElementById('page-transition');

    // Page transition animation
    pt.className = 'page-transition entering';
    setTimeout(() => {
        app.innerHTML = '';
        const render = ROUTES[hash] || page404;
        app.innerHTML = render();

        // Post-render hooks
        syncTheme(hash);
        setActiveNav(hash);
        initScrollReveal();
        bindPageInteractions(hash);
        document.getElementById('nav-links').classList.remove('open');
        document.getElementById('hamburger').classList.remove('open');
        window.scrollTo(0, 0);

        pt.className = 'page-transition leaving';
        setTimeout(() => { pt.className = 'page-transition'; }, 400);
    }, 350);
}

window.addEventListener('hashchange', navigate);
document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initHamburger();
    initModeToggle();
    // First load — skip transition
    const app = document.getElementById('app');
    const hash = getHash();
    app.innerHTML = (ROUTES[hash] || page404)();
    syncTheme(hash);
    setActiveNav(hash);
    initScrollReveal();
    bindPageInteractions(hash);
});

/* ------------------------------------------------------------------
   NAV HELPERS
   ------------------------------------------------------------------ */
function setActiveNav(hash) {
    document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.toggle('active', a.dataset.page === hash);
    });
}

function initHamburger() {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('nav-links');
    btn.addEventListener('click', () => {
        btn.classList.toggle('open');
        menu.classList.toggle('open');
    });
}

/* ------------------------------------------------------------------
   MODE / THEME
   ------------------------------------------------------------------ */
let isVortex = false;

function initModeToggle() {
    document.getElementById('mode-toggle').addEventListener('click', () => {
        isVortex = !isVortex;
        applyTheme();
        // Redirect if on a mode-specific page
        const h = getHash();
        if (isVortex && (h === '/' || h === '/daily-driving')) location.hash = '/security';
        if (!isVortex && (h === '/security' || h === '/tools')) location.hash = '/daily-driving';
    });
}

function applyTheme() {
    document.body.classList.toggle('vortex', isVortex);
    document.getElementById('logo-text').textContent = isVortex ? 'VORTEX' : 'COPPER';
}

function syncTheme(hash) {
    if (hash === '/security' || hash === '/tools') isVortex = true;
    else if (hash === '/' || hash === '/daily-driving') isVortex = false;
    applyTheme();
}

/* ------------------------------------------------------------------
   CUSTOM CURSOR
   ------------------------------------------------------------------ */
function initCursorGlow() {
    const g = document.getElementById('cursor-glow');
    if (!g) return;
    document.addEventListener('mousemove', e => {
        g.style.left = e.clientX + 'px';
        g.style.top  = e.clientY + 'px';
    });
    document.addEventListener('mouseover', e => {
        const t = e.target.closest('a, button, .card, .btn, .nav-link, .pill, input, select');
        g.classList.toggle('hover', !!t);
    });
}

/* ------------------------------------------------------------------
   SCROLL REVEAL (IntersectionObserver)
   ------------------------------------------------------------------ */
function initScrollReveal() {
    const els = document.querySelectorAll('.reveal, .stagger');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
}

/* ------------------------------------------------------------------
   TYPING EFFECT
   ------------------------------------------------------------------ */
function startTyping(elId, text, speed) {
    speed = speed || 60;
    const el = document.getElementById(elId);
    if (!el) return;
    let i = 0;
    el.textContent = '';
    function tick() {
        if (i < text.length) { el.textContent += text[i]; i++; setTimeout(tick, speed); }
    }
    tick();
}

/* ------------------------------------------------------------------
   POST-RENDER HOOKS PER PAGE
   ------------------------------------------------------------------ */
function bindPageInteractions(hash) {
    if (hash === '/') {
        startTyping('hero-typed', '> Built by 4 humans. Expect bugs.', 45);
    }
    if (hash === '/tools') loadToolsData();
    if (hash === '/contributors') loadContributorsData();
    if (hash === '/daily-driving' || hash === '/security') {
        initTerminal();
    }
}

/* ------------------------------------------------------------------
   INTERACTIVE TERMINAL
   ------------------------------------------------------------------ */
const TERM_COMMANDS = {
    help: [
        'Available commands:',
        '  help      Show this message',
        '  about     About Copper Linux',
        '  version   Display version info',
        '  team      List contributors',
        '  vortex    About Vortex Linux',
        '  neofetch  System info',
        '  clear     Clear terminal',
    ],
    about: [
        'Copper Linux — The Foundation.',
        'A minimal, practical Linux distribution built',
        'by a small team of four people.',
    ],
    version: [
        'Copper Linux v0.1.0-dev',
        'Kernel: 6.8-copper-custom',
        'Arch:   x86_64',
        'Status: In Development',
    ],
    team: [
        'TEAM:',
        '  farcrowx                    — Core System',
        '  12hrformat                  — Vortex Linux',
        '  firstspot_7                 — UI/UX & Docs',
        '  krishnarajyagru27-creator   — Packages',
    ],
    vortex: [
        'Vortex Linux — Security Edition',
        'Cybersecurity-focused reskin of Copper Linux.',
        'Preinstalled tools for pentesting, CTFs, and research.',
        'WARNING: Only use on systems you own or have permission to test.',
    ],
    neofetch: [
        '        ___           OS:     Copper Linux v0.1.0-dev',
        '       /   \\          Kernel: 6.8-copper-custom',
        '      | C L |         Shell:  bash 5.2',
        '       \\___/          DE:     TBD',
        '      /     \\         RAM:    — MB / — MB',
        '     /       \\        Team:   4 contributors',
        '    /_________\\       Status: In Development',
    ],
};

function initTerminal() {
    const input = document.getElementById('term-input');
    const body  = document.getElementById('term-body');
    if (!input || !body) return;

    const wrapper = document.querySelector('.terminal-window');
    if (wrapper) wrapper.addEventListener('click', () => input.focus());

    input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const raw = input.value.trim();
        const cmd = raw.toLowerCase();
        if (!raw) return;

        addLine('$ ' + raw, 'cmd');

        if (cmd === 'clear') {
            body.innerHTML = '';
        } else if (TERM_COMMANDS[cmd]) {
            TERM_COMMANDS[cmd].forEach(l => addLine(l));
        } else {
            addLine('copper: command not found: ' + raw, 'err');
        }

        input.value = '';
        body.scrollTop = body.scrollHeight;
    });

    function addLine(text, cls) {
        const d = document.createElement('div');
        d.className = 'terminal-line' + (cls ? ' ' + cls : '');
        d.textContent = text;
        body.appendChild(d);
    }
}

/* ------------------------------------------------------------------
   TOOLS — fetch tools.json
   ------------------------------------------------------------------ */
async function loadToolsData() {
    const grid   = document.getElementById('tools-grid');
    const search = document.getElementById('tool-search');
    const cat    = document.getElementById('tool-cat');
    if (!grid) return;

    try {
        const res   = await fetch('tools.json');
        const tools = await res.json();

        // Populate categories
        const cats = [...new Set(tools.map(t => t.category))].sort();
        cats.forEach(c => {
            const o = document.createElement('option');
            o.value = c; o.textContent = c;
            cat.appendChild(o);
        });

        function render() {
            const q = search.value.toLowerCase();
            const f = cat.value;
            const list = tools.filter(t => {
                const ms = t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
                const mc = f === 'all' || t.category === f;
                return ms && mc;
            });
            if (!list.length) {
                grid.innerHTML = '<p style="grid-column:1/-1;color:var(--dim)">No tools match.</p>';
                return;
            }
            grid.innerHTML = list.map(t => {
                const bc = 'badge-' + t.status.toLowerCase();
                const cmdHtml = t.command
                    ? '<div class="tool-cmd"><code>$ ' + escHtml(t.command) + '</code></div>'
                    : '';
                return '<div class="card tool-card">'
                    + '<div class="tool-header"><h3>' + escHtml(t.name) + '</h3>'
                    + '<span class="badge ' + bc + '">' + escHtml(t.status) + '</span></div>'
                    + '<span style="font-size:0.8rem;color:var(--dim)">' + escHtml(t.category) + '</span>'
                    + '<p class="tool-desc">' + escHtml(t.description) + '</p>'
                    + cmdHtml + '</div>';
            }).join('');
        }

        search.addEventListener('input', render);
        cat.addEventListener('change', render);
        render();
    } catch (err) {
        grid.innerHTML = '<div class="notice" style="grid-column:1/-1;border-color:#e74c3c">Failed to load tools.json.</div>';
    }
}

/* ------------------------------------------------------------------
   CONTRIBUTORS — fetch GitHub API
   ------------------------------------------------------------------ */
async function loadContributorsData() {
    const grid = document.getElementById('contrib-grid');
    if (!grid) return;

    const team = [
        { login: 'farcrowx', role: 'Core System & Infrastructure' },
        { login: '12hrformat', role: 'Vortex Linux & Tools' },
        { login: 'firstspot_7', role: 'UI/UX & Documentation' },
        { login: 'krishnarajyagru27-creator', role: 'Package Maintenance' },
    ];

    grid.innerHTML = '';

    for (const m of team) {
        let name = m.login, avatar = '', bio = 'Contribution details coming soon.', url = 'https://github.com/' + m.login;
        try {
            // Public GitHub API — no key needed at low volume
            const r = await fetch('https://api.github.com/users/' + m.login);
            if (r.ok) {
                const d = await r.json();
                name   = d.name || m.login;
                avatar = d.avatar_url || '';
                bio    = d.bio || bio;
                url    = d.html_url || url;
            }
        } catch (e) { /* graceful fallback */ }

        const imgTag = avatar
            ? '<img src="' + escHtml(avatar) + '" alt="' + escHtml(m.login) + '" class="avatar">'
            : '<div class="avatar"></div>';

        grid.innerHTML += '<div class="card contrib-card">'
            + imgTag
            + '<div>'
            + '<h3>' + escHtml(name) + '</h3>'
            + '<a href="' + escHtml(url) + '" target="_blank" class="github-link">@' + escHtml(m.login) + '</a>'
            + '<p class="role">' + escHtml(m.role) + '</p>'
            + '<p class="bio">' + escHtml(bio) + '</p>'
            + '</div></div>';
    }
}

/* ------------------------------------------------------------------
   UTILITY
   ------------------------------------------------------------------ */
function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

/* ==================================================================
   PAGE TEMPLATES
   ================================================================== */

function pageHome() {
    return ''
    + '<section class="hero section">'
    +   '<div class="hero-bg-grid"></div>'
    +   '<div class="container hero-content">'
    +     '<div class="dev-badge">IN DEVELOPMENT · TEAM OF 4</div>'
    +     '<div class="glitch-wrap">'
    +       '<h1 class="hero-title">COPPER<br><span class="accent">LINUX</span></h1>'
    +     '</div>'
    +     '<p class="hero-tagline"><span id="hero-typed"></span><span class="typed-cursor"></span></p>'
    +     '<div class="btn-group">'
    +       '<a href="#/daily-driving" class="btn btn-accent">GET COPPER LINUX</a>'
    +       '<a href="#/security" class="btn">EXPLORE VORTEX ↗</a>'
    +       '<a href="https://github.com/placeholder" target="_blank" class="btn">GITHUB</a>'
    +     '</div>'
    +   '</div>'
    + '</section>'

    + '<div class="marquee"><div class="marquee-inner">'
    + 'MINIMAL · PRACTICAL · HONEST · BUILT BY FOUR · BUGS ARE FEATURES · EXPECT ROUGH EDGES · OPEN SOURCE · COPPER LINUX · '
    + 'MINIMAL · PRACTICAL · HONEST · BUILT BY FOUR · BUGS ARE FEATURES · EXPECT ROUGH EDGES · OPEN SOURCE · COPPER LINUX · '
    + '</div></div>'

    + '<section class="section reveal">'
    +   '<div class="container">'
    +     '<h2>What is Copper Linux?</h2>'
    +     '<p style="color:var(--dim);max-width:700px">We are focused on building a practical Linux system without unnecessary complexity. We are starting with the daily-driving experience while actively developing Vortex Linux alongside it. We are a small team, so progress is steady but bugs and rough edges are normal.</p>'
    +   '</div>'
    + '</section>'

    + '<section class="section">'
    +   '<div class="container grid-2 stagger">'
    +     '<div class="mode-card">'
    +       '<h3>Daily Driving</h3>'
    +       '<p>A practical Linux environment for everyday computing — web, code, work, media. Actively developed by a four-person team.</p>'
    +       '<a href="#/daily-driving" class="btn">EXPLORE →</a>'
    +     '</div>'
    +     '<div class="mode-card">'
    +       '<h3>Vortex Linux</h3>'
    +       '<p>Security-focused reskin of Copper Linux for researchers, pentesters, and people learning cybersecurity. Preinstalled tools.</p>'
    +       '<a href="#/security" class="btn">EXPLORE →</a>'
    +     '</div>'
    +   '</div>'
    + '</section>';
}

function pageDailyDriving() {
    return ''
    + '<section class="section">'
    +   '<div class="container">'
    +     '<div class="dev-badge">DAILY DRIVING MODE</div>'
    +     '<h1 class="page-title">Copper Linux</h1>'
    +     '<p class="page-subtitle">A practical desktop distro for web, code, school, work, and media.</p>'
    +   '</div>'
    + '</section>'

    + '<section class="section reveal">'
    +   '<div class="container">'
    +     '<div class="notice">Since we are only a team of four people, you may encounter bugs and glitches. Reporting them on our GitHub helps the project tremendously.</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section">'
    +   '<div class="container grid-2 stagger">'
    +     '<div class="card"><h3>Included / Active</h3>'
    +       '<ul class="check-list">'
    +         '<li>Practical desktop environment</li>'
    +         '<li>Useful default software</li>'
    +         '<li>Straightforward setup</li>'
    +         '<li>Linux development environment</li>'
    +       '</ul>'
    +     '</div>'
    +     '<div class="card"><h3>Planned / In Development</h3>'
    +       '<ul class="wait-list">'
    +         '<li>System customization UI</li>'
    +         '<li>Automated regular improvements</li>'
    +         '<li>Expanded gaming compatibility</li>'
    +       '</ul>'
    +     '</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section reveal">'
    +   '<div class="container">'
    +     '<h2>Try It</h2>'
    +     '<div class="terminal-window">'
    +       '<div class="terminal-titlebar"><span>tty0</span><span>copper@copper</span></div>'
    +       '<div class="terminal-body" id="term-body">'
    +         '<div class="terminal-line sys">Copper Linux v0.1.0-dev — Development Edition</div>'
    +         '<div class="terminal-line sys">Type "help" for available commands.</div>'
    +       '</div>'
    +       '<div class="terminal-input-row">'
    +         '<span class="terminal-prompt">$</span>'
    +         '<input type="text" id="term-input" class="terminal-input" autocomplete="off" spellcheck="false" placeholder="type a command...">'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section text-center reveal">'
    +   '<div class="container">'
    +     '<h2>Download</h2>'
    +     '<p style="color:var(--dim)">We recommend trying it in a VM or on a spare machine first.</p>'
    +     '<div class="terminal-block" style="max-width:360px;margin:20px auto;text-align:left">'
    +       '$ copper --version<br>Copper Linux<br>Development Edition (AMD64)'
    +     '</div>'
    +     '<a href="#" class="btn btn-accent" style="margin-top:16px">DOWNLOAD ISO (AMD64)</a>'
    +   '</div>'
    + '</section>';
}

function pageSecurity() {
    return ''
    + '<section class="section">'
    +   '<div class="container">'
    +     '<div class="dev-badge">SECURITY MODE</div>'
    +     '<h1 class="page-title">Vortex Linux</h1>'
    +     '<p class="page-subtitle">The cybersecurity-focused edition of Copper Linux.</p>'
    +     '<p style="color:var(--dim);max-width:700px">A specialized reskin built for security research, penetration testing, CTFs, network testing, and cybersecurity learning, with preinstalled tools.</p>'
    +   '</div>'
    + '</section>'

    + '<section class="section reveal">'
    +   '<div class="container">'
    +     '<div class="notice" style="border-color:#e74c3c"><strong>CRITICAL:</strong> Only use security tools against systems you own or have explicit permission to test.</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section">'
    +   '<div class="container">'
    +     '<h2>Designed For</h2>'
    +     '<div class="pill-grid stagger">'
    +       '<span class="pill">Security Researchers</span>'
    +       '<span class="pill">Penetration Testers</span>'
    +       '<span class="pill">CTF Players</span>'
    +       '<span class="pill">Cybersecurity Students</span>'
    +       '<span class="pill">Network Testing</span>'
    +       '<span class="pill">Security Labs</span>'
    +     '</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section reveal">'
    +   '<div class="container">'
    +     '<h2>Terminal</h2>'
    +     '<div class="terminal-window">'
    +       '<div class="terminal-titlebar"><span>tty0</span><span>root@vortex</span></div>'
    +       '<div class="terminal-body" id="term-body">'
    +         '<div class="terminal-line sys">Vortex Linux (Copper Security Edition)</div>'
    +         '<div class="terminal-line sys">Type "help" for available commands.</div>'
    +       '</div>'
    +       '<div class="terminal-input-row">'
    +         '<span class="terminal-prompt">#</span>'
    +         '<input type="text" id="term-input" class="terminal-input" autocomplete="off" spellcheck="false" placeholder="type a command...">'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section text-center reveal">'
    +   '<div class="container">'
    +     '<h2>Included Toolkit</h2>'
    +     '<p style="color:var(--dim)">Explore our growing repository of preconfigured security tools.</p>'
    +     '<a href="#/tools" class="btn btn-accent" style="margin-top:16px">EXPLORE TOOLS DIRECTORY →</a>'
    +   '</div>'
    + '</section>';
}

function pageTools() {
    return ''
    + '<section class="section">'
    +   '<div class="container">'
    +     '<h1 class="page-title">Tools</h1>'
    +     '<p class="page-subtitle">Searchable directory of tools in Vortex Linux.</p>'
    +     '<div class="notice"><strong>Contributing:</strong> Edit <code>tools.json</code> via a Pull Request. This page auto-updates from that file.</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section">'
    +   '<div class="container">'
    +     '<div class="tools-controls">'
    +       '<input type="text" id="tool-search" placeholder="Search tools..." class="input">'
    +       '<select id="tool-cat" class="input" style="max-width:220px"><option value="all">All Categories</option></select>'
    +     '</div>'
    +     '<div id="tools-grid" class="grid-3 stagger"><p style="color:var(--dim)">Loading tools.json…</p></div>'
    +   '</div>'
    + '</section>';
}

function pageContributions() {
    return ''
    + '<section class="section">'
    +   '<div class="container">'
    +     '<h1 class="page-title">Contribute</h1>'
    +     '<p class="page-subtitle">Copper Linux is developed by a small team, and contributions help the project grow.</p>'
    +   '</div>'
    + '</section>'

    + '<section class="section">'
    +   '<div class="container grid-2 stagger">'
    +     '<div class="card"><h3>Ways to Contribute</h3>'
    +       '<ul class="bullet-list" style="color:var(--dim)">'
    +         '<li><strong style="color:var(--white)">Code</strong> — Fix bugs, improve core utilities.</li>'
    +         '<li><strong style="color:var(--white)">Bug Reports</strong> — Find something broken? Let us know.</li>'
    +         '<li><strong style="color:var(--white)">Testing</strong> — Help test ISOs on different hardware.</li>'
    +         '<li><strong style="color:var(--white)">Documentation</strong> — Write guides and tutorials.</li>'
    +         '<li><strong style="color:var(--white)">Package Work</strong> — Maintain packages in the repo.</li>'
    +         '<li><strong style="color:var(--white)">UI/Design</strong> — Improve the desktop experience.</li>'
    +         '<li><strong style="color:var(--white)">Security Testing</strong> — Audit the system.</li>'
    +         '<li><strong style="color:var(--white)">Tool Packaging</strong> — Add tools to Vortex via <code>tools.json</code>.</li>'
    +       '</ul>'
    +     '</div>'
    +     '<div class="card"><h3>Workflow</h3>'
    +       '<ol class="step-list">'
    +         '<li>Fork the repository</li>'
    +         '<li>Create a branch</li>'
    +         '<li>Make your changes</li>'
    +         '<li>Test them locally</li>'
    +         '<li>Open a pull request</li>'
    +       '</ol>'
    +       '<p style="color:var(--dim);font-size:0.85rem;margin-top:16px">Adding a new tool to Vortex means adding an entry to <code>tools.json</code> — no HTML changes needed.</p>'
    +     '</div>'
    +   '</div>'
    + '</section>'

    + '<section class="section text-center reveal">'
    +   '<div class="container">'
    +     '<div class="btn-group" style="justify-content:center">'
    +       '<a href="https://github.com/placeholder" target="_blank" class="btn">GITHUB REPOSITORY</a>'
    +       '<a href="#" class="btn btn-accent">REPORT A BUG</a>'
    +       '<a href="#/docs" class="btn">DOCUMENTATION</a>'
    +     '</div>'
    +   '</div>'
    + '</section>';
}

function pageContributors() {
    return ''
    + '<section class="section">'
    +   '<div class="container">'
    +     '<h1 class="page-title">Team</h1>'
    +     '<p class="page-subtitle">Meet the four humans building Copper Linux and Vortex Linux.</p>'
    +   '</div>'
    + '</section>'

    + '<section class="section">'
    +   '<div class="container">'
    +     '<div id="contrib-grid" class="grid-2 stagger"><p style="color:var(--dim)">Fetching from GitHub API…</p></div>'
    +   '</div>'
    + '</section>';
}

function pageDocs() {
    var sections = [
        { title: 'Installation', items: ['System Requirements', 'Creating Bootable Media', 'Installation Walkthrough'] },
        { title: 'Getting Started', items: ['Initial Setup', 'Connecting to Wi-Fi', 'Desktop Usage Basics'] },
        { title: 'Package Management', items: ['Installing Software', 'Updating the System', 'Removing Packages'] },
        { title: 'Vortex Linux', items: ['Security Mode Overview', 'Tool Directory Guide', 'Network Config for Labs'] },
        { title: 'Troubleshooting', items: ['Common Boot Issues', 'Audio / Video Drivers', 'Bug Reporting Guidelines'] },
        { title: 'Development', items: ['Building from Source', 'Packaging Guidelines', 'Contributing Guide'] },
    ];

    var cards = sections.map(function(s) {
        var lis = s.items.map(function(i) { return '<li><a href="#">' + i + '</a></li>'; }).join('');
        return '<div class="card"><h3>' + s.title + '</h3><ul class="link-list">' + lis + '</ul></div>';
    }).join('');

    return ''
    + '<section class="section">'
    +   '<div class="container">'
    +     '<h1 class="page-title">Documentation</h1>'
    +     '<p class="page-subtitle">Guides, manuals, and references for Copper Linux.</p>'
    +   '</div>'
    + '</section>'
    + '<section class="section">'
    +   '<div class="container grid-2 stagger">' + cards + '</div>'
    + '</section>';
}

function page404() {
    return ''
    + '<section class="section text-center" style="min-height:60vh;display:flex;align-items:center">'
    +   '<div class="container">'
    +     '<h1 class="page-title" style="font-size:8rem;color:var(--accent)">404</h1>'
    +     '<p class="page-subtitle">Page not found.</p>'
    +     '<a href="#/" class="btn btn-accent">RETURN HOME</a>'
    +   '</div>'
    + '</section>';
}
