// ============================================
// SPANDANA PHOTO HOUSE — Premium Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initHeaderScroll();
    initThemeToggle();
    initSearch();
    initDbSetup();
    initRatings();
    initStatsCounter();
    initRatingForm();
    initRatingBars();
    initPortfolioFilter();
    initPortfolioLightbox();
    initTestimonialCarousel();
    initBeforeAfterSlider();
    initFAQ();
    initContactForm();
    initBookingForm();
    initNewsletterForm();
    initMobileMenu();
    initScrollAnimations();
    initWhatsAppLink();
});

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Theme toggle (dark/light)
function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('spandana_theme') || 'dark';
    html.setAttribute('data-theme', saved);
    if (saved === 'light') {
        const dark = toggle?.querySelector('[data-icon-dark]');
        const light = toggle?.querySelector('[data-icon-light]');
        if (dark) dark.style.display = 'none';
        if (light) light.style.display = 'inline-block';
    }
    toggle?.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('spandana_theme', next);
        const dark = toggle.querySelector('[data-icon-dark]');
        const light = toggle.querySelector('[data-icon-light]');
        if (next === 'light') {
            dark.style.display = 'none';
            light.style.display = 'inline-block';
        } else {
            dark.style.display = 'inline-block';
            light.style.display = 'none';
        }
    });
}

// Search overlay
function initSearch() {
    const overlay = document.getElementById('search-overlay');
    const searchBtn = document.querySelector('.nav-search-btn');
    const searchInput = document.getElementById('site-search');
    const searchClose = document.querySelector('.search-close');
    const results = document.getElementById('search-results');

    const searchContent = [
        { title: 'Event Photography', section: 'services', href: '#services' },
        { title: 'Wedding Photography', section: 'portfolio', href: '#portfolio' },
        { title: 'Portrait Sessions', section: 'services', href: '#services' },
        { title: 'Photo Restoration', section: 'services', href: '#services' },
        { title: 'Passport & Visa Photos', section: 'services', href: '#services' },
        { title: 'How far in advance to book?', section: 'faq', href: '#faq' },
        { title: 'Wedding package details', section: 'faq', href: '#faq' },
        { title: 'Photo delivery time', section: 'faq', href: '#faq' },
        { title: 'Book a Session', section: 'contact', href: '#contact' },
        { title: 'Ratings & Reviews', section: 'ratings', href: '#ratings' }
    ];

    function doSearch(term) {
        term = (term || '').toLowerCase().trim();
        if (!term) {
            results.innerHTML = '';
            return;
        }
        const matches = searchContent.filter(c => c.title.toLowerCase().includes(term));
        results.innerHTML = matches.slice(0, 8).map(m => 
            `<a href="${m.href}" class="search-result-item">${m.title} <small>(${m.section})</small></a>`
        ).join('');
        if (matches.length === 0) results.innerHTML = '<p class="search-result-item">No results found.</p>';
    }

    searchBtn?.addEventListener('click', () => {
        overlay?.classList.add('active');
        setTimeout(() => searchInput?.focus(), 100);
    });
    searchClose?.addEventListener('click', () => overlay?.classList.remove('active'));
    searchInput?.addEventListener('input', (e) => doSearch(e.target.value));
    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay?.classList.remove('active');
    });
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
}

// Header background on scroll
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

// Database setup form - configure Supabase from browser (no file editing)
function initDbSetup() {
    const setupBox = document.getElementById('db-setup-box');
    const setupLink = document.getElementById('rating-setup-link');
    const btnShowSetup = document.getElementById('btn-show-setup');
    const setupForm = document.getElementById('db-setup-form');

    const configValid = typeof isConfigValid === 'function' && isConfigValid();
    const hasStored = typeof getStoredConfig === 'function' && getStoredConfig();

    if (!configValid && setupBox) {
        setupLink.style.display = 'block';
    }

    btnShowSetup?.addEventListener('click', () => {
        if (setupBox) {
            setupBox.style.display = setupBox.style.display === 'none' ? 'block' : 'none';
        }
    });

    setupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('db-url')?.value?.trim();
        const key = document.getElementById('db-key')?.value?.trim();
        if (!url || !key) return;
        if (typeof saveConfig === 'function') saveConfig(url, key);
        showToast('Database configured! Reloading...');
        setTimeout(() => location.reload(), 1000);
    });
}

// Load ratings from database and update all rating displays
async function initRatings() {
    if (typeof fetchRatings !== 'function') {
        setNoRatingsState();
        return;
    }
    const data = await fetchRatings();
    updateRatingDisplay(data);
}

function setNoRatingsState() {
    const fallback = (avg, total) => {
        const satisfaction = total > 0 ? Math.round((avg / 5) * 100) : 0;
        updateRatingDisplay({
            average: avg,
            total,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            recentRatings: []
        });
    };
    updateRatingDisplay(null);
}

function updateRatingDisplay(data) {
    const avg = data ? data.average : 0;
    const total = data ? data.total : 0;
    const satisfaction = total > 0 ? Math.round((avg / 5) * 100) : 0;
    const starsHtml = getStarsHtml(avg);

    // Hero
    const heroAvg = document.getElementById('hero-rating-avg');
    const heroCount = document.getElementById('hero-review-count');
    const heroStars = document.getElementById('hero-stars');
    if (heroAvg) heroAvg.textContent = total > 0 ? avg.toFixed(1) : '—';
    if (heroCount) heroCount.textContent = total.toLocaleString();
    if (heroStars) heroStars.innerHTML = starsHtml;

    // Marquee
    const satisfactionText = total > 0 ? satisfaction + '% Satisfaction Rate' : '—% Satisfaction Rate';
    const ratingText = total > 0 ? avg.toFixed(1) + '★ Rated' : '—★ Rated';
    const reviewsText = total + ' Verified Reviews';
    ['marquee-satisfaction', 'marquee-satisfaction-2', 'marquee-satisfaction-copy', 'marquee-satisfaction-copy2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = satisfactionText;
    });
    ['marquee-rating', 'marquee-rating-2', 'marquee-rating-copy', 'marquee-rating-copy2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = ratingText;
    });
    ['marquee-reviews', 'marquee-reviews-copy'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = reviewsText;
    });

    // Stats bar
    const statSatisfaction = document.getElementById('stat-satisfaction-value');
    const statRating = document.getElementById('stat-rating-value');
    if (statSatisfaction) statSatisfaction.textContent = total > 0 ? satisfaction : '—';
    if (statRating) statRating.textContent = total > 0 ? avg.toFixed(1) : '—';

    // Ratings section
    const ratingAvg = document.getElementById('rating-display-avg');
    const ratingTotal = document.getElementById('rating-display-total');
    const ratingStars = document.getElementById('rating-display-stars');
    if (ratingAvg) ratingAvg.textContent = total > 0 ? avg.toFixed(1) : '—';
    if (ratingTotal) ratingTotal.textContent = total.toLocaleString();
    if (ratingStars) ratingStars.innerHTML = starsHtml;

    // Rating distribution bars
    if (data && data.distribution) {
        const dist = data.distribution;
        [5, 4, 3, 2, 1].forEach(stars => {
            const count = dist[stars] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const item = document.querySelector(`.rating-bar-item[data-stars="${stars}"]`);
            if (item) {
                const fill = item.querySelector('.bar-fill');
                const valueEl = item.querySelector('[data-bar-value]');
                if (fill) {
                    fill.dataset.width = pct;
                    fill.style.width = pct + '%';
                }
                if (valueEl) valueEl.textContent = pct + '%';
            }
        });
    }

    // Recent ratings list
    const recentList = document.getElementById('recent-ratings-list');
    if (recentList) {
        const ratings = data?.recentRatings || [];
        if (ratings.length === 0) {
            recentList.innerHTML = '<p class="no-ratings-yet">No ratings yet. Be the first to rate!</p>';
        } else {
            recentList.innerHTML = ratings.slice(0, 5).map(r => {
                const name = r.client_name || 'Anonymous';
                const review = r.review_text ? `"${r.review_text}"` : '';
                return `<div class="recent-rating-item"><div class="recent-rating-stars">${'★'.repeat(r.stars)}</div><span class="recent-rating-name">${escapeHtml(name)}</span>${review ? `<p class="recent-rating-text">${escapeHtml(review)}</p>` : ''}</div>`;
            }).join('');
        }
    }

    // Contact & Footer
    const contactStars = document.getElementById('contact-stars');
    const contactText = document.getElementById('contact-rating-text');
    const footerStars = document.getElementById('footer-stars');
    const footerText = document.getElementById('footer-rating-text');
    if (contactStars) contactStars.innerHTML = starsHtml;
    if (contactText) contactText.textContent = total > 0 ? `Rated ${avg.toFixed(1)}/5 by ${total.toLocaleString()}+ clients` : 'No ratings yet';
    if (footerStars) footerStars.innerHTML = starsHtml;
    if (footerText) footerText.textContent = total > 0 ? `${avg.toFixed(1)}/5 · ${total.toLocaleString()} reviews` : 'No ratings yet';
}

function getStarsHtml(avg) {
    const full = Math.floor(avg);
    const half = avg % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';
    return html || '<i class="far fa-star"></i>'.repeat(5);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Rating form
function initRatingForm() {
    const form = document.getElementById('rating-form');
    const starsInput = document.getElementById('rating-stars-input');
    const starBtns = document.querySelectorAll('.star-btn');
    const messageEl = document.getElementById('rating-form-message');

    if (!form || !starBtns.length) return;

    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.value);
            starsInput.value = val;
            starBtns.forEach((b, i) => {
                const icon = b.querySelector('i');
                icon.className = i < val ? 'fas fa-star' : 'far fa-star';
            });
            if (messageEl) messageEl.textContent = '';
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const stars = parseInt(starsInput.value);
        if (!stars || stars < 1 || stars > 5) {
            if (messageEl) messageEl.textContent = 'Please select a rating (1-5 stars).';
            return;
        }
        const name = document.getElementById('rating-name')?.value || '';
        const review = document.getElementById('rating-review')?.value || '';
        const submitBtn = document.getElementById('rating-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        const result = typeof submitRating === 'function' ? await submitRating(stars, name, review) : { success: false, error: 'Database not configured. Click "Setup Database" below.' };
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Rating';
        }
        if (result.success) {
            if (messageEl) messageEl.textContent = 'Thank you! Your rating has been submitted.';
            messageEl.style.color = 'var(--color-accent)';
            form.reset();
            starsInput.value = '';
            starBtns.forEach(b => { b.querySelector('i').className = 'far fa-star'; });
            initRatings();  // Refresh display
            showToast('Thank you for your rating!');
        } else {
            if (messageEl) {
                messageEl.textContent = result.error || 'Could not submit. Please try again.';
                messageEl.style.color = '#ef4444';
            }
        }
    });
}

// Animated stats counter (supports decimals) - only for static stats with data-target
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.dataset.target);
                const isDecimal = target % 1 !== 0;
                animateCounter(entry.target, 0, target, 2000, isDecimal);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, start, end, duration, useDecimals = false) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;

        if (useDecimals) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = useDecimals ? end.toFixed(1) : end.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

// Rating bars animation (for initial load before ratings fetched, or when bars scroll into view)
function initRatingBars() {
    const barItems = document.querySelectorAll('.rating-bar-item');
    if (!barItems.length) return;

    const animateBars = () => {
        barItems.forEach(item => {
            const barFill = item.querySelector('.bar-fill');
            if (barFill && barFill.dataset.width !== undefined) {
                barFill.style.width = barFill.dataset.width + '%';
            }
        });
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateBars();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    barItems.forEach(item => observer.observe(item));
}

// Portfolio filter
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (!filterBtns.length || !portfolioItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            portfolioItems.forEach((item) => {
                const category = item.dataset.category;
                const show = filter === 'all' || category === filter;

                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    item.style.display = show ? 'block' : 'none';
                    item.style.opacity = show ? '1' : '0';
                    item.style.transform = show ? 'scale(1)' : 'scale(0.95)';
                    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                }, 50);
            });
        });
    });
}

// Portfolio lightbox with prev/next
function initPortfolioLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
    const lightboxNext = lightbox?.querySelector('.lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
    const visibleItems = () => portfolioItems.filter(i => i.style.display !== 'none');

    if (!lightbox || !lightboxImg) return;

    let currentIndex = 0;

    function showImage(index) {
        const items = visibleItems();
        if (items.length === 0) return;
        index = ((index % items.length) + items.length) % items.length;
        currentIndex = index;
        const img = items[index].querySelector('img');
        if (img) {
            lightboxImg.src = img.src.replace('w=600', 'w=1200');
            lightboxImg.alt = img.alt;
            if (lightboxCounter) lightboxCounter.textContent = (index + 1) + ' / ' + items.length;
        }
    }

    portfolioItems.forEach((item, idx) => {
        const img = item.querySelector('img');
        if (img) {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.portfolio-overlay') || e.target === img || e.target.closest('img')) {
                    const items = visibleItems();
                    const i = items.indexOf(item);
                    currentIndex = i >= 0 ? i : 0;
                    showImage(currentIndex);
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
    lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (lightbox.classList.contains('active')) {
            if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
            if (e.key === 'ArrowRight') showImage(currentIndex + 1);
        }
    });
}

// Before/After slider
function initBeforeAfterSlider() {
    const slider = document.querySelector('.before-after-slider');
    if (!slider) return;

    const afterImg = slider.querySelector('.after-img');
    const handle = slider.querySelector('.ba-handle');
    if (!afterImg || !handle) return;

    let isDragging = false;

    const updatePosition = (x) => {
        const rect = slider.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        afterImg.style.clipPath = `inset(0 0 0 ${percent}%)`;
        handle.style.left = percent + '%';
    };

    slider.addEventListener('mousedown', (e) => {
        if (e.target.closest('.ba-handle') || e.target.closest('.ba-handle-circle')) {
            isDragging = true;
        } else {
            updatePosition(e.clientX);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) updatePosition(e.clientX);
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    slider.addEventListener('touchstart', (e) => {
        if (e.target.closest('.ba-handle')) isDragging = true;
        else updatePosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches[0]) updatePosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchend', () => { isDragging = false; });
}

// FAQ accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// Testimonial carousel with prev/next, dots, auto-rotate
function initTestimonialCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    const slider = document.querySelector('.testimonial-slider');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!slider || !carousel) return;

    const cards = slider.querySelectorAll('.testimonial-card');
    const count = cards.length;
    if (count === 0) return;

    let currentIndex = 0;
    let autoInterval;

    function updateDots() {
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            }
        }
    }

    function goTo(index) {
        currentIndex = ((index % count) + count) % count;
        const cardWidth = cards[0].offsetWidth + 24;
        slider.scrollTo({ left: currentIndex * cardWidth, behavior: 'smooth' });
        dotsContainer?.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

    let isDown = false, startX, scrollLeft;
    slider.addEventListener('mousedown', (e) => { isDown = true; slider.style.cursor = 'grabbing'; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
    slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = 'grab'; });
    slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = 'grab'; });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        slider.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
    slider.style.cursor = 'grab';

    updateDots();
    autoInterval = setInterval(() => goTo(currentIndex + 1), 5000);

    carousel.addEventListener('mouseenter', () => clearInterval(autoInterval));
    carousel.addEventListener('mouseleave', () => { autoInterval = setInterval(() => goTo(currentIndex + 1), 5000); });
}

// Contact form
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone')?.value || '';
        const message = document.getElementById('message').value;
        const btn = form.querySelector('button[type="submit"]');
        const origText = btn?.textContent;

        if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

        const result = typeof submitContact === 'function' ? await submitContact(name, email, phone, message) : { success: false };

        if (btn) { btn.disabled = false; btn.textContent = origText; }

        if (result.success) {
            showToast(`Thank you, ${name}! We'll get back to you shortly.`);
            form.reset();
        } else {
            showToast(result.error || 'Could not send. Please try again.');
        }
    });
}

// Newsletter form
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input?.value) {
            showToast('Welcome to our inner circle! Check your inbox for a confirmation.');
            input.value = '';
        }
    });
}

// Toast notification
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #c9a227;
        color: #0a0a0b;
        padding: 16px 24px;
        border-radius: 4px;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 10px 40px rgba(201, 162, 39, 0.3);
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Mobile menu
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

// WhatsApp link from config
function initWhatsAppLink() {
    const link = document.querySelector('.whatsapp-float');
    if (!link) return;
    const num = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.whatsapp) ? SITE_CONFIG.whatsapp : '919876543210';
    link.href = 'https://wa.me/' + num.replace(/\D/g, '');
}

// Scroll-triggered animations
function initScrollAnimations() {
    const animateElements = document.querySelectorAll(
        '.about-container, .service-card, .portfolio-item, .process-step, .testimonial-card, .contact-wrapper, .pricing-card, .ratings-layout, .before-after-container, .faq-item'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });
}
