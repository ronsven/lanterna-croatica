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
// MENU DATA (4 LANGUAGES)
// ============================================
const menuData = {
    en: {
        eyebrow: 'Traditional Menu',
        title: 'The Menu',
        categories: [
            {
                name: 'Cold Appetizers',
                items: [
                    { name: 'Carpaccio', description: 'Thinly sliced raw fish with olive oil and herbs' },
                    { name: 'Dalmatian Prosciutto', description: 'Cured ham from the Adriatic coast' },
                    { name: 'Octopus Salad', description: 'Tender octopus with seasonal vegetables and herbs' },
                    { name: 'Scallop Crudo', description: 'Fresh scallops with lemon and sea salt' }
                ]
            },
            {
                name: 'Hot Appetizers',
                items: [
                    { name: 'Pasta e Fagioli', description: 'Traditional pasta and bean soup' },
                    { name: 'Grilled Calamari', description: 'Fresh squid grilled to perfection' },
                    { name: 'Mussels in White Wine', description: 'Adriatic mussels steamed in white wine and garlic' },
                    { name: 'Cheese Croquettes', description: 'Golden fried croquettes with local cheese' }
                ]
            },
            {
                name: 'Fish & Shellfish',
                items: [
                    { name: 'Whole Sea Bass', description: 'Mediterranean sea bass, grilled with herbs' },
                    { name: 'Squid Ink Pasta', description: 'Fresh pasta in rich squid ink sauce' },
                    { name: 'King Prawns', description: 'Adriatic prawns in garlic and white wine' },
                    { name: 'Scallops Buzara', description: 'Pan-seared scallops in white wine reduction' },
                    { name: 'Tuna Steak', description: 'Seared tuna with seasonal vegetables' },
                    { name: 'Clams Casino', description: 'Baked clams with breadcrumbs and herbs' }
                ]
            },
            {
                name: 'Meat Dishes',
                items: [
                    { name: 'Peka Lamb', description: 'Slow-roasted lamb under the bell with herbs' },
                    { name: 'Veal Steak', description: 'Tender veal with seasonal accompaniments' },
                    { name: 'Grilled Steak', description: 'Premium cut grilled to your preference' },
                    { name: 'Beef Fillets', description: 'Tender beef with light sauce' }
                ]
            },
            {
                name: 'Soups',
                items: [
                    { name: 'Daily Soup', description: 'Our chef\'s creation of the day' },
                    { name: 'Seafood Bisque', description: 'Creamy soup with fresh shellfish' },
                    { name: 'Minestrone', description: 'Hearty vegetable soup' }
                ]
            },
            {
                name: 'Side Dishes',
                items: [
                    { name: 'Fried Potatoes', description: 'Crispy golden potatoes' },
                    { name: 'Boiled Potatoes', description: 'Tender potatoes with butter and herbs' },
                    { name: 'Seasonal Vegetables', description: 'Fresh vegetables of the season' },
                    { name: 'Swiss Chard', description: 'Braised with garlic and olive oil' }
                ]
            },
            {
                name: 'Pizzas',
                items: [
                    { name: 'Lanterna', description: 'House specialty with mixed toppings' },
                    { name: 'Margherita', description: 'Classic tomato, mozzarella, and basil' },
                    { name: 'Funghi', description: 'Fresh mushrooms and cheese' },
                    { name: 'Semplice', description: 'Simple tomato and mozzarella' },
                    { name: 'Piccante', description: 'Spicy pepperoni pizza' },
                    { name: 'Vegetariana', description: 'Seasonal vegetables' },
                    { name: 'Al Tonno', description: 'Tuna and onions' },
                    { name: 'Slavonska', description: 'Croatian-style with local meats' }
                ]
            },
            {
                name: 'Salads',
                items: [
                    { name: 'Seasonal Salad', description: 'Fresh greens with house vinaigrette' },
                    { name: 'Lanterna Salad', description: 'Mixed greens with seafood and vegetables' }
                ]
            },
            {
                name: 'Desserts',
                items: [
                    { name: 'Tiramisu', description: 'Classic Italian layered dessert' },
                    { name: 'Chocolate Surprise', description: 'Decadent chocolate creation' },
                    { name: 'Pancakes', description: 'Fluffy pancakes with seasonal fruit' },
                    { name: 'Ice Cream Selection', description: 'House-made ice cream flavors' }
                ]
            },
            {
                name: 'Beverages',
                items: [
                    { name: 'Fresh Juices', description: 'Orange, lemon, and seasonal fruits' },
                    { name: 'Soft Drinks', description: 'International and local brands' },
                    { name: 'Coffee & Tea', description: 'Italian espresso and specialty teas' }
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
                    { name: 'Karpačo', description: 'Tanko rezane sirove ribe s maslinovim uljem' },
                    { name: 'Dalmatinski Pršut', description: 'Kulen sa jadranske obale' },
                    { name: 'Hobotnica Salata', description: 'Meka hobotnica s jeldom i biljem' },
                    { name: 'Kapesante Crudo', description: 'Svježe kapesante s limunom i morskom solju' }
                ]
            },
            {
                name: 'Topla Predjela',
                items: [
                    { name: 'Pasta e Fagioli', description: 'Tradicionalna pasta i pratika juha' },
                    { name: 'Pržena Lignja', description: 'Svježa lignja na roštilju' },
                    { name: 'Školjke u Bijelom Vinu', description: 'Jadranske školjke kuhane u bijelom vinu' },
                    { name: 'Sirni Kroketi', description: 'Povrće ispunjeno lokalnim sirom' }
                ]
            },
            {
                name: 'Ribe, Rakovi i Školjke',
                items: [
                    { name: 'Brancin na Roštilju', description: 'Mediteranski brancin na roštilju s biljem' },
                    { name: 'Lignjina Pasta', description: 'Svježa pasta u umaku od lignjine tinte' },
                    { name: 'Károli Rakovi', description: 'Jadranski károli u vinu i česnjaku' },
                    { name: 'Kapesante Buzara', description: 'Pečene kapesante u umaku od bijelog vina' },
                    { name: 'Tuna Odrezak', description: 'Pečena tuna sa sezonskim povrćem' },
                    { name: 'Mahunje Casino', description: 'Pečene mahunje s krušcima i biljem' }
                ]
            },
            {
                name: 'Jela od Mesa',
                items: [
                    { name: 'Peka Jagnjećetina', description: 'Pečena jagnjećetina ispod peke s biljem' },
                    { name: 'Tele Odrezak', description: 'Meko tele sa sezonskim pratilcama' },
                    { name: 'Pečeni Odrezak', description: 'Odličan odrezak na roštilju' },
                    { name: 'Govjeći Fileti', description: 'Meki govedina s laganim umakom' }
                ]
            },
            {
                name: 'Juhe',
                items: [
                    { name: 'Dnevna Juha', description: 'Stvaranje od kuhareve kreativnosti' },
                    { name: 'Marekova Juha', description: 'Kremasta juha sa svježim rakovima' },
                    { name: 'Minestrone', description: 'Zdrava juha od povrća' }
                ]
            },
            {
                name: 'Prilozi',
                items: [
                    { name: 'Prženi Krumpir', description: 'Hrskavi zlatni krumpir' },
                    { name: 'Kuvan Krumpir', description: 'Meki krumpir s maslom i biljem' },
                    { name: 'Sezonsko Povrće', description: 'Svježe povrće sezone' },
                    { name: 'Blitva', description: 'Kuhana s česnjekom i maslinovim uljem' }
                ]
            },
            {
                name: 'Pizze',
                items: [
                    { name: 'Lanterna', description: 'Specijalitak kuće s miješanim sastojcima' },
                    { name: 'Margherita', description: 'Klasična rajčica, mozzarella i bosiljak' },
                    { name: 'Funghi', description: 'Svježi gljive i sir' },
                    { name: 'Semplice', description: 'Jednostavna rajčica i mozzarella' },
                    { name: 'Piccante', description: 'Ljuta peperoni pizza' },
                    { name: 'Vegetariana', description: 'Sezonsko povrće' },
                    { name: 'Al Tonno', description: 'Tuna i luk' },
                    { name: 'Slavonska', description: 'Hrvatsko-stilska s lokalnim mesima' }
                ]
            },
            {
                name: 'Salate',
                items: [
                    { name: 'Sezonska Salata', description: 'Svježi zeleni листови s domaćim dressingom' },
                    { name: 'Lanterna Salata', description: 'Miješani zeleni листови s rakovima i povrćem' }
                ]
            },
            {
                name: 'Slastice',
                items: [
                    { name: 'Tiramisu', description: 'Klasični talijanski slojeviti desert' },
                    { name: 'Čokolada Iznenađenje', description: 'Prepunjena čokolada' },
                    { name: 'Palacinke', description: 'Rahle palacinke s voćem sezone' },
                    { name: 'Izbor Sladoleda', description: 'Domaće sladoleda raznih okusa' }
                ]
            },
            {
                name: 'Pića',
                items: [
                    { name: 'Svježi Sokovi', description: 'Naranja, limun i voće sezone' },
                    { name: 'Bezalkoholna Pića', description: 'Međunarodni i lokalni brendovi' },
                    { name: 'Kava i Čaj', description: 'Talijanska espresso i specijalizirani čajevi' }
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
                    { name: 'Carpaccio', description: 'Dünn geschnittener roher Fisch mit Olivenöl' },
                    { name: 'Dalmatiner Schinken', description: 'Gepökelter Schinken von der Adriaküste' },
                    { name: 'Oktopus-Salat', description: 'Zartes Oktopus mit Saisongemüse und Kräutern' },
                    { name: 'Jakobsmuschel Crudo', description: 'Frische Jakobsmuscheln mit Zitrone und Meersalz' }
                ]
            },
            {
                name: 'Warme Vorspeisen',
                items: [
                    { name: 'Pasta e Fagioli', description: 'Traditionelle Pasta- und Bohneneintopf' },
                    { name: 'Gegrillter Tintenfisch', description: 'Frischer Tintenfisch gegrillt' },
                    { name: 'Muscheln in Weißwein', description: 'Adriatische Muscheln in Weißwein und Knoblauch' },
                    { name: 'Käse-Kroketten', description: 'Goldene frittierte Kroquetten mit lokalem Käse' }
                ]
            },
            {
                name: 'Fisch & Meeresfrüchte',
                items: [
                    { name: 'Ganzer Wolfsbarsch', description: 'Mittelmeer-Wolfsbarsch gegrillt mit Kräutern' },
                    { name: 'Tintenfisch-Nudeln', description: 'Frische Nudeln in reichhaltiger Tintenfischsoße' },
                    { name: 'Königsgarnelen', description: 'Adriatische Garnelen in Knoblauch und Weißwein' },
                    { name: 'Jakobsmuscheln Buzara', description: 'Angebratene Jakobsmuscheln in Weißweinreduktion' },
                    { name: 'Thunfisch-Steak', description: 'Gegrillter Thunfisch mit Saisongemüse' },
                    { name: 'Austern Casino', description: 'Gebackene Austern mit Bröseln und Kräutern' }
                ]
            },
            {
                name: 'Fleischgerichte',
                items: [
                    { name: 'Peka-Lamm', description: 'Langschmorbraten unter der Glocke mit Kräutern' },
                    { name: 'Kalbssteak', description: 'Zartes Kalbfleisch mit saisonalen Beilagen' },
                    { name: 'Gegrilltes Steak', description: 'Hochwertiger Schnitt nach Geschmack gegrillt' },
                    { name: 'Rinder-Filets', description: 'Zartes Rindfleisch mit leichter Soße' }
                ]
            },
            {
                name: 'Suppen',
                items: [
                    { name: 'Tagessuppe', description: 'Die kreative Schöpfung des Küchenchefs' },
                    { name: 'Meeresfrüchte-Bisque', description: 'Cremige Suppe mit frischen Meeresfrüchten' },
                    { name: 'Minestrone', description: 'Herzhafte Gemüsesuppe' }
                ]
            },
            {
                name: 'Beilagen',
                items: [
                    { name: 'Gebratene Kartoffeln', description: 'Knusprig goldfarbene Kartoffeln' },
                    { name: 'Gekochte Kartoffeln', description: 'Zarte Kartoffeln mit Butter und Kräutern' },
                    { name: 'Saisonales Gemüse', description: 'Frisches Gemüse der Saison' },
                    { name: 'Mangold', description: 'Gedünstet mit Knoblauch und Olivenöl' }
                ]
            },
            {
                name: 'Pizzen',
                items: [
                    { name: 'Lanterna', description: 'Hausspecialität mit gemischten Belägen' },
                    { name: 'Margherita', description: 'Klassisch mit Tomate, Mozzarella und Basilikum' },
                    { name: 'Funghi', description: 'Frische Pilze und Käse' },
                    { name: 'Semplice', description: 'Einfach Tomate und Mozzarella' },
                    { name: 'Piccante', description: 'Scharfe Peperoni-Pizza' },
                    { name: 'Vegetariana', description: 'Saisonales Gemüse' },
                    { name: 'Al Tonno', description: 'Thunfisch und Zwiebeln' },
                    { name: 'Slavonska', description: 'Kroatisch mit lokalen Fleischsorten' }
                ]
            },
            {
                name: 'Salate',
                items: [
                    { name: 'Saisonaler Salat', description: 'Frisches Blattgemüse mit Hausvinaigrette' },
                    { name: 'Lanterna Salat', description: 'Gemischtes Blattgemüse mit Meeresfrüchten und Gemüse' }
                ]
            },
            {
                name: 'Desserts',
                items: [
                    { name: 'Tiramisu', description: 'Klassischer italienischer Schichtkuchen' },
                    { name: 'Schokoladen-Überraschung', description: 'Prächtiges Schokoladengebilde' },
                    { name: 'Pfannkuchen', description: 'Fluffige Pfannkuchen mit saisonalem Obst' },
                    { name: 'Eiscreme-Auswahl', description: 'Hausgemachte Eiscreme in verschiedenen Sorten' }
                ]
            },
            {
                name: 'Getränke',
                items: [
                    { name: 'Frische Säfte', description: 'Orange, Zitrone und saisonales Obst' },
                    { name: 'Alkoholfreie Getränke', description: 'Internationale und lokale Marken' },
                    { name: 'Kaffee & Tee', description: 'Italienischer Espresso und Spezialtees' }
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
                    { name: 'Carpaccio', description: 'Pesce crudo affettato sottilmente con olio d\'oliva' },
                    { name: 'Prosciutto Dalmata', description: 'Prosciutto stagionato della costa adriatica' },
                    { name: 'Insalata di Polpo', description: 'Polpo tenero con verdure di stagione ed erbe' },
                    { name: 'Capasanta Crudo', description: 'Capesante fresche con limone e sale marino' }
                ]
            },
            {
                name: 'Antipasti Caldi',
                items: [
                    { name: 'Pasta e Fagioli', description: 'Tradizionale pasta e zuppa di fagioli' },
                    { name: 'Calamari Grigliati', description: 'Calamari freschi alla griglia' },
                    { name: 'Cozze al Vino Bianco', description: 'Cozze adriatiche cotte in vino bianco e aglio' },
                    { name: 'Crocchette di Formaggio', description: 'Crocchette fritte dorate con formaggio locale' }
                ]
            },
            {
                name: 'Pesce e Frutti di Mare',
                items: [
                    { name: 'Branzino Intero', description: 'Branzino mediterraneo alla griglia con erbe' },
                    { name: 'Pasta al Nero di Seppia', description: 'Pasta fresca in ricco sugo di seppia' },
                    { name: 'Scampi Adriatici', description: 'Scampi adriatici in aglio e vino bianco' },
                    { name: 'Capesante Buzara', description: 'Capesante rosolate in riduzione di vino bianco' },
                    { name: 'Bistecca di Tonno', description: 'Tonno seared con verdure di stagione' },
                    { name: 'Vongole Casino', description: 'Vongole al forno con pangrattato ed erbe' }
                ]
            },
            {
                name: 'Piatti di Carne',
                items: [
                    { name: 'Agnello alla Peka', description: 'Agnello arrosto sotto la campana con erbe' },
                    { name: 'Bistecca di Vitello', description: 'Vitello tenero con accompagnamenti stagionali' },
                    { name: 'Bistecca alla Griglia', description: 'Taglio pregiato grigliato a vostro gusto' },
                    { name: 'Filetti di Manzo', description: 'Manzo tenero con sugo leggero' }
                ]
            },
            {
                name: 'Zuppe',
                items: [
                    { name: 'Zuppa del Giorno', description: 'La creazione dello chef del giorno' },
                    { name: 'Bisque di Frutti di Mare', description: 'Zuppa cremosa con frutti di mare freschi' },
                    { name: 'Minestrone', description: 'Sostanziosa zuppa di verdure' }
                ]
            },
            {
                name: 'Contorni',
                items: [
                    { name: 'Patate Fritte', description: 'Patate croccanti e dorate' },
                    { name: 'Patate Bollite', description: 'Patate tenere con burro ed erbe' },
                    { name: 'Verdure Stagionali', description: 'Verdure fresche della stagione' },
                    { name: 'Bietole', description: 'Brasate con aglio e olio d\'oliva' }
                ]
            },
            {
                name: 'Pizze',
                items: [
                    { name: 'Lanterna', description: 'Specialità della casa con condimenti misti' },
                    { name: 'Margherita', description: 'Classica pomodoro, mozzarella e basilico' },
                    { name: 'Funghi', description: 'Funghi freschi e formaggio' },
                    { name: 'Semplice', description: 'Semplice pomodoro e mozzarella' },
                    { name: 'Piccante', description: 'Pizza al peperoni piccante' },
                    { name: 'Vegetariana', description: 'Verdure stagionali' },
                    { name: 'Al Tonno', description: 'Tonno e cipolla' },
                    { name: 'Slavonska', description: 'Stile croato con carni locali' }
                ]
            },
            {
                name: 'Insalate',
                items: [
                    { name: 'Insalata Stagionale', description: 'Verdure fresche con vinaigrette casalinga' },
                    { name: 'Insalata Lanterna', description: 'Verdure miste con frutti di mare e verdure' }
                ]
            },
            {
                name: 'Dolci',
                items: [
                    { name: 'Tiramisu', description: 'Classico dolce italiano stratificato' },
                    { name: 'Sorpresa al Cioccolato', description: 'Creazione al cioccolato decadente' },
                    { name: 'Crepes', description: 'Crepes soffici con frutta stagionale' },
                    { name: 'Selezione di Gelato', description: 'Gelato fatto in casa in vari gusti' }
                ]
            },
            {
                name: 'Bevande',
                items: [
                    { name: 'Succhi Freschi', description: 'Arancia, limone e frutta di stagione' },
                    { name: 'Bibite Analcoliche', description: 'Marchi internazionali e locali' },
                    { name: 'Caffè e Tè', description: 'Espresso italiano e tè specializzati' }
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
