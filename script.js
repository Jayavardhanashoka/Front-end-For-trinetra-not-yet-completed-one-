// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const analyzeBtn = document.getElementById('analyzeBtn');
const analysisOutput = document.getElementById('analysisOutput');
const typingContainer = document.getElementById('typingContainer');

// --- Navigation Logic (SPA) ---
function navigateTo(targetId) {
    const landingSections = ['home', 'about', 'services', 'contact'];

    // Update Nav
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        }
    });

    if (landingSections.includes(targetId)) {
        // Show Landing Page Wrapper
        document.getElementById('landing-page').classList.add('active-section');

        // Hide App Sections
        document.getElementById('scanner').classList.remove('active-section');
        document.getElementById('logs').classList.remove('active-section');

        // Scroll to specific section
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }

    } else {
        // App View (Scanner / Logs)
        // Hide Landing Layout
        document.getElementById('landing-page').classList.remove('active-section');

        // Show Target App Section
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active-section');
            } else if (section.id !== 'landing-page' && !landingSections.includes(section.id)) {
                // Ensure other app sections are hidden
                section.classList.remove('active-section');
            }
        });
    }

    // Change Theme colors slightly based on section
    if (targetId === 'scanner' || targetId === 'logs') {
        document.documentElement.style.setProperty('--primary-color', '#00FF9D'); // Neon Mint
        document.documentElement.style.setProperty('--secondary-color', '#002920'); // Dark Mint
    } else {
        document.documentElement.style.setProperty('--primary-color', '#00FF9D');
        document.documentElement.style.setProperty('--secondary-color', '#008F6B'); // Normal Mint
    }
}

// Event Listeners for Nav
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        navigateTo(target);
    });
});

// --- Scanner Logic ---
const fileInput = document.getElementById('fileInput');
const uploadTrigger = document.getElementById('uploadTrigger');
const scannerInput = document.getElementById('scannerInput');

if (uploadTrigger && fileInput) {
    // Trigger hidden input
    uploadTrigger.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            scannerInput.value = `[LOADING FILE METADATA]...\n> FILE: ${file.name}\n> TYPE: ${file.type}\n> SIZE: ${(file.size / 1024).toFixed(2)} KB\n\n[READY FOR ANALYSIS]`;

            // Simulate "Reading"
            uploadTrigger.classList.add('loading');
            setTimeout(() => {
                uploadTrigger.classList.remove('loading');
            }, 500);
        }
    });
}

analyzeBtn.addEventListener('click', () => {
    const input = document.getElementById('scannerInput').value;
    if (!input.trim()) return;

    // Loading State
    analyzeBtn.classList.add('loading');
    analyzeBtn.querySelector('.btn-text').innerText = 'SCANNING...';

    // Simulate delay
    setTimeout(() => {
        analyzeBtn.classList.remove('loading');
        analyzeBtn.querySelector('.btn-text').innerText = 'RUN DIAGNOSTICS';

        // Show Output
        analysisOutput.classList.remove('hidden');
        typingContainer.innerHTML = '';

        // Generate Fake Analysis
        const responseText = generateAnalysis(input);
        typeWriter(responseText, 0);

        // --- LOG LOGIC: Add to History ---
        addToLogs('USER_SCAN', input.substring(0, 40) + (input.length > 40 ? '...' : ''), 'INFO');
        setTimeout(() => {
            const isBlocked = responseText.includes('BLOCKED');
            addToLogs('SYS_RESPONSE', isBlocked ? 'Threat Detected & Blocked' : 'Analysis Complete - Safe', isBlocked ? 'HIGH' : 'LOW');
        }, 1500);

    }, 2000);
});

// --- LOGGING SYSTEM ---
const logsList = document.getElementById('logsList');
const sessionLogs = [];

function addToLogs(type, details, severity) {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const logItem = {
        time: timeString,
        type: type,
        details: details,
        severity: severity
    };

    sessionLogs.unshift(logItem); // Add to top
    renderLogs();
}

function renderLogs() {
    // Keep initial static logs if needed, or clear. For now, we prepend.
    // Let's clear and rebuild including static + session
    // Actually, simplest is to just inject the new one at the top of the DOM
    const latest = sessionLogs[0];

    const div = document.createElement('div');
    div.className = 'log-entry new-log';
    div.innerHTML = `
        <span class="time">${latest.time}</span>
        <span class="type">${latest.type}</span>
        <span class="severity ${latest.severity.toLowerCase()}">${latest.severity}</span>
        <span class="details">${latest.details}</span>
    `;

    logsList.insertBefore(div, logsList.firstChild);

    // Animate
    setTimeout(() => div.classList.add('show'), 10);

    // Update Stats
    const countEl = document.getElementById('stats-scans');
    if (countEl) {
        let count = parseInt(countEl.innerText.replace(/,/g, ''));
        countEl.innerText = (count + 1).toLocaleString();
    }
}

function generateAnalysis(input) {
    // Simple heuristic for demo purposes
    const isSuspicious = input.toLowerCase().includes('drop') || input.toLowerCase().includes('delete') || input.toLowerCase().includes('ignore previous');
    const pplScore = (Math.random() * (50 - 5) + 5).toFixed(2);

    let logs = `> [INITIATING TRINETRA PIPELINE] on input...\n` +
        `> [PRE-PROCESS]: Tokenizing & Paraphrasing (T5 Model)... DONE\n`;

    if (isSuspicious) {
        logs += `> [DETECTION]: Calculating Perplexity (PPL)... SCORE: ${pplScore} (HIGH)\n` +
            `> [ALERT]: Anomalous pattern detected (Prompt Injection Signature)\n` +
            `> [DECISION]: ★ FLAGGING AS SUSPICIOUS ★\n` +
            `> [ACTION]: Rerouting to **SANDBOX** for isolation.\n` +
            `\n[RESULT]: BLOCKED. Input treated as raw data. No execution allowed.`;
    } else {
        logs += `> [DETECTION]: Calculating Perplexity (PPL)... SCORE: ${pplScore} (NORMAL)\n` +
            `> [VALIDATION]: Keyword Scan... CLEAN\n` +
            `> [DECISION]: Input Classification -> SAFE\n` +
            `> [ACTION]: Forwarding to LLM Context Window.\n` +
            `\n[RESULT]: VERIFIED. Payload delivered to model.`;
    }

    return logs;
}

function typeWriter(text, i) {
    if (i < text.length) {
        typingContainer.innerHTML += text.charAt(i);
        // Scroll to bottom
        document.querySelector('.output-body').scrollTop = document.querySelector('.output-body').scrollHeight;
        setTimeout(() => typeWriter(text, i + 1), 30);
    }
}

// --- 3D Wireframe Grid Background & Parallax ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// Grid Parameters
const gridSize = 40;
const speed = 0.5;
let offset = 0;
let parallaxY = 0;

// Parallax Scroll Effect
window.addEventListener('scroll', () => {
    parallaxY = window.scrollY;
});

function drawGrid() {
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00FF9D'; // Neon Mint / Cyber Green
    ctx.lineWidth = 1;

    // Horizon is fixed relative to screen, but elements move with parallax
    const horizon = height * 0.4;

    ctx.save();
    // Parallax: Move the entire grid UP/DOWN based on scroll
    // but keep it subtle.
    ctx.translate(0, -parallaxY * 0.1);

    // Mute bottom part fade
    const gradient = ctx.createLinearGradient(0, horizon, 0, height);
    gradient.addColorStop(0, 'rgba(0, 255, 157, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 157, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 255, 157, 0.4)'); // Stronger at bottom

    // Vertical Lines (Simulating infinite depth)
    for (let x = -width; x < width * 2; x += gridSize) {
        ctx.beginPath();
        // Lines converge to a vanishing point at horizon
        ctx.moveTo(x + (width / 2 - x) * 0.6, horizon);
        ctx.lineTo(x, height * 2);
        ctx.strokeStyle = gradient;
        ctx.stroke();
    }

    // Horizontal Lines (Moving forward)
    const time = Date.now() * 0.002;

    // Draw "floor" lines
    for (let z = 0; z < 40; z++) {
        // Perspective logic
        const p = (z + (offset / gridSize)) / 25;

        if (p > 0) {
            const y = height - (Math.pow(p, 2) * (height - horizon));

            if (y > horizon && y < height * 1.5) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);

                // PULSE ANIMATION logic for "Alive" feel
                const pulse = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1
                const baseAlpha = (p < 0.8) ? p * 0.6 : (1 - p);
                const finalAlpha = baseAlpha * (0.5 + (pulse * 0.5));

                ctx.strokeStyle = `rgba(0, 255, 65, ${finalAlpha})`;
                ctx.stroke();
            }
        }
    }

    ctx.restore();

    offset += speed;
    if (offset > gridSize) offset = 0;

    requestAnimationFrame(drawGrid);
}

drawGrid();

// --- Micro-Interactions: Typing Reveal ---
const observerOptions = {
    threshold: 0.1
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            if (!el.hasAttribute('data-typed')) {
                el.style.visibility = 'visible';
                el.classList.add('typing-active');
                el.setAttribute('data-typed', 'true');
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.type-reveal').forEach(el => {
    el.style.visibility = 'hidden';
    revealObserver.observe(el);
});

// Inject CSS for typing animation
if (!document.getElementById('typing-style')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'typing-style';
    styleSheet.innerText = `
        .typing-active {
            overflow: hidden; 
            border-right: .15em solid var(--primary-color); 
            white-space: nowrap;
            /* Adjust step count to fit text roughly */ 
            animation: typing 2.5s steps(30, end), blink-caret .75s step-end infinite;
        }
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: var(--primary-color); } }
    `;
    document.head.appendChild(styleSheet);
}

// --- Static Cursor Block on Headers ---
function addBlinkingCursor() {
    const headers = document.querySelectorAll('h2');
    headers.forEach(header => {
        // Target specific headers mentioned: "Establish Connection" and "System Scanner"
        if (header.innerText.includes('CONNECTION') || header.innerText.includes('SCANNER')) {
            // Check if already added
            if (!header.querySelector('.cursor-block')) {
                const cursorSpan = document.createElement('span');
                cursorSpan.className = 'cursor-block';
                header.appendChild(cursorSpan);
            }
        }
    });
}
// Run once on load
addBlinkingCursor();

// --- Init ---
// Check URL hash on load
const hash = window.location.hash.substring(1);
if (hash) {
    navigateTo(hash);
} else {
    navigateTo('home');
}
