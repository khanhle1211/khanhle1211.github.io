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
    const navMenu = document.querySelector('.dock') || document.querySelector('.nav-pill-menu');
    const mobileMenuIcon = document.querySelector('.mobile-menu-btn i');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('show');
            if (mobileMenuIcon) {
                mobileMenuIcon.classList.toggle('fa-bars', !isOpen);
                mobileMenuIcon.classList.toggle('fa-times', isOpen);
            }
        });

        document.querySelectorAll('.nav-link, .tab').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                if (mobileMenuIcon) {
                    mobileMenuIcon.classList.replace('fa-times', 'fa-bars');
                }
            });
        });
    }

    // Smooth scroll for in-page anchor links with navbar offset (excluding .tab handled by dock)
    document.querySelectorAll('a[href^="#"]:not(.tab)').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const hash = this.getAttribute('href');
            if (!hash || hash === '#' || hash === 'javascript:void(0)') return;
            const target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                const offset = 85;
                const elementTop = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: Math.max(0, elementTop - offset),
                    behavior: 'smooth'
                });
                history.pushState(null, '', hash);
            }
        });
    });

    // Check if loaded with initial hash (e.g. #credentials) and offset properly
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const offset = 85;
                const elementTop = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: Math.max(0, elementTop - offset),
                    behavior: 'smooth'
                });
            }
        }, 150);
    }

    // ==========================================================================
    // 3. MENISCUS LIQUID DOCK CONTROLLER (Thanh Điều Hướng Lỏng Giọt Nước)
    // ==========================================================================
    function initMeniscusDock() {
        const dock = document.getElementById('dock');
        if (!dock) return;
        const svg = document.getElementById('skin');
        const fillP = document.getElementById('skinFill');
        const bead = document.getElementById('bead');
        const tabs = [...dock.querySelectorAll('.tab')];
        if (!svg || !fillP || !bead || tabs.length === 0) return;

        const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
        const smooth = (t) => t * t * (3 - 2 * t);
        const hex = (s) => {
            const h = (s || '').trim().replace('#', '');
            const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
            if (isNaN(n)) return [16, 185, 129];
            return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
        };
        const ACC = tabs.map((t) => hex(t.style.getPropertyValue('--acc') || '#10b981'));
        const mixRGB = (a, b, t) =>
            `${Math.round(a[0] + (b[0] - a[0]) * t)} ${Math.round(a[1] + (b[1] - a[1]) * t)} ${Math.round(a[2] + (b[2] - a[2]) * t)}`;

        const G = { W: 0, H: 0, R: 18, D: 38, RB: 24, S: 8.36, CY: 0, slots: [], span: 110 };
        const reach = (s, rb, by) => Math.sqrt(Math.max((s + rb) ** 2 - (s - by) ** 2, 1));

        function measure() {
            if (window.innerWidth <= 768) return false;
            const r = dock.getBoundingClientRect();
            const W = Math.round(r.width), H = Math.round(r.height);
            if (W < 40 || H < 30) return false;

            G.slots = tabs.map((t) => {
                const b = t.getBoundingClientRect();
                return b.left - r.left + b.width / 2;
            });
            G.span = G.slots.length > 1 ? G.slots[1] - G.slots[0] : W;
            G.W = W;
            G.H = H;
            G.R = clamp(H * 0.38, 14, 20);
            G.CY = 0;

            let D = Math.min(H * 0.78, G.span * 0.65);
            const room = G.slots[0] - G.R - 4;
            for (let i = 0; i < 3; i++) {
                const hw = reach(D * 0.22, D / 2 + 5, G.CY);
                if (hw <= room) break;
                D *= room / hw;
            }
            G.D = Math.max(Math.round(D), 32);
            G.S = G.D * 0.22;
            G.RB = G.D / 2 + 5;

            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
            dock.style.setProperty('--bead-d', `${G.D}px`);
            dock.style.setProperty('--bead-cy', `${G.CY}px`);
            dock.style.setProperty('--rise', `${(H / 2 - G.CY).toFixed(1)}px`);
            return true;
        }

        function trough(bx, by, rb, sL, sR) {
            const { W, H, R } = G;
            const wing = (s, side) => {
                const L = s + rb;
                const half = reach(s, rb, by);
                const sx = bx + side * half;
                return { sx, s, tx: sx + ((bx - sx) / L) * s, ty: s + ((by - s) / L) * s };
            };
            const A = wing(sL, -1), B = wing(sR, +1);

            const a0 = Math.atan2(A.ty - by, A.tx - bx);
            const a1 = Math.atan2(B.ty - by, B.tx - bx);
            let sweep = ((a0 - a1) * 180) / Math.PI;
            while (sweep < 0) sweep += 360;
            const large = sweep > 180 ? 1 : 0;

            const n = (v) => v.toFixed(2);
            return (
                `M0 ${n(R)}` +
                ` A${n(R)} ${n(R)} 0 0 1 ${n(R)} 0` +
                ` L${n(clamp(A.sx, R, W - R))} 0` +
                ` A${n(sL)} ${n(sL)} 0 0 1 ${n(A.tx)} ${n(A.ty)}` +
                ` A${n(rb)} ${n(rb)} 0 ${large} 0 ${n(B.tx)} ${n(B.ty)}` +
                ` A${n(sR)} ${n(sR)} 0 0 1 ${n(clamp(B.sx, R, W - R))} 0` +
                ` L${n(W - R)} 0` +
                ` A${n(R)} ${n(R)} 0 0 1 ${n(W)} ${n(R)}` +
                ` L${n(W)} ${n(H - R)}` +
                ` A${n(R)} ${n(R)} 0 0 1 ${n(W - R)} ${n(H)}` +
                ` L${n(R)} ${n(H)}` +
                ` A${n(R)} ${n(R)} 0 0 1 0 ${n(H - R)}` +
                ` Z`
            );
        }

        let x = 0, v = 0, target = 0, dragging = false, raf = 0, last = 0;
        let current = 0;

        function paint() {
            if (window.innerWidth <= 768) return;
            const q = clamp(v / 1100, -1, 1) * (dragging ? 0.5 : 1);
            const mag = Math.abs(q);
            const sL = clamp(G.S * (1 + 0.06 * mag + 0.40 * q), G.S * 0.55, G.S * 2.1);
            const sR = clamp(G.S * (1 + 0.06 * mag - 0.40 * q), G.S * 0.55, G.S * 2.1);

            const d = trough(x, G.CY, G.RB, sL, sR);
            fillP.setAttribute('d', d);

            const sx = 1 + 0.07 * mag;
            bead.style.transform = `translate3d(${x.toFixed(2)}px,0,0) scale(${sx.toFixed(3)},${(1 / sx).toFixed(3)})`;

            let near = 0, nd = Infinity;
            for (let i = 0; i < tabs.length; i++) {
                const dx = Math.abs(x - G.slots[i]);
                if (dx < nd) { nd = dx; near = i; }
                tabs[i].style.setProperty('--t', smooth(clamp(1 - dx / (G.span * 0.55), 0, 1)).toFixed(3));
            }

            const side = x >= G.slots[near] ? 1 : -1;
            const other = clamp(near + side, 0, tabs.length - 1);
            const t = other === near ? 0 : clamp(Math.abs(x - G.slots[near]) / G.span, 0, 1);
            const rgb = mixRGB(ACC[near], ACC[other], t);
            dock.style.setProperty('--glow-rgb', rgb);
            dock.style.setProperty('--glow', `rgb(${rgb})`);
        }

        function loop(now) {
            raf = 0;
            const dt = Math.min((now - last) / 1000, 1 / 30);
            last = now;

            const K = dragging ? 900 : 142;
            const C = dragging ? 52 : 19.3;
            let step = dt;
            while (step > 0) {
                const h = Math.min(step, 1 / 240);
                v += (-K * (x - target) - C * v) * h;
                x += v * h;
                step -= h;
            }

            paint();
            if (Math.abs(x - target) > 0.05 || Math.abs(v) > 0.6 || dragging) run();
            else { x = target; v = 0; paint(); }
        }

        function run() {
            if (raf) return;
            last = performance.now();
            raf = requestAnimationFrame(loop);
        }

        function select(i, { animate = true, scroll = false } = {}) {
            current = clamp(i, 0, tabs.length - 1);
            tabs.forEach((t, n) => {
                t.setAttribute('aria-selected', String(n === current));
                t.tabIndex = n === current ? 0 : -1;
            });
            if (G.slots.length > current) {
                target = G.slots[current];
                if (animate) run();
                else { x = target; v = 0; paint(); }
            }

            if (scroll) {
                const hash = tabs[current].getAttribute('href');
                if (hash && hash.startsWith('#')) {
                    const el = document.querySelector(hash);
                    if (el) {
                        window.scrollTo({
                            top: Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - 85),
                            behavior: 'smooth'
                        });
                        history.pushState(null, '', hash);
                    }
                }
            }
        }

        tabs.forEach((t, i) => {
            t.addEventListener('click', (e) => {
                e.preventDefault();
                if (!suppressClick) {
                    select(i, { animate: true, scroll: true });
                }
                dock.classList.remove('show');
                const mIcon = document.querySelector('.mobile-menu-btn i');
                if (mIcon) mIcon.classList.replace('fa-times', 'fa-bars');
            });
        });

        // Pointer Drag Events for Bead
        let startX = 0, pid = null, suppressClick = false;
        dock.addEventListener('pointerdown', (e) => {
            if (window.innerWidth <= 768) return;
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            pid = e.pointerId;
            startX = e.clientX;
            suppressClick = false;
        });

        dock.addEventListener('pointermove', (e) => {
            if (e.pointerId !== pid || window.innerWidth <= 768) return;
            if (!dragging && Math.abs(e.clientX - startX) < 7) return;
            if (!dragging) {
                dragging = true;
                suppressClick = true;
                dock.classList.add('is-dragging');
                dock.setPointerCapture(pid);
            }
            e.preventDefault();
            const left = dock.getBoundingClientRect().left;
            target = clamp(e.clientX - left, G.slots[0], G.slots[G.slots.length - 1]);
            run();
        });

        function release(e) {
            if (e.pointerId !== pid) return;
            pid = null;
            if (!dragging) return;
            dragging = false;
            dock.classList.remove('is-dragging');
            let near = 0, nd = Infinity;
            G.slots.forEach((s, i) => {
                const d = Math.abs(target - s);
                if (d < nd) { nd = d; near = i; }
            });
            select(near, { animate: true, scroll: true });
            setTimeout(() => { suppressClick = false; }, 0);
        }
        dock.addEventListener('pointerup', release);
        dock.addEventListener('pointercancel', release);

        // Keyboard navigation
        dock.addEventListener('keydown', (e) => {
            const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (step) {
                e.preventDefault();
                select((current + step + tabs.length) % tabs.length, { animate: true, scroll: true });
            }
        });

        function layout(animate = false) {
            if (!measure()) return;
            select(current, { animate });
            dock.classList.add('is-ready');
        }

        window.addEventListener('resize', () => layout(false));
        const ro = new ResizeObserver(() => layout(false));
        ro.observe(dock);

        setTimeout(() => layout(false), 80);

        // Scroll spy integration
        const sections = document.querySelectorAll('.section');
        const sectionMap = { 'home': 0, 'projects': 1, 'credentials': 2, 'contact': 3 };
        window.addEventListener('scroll', () => {
            if (dragging) return;
            let currentSec = 'home';
            sections.forEach(sec => {
                if (window.pageYOffset >= sec.offsetTop - sec.clientHeight / 3) {
                    currentSec = sec.getAttribute('id');
                }
            });
            const idx = sectionMap[currentSec];
            if (idx !== undefined && idx !== current) {
                select(idx, { animate: true, scroll: false });
            }
        }, { passive: true });

        window.__meniscus = {
            select: (i) => select(i, { animate: true, scroll: false }),
            layout: () => layout(false)
        };
    }

    initMeniscusDock();

    // 4. Scroll Reveal Animation (Mượt mà, ổn định tuyệt đối, triệt tiêu giật khung hình)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Hiện mượt mà 1 lần và giữ ổn định, không bị giật/rung lắc
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4b. Hero 3D Nam Khánh Avatar Mouse Parallax & Dynamic Motion
    const avatarViewport = document.getElementById('avatarViewport');
    const avatarCharFrame = document.getElementById('avatarCharFrame');
    const badgeFigma = document.getElementById('badgeFigma');
    const badgeThree = document.getElementById('badgeThree');
    const badgeUx = document.getElementById('badgeUx');

    if (avatarViewport && avatarCharFrame) {
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;
        let isMoving = false;

        avatarViewport.addEventListener('mousemove', (e) => {
            const rect = avatarViewport.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
            mouseY = (e.clientY - rect.top) / rect.height - 0.5;
            if (!isMoving) {
                isMoving = true;
                requestAnimationFrame(updateAvatarParallax);
            }
        });

        avatarViewport.addEventListener('mouseleave', () => {
            mouseX = 0;
            mouseY = 0;
        });

        function updateAvatarParallax() {
            currentX += (mouseX - currentX) * 0.08;
            currentY += (mouseY - currentY) * 0.08;

            const rotY = currentX * 22; // rotate Y up to ±11 deg
            const rotX = -currentY * 18; // rotate X up to ±9 deg
            const moveX = currentX * 16;
            const moveY = currentY * 12;

            avatarCharFrame.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${moveX}px, ${moveY}px, 0)`;

            // Subtle counter-parallax on floating badges for depth
            if (badgeFigma) badgeFigma.style.transform = `translate3d(${currentX * -18}px, ${currentY * -12}px, 20px)`;
            if (badgeThree) badgeThree.style.transform = `translate3d(${currentX * 20}px, ${currentY * 14}px, 25px)`;
            if (badgeUx) badgeUx.style.transform = `translate3d(${currentX * -14}px, ${currentY * 16}px, 15px)`;

            if (Math.abs(mouseX - currentX) > 0.001 || Math.abs(mouseY - currentY) > 0.001) {
                requestAnimationFrame(updateAvatarParallax);
            } else {
                isMoving = false;
            }
        }
    }

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

    // 8. Bilingual Language Switcher (Tiếng Việt / English)
    const translations = {
        'vi': {
        "navHome": "Trang chủ",
        "navProjects": "Case Studies",
        "navCredentials": "Nền tảng & Kỹ năng",
        "navContact": "Liên hệ",
        "navCta": "Liên hệ",
        "heroBadgeLabel": "Available",
        "heroBadgeText": "Sẵn sàng nhận vị trí UX/UI Designer · Front-end Developer",
        "heroTitle1": "Designing",
        "heroTitle2": "Experiences",
        "heroTitle3": "That Matter.",
        "heroSubRole": "UX/UI Designer · Front-end Developer · Đà Nẵng",
        "heroBody": "Định hướng phát triển chuyên sâu từ nghiên cứu hành vi người dùng (UX Research), chuẩn hóa Design System trên Figma đến lập trình giao diện tương tác cao cấp (Front-end Development). Tôi biến những bài toán phức tạp thành trải nghiệm kỹ thuật số trực quan, thanh lịch và giàu cảm xúc.",
        "heroBtnProjects": "Khám Phá Case Studies",
        "heroBtnFigma": "Mở Figma Design",
        "heroToolsLabel": "Chuyên môn & Công cụ:",
        "heroTabAvatar": "3D Avatar · Nam Khánh",
        "heroTabPhone": "FROGGY App (3D Phone)",
        "avatarGreeting": "Hi! Tôi là Nam Khánh 👋 UX/UI Designer & Front-end Dev. Chào mừng bạn ghé thăm portfolio!",
        "avatarLiveStatus": "3D Model Interactive · Rê chuột để xoay",
        "btnTryAppInline": "Trải nghiệm 3D Phone",
        "badgeFigma": "Figma Tokens",
        "badgeThree": "3D Interactive",
        "badgeUx": "User-Centered UX",
        "phoneAppTag": "Live Interactive App · FROGGY",
        "phoneHint": "Bấm & gõ tương tác trực tiếp như điện thoại thật · Thử bấm \"+35k Cafe\" để cập nhật số dư!",
        "csSectionTitle": "Case Studies UX/UI Tiêu Biểu",
        "csSectionDesc": "Giải quyết bài toán thực tế bằng quy trình lấy người dùng làm trung tâm (User-Centered Design)",
        "probLabel": "Vấn đề:",
        "solLabel": "Giải pháp:",
        "froggyProjectName": "Ứng Dụng Quản Lý Chi Tiêu & Chăm Sóc Tài Chính Gamified Cho Gen Z",
        "froggyProbText": "78% bạn trẻ từ bỏ việc ghi chép sau 7 ngày đầu vì các app kế toán truyền thống quá khô khan, bắt nhập quá nhiều trường dữ liệu và thiếu kết nối cảm xúc.",
        "froggySolText": "Ứng dụng quản lý tài chính có cơ chế <strong>\"3-Tap Quick Log\"</strong> ghi chép trong 4 giây, biểu đồ trực quan và linh vật Ếch tương tác theo tâm trạng tài chính.",
        "froggyMetric2Lbl": "Ghi chép siêu tốc",
        "btnCaseStudyRead": "Xem Chi Tiết Case Study (UX Deep Dive)",
        "btnFigmaFile": "Mở Figma File",
        "btnExplore11Steps": "Khám phá quy trình 11 bước",
        "safemapProjectName": "Điều Hướng Tuyến Đường An Toàn & Cảnh Báo Ngập Lụt Đô Thị Thời Gian Thực",
        "safemapProbText": "Mùa mưa bão miền Trung khiến các tuyến đường trũng tại Đà Nẵng ngập sâu bất ngờ. Ban đêm, sinh viên và người đi làm về muộn đối mặt với các ngõ vắng thiếu đèn. Google Maps không cảnh báo được rủi ro an ninh và ngập lụt cục bộ.",
        "safemapSolText": "Hệ thống bản đồ an toàn đề xuất <strong>\"Safe Route\"</strong> (Tuyến đường an toàn có đèn & đông dân cư), cảnh báo điểm ngập theo thời gian thực từ cộng đồng và tích hợp nút cứu hộ SOS 1 chạm.",
        "safemapMetric1Lbl": "Chọn Safe Route",
        "safemapMetric2Lbl": "Báo sự cố tức thì",
        "safemapMetric3Lbl": "Độ an tâm của người dùng",
        "safemapFloodTag": "Ngập 35cm (Tránh)",
        "credTitle": "Nền Tảng Đào Tạo & Kỹ Năng",
        "credDesc": "Sự kết hợp giữa tư duy thiết kế trải nghiệm người dùng và nền tảng kỹ thuật phần mềm vững chắc",
        "credCol1Title": "Năng Lực Thiết Kế & Lập Trình",
        "credCol2Title": "Học Vấn & Chứng Chỉ",
        "credCol2Sub": "Bằng cấp kỹ thuật & Chứng chỉ chuyên nghiệp",
        "credUxDesc": "Phỏng vấn người dùng, khảo sát định lượng, xây dựng User Persona, User Journey Map, Information Architecture và kiểm thử khả dụng (Usability Testing SUS).",
        "credUiDesc": "Thành thạo Figma nâng cao (Auto-Layout 5.0, Component Set, Variants, Design Tokens, Variables), tương tác vi mô (Micro-interactions), Responsive Mobile-first UI.",
        "credFeDesc": "HTML5 Semantics, Modern CSS3/SCSS (Flexbox/Grid, Glassmorphism, Keyframes), JavaScript ES6+, React, TypeScript, Three.js 3D WebGL, Git/GitHub, Agile Scrum.",
        "credDegreeRole": "Cử nhân Kỹ thuật Phần mềm",
        "credDegreeYear": "2022 – Hiện tại",
        "credDegreeSchool": "Đại học Greenwich (Việt Nam)",
        "credDegreeDesc": "Chuyên sâu: UX Research, thesis development, quy trình phát triển sản phẩm Agile Scrum và viết báo cáo kỹ thuật.",
        "credCertRole": "Chứng chỉ UI/UX Design Chuyên nghiệp",
        "credCertDesc": "Đào tạo bài bản về quy trình thiết kế User-Centered Design, Wireframing, Design System và High-fidelity Prototyping thực chiến.",
        "credLangRole": "Năng Lực Ngoại Ngữ Chuẩn Quốc Tế",
        "credLangDesc": "Đọc hiểu tài liệu kỹ thuật quốc tế, giao tiếp và thuyết trình sản phẩm bằng tiếng Anh.",
        "contactTag": "03 / Liên hệ",
        "contactTitle": "Hãy Cùng Tạo Nên <br><span class=\"gradient-text font-serif italic\">Sản Phẩm Đột Phá.</span>",
        "contactDesc": "Tôi đang tìm kiếm cơ hội hợp tác và gia nhập đội ngũ với vai trò <strong>UX/UI Designer</strong> hoặc <strong>Front-end Developer</strong>. Rất mong được trao đổi cùng bạn!",
        "contactPhoneLabel": "Số điện thoại",
        "contactLocationLabel": "Địa chỉ",
        "contactLocationVal": "Hải Châu, TP. Đà Nẵng, Việt Nam",
        "formNameLabel": "Họ và Tên",
        "formEmailLabel": "Email liên hệ",
        "formMsgLabel": "Lời nhắn / Nội dung trao đổi",
        "formNamePlaceholder": "Nguyễn Văn A",
        "formEmailPlaceholder": "your@email.com",
        "formMsgPlaceholder": "Nội dung cần trao đổi công việc hoặc cơ hội hợp tác...",
        "formBtnSend": "Gửi Tin Nhắn",
        "footerBio": "UX/UI Designer · Front-end Developer · Đam mê biến các bài toán phức tạp thành trải nghiệm tương tác trực quan & thanh lịch.",
        "footerStatus": "Sẵn sàng nhận vị trí UX/UI Designer · Front-end Developer",
        "footerNavTitle": "Điều hướng",
        "footerProjectsLink": "Case Studies",
        "footerSocialTitle": "Mạng xã hội & Kênh làm việc",
        "footerBackToTop": "Lên đầu trang",
        "profLocation": "Hải Châu, Đà Nẵng, Việt Nam",
        "profCopyEmailLabel": "Email (Bấm để copy)",
        "profPhoneLabel": "Số điện thoại",
        "profSpecEduLabel": "Học vấn",
        "profSpecUxLabel": "Chuyên môn UX/UI",
        "profSpecLangLabel": "Ngoại ngữ",
        "profSpecLangSub": "Giao tiếp & đọc tài liệu kỹ thuật tốt",
        "profSpecSkillsLabel": "Bộ kỹ năng cốt lõi",
        "profileBioText": "Tốt nghiệp chuyên ngành Công nghệ thông tin (BSc Computing) tại <strong>Đại học Greenwich</strong>, kết hợp đào tạo chuyên sâu về <strong>UX/UI Design System</strong> tại Horus Academy. Đam mê biến các bài toán phức tạp thành trải nghiệm kỹ thuật số trực quan, thanh lịch và chuẩn hóa cao.",
        "profileContactCta": "Liên hệ ngay",
        "modalEscClose": "đóng",
        "csBackTop": "Đầu trang"
},
        'en': {
        "navHome": "Home",
        "navProjects": "Case Studies",
        "navCredentials": "Credentials & Skills",
        "navContact": "Contact",
        "navCta": "Contact",
        "heroBadgeLabel": "Available",
        "heroBadgeText": "Available for UX/UI Designer & Front-end Developer Roles",
        "heroTitle1": "Designing",
        "heroTitle2": "Experiences",
        "heroTitle3": "That Matter.",
        "heroSubRole": "UX/UI Designer · Front-end Developer · Da Nang, Vietnam",
        "heroBody": "Specialized in user research (UX Research), scalable Figma Design Systems, and interactive front-end development. I transform complex workflows into intuitive, elegant, and emotionally engaging digital products.",
        "heroBtnProjects": "Explore Case Studies",
        "heroBtnFigma": "Open Figma Design",
        "heroToolsLabel": "Expertise & Tools:",
        "heroTabAvatar": "3D Avatar · Nam Khanh",
        "heroTabPhone": "FROGGY App (3D Phone)",
        "avatarGreeting": "Hi! I'm Nam Khanh 👋 UX/UI Designer & Front-end Dev. Welcome to my portfolio!",
        "avatarLiveStatus": "3D Model Interactive · Hover to rotate",
        "btnTryAppInline": "Try 3D Phone App",
        "badgeFigma": "Figma Tokens",
        "badgeThree": "3D Interactive",
        "badgeUx": "User-Centered UX",
        "phoneAppTag": "Live Interactive App · FROGGY",
        "phoneHint": "Tap & type interactively like a real phone · Try tapping \"+35k Cafe\" to update balance!",
        "csSectionTitle": "Featured UX/UI Case Studies",
        "csSectionDesc": "Solving real-world problems with User-Centered Design methodologies",
        "probLabel": "The Problem:",
        "solLabel": "The Solution:",
        "froggyProjectName": "Gamified Expense Tracking & Financial Wellbeing App for Gen Z",
        "froggyProbText": "78% of young adults abandon tracking after 7 days because traditional accounting apps are too tedious, demand excessive manual input, and lack emotional empathy.",
        "froggySolText": "Financial app featuring the <strong>\"3-Tap Quick Log\"</strong> mechanism completing entries in under 4 seconds, intuitive charts, and an animated mascot responding to spending emotions.",
        "froggyMetric2Lbl": "Ultra-fast Logging",
        "btnCaseStudyRead": "View Detailed Case Study (UX Deep Dive)",
        "btnFigmaFile": "Open Figma File",
        "btnExplore11Steps": "Explore 11-Step UX Process",
        "safemapProjectName": "Real-Time Urban Flood Warning & Safe Route Navigation App",
        "safemapProbText": "Central Vietnam storm seasons cause sudden flash floods across low-lying roads in Da Nang. Late-night commuters face poorly lit alleys, while Google Maps fails to warn against local flood depths and security hazards.",
        "safemapSolText": "Safety navigation proposing <strong>\"Safe Route\"</strong> (well-lit, populated routes), crowdsourced real-time flood depth alerts, and integrated 1-tap emergency SOS rescue.",
        "safemapMetric1Lbl": "Chose Safe Route",
        "safemapMetric2Lbl": "Instant Incident Alert",
        "safemapMetric3Lbl": "User Peace of Mind",
        "safemapFloodTag": "Flooded 35cm (Avoid)",
        "credTitle": "Educational Background & Core Competencies",
        "credDesc": "Bridging user-centered design thinking with solid software engineering foundations",
        "credCol1Title": "Design & Engineering Capabilities",
        "credCol2Title": "Education & Certifications",
        "credCol2Sub": "Engineering Degree & Professional Certifications",
        "credUxDesc": "User interviews, quantitative surveys, User Personas, User Journey Maps, Information Architecture, and System Usability Scale (SUS) testing.",
        "credUiDesc": "Advanced Figma (Auto-Layout 5.0, Component Sets, Variants, Design Tokens, Variables), micro-interactions, responsive mobile-first UI.",
        "credFeDesc": "HTML5 Semantics, Modern CSS3/SCSS (Flexbox/Grid, Glassmorphism, Keyframes), JavaScript ES6+, React, TypeScript, Three.js 3D WebGL, Git/GitHub, Agile Scrum.",
        "credDegreeRole": "BSc in Software Engineering",
        "credDegreeYear": "2022 – Present",
        "credDegreeSchool": "University of Greenwich (Vietnam)",
        "credDegreeDesc": "Specialized in: UX Research, thesis development, Agile Scrum product lifecycle, and technical reporting.",
        "credCertRole": "Professional UI/UX Design Certificate",
        "credCertDesc": "Rigorous training in User-Centered Design processes, Wireframing, scalable Design Systems, and real-world High-fidelity Prototyping.",
        "credLangRole": "International Language Proficiency",
        "credLangDesc": "Fluent in reading international technical documentation, cross-cultural team communication, and presenting design projects in English.",
        "contactTag": "03 / Contact",
        "contactTitle": "Let's Create <br><span class=\"gradient-text font-serif italic\">Breakthrough Products.</span>",
        "contactDesc": "I am seeking collaboration opportunities and joining forward-thinking teams as a <strong>UX/UI Designer</strong> or <strong>Front-end Developer</strong>. Looking forward to connecting with you!",
        "contactPhoneLabel": "Phone",
        "contactLocationLabel": "Location",
        "contactLocationVal": "Hai Chau, Da Nang City, Vietnam",
        "formNameLabel": "Full Name",
        "formEmailLabel": "Email Address",
        "formMsgLabel": "Message / Project Inquiry",
        "formNamePlaceholder": "John Doe",
        "formEmailPlaceholder": "your@email.com",
        "formMsgPlaceholder": "Tell me about your project, timeline, or inquiry...",
        "formBtnSend": "Send Message",
        "footerBio": "UX/UI Designer · Front-end Developer · Passionate about turning complex challenges into intuitive, elegant, and impactful interactive experiences.",
        "footerStatus": "Available for UX/UI Designer & Front-end Developer Roles",
        "footerNavTitle": "Navigation",
        "footerProjectsLink": "Case Studies",
        "footerSocialTitle": "Social & Professional Channels",
        "footerBackToTop": "Back to Top",
        "profLocation": "Hai Chau, Da Nang, Vietnam",
        "profCopyEmailLabel": "Email (Click to copy)",
        "profPhoneLabel": "Phone Number",
        "profSpecEduLabel": "Education",
        "profSpecUxLabel": "UX/UI Specialization",
        "profSpecLangLabel": "Languages",
        "profSpecLangSub": "Fluent technical communication & documentation",
        "profSpecSkillsLabel": "Core Skillset",
        "profileBioText": "BSc Computing graduate from <strong>University of Greenwich</strong> with specialized training in <strong>UX/UI Design System</strong> from Horus Academy. Passionate about transforming complex challenges into intuitive, elegant, and production-ready digital experiences.",
        "profileContactCta": "Get in touch",
        "modalEscClose": "close",
        "csBackTop": "Back to top"
}
    };

    let currentLang = localStorage.getItem('nk_user_lang') || 'vi';

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('nk_user_lang', lang);
        document.documentElement.lang = lang;

        const optVI = document.getElementById('langOptVI');
        const optEN = document.getElementById('langOptEN');
        if (optVI && optEN) {
            optVI.classList.toggle('active', lang === 'vi');
            optEN.classList.toggle('active', lang === 'en');
        }

        const dict = translations[lang] || translations['vi'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) {
                el.setAttribute('placeholder', dict[key]);
            }
        });

        if (window.__meniscus && typeof window.__meniscus.layout === 'function') {
            setTimeout(() => window.__meniscus.layout(), 30);
        }
    }

    const langToggleBtn = document.getElementById('langToggleBtn');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const nextLang = currentLang === 'vi' ? 'en' : 'vi';
            setLanguage(nextLang);
        });
    }

    // Initialize language
    setLanguage(currentLang);
});

// ==========================================================================
// DUAL-MODE 3D SHOWCASE LOGIC (3D Avatar & 3D Phone)
// ==========================================================================

// Global Function: Switch Hero Stage Mode (3D Avatar vs 3D Phone)
window.switchHeroStageMode = function (mode) {
    const btnAvatar = document.getElementById('modeBtnAvatar');
    const btnPhone = document.getElementById('modeBtnPhone');
    const avatarStage = document.getElementById('avatarStage');
    const phoneStageWrapper = document.getElementById('phoneStageWrapper');

    if (mode === 'avatar') {
        if (btnAvatar) {
            btnAvatar.classList.add('active');
            btnAvatar.setAttribute('aria-selected', 'true');
        }
        if (btnPhone) {
            btnPhone.classList.remove('active');
            btnPhone.setAttribute('aria-selected', 'false');
        }
        if (avatarStage) avatarStage.classList.add('active');
        if (phoneStageWrapper) phoneStageWrapper.classList.remove('active');
    } else {
        if (btnPhone) {
            btnPhone.classList.add('active');
            btnPhone.setAttribute('aria-selected', 'true');
        }
        if (btnAvatar) {
            btnAvatar.classList.remove('active');
            btnAvatar.setAttribute('aria-selected', 'false');
        }
        if (phoneStageWrapper) phoneStageWrapper.classList.add('active');
        if (avatarStage) avatarStage.classList.remove('active');
    }
};

// Interactive Avatar Character Click Gesture
let avatarQuoteIndex = 0;
window.onAvatarCharacterClick = function () {
    const quotesVi = [
        "Thiết kế lấy người dùng làm trọng tâm (User-Centered Design) là kim chỉ nam của tôi! ✨",
        "Bạn có muốn trải nghiệm app FROGGY ở tab bên cạnh không? 📱",
        "Design System chuẩn Figma Tokens giúp chuyển giao dev mượt mà 100%! 🚀",
        "Cảm ơn bạn đã ghé thăm! Rất mong có cơ hội hợp tác cùng bạn 💼"
    ];
    const quotesEn = [
        "User-Centered Design is my core compass! ✨",
        "Would you like to try the live FROGGY prototype on the phone tab? 📱",
        "Design System with Figma Tokens ensures 100% seamless dev handoff! 🚀",
        "Thank you for stopping by! Looking forward to working together 💼"
    ];

    const isEn = document.documentElement.lang === 'en';
    const quotes = isEn ? quotesEn : quotesVi;
    avatarQuoteIndex = (avatarQuoteIndex + 1) % quotes.length;

    const bubbleText = document.getElementById('avatarBubbleText');
    const bubble = document.getElementById('avatarBubble');
    if (bubbleText && bubble) {
        bubble.style.transform = 'scale(1.05)';
        bubbleText.textContent = quotes[avatarQuoteIndex];
        setTimeout(() => {
            bubble.style.transform = '';
        }, 300);
    }

    const frame = document.getElementById('avatarCharFrame');
    if (frame) {
        frame.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        frame.style.transform = 'scale(0.96) translateY(-8px)';
        setTimeout(() => {
            frame.style.transition = '';
            frame.style.transform = '';
        }, 250);
    }
};

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
