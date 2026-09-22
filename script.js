// 1. Sticky Header
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// 2. Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navList = document.querySelector('.nav-list');
const mobileMenuIcon = document.querySelector('.mobile-menu-btn i');

mobileMenuBtn.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('show');
    mobileMenuIcon.classList.toggle('fa-bars', !isOpen);
    mobileMenuIcon.classList.toggle('fa-times', isOpen);
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('show');
        mobileMenuIcon.classList.replace('fa-times', 'fa-bars');
    });
});

// 3. Active Link Switching on Scroll
const sections = document.querySelectorAll('.section');
const navLinks  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (pageYOffset >= section.offsetTop - section.clientHeight / 3) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
});

// 4. Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// 5. Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

        try {
            const response = await fetch('https://formsubmit.co/ajax/namkhanhle56@gmail.com', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            });
            const data = await response.json();
            if (response.ok && data.success !== 'false') {
                btn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btn.style.color = '#fff';
                contactForm.reset();
            } else {
                btn.innerHTML = 'Failed. Try again. <i class="fas fa-exclamation"></i>';
            }
        } catch {
            btn.innerHTML = 'Connection error. <i class="fas fa-exclamation"></i>';
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 4000);
        }
    });
}
