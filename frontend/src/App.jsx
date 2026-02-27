import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { SITE_CONFIG } from './config'
import {
  fetchRatings,
  submitRating,
  submitContact,
  submitBooking,
  fetchAdminRatings,
  fetchAdminContacts,
  fetchAdminBookings,
} from './api'
import './styles.css'

// Toast component
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#c9a227',
        color: '#0a0a0b',
        padding: '16px 24px',
        borderRadius: '4px',
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: '0 10px 40px rgba(201, 162, 39, 0.3)',
      }}
    >
      {message}
    </div>
  )
}

// Stars helper
function StarsDisplay({ avg }) {
  const full = Math.floor(avg)
  const half = avg % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <>
      {Array.from({ length: full }, (_, i) => (
        <i key={`f-${i}`} className="fas fa-star" />
      ))}
      {half ? <i className="fas fa-star-half-alt" /> : null}
      {Array.from({ length: empty }, (_, i) => (
        <i key={`e-${i}`} className="far fa-star" />
      ))}
    </>
  )
}

// Main layout with header, nav, scroll
function MainLayout({ children, theme, setTheme, searchOpen, setSearchOpen, mobileOpen, setMobileOpen }) {
  const [headerScrolled, setHeaderScrolled] = useState(false)
  useEffect(() => {
    const h = () => setHeaderScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    h()
    return () => window.removeEventListener('scroll', h)
  }, [])

  const handleNavClick = () => setMobileOpen(false)

  return (
    <>
      <header className={`main-header ${headerScrolled ? 'scrolled' : ''}`} id="header">
        <nav className="navbar">
          <div className="logo">
            <span className="logo-accent">SPANDANA</span>
            <span className="logo-main">PHOTO HOUSE</span>
          </div>
          <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            <li><a href="#about" onClick={handleNavClick}>About</a></li>
            <li><a href="#services" onClick={handleNavClick}>Services</a></li>
            <li><a href="#portfolio" onClick={handleNavClick}>Portfolio</a></li>
            <li><a href="#ratings" onClick={handleNavClick}>Ratings</a></li>
            <li><a href="#process" onClick={handleNavClick}>Process</a></li>
            <li><a href="#testimonials" onClick={handleNavClick}>Testimonials</a></li>
            <li><a href="#pricing" onClick={handleNavClick}>Packages</a></li>
            <li><a href="#booking" onClick={handleNavClick}>Book</a></li>
            <li><a href="#faq" onClick={handleNavClick}>FAQ</a></li>
            <li><a href="#booking" className="nav-cta" onClick={handleNavClick}>Book a Session</a></li>
          </ul>
          <div className="nav-actions">
            <button className="nav-search-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <i className="fas fa-search" />
            </button>
            <button
              className="theme-toggle"
              aria-label="Toggle theme"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            >
              <i className="fas fa-moon" data-icon-dark />
              <i className="fas fa-sun" data-icon-light style={{ display: 'none' }} />
            </button>
            <button
              className={`mobile-menu-btn ${mobileOpen ? 'active' : ''}`}
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>
      </header>
      {children}
    </>
  )
}

// Home page
function HomePage({
  ratingsData,
  setRatingsData,
  showToast,
  theme,
  setTheme,
  searchOpen,
  setSearchOpen,
  mobileOpen,
  setMobileOpen,
}) {
  const [ratingStars, setRatingStars] = useState(0)
  const [ratingName, setRatingName] = useState('')
  const [ratingReview, setRatingReview] = useState('')
  const [ratingMessage, setRatingMessage] = useState('')
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [faqOpen, setFaqOpen] = useState(null)
  const [portfolioFilter, setPortfolioFilter] = useState('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [beforeAfterPos, setBeforeAfterPos] = useState(50)
  const [beforeAfterDragging, setBeforeAfterDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const sliderRef = useRef(null)
  const testimonials = [
    { stars: 5, text: 'Spandana Photo House provided an extraordinary experience for our wedding. The photos are absolutely breathtaking—every frame tells a story. We couldn\'t be happier.', author: 'Jane Doe', role: 'Wedding Client', initials: 'JD' },
    { stars: 5, text: 'My passport photos were perfect on the first try. Fast, professional, and the team made the process effortless. Highly recommend for any official documentation needs.', author: 'John Smith', role: 'Documentation', initials: 'JS' },
    { stars: 5, text: 'They restored an old family photo I thought was beyond repair. The result brought tears to my eyes. True masters of their craft.', author: 'Emily White', role: 'Restoration Client', initials: 'EW' },
    { stars: 5, text: 'Outstanding quality and professionalism. Our family portraits exceeded all expectations. Will definitely return for future occasions.', author: 'Raj Kumar', role: 'Family Portrait', initials: 'RK' },
  ]
  const faqItems = [
    { q: 'How far in advance should I book?', a: 'We recommend booking at least 2-4 weeks in advance for portrait sessions, and 3-6 months for weddings and major events to secure your preferred date.' },
    { q: 'Do you offer photo restoration services?', a: 'Yes! Our expert restoration team can repair damaged, faded, or torn photographs. We use advanced digital techniques to bring your cherished memories back to life.' },
    { q: 'What is included in the wedding package?', a: 'Our wedding packages include full-day coverage, 200+ professionally edited photos, a consultation session, and optional albums and prints. Custom packages are available.' },
    { q: 'How long until I receive my photos?', a: 'Portrait sessions: 5-7 business days. Weddings and events: 3-4 weeks. Rush delivery is available for an additional fee.' },
  ]
  const portfolioItems = [
    { category: 'portrait', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', alt: 'Portrait Photography', title: 'Elegant Portrait' },
    { category: 'wedding', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', alt: 'Wedding Photography', title: 'Wedding Day' },
    { category: 'event', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', alt: 'Event Photography', title: 'Corporate Event' },
    { category: 'portrait', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', alt: 'Family Photography', title: 'Family Portrait' },
    { category: 'wedding', img: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80', alt: 'Wedding Ceremony', title: 'Ceremony' },
    { category: 'event', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80', alt: 'Celebration', title: 'Celebration' },
    { category: 'portrait', img: 'https://images.unsplash.com/photo-1524504388940-b1c0cbcbb8e4?w=600&q=80', alt: 'Portrait', title: 'Studio Portrait' },
    { category: 'wedding', img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80', alt: 'Wedding', title: 'Reception' },
    { category: 'event', img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815a?w=600&q=80', alt: 'Event', title: 'Special Event' },
  ]
  const filteredPortfolio = portfolioFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter((p) => p.category === portfolioFilter)

  // Lightbox body scroll lock
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  // Testimonial carousel auto-advance
  useEffect(() => {
    const id = setInterval(() => setTestimonialIndex((i) => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(id)
  }, [testimonials.length])

  // Before/After slider mouse/touch
  const handleBeforeAfterMove = useCallback((clientX) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setBeforeAfterPos(pct)
  }, [])
  useEffect(() => {
    if (!beforeAfterDragging) return
    const move = (e) => handleBeforeAfterMove(e.touches ? e.touches[0].clientX : e.clientX)
    const up = () => setBeforeAfterDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move, { passive: true })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
  }, [beforeAfterDragging, handleBeforeAfterMove])

  const avg = ratingsData?.average ?? 0
  const total = ratingsData?.total ?? 0
  const satisfaction = total > 0 ? Math.round((avg / 5) * 100) : 0
  const dist = ratingsData?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const recentRatings = ratingsData?.recentRatings ?? []

  const handleRatingSubmit = async (e) => {
    e.preventDefault()
    if (!ratingStars || ratingStars < 1 || ratingStars > 5) {
      setRatingMessage('Please select a rating (1-5 stars).')
      return
    }
    setRatingSubmitting(true)
    setRatingMessage('')
    const result = await submitRating(ratingStars, ratingName, ratingReview)
    setRatingSubmitting(false)
    if (result.success) {
      setRatingMessage('Thank you! Your rating has been submitted.')
      setRatingStars(0)
      setRatingName('')
      setRatingReview('')
      const data = await fetchRatings()
      if (data) setRatingsData(data)
      showToast('Thank you for your rating!')
    } else {
      setRatingMessage(result.error || 'Could not submit. Please try again.')
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const name = form.name.value.trim()
    const email = form.email.value.trim()
    const phone = form.phone?.value?.trim() || ''
    const message = form.message.value.trim()
    if (!name || !email || !message) return
    setContactSubmitting(true)
    const result = await submitContact(name, email, phone, message)
    setContactSubmitting(false)
    if (result.success) {
      showToast(`Thank you, ${name}! We'll get back to you shortly.`)
      form.reset()
    } else {
      showToast(result.error || 'Could not send. Please try again.')
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone?.value?.trim() || '',
      eventType: form.eventType.value,
      packageType: form.package?.value || '',
      preferredDate: form.preferredDate?.value || '',
      notes: form.notes?.value?.trim() || '',
    }
    if (!data.name || !data.email || !data.eventType) return
    setBookingSubmitting(true)
    const result = await submitBooking(data)
    setBookingSubmitting(false)
    if (result.success) {
      showToast('Booking request received! We\'ll contact you within 24 hours.')
      form.reset()
    } else {
      showToast(result.error || 'Could not submit. Please try again.')
    }
  }

  const searchContent = [
    { title: 'Event Photography', section: 'services', href: '#services' },
    { title: 'Wedding Photography', section: 'portfolio', href: '#portfolio' },
    { title: 'Portrait Sessions', section: 'services', href: '#services' },
    { title: 'Photo Restoration', section: 'services', href: '#services' },
    { title: 'Passport & Visa Photos', section: 'services', href: '#services' },
    { title: 'How far in advance to book?', section: 'faq', href: '#faq' },
    { title: 'Wedding package details', section: 'faq', href: '#faq' },
    { title: 'Photo delivery time', section: 'faq', href: '#faq' },
    { title: 'Book a Session', section: 'booking', href: '#booking' },
    { title: 'Ratings & Reviews', section: 'ratings', href: '#ratings' },
  ]
  const searchResults = searchQuery.trim()
    ? searchContent.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : []

  const whatsappUrl = `https://wa.me/${(SITE_CONFIG.whatsapp || '').replace(/\D/g, '') || '918121046903'}`

  return (
    <>
      <main>
        {/* Hero */}
        <section id="hero" className="hero-section">
          <div className="hero-overlay" />
          <div className="hero-grain" />
          <div className="hero-content">
            <div className="hero-ratings-badge">
              <div className="hero-stars"><StarsDisplay avg={avg} /></div>
              <span className="hero-rating-text"><strong>{total > 0 ? avg.toFixed(1) : '—'}</strong>/5 · <span className="review-count">{total.toLocaleString()}</span> Reviews</span>
            </div>
            <p className="hero-eyebrow">30+ Years of Experience — Over 2000+ Events Captured</p>
            <h1 className="hero-title">
              <span className="hero-line">Where Moments</span>
              <span className="hero-line hero-line-accent">Become Timeless</span>
            </h1>
            <p className="hero-subtitle">Luxury photography for weddings, portraits, and life's most precious occasions. Crafted with artistry, delivered with care.</p>
            <div className="hero-ctas">
              <a href="#portfolio" className="btn btn-primary">View Our Work</a>
              <a href="#contact" className="btn btn-outline">Schedule Consultation</a>
            </div>
          </div>
          <div className="hero-scroll-indicator">
            <span>Scroll to Explore</span>
            <div className="scroll-arrow" />
          </div>
        </section>

        {/* Trust Marquee */}
        <section className="trust-marquee">
          <div className="marquee-track">
            <div className="marquee-content">
              <span>2000+ Events Captured</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${satisfaction}% Satisfaction Rate` : '—% Satisfaction Rate'}</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${avg.toFixed(1)}★ Rated` : '—★ Rated'}</span>
              <span className="marquee-dot">◆</span>
              <span>30+ Years in Photography</span>
              <span className="marquee-dot">◆</span>
              <span>{total} Verified Reviews</span>
              <span className="marquee-dot">◆</span>
              <span>2000+ Events Captured</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${satisfaction}% Satisfaction Rate` : '—% Satisfaction Rate'}</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${avg.toFixed(1)}★ Rated` : '—★ Rated'}</span>
            </div>
            <div className="marquee-content" aria-hidden="true">
              <span>2000+ Events Captured</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${satisfaction}% Satisfaction Rate` : '—% Satisfaction Rate'}</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${avg.toFixed(1)}★ Rated` : '—★ Rated'}</span>
              <span className="marquee-dot">◆</span>
              <span>30+ Years in Photography</span>
              <span className="marquee-dot">◆</span>
              <span>{total} Verified Reviews</span>
              <span className="marquee-dot">◆</span>
              <span>2000+ Events Captured</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${satisfaction}% Satisfaction Rate` : '—% Satisfaction Rate'}</span>
              <span className="marquee-dot">◆</span>
              <span>{total > 0 ? `${avg.toFixed(1)}★ Rated` : '—★ Rated'}</span>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="stats-bar">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number" data-target="30">30</span><span className="stat-suffix">+</span>
                <span className="stat-label">Years of Excellence</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" data-target="2000">2000</span><span className="stat-suffix">+</span>
                <span className="stat-label">Events Captured</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" data-target="0">0</span><span className="stat-suffix">+</span>
                <span className="stat-label">Photos Captured</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{total > 0 ? satisfaction : '—'}</span><span className="stat-suffix">%</span>
                <span className="stat-label">Client Satisfaction</span>
              </div>
              <div className="stat-item stat-item-highlight">
                <span className="stat-number">{total > 0 ? avg.toFixed(1) : '—'}</span><span className="stat-suffix">/5</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ratings */}
        <section id="ratings" className="section ratings-section">
          <div className="ratings-bg-pattern" />
          <div className="container">
            <div className="ratings-layout">
              <div className="ratings-summary">
                <span className="section-eyebrow">Client Satisfaction</span>
                <h2>Rated <em>Excellence</em> by Our Clients</h2>
                <p className="ratings-intro">Our commitment to quality has earned us exceptional ratings. Rate your experience below—your feedback helps others.</p>
                <div className="rating-overview">
                  <div className="rating-score">
                    <span className="rating-number">{total > 0 ? avg.toFixed(1) : '—'}</span>
                    <div className="rating-stars-large"><StarsDisplay avg={avg} /></div>
                    <span className="rating-total">Based on <strong>{total.toLocaleString()}</strong> verified reviews</span>
                  </div>
                </div>
                <div className="rating-form-box">
                  <h4>Rate Your Experience</h4>
                  <form className="rating-form" onSubmit={handleRatingSubmit}>
                    <div className="rating-stars-input">
                      <span className="star-label">Your rating:</span>
                      <div className="star-buttons">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button key={v} type="button" className="star-btn" aria-label={`${v} star`} onClick={() => setRatingStars(v)}>
                            <i className={ratingStars >= v ? 'fas fa-star' : 'far fa-star'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <input type="text" placeholder="Your name (optional)" value={ratingName} onChange={(e) => setRatingName(e.target.value)} />
                    <textarea placeholder="Share your experience (optional)" rows={2} value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} />
                    <button type="submit" className="btn btn-primary" disabled={ratingSubmitting}>
                      {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </form>
                  <p className="rating-form-note" style={{ color: ratingMessage ? 'var(--color-accent)' : undefined }}>{ratingMessage}</p>
                </div>
              </div>
              <div className="ratings-breakdown">
                <h4>Rating Distribution</h4>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = dist[stars] || 0
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={stars} className="rating-bar-item" data-stars={stars}>
                      <span className="bar-label">{stars} Stars</span>
                      <div className="bar-track"><div className="bar-fill" data-width={pct} style={{ width: `${pct}%` }} /></div>
                      <span className="bar-value" data-bar-value>{pct}%</span>
                    </div>
                  )
                })}
                <div className="recent-ratings">
                  <h4>Recent Reviews</h4>
                  <div id="recent-ratings-list">
                    {recentRatings.length === 0 ? (
                      <p className="no-ratings-yet">No ratings yet. Be the first to rate!</p>
                    ) : (
                      recentRatings.slice(0, 5).map((r, i) => (
                        <div key={i} className="recent-rating-item">
                          <div className="recent-rating-stars">{'★'.repeat(r.stars)}</div>
                          <span className="recent-rating-name">{r.client_name || 'Anonymous'}</span>
                          {r.review_text && <p className="recent-rating-text">"{r.review_text}"</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="section about-section">
          <div className="container">
            <div className="about-container">
              <div className="about-image">
                <div className="about-image-frame">
                  <img src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80" alt="Spandana Photo House Studio" loading="lazy" />
                  <div className="about-image-badge"><span>30+</span><small>Years</small></div>
                </div>
              </div>
              <div className="about-text">
                <span className="section-eyebrow">Our Story</span>
                <h2>Preserving Memories with <em>Artistry & Heart</em></h2>
                <p className="about-lead">Spandana Photo House, led by D. VenkataRao (Artist & Photographer) and D.S. Jyothi Kumar, has been a cornerstone of our community for over 30 years, capturing more than 2000 events. We believe a photograph is more than an image—it's a memory, a feeling, a piece of history frozen in time.</p>
                <p>Our mission is to create stunning, lasting imagery that you and your family will treasure for generations. Every frame we capture is crafted with meticulous attention to detail and a deep understanding of what makes moments truly special.</p>
                <div className="about-signature"><span className="signature-text">— D. VenkataRao & D.S. Jyothi Kumar</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="section services-section">
          <div className="container">
            <span className="section-eyebrow">What We Offer</span>
            <h2>Expert Services, <em>Exceptional Results</em></h2>
            <p className="section-subtitle">From intimate portraits to grand celebrations, we deliver excellence across every category.</p>
            <div className="service-grid">
              <div className="service-card">
                <div className="service-icon"><i className="fas fa-camera-retro" /></div>
                <h3>Event Photography</h3>
                <p>Weddings, birthdays, corporate events—we capture every special moment with a professional, artistic touch that stands the test of time.</p>
                <a href="#contact" className="service-link">Learn More <i className="fas fa-arrow-right" /></a>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fas fa-id-card-alt" /></div>
                <h3>Passport & Visa Photos</h3>
                <p>Quick, fully compliant, and impeccably lit—high-quality photos for all your official documents. No hassle, no delays.</p>
                <a href="#contact" className="service-link">Learn More <i className="fas fa-arrow-right" /></a>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fas fa-edit" /></div>
                <h3>Photo Restoration</h3>
                <p>Bring cherished, damaged photographs back to life. Our expert digital restoration preserves your family legacy with stunning clarity.</p>
                <a href="#contact" className="service-link">Learn More <i className="fas fa-arrow-right" /></a>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fas fa-print" /></div>
                <h3>Professional Printing</h3>
                <p>From intimate prints to gallery-quality canvases. Premium archival paper ensures vibrant, museum-grade results that last lifetimes.</p>
                <a href="#contact" className="service-link">Learn More <i className="fas fa-arrow-right" /></a>
              </div>
            </div>
          </div>
        </section>

        {/* Before/After */}
        <section className="section before-after-section">
          <div className="container">
            <span className="section-eyebrow">Photo Restoration</span>
            <h2>See the <em>Transformation</em></h2>
            <p className="section-subtitle">Our restoration experts bring damaged memories back to life. Drag to compare.</p>
            <div className="before-after-container">
              <div
                className="before-after-slider"
                ref={sliderRef}
                onMouseDown={(e) => { if (e.target.closest('.ba-handle')) setBeforeAfterDragging(true); else handleBeforeAfterMove(e.clientX) }}
                onTouchStart={(e) => { if (e.target.closest('.ba-handle')) setBeforeAfterDragging(true); else handleBeforeAfterMove(e.touches[0].clientX) }}
              >
                <div className="before-after-image before-img">
                  <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80" alt="Before restoration" loading="lazy" />
                  <span className="ba-label">Before</span>
                </div>
                <div className="before-after-image after-img" style={{ clipPath: `inset(0 0 0 ${beforeAfterPos}%)` }}>
                  <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80" alt="After restoration" loading="lazy" />
                  <span className="ba-label">After</span>
                </div>
                <div className="ba-handle" style={{ left: `${beforeAfterPos}%` }}>
                  <div className="ba-handle-line" />
                  <div className="ba-handle-circle"><i className="fas fa-arrows-alt-h" /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio */}
        <section id="portfolio" className="section portfolio-section">
          <div className="container">
            <span className="section-eyebrow">Featured Work</span>
            <h2>Our <em>Portfolio</em></h2>
            <p className="section-subtitle">A curated glimpse into the moments we've had the privilege to capture.</p>
            <div className="portfolio-filter">
              {['all', 'wedding', 'portrait', 'event'].map((f) => (
                <button key={f} className={`filter-btn ${portfolioFilter === f ? 'active' : ''}`} data-filter={f} onClick={() => setPortfolioFilter(f)}>
                  {f === 'all' ? 'All' : f === 'wedding' ? 'Weddings' : f === 'portrait' ? 'Portraits' : 'Events'}
                </button>
              ))}
            </div>
            <div className="portfolio-grid">
              {filteredPortfolio.map((item, idx) => (
                <div
                  key={idx}
                  className="portfolio-item"
                  data-category={item.category}
                  onClick={() => { setLightboxIndex(filteredPortfolio.findIndex((p) => p === item)); setLightboxOpen(true) }}
                >
                  <img src={item.img} alt={item.alt} loading="lazy" />
                  <div className="portfolio-overlay">
                    <span className="portfolio-category">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                    <h4>{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="section process-section">
          <div className="container">
            <span className="section-eyebrow">How We Work</span>
            <h2>Our <em>Process</em></h2>
            <div className="process-timeline">
              {[
                { n: '01', title: 'Consultation', desc: 'We discuss your vision, preferences, and timeline. Every project begins with understanding what matters most to you.' },
                { n: '02', title: 'Planning', desc: 'We craft a tailored plan—locations, lighting, styling—ensuring every detail aligns with your expectations.' },
                { n: '03', title: 'Capture', desc: 'On the day, we work with precision and artistry, capturing authentic moments and curated shots alike.' },
                { n: '04', title: 'Delivery', desc: 'Your images are meticulously edited and delivered in your preferred format—prints, digital, or both.' },
              ].map((s) => (
                <div key={s.n} className="process-step">
                  <div className="process-number">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="section testimonials-section">
          <div className="testimonials-bg" />
          <div className="container">
            <span className="section-eyebrow">Client Love</span>
            <h2>What Our Clients <em>Say</em></h2>
            <p className="section-subtitle">Join our satisfied families who trusted us with their precious moments.</p>
            <div className="testimonial-carousel">
              <button className="carousel-prev" aria-label="Previous" onClick={() => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}>
                <i className="fas fa-chevron-left" />
              </button>
              <button className="carousel-next" aria-label="Next" onClick={() => setTestimonialIndex((i) => (i + 1) % testimonials.length)}>
                <i className="fas fa-chevron-right" />
              </button>
              <div className="testimonial-slider" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', transform: `translateX(-${testimonialIndex * 100}%)`, transition: 'transform 0.5s ease' }}>
                {testimonials.map((t, i) => (
                  <div key={i} className="testimonial-card" style={{ minWidth: '100%', flexShrink: 0 }}>
                    <div className="testimonial-stars">★★★★★</div>
                    <div className="testimonial-rating-badge">5.0</div>
                    <p>"{t.text}"</p>
                    <div className="testimonial-author">
                      <div className="author-avatar">{t.initials}</div>
                      <div><strong>{t.author}</strong><span>{t.role}</span></div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
              <div className="carousel-dots">
                {testimonials.map((_, i) => (
                  <button key={i} className={`carousel-dot ${i === testimonialIndex ? 'active' : ''}`} aria-label={`Go to slide ${i + 1}`} onClick={() => setTestimonialIndex(i)} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Booking */}
        <section id="booking" className="section booking-section">
          <div className="container">
            <span className="section-eyebrow">Reserve Your Session</span>
            <h2>Book a <em>Consultation</em></h2>
            <p className="section-subtitle">Tell us about your event and we'll get back to you within 24 hours.</p>
            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <div className="booking-row">
                <input type="text" name="name" placeholder="Your Name" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="tel" name="phone" placeholder="Phone" />
              </div>
              <div className="booking-row">
                <select name="eventType" required>
                  <option value="">Select event type</option>
                  <option value="wedding">Wedding</option>
                  <option value="portrait">Portrait / Family</option>
                  <option value="event">Corporate Event</option>
                  <option value="passport">Passport / Visa</option>
                  <option value="restoration">Photo Restoration</option>
                  <option value="other">Other</option>
                </select>
                <select name="package">
                  <option value="">Select package (optional)</option>
                  <option value="essential">Essential (₹2,999)</option>
                  <option value="portrait">Portrait Studio (₹7,999)</option>
                  <option value="wedding">Wedding & Events (₹25,999+)</option>
                </select>
                <input type="date" name="preferredDate" placeholder="Preferred date" />
              </div>
              <textarea name="notes" rows={3} placeholder="Additional details (venue, number of guests, special requests...)" />
              <button type="submit" className="btn btn-primary btn-full" disabled={bookingSubmitting}>
                <span className="btn-text">{bookingSubmitting ? <><i className="fas fa-spinner fa-spin" /> Submitting...</> : 'Request Booking'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section pricing-section">
          <div className="container">
            <span className="section-eyebrow">Packages</span>
            <h2>Choose Your <em>Experience</em></h2>
            <p className="section-subtitle">Flexible packages tailored to your needs. All include our signature quality guarantee.</p>
            <div className="pricing-grid">
              <div className="pricing-card">
                <h3>Essential</h3>
                <div className="pricing-amount"><span className="currency">₹</span><span className="price">2,999</span></div>
                <p className="pricing-desc">Perfect for passport photos & quick prints</p>
                <ul>
                  <li><i className="fas fa-check" /> Passport/Visa photos</li>
                  <li><i className="fas fa-check" /> 4 printed copies</li>
                  <li><i className="fas fa-check" /> Digital copy included</li>
                </ul>
                <a href="#contact" className="btn btn-outline">Get Started</a>
              </div>
              <div className="pricing-card featured">
                <div className="pricing-badge">Most Popular</div>
                <h3>Portrait Studio</h3>
                <div className="pricing-amount"><span className="currency">₹</span><span className="price">7,999</span></div>
                <p className="pricing-desc">Professional portrait sessions</p>
                <ul>
                  <li><i className="fas fa-check" /> 1-hour studio session</li>
                  <li><i className="fas fa-check" /> 15 edited digital photos</li>
                  <li><i className="fas fa-check" /> 5 premium prints</li>
                </ul>
                <a href="#contact" className="btn btn-primary">Get Started</a>
              </div>
              <div className="pricing-card">
                <h3>Wedding & Events</h3>
                <div className="pricing-amount"><span className="currency">₹</span><span className="price">25,999</span><span className="price-note">+</span></div>
                <p className="pricing-desc">Full-day coverage for your big day</p>
                <ul>
                  <li><i className="fas fa-check" /> Full-day coverage</li>
                  <li><i className="fas fa-check" /> 200+ edited photos</li>
                  <li><i className="fas fa-check" /> Album & prints</li>
                </ul>
                <a href="#contact" className="btn btn-outline">Get Started</a>
              </div>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="awards-section">
          <div className="container">
            <div className="awards-grid">
              <div className="award-item"><i className="fas fa-award" /><span>30+ Years Excellence</span></div>
              <div className="award-item"><i className="fas fa-medal" /><span>98% Satisfaction</span></div>
              <div className="award-item"><i className="fas fa-certificate" /><span>Verified Reviews</span></div>
              <div className="award-item"><i className="fas fa-thumbs-up" /><span>2000+ Events</span></div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section faq-section">
          <div className="container">
            <span className="section-eyebrow">FAQ</span>
            <h2>Common <em>Questions</em></h2>
            <div className="faq-list">
              {faqItems.map((item, i) => (
                <div key={i} className={`faq-item ${faqOpen === i ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    <span>{item.q}</span><i className={`fas ${faqOpen === i ? 'fa-minus' : 'fa-plus'}`} />
                  </button>
                  <div className="faq-answer" style={{ maxHeight: faqOpen === i ? '500px' : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-box">
              <h3>Join Our Inner Circle</h3>
              <p>Receive exclusive offers, photography tips, and first access to seasonal promotions.</p>
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); showToast('Welcome to our inner circle! Check your inbox for a confirmation.'); e.target.reset() }}>
                <input type="email" placeholder="Enter your email" required />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="section contact-section">
          <div className="container">
            <div className="contact-wrapper">
              <div className="contact-info">
                <span className="section-eyebrow">Get in Touch</span>
                <h2>Let's Create <em>Something Beautiful</em></h2>
                <p>We'd love to hear from you. Schedule a free consultation to discuss your vision.</p>
                <div className="contact-details">
                  <div className="contact-item"><i className="fas fa-map-marker-alt" /><span>{SITE_CONFIG.address}</span></div>
                  <div className="contact-item">
                    <i className="fas fa-phone" />
                    <span>
                      <a href={`tel:+91${SITE_CONFIG.phone1}`}>{SITE_CONFIG.phone1?.replace(/(\d{5})(\d+)/, '$1 $2')}</a>
                      {' · '}
                      <a href={`tel:+91${SITE_CONFIG.phone2}`}>{SITE_CONFIG.phone2?.replace(/(\d{3})(\d+)/, '$1 $2')}</a>
                    </span>
                  </div>
                  <div className="contact-item"><i className="fas fa-envelope" /><span><a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a></span></div>
                </div>
                <div className="contact-map">
                  <iframe src={SITE_CONFIG.googleMapsEmbed} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Spandana Photo House - Ongole" />
                </div>
                <div className="contact-rating-cta">
                  <div className="contact-stars"><StarsDisplay avg={avg} /></div>
                  <span>{total > 0 ? `Rated ${avg.toFixed(1)}/5 by ${total.toLocaleString()}+ clients` : 'No ratings yet'}</span>
                </div>
              </div>
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <input type="text" name="name" placeholder="Your Name" required />
                <input type="email" name="email" placeholder="Your Email" required />
                <input type="tel" name="phone" placeholder="Phone Number" />
                <textarea name="message" rows={5} placeholder="Tell us about your project..." required />
                <button type="submit" className="btn btn-primary btn-full" disabled={contactSubmitting}>
                  {contactSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="logo-accent">SPANDANA</span>
              <span className="logo-main">PHOTO HOUSE</span>
              <p>{SITE_CONFIG.address}</p>
              <div className="footer-rating">
                <span className="footer-stars"><StarsDisplay avg={avg} /></span>
                <span>{total > 0 ? `${avg.toFixed(1)}/5 · ${total.toLocaleString()} reviews` : 'No ratings yet'}</span>
              </div>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="#portfolio">Portfolio</a>
              <a href="#ratings">Ratings</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-social">
              <h4>Follow Us</h4>
              <a href={SITE_CONFIG.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href={SITE_CONFIG.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram" /></a>
              <a href={SITE_CONFIG.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fab fa-twitter" /></a>
              <a href={SITE_CONFIG.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><i className="fab fa-pinterest" /></a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Spandana Photo House. All Rights Reserved.</p>
            <Link to="/admin" className="admin-link" target="_blank">Admin</Link>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox active" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" aria-label="Close" onClick={() => setLightboxOpen(false)}>&times;</button>
          <button className="lightbox-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + filteredPortfolio.length) % filteredPortfolio.length) }}>
            <i className="fas fa-chevron-left" />
          </button>
          <button className="lightbox-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % filteredPortfolio.length) }}>
            <i className="fas fa-chevron-right" />
          </button>
          <img src={filteredPortfolio[lightboxIndex]?.img?.replace('w=600', 'w=1200')} alt="" onClick={(e) => e.stopPropagation()} />
          <span className="lightbox-counter">{lightboxIndex + 1} / {filteredPortfolio.length}</span>
        </div>
      )}

      {/* WhatsApp */}
      <a href={whatsappUrl} className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <i className="fab fa-whatsapp" /><span>Chat</span>
      </a>

      {/* Search overlay */}
      <div className={`search-overlay ${searchOpen ? 'active' : ''}`} id="search-overlay">
        <button className="search-close" aria-label="Close search" onClick={() => setSearchOpen(false)}>&times;</button>
        <div className="search-box">
          <input type="search" placeholder="Search services, portfolio, FAQ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div className="search-results">
            {searchResults.map((m, i) => (
              <a key={i} href={m.href} className="search-result-item" onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
                {m.title} <small>({m.section})</small>
              </a>
            ))}
            {searchQuery && searchResults.length === 0 && <p className="search-result-item">No results found.</p>}
          </div>
        </div>
      </div>
    </>
  )
}

// Admin page
function AdminPage() {
  const [password, setPassword] = useState('')
  const [auth, setAuth] = useState(() => sessionStorage.getItem('adminAuth') || '')
  const [activeTab, setActiveTab] = useState('ratings')
  const [ratings, setRatings] = useState([])
  const [contacts, setContacts] = useState([])
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const loadAll = useCallback(async (pwdOverride) => {
    const pwd = pwdOverride || auth || SITE_CONFIG.adminPassword
    if (!pwd) return
    setLoading(true)
    setError('')
    try {
      const [r, c, b] = await Promise.all([
        fetchAdminRatings(pwd),
        fetchAdminContacts(pwd),
        fetchAdminBookings(pwd),
      ])
      if (r?.unauthorized || c?.unauthorized || b?.unauthorized) {
        sessionStorage.removeItem('adminAuth')
        setAuth('')
        setError('Invalid password.')
        return
      }
      setRatings(Array.isArray(r) ? r : [])
      setContacts(Array.isArray(c) ? c : [])
      setBookings(Array.isArray(b) ? b : [])
    } catch (e) {
      setError('Could not connect. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    if (auth) loadAll()
  }, [auth, loadAll])

  const handleLogin = async () => {
    const pwd = password || SITE_CONFIG.adminPassword
    if (!pwd) { setError('Enter password.'); return }
    setError('')
    setLoading(true)
    try {
      const r = await fetchAdminRatings(pwd)
      if (r?.unauthorized) {
        setError('Invalid password.')
        return
      }
      sessionStorage.setItem('adminAuth', pwd)
      setAuth(pwd)
      loadAll(pwd)
    } catch (e) {
      setError('Could not connect. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    const data = activeTab === 'ratings' ? ratings : activeTab === 'contacts' ? contacts : bookings
    const headers = activeTab === 'ratings' ? ['Date', 'Stars', 'Name', 'Review'] : activeTab === 'contacts' ? ['Date', 'Name', 'Email', 'Phone', 'Message'] : ['Date', 'Name', 'Email', 'Event', 'Package', 'Preferred Date', 'Notes']
    const rows = data.map((row) => {
      if (activeTab === 'ratings') return [new Date(row.createdAt).toLocaleString(), '★'.repeat(row.stars), row.clientName || '-', row.reviewText || '-']
      if (activeTab === 'contacts') return [new Date(row.createdAt).toLocaleString(), row.name, row.email, row.phone || '-', row.message]
      return [new Date(row.createdAt).toLocaleString(), row.name, row.email, row.eventType, row.packageType || '-', row.preferredDate || '-', row.notes || '-']
    })
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `${activeTab}-export.csv`
    a.click()
  }

  const escapeHtml = (s) => {
    const d = document.createElement('div')
    d.textContent = s || ''
    return d.innerHTML
  }

  if (!auth) {
    return (
      <div className="admin-page" style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
        <div className="admin-login" style={{ maxWidth: 400, margin: '4rem auto', padding: 'var(--space-xl)', background: 'var(--color-bg-card)', borderRadius: 4, border: '1px solid var(--color-border)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }}>Admin Login</h1>
          <input type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: 14, marginBottom: 'var(--space-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 4, color: 'var(--color-text)' }} />
          <button type="button" className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: '100%' }}>{loading ? 'Logging in...' : 'Login'}</button>
          <p style={{ color: '#ef4444', marginTop: 'var(--space-sm)' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page" style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)' }}>Admin Dashboard</h1>
        <button className="admin-export" onClick={exportCsv} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: 'var(--color-bg)', border: 'none', borderRadius: 4, cursor: 'pointer' }}><i className="fas fa-download" /> Export CSV</button>
      </div>
      <div className="admin-tabs" style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        {['ratings', 'contacts', 'bookings'].map((t) => (
          <button key={t} className={`admin-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ padding: '10px 20px', background: activeTab === t ? 'var(--color-accent)' : 'transparent', border: '1px solid var(--color-border)', color: activeTab === t ? 'var(--color-bg)' : 'var(--color-text-muted)', cursor: 'pointer', borderRadius: 4 }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === 'ratings' && (
        <div>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-card)', borderRadius: 4, overflow: 'hidden' }}>
            <thead><tr><th style={{ padding: '14px 18px', textAlign: 'left', background: 'var(--color-bg-elevated)', fontWeight: 600 }}>Date</th><th>Stars</th><th>Name</th><th>Review</th></tr></thead>
            <tbody>
              {ratings.length === 0 ? <tr><td colSpan={4} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>No ratings yet.</td></tr> : ratings.map((r, i) => (
                <tr key={i}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{'★'.repeat(r.stars)}</td><td>{r.clientName || '-'}</td><td>{r.reviewText || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'contacts' && (
        <div>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-card)', borderRadius: 4, overflow: 'hidden' }}>
            <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Message</th></tr></thead>
            <tbody>
              {contacts.length === 0 ? <tr><td colSpan={5} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>No contact submissions yet.</td></tr> : contacts.map((c, i) => (
                <tr key={i}><td>{new Date(c.createdAt).toLocaleString()}</td><td>{c.name}</td><td>{c.email}</td><td>{c.phone || '-'}</td><td>{c.message}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'bookings' && (
        <div>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-card)', borderRadius: 4, overflow: 'hidden' }}>
            <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Event</th><th>Package</th><th>Preferred Date</th><th>Notes</th></tr></thead>
            <tbody>
              {bookings.length === 0 ? <tr><td colSpan={7} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>No bookings yet.</td></tr> : bookings.map((b, i) => (
                <tr key={i}><td>{new Date(b.createdAt).toLocaleString()}</td><td>{b.name}</td><td>{b.email}</td><td>{b.eventType}</td><td>{b.packageType || '-'}</td><td>{b.preferredDate || '-'}</td><td>{b.notes || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ marginTop: 'var(--space-md)' }}><Link to="/">← Back to site</Link></p>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('spandana_theme') || 'dark')
  const [ratingsData, setRatingsData] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('spandana_theme', theme)
  }, [theme])

  useEffect(() => {
    fetchRatings().then((data) => data && setRatingsData(data))
  }, [])

  const showToast = (msg) => setToast(msg)

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/"
          element={
            <>
              <MainLayout theme={theme} setTheme={setTheme} searchOpen={searchOpen} setSearchOpen={setSearchOpen} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
                <HomePage
                  ratingsData={ratingsData}
                  setRatingsData={setRatingsData}
                  showToast={showToast}
                  theme={theme}
                  setTheme={setTheme}
                  searchOpen={searchOpen}
                  setSearchOpen={setSearchOpen}
                  mobileOpen={mobileOpen}
                  setMobileOpen={setMobileOpen}
                />
              </MainLayout>
            </>
          }
        />
      </Routes>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
