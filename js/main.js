// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    if (closeBtn && mobileMenu) {
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        });
    });

    // --- Global Intersection Observer for .animate-on-scroll ---
    // We define it once and use it across pages
    // For dynamically loaded content, the observer will need to be
    // re-applied or new elements explicitly observed.
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 }); // Adjust threshold as needed

    animatedElements.forEach(el => observer.observe(el));
});

// --- Helper function to apply IntersectionObserver to new elements ---
// This can be called after new dynamic content is added to the page
function observeNewAnimatedElements(containerElement) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve after animation to save resources
                // observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const newElements = containerElement.querySelectorAll('.animate-on-scroll:not(.visible)');
    newElements.forEach(el => observer.observe(el));
}