// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        try { localStorage.setItem('loaderSeen', '1'); } catch (e) {}
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1500);
    }
});

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Terminal-style "print" reveal: blocks snap in line by line instead of fading
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('printed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

if (!prefersReducedMotion) {
    document.querySelectorAll('.experience-item, .skill-category, .education-item, .ai-principles li').forEach(el => {
        const siblings = Array.from(el.parentElement.children);
        el.classList.add('print');
        el.style.animationDelay = `${(siblings.indexOf(el) % 4) * 0.08}s`;
        revealObserver.observe(el);
    });
}

// Section titles decode from random characters, like a terminal resolving output
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

function scramble(el, duration = 600) {
    const target = el.dataset.text;
    const start = performance.now();
    function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        const resolved = Math.floor(progress * target.length);
        let out = target.slice(0, resolved);
        for (let i = resolved; i < target.length; i++) {
            out += target[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        el.textContent = out;
        if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

if (!prefersReducedMotion) {
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scramble(entry.target);
                titleObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.section-title').forEach(title => {
        title.dataset.text = title.textContent;
        titleObserver.observe(title);
    });
}

// Hero title types itself out once the loader is gone.
// The untyped part stays in the layout (invisible) so the line never reflows.
const heroTitleText = document.querySelector('.hero-title-text');
const heroCursor = document.querySelector('.hero-title .ascii-cursor');
if (heroTitleText && heroCursor && !prefersReducedMotion) {
    const full = heroTitleText.textContent;
    const loaderVisible = !document.documentElement.classList.contains('no-loader');
    const render = (i) => {
        heroTitleText.innerHTML = '';
        heroTitleText.append(full.slice(0, i), heroCursor);
        const ghost = document.createElement('span');
        ghost.className = 'typing-ghost';
        ghost.textContent = full.slice(i);
        heroTitleText.append(ghost);
    };
    render(0);
    setTimeout(() => {
        let i = 0;
        const timer = setInterval(() => {
            render(++i);
            if (i >= full.length) clearInterval(timer);
        }, 70);
    }, loaderVisible ? 1900 : 300);
}

// Highlight the nav link of the section currently in view
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { rootMargin: '-45% 0px -55% 0px' });

sections.forEach(section => sectionObserver.observe(section));

// The last section may be too short to reach the middle of the viewport
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks[navLinks.length - 1].classList.add('active');
    }
});
