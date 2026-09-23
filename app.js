/* app.js, does smth idk*/
/* routes: whats in the url hash decides what page shows */
var ROUTES = {
    '/':              pageHome,
    '/daily-driving': pageDaily,
    '/security':      pageSecurity,
    '/tools':         pageTools,
    '/contributions': pageContributions,
    '/contributors':  pageContributors,
    '/track':         pageTrack,
};

var TITLES = {
    '/':              'Copper Linux - Practical Linux Distribution',
    '/daily-driving': 'Copper Linux - Daily Driving Mode',
    '/security':      'Vortex Linux - Security Edition',
    '/tools':         'Tools - Copper Linux / Vortex',
    '/contributions': 'Contribute - Copper Linux',
    '/contributors':  'Team - Copper Linux',
    '/track':         'Track - Copper Linux',
};

function getHash() { return location.hash.slice(1) || '/'; }

function navigate() {
    stopTrackPolling();
    var hash = getHash();
    var app  = document.getElementById('app');
    var html = (ROUTES[hash] || page404)();

    $('#app').hide();
    app.innerHTML = html;
    $('#app').fadeIn('slow');

    document.title = TITLES[hash] || TITLES['/'];
    syncTheme(hash);
    setActiveNav(hash);
    bindPageInteractions(hash);
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', navigate);
document.addEventListener('DOMContentLoaded', navigate);

/* highlight the right navbar item */
var NAV_IDS = {
    '/':              'nav-home',
    '/daily-driving': 'nav-daily',
    '/security':      'nav-vortex',
    '/tools':         'nav-tools',
    '/contributions': 'nav-contributions',
    '/contributors':  'nav-contributors',
    '/track':         'nav-track',
};

function setActiveNav(hash) {
    $('.navbar-nav li').removeClass('active');
    var id = NAV_IDS[hash];
    if (id) $('#' + id).addClass('active');
}

/* flip the accent color on vortex pages */
function syncTheme(hash) {
    var isVortex = (hash === '/security' || hash === '/tools');
    document.body.classList.toggle('vortex', isVortex);
    $('#mode-copper').toggleClass('active', !isVortex);
    $('#mode-vortex').toggleClass('active', isVortex);
}

/* page specific stuff to run after it renders */
function bindPageInteractions(hash) {
    if (hash === '/') { initCarousel(); }
    if (hash === '/daily-driving' || hash === '/security') initTerminal();
    if (hash === '/tools') loadToolsData();
    if (hash === '/contributors') renderTeam();
    if (hash === '/track') {
        renderTrack();
        $('#track-refresh').on('click', renderTrack);
    }
}

/* homepage carousel, nothing fancy */
function initCarousel() {
    $('.carousel').carousel({ interval: 4000 });
}

/* fake terminal for the daily/vortex pages, type "help" to see commands */
var TERM_COMMANDS = {
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
        'by a small team of three people.',
    ],
    version: [
        'Copper Linux v0.1.0-dev',
        'Kernel: 6.8-copper-custom',
        'Arch:   x86_64',
        'Status: In Development',
    ],
    team: [
        'TEAM:',
        '  12hrformat                 — Vortex Linux & Tools',
        '  farcrowx                   — Core System & Infrastructure',
        '  krishnarajyagru27-creator  — Package Maintenance',
    ],
    vortex: [
        'Vortex Linux — Security Edition',
        'Cybersecurity-focused reskin of Copper Linux.',
        'Preinstalled tools are planned for pentesting, CTFs, and research.',
        'WARNING: Only use on systems you own or have permission to test.',
    ],
    neofetch: [
        '         OS:     Copper Linux ',
        '         Kernel: linux',
        '         Shell:  idk i like zsh',
        '         DE:     TBD',
        '         RAM:    too expensive',
        '         Team:   3 contributors',
        '         Status: In Development',
    ],
};

function initTerminal() {
    var input = document.getElementById('term-input');
    var body  = document.getElementById('term-body');
    if (!input || !body) return;

    var wrapper = document.querySelector('.terminal-window');
    if (wrapper) wrapper.addEventListener('click', function () { input.focus(); });

    input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var raw = input.value.trim();
        var cmd = raw.toLowerCase();
        if (!raw) return;

        addLine('$ ' + raw, 'cmd');

        if (cmd === 'clear') {
            body.innerHTML = '';
        } else if (TERM_COMMANDS[cmd]) {
            TERM_COMMANDS[cmd].forEach(function (l) { addLine(l); });
        } else {
            addLine('copper: command not found: ' + raw, 'err');
        }

        input.value = '';
        body.scrollTop = body.scrollHeight;
    });

    function addLine(text, cls) {
        var d = document.createElement('div');
        d.className = 'terminal-line' + (cls ? ' ' + cls : '');
        d.textContent = text;
        body.appendChild(d);
    }
}

/* ------------------------------------------------------------------
   tools- fetch tools that are included in the os, inspired by blackarch.org
   ------------------------------------------------------------------ */
async function loadToolsData() {
    var tbody = document.getElementById('tools-tbody');
    var count = document.getElementById('tool-count');
    if (!tbody) return;

    try {
        var res   = await fetch('tools.json');
        var tools = await res.json();
        tools = Array.isArray(tools) ? tools : [];

        if (count) count.textContent = tools.length;

        if (!tools.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="tbl-name">No tools available yet — the Vortex toolkit is still in development.</td></tr>';
            return;
        }
        tbody.innerHTML = tools.map(toolRow).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="tbl-name">Failed to load tools.json.</td></tr>';
    }
}

function toolRow(t) {
    var status = t.status ? '<span class="tool-status status-' + escHtml(String(t.status).toLowerCase()) + '">' + escHtml(t.status) + '</span> ' : '';
    var cat = t.category
        ? '<td class="tbl-categorie"><a class="hcat" href="#/tools" title="' + escHtml(t.category) + '">' + escHtml(t.category) + '</a></td>'
        : '<td class="tbl-categorie">-</td>';
    var web = '<span style="color:#555">&#8212;</span>';
    if (t.url) web = '<a href="' + escHtml(t.url) + '" target="_blank"><i class="fas fa-external-link-alt fa-lg"></i></a>';
    else if (t.command) web = '<span style="color:#555" title="' + escHtml('$ ' + t.command) + '"><i class="fas fa-terminal"></i></span>';

    return '<tr>'
        + '<td class="tbl-name">' + status + escHtml(t.name || '') + '</td>'
        + '<td class="tbl-version vcat">' + escHtml(t.status || '-') + '</td>'
        + '<td class="tbl-description dcat">' + escHtml(t.description || '') + '</td>'
        + cat
        + '<td class="tbl-homepage">' + web + '</td>'
        + '</tr>';
}

/* blackarch inspired, i like blackarch ok? dont judge */
window.searchTools = function () {
    var input  = document.getElementById('searchTools');
    var filter = (input && input.value ? input.value.toUpperCase() : '');
    var table  = document.getElementById('tbl-minimalist');
    if (!table) return;
    var tr = table.getElementsByTagName('tr');
    for (var i = 0; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName('td')[0];
        var d  = tr[i].getElementsByTagName('td')[2];
        if (td) {
            var txt  = td.textContent || td.innerText;
            var txtd = d ? (d.textContent || d.innerText) : '';
            tr[i].style.display =
                (txt.toUpperCase().indexOf(filter) > -1 || txtd.toUpperCase().indexOf(filter) > -1) ? '' : 'none';
        }
    }
};

/* ------------------------------------------------------------------
   GITHUB API — shared helpers
   Optional auth token: the site loads js/gh-config.js (gitignored)
   the api gives around 5k requests per hour 
   ------------------------------------------------------------------ */
var GH_REPOS = [
    { owner: 'Copper-linux', repo: 'Copper-linux-website', label: 'Website Repository', url: 'https://github.com/Copper-linux/Copper-linux-website', branch: '12hrformat-patch-1' },
    { owner: 'Copper-linux', repo: 'copper',                label: 'Main Repository',    url: 'https://github.com/Copper-linux/copper',                branch: 'main' },
];

var GH_RATE_LIMITED = false;

function markRateLimited() {
    GH_RATE_LIMITED = true;
    showRateBanner();
}

function showRateBanner() {
    var banner = document.getElementById('track-banner');
    if (!banner || banner.firstChild) return;
    banner.innerHTML = '<div class="alert-rate"><i class="fas fa-exclamation-triangle"></i> GitHub API rate limit reached &mdash; sorry, you have to check the commits yourself :(</div>';
}

function ghToken() {
    var t = '';
    try { t = localStorage.getItem('gh_token') || ''; } catch (e) { t = ''; }
    if (!t && typeof GH_TOKEN !== 'undefined' && GH_TOKEN) t = GH_TOKEN;
    return t;
}

function ghHeaders() {
    var token = ghToken();
    return token ? { headers: { Authorization: 'token ' + token } } : {};
}

async function ghGet(path) {
    var res = await fetch('https://api.github.com' + path, ghHeaders());
    if (!res.ok) {
        if (res.status === 404) throw new Error('not found');
        if (res.status === 403) throw new Error('rate limited');
        throw new Error('http ' + res.status);
    }
    return res.json();
}

/* the three of us + avatars from github (initials if the api is down) */
var TEAM = [
    { login: 'farcrowx',                  role: 'managing github, social accounts/supporter' },
    { login: '12hrformat',                role: 'built voertex linux/the honored one' },
    { login: 'krishnarajyagru27-creator', role: 'core system of copper linux/developer' },
];

var AVATAR_CACHE = {};

async function avatarFor(login) {
    if (AVATAR_CACHE[login] !== undefined) return AVATAR_CACHE[login];
    AVATAR_CACHE[login] = '';
    try {
        var u = await ghGet('/users/' + encodeURIComponent(login));
        AVATAR_CACHE[login] = (u && u.avatar_url) || '';
    } catch (e) {
        if (e && e.message === 'rate limited') markRateLimited();
        AVATAR_CACHE[login] = '';
    }
    return AVATAR_CACHE[login];
}

function renderTeam() {
    var tbody = document.getElementById('team-tbody');
    if (!tbody) return;

    tbody.innerHTML = TEAM.map(function (m) {
        var first = (m.login || '?').charAt(0).toUpperCase();
        return '<tr>'
            + '<td><img class="team-avatar" data-login="' + escHtml(m.login) + '" alt="' + escHtml(m.login)
            + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" /></td>'
            + '<td itemprop="givenName">' + escHtml(m.login) + '</td>'
            + '<td itemprop="additionalName">@' + escHtml(m.login) + '</td>'
            + '<td><a href="https://github.com/' + escHtml(m.login) + '" target="_blank">github.com/' + escHtml(m.login) + '</a></td>'
            + '<td itemprop="jobTitle">' + escHtml(m.role) + '</td>'
            + '</tr>';
    }).join('');

    TEAM.forEach(function (m) {
        avatarFor(m.login).then(function (url) {
            var img = tbody.querySelector('img[data-login="' + m.login + '"]');
            if (!img) return;
            if (url) {
                img.src = url;
            } else {
                var ph = document.createElement('span');
                ph.className = 'avatar-ph';
                ph.textContent = (m.login || '?').charAt(0).toUpperCase();
                img.parentNode.replaceChild(ph, img);
            }
        });
    });

    Promise.all(TEAM.map(function (m) { return avatarFor(m.login); })).then(function () {
        if (GH_RATE_LIMITED && !tbody.querySelector('.rate-note')) {
            var tr = document.createElement('tr');
            tr.className = 'rate-note';
            tr.innerHTML = '<td colspan="5" class="dim-text track-warn"><i class="fas fa-exclamation-triangle"></i> GitHub rate limit reached &mdash; avatars may be missing this refresh :(</td>';
            tbody.appendChild(tr);
        }
    });
}

/* live commit feed, powers the track page */
var commitTimer = null;

function startTrackPolling() {
    stopTrackPolling();
    commitTimer = setInterval(renderTrack, 60000); /* refresh every minute */
}

function stopTrackPolling() {
    if (commitTimer) { clearInterval(commitTimer); commitTimer = null; }
}

function renderTrack() {
    var feed   = document.getElementById('track-feeds');
    var status = document.getElementById('track-status');
    var banner = document.getElementById('track-banner');
    if (!feed) return;
    startTrackPolling();

    GH_RATE_LIMITED = false;
    if (banner) banner.innerHTML = '';
    status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching latest commits&hellip;';
    feed.innerHTML = '<div class="row">'
        + GH_REPOS.map(function (r) {
            return '<div class="col-md-6 track-col">'
                + '<div class="panel panel-default text-left track-repo">'
                + '<div class="panel-heading"><b>' + escHtml(r.label) + '</b>'
                + ' <a class="branch-chip" href="' + escHtml(r.url + '/tree/' + r.branch) + '" target="_blank">' + escHtml(r.branch) + '</a>'
                + ' <a class="repo-link" href="' + escHtml(r.url) + '" target="_blank">github.com/' + escHtml(r.owner + '/' + r.repo) + '</a>'
                + '</div>'
                + '<div class="list-group-item"><div class="commit-list" data-repo="' + escHtml(r.owner + '/' + r.repo) + '">'
                + '<p class="dim-text">Loading commits&hellip;</p></div></div>'
                + '</div>'
                + '</div>';
        }).join('')
        + '</div>';

    var remaining = GH_REPOS.length;
    GH_REPOS.forEach(function (r) {
        loadRepoCommits(r).then(function () {
            remaining--;
            if (remaining <= 0) {
                status.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
            }
        });
    });
}

async function loadRepoCommits(r) {
    var box = document.querySelector('.commit-list[data-repo="' + r.owner + '/' + r.repo + '"]');
    if (!box) return;
    var cacheKey = 'track:' + r.owner + '/' + r.repo;
    try {
        var path = '/repos/' + r.owner + '/' + r.repo + '/commits?per_page=6';
        if (r.branch) path += '&sha=' + encodeURIComponent(r.branch);
        var commits = await ghGet(path);
        if (!Array.isArray(commits) || !commits.length) {
            box.innerHTML = '<p class="dim-text">No commits pushed yet.</p>';
            return;
        }
        box.innerHTML = commits.map(function (c) {
            var author = (c.commit && c.commit.author) || {};
            var login  = (c.author && c.author.login) || author.name || 'unknown';
            var avatar = (c.author && c.author.avatar_url) || '';
            var msg    = String((c.commit && c.commit.message) || '').split('\n')[0] || '(no message)';
            var sha    = String(c.sha || '').slice(0, 7);
            var when   = author.date ? timeAgo(author.date) : '';
            var link   = (c.html_url) || r.url;
            return '<div class="commit-item">'
                + '<img class="commit-avatar" alt="' + escHtml(login) + '" src="' + escHtml(avatar)
                + '" onerror="this.style.visibility=\'hidden\'" />'
                + '<div class="commit-main">'
                +   '<a class="commit-msg" href="' + escHtml(link) + '" target="_blank" title="' + escHtml(msg) + '">' + escHtml(msg) + '</a>'
                +   '<div class="commit-meta">' + escHtml(login) + ' committed ' + escHtml(when) + ' &middot; <code>' + escHtml(sha) + '</code></div>'
                + '</div>'
                + '</div>';
        }).join('');
        try { localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), html: box.innerHTML })); } catch (e) { /* storage unavailable */ }
    } catch (e) {
        if (e && e.message === 'rate limited') markRateLimited();
        var why = (e && e.message === 'not found')
            ? 'That repository does not exist yet.'
            : 'Could not reach the GitHub API (rate limit or network).';
        var cached = null;
        try { cached = JSON.parse(localStorage.getItem(cacheKey) || 'null'); } catch (e2) { cached = null; }
        if (cached && cached.html && cached.html.indexOf('commit-item') > -1) {
            box.innerHTML = '<p class="dim-text track-warn"><i class="fas fa-exclamation-triangle"></i> GitHub rate limit hit &mdash; showing last known commits.</p>' + cached.html;
        } else {
            box.innerHTML = '<p class="dim-text">' + why + '</p>';
        }
    }
}

function timeAgo(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    var s = Math.floor((Date.now() - then) / 1000);
    if (s < 60) return s + 's ago';
    var m = Math.floor(s / 60);  if (m < 60)  return m + 'm ago';
    var h = Math.floor(m / 60);  if (h < 24)  return h + 'h ago';
    var d = Math.floor(h / 24);  if (d < 30)  return d + 'd ago';
    return new Date(iso).toISOString().slice(0, 10);
}

/* tiny helpers */
function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

/* all the page html lives below (no react here sorry) */
function pageHome() {
    return ''
    /* top carousel */
    + '<header id="myCarousel" class="carousel slide" data-ride="carousel">'
    +   '<ol class="carousel-indicators">'
    +     '<li data-target="#myCarousel" data-slide-to="0" class="active"></li>'
    +     '<li data-target="#myCarousel" data-slide-to="1"></li>'
    +   '</ol>'
    +   '<div class="carousel-inner">'
    +     '<div class="item active">'
    +       '<div class="fill slide-copper"></div>'
    +       '<div class="carousel-caption"><h2>Copper Linux <br />Practical Linux Distribution</h2></div>'
    +     '</div>'
    +     '<div class="item">'
    +       '<div class="fill slide-vortex"></div>'
    +       '<div class="carousel-caption"><h2>Vortex Linux <br />Security-Focused Edition</h2></div>'
    +     '</div>'
    +   '</div>'
    +   '<a class="left carousel-control" data-target="#myCarousel" data-slide="prev"><span class="icon-prev"></span></a>'
    +   '<a class="right carousel-control" data-target="#myCarousel" data-slide="next"><span class="icon-next"></span></a>'
    + '</header>'

    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title header-copper"><h1>Copper</h1> <h2>Homepage</h2></div>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>About</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>This is the homepage for Copper Linux, a distro three people are putting together because nothing else quite fit. Early days: nothing to download yet, plenty of rough edges.</p>'
    +           '<p>Something broken or missing? Open an issue on the <a href="https://github.com/Copper-linux/copper" target="_blank">GitHub repo</a>, or fix it yourself and send a pull request.</p>'
    +           '<p>Status: <span class="blyellow">Still in development</span> — neither Copper nor Vortex is installable yet.</p>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-lg-12"><h2 class="page-header">Editions</h2></div>'
    +     '<div class="col-md-6">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Copper — Daily Driving Mode</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>A plain desktop for getting real work done: school, code, media, the boring stuff that matters.</p>'
    +           '<div class="code-block"><p class="command">copper --status</p><p>Still in development — not available yet.</p></div>'
    +           '<a href="#/daily-driving" class="btn btn-default">Daily Driving Mode &rarr;</a>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-md-6">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Vortex — Security Edition</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>Copper rebuilt for security work: pentesting, CTFs, lab boxes. The toolkit gets assembled as we go.</p>'
    +           '<div class="code-block"><p class="command">vortex --tools list</p><p>Not available yet — still in development.</p></div>'
    +           '<a href="#/security" class="btn btn-default">Security Mode &rarr;</a>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function pageDaily() {
    return ''
    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title"><h1>Copper</h1> <h2>Daily Driving Mode</h2></div>'
    +       '<ol class="breadcrumb"><li><a href="#/">Home</a></li><li class="active">Copper</li></ol>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>About</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>A desktop distro for web, code, school, work and media. We\'re three people, so there will be bugs and glitches. <a href="https://github.com/Copper-linux/copper" target="_blank">Tell us about them</a> and we\'ll actually try to fix them.</p>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-md-6">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>What\'s In It Right Now</b></div>'
    +         '<div class="list-group-item">'
    +           '<ul class="list-group">'
    +             '<li class="list-group-item"><i class="fas fa-check" style="color:#6ae400;margin-right:8px"></i>A desktop that boots without drama</li>'
    +             '<li class="list-group-item"><i class="fas fa-check" style="color:#6ae400;margin-right:8px"></i>Browser, terminal, editor — the basics that count</li>'
    +             '<li class="list-group-item"><i class="fas fa-check" style="color:#6ae400;margin-right:8px"></i>Setup that doesn\'t need a wiki page</li>'
    +             '<li class="list-group-item"><i class="fas fa-check" style="color:#6ae400;margin-right:8px"></i>A dev environment ready for actual work</li>'
    +           '</ul>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-md-6">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>What\'s Not Ready Yet</b></div>'
    +         '<div class="list-group-item">'
    +           '<ul class="list-group">'
    +             '<li class="list-group-item"><i class="fas fa-hourglass-half" style="color:#e1e111;margin-right:8px"></i>A settings app you can find</li>'
    +             '<li class="list-group-item"><i class="fas fa-hourglass-half" style="color:#e1e111;margin-right:8px"></i>Updates that don\'t nuke your config</li>'
    +             '<li class="list-group-item"><i class="fas fa-hourglass-half" style="color:#e1e111;margin-right:8px"></i>Less fiddling to get toolchains running</li>'
    +           '</ul>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-lg-12"><h2 class="page-header">Try It</h2></div>'
    +     '<div class="col-lg-12">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>tty0 &mdash; copper@copper</b></div>'
    +         '<div class="list-group-item">'
    +           terminalBlock('copper@copper', 'Copper Linux v0.1.0-dev — Development Edition', 'Type "help" for available commands.', '$')
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-lg-12"><h2 class="page-header">Downloads</h2></div>'
    +     '<div class="col-lg-12">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Download Copper Linux</b></div>'
    +         '<div class="list-group-item">'
    +           '<div class="info" style="border-color:#e1e111"><p><i class="fas fa-exclamation-triangle"></i> <b>Still in development.</b> No ISOs yet — there is literally nothing to download.</p></div>'
    +           '<div class="code-block"><p class="command">copper --status</p><p>Copper Linux</p><p>Status:   still in development</p><p>Downloads: not available yet</p></div>'
    +           '<a href="https://github.com/Copper-linux/copper" target="_blank" class="btn btn-default">View on GitHub</a>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function pageSecurity() {
    return ''
    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title"><h1>Vortex</h1> <h2>Security Edition</h2></div>'
    +       '<ol class="breadcrumb"><li><a href="#/">Home</a></li><li class="active">Vortex</li></ol>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>About</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>Vortex is Copper rebuilt for security work: pentesting, CTFs, network testing, lab boxes. It\'s a reskin with its own toolkit, and that toolkit is still being put together.</p>'
    +           '<div class="info" style="border-color:#ff2c2c"><p><i class="fas fa-exclamation-triangle"></i> <b>CRITICAL:</b> Only use security tools against systems you own or have explicit permission to test.</p></div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-lg-12"><h2 class="page-header">Who It\'s For</h2></div>'
    +     '<div class="col-lg-12">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>The Crowd</b></div>'
    +         '<div class="list-group-item">'
    +           '<ul class="list-group">'
    +             '<li class="list-group-item"><i class="fas fa-user-secret" style="color:#4BA6E7;margin-right:8px"></i>People with a lab box</li>'
    +             '<li class="list-group-item"><i class="fas fa-bug" style="color:#4BA6E7;margin-right:8px"></i>Pentesters who read the docs</li>'
    +             '<li class="list-group-item"><i class="fas fa-flag" style="color:#4BA6E7;margin-right:8px"></i>CTF addicts</li>'
    +             '<li class="list-group-item"><i class="fas fa-graduation-cap" style="color:#4BA6E7;margin-right:8px"></i>Students on machines they own</li>'
    +           '</ul>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-lg-12"><h2 class="page-header">Terminal</h2></div>'
    +     '<div class="col-lg-12">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>tty0 &mdash; root@vortex</b></div>'
    +         '<div class="list-group-item">'
    +           terminalBlock('root@vortex', 'Vortex Linux (Copper Security Edition)', 'Type "help" for available commands.', '#')
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="col-lg-12"><h2 class="page-header">Included Toolkit</h2></div>'
    +     '<div class="col-lg-12">'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Tools</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>Vortex isn\'t available yet. The preconfigured toolkit gets filled in as we build the thing — no ETA, check back when we say so.</p>'
    +           '<a href="#/tools" class="btn btn-default">Tools Directory &rarr;</a>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function pageTools() {
    return ''
    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title"><h1>Tools</h1> <h2>Hacking Tools List</h2></div>'
    +       '<ol class="breadcrumb"><li><a href="#/">Home</a></li><li class="active">Tools</li></ol>'
    +     '</div>'
    +     '<div class="panel panel-default text-left">'
    +       '<div class="panel-heading"><b>Information</b></div>'
    +       '<div class="list-group-item">'
    +         '<p>Every tool in the Vortex toolkit lands in the table below. Missing one? Open an <a href="https://github.com/Copper-linux/copper/issues/new" target="_blank">issue</a>, or PR it yourself into <code>tools.json</code>.</p>'
    +         '<p><span class="blyellow">Still in development:</span> no tools shipped yet, so this list is mostly empty. It fills in as Vortex comes together.</p>'
    +         '<p><b>Tool count:</b> <a href="#/tools"><span id="tool-count">0</span></a>'
    +         '<input type="text" id="searchTools" onkeyup="searchTools()" placeholder="Input tool name" title="Type in a name"></p>'
    +       '</div>'
    +     '</div>'
    +     '<div class="panel panel-default text-left">'
    +       '<div class="panel-heading"><b>Copper / Vortex Complete Tools List</b></div>'
    +       '<div class="list-group-item">'
    +         '<table id="tbl-minimalist">'
    +           '<thead>'
    +             '<tr id="idx-tool">'
    +               '<th class="tbl-name">Name</th>'
    +               '<th class="tbl-version">Status</th>'
    +               '<th class="tbl-description">Description</th>'
    +               '<th class="tbl-categorie">Category</th>'
    +               '<th class="tbl-homepage">Website</th>'
    +             '</tr>'
    +           '</thead>'
    +           '<tbody id="tools-tbody">'
    +             '<tr><td colspan="5" class="tbl-name">Loading tools…</td></tr>'
    +           '</tbody>'
    +         '</table>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function pageContributions() {
    return ''
    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title"><h1>Contribute</h1> <h2>How To Help</h2></div>'
    +       '<ol class="breadcrumb"><li><a href="#/">Home</a></li><li class="active">Contribute</li></ol>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>What We Need</b></div>'
    +         '<div class="list-group-item">'
    +           '<ul class="list-group">'
    +             '<li class="list-group-item"><i class="fas fa-code" style="color:#4BA6E7;margin-right:8px"></i><b>Code</b> &mdash; find a bug and fix it. Core utilities especially.</li>'
    +             '<li class="list-group-item"><i class="fas fa-bug" style="color:#4BA6E7;margin-right:8px"></i><b>Bug Reports</b> &mdash; something broke? tell us exactly what you did.</li>'
    +             '<li class="list-group-item"><i class="fas fa-flask" style="color:#4BA6E7;margin-right:8px"></i><b>Testing</b> &mdash; flash a test ISO on weird hardware, report what explodes.</li>'
    +             '<li class="list-group-item"><i class="fas fa-wrench" style="color:#4BA6E7;margin-right:8px"></i><b>Tools</b> &mdash; help fill <code>tools.json</code> as Vortex comes together.</li>'
    +           '</ul>'
    +         '</div>'
    +       '</div>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>How It Works</b></div>'
    +         '<div class="list-group-item">'
    +           '<ol class="list-group">'
    +             '<li class="list-group-item"><span class="blgreen">1</span>&nbsp; Fork it</li>'
    +             '<li class="list-group-item"><span class="blgreen">2</span>&nbsp; Make a branch and do the thing</li>'
    +             '<li class="list-group-item"><span class="blgreen">3</span>&nbsp; Test it so it doesn\'t explode</li>'
    +             '<li class="list-group-item"><span class="blgreen">4</span>&nbsp; Open a pull request</li>'
    +             '<li class="list-group-item"><span class="blgreen">5</span>&nbsp; Wait. We\'re three people.</li>'
    +           '</ol>'
    +           '<p>New Vortex tool? Drop an entry in <code>tools.json</code>. No HTML surgery required.</p>'
    +         '</div>'
    +       '</div>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Get Started</b></div>'
    +         '<div class="list-group-item">'
    +           '<a href="https://github.com/Copper-linux/copper" target="_blank" class="btn btn-default">GitHub Repository</a> '
    +           '<a href="#/track" class="btn btn-default">Track Development</a>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function pageContributors() {
    return ''
    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title"><h1>Team</h1> <h2>Contributors</h2></div>'
    +       '<ol class="breadcrumb"><li><a href="#/">Home</a></li><li class="active">Team</li></ol>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Developers</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>Copper Linux is built by exactly the three people below. Be nice to them.</p>'
    +           teamTable()
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function pageTrack() {
    return ''
    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title"><h1>Track</h1> <h2>Recent Commits</h2></div>'
    +       '<ol class="breadcrumb"><li><a href="#/">Home</a></li><li class="active">Track</li></ol>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Live Development Feed</b>'
    +           ' <button type="button" id="track-refresh" class="btn btn-default btn-xs">Refresh now</button>'
    +         '</div>'
    +         '<div class="list-group-item">'
    +           '<div class="info"><p><i class="fas fa-sync-alt"></i> Refreshes every minute. Tracking <b>12hrformat-patch-1</b> on the website repo and <b>main</b> on the OS repo.</p></div>'
    +           '<div id="track-banner"></div>'
    +           '<div id="track-status" class="track-status"></div>'
    +           '<div id="track-feeds"></div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function page404() {
    return ''
    + '<div class="container">'
    +   '<div class="row">'
    +     '<div class="col-lg-12">'
    +       '<div class="page-header page-header-title"><h1>404</h1> <h2>Lost?</h2></div>'
    +       '<ol class="breadcrumb"><li><a href="#/">Home</a></li><li class="active">404</li></ol>'
    +       '<div class="panel panel-default text-left">'
    +         '<div class="panel-heading"><b>Error</b></div>'
    +         '<div class="list-group-item">'
    +           '<p>idk what youre searching for but it inst here</p>'
    +           '<p class="dim-text">Maybe a typo, maybe a dead link. Either way, nope.</p>'
    +           '<a href="#/" class="btn btn-default">Return Home</a>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

/* bits reused by a few pages */
function teamTable() {
    return '<table id="developers">'
        + '<thead><tr>'
        +   '<th><b>Avatar</b></th><th><b>Name</b></th><th><b>Nickname</b></th><th><b>GitHub</b></th><th><b>Role</b></th>'
        + '</tr></thead>'
        + '<tbody id="team-tbody"><tr><td colspan="5" class="tbl-name">Loading team…</td></tr></tbody>'
        + '</table>';
}

function terminalBlock(title, bootLine, hintLine, prompt) {
    return '<div class="terminal-window">'
        + '<div class="terminal-titlebar"><span>tty0</span><span>' + escHtml(title || '') + '</span></div>'
        + '<div class="terminal-body" id="term-body">'
        +   '<div class="terminal-line sys">' + escHtml(bootLine) + '</div>'
        +   '<div class="terminal-line sys">' + escHtml(hintLine) + '</div>'
        + '</div>'
        + '<div class="terminal-input-row">'
        +   '<span class="terminal-prompt">' + (prompt || '$') + '</span>'
        +   '<input type="text" id="term-input" class="terminal-input" autocomplete="off" spellcheck="false" placeholder="type a command...">'
        + '</div>'
        + '</div>';
}
