/**
 * 3D Sine Wave Particle System
 * Creates an interactive, flowing 3D wave of particles.
 */

(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '-1',
        pointerEvents: 'none',
        opacity: '0.8' // Slightly higher opacity for visibility
    });

    // Remove old canvas if exists
    const oldCanvas = document.getElementById('particle-canvas');
    if (oldCanvas) oldCanvas.remove();

    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Configuration
    const config = {
        rows: 50,           // Number of particles along Z axis
        cols: 50,           // Number of particles along X axis
        separation: 40,     // Distance between particles
        waveHeight: 60,     // Amplitude of the wave
        waveSpeed: 0.02,    // Speed of animation
        color: '#4F46E5',   // Particle color
        baseY: 100,         // Vertical center offset
        rotationSpeed: 0.005 // Auto rotation
    };

    let angle = 0; // For wave animation
    let cameraAngleY = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Resize Handler
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Adjust Grid Density for Mobile
        if (width < 768) {
            config.rows = 30;
            config.cols = 20;
            config.separation = 30;
        } else {
            config.rows = 60;
            config.cols = 60;
            config.separation = 40;
        }

        config.baseY = height / 2 + 100; // Lower it a bit
        initParticles();
    }

    // Initialize Particle Grid
    function initParticles() {
        particles = [];
        for (let ix = 0; ix < config.cols; ix++) {
            for (let iy = 0; iy < config.rows; iy++) {
                particles.push({
                    ix,
                    iy,
                    cx: ix * config.separation - (config.cols * config.separation) / 2,
                    cz: iy * config.separation - (config.rows * config.separation) / 2
                });
            }
        }
    }

    // Interactions
    window.addEventListener('mousemove', (e) => {
        // Normalize mouse position -1 to 1
        mouseX = (e.clientX / width) * 2 - 1;
        mouseY = (e.clientY / height) * 2 - 1;
    });

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update Camera / Wave parameters
        angle += config.waveSpeed;

        // Gentle rotation based on mouse x
        const targetRot = mouseX * 0.5;
        cameraAngleY += (targetRot - cameraAngleY) * 0.05;

        // Draw Particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Calculate 3D Wave Position
            // Y is height, determined by Sine Wave function
            // Simple Wave: sin(x) + cos(z)
            // Complex Flow: Uses distance from center + animated angle

            const distance = Math.sqrt(p.ix * p.ix + p.iy * p.iy);
            const y = Math.sin(distance * 0.2 + angle) * config.waveHeight + Math.sin(p.ix * 0.3 + angle) * 30;

            // 3D Projection Logic
            // Rotate around Y axis
            const x = p.cx;
            const z = p.cz;

            // Rotation matrix around Y
            const rx = x * Math.cos(cameraAngleY) - z * Math.sin(cameraAngleY);
            const rz = z * Math.cos(cameraAngleY) + x * Math.sin(cameraAngleY);

            // Perspective Projection
            // Camera distance (depth)
            const fov = 400; // Field of view
            const cameraZ = 800; // Camera distance

            const scale = fov / (fov + cameraZ + rz);

            const projX = rx * scale + width / 2;
            const projY = (y * scale) + config.baseY - (mouseY * 50); // Tilt slightly with mouse Y

            // Draw Dot
            const alpha = (scale - 0.2); // Fade distant particles
            if (alpha > 0) {
                const size = 2.5 * scale;
                ctx.fillStyle = config.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(projX, projY, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1; // Reset

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

})();
