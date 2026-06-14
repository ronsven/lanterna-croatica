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
// MENU DATA (4 LANGUAGES) — ACTUAL RESTAURANT MENU
// ============================================
const menuData = {
    en: {
        eyebrow: 'Traditional Menu',
        title: 'The Menu',
        categories: [
            {
                name: 'Cold Appetizers',
                items: [
                    { name: 'Carpaccio', description: 'Fish or beef, thinly sliced' },
                    { name: 'Dalmatian Prosciutto', description: 'Cured ham from the Adriatic coast' },
                    { name: 'Sheep Cheese', description: 'Fresh local sheep cheese' },
                    { name: 'Octopus Salad', description: 'Tender octopus with vegetables and herbs' }
                ]
            },
            {
                name: 'Hot Appetizers',
                items: [
                    { name: 'Pasta Bolognese', description: 'Traditional pasta with Bolognese sauce' },
                    { name: 'Seafood Pasta', description: 'Pasta with fresh seafood' },
                    { name: 'Pasta Carbonara', description: 'Classic carbonara preparation' }
                ]
            },
            {
                name: 'Fish, Crabs, Shellfish',
                items: [
                    { name: 'Squid - Fried', description: 'Crispy fried squid' },
                    { name: 'Squid - Grilled', description: 'Fresh squid grilled to perfection' },
                    { name: 'Sea Bass in a Crust', description: 'Sea bass baked in a bread crust' },
                    { name: 'Clams on the Buzara', description: 'Clams in white wine sauce - 1 kg' },
                    { name: 'Small Fish Mix', description: 'Selection of fresh small fish' },
                    { name: 'Scallops (Grilled)', description: 'Fresh scallops grilled' },
                    { name: 'Grilled Shrimp', description: 'Adriatic shrimp grilled - 1kg' },
                    { name: 'Tuna Steak', description: 'Premium tuna steak' }
                ]
            },
            {
                name: 'Meat Dishes',
                items: [
                    { name: 'Steak', description: 'Pork or veal steak' },
                    { name: 'Fillet', description: 'Pork, beef, or chicken fillet' },
                    { name: 'Veal from the Bread Oven', description: 'Sliced veal shank, baked traditionally' },
                    { name: 'Suckling from the Bread Oven', description: 'Young pig baked in traditional oven' }
                ]
            },
            {
                name: 'Soups',
                items: [
                    { name: 'Daily Soup', description: 'Chef\'s daily creation' },
                    { name: 'Daily Ready Meals', description: 'Selection of prepared dishes that changes daily' }
                ]
            },
            {
                name: 'Side Dishes',
                items: [
                    { name: 'Fried Potatoes', description: 'Crispy golden potatoes' },
                    { name: 'Boiled Salted Potatoes', description: 'Tender potatoes with salt' },
                    { name: 'Vegetables (Grilled)', description: 'Fresh grilled vegetables' },
                    { name: 'Swiss Chard with Potatoes', description: 'Braised greens and potatoes' },
                    { name: 'Baked Potatoes', description: 'Potatoes baked in the oven' },
                    { name: 'Cheese Croquettes', description: 'Golden fried cheese croquettes' }
                ]
            },
            {
                name: 'Pizzas',
                items: [
                    { name: 'Lanterna', description: 'Tomato, cheese, ham, prosciutto, mushrooms, cream, paprika' },
                    { name: 'Margherita', description: 'Tomato and cheese' },
                    { name: 'Funghi', description: 'Tomato, cheese, and mushrooms' },
                    { name: 'Semplice', description: 'Tomato, cheese, and ham' },
                    { name: 'Piccante', description: 'Tomato, cheese, ham, and chili peppers' },
                    { name: 'Vegetariana', description: 'Tomato, cheese, vegetables, corn, and mushrooms' },
                    { name: 'Al Tonno', description: 'Tomato, cheese, tuna, and onion' },
                    { name: 'Slavonska', description: 'Tomato, cheese, ham, salami, kulen, bacon, chili peppers' }
                ]
            },
            {
                name: 'Salads',
                items: [
                    { name: 'Seasonal Salad', description: 'Fresh seasonal greens' },
                    { name: 'Salad Lanterna', description: 'Mixed greens with seafood and vegetables' }
                ]
            },
            {
                name: 'Desserts',
                items: [
                    { name: 'Tiramisu', description: 'Classic Italian layered dessert' },
                    { name: 'Chocolate Surprise', description: 'Decadent chocolate creation' },
                    { name: 'Pancakes', description: 'Pancakes with chocolate or jam' },
                    { name: 'Pancakes with Ice Cream', description: 'Pancakes topped with ice cream' },
                    { name: 'Ice Cream', description: 'House-made ice cream selection' }
                ]
            }
        ]
    },
    hr: {
        eyebrow: 'Tradicionalni Jelovnik',
        title: 'Jelovnik',
        categories: [
            {
                name: 'Hladna Predjela',
                items: [
                    { name: 'Carpaccio', description: 'Riba ili govedina, tanko rezano' },
                    { name: 'Dalmatinski Pršut', description: 'Kulen sa jadranske obale' },
                    { name: 'Ovčji Sir', description: 'Svježi domaći ovčji sir' },
                    { name: 'Salata od Hobotnice', description: 'Meka hobotnica sa povrćem i biljem' }
                ]
            },
            {
                name: 'Topla Predjela',
                items: [
                    { name: 'Pasta Bolognese', description: 'Tradicionalna pasta s Bolognese umakom' },
                    { name: 'Tjestenina s Plodovima Mora', description: 'Pasta sa svježim plodovima mora' },
                    { name: 'Pasta Carbonara', description: 'Klasična Carbonara priprema' }
                ]
            },
            {
                name: 'Ribe, Rakovi, Školjke',
                items: [
                    { name: 'Lignje - Pržene', description: 'Hrskave pržene lignje' },
                    { name: 'Lignje - Na Žaru', description: 'Svježe lignje na žaru' },
                    { name: 'Brancin u Škartocu', description: 'Brancin pečen u krušnoj kori' },
                    { name: 'Školjke na Buzaru', description: 'Školjke u umaku od bijelog vina - 1 kg' },
                    { name: 'Sitna Riba - Mix', description: 'Odabir svježe male ribe' },
                    { name: 'Jakobove Kapice (Žar)', description: 'Svježe kapice na žaru' },
                    { name: 'Škampi na Žaru', description: 'Jadranski škampi na žaru - 1kg' },
                    { name: 'Tuna Steak', description: 'Odličan tuna steak' }
                ]
            },
            {
                name: 'Jela od Mesa',
                items: [
                    { name: 'Odrezak', description: 'Svinjski ili teleći odrezak' },
                    { name: 'Filé', description: 'Svinjski, goveđi ili piletini filé' },
                    { name: 'Teletina iz Krušne Peći', description: 'Rezana teleća koljenica, pečena tradicionalno' },
                    { name: 'Odojak iz Krušne Peći', description: 'Mladi svinjski u tradicionalnoj pećnici' }
                ]
            },
            {
                name: 'Juhe',
                items: [
                    { name: 'Dnevna Juha', description: 'Kuhareva dnevna kreacija' },
                    { name: 'Dnevna Ponuda Gotovih Jela', description: 'Odabir pripremljenih jela koja se mijenja dnevno' }
                ]
            },
            {
                name: 'Prilozi',
                items: [
                    { name: 'Prženi Krumpir', description: 'Hrskavi zlatni krumpir' },
                    { name: 'Kuhani Slani Krumpir', description: 'Meki krumpir sa solju' },
                    { name: 'Povrće (Žar)', description: 'Svježe povrće na žaru' },
                    { name: 'Blitva s Krumpirom', description: 'Kuhana blitva i krumpir' },
                    { name: 'Pekarski Krumpir', description: 'Krumpir pečen u pećnici' },
                    { name: 'Kroketi od Sira', description: 'Zlatni prženi sirni kroketi' }
                ]
            },
            {
                name: 'Pizze',
                items: [
                    { name: 'Lanterna', description: 'Rajčica, sir, šunka, pršut, gljive, vrhnje, paprika' },
                    { name: 'Margherita', description: 'Rajčica i sir' },
                    { name: 'Funghi', description: 'Rajčica, sir i gljive' },
                    { name: 'Semplice', description: 'Rajčica, sir i šunka' },
                    { name: 'Piccante', description: 'Rajčica, sir, šunka i feferoni' },
                    { name: 'Vegetariana', description: 'Rajčica, sir, povrće, kukuruz i gljive' },
                    { name: 'Al Tonno', description: 'Rajčica, sir, tuna i luk' },
                    { name: 'Slavonska', description: 'Rajčica, sir, šunka, salama, kulen, špek, feferoni' }
                ]
            },
            {
                name: 'Salate',
                items: [
                    { name: 'Sezonska Salata', description: 'Svježi sezonski listovi' },
                    { name: 'Salata Lanterna', description: 'Miješani listovi s plodovima mora i povrćem' }
                ]
            },
            {
                name: 'Slastice',
                items: [
                    { name: 'Tiramisu', description: 'Klasični talijanski slojeviti desert' },
                    { name: 'Čokoladno Iznenađenje', description: 'Prepunjena čokolada' },
                    { name: 'Palačinke', description: 'Palačinke s čokoladom ili marmeladom' },
                    { name: 'Palačinke sa Sladoledom', description: 'Palačinke s sladoledom' },
                    { name: 'Sladoled', description: 'Domaće sladoleda raznih okusa' }
                ]
            }
        ]
    },
    de: {
        eyebrow: 'Traditionelle Speisekarte',
        title: 'Die Speisekarte',
        categories: [
            {
                name: 'Kalte Vorspeisen',
                items: [
                    { name: 'Carpaccio', description: 'Fisch oder Rind, dünn geschnitten' },
                    { name: 'Dalmatiner Schinken', description: 'Gepökelter Schinken von der Adriaküste' },
                    { name: 'Schafskäse', description: 'Frischer lokaler Schafskäse' },
                    { name: 'Oktopussalat', description: 'Zartes Oktopus mit Gemüse und Kräutern' }
                ]
            },
            {
                name: 'Warme Vorspeisen',
                items: [
                    { name: 'Pasta Bolognese', description: 'Traditionelle Pasta mit Bolognese-Sauce' },
                    { name: 'Pasta mit Meeresfrüchten', description: 'Pasta mit frischen Meeresfrüchten' },
                    { name: 'Pasta Carbonara', description: 'Klassische Carbonara-Zubereitung' }
                ]
            },
            {
                name: 'Fische, Krebse, Weichtiere',
                items: [
                    { name: 'Frittierte Calamari', description: 'Knusprig frittierte Calamari' },
                    { name: 'Gegrillte Calamari', description: 'Frische Calamari gegrillt' },
                    { name: 'Panierter Wolfsbarsch', description: 'Wolfsbarsch in Krustenpanierung gebacken' },
                    { name: 'Venusmuscheln auf die Buzara', description: 'Muscheln in Weißweinsauce - 1 kg' },
                    { name: 'Gemischte kleine Fische', description: 'Auswahl frischer kleiner Fische' },
                    { name: 'Gegrillte Jakobsmuscheln', description: 'Frische Jakobsmuscheln gegrillt' },
                    { name: 'Gegrillte Garnelen', description: 'Adriatische Garnelen gegrillt - 1kg' },
                    { name: 'Thunfischsteak', description: 'Hochwertiges Thunfischsteak' }
                ]
            },
            {
                name: 'Fleischgerichte',
                items: [
                    { name: 'Steak', description: 'Schweine- oder Kalbfleischsteak' },
                    { name: 'Filet', description: 'Schweine-, Rind- oder Hühnerfilet' },
                    { name: 'Kalbsbraten aus dem Brotbackofen', description: 'Geschnittene Kalbshaxe, traditionell gebacken' },
                    { name: 'Spanferkel aus dem Brotbackofen', description: 'Junges Schwein im traditionellen Ofen' }
                ]
            },
            {
                name: 'Suppen',
                items: [
                    { name: 'Tagessuppe', description: 'Tägliche Kreation des Küchenchefs' },
                    { name: 'Tägliche Auswahl von Fertiggerichten', description: 'Auswahl zubereiteter Gerichte, täglich wechselnd' }
                ]
            },
            {
                name: 'Beilagen',
                items: [
                    { name: 'Bratkartoffeln', description: 'Knusprig goldfarbene Kartoffeln' },
                    { name: 'Gesalzene Kartoffeln', description: 'Zarte Kartoffeln mit Salz' },
                    { name: 'Gegrilltes Gemüse', description: 'Frisches gegrilltes Gemüse' },
                    { name: 'Mangold mit Kartoffeln', description: 'Gedünsteter Mangold und Kartoffeln' },
                    { name: 'Ofenkartoffeln', description: 'Im Ofen gebackene Kartoffeln' },
                    { name: 'Käsekroketten', description: 'Goldene frittierte Käsekroketten' }
                ]
            },
            {
                name: 'Pizzen',
                items: [
                    { name: 'Lanterna', description: 'Tomate, Käse, Schinken, Prosciutto, Pilze, Sahne, Paprika' },
                    { name: 'Margherita', description: 'Tomate und Käse' },
                    { name: 'Funghi', description: 'Tomate, Käse und Pilze' },
                    { name: 'Semplice', description: 'Tomate, Käse und Schinken' },
                    { name: 'Piccante', description: 'Tomate, Käse, Schinken und Chilischoten' },
                    { name: 'Vegetariana', description: 'Tomate, Käse, Gemüse, Mais und Pilze' },
                    { name: 'Al Tonno', description: 'Tomate, Käse, Thunfisch und Zwiebel' },
                    { name: 'Slavonska', description: 'Tomate, Käse, Schinken, Salami, Kulen, Speck, Chilischoten' }
                ]
            },
            {
                name: 'Salate',
                items: [
                    { name: 'Salat der Saison', description: 'Frische saisonale Blätter' },
                    { name: 'Salat Lanterna', description: 'Gemischte Blätter mit Meeresfrüchten und Gemüse' }
                ]
            },
            {
                name: 'Desserts',
                items: [
                    { name: 'Tiramisu', description: 'Klassischer italienischer Schichtkuchen' },
                    { name: 'Schokoladenüberraschung', description: 'Prächtiges Schokoladengebilde' },
                    { name: 'Pfannkuchen', description: 'Pfannkuchen mit Schokolade oder Marmelade' },
                    { name: 'Pfannkuchen mit Eiscreme', description: 'Pfannkuchen mit Eiscreme' },
                    { name: 'Eiscreme', description: 'Hausgemachte Eiscreme in verschiedenen Sorten' }
                ]
            }
        ]
    },
    it: {
        eyebrow: 'Menu Tradizionale',
        title: 'Il Menu',
        categories: [
            {
                name: 'Antipasti Freddi',
                items: [
                    { name: 'Carpaccio', description: 'Pesce o manzo, affettato sottilmente' },
                    { name: 'Prosciutto Dalmata', description: 'Prosciutto stagionato dalla costa adriatica' },
                    { name: 'Formaggio di Pecora', description: 'Fresco formaggio di pecora locale' },
                    { name: 'Insalata di Polpo', description: 'Polpo tenero con verdure e erbe' }
                ]
            },
            {
                name: 'Antipasti Caldi',
                items: [
                    { name: 'Pasta alla Bolognese', description: 'Pasta tradizionale con salsa Bolognese' },
                    { name: 'Pasta ai Frutti di Mare', description: 'Pasta con frutti di mare freschi' },
                    { name: 'Pasta alla Carbonara', description: 'Preparazione classica alla carbonara' }
                ]
            },
            {
                name: 'Pesci, Granchi, Molluschi',
                items: [
                    { name: 'Calamari Fritti', description: 'Calamari croccanti fritti' },
                    { name: 'Calamari alla Griglia', description: 'Calamari freschi alla griglia' },
                    { name: 'Branzino Impanato', description: 'Branzino in panatura cotta al forno' },
                    { name: 'Vongole alla Buzara', description: 'Vongole in salsa di vino bianco - 1 kg' },
                    { name: 'Mix di Piccoli Pesci', description: 'Selezione di pesci piccoli freschi' },
                    { name: 'Capesante alla Griglia', description: 'Capesante fresche alla griglia' },
                    { name: 'Gamberetti alla Griglia', description: 'Gamberetti adriatici alla griglia - 1kg' },
                    { name: 'Trancio di Tonno', description: 'Eccellente trancio di tonno' }
                ]
            },
            {
                name: 'Piatti di Carne',
                items: [
                    { name: 'Bistecca', description: 'Bistecca di maiale o vitello' },
                    { name: 'Filetto', description: 'Filetto di maiale, manzo o pollo' },
                    { name: 'Arrosto di Vitello dal Forno', description: 'Stinco di vitello affettato, cotto tradizionalmente' },
                    { name: 'Maialino da Latte dal Forno', description: 'Giovane maiale nel forno tradizionale' }
                ]
            },
            {
                name: 'Zuppe',
                items: [
                    { name: 'Zuppa del Giorno', description: 'Creazione quotidiana dello chef' },
                    { name: 'Selezione di Piatti Pronti del Giorno', description: 'Selezione di piatti preparati, cambia quotidianamente' }
                ]
            },
            {
                name: 'Contorni',
                items: [
                    { name: 'Patate Fritte', description: 'Patate croccanti e dorate' },
                    { name: 'Patate Salate', description: 'Patate tenere con sale' },
                    { name: 'Verdure Grigliate', description: 'Verdure fresche grigliate' },
                    { name: 'Bietole con Patate', description: 'Bietole bramate e patate' },
                    { name: 'Patate al Forno', description: 'Patate cotte nel forno' },
                    { name: 'Crocchette di Formaggio', description: 'Dorate crocchette di formaggio fritte' }
                ]
            },
            {
                name: 'Pizze',
                items: [
                    { name: 'Lanterna', description: 'Pomodoro, formaggio, prosciutto cotto, crudo, funghi, panna, peperoni' },
                    { name: 'Margherita', description: 'Pomodoro e formaggio' },
                    { name: 'Ai Funghi', description: 'Pomodoro, formaggio e funghi' },
                    { name: 'Semplice', description: 'Pomodoro, formaggio e prosciutto' },
                    { name: 'Piccante', description: 'Pomodoro, formaggio, prosciutto e peperoncino' },
                    { name: 'Vegetariana', description: 'Pomodoro, formaggio, verdure, mais e funghi' },
                    { name: 'Al Tonno', description: 'Pomodoro, formaggio, tonno e cipolla' },
                    { name: 'Slava', description: 'Pomodoro, formaggio, prosciutto, salame, kulen, pancetta, peperoncino' }
                ]
            },
            {
                name: 'Insalate',
                items: [
                    { name: 'Insalata Stagionale', description: 'Foglie fresche di stagione' },
                    { name: 'Insalata Lanterna', description: 'Foglie miste con frutti di mare e verdure' }
                ]
            },
            {
                name: 'Dolci',
                items: [
                    { name: 'Tiramisu', description: 'Classico dolce italiano a strati' },
                    { name: 'Sorpresa al Cioccolato', description: 'Creazione di cioccolato decadente' },
                    { name: 'Crepes', description: 'Crepes con cioccolato o marmellata' },
                    { name: 'Crepes con Gelato', description: 'Crepes con gelato' },
                    { name: 'Gelato', description: 'Gelato fatto in casa in vari gusti' }
                ]
            }
        ]
    }
};

// ============================================
// MENU RENDERING
// ============================================
function renderMenu(lang) {
    const menuContent = document.getElementById('menu-content');
    const menuData_ = menuData[lang];

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
            const itemDiv = document.createElement('div');
            itemDiv.className = 'menu-item';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'menu-item-info';

            const nameEl = document.createElement('div');
            nameEl.className = 'menu-item-name';
            nameEl.textContent = item.name;

            const descEl = document.createElement('div');
            descEl.className = 'menu-item-description';
            descEl.textContent = item.description;

            infoDiv.appendChild(nameEl);
            infoDiv.appendChild(descEl);
            itemDiv.appendChild(infoDiv);

            itemsDiv.appendChild(itemDiv);
        });

        categoryDiv.appendChild(categoryTitle);
        categoryDiv.appendChild(itemsDiv);
        menuContent.appendChild(categoryDiv);
    });
}

// ============================================
// MENU LANGUAGE SWITCHER
// ============================================
function setupMenuLanguageSwitcher() {
    const menuLangBtns = document.querySelectorAll('.menu-lang-btn');
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';

    // Ensure menu-content exists before rendering
    const menuContent = document.getElementById('menu-content');
    if (!menuContent) {
        console.warn('menu-content element not found');
        return;
    }

    // Initial render
    renderMenu(currentLang);
    updateActiveMenuLangBtn(currentLang);

    menuLangBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-menu-lang');
            localStorage.setItem('selectedLanguage', lang);
            renderMenu(lang);
            updateActiveMenuLangBtn(lang);
        });
    });
}

function updateActiveMenuLangBtn(lang) {
    const menuLangBtns = document.querySelectorAll('.menu-lang-btn');
    menuLangBtns.forEach((b) => b.classList.remove('menu-lang-active'));
    document.querySelector(`[data-menu-lang="${lang}"]`)?.classList.add('menu-lang-active');
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
