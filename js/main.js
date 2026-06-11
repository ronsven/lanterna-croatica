// ============================================
// LANTERNA CROATICA — MAIN JS
// ============================================

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduce-motion: reduce)').matches;

// ============================================
// RESERVATION MODAL MANAGEMENT
// ============================================
function openReservationModal() {
    const modal = document.getElementById('reservation-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReservationModal() {
    const modal = document.getElementById('reservation-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    const form = document.getElementById('reservation-form');
    form.style.display = 'block';
    document.getElementById('reservation-success').style.display = 'none';
    form.reset();
}

function setupReservationModal() {
    const modal = document.getElementById('reservation-modal');
    const overlay = document.getElementById('reservation-overlay');
    const closeBtn = document.getElementById('reservation-close');
    const form = document.getElementById('reservation-form');
    const reserveButtons = document.querySelectorAll('[data-reserve]');

    // Open modal on button click
    reserveButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openReservationModal();
        });
    });

    // Close on overlay click
    overlay.addEventListener('click', closeReservationModal);

    // Close on close button
    closeBtn.addEventListener('click', closeReservationModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeReservationModal();
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleReservationSubmit();
    });

    // Set minimum date to today
    const dateInput = document.getElementById('res-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Initialize custom dropdowns
    initializeCustomDropdowns();
}

function initializeCustomDropdowns() {
    const selects = document.querySelectorAll('.form-group select');

    selects.forEach((select, idx) => {
        const container = document.createElement('div');
        container.className = 'custom-select-wrapper';

        const button = document.createElement('button');
        button.className = 'custom-select-button';
        button.type = 'button';
        button.setAttribute('aria-haspopup', 'listbox');

        const list = document.createElement('div');
        list.className = 'custom-select-list';
        list.setAttribute('role', 'listbox');

        const updateButtonText = () => {
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption) {
                button.textContent = selectedOption.text;
            } else {
                button.textContent = 'Select option';
            }
        };

        updateButtonText();

        Array.from(select.options).forEach((option, optIdx) => {
            const item = document.createElement('div');
            item.className = 'custom-select-item';
            item.textContent = option.text;
            item.setAttribute('data-value', option.value);
            item.setAttribute('role', 'option');

            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                select.value = option.value;
                updateButtonText();
                list.classList.remove('active');
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });

            list.appendChild(item);
        });

        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isActive = list.classList.toggle('active');
            if (isActive) {
                const rect = button.getBoundingClientRect();
                list.style.left = rect.left + 'px';
                list.style.top = (rect.bottom + 5) + 'px';
                list.style.width = rect.width + 'px';
            }
        });

        const closeListener = (e) => {
            if (!container.contains(e.target) && list.classList.contains('active')) {
                list.classList.remove('active');
            }
        };
        document.addEventListener('click', closeListener);

        container.appendChild(button);
        container.appendChild(list);
        select.parentNode.insertBefore(container, select);

        select.style.display = 'none';
    });
}

async function handleReservationSubmit() {
    const form = document.getElementById('reservation-form');
    const formData = new FormData(form);

    const reservationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        date: formData.get('date'),
        time: formData.get('time'),
        guests: formData.get('guests'),
        notes: formData.get('notes')
    };

    console.log('Submitting reservation:', reservationData);

    try {
        // Send to Zapier webhook
        console.log('Fetching to Zapier...');
        const response = await fetch('https://hooks.zapier.com/hooks/catch/27896563/432xtgq/', {
            method: 'POST',
            body: JSON.stringify(reservationData)
        });
        console.log('Fetch response:', response);

        showReservationSuccess(reservationData);
    } catch (error) {
        console.error('Reservation error:', error);
        showReservationSuccess(reservationData);
    }
}

function showReservationSuccess(data) {
    const form = document.getElementById('reservation-form');
    const successDiv = document.getElementById('reservation-success');
    const successDetails = document.getElementById('success-details');

    form.style.display = 'none';
    successDiv.style.display = 'block';

    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    successDetails.textContent = '';
    const nameEl = document.createElement('strong');
    nameEl.textContent = data.name;
    const brEl1 = document.createElement('br');
    const dateEl = document.createTextNode(`${formattedDate} at ${data.time}`);
    const brEl2 = document.createElement('br');
    const guestEl = document.createTextNode(`Party of ${data.guests}`);

    successDetails.appendChild(nameEl);
    successDetails.appendChild(brEl1);
    successDetails.appendChild(dateEl);
    successDetails.appendChild(brEl2);
    successDetails.appendChild(guestEl);
}

// ============================================
// INTRO OVERLAY ANIMATION
// ============================================
function setupIntroAnimation() {
    const overlay = document.getElementById('intro-overlay');
    const skipBtn = document.querySelector('.intro-skip');
    const heroVideoWrapper = document.querySelector('.hero-video-wrapper');
    const heroVideo = document.getElementById('hero-video');
    let introComplete = false;

    const introTl = gsap.timeline({
        onComplete: () => {
            introComplete = true;
            removeIntroOverlay();
        }
    });

    if (!prefersReducedMotion) {
        introTl
            .to('.intro-word-lanterna', {
                clipPath: 'inset(0 0% 0 0)',
                duration: 1.8,
                ease: 'power2.out'
            })
            .to('.intro-word-croatica', {
                clipPath: 'inset(0 0% 0 0)',
                duration: 1.4,
                ease: 'power2.out'
            }, '-=0.8')
            .to('.intro-progress', {
                scaleX: 1,
                duration: 4,
                ease: 'none'
            }, 0)
            .to(overlay, {
                yPercent: -100,
                duration: 0.9,
                ease: 'power3.inOut',
                delay: 0.4
            });
    } else {
        removeIntroOverlay();
    }

    function removeIntroOverlay() {
        overlay.style.display = 'none';
        if (heroVideoWrapper) {
            heroVideoWrapper.classList.add('visible');
        }
        if (heroVideo) {
            heroVideo.play().catch(() => {
                // Fallback if autoplay is blocked
                console.log('Video autoplay blocked, attempting manual play on interaction');
            });
        }
    }

    skipBtn.addEventListener('click', () => {
        if (!introComplete) {
            introTl.progress(1);
            introComplete = true;
            removeIntroOverlay();
        }
    });

    // Hard fallback: 6 second timeout
    setTimeout(() => {
        if (!introComplete) {
            introTl.progress(1);
            introComplete = true;
            removeIntroOverlay();
        }
    }, 6000);
}

// ============================================
// HERO ENTRANCE ANIMATION
// ============================================
function setupHeroAnimation() {
    if (prefersReducedMotion) return;

    gsap.from('.hero-eyebrow, .hero-h1, .hero-tagline, .hero-ctas', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power2.out',
        delay: 0.2
    });
}

// ============================================
// ORBITAL RINGS ANIMATION
// ============================================
function setupRingAnimation() {
    if (prefersReducedMotion) return;

    gsap.to('.ring-1', {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: 'none'
    });

    gsap.to('.ring-2', {
        rotation: -360,
        duration: 45,
        repeat: -1,
        ease: 'none'
    });
}

// ============================================
// SCROLLTRIGGER REVEALS
// ============================================
function setupScrollReveals() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
        if (prefersReducedMotion) {
            el.style.opacity = '1';
            el.style.transform = 'none';
            return;
        }

        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 82%',
                once: true
            },
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power2.out'
        });
    });
}

// ============================================
// STAT COUNTERS
// ============================================
function setupStatCounters() {
    if (prefersReducedMotion) return;

    const stats = document.querySelectorAll('[data-target]');

    stats.forEach((stat) => {
        const target = parseInt(stat.dataset.target, 10);

        gsap.to(stat, {
            scrollTrigger: {
                trigger: stat.closest('.story-stats'),
                start: 'top 70%',
                once: true
            },
            textContent: target,
            duration: 1.5,
            ease: 'power2.out',
            snap: {
                textContent: 1
            }
        });
    });
}

// ============================================
// MENU CARD STAGGER
// ============================================
function setupMenuCardStagger() {
    const menuSection = document.getElementById('menu');
    const cards = document.querySelectorAll('.dish-card');

    if (!menuSection || cards.length === 0) return;

    if (prefersReducedMotion) {
        cards.forEach((card) => {
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
        return;
    }

    gsap.from(cards, {
        scrollTrigger: {
            trigger: menuSection,
            start: 'top 75%',
            once: true
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out'
    });
}

// ============================================
// NAVBAR SCROLL DETECTION
// ============================================
function setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;

        if (scrollTop > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    });
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', menuBtn.classList.contains('active'));
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            menuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================
// SMOOTH SCROLL FALLBACK
// ============================================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// LANGUAGE SWITCHER
// ============================================
function setupLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    console.log('Language buttons found:', langBtns.length);
    console.log('Translations object defined:', typeof window.translations !== 'undefined');

    if (typeof window.translations === 'undefined') {
        console.error('ERROR: Translations object is not defined!');
        return;
    }

    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    console.log('Applying language:', savedLang);

    applyLanguage(savedLang);
    updateActiveLangBtn(savedLang);

    langBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            console.log('Language button clicked:', lang);
            applyLanguage(lang);
            localStorage.setItem('selectedLanguage', lang);
            updateActiveLangBtn(lang);
        });
    });
    console.log('Language switcher setup complete');
}

function updateActiveLangBtn(lang) {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach((b) => b.classList.remove('lang-active'));
    document.querySelector(`[data-lang="${lang}"]`)?.classList.add('lang-active');
}

function applyLanguage(lang) {
    if (typeof window.translations === 'undefined') {
        console.error('ERROR: Translations object is undefined in applyLanguage');
        return;
    }

    const t = window.translations[lang];
    console.log('applyLanguage called with:', lang, 'Translation found:', !!t);
    if (!t) {
        console.error('No translation found for language:', lang, 'Available languages:', Object.keys(window.translations));
        return;
    }
    console.log('Updating DOM with', lang, 'translations...');

    const topbar = document.querySelector('.topbar-content');
    if (topbar) topbar.textContent = t.topbar;

    const storyLink = document.querySelector('[href="#story"]');
    if (storyLink) storyLink.textContent = t.nav_story;
    const menuLink = document.querySelector('[href="#menu"]');
    if (menuLink) menuLink.textContent = t.nav_menu;
    const directionLink = document.querySelector('[href="#direction"]');
    if (directionLink) directionLink.textContent = t.nav_direction;
    const visitLink = document.querySelector('[href="#visit"]');
    if (visitLink) visitLink.textContent = t.nav_visit;

    const eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow) eyebrow.textContent = t.hero_eyebrow;

    const h1 = document.querySelector('.hero-h1');
    if (h1) h1.innerHTML = `${t.hero_h1_1}<span class="hero-h1-red">${t.hero_h1_adriatic}</span><br>${t.hero_h1_2}<span class="hero-h1-red">${t.hero_h1_table}</span>`;

    const tagline = document.querySelector('.hero-tagline');
    if (tagline) tagline.textContent = t.hero_tagline;

    const heroBtns = document.querySelectorAll('.hero-ctas .btn');
    if (heroBtns[0]) heroBtns[0].textContent = t.hero_reserve;
    if (heroBtns[1]) heroBtns[1].textContent = t.hero_explore;

    const badge = document.querySelector('.pill-badge');
    if (badge) badge.textContent = t.pill_badge;

    const ownershipH2 = document.querySelector('#ownership .section-heading');
    if (ownershipH2) ownershipH2.textContent = t.ownership_h2;

    const ownershipText = document.querySelector('.section-subtext');
    if (ownershipText) ownershipText.textContent = t.ownership_text;

    const calloutContent = document.querySelector('.callout-content');
    if (calloutContent) {
        calloutContent.innerHTML = `<strong>${t.callout_title}</strong> ${t.callout_text}`;
    }

    const storyH2 = document.querySelector('#story .section-heading');
    if (storyH2) storyH2.textContent = t.story_h2;

    const storyPs = document.querySelectorAll('.story-text p');
    if (storyPs[0]) storyPs[0].textContent = t.story_p1;
    if (storyPs[1]) storyPs[1].textContent = t.story_p2;

    const stats = document.querySelectorAll('.stat-block');
    if (stats[0]) {
        const label = stats[0].querySelector('.stat-label');
        if (label) label.textContent = t.stat_1;
    }
    if (stats[1]) {
        const label = stats[1].querySelector('.stat-label');
        if (label) label.textContent = t.stat_2;
    }
    if (stats[2]) {
        const label = stats[2].querySelector('.stat-label');
        if (label) label.textContent = t.stat_3;
    }

    const menuEyebrow = document.querySelector('.menu-eyebrow');
    if (menuEyebrow) menuEyebrow.textContent = t.menu_eyebrow;

    const menuH2 = document.querySelector('#menu .section-heading');
    if (menuH2) menuH2.textContent = t.menu_h2;

    const dishCards = document.querySelectorAll('.dish-card');
    const dishes = [
        { name: t.dish_1, desc: t.dish_1_desc },
        { name: t.dish_2, desc: t.dish_2_desc },
        { name: t.dish_3, desc: t.dish_3_desc },
        { name: t.dish_4, desc: t.dish_4_desc },
        { name: t.dish_5, desc: t.dish_5_desc },
        { name: t.dish_6, desc: t.dish_6_desc },
    ];
    dishCards.forEach((card, idx) => {
        if (dishes[idx]) {
            const nameEl = card.querySelector('.dish-name');
            if (nameEl) nameEl.textContent = dishes[idx].name;
            const descEl = card.querySelector('.dish-description');
            if (descEl) descEl.textContent = dishes[idx].desc;
        }
    });

    const directionEyebrow = document.querySelector('.direction-eyebrow');
    if (directionEyebrow) directionEyebrow.textContent = t.direction_eyebrow;

    const directionH2 = document.querySelector('.direction-heading');
    if (directionH2) directionH2.innerHTML = `${t.direction_h2}<span class="direction-gold">${t.direction_h2_gold}</span>`;

    const directionText = document.querySelector('.direction-text');
    if (directionText) directionText.textContent = t.direction_text;

    const quote = document.querySelector('.quote-text');
    if (quote) quote.textContent = t.atmosphere_quote;

    const quoteFooter = document.querySelector('.quote-footer');
    if (quoteFooter) quoteFooter.textContent = t.atmosphere_footer;

    const features = document.querySelectorAll('.feature-icon-block p');
    if (features[0]) features[0].textContent = t.feature_catch;
    if (features[1]) features[1].textContent = t.feature_recipes;
    if (features[2]) features[2].textContent = t.feature_vegan;

    const visitH2 = document.querySelector('#visit .section-heading');
    if (visitH2) visitH2.textContent = t.visit_h2;

    const contactLabels = document.querySelectorAll('.contact-label');
    const contactTexts = document.querySelectorAll('.contact-text');
    if (contactLabels[0]) contactLabels[0].textContent = t.contact_address;
    if (contactTexts[0]) contactTexts[0].innerHTML = t.contact_address_text;
    if (contactLabels[1]) contactLabels[1].textContent = t.contact_phone;
    if (contactLabels[2]) contactLabels[2].textContent = t.contact_hours;
    if (contactTexts[2]) contactTexts[2].innerHTML = t.contact_hours_text;

    const mapBtn = document.querySelector('.btn-map');
    if (mapBtn) mapBtn.textContent = t.visit_map;

    const footerSubtitle = document.querySelector('.footer-subtitle');
    if (footerSubtitle) footerSubtitle.textContent = t.footer_subtitle;

    const footerLinks = document.querySelectorAll('.footer-links a');
    if (footerLinks[0]) footerLinks[0].textContent = t.footer_link_story;
    if (footerLinks[1]) footerLinks[1].textContent = t.footer_link_menu;
    if (footerLinks[2]) footerLinks[2].textContent = t.footer_link_contact;
    if (footerLinks[3]) footerLinks[3].textContent = t.footer_link_privacy;

    const copyright = document.querySelector('.footer-copyright');
    if (copyright) copyright.textContent = t.footer_copyright;

    console.log('Language update complete. All text updated to:', lang);
}

// ============================================
// INITIALIZE ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setupIntroAnimation();
    setupHeroAnimation();
    setupRingAnimation();
    setupScrollReveals();
    setupStatCounters();
    setupMenuCardStagger();
    setupNavbarScroll();
    setupMobileMenu();
    setupSmoothScroll();
    setupLanguageSwitcher();
    setupReservationModal();
});

// ============================================
// WINDOW RESIZE HANDLER
// ============================================
window.addEventListener('resize', () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.refresh());
});
