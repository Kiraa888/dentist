(function() {
    "use strict";

    // --- INITIALIZE CONFIGURATION KEYS ---
    const SUPABASE_URL = "https://your-supabase-project.supabase.co"; 
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here"; 
    const EMAILJS_PUBLIC_KEY = "your-emailjs-public-key";
    const EMAILJS_SERVICE_ID = "service_luxdent";
    const EMAILJS_TEMPLATE_ID = "template_appointment";

    // Initialize Global SDK Connectors safely
    let supabase = null;
    if (typeof createClient !== 'undefined') {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // --- PREMIUM UI TOAST IMPLEMENTATION ---
    window.showToast = function(message, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `custom-toast ${type}`;
        
        const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
        toast.innerHTML = `
            <i class="fa-solid ${icon}" style="color: ${type === 'success' ? 'var(--teal)' : '#ef4444'}"></i>
            <span style="font-size:0.875rem; font-weight:500; color: var(--gray-800);">${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 50);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    // --- DOMContentLoaded Structural Logic ---
    window.addEventListener('load', () => setTimeout(() => document.getElementById('loading-screen').classList.add('hidden'), 800));

    // Dark/Light Global Theme Logic Toggle
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    function setThemeIcon(theme) { 
        themeToggle.querySelector('i').className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'; 
    }
    setThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setThemeIcon(next);
    });

    // Mobile Overlay Navigation Mechanics
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    function openMobileNav() { hamburger.classList.add('active'); mobileNav.classList.add('open'); mobileOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; hamburger.setAttribute('aria-expanded','true'); }
    function closeMobileNav() { hamburger.classList.remove('active'); mobileNav.classList.remove('open'); mobileOverlay.classList.remove('open'); document.body.style.overflow = ''; hamburger.setAttribute('aria-expanded','false'); }
    
    hamburger.addEventListener('click', () => mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav());
    mobileOverlay.addEventListener('click', closeMobileNav);
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));

    // Scroll Active Node Tracker
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        const sections = document.querySelectorAll('section[id]');
        let current = 'home';
        sections.forEach(s => { if(window.scrollY >= s.offsetTop - 100) current = s.getAttribute('id'); });
        document.querySelectorAll('.navbar-links a, .mobile-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+current));
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if(target) { e.preventDefault(); window.scrollTo({ top: target.offsetTop - navbar.offsetHeight - 20, behavior: 'smooth' }); }
    }));

    // Accordion Logic Matrix
    document.querySelectorAll('.faq-question').forEach(btn => btn.addEventListener('click', function() {
        const item = this.parentElement;
        document.querySelectorAll('.faq-item').forEach(i => { if(i !== item) { i.classList.remove('active'); i.querySelector('.faq-question').setAttribute('aria-expanded','false'); } });
        const isActive = item.classList.toggle('active');
        this.setAttribute('aria-expanded', isActive);
    }));

    // Before/After Image Mask Slider Implementation
    const slider = document.getElementById('comparisonSlider');
    const handle = document.getElementById('sliderHandle');
    const before = slider.querySelector('.img-before');
    let dragging = false;
    
    function updateSlider(clientX) {
        const rect = slider.getBoundingClientRect();
        let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        before.style.clipPath = `inset(0 ${100-percent}% 0 0)`;
        handle.style.left = percent + '%';
    }
    slider.addEventListener('mousedown', e => { dragging = true; updateSlider(e.clientX); });
    window.addEventListener('mousemove', e => { if(dragging) updateSlider(e.clientX); });
    window.addEventListener('mouseup', () => dragging = false);
    slider.addEventListener('touchstart', e => { dragging = true; updateSlider(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove', e => { if(dragging) updateSlider(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend', () => dragging = false);

    // Dynamic Calendar Validation Guard
    document.getElementById('date').min = new Date().toISOString().split('T')[0];

    // --- FULL-STACK ASYNCHRONOUS DATA TRANSMISSION INJECTOR ---
    document.getElementById('bookingForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const service = document.getElementById('service').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const message = document.getElementById('message').value.trim();

        // High-fidelity clientside syntax guard
        if(!name || !phone || !email || !service || !date || !time) {
            showToast("Please fill all required validation nodes.", "error");
            return;
        }

        // Toggle Visual Processing State
        const submitBtn = document.getElementById('submitBookingBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        try {
            // A: Store data to Supabase Database System if available
            if (supabase) {
                const { error } = await supabase.from('appointments').insert([
                    { name, phone, email, service, appointment_date: date, appointment_time: time, notes: message }
                ]);
                if (error) throw error;
            }

            // B: Trigger confirmation transaction via EmailJS
            if (typeof emailjs !== 'undefined') {
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    to_name: name,
                    to_email: email,
                    service_requested: service,
                    appointment_date: date,
                    appointment_time: time
                });
            }

            // Interface Evolution State Trigger
            document.getElementById('bookingForm').style.display = 'none';
            document.getElementById('formSuccess').classList.add('show');
            showToast("Appointment successfully synced to cluster database.");

        } catch (error) {
            console.error("Transmission fault logged:", error);
            showToast("Database sync delay. Connection dropped.", "error");
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    });

    // Smart UI Trigger Mechanics for WhatsApp Modal
    const waFloat = document.getElementById('whatsappFloat');
    const waPopup = document.getElementById('whatsappPopup');
    const waMsg = document.getElementById('whatsappMsg');
    const waSend = document.getElementById('whatsappSendBtn');
    
    waFloat.addEventListener('click', function(e) {
        if(window.innerWidth > 768) { e.preventDefault(); waPopup.classList.toggle('open'); }
    });
    waMsg.addEventListener('input', () => waSend.href = `https://wa.me/1234567890?text=${encodeURIComponent(waMsg.value)}`);
    document.addEventListener('click', e => { if(!waFloat.contains(e.target) && !waPopup.contains(e.target)) waPopup.classList.remove('open'); });

    // Numeric Accumulation Metric Easing Loops
    function animateCounters() {
        document.querySelectorAll('.stat-number[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'));
            const suffix = el.textContent.includes('+') ? '+' : '';
            let current = 0;
            const timer = setInterval(() => {
                current += target/60;
                if(current >= target) { current = target; clearInterval(timer); }
                el.textContent = Math.floor(current) + suffix;
            }, 25);
        });
    }

    // Passive Intersection Tracking Engine
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; if(e.target.querySelector('.stat-number') && !e.target.dataset.animated) { e.target.dataset.animated = 'true'; animateCounters(); } } }), { threshold: 0.15 });
    document.querySelectorAll('.service-card, .doctor-card, .pricing-card, .blog-card, .testimonial-card, .about-stats').forEach(el => { el.style.opacity='0'; el.style.transform='translateY(30px)'; el.style.transition='opacity 0.6s ease, transform 0.6s ease'; observer.observe(el); });

    // FIX: Optimized Carousel Slider Engine with multi-device touch hooks
    const carousel = document.getElementById('testimonialCarousel');
    let autoScroll = setInterval(() => { if(carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth-10) carousel.scrollTo({left:0, behavior:'smooth'}); else carousel.scrollBy({left:360, behavior:'smooth'}); }, 4000);
    
    const stopCarousel = () => clearInterval(autoScroll);
    const startCarousel = () => { clearInterval(autoScroll); autoScroll = setInterval(() => { if(carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth-10) carousel.scrollTo({left:0, behavior:'smooth'}); else carousel.scrollBy({left:360, behavior:'smooth'}); }, 4000); };

    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    carousel.addEventListener('touchstart', stopCarousel, { passive: true });
    carousel.addEventListener('touchend', startCarousel, { passive: true });

    // Global Key Listener Layer
    document.addEventListener('keydown', e => { if(e.key === 'Escape') { closeMobileNav(); waPopup.classList.remove('open'); } });
})();
