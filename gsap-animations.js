// GSAP Animations & Scrollytelling Setup

// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    document.addEventListener("DOMContentLoaded", () => {
        initScrollyTelling();
    });
}

function initScrollyTelling() {
    // 1. Hero -> Credentials (About) Transition
    const heroSection = document.querySelector('#home');
    const heroContent = document.querySelector('.hero-content');
    const hero3dStage = document.querySelector('.hero-3d-stage');
    const credentialsSection = document.querySelector('#credentials');
    
    // Hero Parallax & Fade
    gsap.to(heroContent, {
        y: -150,
        opacity: 0,
        scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom center",
            scrub: 1
        }
    });

    gsap.to(hero3dStage, {
        scale: 0.8,
        xPercent: -20,
        y: 100,
        scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom center",
            scrub: 1
        }
    });

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
    // (A simple reveal for now, complex pinning requires DOM changes)
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

    // Magnetic Buttons
    const magnets = document.querySelectorAll('.method, .btn-primary, .real-social-btn');
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
