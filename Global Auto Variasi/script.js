// script.js - Modern JavaScript for Global Auto Variasi Website

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all features
  initLoading();
  initNavbar();
  initScrollProgress();
  initScrollAnimations();
  initTestimonialSlider();
  initFormValidation();
  initParallax();
  initCustomCursor();
});

// Loading Screen
function initLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 3000);
}

// Navbar Functionality
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navMenu = document.querySelector('.nav-menu');
  const navToggle = document.querySelector('.nav-toggle');
  const chatbotBtn = document.querySelector('.chatbot-btn');
  const floatingChatbot = document.querySelector('.chatbot-floating-btn');

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('mobile');
    navToggle.classList.toggle('active');
  });

  // Chatbot buttons
  const handleChatbotClick = () => {
    // Simple alert for now - can be replaced with actual chatbot integration
    alert('Chatbot akan segera tersedia! Silakan hubungi kami melalui WhatsApp: +62 812-3456-7890');
  };

  if (chatbotBtn) chatbotBtn.addEventListener('click', handleChatbotClick);
  if (floatingChatbot) floatingChatbot.addEventListener('click', handleChatbotClick);

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Close mobile menu
        navMenu.classList.remove('mobile');
        navToggle.classList.remove('active');
      }
    });
  });

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelector(`.nav-menu a[href*=${sectionId}]`).classList.add('active');
      } else {
        document.querySelector(`.nav-menu a[href*=${sectionId}]`).classList.remove('active');
      }
    });
  });
}

// Scroll Progress Bar
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    progressBar.style.width = progress + '%';
  });
}

// Scroll Animations with Intersection Observer
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);

  // Observe all sections and cards
  document.querySelectorAll('section, .service-card, .why-us-card, .stat-item, .cta-section').forEach(el => {
    observer.observe(el);
  });
}

// Testimonial Slider
function initTestimonialSlider() {
  const testimonials = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentIndex = 0;

  // Ensure we have testimonials
  if (testimonials.length === 0) return;

  function showTestimonial(index) {
    // Hide all testimonials
    testimonials.forEach((testimonial, i) => {
      testimonial.classList.toggle('active', i === index);
    });

    // Update dots
    if (dots.length > 0) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    currentIndex = index;
  }

  function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(currentIndex);
  }

  function prevTestimonial() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentIndex);
  }

  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextTestimonial);
  if (prevBtn) prevBtn.addEventListener('click', prevTestimonial);

  if (dots.length > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showTestimonial(index));
    });
  }

  // Auto slide
  setInterval(nextTestimonial, 5000);

  // Initialize first testimonial
  showTestimonial(0);
}

// Form Validation
function initFormValidation() {
  const form = document.getElementById('contactForm');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !phone || !service || !message) {
      alert('Mohon lengkapi semua field yang diperlukan.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Format email tidak valid.');
      return;
    }

    // Phone validation
    const phoneRegex = /^[\+]?[0-9\-\(\)\s]+$/;
    if (!phoneRegex.test(phone)) {
      alert('Format nomor telepon tidak valid.');
      return;
    }

    // Success message
    alert('Terima kasih! Pesan Anda telah dikirim. Kami akan menghubungi Anda segera.');
    form.reset();
  });
}

// Parallax Effect
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');

    if (hero) {
      hero.style.backgroundPositionY = -(scrolled * 0.5) + 'px';
    }
  });
}

// Custom Cursor (Optional)
function initCustomCursor() {
  // Uncomment to enable custom cursor
  /*
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
  });

  document.addEventListener('mousedown', () => {
    cursor.classList.add('active');
  });

  document.addEventListener('mouseup', () => {
    cursor.classList.remove('active');
  });

  // Add hover effects for interactive elements
  document.querySelectorAll('a, button, .btn, .service-card, .why-us-card, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
  */
}

// Gallery Hover Effects
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05) rotate(1deg)';
  });

  item.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1) rotate(0deg)';
  });
});

// Button Ripple Effect
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    this.appendChild(ripple);

    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Add ripple CSS dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debounced scroll for performance
window.addEventListener('scroll', debounce(() => {
  // Any heavy scroll operations can go here
}, 16)); // ~60fps

// Preload images for better performance
function preloadImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      const image = new Image();
      image.src = src;
    }
  });
}

preloadImages();

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/sw.js');
  });
}