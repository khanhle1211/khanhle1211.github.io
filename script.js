// 1. Sticky Header
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 2. Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navList = document.querySelector('.nav-list');
const mobileMenuIcon = document.querySelector('.mobile-menu-btn i');

mobileMenuBtn.addEventListener('click', () => {
    navList.classList.toggle('show');
    if (navList.classList.contains('show')) {
        mobileMenuIcon.classList.remove('fa-bars');
        mobileMenuIcon.classList.add('fa-times');
    } else {
        mobileMenuIcon.classList.remove('fa-times');
        mobileMenuIcon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('show');
        mobileMenuIcon.classList.remove('fa-times');
        mobileMenuIcon.classList.add('fa-bars');
    });
});

// 3. Active Link Switching on Scroll
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// 4. Scroll Reveal Animations using Intersection Observer
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: stop observing once revealed
            // observer.unobserve(entry.target); 
        }
    });
};

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// 5. Contact Form Submission (Gửi trực tiếp vào Gmail qua FormSubmit API)
const contactForm = document.getElementById('contactForm');

if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        
        btn.disabled = true;
        btn.innerText = 'Đang gửi tin nhắn...';
        btn.style.opacity = '0.8';
        
        const formData = new FormData(contactForm);
        
        try {
            const response = await fetch('https://formsubmit.co/ajax/namkhanhle56@gmail.com', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.success !== "false") {
                btn.innerText = 'Đã gửi thành công!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                contactForm.reset();
            } else if (data.message && data.message.includes('Activation')) {
                btn.innerText = 'Kiểm tra Gmail để kích hoạt!';
                btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                alert("Hệ thống vừa gửi thư kích hoạt tới namkhanhle56@gmail.com. Bạn vui lòng mở Gmail (kiểm tra cả mục Spam / Thư rác) và bấm 'Activate Form' để kích hoạt nhận thư nhé!");
            } else {
                btn.innerText = 'Lỗi gửi tin, vui lòng thử lại';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }
        } catch (error) {
            btn.innerText = 'Lỗi kết nối, vui lòng thử lại';
            btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerText = originalText;
                btn.style.background = '';
            }, 4000);
        }
    });
}
