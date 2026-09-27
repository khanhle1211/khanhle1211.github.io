// GSAP Animations & Scrollytelling Setup

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    document.addEventListener("DOMContentLoaded", () => {
        initScrollyTelling();
        initModalScrollyTelling();
    });
}

function initScrollyTelling() {
    // 1. Hero -> Credentials (About) Transition
    const heroSection = document.querySelector('#home');
    const heroContent = document.querySelector('.hero-content');
    const showcaseContainer = document.querySelector('.phone-showcase-container');
    const credentialsSection = document.querySelector('#credentials');
    
    // Hero Parallax & Fade
    gsap.fromTo(heroContent, 
        { y: 0, opacity: 1 },
        {
            y: -150,
            opacity: 0,
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "bottom center",
                scrub: 1
            }
        }
    );

    gsap.fromTo(showcaseContainer, 
        { scale: 1, xPercent: 0, y: 0 },
        {
            scale: 0.8,
            xPercent: -20,
            y: 100,
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "bottom center",
                scrub: 1
            }
        }
    );

    gsap.fromTo(credentialsSection,
        { opacity: 0, x: 100 },
        {
            opacity: 1,
            x: 0,
            scrollTrigger: {
                trigger: heroSection,
                start: "center top",
                end: "bottom top",
                scrub: 1
            }
        }
    );

    // 2. Projects Sticky Showcase
    const projectCards = document.querySelectorAll('.case-study-card');
    projectCards.forEach((card, index) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 100 },
            { 
                opacity: 1, 
                y: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Contact Scene
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        gsap.fromTo(contactSection, 
            { opacity: 0, scale: 0.95 }, 
            {
                opacity: 1,
                scale: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: contactSection,
                    start: "top 80%",
                }
            }
        );
    }

    // Magnetic Buttons
    const magnets = document.querySelectorAll('.method, .btn-primary, .real-social-btn, .magnetic-btn');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(magnet, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.8,
                ease: "power3.out"
            });
        });
        
        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet, {
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

function initModalScrollyTelling() {
    const modalScroller = document.querySelector('.modal-scroll-body');
    if (!modalScroller) return;

    // We apply ScrollTrigger to all .cs-section inside the modal
    const csSections = document.querySelectorAll('.cs-section');
    
    csSections.forEach(section => {
        gsap.fromTo(section, 
            { opacity: 0, y: 60 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    scroller: modalScroller,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Special Animation for SafeMap SVG (Mock)
    const safemapSVG = document.querySelector('#safemap-svg-route');
    if (safemapSVG) {
        gsap.fromTo(safemapSVG, 
            { strokeDashoffset: 1000 },
            {
                strokeDashoffset: 0,
                duration: 2,
                scrollTrigger: {
                    trigger: safemapSVG,
                    scroller: modalScroller,
                    start: "top 70%",
                }
            }
        );
    }
}
