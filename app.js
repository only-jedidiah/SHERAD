// Main Application Logic for Sherad Rental
import {
  companyInfo,
  featuredCars,
  allFleet,
  brandBadges,
  notableClients,
  partnerships,
  services,
  testimonials
} from './data.js';
import { initThreeScene } from './threeScene.js';

class SheradApp {
  constructor() {
    this.currentSlide = 0;
    this.activeFleetFilter = 'all';
    this.searchQuery = '';
    this.activeGalleryFilter = 'all';
    this.threeScene = null;

    this.init();
  }

  init() {
    // 1. Initialize Preloader
    this.initPreloader();

    // 2. Initialize 3D Canvas
    try {
      this.threeScene = initThreeScene('webgl-canvas');
    } catch (e) {
      console.warn('WebGL / Three.js fallback:', e);
    }

    // 3. Render Components
    this.renderBrandStrip();
    this.renderFeaturedCarousel();
    this.renderFleetDrawerList();
    this.renderGalleryGrid();
    this.renderAboutContent();
    this.renderServicesContent();
    this.renderTestimonialsContent();
    this.populateCarSelectDropdown();

    // 4. Attach Event Listeners
    this.attachNavEvents();
    this.attachCarouselEvents();
    this.attachFleetDrawerEvents();
    this.attachModalEvents();
    this.attachBookingFormEvents();

    // Sync initial 3D background car with first slide
    if (this.threeScene && featuredCars[0]) {
      this.threeScene.setCarTheme(0, featuredCars[0]);
    }
  }

  // =========================================================================
  // CINEMATIC DRIVING CAR PRELOADER
  // =========================================================================
  initPreloader() {
    const preloaderEl = document.getElementById('preloader-overlay');
    const barFillEl = document.getElementById('preloader-bar-fill');
    const percentEl = document.getElementById('preloader-percent');
    const statusTextEl = document.getElementById('preloader-status-text');

    if (!preloaderEl) return;

    let progress = 0;
    const duration = 2400; // 2.4 seconds
    const intervalTime = 30;
    const increment = (100 / (duration / intervalTime));

    const statusMessages = [
      'Dispatching VIP Fleet...',
      'Polishing Rolls-Royce & Mercedes Lineup...',
      'Briefing Executive Chauffeurs...',
      'Welcome to Sherad Rental Abuja'
    ];

    const timer = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);

        if (barFillEl) barFillEl.style.width = '100%';
        if (percentEl) percentEl.textContent = '100%';
        if (statusTextEl) statusTextEl.textContent = statusMessages[3];

        // Smoothly reveal main page
        setTimeout(() => {
          preloaderEl.classList.add('loaded');
          setTimeout(() => {
            preloaderEl.style.display = 'none';
          }, 800);
        }, 350);
      } else {
        if (barFillEl) barFillEl.style.width = `${Math.floor(progress)}%`;
        if (percentEl) percentEl.textContent = `${Math.floor(progress)}%`;

        if (progress > 65 && statusTextEl) {
          statusTextEl.textContent = statusMessages[2];
        } else if (progress > 30 && statusTextEl) {
          statusTextEl.textContent = statusMessages[1];
        }
      }
    }, intervalTime);
  }

  // =========================================================================
  // BRAND BADGES STRIP
  // =========================================================================
  renderBrandStrip() {
    const brandStripEl = document.getElementById('brand-strip');
    if (!brandStripEl) return;

    brandStripEl.innerHTML = brandBadges
      .map(
        (brand) => `
      <div class="brand-pill" data-brand="${brand.name}">
        <span>${brand.icon}</span>
        <span>${brand.name}</span>
      </div>
    `
      )
      .join('');

    brandStripEl.querySelectorAll('.brand-pill').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const brandName = pill.dataset.brand;
        this.openFleetDrawerWithFilter(brandName);
      });
    });
  }

  // =========================================================================
  // FEATURED 5 CARS 3D CAROUSEL
  // =========================================================================
  renderFeaturedCarousel() {
    const stageEl = document.getElementById('car-3d-stage');
    const selectorsEl = document.getElementById('carousel-selectors');
    if (!stageEl || !selectorsEl) return;

    // Render Cards
    stageEl.innerHTML = featuredCars
      .map((car, index) => {
        let positionClass = 'hidden';
        if (index === 0) positionClass = 'active';
        else if (index === 1) positionClass = 'next';
        else if (index === featuredCars.length - 1) positionClass = 'prev';

        return `
        <div class="featured-card ${positionClass}" data-index="${index}" data-car-id="${car.id}">
          <!-- Visual Side -->
          <div class="card-visual" data-car-id="${car.id}">
            <img src="${car.image}" alt="${car.name}" loading="lazy" />
            <div class="card-badge-floating">${car.badge}</div>
            <div class="card-duration-floating">${car.duration}</div>
          </div>

          <!-- Information Side -->
          <div class="card-info" data-car-id="${car.id}">
            <div>
              <div class="card-brand-header">
                <span class="card-brand-label">${car.brand}</span>
                <span class="card-category-tag">${car.category}</span>
              </div>
              <h3 class="card-car-name">${car.name}</h3>
              <p class="card-car-desc">${car.description}</p>

              <div class="card-specs-strip">
                <div class="spec-mini-item">
                  <span class="spec-mini-label">Power</span>
                  <span class="spec-mini-val">${car.power.split(' ')[0]} Engine</span>
                </div>
                <div class="spec-mini-item">
                  <span class="spec-mini-label">Capacity</span>
                  <span class="spec-mini-val">${car.passengers}</span>
                </div>
                <div class="spec-mini-item">
                  <span class="spec-mini-label">Chauffeur</span>
                  <span class="spec-mini-val">Included</span>
                </div>
              </div>
            </div>

            <div class="card-action-row">
              <button type="button" class="btn-quick-breakdown" data-car-id="${car.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Quick Breakdown</span>
              </button>
              <button type="button" class="btn-gold btn-card-reserve" data-car-name="${car.name}">
                <span>Reserve</span>
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    // Render Dots / Selectors
    selectorsEl.innerHTML = featuredCars
      .map(
        (_, idx) => `
      <button class="car-thumb-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
    `
      )
      .join('');

    this.attachCardClickHandlers();
    this.applyCardTiltPhysics();
  }

  attachCardClickHandlers() {
    const cards = document.querySelectorAll('.featured-card');

    cards.forEach((card) => {
      const carId = card.dataset.carId;
      const carObj = featuredCars.find((c) => c.id === carId) || allFleet.find((c) => c.id === carId);

      // 1. Quick Breakdown button click
      const breakdownBtn = card.querySelector('.btn-quick-breakdown');
      if (breakdownBtn && carObj) {
        breakdownBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.openSpecsModal(carObj);
        });
      }

      // 2. Reserve button click
      const reserveBtn = card.querySelector('.btn-card-reserve');
      if (reserveBtn) {
        reserveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const carName = reserveBtn.dataset.carName || (carObj ? carObj.name : '');
          this.openBookingModal(carName);
        });
      }

      // 3. Card background click
      card.addEventListener('click', (e) => {
        if (card.classList.contains('active') && carObj) {
          this.openSpecsModal(carObj);
        } else if (card.classList.contains('prev')) {
          this.navigateCarousel('prev');
        } else if (card.classList.contains('next')) {
          this.navigateCarousel('next');
        }
      });
    });
  }

  applyCardTiltPhysics() {
    const cards = document.querySelectorAll('.featured-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        if (!card.classList.contains('active')) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = -(y / (rect.height / 2)) * 1.5;
        const rotateY = (x / (rect.width / 2)) * 1.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        if (card.classList.contains('active')) {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        }
      });
    });
  }

  attachCarouselEvents() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const selectorsEl = document.getElementById('carousel-selectors');

    if (prevBtn) prevBtn.addEventListener('click', () => this.navigateCarousel('prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => this.navigateCarousel('next'));

    if (selectorsEl) {
      selectorsEl.querySelectorAll('.car-thumb-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          const index = parseInt(dot.dataset.index, 10);
          this.goToSlide(index);
        });
      });
    }

    // Keyboard Arrow Navigation
    document.addEventListener('keydown', (e) => {
      if (document.querySelector('.modal-overlay.active') || document.querySelector('.drawer-overlay.active')) return;
      if (e.key === 'ArrowLeft') this.navigateCarousel('prev');
      if (e.key === 'ArrowRight') this.navigateCarousel('next');
    });

    // Touch Swipe Support
    let touchStartX = 0;
    const stageEl = document.getElementById('car-3d-stage');
    if (stageEl) {
      stageEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      stageEl.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) this.navigateCarousel('next');
        if (touchEndX - touchStartX > 50) this.navigateCarousel('prev');
      }, { passive: true });
    }
  }

  navigateCarousel(direction) {
    const total = featuredCars.length;
    if (direction === 'next') {
      this.currentSlide = (this.currentSlide + 1) % total;
    } else {
      this.currentSlide = (this.currentSlide - 1 + total) % total;
    }
    this.updateCarouselClasses();
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.updateCarouselClasses();
  }

  updateCarouselClasses() {
    const cards = document.querySelectorAll('.featured-card');
    const dots = document.querySelectorAll('.car-thumb-dot');
    const total = featuredCars.length;

    const prevIndex = (this.currentSlide - 1 + total) % total;
    const nextIndex = (this.currentSlide + 1) % total;

    cards.forEach((card, idx) => {
      card.classList.remove('active', 'prev', 'next', 'hidden');
      card.style.transform = '';

      if (idx === this.currentSlide) {
        card.classList.add('active');
      } else if (idx === prevIndex) {
        card.classList.add('prev');
      } else if (idx === nextIndex) {
        card.classList.add('next');
      } else {
        card.classList.add('hidden');
      }
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentSlide);
    });

    // Sync 3D Background Car turning seamlessly with the carousel
    if (this.threeScene && featuredCars[this.currentSlide]) {
      this.threeScene.setCarTheme(this.currentSlide, featuredCars[this.currentSlide]);
    }
  }

  // =========================================================================
  // QUICK BREAKDOWN / SPECS MODAL
  // =========================================================================
  openSpecsModal(car) {
    const modalEl = document.getElementById('specs-modal');
    if (!modalEl || !car) return;

    const visualEl = document.getElementById('specs-modal-visual');
    const badgeEl = document.getElementById('specs-modal-badge');
    const titleEl = document.getElementById('specs-modal-title');
    const catEl = document.getElementById('specs-modal-category');
    const descEl = document.getElementById('specs-modal-desc');
    const tableEl = document.getElementById('specs-modal-table');
    const featuresListEl = document.getElementById('specs-modal-features');
    const bookBtnEl = document.getElementById('specs-modal-book-btn');
    const waBtnEl = document.getElementById('specs-modal-wa-btn');

    if (visualEl) visualEl.innerHTML = `<img src="${car.image}" alt="${car.name}" />`;
    if (badgeEl) badgeEl.textContent = car.badge || `${car.brand} Flagship`;
    if (titleEl) titleEl.textContent = car.name;
    if (catEl) catEl.textContent = `${car.brand} • ${car.category || car.type || 'Chauffeur Luxury'}`;
    if (descEl) descEl.textContent = car.description || car.highlight;

    // Table
    if (tableEl) {
      tableEl.innerHTML = `
        <div class="spec-cell">
          <span class="spec-cell-label">Rental Terms</span>
          <span class="spec-cell-value" style="color: var(--gold-light);">${car.duration || car.terms}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-cell-label">Passenger Capacity</span>
          <span class="spec-cell-value">${car.passengers || car.capacity}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-cell-label">Chauffeur Service</span>
          <span class="spec-cell-value">${car.chauffeur || 'Professional Driver Included'}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-cell-label">Transmission / Drive</span>
          <span class="spec-cell-value">${car.transmission || 'Automatic / 4WD'}</span>
        </div>
      `;
    }

    // Features
    const features = car.features || [
      'Discreet, fully vetted professional driver',
      'Immaculate showroom detailing before pickup',
      'Air conditioning & executive privacy glass',
      'Option for armed security escort personnel',
      'Seamless flight tracking & punctuality guarantee'
    ];

    if (featuresListEl) {
      featuresListEl.innerHTML = features.map((f) => `<li>${f}</li>`).join('');
    }

    // Booking Button Actions
    if (bookBtnEl) {
      bookBtnEl.onclick = (e) => {
        e.preventDefault();
        this.closeModal('specs-modal');
        this.openBookingModal(car.name);
      };
    }

    if (waBtnEl) {
      const waMessage = encodeURIComponent(
        `Hello Sherad Rental, I would like to inquire about booking the ${car.name} (${car.duration || car.terms}). Please provide availability and rate details.`
      );
      waBtnEl.href = `https://wa.me/${companyInfo.whatsappNumber}?text=${waMessage}`;
    }

    this.openModal('specs-modal');
  }

  // =========================================================================
  // FULL FLEET SLIDE-OUT DRAWER
  // =========================================================================
  renderFleetDrawerList() {
    const listEl = document.getElementById('drawer-fleet-list');
    if (!listEl) return;

    let filtered = allFleet;

    // Filter by Brand / Type
    if (this.activeFleetFilter !== 'all') {
      filtered = filtered.filter((car) => {
        if (this.activeFleetFilter === 'Armored') return car.type.includes('Armored') || car.name.includes('Armored');
        if (this.activeFleetFilter === 'Buses') return car.type.includes('Bus') || car.type.includes('Van');
        if (this.activeFleetFilter === 'SUVs') return car.type.includes('SUV');
        if (this.activeFleetFilter === 'Sedans') return car.type.includes('Sedan');
        return car.brand.toLowerCase() === this.activeFleetFilter.toLowerCase();
      });
    }

    // Search query
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.name.toLowerCase().includes(q) ||
          car.brand.toLowerCase().includes(q) ||
          car.category.toLowerCase().includes(q) ||
          car.highlight.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No vehicles found matching your criteria.</p>
          <span style="font-size: 0.8rem;">Try searching for Rolls-Royce, Mercedes, Prado, or Armored.</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered
      .map(
        (car) => `
      <div class="fleet-item-card" data-car-id="${car.id}">
        <div class="fleet-item-thumb">
          <img src="${car.image}" alt="${car.name}" loading="lazy" />
        </div>
        <div class="fleet-item-details">
          <div>
            <span class="fleet-item-brand">${car.brand}</span>
            <h4 class="fleet-item-name">${car.name}</h4>
            <p class="fleet-item-highlight">${car.highlight}</p>
          </div>
          <div class="fleet-item-meta">
            <span class="fleet-meta-tag gold">${car.terms}</span>
            <span class="fleet-meta-tag">${car.capacity}</span>
            <span class="fleet-meta-tag">${car.selfDrive ? 'Self-Drive Eligible' : 'Chauffeur Only'}</span>
          </div>
        </div>
      </div>
    `
      )
      .join('');

    listEl.querySelectorAll('.fleet-item-card').forEach((card) => {
      card.addEventListener('click', () => {
        const carId = card.dataset.carId;
        const carObj = allFleet.find((c) => c.id === carId);
        if (carObj) {
          this.openSpecsModal(carObj);
        }
      });
    });
  }

  attachFleetDrawerEvents() {
    const openBtn = document.getElementById('open-fleet-drawer-btn');
    const closeBtn = document.getElementById('close-fleet-drawer');
    const overlayEl = document.getElementById('fleet-drawer-overlay');
    const searchInput = document.getElementById('fleet-search-input');
    const filterChips = document.querySelectorAll('.fleet-filter-scroll .filter-chip');

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openFleetDrawer();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeFleetDrawer();
      });
    }

    if (overlayEl) {
      overlayEl.addEventListener('click', (e) => {
        if (e.target === overlayEl) this.closeFleetDrawer();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderFleetDrawerList();
      });
    }

    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFleetFilter = chip.dataset.filter;
        this.renderFleetDrawerList();
      });
    });
  }

  openFleetDrawer() {
    const overlayEl = document.getElementById('fleet-drawer-overlay');
    if (overlayEl) {
      overlayEl.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeFleetDrawer() {
    const overlayEl = document.getElementById('fleet-drawer-overlay');
    if (overlayEl) {
      overlayEl.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openFleetDrawerWithFilter(brandName) {
    this.activeFleetFilter = brandName;
    const filterChips = document.querySelectorAll('.fleet-filter-scroll .filter-chip');
    filterChips.forEach((chip) => {
      if (chip.dataset.filter.toLowerCase() === brandName.toLowerCase()) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    this.renderFleetDrawerList();
    this.openFleetDrawer();
  }

  // =========================================================================
  // GALLERY MODAL
  // =========================================================================
  renderGalleryGrid() {
    const gridEl = document.getElementById('gallery-grid');
    if (!gridEl) return;

    let filtered = allFleet;
    if (this.activeGalleryFilter !== 'all') {
      if (this.activeGalleryFilter === 'exotic') {
        filtered = filtered.filter((c) => ['Rolls-Royce', 'Mercedes-Benz', 'Range Rover', 'Cadillac'].includes(c.brand));
      } else if (this.activeGalleryFilter === 'suv') {
        filtered = filtered.filter((c) => c.type.includes('SUV'));
      } else if (this.activeGalleryFilter === 'security') {
        filtered = filtered.filter((c) => c.type.includes('Armored') || c.type.includes('Bus') || c.type.includes('Pickup'));
      }
    }

    gridEl.innerHTML = filtered
      .map(
        (car) => `
      <div class="gallery-card" data-car-id="${car.id}">
        <img src="${car.image}" alt="${car.name}" loading="lazy" />
        <div class="gallery-overlay-caption">
          <span class="gallery-car-cat">${car.brand} • ${car.category}</span>
          <span class="gallery-car-name">${car.name}</span>
        </div>
      </div>
    `
      )
      .join('');

    gridEl.querySelectorAll('.gallery-card').forEach((card) => {
      card.addEventListener('click', () => {
        const carId = card.dataset.carId;
        const carObj = allFleet.find((c) => c.id === carId);
        if (carObj) {
          this.closeModal('gallery-modal');
          this.openSpecsModal(carObj);
        }
      });
    });

    // Gallery Filter Chips
    const galleryChips = document.querySelectorAll('.gallery-chip');
    galleryChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        galleryChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeGalleryFilter = chip.dataset.galleryFilter;
        this.renderGalleryGrid();
      });
    });
  }

  // =========================================================================
  // ABOUT & CLIENTELE MODAL
  // =========================================================================
  renderAboutContent() {
    const clientsGridEl = document.getElementById('vip-clients-grid');
    const partnersGridEl = document.getElementById('partners-grid');

    if (clientsGridEl) {
      clientsGridEl.innerHTML = notableClients
        .map(
          (client) => `
        <div class="vip-client-card">
          <span class="vip-avatar">${client.avatar}</span>
          <div class="vip-info">
            <span class="vip-name">${client.name}</span>
            <span class="vip-role">${client.title}</span>
          </div>
        </div>
      `
        )
        .join('');
    }

    if (partnersGridEl) {
      partnersGridEl.innerHTML = partnerships
        .map(
          (p) => `
        <div class="partner-box">
          <h4>${p.name}</h4>
          <span>${p.role}</span>
          <p>${p.desc}</p>
        </div>
      `
        )
        .join('');
    }
  }

  // =========================================================================
  // SERVICES MODAL
  // =========================================================================
  renderServicesContent() {
    const servicesContainer = document.getElementById('services-list-container');
    if (!servicesContainer) return;

    servicesContainer.innerHTML = services
      .map(
        (s) => `
      <div class="service-card-item">
        <div class="service-icon-box">${s.icon}</div>
        <div class="service-card-body">
          <h3>${s.title}</h3>
          <span class="service-card-tag">${s.tagline}</span>
          <p>${s.desc}</p>
          <div class="service-pill-row">
            ${s.features.map((f) => `<span class="service-pill">✦ ${f}</span>`).join('')}
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  // =========================================================================
  // TESTIMONIALS MODAL
  // =========================================================================
  renderTestimonialsContent() {
    const testiContainer = document.getElementById('testimonials-list-container');
    if (!testiContainer) return;

    testiContainer.innerHTML = testimonials
      .map(
        (t) => `
      <div class="testi-card-lux">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-quote">“${t.quote}”</p>
        <div class="testi-author-row">
          <span class="testi-author-name">${t.author}</span>
          <span class="testi-author-role">${t.role}</span>
        </div>
      </div>
    `
      )
      .join('');
  }

  // =========================================================================
  // BOOKING / CONTACT MODAL
  // =========================================================================
  populateCarSelectDropdown() {
    const selectEl = document.getElementById('booking-car-select');
    if (!selectEl) return;

    selectEl.innerHTML = `
      <option value="" disabled selected>Select vehicle of interest...</option>
      ${allFleet
        .map(
          (car) => `
        <option value="${car.name}">${car.name} (${car.terms})</option>
      `
        )
        .join('')}
    `;
  }

  openBookingModal(preselectedCar = '') {
    const selectEl = document.getElementById('booking-car-select');
    if (selectEl && preselectedCar) {
      selectEl.value = preselectedCar;
    }
    this.openModal('contact-modal');
  }

  attachBookingFormEvents() {
    const form = document.getElementById('quick-reservation-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const car = document.getElementById('booking-car-select').value || 'Unspecified Vehicle';
      const name = document.getElementById('booking-name').value || 'Client';
      const date = document.getElementById('booking-date').value || 'Flexible';
      const serviceType = document.getElementById('booking-service-type').value || 'Abuja Metropolis';
      const notes = document.getElementById('booking-notes').value || 'Standard booking';

      const message = encodeURIComponent(
        `*Sherad Rental VIP Reservation Request*\n\n` +
          `• *Client Name:* ${name}\n` +
          `• *Vehicle:* ${car}\n` +
          `• *Service Type:* ${serviceType}\n` +
          `• *Date / Schedule:* ${date}\n` +
          `• *Special Requests:* ${notes}\n\n` +
          `Please confirm availability and dispatch terms.`
      );

      // Open WhatsApp directly
      window.open(`https://wa.me/${companyInfo.whatsappNumber}?text=${message}`, '_blank');
      this.closeModal('contact-modal');
    });
  }

  // =========================================================================
  // GENERAL MODAL MANAGEMENT & NAV
  // =========================================================================
  attachNavEvents() {
    // Nav Buttons
    document.querySelectorAll('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = btn.dataset.openModal;
        this.openModal(modalId);
        // Close mobile nav if open
        const navLinks = document.getElementById('nav-links');
        if (navLinks) navLinks.classList.remove('mobile-open');
      });
    });

    // Mobile Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });
    }

    // Scroll Navbar Effect
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('main-navbar');
      if (navbar) {
        if (window.scrollY > 30) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });
  }

  attachModalEvents() {
    // Close on Close Button click
    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach((m) => m.classList.remove('active'));
        this.closeFleetDrawer();
        document.body.style.overflow = '';
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// Global initialization immediately
const app = new SheradApp();
window.sheradApp = app;
