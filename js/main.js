// ============================================
// LANTERNA CROATICA — MAIN JS
// ============================================

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduce-motion: reduce)').matches;

// ============================================
// RESERVATION MODAL MANAGEMENT
// ============================================
let isSubmittingReservation = false;

function openReservationModal() {
    const modal = document.getElementById('reservation-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReservationModal() {
    const modal = document.getElementById('reservation-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset to step 1
    document.getElementById('reservation-step-1').classList.add('active');
    document.getElementById('reservation-step-2').style.display = 'none';
    document.getElementById('reservation-success').style.display = 'none';

    const form = document.getElementById('reservation-form');
    form.reset();
}

function setupReservationModal() {
    console.log('setupReservationModal called');
    const modal = document.getElementById('reservation-modal');
    const overlay = document.getElementById('reservation-overlay');
    const closeBtn = document.getElementById('reservation-close');
    const form = document.getElementById('reservation-form');
    const reserveButtons = document.querySelectorAll('[data-reserve]');

    console.log('Reservation modal elements:', { modal, overlay, closeBtn, form, reserveButtonCount: reserveButtons.length });

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

    // Form submission (with guard against duplicate submissions)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isSubmittingReservation) {
            console.warn('Submission already in progress, ignoring duplicate submit');
            return;
        }
        isSubmittingReservation = true;
        try {
            await handleReservationSubmit();
        } finally {
            isSubmittingReservation = false;
        }
    });

    // Setup calendar picker
    setupCalendarPicker();

    // Setup number picker (with small delay to ensure DOM is ready)
    setTimeout(() => {
        setupNumberPicker();
    }, 100);

    // Setup step transitions
    setupStepNavigation();

    // Initialize custom dropdowns for time picker
    initializeCustomDropdowns();
}

function setupCalendarPicker() {
    console.log('setupCalendarPicker called');
    const btn = document.getElementById('date-picker-btn');
    const popup = document.getElementById('date-picker-popup');
    const dateInput = document.getElementById('res-date');

    console.log('Calendar picker elements:', { btn, popup, dateInput });

    if (!btn || !popup || !dateInput) {
        console.error('Calendar picker elements not found!');
        return;
    }

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    const minDate = new Date();
    minDate.setDate(minDate.getDate());

    const renderCalendar = () => {
        const daysContainer = document.getElementById('date-picker-days');
        const monthDisplay = document.getElementById('date-picker-month');
        daysContainer.innerHTML = '';

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('button');
            day.type = 'button';
            day.className = 'date-day other-month';
            day.textContent = daysInPrevMonth - i;
            day.disabled = true;
            daysContainer.appendChild(day);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = 'date-day';
            dayBtn.textContent = day;

            const currentDate = new Date(currentYear, currentMonth, day);
            const isToday = currentDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            const isSelected = dateInput.value === currentDate.toISOString().split('T')[0];
            const isDisabled = currentDate < minDate;

            if (isDisabled) {
                dayBtn.classList.add('disabled');
                dayBtn.disabled = true;
            } else {
                dayBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    dateInput.value = currentDate.toISOString().split('T')[0];
                    renderCalendar();
                    updateDateButton();
                    popup.style.display = 'none';
                });
            }

            if (isSelected) {
                dayBtn.classList.add('selected');
            }

            daysContainer.appendChild(dayBtn);
        }

        // Next month days
        const totalCells = daysContainer.children.length;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = 'date-day other-month';
            dayBtn.textContent = day;
            dayBtn.disabled = true;
            daysContainer.appendChild(dayBtn);
        }
    };

    const updateDateButton = () => {
        if (dateInput.value) {
            const dateObj = new Date(dateInput.value + 'T00:00:00');
            const formatted = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            btn.textContent = formatted;
            btn.style.color = 'var(--text)';
        }
    };

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
        if (popup.style.display === 'block') {
            renderCalendar();
        }
    });

    document.getElementById('date-prev-month').addEventListener('click', (e) => {
        e.preventDefault();
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('date-next-month').addEventListener('click', (e) => {
        e.preventDefault();
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Close popup on outside click
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !popup.contains(e.target)) {
            popup.style.display = 'none';
        }
    });

    updateDateButton();
}

function setupNumberPicker() {
    const minusBtn = document.getElementById('guests-minus');
    const plusBtn = document.getElementById('guests-plus');
    const display = document.getElementById('guests-display');
    const input = document.getElementById('res-guests');

    console.log('setupNumberPicker: Looking for elements...');
    console.log('minusBtn:', minusBtn);
    console.log('plusBtn:', plusBtn);
    console.log('display:', display);
    console.log('input:', input);

    if (!minusBtn || !plusBtn || !display || !input) {
        console.error('Number picker elements not found!');
        return;
    }

    console.log('Number picker elements found, attaching listeners...');

    const minGuests = 1;
    const maxGuests = 8;

    const updateDisplay = () => {
        const current = parseInt(input.value, 10) || 2;
        display.textContent = current;
    };

    const decreaseGuests = () => {
        const current = parseInt(input.value, 10) || 2;
        if (current > minGuests) {
            input.value = current - 1;
            updateDisplay();
        }
    };

    const increaseGuests = () => {
        const current = parseInt(input.value, 10) || 2;
        if (current < maxGuests) {
            input.value = current + 1;
            updateDisplay();
        }
    };

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        decreaseGuests();
    });

    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        increaseGuests();
    });

    // Also support keyboard/touch
    minusBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        decreaseGuests();
    });

    plusBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        increaseGuests();
    });

    updateDisplay();
}

function setupStepNavigation() {
    console.log('setupStepNavigation called');
    const searchBtn = document.getElementById('res-search-btn');
    const backBtn = document.getElementById('res-back-btn');
    const step1 = document.getElementById('reservation-step-1');
    const step2 = document.getElementById('reservation-step-2');
    const summary = document.getElementById('res-summary');

    console.log('Step navigation elements:', { searchBtn, backBtn, step1, step2, summary });

    if (!searchBtn || !backBtn) {
        console.error('Step navigation buttons not found!');
        return;
    }

    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const date = document.getElementById('res-date').value;
        const time = document.getElementById('res-time').value;
        const guests = document.getElementById('res-guests').value;

        // Validate
        if (!date || !time) {
            alert('Please select date and time');
            return;
        }

        // Format date for display
        const dateObj = new Date(date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        // Update summary
        summary.textContent = `${formattedDate} • ${guests} Guests • ${time}`;

        // Sync date/time/guests to Step 2 form hidden inputs
        const formDateInput = document.querySelector('#reservation-form #res-date');
        const formTimeInput = document.querySelector('#reservation-form #res-time');
        const formGuestsInput = document.querySelector('#reservation-form #res-guests');
        if (formDateInput) formDateInput.value = date;
        if (formTimeInput) formTimeInput.value = time;
        if (formGuestsInput) formGuestsInput.value = guests;

        // Switch to step 2
        step1.classList.remove('active');
        step2.style.display = 'block';
    });

    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        step1.classList.add('active');
        step2.style.display = 'none';
    });
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

function normalizePhoneNumber(phone) {
    if (!phone) return phone;
    phone = phone.trim();
    // If starts with 0, replace with +385 (Croatian country code)
    if (phone.startsWith('0')) {
        return '+385' + phone.slice(1);
    }
    // If doesn't start with +, assume Croatian and add +385
    if (!phone.startsWith('+')) {
        return '+385' + phone;
    }
    return phone;
}

async function handleReservationSubmit() {
    const form = document.getElementById('reservation-form');
    const formData = new FormData(form);

    const reservationData = {
        customer_name: formData.get('name'),
        customer_phone: normalizePhoneNumber(formData.get('phone')),
        date: formData.get('date'),
        time: formData.get('time'),
        guests: parseInt(formData.get('guests'), 10)
    };

    console.log('Submitting reservation:', reservationData);

    try {
        const response = await fetch('https://lanterna-api.onrender.com/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'dev-key-lanterna'
            },
            body: JSON.stringify(reservationData)
        });
        console.log('API response:', response);

        showReservationSuccess({ name: formData.get('name'), date: formData.get('date'), time: formData.get('time'), guests: formData.get('guests') });
    } catch (error) {
        console.error('Reservation error:', error);
        showReservationSuccess({ name: formData.get('name'), date: formData.get('date'), time: formData.get('time'), guests: formData.get('guests') });
    }
}

function showReservationSuccess(data) {
    const step2 = document.getElementById('reservation-step-2');
    const successDiv = document.getElementById('reservation-success');
    const successDetails = document.getElementById('success-details');

    step2.style.display = 'none';
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
            .to('.intro-image', {
                clipPath: 'inset(0 0% 0 0)',
                opacity: 1,
                duration: 1.8,
                ease: 'power2.out'
            })
            .to('.intro-word-lanterna', {
                clipPath: 'inset(0 0% 0 0)',
                duration: 1.8,
                ease: 'power2.out'
            }, 0.2)
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
// MENU DATA (4 LANGUAGES) — ACTUAL RESTAURANT MENU
// ============================================
const menuData = {
    en: {
        eyebrow: 'Traditional Menu',
        title: 'Menu',
        categories: [
            {
                name: 'Cold appetizers',
                items: [
                    { name: 'Carpaccio (fish, beef)', price: 15 },
                    { name: 'Dalmatian prosciutto', price: 15 },
                    { name: 'Sheep cheese', price: 15 },
                    { name: 'Octopus salad', price: 16 }
                ]
            },
            {
                name: 'Hot appetizers',
                items: [
                    { name: 'Pasta Bolognese', price: 10 },
                    { name: 'Seafood Pasta', price: 18 },
                    { name: 'Pasta Carbonara', price: 15 }
                ]
            },
            {
                name: 'Meat dishes',
                items: [
                    { name: 'Steak (pork, veal)', price: 15 },
                    { name: 'Fillet (pork, beef, chicken)', price: 12 },
                    { name: 'Veal from the bread oven (sliced veal shank)', price: 25 },
                    { name: 'Suckling from the bread oven', price: 24 }
                ]
            },
            {
                name: 'Fish, crabs, shellfish',
                items: [
                    { name: 'Squid - fried', price: 16 },
                    { name: 'Squid - grilled', price: 16 },
                    { name: 'Sea bass in a crust (from the bread oven)', price: 25 },
                    { name: 'Clams on the bazar - 1 kg', price: 30 },
                    { name: 'Small fish - mix', price: 10 },
                    { name: 'Scallops (grilled)', price: 10 },
                    { name: 'Grilled shrimp - 1kg', price: 85 },
                    { name: 'Tuna steak', price: 18 }
                ]
            },
            {
                name: 'Soups',
                items: [
                    { name: 'Daily soup', price: 4 },
                    { name: 'Daily offer of ready meals', description: '' }
                ]
            },
            {
                name: 'Side dishes',
                items: [
                    { name: 'Fried potatoes', price: 4 },
                    { name: 'Boiled salted potatoes', price: 4 },
                    { name: 'Vegetables (grilled)', price: 5 },
                    { name: 'Swiss chard with potatoes', price: 5 },
                    { name: 'Baked potatoes', price: 4 },
                    { name: 'Cheese croquettes', price: 4 }
                ]
            },
            {
                name: 'Pizzas',
                items: [
                    { name: 'Lanterna (tomato, cheese, ham, prosciutto, mushrooms, cream, paprika)', description: '' },
                    { name: 'Margherita (tomato, cheese)', description: '' },
                    { name: 'Funghi (tomato, cheese, mushrooms)', description: '' },
                    { name: 'Semplice - simple (tomato, cheese, ham)', description: '' },
                    { name: 'Piccante (tomato, cheese, ham, chilli peppers)', description: '' },
                    { name: 'Vegetariana (tomato, cheese, vegetables, corn, mushrooms)', description: '' },
                    { name: 'Al tonno - with tuna (tomato, cheese, tuna, onion)', description: '' },
                    { name: 'Slavonska (Slavonian) (tomato, cheese, ham, salami, kulen, bacon, chilli peppers)', description: '' }
                ]
            },
            {
                name: 'Salads',
                items: [
                    { name: 'Season salad', price: 4 },
                    { name: 'Salad "Lanterna"', price: 10 }
                ]
            },
            {
                name: 'Meal Accompaniments',
                items: [
                    { name: 'Sauces', isCategory: true, items: [
                        { name: 'Tomato sauce', price: 4 },
                        { name: 'Mayonnaise', price: 4 },
                        { name: 'Tartar sauce', price: 4 },
                        { name: 'Ajvar', price: 4 },
                        { name: 'Mustard', price: 4 },
                        { name: 'Cream', price: 4 },
                        { name: 'Parmesan', price: 5 },
                        { name: 'Peppers, olives, corn, mushrooms', price: 5 }
                    ]}
                ]
            },
            {
                name: 'Deserts',
                items: [
                    { name: 'Tiramisu', price: 8 },
                    { name: 'Chocolate Surprise', price: 9 },
                    { name: 'Pancakes with Chocolate/Jam', price: 6 },
                    { name: 'Pancakes with Ice Cream', price: 7 },
                    { name: 'Ice Cream (portion)', price: 6 }
                ]
            }
        ]
    },
    hr: {
        eyebrow: 'Jelovnik',
        title: 'Menu',
        categories: [
            {
                name: 'Hladna predjela',
                items: [
                    { name: 'Carpaccio (riba, govedina)', price: 15 },
                    { name: 'Dalmatinski pršut', price: 15 },
                    { name: 'Ovčji sir', price: 15 },
                    { name: 'Salata od hobotnice', price: 16 }
                ]
            },
            {
                name: 'Topla predjela',
                items: [
                    { name: 'Pašta Bolognese', price: 10 },
                    { name: 'Tjestenina s plodovima mora', price: 18 },
                    { name: 'Pašta Carbonara', price: 15 }
                ]
            },
            {
                name: 'Jela od mesa',
                items: [
                    { name: 'Odrezak (svinjski, teleći)', price: 15 },
                    { name: 'File (svinjski, juneći, pileći)', price: 12 },
                    { name: 'Teletina iz krušne peći (rezana teleća koljenica)', price: 25 },
                    { name: 'Odojak iz krušne peći', price: 24 }
                ]
            },
            {
                name: 'Ribe, rakovi, školjke',
                items: [
                    { name: 'Lignje - pržene', price: 16 },
                    { name: 'Lignje - na žaru', price: 16 },
                    { name: 'Brancin u škartocu (iz krušne peći)', price: 25 },
                    { name: 'Školjke na buzaru - 1 kg', price: 30 },
                    { name: 'Sitna riba - mix', price: 10 },
                    { name: 'Jakobove kapice (žar)', price: 10 },
                    { name: 'Škampi na žaru - 1kg', price: 85 },
                    { name: 'Tuna steak', price: 18 }
                ]
            },
            {
                name: 'Juhe',
                items: [
                    { name: 'Dnevna juha', price: 4 }
                ]
            },
            {
                name: 'Dnevna ponuda gotovih jela',
                items: []
            },
            {
                name: 'Prilozi',
                items: [
                    { name: 'Prženi krumpir', price: 4 },
                    { name: 'Kuhani slani krumpir', price: 4 },
                    { name: 'Povrće (žar)', price: 5 },
                    { name: 'Blitva s krumpirom', price: 5 },
                    { name: 'Pekarski krumpir', price: 4 },
                    { name: 'Kroketi od sira', price: 4 }
                ]
            },
            {
                name: 'Pizze',
                items: [
                    { name: 'Lanterna (rajčica, sir, šunka, pršut, gljive, vrhnje, paprika)', description: '' },
                    { name: 'Margherita (rajčica, sir)', description: '' },
                    { name: 'Funghi (rajčica, sir, gljive)', description: '' },
                    { name: 'Semplice - jednostavna (rajčica, sir, šunka)', description: '' },
                    { name: 'Piccante (rajčica, sir, šunka, feferoni)', description: '' },
                    { name: 'Vegetariana (rajčica, sir, povrće, kukuruz, gljive)', description: '' },
                    { name: 'Al tonno - sa tunom (rajčica, sir, tuna, luk)', description: '' },
                    { name: 'Slavonska (rajčica, sir, šunka, salama, kulen, špek, feferoni)', description: '' }
                ]
            },
            {
                name: 'Salate',
                items: [
                    { name: 'Sezonska salata', price: 4 },
                    { name: 'Salata Lanterna', price: 10 }
                ]
            },
            {
                name: 'Slastice',
                items: [
                    { name: 'Tiramisu', price: 8 },
                    { name: 'Čokoladno iznenađenje', price: 9 },
                    { name: 'Palačinke s čokoladom / marmeladom', price: 6 },
                    { name: 'Palačinke sa sladoledom', price: 7 },
                    { name: 'Sladoled (porcija)', price: 6 }
                ]
            },
            {
                name: 'Dodatci jelima',
                items: [
                    { name: 'Umaci', isCategory: true, items: [
                        { name: 'umak od rajčice', price: 4 },
                        { name: 'majoneza', price: 4 },
                        { name: 'tartar umak', price: 4 },
                        { name: 'ajvar', price: 4 },
                        { name: 'senf', price: 4 },
                        { name: 'vrhnje', price: 4 },
                        { name: 'Parmezan', price: 5 },
                        { name: 'Feferoni, masline, kukuruz, gljive', price: 5 }
                    ]}
                ]
            }
        ]
    },
    de: {
        eyebrow: 'Speisekarte',
        title: 'Menu',
        categories: [
            {
                name: 'Kalte Vorspeisen',
                items: [
                    { name: 'Carpaccio (Fisch, Rind)', price: 15 },
                    { name: 'Dalmatiner-Schinken', price: 15 },
                    { name: 'Schafskäse', price: 15 },
                    { name: 'Oktopussalat', price: 16 }
                ]
            },
            {
                name: 'Warme Vorspeisen',
                items: [
                    { name: 'Pasta Bolognese', price: 10 },
                    { name: 'Pasta mit Meeresfrüchten', price: 18 },
                    { name: 'Pasta Carbonara', price: 15 }
                ]
            },
            {
                name: 'Fleischgerichte',
                items: [
                    { name: 'Steak (Schwein, Kalb)', price: 15 },
                    { name: 'Filet (Schwein, Rind, Huhn)', price: 12 },
                    { name: 'Kalbsbraten (Kalbshaxe in Scheiben)', price: 25 },
                    { name: 'Spanferkel', price: 24 }
                ]
            },
            {
                name: 'Fische, Krebse, Weichtiere',
                items: [
                    { name: 'Frittierte Calamari', price: 16 },
                    { name: 'Gegrillte Calamari', price: 16 },
                    { name: 'Panierter Wolfsbarsch (gebacken)', price: 25 },
                    { name: 'Venusmuscheln (1 kg)', price: 30 },
                    { name: 'Gemischte kleine Fische', price: 10 },
                    { name: 'Gegrillte Jakobsmuscheln', price: 10 },
                    { name: 'Gegrillte Garnelen (1 kg)', price: 85 },
                    { name: 'Thunfischsteak', price: 18 }
                ]
            },
            {
                name: 'Suppen',
                items: [
                    { name: 'Tägliche Suppe', price: 4 },
                    { name: 'Auswahl an Fertiggerichten, die täglich wechselt', description: '' }
                ]
            },
            {
                name: 'Beilagen',
                items: [
                    { name: 'Bratkartoffeln', price: 4 },
                    { name: 'Gesalzene Kartoffeln', price: 4 },
                    { name: 'Gegrilltes Gemüse', price: 5 },
                    { name: 'Mangold mit Kartoffeln', price: 5 },
                    { name: 'Ofenkartoffeln', price: 4 },
                    { name: 'Käsekroketten', price: 4 }
                ]
            },
            {
                name: 'Pizzen',
                items: [
                    { name: 'Lanterna (Tomate, Käse, Schinken, Prosciutto, Pilze, Sahne, Paprika)', description: '' },
                    { name: 'Margherita (Tomate, Käse)', description: '' },
                    { name: 'Pilze (Tomaten, Käse, Pilze)', description: '' },
                    { name: 'Einfach – einfach (Tomate, Käse, Schinken)', description: '' },
                    { name: 'Piccante (Tomate, Käse, Schinken, Chilischoten)', description: '' },
                    { name: 'Vegetariana (Tomaten, Käse, Gemüse, Mais, Pilze)', description: '' },
                    { name: 'Al tonno – mit Thunfisch (Tomate, Käse, Thunfisch, Zwiebel)', description: '' },
                    { name: 'Slavonska (Slawonisch) (Tomaten, Käse, Schinken, Salami, Kulen, Speck, Chilischoten)', description: '' }
                ]
            },
            {
                name: 'Salate',
                items: [
                    { name: 'Salat würzen', price: 4 },
                    { name: 'Salat „Laterne"', price: 10 }
                ]
            },
            {
                name: 'Speisenzusätze',
                items: [
                    { name: 'Saucen', isCategory: true, items: [
                        { name: 'Tomatensauce', price: 4 },
                        { name: 'Mayonnaise', price: 4 },
                        { name: 'Remouladensauce', price: 4 },
                        { name: 'Ajvar', price: 4 },
                        { name: 'Senf', price: 4 },
                        { name: 'Sahne', price: 4 },
                        { name: 'Parmesan', price: 5 },
                        { name: 'Paprika, Oliven, Mais, Pilze', price: 5 }
                    ]}
                ]
            },
            {
                name: 'Desserts',
                items: [
                    { name: 'Tiramisu', price: 8 },
                    { name: 'Schokoladenüberraschung', price: 9 },
                    { name: 'Pfannkuchen mit Schokolade/Marmelade', price: 6 },
                    { name: 'Pfannkuchen mit Eiscreme', price: 7 },
                    { name: 'Eiscreme (Portion)', price: 6 }
                ]
            }
        ]
    },
    it: {
        eyebrow: 'Traditional Menu',
        title: 'Menu',
        categories: [
            {
                name: 'Cold appetizers',
                items: [
                    { name: 'Carpaccio (fish, beef)', description: '' },
                    { name: 'Dalmatian prosciutto', description: '' },
                    { name: 'Sheep cheese', description: '' },
                    { name: 'Octopus salad', description: '' }
                ]
            },
            {
                name: 'Hot appetizers',
                items: [
                    { name: 'Pasta Bolognese', description: '' },
                    { name: 'Seafood Pasta', description: '' },
                    { name: 'Pasta Carbonara', description: '' }
                ]
            },
            {
                name: 'Meat dishes',
                items: [
                    { name: 'Steak (pork, veal)', description: '' },
                    { name: 'Fillet (pork, beef, chicken)', description: '' },
                    { name: 'Veal from the bread oven (sliced veal shank)', description: '' },
                    { name: 'Suckling from the bread oven', description: '' }
                ]
            },
            {
                name: 'Fish, crabs, shellfish',
                items: [
                    { name: 'Squid - fried', description: '' },
                    { name: 'Squid - grilled', description: '' },
                    { name: 'Sea bass in a crust (from the bread oven)', description: '' },
                    { name: 'Clams on the bazar - 1 kg', description: '' },
                    { name: 'Small fish - mix', description: '' },
                    { name: 'Scallops (grilled)', description: '' },
                    { name: 'Grilled shrimp - 1kg', description: '' },
                    { name: 'Tuna steak', description: '' }
                ]
            },
            {
                name: 'Soups',
                items: [
                    { name: 'Daily soup', description: '' },
                    { name: 'Daily offer of ready meals', description: '' }
                ]
            },
            {
                name: 'Side dishes',
                items: [
                    { name: 'Fried potatoes', description: '' },
                    { name: 'Boiled salted potatoes', description: '' },
                    { name: 'Vegetables (grilled)', description: '' },
                    { name: 'Swiss chard with potatoes', description: '' },
                    { name: 'Baked potatoes', description: '' },
                    { name: 'Cheese croquettes', description: '' }
                ]
            },
            {
                name: 'Pizzas',
                items: [
                    { name: 'Lanterna (tomato, cheese, ham, prosciutto, mushrooms, cream, paprika)', description: '' },
                    { name: 'Margherita (tomato, cheese)', description: '' },
                    { name: 'Funghi (tomato, cheese, mushrooms)', description: '' },
                    { name: 'Semplice - simple (tomato, cheese, ham)', description: '' },
                    { name: 'Piccante (tomato, cheese, ham, chilli peppers)', description: '' },
                    { name: 'Vegetariana (tomato, cheese, vegetables, corn, mushrooms)', description: '' },
                    { name: 'Al tonno - with tuna (tomato, cheese, tuna, onion)', description: '' },
                    { name: 'Slavonska (Slavonian) (tomato, cheese, ham, salami, kulen, bacon, chilli peppers)', description: '' }
                ]
            },
            {
                name: 'Salads',
                items: [
                    { name: 'Season salad', description: '' },
                    { name: 'Salad "Lanterna"', description: '' }
                ]
            },
            {
                name: 'Deserts',
                items: [
                    { name: 'Tiramisu', description: '' },
                    { name: 'Chocolate Surprise', description: '' },
                    { name: 'Pancakes with Chocolate/Jam', description: '' },
                    { name: 'Pancakes with Ice Cream', description: '' },
                    { name: 'Ice Cream (portion)', description: '' }
                ]
            }
        ]
    },
    hu: {
        eyebrow: 'Étlap',
        title: 'Étlap',
        categories: [
            {
                name: 'Hideg előételek',
                items: [
                    { name: 'Carpaccio (hal, marhahús)', price: 15 },
                    { name: 'Dalmát sonka', price: 15 },
                    { name: 'Juhtejből készült sajt', price: 15 },
                    { name: 'Polip saláta', price: 16 }
                ]
            },
            {
                name: 'Meleg előételek',
                items: [
                    { name: 'Bolognai tészta', price: 10 },
                    { name: 'Tenger gyümölcsei tészta', price: 18 },
                    { name: 'Carbonara tészta', price: 15 }
                ]
            },
            {
                name: 'Húsételek',
                items: [
                    { name: 'Steak (sertés-, borjúhús)', price: 15 },
                    { name: 'Bélszín (sertés-, marha-, csirkehús)', price: 12 },
                    { name: 'Sült borjú (szeletelt borjúcsülök)', price: 25 },
                    { name: 'Szopós malac', price: 24 }
                ]
            },
            {
                name: 'Levesek',
                items: [
                    { name: 'Napi leves', price: 4 },
                    { name: 'Napi ajánlat', description: '' }
                ]
            },
            {
                name: 'Halak, rákok, puhatestűek',
                items: [
                    { name: 'Sült kalamári', price: 16 },
                    { name: 'Grillezett kalamári', price: 16 },
                    { name: 'Panírozott tengeri sügér (sült)', price: 25 },
                    { name: 'Kagyló (1 kg)', price: 30 },
                    { name: 'Vegyes apró halak', price: 10 },
                    { name: 'Grillezett fésűkagyló', price: 10 },
                    { name: 'Grillezett garnélarák (1 kg)', price: 85 },
                    { name: 'Tonhalszelet', price: 18 }
                ]
            },
            {
                name: 'Kiegészítők',
                items: [
                    { name: 'Hasábburgonya', price: 4 },
                    { name: 'Sózott burgonya', price: 4 },
                    { name: 'Grillezett zöldségek', price: 5 },
                    { name: 'Mángold burgonyával', price: 5 },
                    { name: 'Sült burgonya', price: 4 },
                    { name: 'Sajtos krokettek', price: 4 }
                ]
            },
            {
                name: 'Élelmiszer-kiegészítések',
                items: [
                    { name: 'Szószok', isCategory: true, items: [
                        { name: 'Paradicsomszósz', price: 4 },
                        { name: 'Majonéz', price: 4 },
                        { name: 'Remuládmártás', price: 4 },
                        { name: 'Ajvár', price: 4 },
                        { name: 'Mustár', price: 4 },
                        { name: 'Tejszín', price: 4 },
                        { name: 'Parmezán sajt', price: 5 },
                        { name: 'Pepperóni, olajbogyó, kukorica, gomba', price: 5 }
                    ]}
                ]
            },
            {
                name: 'Pizzák',
                items: [
                    { name: 'Lanterna (Paradicsom, sajt, főtt sonka, prosciutto, gomba, tejszín, paprika)', description: '' },
                    { name: 'Margherita (Paradicsom, sajt)', description: '' },
                    { name: 'Gombával (Paradicsom, sajt, gomba)', description: '' },
                    { name: 'Egyszerű (Paradicsom, sajt, főtt sonka)', description: '' },
                    { name: 'Csípős (Paradicsom, sajt, főtt sonka, chili paprika)', description: '' },
                    { name: 'Vegetáriánus (Paradicsom, sajt, zöldségek, kukorica, gomba)', description: '' },
                    { name: 'Tonhallal (Paradicsom, sajt, tonhal, hagyma)', description: '' },
                    { name: 'Slava (Paradicsom, sajt, főtt sonka, szalámi, kulen, bacon, chili paprika)', description: '' }
                ]
            },
            {
                name: 'Saláták',
                items: [
                    { name: 'Salátaöntet', price: 4 },
                    { name: 'Lámpássaláta', price: 10 }
                ]
            },
            {
                name: 'Desszertek',
                items: [
                    { name: 'Tiramisu', price: 8 },
                    { name: 'Csokis meglepetés', price: 9 },
                    { name: 'Palacsinta csokoládéval/lekvárral', price: 6 },
                    { name: 'Palacsinta fagylalttal', price: 7 },
                    { name: 'Fagylalt (adag)', price: 6 }
                ]
            }
        ]
    },
    it: {
        eyebrow: 'Menu',
        title: 'Menu',
        categories: [
            {
                name: 'Antipasti freddi',
                items: [
                    { name: 'Carpaccio (pesce, manzo)', price: 15 },
                    { name: 'Prosciutto dalmata', price: 15 },
                    { name: 'Formaggio di pecora', price: 15 },
                    { name: 'Insalata di polpo', price: 16 }
                ]
            },
            {
                name: 'Antipasti caldi',
                items: [
                    { name: 'Pasta alla bolognese', price: 10 },
                    { name: 'Pasta ai frutti di mare', price: 18 },
                    { name: 'Pasta alla carbonara', price: 15 }
                ]
            },
            {
                name: 'Piatti di carne',
                items: [
                    { name: 'Bistecca (di maiale, vitello)', price: 15 },
                    { name: 'Filetto (di maiale, manzo, pollo)', price: 12 },
                    { name: 'Arrosto di vitello (stinco di vitello a fette)', price: 25 },
                    { name: 'Maialino da latte', price: 24 }
                ]
            },
            {
                name: 'Pesci, granchi, molluschi',
                items: [
                    { name: 'Calamari fritti', price: 16 },
                    { name: 'Calamari alla griglia', price: 16 },
                    { name: 'Branzino impanato (cotto al forno)', price: 25 },
                    { name: 'Vongole (1 kg)', price: 30 },
                    { name: 'Mix di piccoli pesci', price: 10 },
                    { name: 'Capesante alla griglia', price: 10 },
                    { name: 'Gamberi alla griglia (1 kg)', price: 85 },
                    { name: 'Trancio di tonno', price: 18 }
                ]
            },
            {
                name: 'Zuppe',
                items: [
                    { name: 'Zuppa quotidiana', price: 4 },
                    { name: 'Selezione di piatti pronti che cambia ogni giorno', description: '' }
                ]
            },
            {
                name: 'Supplementi',
                items: [
                    { name: 'Patate fritte', price: 4 },
                    { name: 'Patate salate', price: 4 },
                    { name: 'Verdure grigliate', price: 5 },
                    { name: 'Bietole con patate', price: 5 },
                    { name: 'Patate al forno', price: 4 },
                    { name: 'Crocchette di formaggio', price: 4 },
                    { name: 'Salsa di pomodoro', description: '' },
                    { name: 'Maionese', description: '' },
                    { name: 'Salsa remoulade', description: '' },
                    { name: 'Ajvar', description: '' },
                    { name: 'Senape', description: '' },
                    { name: 'Panna da cucina', description: '' },
                    { name: 'Parmigiano Reggiano', description: '' },
                    { name: 'Pepperoni, olive, mais, funghi', description: '' }
                ]
            },
            {
                name: 'Pizze',
                items: [
                    { name: 'Lanterna (Pomodoro, formaggio, prosciutto cotto, prosciutto crudo, funghi, panna, peperoni)', description: '' },
                    { name: 'Margherita (Pomodoro, formaggio)', description: '' },
                    { name: 'Ai funghi (Pomodoro, formaggio, funghi)', description: '' },
                    { name: 'Semplice (Pomodoro, formaggio, prosciutto cotto)', description: '' },
                    { name: 'Piccante (Pomodoro, formaggio, prosciutto cotto, peperoncino)', description: '' },
                    { name: 'Vegetariana (Pomodoro, formaggio, verdure, mais, funghi)', description: '' },
                    { name: 'Al tonno (Pomodoro, formaggio, tonno, cipolla)', description: '' },
                    { name: 'Slava (Pomodoro, formaggio, prosciutto cotto, salame, kulen, pancetta, peperoncino)', description: '' }
                ]
            },
            {
                name: 'Insalate',
                items: [
                    { name: 'Condire un\'insalata', price: 4 },
                    { name: 'Insalata "Lanterna"', price: 10 }
                ]
            },
            {
                name: 'Accompagnamenti',
                items: [
                    { name: 'Salse', isCategory: true, items: [
                        { name: 'Salsa di pomodoro', price: 4 },
                        { name: 'Maionese', price: 4 },
                        { name: 'Salsa remoulade', price: 4 },
                        { name: 'Ajvar', price: 4 },
                        { name: 'Senape', price: 4 },
                        { name: 'Panna da cucina', price: 4 },
                        { name: 'Parmigiano Reggiano', price: 5 },
                        { name: 'Peperoni, olive, mais, funghi', price: 5 }
                    ]}
                ]
            },
            {
                name: 'Dolci',
                items: [
                    { name: 'Tiramisù', price: 8 },
                    { name: 'Sorpresa al cioccolato', price: 9 },
                    { name: 'Pancake con cioccolato/marmellata', price: 6 },
                    { name: 'Pancake con gelato', price: 7 },
                    { name: 'Gelato (porzione)', price: 6 }
                ]
            }
        ]
    }
};

const drinksData = {
    en: {
        eyebrow: 'Beverages',
        title: 'Drinks',
        categories: [
            {
                name: 'Non-alcoholic drinks',
                items: [
                    { name: 'Juice - 0.20 l (strawberry, blackcurrant, apricot, pear)', description: '' },
                    { name: 'Cedevita - 0.20 l', description: '' },
                    { name: 'Iced tea - 0.20 l', description: '' },
                    { name: 'Coca Cola; Fanta; Sprite, Schweppes - 0.25 l bottle', description: '' },
                    { name: 'Toco juice', description: '' },
                    { name: 'Hidra - 0.5 l bottle', description: '' },
                    { name: 'Mineral water - bottle', description: '' },
                    { name: 'Mineral water - 1 l bottle', description: '' },
                    { name: 'Still water - bottle', description: '' }
                ]
            },
            {
                name: 'Beers',
                items: [
                    { name: 'Karlovačko', description: '' },
                    { name: 'Budwieser', description: '' },
                    { name: 'Heineken', description: '' }
                ]
            },
            {
                name: 'Wine',
                items: [
                    { name: 'Table wine - 0.10 l', description: '' },
                    { name: 'Table wine 0.20 l', description: '' },
                    { name: 'Table wine - 0.25 l', description: '' },
                    { name: 'Table wine - 0.50 l', description: '' },
                    { name: 'Table wine - 1 l', description: '' },
                    { name: 'White wine (table) - 1 l', description: '' }
                ]
            },
            {
                name: 'Liqueurs - 0.03 l',
                items: [
                    { name: 'Pelinkovac', description: '' },
                    { name: 'Amaro', description: '' },
                    { name: 'Jägermeister', description: '' },
                    { name: 'Baileys', description: '' },
                    { name: 'Teranino', description: '' },
                    { name: 'Aperol sprite', description: '' }
                ]
            },
            {
                name: 'Spirits - 0.03 l',
                items: [
                    { name: 'Stock', description: '' },
                    { name: 'Vodka', description: '' },
                    { name: 'Jack Daniels', description: '' },
                    { name: 'Baccardi rum', description: '' },
                    { name: 'Gin (imported)', description: '' },
                    { name: 'Rakhia - 0,03 l', description: '' },
                    { name: 'Lozovača', description: '' },
                    { name: 'Travarica', description: '' },
                    { name: 'Šljivovica', description: '' },
                    { name: 'Medica', description: '' }
                ]
            },
            {
                name: 'Hot drinks',
                items: [
                    { name: 'Espresso', description: '' },
                    { name: 'Macchiato', description: '' },
                    { name: 'Capuccino', description: '' },
                    { name: 'White coffee', description: '' },
                    { name: 'Coffee with cream', description: '' },
                    { name: 'Milk', description: '' },
                    { name: 'Tea', description: '' }
                ]
            }
        ]
    },
    hr: {
        eyebrow: 'Pića',
        title: 'Beverages',
        categories: [
            {
                name: 'Bezalkoholna pića',
                items: [
                    { name: 'Sok - 0,20 l (jagoda, crni ribiz, marelica, kruška)', description: '' },
                    { name: 'Cedevita - 0,20 l', description: '' },
                    { name: 'Ledeni čaj - 0,20 l', description: '' },
                    { name: 'Coca Cola; Fanta; Sprite, Schweppes - boca 0,25 l', description: '' },
                    { name: 'Toco', description: '' },
                    { name: 'Hidra - boca 0,5 l', description: '' },
                    { name: 'Mineralna voda - boca', description: '' },
                    { name: 'Mineralna voda - boca 1 l', description: '' },
                    { name: 'Negazirana voda - boca', description: '' }
                ]
            },
            {
                name: 'Pivo',
                items: [
                    { name: 'Karlovačko', description: '' },
                    { name: 'Budwieser', description: '' },
                    { name: 'Heineken', description: '' }
                ]
            },
            {
                name: 'Vino',
                items: [
                    { name: 'Stolno vino - 0,10 l', description: '' },
                    { name: 'Stolno vino 0,20 l', description: '' },
                    { name: 'Stolno vino - 0,25 l', description: '' },
                    { name: 'Stolno vino - 0,50 l', description: '' },
                    { name: 'Stolno vino - 1 l', description: '' },
                    { name: 'Bijelo vino (stolno) - 1 l', description: '' }
                ]
            },
            {
                name: 'Likeri - 0,03 l',
                items: [
                    { name: 'Pelinkovac', description: '' },
                    { name: 'Amaro', description: '' },
                    { name: 'Jägermeister', description: '' },
                    { name: 'Baileys', description: '' },
                    { name: 'Teranino', description: '' },
                    { name: 'Aperol sprite', description: '' }
                ]
            },
            {
                name: 'Žestoka pića - 0,03 l',
                items: [
                    { name: 'Stock', description: '' },
                    { name: 'Vodka', description: '' },
                    { name: 'Jack Daniels', description: '' },
                    { name: 'Baccardi rum', description: '' },
                    { name: 'Gin (uvozni)', description: '' },
                    { name: 'Lozovača', description: '' },
                    { name: 'Travarica', description: '' },
                    { name: 'Šljivovica', description: '' },
                    { name: 'Medica', description: '' }
                ]
            },
            {
                name: 'Topli napitci',
                items: [
                    { name: 'Espresso', description: '' },
                    { name: 'Macchiato', description: '' },
                    { name: 'Capuccino', description: '' },
                    { name: 'Bijela kava', description: '' },
                    { name: 'Kava sa šlagom', description: '' },
                    { name: 'Mlijeko', description: '' },
                    { name: 'Čaj', description: '' }
                ]
            }
        ]
    },
    de: {
        eyebrow: 'Getränke',
        title: 'Beverages',
        categories: [
            {
                name: 'Alkoholfreie Getränke',
                items: [
                    { name: 'Saft – 0,20 l (Erdbeere, Schwarze Johannisbeere, Aprikose, Birne)', description: '' },
                    { name: 'Cedevita – 0,20 l', description: '' },
                    { name: 'Eistee – 0,20 l', description: '' },
                    { name: 'Coca-Cola, Fanta, Sprite, Schweppes – 0,25-l-Flasche', description: '' },
                    { name: 'Toco-Saft', description: '' },
                    { name: 'Hidra – 0,5-l-Flasche', description: '' },
                    { name: 'Mineralwasser – Flasche', description: '' },
                    { name: 'Mineralwasser – 1-l-Flasche', description: '' },
                    { name: 'Stilles Wasser – Flasche', description: '' }
                ]
            },
            {
                name: 'Biere',
                items: [
                    { name: 'Karlovačko', description: '' },
                    { name: 'Budwieser', description: '' },
                    { name: 'Heineken', description: '' }
                ]
            },
            {
                name: 'Wein',
                items: [
                    { name: 'Tafelwein – 0,10 l', description: '' },
                    { name: 'Tafelwein – 0,20 l', description: '' },
                    { name: 'Tafelwein – 0,25 l', description: '' },
                    { name: 'Tafelwein – 0,50 l', description: '' },
                    { name: 'Tafelwein – 1 l', description: '' },
                    { name: 'Weißwein (Tafelwein) – 1 l', description: '' }
                ]
            },
            {
                name: 'Liköre - 0,03 l',
                items: [
                    { name: 'Pelinkovac', description: '' },
                    { name: 'Amaro', description: '' },
                    { name: 'Jägermeister', description: '' },
                    { name: 'Baileys', description: '' },
                    { name: 'Teranino', description: '' },
                    { name: 'Aperol sprite', description: '' }
                ]
            },
            {
                name: 'Spirituosen - 0,03 l',
                items: [
                    { name: 'Stock', description: '' },
                    { name: 'Wodka', description: '' },
                    { name: 'Jack Daniels', description: '' },
                    { name: 'Baccardi Rum', description: '' },
                    { name: 'Gin (importiert)', description: '' },
                    { name: 'Lozovača', description: '' },
                    { name: 'Travarica', description: '' },
                    { name: 'Šljivovica', description: '' },
                    { name: 'Medica', description: '' }
                ]
            },
            {
                name: 'Heiße Getränke',
                items: [
                    { name: 'Espresso', description: '' },
                    { name: 'Macchiato', description: '' },
                    { name: 'Capuccino', description: '' },
                    { name: 'Weiß kaffee', description: '' },
                    { name: 'Kaffee mit Schlag', description: '' },
                    { name: 'Milch', description: '' },
                    { name: 'Tee', description: '' }
                ]
            }
        ]
    },
    hu: {
        eyebrow: 'Italok',
        title: 'Italok',
        categories: [
            {
                name: 'Alkoholmentes italok',
                items: [
                    { name: 'Gyümölcslé – 0,20 l (Eper, Fekete ribizli, Sárgabarack, Körte)', description: '' },
                    { name: 'Cedevita – 0,20 l', description: '' },
                    { name: 'Jeges tea - 0,20 l', description: '' },
                    { name: 'Coca-Cola, Fanta, Sprite, Schweppes – 0,25 l-es üveg', description: '' },
                    { name: 'Toco Juice', description: '' },
                    { name: 'Hidra - 0,5 l-es üveg', description: '' },
                    { name: 'Ásványvíz - üveg', description: '' },
                    { name: 'Ásványvíz - 1 l-es üveg', description: '' },
                    { name: 'Szénsavmentes víz – üveg', description: '' }
                ]
            },
            {
                name: 'Sör',
                items: [
                    { name: 'Karlovačko', description: '' },
                    { name: 'Budwieser', description: '' },
                    { name: 'Heineken', description: '' }
                ]
            },
            {
                name: 'Bor',
                items: [
                    { name: 'Asztali bor – 0,10 l', description: '' },
                    { name: 'Asztali bor – 0,20 l', description: '' },
                    { name: 'Asztali bor – 0,25 l', description: '' },
                    { name: 'Asztali bor – 0,50 l', description: '' },
                    { name: 'Asztali bor – 1 l', description: '' },
                    { name: 'Fehérbor (asztali bor) - 1 l', description: '' }
                ]
            },
            {
                name: 'Likőrök - 0,03 l',
                items: [
                    { name: 'Pelinkovac', description: '' },
                    { name: 'Amaro', description: '' },
                    { name: 'Jägermeister', description: '' },
                    { name: 'Baileys', description: '' },
                    { name: 'Teranino', description: '' },
                    { name: 'Aperol sprite', description: '' }
                ]
            },
            {
                name: 'Rövid italok - 0,03 l',
                items: [
                    { name: 'Stock', description: '' },
                    { name: 'Wodka', description: '' },
                    { name: 'Jack Daniels', description: '' },
                    { name: 'Bacardi Rum', description: '' },
                    { name: 'Gin (importato)', description: '' }
                ]
            },
            {
                name: 'Rakija - 0,03 l',
                items: [
                    { name: 'Lozovača', description: '' },
                    { name: 'Travarica', description: '' },
                    { name: 'Šljivovica', description: '' },
                    { name: 'Medica', description: '' }
                ]
            },
            {
                name: 'Meleg italok',
                items: [
                    { name: 'Espresso', description: '' },
                    { name: 'Macchiato', description: '' },
                    { name: 'Cappuccino', description: '' },
                    { name: 'Fehér kávé', description: '' },
                    { name: 'Kávé tejszínhabbal', description: '' },
                    { name: 'Tej', description: '' }
                ]
            }
        ]
    },
    it: {
        eyebrow: 'Bevande',
        title: 'Beverages',
        categories: [
            {
                name: 'Bevande analcoliche',
                items: [
                    { name: 'Succo di frutta – 0,20 l (Fragola, Ribes nero, Albicocca, Pera)', description: '' },
                    { name: 'Cedevita – 0,20 l', description: '' },
                    { name: 'Tè freddo – 0,20 l', description: '' },
                    { name: 'Coca-Cola, Fanta, Sprite, Schweppes – bottiglia da 0,25 l', description: '' },
                    { name: 'Succo Toco', description: '' },
                    { name: 'Hidra – bottiglia da 0,5 l', description: '' },
                    { name: 'Acqua minerale – bottiglia', description: '' },
                    { name: 'Acqua minerale – bottiglia da 1 l', description: '' },
                    { name: 'Acqua naturale – bottiglia', description: '' }
                ]
            },
            {
                name: 'Birre',
                items: [
                    { name: 'Karlovačko', description: '' },
                    { name: 'Budwieser', description: '' },
                    { name: 'Heineken', description: '' }
                ]
            },
            {
                name: 'Vino',
                items: [
                    { name: 'Vino da tavola – 0,10 l', description: '' },
                    { name: 'Vino da tavola – 0,20 l', description: '' },
                    { name: 'Vino da tavola – 0,25 l', description: '' },
                    { name: 'Vino da tavola – 0,50 l', description: '' },
                    { name: 'Vino da tavola – 1 l', description: '' },
                    { name: 'Vino bianco (vino da tavola) – 1 l', description: '' }
                ]
            },
            {
                name: 'Liquori - 0,03 l',
                items: [
                    { name: 'Pelinkovac', description: '' },
                    { name: 'Amaro', description: '' },
                    { name: 'Jägermeister', description: '' },
                    { name: 'Baileys', description: '' },
                    { name: 'Teranino', description: '' },
                    { name: 'Aperol sprite', description: '' }
                ]
            },
            {
                name: 'Alcolici - 0,03 l',
                items: [
                    { name: 'Stock', description: '' },
                    { name: 'Wodka', description: '' },
                    { name: 'Jack Daniels', description: '' },
                    { name: 'Baccardi Rum', description: '' },
                    { name: 'Gin (importato)', description: '' },
                    { name: 'Rakhia - 0,03 l', description: '' },
                    { name: 'Lozovača', description: '' },
                    { name: 'Travarica', description: '' },
                    { name: 'Šljivovica', description: '' },
                    { name: 'Medica', description: '' }
                ]
            },
            {
                name: 'Bevande calde',
                items: [
                    { name: 'Espresso', description: '' },
                    { name: 'Macchiato', description: '' },
                    { name: 'Capuccino', description: '' },
                    { name: 'Caffè bianco', description: '' },
                    { name: 'Caffè con panna montata', description: '' },
                    { name: 'Latte', description: '' },
                    { name: 'Tè', description: '' }
                ]
            }
        ]
    }
};

// ============================================
// MENU RENDERING
// ============================================
let currentMenuType = 'food';
let currentLang = localStorage.getItem('selectedLanguage') || 'en';

function renderMenu(lang, menuType = 'food') {
    const menuContent = document.getElementById('menu-content');
    const sourceData = menuType === 'drinks' ? drinksData : menuData;
    const menuData_ = sourceData[lang];

    if (!menuData_ || !menuContent) return;

    menuContent.innerHTML = '';

    menuData_.categories.forEach((category) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';

        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'menu-category-title';
        categoryTitle.textContent = category.name;

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'menu-items';

        category.items.forEach((item) => {
            // Handle nested categories (like Umaci under Dodatci)
            if (item.isCategory && item.items) {
                const subCategoryDiv = document.createElement('div');
                subCategoryDiv.className = 'menu-subcategory';

                const subTitle = document.createElement('h4');
                subTitle.className = 'menu-subcategory-title';
                subTitle.textContent = item.name;
                subCategoryDiv.appendChild(subTitle);

                const subItemsDiv = document.createElement('div');
                subItemsDiv.className = 'menu-subitems';

                item.items.forEach((subItem) => {
                    const subItemDiv = document.createElement('div');
                    subItemDiv.className = 'menu-item';

                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'menu-item-info';

                    const nameEl = document.createElement('div');
                    nameEl.className = 'menu-item-name';
                    nameEl.textContent = subItem.name;

                    infoDiv.appendChild(nameEl);
                    subItemDiv.appendChild(infoDiv);

                    if (subItem.price) {
                        const priceEl = document.createElement('div');
                        priceEl.className = 'menu-item-price';
                        priceEl.textContent = '€' + subItem.price;
                        subItemDiv.appendChild(priceEl);
                    }

                    subItemsDiv.appendChild(subItemDiv);
                });

                subCategoryDiv.appendChild(subItemsDiv);
                itemsDiv.appendChild(subCategoryDiv);
            } else {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'menu-item';

                const infoDiv = document.createElement('div');
                infoDiv.className = 'menu-item-info';

                const nameEl = document.createElement('div');
                nameEl.className = 'menu-item-name';
                nameEl.textContent = item.name;

                const descEl = document.createElement('div');
                descEl.className = 'menu-item-description';
                descEl.textContent = item.description || '';

                infoDiv.appendChild(nameEl);
                infoDiv.appendChild(descEl);
                itemDiv.appendChild(infoDiv);

                if (item.price) {
                    const priceEl = document.createElement('div');
                    priceEl.className = 'menu-item-price';
                    priceEl.textContent = '€' + item.price;
                    itemDiv.appendChild(priceEl);
                }

                itemsDiv.appendChild(itemDiv);
            }
        });

        categoryDiv.appendChild(categoryTitle);
        categoryDiv.appendChild(itemsDiv);
        menuContent.appendChild(categoryDiv);
    });
}

// ============================================
// MENU INITIALIZATION
// ============================================
function updateMenuToggleButtonText(lang) {
    const foodBtn = document.querySelector('[data-menu-type="food"]');
    const drinksBtn = document.querySelector('[data-menu-type="drinks"]');

    if (lang === 'hr') {
        if (foodBtn) foodBtn.textContent = 'Jela';
        if (drinksBtn) drinksBtn.textContent = 'Pića';
    } else if (lang === 'de') {
        if (foodBtn) foodBtn.textContent = 'Speisen';
        if (drinksBtn) drinksBtn.textContent = 'Getränke';
    } else if (lang === 'it') {
        if (foodBtn) foodBtn.textContent = 'Piatti';
        if (drinksBtn) drinksBtn.textContent = 'Bevande';
    } else if (lang === 'hu') {
        if (foodBtn) foodBtn.textContent = 'Étlap';
        if (drinksBtn) drinksBtn.textContent = 'Italok';
    } else {
        if (foodBtn) foodBtn.textContent = 'Food';
        if (drinksBtn) drinksBtn.textContent = 'Beverages';
    }
}

function setupMenuLanguageSwitcher() {
    // Ensure menu-content exists before rendering
    const menuContent = document.getElementById('menu-content');
    if (!menuContent) {
        console.warn('menu-content element not found');
        return;
    }

    // Initial render with current language
    renderMenu(currentLang, currentMenuType);
    updateMenuToggleButtonText(currentLang);

    // Setup toggle buttons for food/drinks
    const toggleBtns = document.querySelectorAll('.menu-toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const menuType = btn.getAttribute('data-menu-type');
            currentMenuType = menuType;

            // Update active state
            toggleBtns.forEach(b => b.classList.remove('menu-toggle-active'));
            btn.classList.add('menu-toggle-active');

            // Render the selected menu type with current language
            renderMenu(currentLang, menuType);
        });
    });
}

// ============================================
// MENU CARD STAGGER
// ============================================
function setupMenuCardStagger() {
    const menuSection = document.getElementById('menu');
    const items = document.querySelectorAll('.menu-item');

    if (!menuSection || items.length === 0) return;

    if (prefersReducedMotion) {
        items.forEach((item) => {
            item.style.opacity = '1';
            item.style.transform = 'none';
        });
        return;
    }

    // Ensure items are visible initially
    items.forEach((item) => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    });

    gsap.from(items, {
        scrollTrigger: {
            trigger: menuSection,
            start: 'top 75%',
            once: true
        },
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.6,
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
            currentLang = lang;
            applyLanguage(lang);
            renderMenu(lang, currentMenuType);
            updateMenuToggleButtonText(lang);
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

    const navReserveBtn = document.querySelector('.nav-cta');
    if (navReserveBtn) navReserveBtn.textContent = t.nav_reserve;

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

    const menuEyebrow = document.querySelector('[data-menu-key="menu_eyebrow"]');
    if (menuEyebrow) menuEyebrow.textContent = t.menu_eyebrow;

    const menuH2 = document.querySelector('[data-menu-key="menu_title"]');
    if (menuH2) menuH2.textContent = t.menu_h2;

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

    const visitH2 = document.querySelector('.visit-heading');
    if (visitH2) visitH2.textContent = t.nav_visit;

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
    setupMenuLanguageSwitcher();
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
