/**
 * FROGGY Portfolio — Living 3D Interactive Phone Scene
 * Three.js + GSAP ScrollTrigger
 * Fixed: Drag via overlay div, subtle parallax, proper raycasting
 */

(function () {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    function boot() {
        if (typeof THREE === 'undefined') return;
        initCursor();
        init3DScene();
    }

    /* =====================================================
       CUSTOM CURSOR
    ===================================================== */
    function initCursor() {
        const cursor = document.getElementById('cursor-dot');
        const ring   = document.getElementById('cursor-ring');
        if (!cursor || !ring) return;

        let mx = -200, my = -200;
        let rx = -200, ry = -200;

        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
        });

        (function loopCursor() {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
            requestAnimationFrame(loopCursor);
        })();

        document.querySelectorAll('a, button, .btn').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
        });
    }

    /* =====================================================
       THREE.JS SCENE
    ===================================================== */
    function init3DScene() {
        const canvas = document.getElementById('webgl-canvas');
        const dragZone = document.getElementById('phone-drag-zone');
        if (!canvas) return;

        /* ---------- Renderer ---------- */
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        /* ---------- Scene & Camera ---------- */
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 14);

        /* ---------- Lighting ---------- */
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const lights = [
            { color: 0x8b5cf6, intensity: 5, pos: [5, 6, 3] },
            { color: 0x22d3ee, intensity: 4, pos: [-5, -4, 4] },
            { color: 0xfb7185, intensity: 3, pos: [0, 4, 5] }
        ];
        lights.forEach(l => {
            const pl = new THREE.PointLight(l.color, l.intensity, 35);
            pl.position.set(...l.pos);
            scene.add(pl);
        });

        /* ---------- Phone Body ---------- */
        const phoneGroup = new THREE.Group();
        scene.add(phoneGroup);

        const PW = 2.2, PH = 4.75, PD = 0.22, PR = 0.35;

        const bodyGeo = createRoundedBox(PW, PH, PD, PR, 4);
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a2e, roughness: 0.15, metalness: 0.9, clearcoat: 1.0, clearcoatRoughness: 0.05
        });
        phoneGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

        const bezelW = PW - 0.16, bezelH = PH - 0.22;
        const bezelMesh = new THREE.Mesh(
            createRoundedBox(bezelW, bezelH, 0.01, PR - 0.1, 4),
            new THREE.MeshStandardMaterial({ color: 0x050510, roughness: 0.5 })
        );
        bezelMesh.position.z = PD / 2 + 0.005;
        phoneGroup.add(bezelMesh);

        // Notch
        const notchMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32),
            new THREE.MeshStandardMaterial({ color: 0x050510 })
        );
        notchMesh.rotation.z = Math.PI / 2;
        notchMesh.position.set(0, PH / 2 - 0.28, PD / 2 + 0.012);
        phoneGroup.add(notchMesh);

        // Side buttons
        const btnMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.8 });
        [-0.6, -0.2].forEach(y => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.12), btnMat);
            b.position.set(-PW / 2 - 0.03, y, 0);
            phoneGroup.add(b);
        });
        const powerBtn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.12), btnMat);
        powerBtn.position.set(PW / 2 + 0.03, 0.3, 0);
        phoneGroup.add(powerBtn);

        /* ---------- Screen Texture ---------- */
        const SCREENS = [
            'screens/screen0.png','screens/screen1.png','screens/screen2.png',
            'screens/screen3.png','screens/screen4.png','screens/screen5.png','screens/screen6.png'
        ];

        const TEX_W = 390, TEX_H = 844;
        const sc = document.createElement('canvas');
        sc.width = TEX_W; sc.height = TEX_H;
        const ctx = sc.getContext('2d');
        const screenTexture = new THREE.CanvasTexture(sc);

        let screenImages = new Array(SCREENS.length).fill(null);
        let currentScreen = 0;
        let isTransitioning = false;
        let loadedCount = 0;

        function drawScreen(idx, offsetX) {
            ctx.clearRect(0, 0, TEX_W, TEX_H);
            ctx.fillStyle = '#f0faf5';
            ctx.fillRect(0, 0, TEX_W, TEX_H);
            if (screenImages[idx]) ctx.drawImage(screenImages[idx], offsetX || 0, 0, TEX_W, TEX_H);
            screenTexture.needsUpdate = true;
        }

        SCREENS.forEach((src, i) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                screenImages[i] = img;
                loadedCount++;
                if (i === 0) drawScreen(0);
            };
            img.onerror = () => { loadedCount++; };
            img.src = src;
        });

        function swipeTo(next) {
            if (isTransitioning) return;
            const total = SCREENS.length;
            const n = ((next % total) + total) % total;
            if (n === currentScreen) return;
            isTransitioning = true;
            const dir = n > currentScreen ? 1 : -1;
            const dur = 380, start = performance.now();

            function frame(now) {
                const t = Math.min((now - start) / dur, 1);
                const e = 1 - Math.pow(1 - t, 3);
                ctx.clearRect(0, 0, TEX_W, TEX_H);
                ctx.fillStyle = '#f0faf5';
                ctx.fillRect(0, 0, TEX_W, TEX_H);
                if (screenImages[currentScreen]) ctx.drawImage(screenImages[currentScreen], -dir * e * TEX_W, 0, TEX_W, TEX_H);
                if (screenImages[n]) ctx.drawImage(screenImages[n], dir * TEX_W * (1 - e), 0, TEX_W, TEX_H);
                screenTexture.needsUpdate = true;
                if (t < 1) requestAnimationFrame(frame);
                else {
                    currentScreen = n;
                    drawScreen(n);
                    isTransitioning = false;
                    updateDots();
                }
            }
            requestAnimationFrame(frame);
        }

        // Screen plane (hits raycaster)
        const screenW = bezelW - 0.06, screenH = bezelH - 0.06;
        const screenPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(screenW, screenH),
            new THREE.MeshBasicMaterial({ map: screenTexture })
        );
        screenPlane.position.z = PD / 2 + 0.015;
        screenPlane.name = 'screen';
        phoneGroup.add(screenPlane);

        function updateDots() {
            document.querySelectorAll('.screen-dot').forEach((d, i) => d.classList.toggle('active', i === currentScreen));
        }

        /* ---------- Raycaster for screen click ---------- */
        const raycaster = new THREE.Raycaster();
        const pointer   = new THREE.Vector2();

        /* ---------- Drag-to-Rotate via #phone-drag-zone ---------- */
        let isDragging   = false;
        let dragStart    = { x: 0, y: 0 };
        let lastDrag     = { x: 0, y: 0 };
        let velocity     = { x: 0, y: 0 };
        let targetRot    = { x: 0.08, y: 0.4 }; // initial slight tilt
        let currentRot   = { x: 0.08, y: 0.4 };
        let totalDragDist = 0;

        const zone = dragZone || document;

        zone.addEventListener('mousedown', e => {
            isDragging    = true;
            dragStart     = { x: e.clientX, y: e.clientY };
            lastDrag      = { x: e.clientX, y: e.clientY };
            velocity      = { x: 0, y: 0 };
            totalDragDist = 0;
        });

        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dx = e.clientX - lastDrag.x;
            const dy = e.clientY - lastDrag.y;
            velocity.x = dy * 0.007;
            velocity.y = dx * 0.007;
            targetRot.x += velocity.x;
            targetRot.y += velocity.y;
            totalDragDist += Math.abs(dx) + Math.abs(dy);
            lastDrag = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', e => {
            if (!isDragging) return;
            isDragging = false;
            // If barely moved → treat as click
            if (totalDragDist < 5) {
                pointer.x = (e.clientX / window.innerWidth)  *  2 - 1;
                pointer.y = (e.clientY / window.innerHeight) * -2 + 1;
                raycaster.setFromCamera(pointer, camera);
                const hits = raycaster.intersectObjects(phoneGroup.children, true);
                if (hits.length > 0) {
                    swipeTo(currentScreen + 1);
                    bouncePulse();
                }
            }
        });

        // Touch support
        let prevTouch = null;
        let touchDist = 0;
        zone.addEventListener('touchstart', e => {
            prevTouch = e.touches[0]; velocity = { x: 0, y: 0 }; touchDist = 0;
        }, { passive: true });
        zone.addEventListener('touchmove', e => {
            if (!prevTouch) return;
            const dx = e.touches[0].clientX - prevTouch.clientX;
            const dy = e.touches[0].clientY - prevTouch.clientY;
            velocity.x = dy * 0.007;
            velocity.y = dx * 0.007;
            targetRot.x += velocity.x;
            targetRot.y += velocity.y;
            touchDist += Math.abs(dx) + Math.abs(dy);
            prevTouch = e.touches[0];
        }, { passive: true });
        zone.addEventListener('touchend', e => {
            if (touchDist < 5) swipeTo(currentScreen + 1);
            prevTouch = null;
        }, { passive: true });

        // Micro bounce on screen click
        function bouncePulse() {
            let p = 0;
            const orig = phoneGroup.scale.x;
            const loop = () => {
                p += 0.07;
                const s = orig + Math.sin(p * Math.PI) * 0.05;
                phoneGroup.scale.set(s, s, s);
                if (p < 1) requestAnimationFrame(loop);
                else phoneGroup.scale.set(orig, orig, orig);
            };
            requestAnimationFrame(loop);
        }

        /* ---------- Click burst effect (CSS particles) ---------- */
        document.addEventListener('click', e => {
            // Only burst if clicking on drag zone area
            if (e.target === dragZone) createBurst(e.clientX, e.clientY);
        });

        function createBurst(cx, cy) {
            const palette = ['#8b5cf6', '#22d3ee', '#fb7185', '#ffffff'];
            for (let i = 0; i < 20; i++) {
                const dot = document.createElement('div');
                dot.className = 'burst-particle';
                const angle = Math.random() * Math.PI * 2;
                const speed = 80 + Math.random() * 120;
                dot.style.cssText = `
                    left:${cx}px; top:${cy}px;
                    background:${palette[Math.floor(Math.random() * palette.length)]};
                    width:${4 + Math.random() * 5}px;
                    height:${4 + Math.random() * 5}px;
                `;
                document.body.appendChild(dot);
                let x = cx, y = cy, vy = Math.sin(angle) * speed, vx = Math.cos(angle) * speed, life = 1;
                const tick = () => {
                    vy += 4; x += vx * 0.016; y += vy * 0.016; life -= 0.025;
                    dot.style.left = x + 'px'; dot.style.top = y + 'px';
                    dot.style.opacity = life; dot.style.transform = `scale(${life})`;
                    if (life > 0) requestAnimationFrame(tick);
                    else dot.remove();
                };
                requestAnimationFrame(tick);
            }
        }

        /* ---------- Ambient Particles ---------- */
        const COUNT = 350;
        const pPos = new Float32Array(COUNT * 3);
        const pOrig = new Float32Array(COUNT * 3);
        const pCol = new Float32Array(COUNT * 3);
        const palette3 = [new THREE.Color(0x8b5cf6), new THREE.Color(0x22d3ee), new THREE.Color(0xfb7185), new THREE.Color(0xffffff)];

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            const x = (Math.random() - 0.5) * 22;
            const y = (Math.random() - 0.5) * 18;
            const z = (Math.random() - 0.5) * 10 - 3;
            pOrig[i3] = pPos[i3] = x;
            pOrig[i3+1] = pPos[i3+1] = y;
            pOrig[i3+2] = pPos[i3+2] = z;
            const c = palette3[i % palette3.length];
            pCol[i3]=c.r; pCol[i3+1]=c.g; pCol[i3+2]=c.b;
        }

        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false });
        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);

        // Mouse for repulsion (very subtle)
        let mouseNDC = new THREE.Vector2(9999, 9999);
        document.addEventListener('mousemove', e => {
            mouseNDC.x = (e.clientX / window.innerWidth)  *  2 - 1;
            mouseNDC.y = (e.clientY / window.innerHeight) * -2 + 1;
        });

        /* ---------- GSAP Scrollytelling ---------- */
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            const mm = gsap.matchMedia();

            mm.add('(min-width: 769px)', () => {
                phoneGroup.position.set(3.0, 0.3, 0);

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2,
                        onUpdate: self => {
                            const slide = Math.min(Math.floor(self.progress * (SCREENS.length - 0.01)), SCREENS.length - 1);
                            if (slide !== currentScreen) swipeTo(slide);
                        }
                    }
                });

                tl.to(phoneGroup.position, { x: -3.2, y: 0.2, z: 1.0, ease: 'power2.inOut' }, 'exp');
                tl.to(targetRot,            { x: 0.05, y: -0.05, ease: 'power2.inOut' }, 'exp');

                tl.to(phoneGroup.position, { x: 3.5, y: -0.5, z: -1, ease: 'power2.inOut' }, 'skills');
                tl.to(targetRot,            { x: 0.2,  y: 0.5, ease: 'power2.inOut' }, 'skills');

                tl.to(phoneGroup.position, { x: 0.0, y: 0.5, z: 0, ease: 'power2.inOut' }, 'edu');
                tl.to(targetRot,            { x: 0.0, y: 0.0, ease: 'power2.inOut' }, 'edu');

                tl.to(phoneGroup.position, { x: -2.8, y: -1.0, z: -1, ease: 'power2.inOut' }, 'contact');
                tl.to(targetRot,            { x: -0.15, y: 0.3, ease: 'power2.inOut' }, 'contact');
            });

            mm.add('(max-width: 768px)', () => {
                phoneGroup.position.set(0, -2.8, -1);
                phoneGroup.scale.set(0.7, 0.7, 0.7);
                // hide drag zone on mobile (phone is below fold)
                if (dragZone) { dragZone.style.width = '100vw'; dragZone.style.top = '50vh'; dragZone.style.height = '50vh'; }

                const tl = gsap.timeline({
                    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 }
                });
                tl.to(phoneGroup.position, { x: 0, y: 2.0, z: -2 }, 'exp');
                tl.to(phoneGroup.position, { x: 0, y: 0.0, z: -1 }, 'skills');
                tl.to(phoneGroup.position, { x: 0, y: -2.0, z: -2 }, 'edu');
                tl.to(phoneGroup.position, { x: 0, y: 0.5,  z: -1 }, 'contact');
            });
        }

        /* ---------- Subtle camera parallax ---------- */
        let camTX = 0, camTY = 0, camCX = 0, camCY = 0;
        document.addEventListener('mousemove', e => {
            // Very subtle — max ±0.5 units (previously was 1.5 which caused "phone chasing" effect)
            camTX = (e.clientX / window.innerWidth  - 0.5) * 0.5;
            camTY = (e.clientY / window.innerHeight - 0.5) * 0.4;
        });

        /* ---------- Resize ---------- */
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });

        /* ---------- Render Loop ---------- */
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Idle bob
            if (!isDragging) {
                phoneGroup.position.y += Math.sin(t * 0.85) * 0.0007;
            }

            // Momentum decay
            if (!isDragging) {
                velocity.x *= 0.90;
                velocity.y *= 0.90;
                targetRot.x += velocity.x;
                targetRot.y += velocity.y;
            }

            // Clamp rotation so phone doesn't flip upside-down
            targetRot.x = Math.max(-0.9, Math.min(0.9, targetRot.x));

            // Smooth rotation lerp
            currentRot.x += (targetRot.x - currentRot.x) * 0.08;
            currentRot.y += (targetRot.y - currentRot.y) * 0.08;
            phoneGroup.rotation.x = currentRot.x;
            phoneGroup.rotation.y = currentRot.y;

            // Subtle camera drift
            camCX += (camTX - camCX) * 0.04;
            camCY += (camTY - camCY) * 0.04;
            camera.position.x = camCX;
            camera.position.y = -camCY;
            camera.lookAt(0, 0, 0);

            // Particle repulsion (gentle)
            const pa = pGeo.attributes.position.array;
            for (let i = 0; i < COUNT; i++) {
                const i3 = i * 3;
                const mx = mouseNDC.x * 8;
                const my = mouseNDC.y * 5.5;
                const dx = pa[i3] - mx;
                const dy = pa[i3+1] - my;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const rep = 2.2;
                if (dist < rep && dist > 0) {
                    const f = (rep - dist) / rep;
                    pa[i3]   += (dx/dist) * f * 0.1;
                    pa[i3+1] += (dy/dist) * f * 0.1;
                }
                // Return to origin
                pa[i3]   += (pOrig[i3]   - pa[i3])   * 0.04;
                pa[i3+1] += (pOrig[i3+1] - pa[i3+1]) * 0.04;
            }
            pGeo.attributes.position.needsUpdate = true;

            particles.rotation.y = t * 0.01;

            renderer.render(scene, camera);
        }

        animate();
    }

    /* =====================================================
       Rounded Box Helper
    ===================================================== */
    function createRoundedBox(w, h, d, r, seg) {
        const shape = new THREE.Shape();
        const x = -w/2, y = -h/2;
        shape.moveTo(x + r, y);
        shape.lineTo(x + w - r, y);
        shape.quadraticCurveTo(x + w, y, x + w, y + r);
        shape.lineTo(x + w, y + h - r);
        shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        shape.lineTo(x + r, y + h);
        shape.quadraticCurveTo(x, y + h, x, y + h - r);
        shape.lineTo(x, y + r);
        shape.quadraticCurveTo(x, y, x + r, y);

        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: d, bevelEnabled: true, bevelSegments: seg,
            steps: 1, bevelSize: r * 0.4, bevelThickness: r * 0.3, curveSegments: seg * 2
        });
        geo.center();
        return geo;
    }

})();
