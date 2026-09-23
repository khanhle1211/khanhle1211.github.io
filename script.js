/**
 * Portfolio Main Script
 * Features:
 * 1. Two-Way Scroll Reveal (Xuất hiện khi lướt xuống, biến mất khi lướt lên)
 * 2. Real Interactive 3D Phone App (FROGGY) with 3D Tilt & Working Controls
 * 3. Mobile Navigation & Sticky Header
 * 4. Contact Form Submission
 */

document.addEventListener('DOMContentLoaded', () => {

    // Profile Modal backdrop and escape listeners
    const profileModalOverlay = document.getElementById('profileModal');
    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', (e) => {
            if (e.target === profileModalOverlay) {
                toggleProfileCard();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const pm = document.getElementById('profileModal');
            if (pm && pm.classList.contains('active')) {
                toggleProfileCard();
            }
        }
    });

    // 1. Sticky Header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-pill-menu') || document.querySelector('.nav-list');
    const mobileMenuIcon = document.querySelector('.mobile-menu-btn i');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('show');
            if (mobileMenuIcon) {
                mobileMenuIcon.classList.toggle('fa-bars', !isOpen);
                mobileMenuIcon.classList.toggle('fa-times', isOpen);
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                if (mobileMenuIcon) {
                    mobileMenuIcon.classList.replace('fa-times', 'fa-bars');
                }
            });
        });
    }

    // 3. Active Nav Link on Scroll
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - section.clientHeight / 3) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });

    // 4. Two-Way Scroll Reveal Animation (Xuất hiện khi lướt xuống, Biến mất khi lướt lên!)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Cuộn tới: Hiện ra mượt mà
                entry.target.classList.add('active');
            } else {
                // Cuộn qua / Cuộn ngược lên: Biến mất mượt mà!
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 5. 3D Phone Stage Mouse Parallax Tilt
    const phoneStage = document.getElementById('phoneStage');
    const phoneDevice = document.getElementById('phoneDevice');

    if (phoneStage && phoneDevice) {
        phoneStage.addEventListener('mousemove', (e) => {
            const rect = phoneStage.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotX = -(y / (rect.height / 2)) * 12; // Max 12 deg tilt
            const rotY = (x / (rect.width / 2)) * 16;  // Max 16 deg tilt

            phoneDevice.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });

        phoneStage.addEventListener('mouseleave', () => {
            phoneDevice.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    }

    // 6. Live Status Bar Clock
    function updateStatusClock() {
        const clockEl = document.getElementById('statusClock');
        if (clockEl) {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            clockEl.textContent = `${h}:${m}`;
        }
    }
    updateStatusClock();
    setInterval(updateStatusClock, 30000);

    // 7. Contact Form Handler (FormSubmit AJAX)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = 'Đang gửi... <i class="fas fa-spinner fa-spin"></i>';

            try {
                const response = await fetch('https://formsubmit.co/ajax/namkhanhle56@gmail.com', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(contactForm)
                });
                const data = await response.json();
                if (response.ok && data.success !== 'false') {
                    btn.innerHTML = 'Đã gửi thành công! <i class="fas fa-check"></i>';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    btn.style.color = '#fff';
                    contactForm.reset();
                } else {
                    btn.innerHTML = 'Có lỗi xảy ra. Thử lại sau <i class="fas fa-exclamation"></i>';
                }
            } catch {
                btn.innerHTML = 'Lỗi kết nối. Thử lại sau <i class="fas fa-exclamation"></i>';
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 4000);
            }
        });
    }
});

// ==========================================================================
// REAL INTERACTIVE 3D PHONE APP PROTOTYPE LOGIC
// ==========================================================================

// Global Function: Switch App Screens inside 3D Phone
window.goToAppScreen = function (screenId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        target.scrollTop = 0;
    }

    // Toggle iOS Status Bar & Home Indicator color themes
    const statusBar = document.getElementById('realStatusBar');
    const homeIndicator = document.getElementById('realHomeIndicator');
    const isDarkBg = (screenId === 'screenSplash');
    
    if (statusBar) statusBar.classList.toggle('dark-mode', isDarkBg);
    if (homeIndicator) homeIndicator.classList.toggle('dark-mode', isDarkBg);

    // Update active state on dock tab buttons below phone
    document.querySelectorAll('.dock-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });

    // Update app internal bottom nav tab active state
    document.querySelectorAll('.dash-nav-tab').forEach(tab => {
        tab.classList.toggle('active', screenId === 'screenDashboard');
    });
};

// Global Function: Toggle Password Visibility inside Phone Form
window.toggleAppPassword = function () {
    const passInput = document.getElementById('liveAppPassword');
    const icon = document.getElementById('eyeToggleIcon');
    if (passInput && icon) {
        if (passInput.type === 'password') {
            passInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
};

// Global Function: Handle App Login
window.submitLiveLogin = function () {
    const hint = document.getElementById('loginValidationMsg');
    if (hint) {
        hint.className = 'real-validation-hint';
        hint.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;"></i> Đăng nhập thành công! Đang vào Dashboard...';
    }
    setTimeout(() => {
        goToAppScreen('screenDashboard');
    }, 600);
};

// Global Function: Trigger Login Error State Demonstration
window.triggerLoginError = function () {
    const hint = document.getElementById('loginValidationMsg');
    if (hint) {
        hint.className = 'real-validation-hint error';
        hint.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Mật khẩu không chính xác! Vui lòng thử lại';
        const pass = document.getElementById('liveAppPassword');
        if (pass) {
            pass.focus();
            pass.select();
        }
    }
};

// Financial Ledger Interactive State
let liveBalance = 15850000;
let liveSpent = 8150000;

function formatVNCurrency(num) {
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
}

window.logSampleExpense = function (itemName, amount) {
    liveBalance = Math.max(0, liveBalance - amount);
    liveSpent += amount;

    const balEl = document.getElementById('dashBalanceDisplay');
    const spentEl = document.getElementById('dashSpentDisplay');
    const toastEl = document.getElementById('dashToastMsg');
    const txList = document.getElementById('dashTxList');

    if (balEl) balEl.textContent = formatVNCurrency(liveBalance);
    if (spentEl) spentEl.textContent = '-' + formatVNCurrency(liveSpent) + ' (Chi)';

    if (toastEl) {
        toastEl.style.display = 'block';
        toastEl.innerHTML = `<i class="fas fa-check"></i> Đã ghi nhận ${itemName} (-${new Intl.NumberFormat('vi-VN').format(amount)}đ)`;
        setTimeout(() => {
            toastEl.style.display = 'none';
        }, 2500);
    }

    if (txList) {
        const now = new Date();
        const timeStr = `Vừa xong · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newRow = document.createElement('div');
        newRow.className = 'tx-single-item';
        newRow.style.animation = 'fadeIn 0.3s ease';
        newRow.innerHTML = `
            <div class="tx-left">
                <div class="tx-icon-circle"><i class="fas fa-receipt" style="color: #10b981;"></i></div>
                <div class="tx-meta">
                    <strong>${itemName}</strong>
                    <span>${timeStr}</span>
                </div>
            </div>
            <div class="tx-val neg">-${formatVNCurrency(amount)}</div>
        `;
        txList.insertBefore(newRow, txList.firstChild);
    }
};

window.resetSampleTx = function () {
    liveBalance = 15850000;
    liveSpent = 8150000;
    const balEl = document.getElementById('dashBalanceDisplay');
    const spentEl = document.getElementById('dashSpentDisplay');
    if (balEl) balEl.textContent = formatVNCurrency(liveBalance);
    if (spentEl) spentEl.textContent = '-8.150.000 ₫ (Chi)';
};

// Live Phone Status Clock
function updateLiveIosClock() {
    const clockEl = document.getElementById('liveIosClock');
    if (clockEl) {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        clockEl.textContent = `${h}:${m}`;
    }
}
updateLiveIosClock();
setInterval(updateLiveIosClock, 30000);

// ==========================================================================
// Case Study Reader Modal Logic
// ==========================================================================
window.openCaseStudy = function (projectId) {
    const modal = document.getElementById('caseStudyModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    switchCaseStudyTab(projectId || 'froggy');

    const scrollBody = document.getElementById('modalScrollBody');
    if (scrollBody) scrollBody.scrollTop = 0;
};

window.closeCaseStudy = function () {
    const modal = document.getElementById('caseStudyModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

window.switchCaseStudyTab = function (projectId) {
    const isFroggy = projectId === 'froggy';

    const btnFroggy = document.getElementById('tabBtnFroggy');
    const btnSafemap = document.getElementById('tabBtnSafemap');
    const contentFroggy = document.getElementById('tabContentFroggy');
    const contentSafemap = document.getElementById('tabContentSafemap');

    if (btnFroggy && btnSafemap) {
        btnFroggy.classList.toggle('active', isFroggy);
        btnSafemap.classList.toggle('active', !isFroggy);
    }

    if (contentFroggy && contentSafemap) {
        contentFroggy.classList.toggle('active', isFroggy);
        contentSafemap.classList.toggle('active', !isFroggy);
    }

    const scrollBody = document.getElementById('modalScrollBody');
    if (scrollBody) scrollBody.scrollTop = 0;
};

// Modal Backdrop Click & ESC Key Listeners
document.addEventListener('DOMContentLoaded', () => {

    // Profile Modal backdrop and escape listeners
    const profileModalOverlay = document.getElementById('profileModal');
    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', (e) => {
            if (e.target === profileModalOverlay) {
                toggleProfileCard();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const pm = document.getElementById('profileModal');
            if (pm && pm.classList.contains('active')) {
                toggleProfileCard();
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCaseStudy();
        }
    });

    const modalOverlay = document.getElementById('caseStudyModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeCaseStudy();
            }
        });
    }

    
    // TOC smooth scrolling inside Case Study Modal
    document.querySelectorAll('.cs-toc-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href');
            if (!hash || !hash.startsWith('#')) return;
            const targetEl = document.querySelector(hash);
            const scrollBody = document.getElementById('modalScrollBody');
            if (targetEl && scrollBody) {
                const targetOffset = targetEl.offsetTop - 20;
                scrollBody.scrollTo({
                    top: Math.max(0, targetOffset),
                    behavior: 'smooth'
                });
            }
        });
    });

    // Listen to modal scroll for Back-To-Top button visibility
    const modalScrollBody = document.getElementById('modalScrollBody');
    const modalBackTopBtn = document.getElementById('modalBackToTop');
    if (modalScrollBody && modalBackTopBtn) {
        modalScrollBody.addEventListener('scroll', () => {
            if (modalScrollBody.scrollTop > 350) {
                modalBackTopBtn.classList.add('visible');
            } else {
                modalBackTopBtn.classList.remove('visible');
            }
        });
    }

    // Auto open if URL has hash #casestudy-froggy or #casestudy-safemap
    if (window.location.hash === '#case-study-froggy' || window.location.hash === '#casestudy-froggy') {
        openCaseStudy('froggy');
    } else if (window.location.hash === '#case-study-safemap' || window.location.hash === '#casestudy-safemap') {
        openCaseStudy('safemap');
    }
});

// Global Function: Scroll to Top inside Modal
window.scrollModalToTop = function () {
    const scrollBody = document.getElementById('modalScrollBody');
    if (scrollBody) {
        scrollBody.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Global Functions: Toggle Profile Card Modal
window.toggleProfileCard = function (e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    const isActive = modal.classList.contains('active');
    if (isActive) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    } else {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
};

window.copyProfileEmail = function () {
    const email = 'namkhanhle56@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
        const hint = document.getElementById('copyStatusText');
        if (hint) {
            hint.innerHTML = '<i class="fas fa-check" style="color: #10b981;"></i> Đã chép!';
            setTimeout(() => {
                hint.innerHTML = '<i class="far fa-copy"></i>';
            }, 3000);
        }
    }).catch(() => {
        alert('Email: ' + email);
    });
};
