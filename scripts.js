/* ==========================================================================
   WEDDING E-INVITATION - COVER SCRIPTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initGuestName();
    initCountdown();
    initPetals();
    initAudioController();
});

// ==========================================================================
// 1. DYNAMIC GUEST NAME FROM URL
// ==========================================================================
function initGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    let guestParam = urlParams.get('to') || urlParams.get('name') || urlParams.get('guest') || urlParams.get('g');

    // Also support /g/GuestName pathname
    if (!guestParam && window.location.pathname.includes('/g/')) {
        const parts = window.location.pathname.split('/g/');
        if (parts[1]) {
            guestParam = parts[1].split('/')[0].split('?')[0];
        }
    }

    const guestEl = document.getElementById('guest-name');
    let decodedName = '';
    
    if (guestParam) {
        try {
            const cleaned = guestParam.replace(/\+/g, ' ');
            decodedName = cleaned.includes('%') ? decodeURIComponent(cleaned) : cleaned;
        } catch (e) {
            decodedName = guestParam.replace(/\+/g, ' ');
        }
        decodedName = decodedName.trim();

        if (guestEl && decodedName) {
            guestEl.textContent = decodedName;
        }

        // Dynamically update document & meta titles
        const dynamicTitle = `✨ ពិធីមង្គលការ ស៊ុន វណ្ណស៊ី និង លុយ កាន្និកា ✨ - Welcome ${decodedName}`;
        document.title = dynamicTitle;

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', dynamicTitle);

        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', dynamicTitle);
    }

    // Forward guest parameter to the next page link
    const openBtn = document.getElementById('open-btn');
    if (openBtn) {
        const rawHref = openBtn.getAttribute('href').split('?')[0];
        const search = window.location.search || (decodedName ? `?to=${encodeURIComponent(decodedName)}` : '');
        if (search) {
            openBtn.setAttribute('href', rawHref + search);
        }
    }
}

// ==========================================================================
// 2. LIVE COUNTDOWN TIMER (Target: January 10, 2027, 17:00:00 GMT+7)
// ==========================================================================
function initCountdown() {
    const targetDate = new Date("2027-01-10T17:00:00+07:00").getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function update() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance <= 0) {
            if (daysEl) daysEl.textContent = "00";
            if (hoursEl) hoursEl.textContent = "00";
            if (minutesEl) minutesEl.textContent = "00";
            if (secondsEl) secondsEl.textContent = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

// ==========================================================================
// 3. ROMANTIC FALLING PETALS CANVAS
// ==========================================================================
function initPetals() {
    const canvas = document.getElementById('petals-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const petalCount = window.innerWidth < 768 ? 22 : 36;
    const petals = [];

    const petalColors = [
        'rgba(245, 230, 185, 0.75)', // soft gold leaf
        'rgba(255, 248, 235, 0.85)', // warm ivory cream
        'rgba(195, 225, 205, 0.65)', // delicate sage/emerald petal
        'rgba(240, 215, 155, 0.7)',  // champagne gold
        'rgba(220, 240, 225, 0.6)'   // soft mint cream
    ];

    class Petal {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : -20;
            this.size = Math.random() * 8 + 7; // 7px - 15px
            this.speedY = Math.random() * 1.2 + 0.8;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.oscillationSpeed = Math.random() * 0.02 + 0.01;
            this.oscillationDistance = Math.random() * 30 + 10;
            this.angle = Math.random() * Math.PI * 2;
            this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        }

        update() {
            this.angle += this.oscillationSpeed;
            this.y += this.speedY;
            this.x += Math.sin(this.angle) * 0.8 + this.speedX;
            this.rotation += this.rotationSpeed;

            if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;

            // Draw organic petal shape
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.6, this.size * 0.6, 0, this.size);
            ctx.bezierCurveTo(-this.size * 0.6, this.size * 0.6, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
            ctx.fill();

            ctx.restore();
        }
    }

    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

// ==========================================================================
// 4. AUDIO CONTROLLER & STATE SHARING
// ==========================================================================
let audio = null;
let musicToggle = null;

function initAudioController() {
    audio = document.getElementById('background-music');
    musicToggle = document.getElementById('music-toggle');
    if (!audio || !musicToggle) return;

    // Check if user previously muted/unmuted
    const savedState = localStorage.getItem('wedding_music_state');
    if (savedState === 'playing') {
        playMusic();
    }

    musicToggle.addEventListener('click', () => {
        if (audio.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    });

    audio.addEventListener('play', () => {
        musicToggle.classList.add('playing');
        localStorage.setItem('wedding_music_state', 'playing');
    });

    audio.addEventListener('pause', () => {
        musicToggle.classList.remove('playing');
        localStorage.setItem('wedding_music_state', 'paused');
    });

    // Try autoplay on first interaction anywhere on page if allowed
    const enableAudioOnFirstTouch = () => {
        if (audio && audio.paused && localStorage.getItem('wedding_music_state') !== 'paused') {
            playMusic();
        }
        document.removeEventListener('click', enableAudioOnFirstTouch);
        document.removeEventListener('touchstart', enableAudioOnFirstTouch);
    };

    document.addEventListener('click', enableAudioOnFirstTouch, { once: true });
    document.addEventListener('touchstart', enableAudioOnFirstTouch, { once: true });
}

function playMusic() {
    if (!audio) return;
    audio.play().then(() => {
        if (musicToggle) musicToggle.classList.add('playing');
        localStorage.setItem('wedding_music_state', 'playing');
    }).catch(err => {
        console.log("Audio autoplay prevented by browser:", err);
    });
}

function pauseMusic() {
    if (!audio) return;
    audio.pause();
    if (musicToggle) musicToggle.classList.remove('playing');
    localStorage.setItem('wedding_music_state', 'paused');
}

// ==========================================================================
// 5. OPEN INVITATION HANDLER & FIREWORKS
// ==========================================================================
function handleOpenInvitation(event) {
    event.preventDefault();
    const targetHref = event.currentTarget.getAttribute('href');

    // Reset music so it starts over again from 0:00 when directing to intro
    if (audio) {
        audio.currentTime = 0;
    }
    localStorage.setItem('wedding_music_time', '0');
    localStorage.setItem('wedding_music_state', 'playing');
    playMusic();

    // Trigger celebration spark effect
    playSparkles();

    // Navigate to next page after a short pleasant burst
    setTimeout(() => {
        localStorage.setItem('wedding_music_time', '0');
        window.location.href = targetHref;
    }, 450);
}

function playSparkles() {
    const container = document.getElementById('fireworks-container');
    if (!container) return;

    const colors = ['#156d3e', '#259b58', '#48c774', '#ffffff', '#e8f5e9'];
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.78;

    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.left = originX + 'px';
        particle.style.top = originY + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 120 + 40;
        const dx = Math.cos(angle) * velocity + 'px';
        const dy = Math.sin(angle) * velocity + 'px';

        particle.style.setProperty('--dx', dx);
        particle.style.setProperty('--dy', dy);

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}
