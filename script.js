// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const analyzeBtn = document.getElementById('analyzeBtn');
const analysisOutput = document.getElementById('analysisOutput');
const typingContainer = document.getElementById('typingContainer');

// --- Navigation Logic (SPA) ---
function navigateTo(targetId) {
    // Update Nav
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        }
    });

    // Update Sections
    sections.forEach(section => {
        section.classList.remove('active-section');
        if (section.id === targetId) {
            section.classList.add('active-section');
        }
    });

    // Change Theme colors slightly based on section (Optional enhancement)
    if (targetId === 'scanner' || targetId === 'logs') {
        document.documentElement.style.setProperty('--primary-color', '#ff0055'); // Red/Pink for 'System' mode
        document.documentElement.style.setProperty('--secondary-color', '#ffcc00'); // Yellow
    } else {
        document.documentElement.style.setProperty('--primary-color', '#00ff9d'); // Green for Home
        document.documentElement.style.setProperty('--secondary-color', '#00bcd4'); // Cyan
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
    }, 2000);
});

function generateAnalysis(input) {
    return `> [INITIATING DEEP SCAN] on target: "${input.substring(0, 20)}..."\n` +
           `> Analyzing packet structure... OK\n` +
           `> Checking vulnerability database (CVE)... DONE\n` +
           `> Heuristic analysis... \n` +
           `\n[RESULT]:\n` +
           `  - Threat Level: MODERATE\n` +
           `  - Anomalies Detected: 3\n` +
           `  - Recommendation: Isolate segment and patch port 8080.\n` +
           `\n> Analysis Complete. Log saved to secure vault.`;
}

function typeWriter(text, i) {
    if (i < text.length) {
        typingContainer.innerHTML += text.charAt(i);
        // Scroll to bottom
        document.querySelector('.output-body').scrollTop = document.querySelector('.output-body').scrollHeight;
        setTimeout(() => typeWriter(text, i + 1), 30);
    }
}

// --- Background Animation (Canvas) ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        this.color = `rgba(0, 255, 157, ${Math.random() * 0.5})`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    resize();
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connections
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.05)';
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
initParticles();
animate();

// --- Init ---
// Check URL hash on load
const hash = window.location.hash.substring(1);
if (hash) {
    navigateTo(hash);
} else {
    navigateTo('home');
}
