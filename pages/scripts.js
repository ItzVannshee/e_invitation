/* ==========================================================================
   WEDDING E-INVITATION - DETAIL PAGE SCRIPTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initGuestName();
    initAudioController();
    initPetals();
    initLightbox();
    initBannerZoom();
});

// ==========================================================================
// 1. DYNAMIC GUEST NAME
// ==========================================================================
function initGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to') || urlParams.get('name') || urlParams.get('guest') || urlParams.get('g');
    const guestTargetEl = document.getElementById('guest-target-name');
    
    if (guestParam && guestTargetEl) {
        try {
            const cleaned = guestParam.replace(/\+/g, ' ');
            guestTargetEl.textContent = cleaned.includes('%') ? decodeURIComponent(cleaned) : cleaned;
        } catch (e) {
            guestTargetEl.textContent = guestParam.replace(/\+/g, ' ');
        }
    }

    // Preserve guest parameter on back button
    const backBtn = document.querySelector('.floating-back-btn');
    if (backBtn && window.location.search) {
        const rawHref = backBtn.getAttribute('href').split('?')[0];
        backBtn.setAttribute('href', rawHref + window.location.search);
    }
}

// ==========================================================================
// 2. AUDIO CONTROLLER & SYNCHRONIZATION (CONTINUES FROM INTRO & REMEMBERS PAUSE)
// ==========================================================================
let audio = null;
let musicToggle = null;

function initAudioController() {
    audio = document.getElementById('background-music');
    musicToggle = document.getElementById('music-toggle');
    if (!audio || !musicToggle) return;

    // Restore saved playback position from intro page or previous session
    restoreAudioPosition();

    // Try starting music if opened from cover page or previous play state
    const savedState = localStorage.getItem('wedding_music_state');
    if (savedState !== 'paused') {
        playMusic();
    }

    musicToggle.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        if (audio.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    });

    // Track playback position continuously so it continues where it pause
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.currentTime) && audio.currentTime > 0) {
            localStorage.setItem('wedding_music_time', audio.currentTime.toFixed(2));
        }
    });

    audio.addEventListener('play', () => {
        musicToggle.classList.add('playing');
        localStorage.setItem('wedding_music_state', 'playing');
    });

    audio.addEventListener('pause', () => {
        musicToggle.classList.remove('playing');
        localStorage.setItem('wedding_music_state', 'paused');
        saveAudioPosition();
    });

    audio.addEventListener('ended', () => {
        localStorage.setItem('wedding_music_time', '0');
    });

    // Save exact position on page exit / unload
    window.addEventListener('pagehide', saveAudioPosition);
    window.addEventListener('beforeunload', saveAudioPosition);

    // Fallback on first user gesture if autoplay was initially restricted by browser
    const playOnUserGesture = () => {
        if (audio && audio.paused && localStorage.getItem('wedding_music_state') !== 'paused') {
            playMusic();
        }
        document.removeEventListener('click', playOnUserGesture);
        document.removeEventListener('touchstart', playOnUserGesture);
    };

    document.addEventListener('click', playOnUserGesture, { once: true });
    document.addEventListener('touchstart', playOnUserGesture, { once: true });
}

function restoreAudioPosition() {
    if (!audio) return;
    const savedTime = parseFloat(localStorage.getItem('wedding_music_time'));
    if (savedTime && !isNaN(savedTime) && isFinite(savedTime) && savedTime > 0) {
        const applyTime = () => {
            try {
                if (!audio.duration || savedTime < audio.duration) {
                    audio.currentTime = savedTime;
                }
            } catch (err) {
                console.log("Could not set currentTime yet:", err);
            }
        };

        if (audio.readyState >= 1) {
            applyTime();
        } else {
            audio.addEventListener('loadedmetadata', applyTime, { once: true });
            audio.addEventListener('canplay', applyTime, { once: true });
        }
    }
}

function saveAudioPosition() {
    if (audio && !isNaN(audio.currentTime) && audio.currentTime > 0) {
        localStorage.setItem('wedding_music_time', audio.currentTime.toFixed(2));
    }
}

function playMusic() {
    if (!audio) return;
    restoreAudioPosition();
    audio.play().then(() => {
        if (musicToggle) musicToggle.classList.add('playing');
        localStorage.setItem('wedding_music_state', 'playing');
        restoreAudioPosition();
    }).catch(err => {
        console.log("Audio play waiting for user interaction:", err);
    });
}

function pauseMusic() {
    if (!audio) return;
    audio.pause();
    saveAudioPosition();
    if (musicToggle) musicToggle.classList.remove('playing');
    localStorage.setItem('wedding_music_state', 'paused');
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

    const petalCount = window.innerWidth < 768 ? 20 : 32;
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
            this.size = Math.random() * 8 + 6;
            this.speedY = Math.random() * 1.1 + 0.7;
            this.speedX = Math.random() * 0.8 - 0.4;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.oscillationSpeed = Math.random() * 0.02 + 0.01;
            this.angle = Math.random() * Math.PI * 2;
            this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        }

        update() {
            this.angle += this.oscillationSpeed;
            this.y += this.speedY;
            this.x += Math.sin(this.angle) * 0.7 + this.speedX;
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
        petals.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

// ==========================================================================
// 4. INTERACTIVE PHOTO GALLERY LIGHTBOX
// ==========================================================================
let currentImageIndex = 0;
let galleryImages = [];

function initLightbox() {
    const galleryContainer = document.getElementById('wedding-gallery');
    if (!galleryContainer) return;

    // Collect all image URLs currently in the gallery
    const imgElements = galleryContainer.querySelectorAll('.gallery-item img');
    galleryImages = Array.from(imgElements).map(img => img.src);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('gallery-lightbox');
        if (!modal || !modal.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevLightbox(e);
        if (e.key === 'ArrowRight') nextLightbox(e);
    });
}

function openLightbox(index) {
    // Refresh images list in case user added photos dynamically
    const galleryContainer = document.getElementById('wedding-gallery');
    if (galleryContainer) {
        const imgElements = galleryContainer.querySelectorAll('.gallery-item img');
        galleryImages = Array.from(imgElements).map(img => img.src);
    }

    if (index < 0 || index >= galleryImages.length) return;
    currentImageIndex = index;

    const modal = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (modal && lightboxImg) {
        lightboxImg.src = galleryImages[currentImageIndex];
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
    }
}

function closeLightbox(event) {
    if (event && event.target && event.target.closest('.lightbox-content img') && !event.target.classList.contains('lightbox-close')) {
        return; // Don't close when clicking inside the image
    }

    const modal = document.getElementById('gallery-lightbox');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function prevLightbox(event) {
    if (event) event.stopPropagation();
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) lightboxImg.src = galleryImages[currentImageIndex];
}

function nextLightbox(event) {
    if (event) event.stopPropagation();
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) lightboxImg.src = galleryImages[currentImageIndex];
}

// ==========================================================================
// 5. BANNER INVITATION ZOOM & PAN CONTROLLER
// ==========================================================================
let bannerScale = 1;
let bannerPanX = 0;
let bannerPanY = 0;
let isBannerDragging = false;
let bannerStartX = 0;
let bannerStartY = 0;
let bannerInitialPinchDistance = null;
let bannerInitialScale = 1;
let lastBannerTapTime = 0;

function initBannerZoom() {
    const viewport = document.getElementById('banner-viewport');
    const zoomImg = document.getElementById('banner-zoom-img');
    if (!viewport || !zoomImg) return;

    // Mouse drag for panning when zoomed
    viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isBannerDragging = true;
        bannerStartX = e.clientX - bannerPanX;
        bannerStartY = e.clientY - bannerPanY;
        viewport.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
        if (!isBannerDragging) return;
        e.preventDefault();
        bannerPanX = e.clientX - bannerStartX;
        bannerPanY = e.clientY - bannerStartY;
        applyBannerTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isBannerDragging) {
            isBannerDragging = false;
            if (viewport) viewport.classList.remove('is-dragging');
        }
    });

    // Touch support: 1-finger drag/pan & double-tap, 2-finger pinch zoom
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const now = Date.now();
            if (now - lastBannerTapTime < 320) {
                // Double tap
                e.preventDefault();
                toggleBannerDoubleTapZoom();
                lastBannerTapTime = 0;
                return;
            }
            lastBannerTapTime = now;

            isBannerDragging = true;
            bannerStartX = e.touches[0].clientX - bannerPanX;
            bannerStartY = e.touches[0].clientY - bannerPanY;
        } else if (e.touches.length === 2) {
            isBannerDragging = false;
            bannerInitialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            bannerInitialScale = bannerScale;
        }
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isBannerDragging && bannerScale > 1) {
            e.preventDefault();
            bannerPanX = e.touches[0].clientX - bannerStartX;
            bannerPanY = e.touches[0].clientY - bannerStartY;
            applyBannerTransform();
        } else if (e.touches.length === 2 && bannerInitialPinchDistance) {
            e.preventDefault();
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scaleFactor = currentDist / bannerInitialPinchDistance;
            bannerScale = Math.min(Math.max(1, bannerInitialScale * scaleFactor), 4.5);
            applyBannerTransform();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            bannerInitialPinchDistance = null;
        }
        if (e.touches.length === 0) {
            isBannerDragging = false;
        }
    });

    // Mouse wheel zoom
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.3 : -0.3;
        zoomBanner(delta);
    }, { passive: false });

    // Double click on desktop
    zoomImg.addEventListener('dblclick', (e) => {
        e.preventDefault();
        toggleBannerDoubleTapZoom();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('banner-modal');
        if (!modal || !modal.classList.contains('active')) return;

        if (e.key === 'Escape') closeBannerModal();
        if (e.key === '+' || e.key === '=') zoomBanner(0.35);
        if (e.key === '-' || e.key === '_') zoomBanner(-0.35);
        if (e.key === '0') resetBannerZoom();
    });
}

function openBannerModal() {
    const modal = document.getElementById('banner-modal');
    if (!modal) return;
    resetBannerZoom();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBannerModal() {
    const modal = document.getElementById('banner-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleBannerModalBackdrop(e) {
    // Only close if clicking directly on the backdrop/viewport, not on toolbar buttons or image
    if (e.target.id === 'banner-modal' || e.target.id === 'banner-viewport') {
        if (!isBannerDragging && bannerScale === 1) {
            closeBannerModal();
        }
    }
}

function zoomBanner(delta) {
    bannerScale = Math.min(Math.max(1, bannerScale + delta), 4.5);
    if (bannerScale === 1) {
        bannerPanX = 0;
        bannerPanY = 0;
    }
    applyBannerTransform();
}

function resetBannerZoom() {
    bannerScale = 1;
    bannerPanX = 0;
    bannerPanY = 0;
    applyBannerTransform();
}

function toggleBannerDoubleTapZoom() {
    if (bannerScale > 1.2) {
        resetBannerZoom();
    } else {
        bannerScale = 2.4;
        applyBannerTransform();
    }
}

function applyBannerTransform() {
    const zoomImg = document.getElementById('banner-zoom-img');
    if (!zoomImg) return;
    zoomImg.style.transform = `translate(${bannerPanX}px, ${bannerPanY}px) scale(${bannerScale})`;
}
