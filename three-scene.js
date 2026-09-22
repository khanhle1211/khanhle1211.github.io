/**
 * FROGGY Showcase — Interactive 3D Phone Scene
 * Localized in Hero container (never follows or blocks scroll)
 * Full 360° Drag Rotation, Click to Switch Screens, Crisp Textures
 */

(function () {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DPhone);
    } else {
        init3DPhone();
    }

    function init3DPhone() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded.');
            return;
        }

        const canvas = document.getElementById('webgl-canvas');
        const container = document.getElementById('canvasWrapper');
        if (!canvas || !container) return;

        // 1. Dimensions & Renderer
        let width = container.clientWidth || 440;
        let height = container.clientHeight || 520;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);

        // 2. Scene & Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
        camera.position.set(0, 0, 8.8);

        // 3. Studio Lighting (Soft and Balanced)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        scene.add(ambientLight);

        // Soft key light from top-right
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(5, 6, 6);
        scene.add(keyLight);

        // Cyan rim light on left
        const cyanRim = new THREE.PointLight(0x22d3ee, 2.5, 20);
        cyanRim.position.set(-6, -3, 3);
        scene.add(cyanRim);

        // Violet rim light on right back
        const violetRim = new THREE.PointLight(0x8b5cf6, 2.5, 20);
        violetRim.position.set(5, -3, -4);
        scene.add(violetRim);

        // 4. Main Phone 3D Group
        const phoneGroup = new THREE.Group();
        // Initial gentle hero presentation angle
        phoneGroup.rotation.set(0.04, -0.22, 0);
        scene.add(phoneGroup);

        // Helper: Rounded Rectangle 2D Shape
        function createRoundedRectShape(w, h, r) {
            const s = new THREE.Shape();
            const x = -w / 2, y = -h / 2;
            s.moveTo(x + r, y);
            s.lineTo(x + w - r, y);
            s.quadraticCurveTo(x + w, y, x + w, y + r);
            s.lineTo(x + w, y + h - r);
            s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            s.lineTo(x + r, y + h);
            s.quadraticCurveTo(x, y + h, x, y + h - r);
            s.lineTo(x, y + r);
            s.quadraticCurveTo(x, y, x + r, y);
            return s;
        }

        // --- A. Titanium Body Frame ---
        const bodyShape = createRoundedRectShape(2.32, 4.74, 0.32);
        const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
            depth: 0.16,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: 0.02,
            bevelThickness: 0.02,
            curveSegments: 16
        });
        bodyGeo.center(); // Extent along Z: [-0.10, +0.10]

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x181822,
            metalness: 0.85,
            roughness: 0.25
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        phoneGroup.add(bodyMesh);

        // --- B. Front Screen Bezel (Slim border around screen) ---
        const bezelShape = createRoundedRectShape(2.18, 4.60, 0.28);
        const bezelGeo = new THREE.ShapeGeometry(bezelShape, 16);
        const bezelMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
        const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
        bezelMesh.position.z = 0.102;
        phoneGroup.add(bezelMesh);

        // --- C. Screen Mesh (Displays Froggy App Textures) ---
        // Aspect ratio: 2.10 / 4.52 = 0.464 (matches 390 / 844 = 0.462)
        const screenGeo = new THREE.PlaneGeometry(2.10, 4.52);
        const screenMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            toneMapped: false // 100% full vibrant Figma colors, exactly like an OLED screen!
        });
        const screenMesh = new THREE.Mesh(screenGeo, screenMat);
        screenMesh.position.z = 0.104; // Clearly in front of body and bezel!
        screenMesh.name = 'screenMesh';
        phoneGroup.add(screenMesh);

        // --- D. Dynamic Island Pill Notch ---
        const notchShape = new THREE.Shape();
        const nw = 0.55, nh = 0.15, nr = 0.075;
        const nx = -nw / 2, ny = -nh / 2;
        notchShape.moveTo(nx + nr, ny);
        notchShape.lineTo(nx + nw - nr, ny);
        notchShape.quadraticCurveTo(nx + nw, ny, nx + nw, ny + nr);
        notchShape.lineTo(nx + nw, ny + nh - nr);
        notchShape.quadraticCurveTo(nx + nw, ny + nh, nx + nw - nr, ny + nh);
        notchShape.lineTo(nx + nr, ny + nh);
        notchShape.quadraticCurveTo(nx, ny + nh, nx, ny + nh - nr);
        notchShape.lineTo(nx, ny + nr);
        notchShape.quadraticCurveTo(nx, ny, nx + nr, ny);

        const notchGeo = new THREE.ShapeGeometry(notchShape, 16);
        const notchMat = new THREE.MeshBasicMaterial({ color: 0x040406 });
        const notchMesh = new THREE.Mesh(notchGeo, notchMat);
        notchMesh.position.set(0, 1.98, 0.106);
        phoneGroup.add(notchMesh);

        // --- E. Back Camera Module (For 360° Realism) ---
        const camPlateauShape = createRoundedRectShape(0.85, 0.85, 0.18);
        const camPlateauGeo = new THREE.ExtrudeGeometry(camPlateauShape, {
            depth: 0.04,
            bevelEnabled: true,
            bevelSize: 0.015,
            bevelThickness: 0.015,
            steps: 1
        });
        camPlateauGeo.center();
        const camPlateauMat = new THREE.MeshStandardMaterial({
            color: 0x1f1f2a,
            metalness: 0.75,
            roughness: 0.3
        });
        const camPlateau = new THREE.Mesh(camPlateauGeo, camPlateauMat);
        camPlateau.position.set(-0.55, 1.65, -0.12);
        phoneGroup.add(camPlateau);

        // 3 Camera Lenses
        const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 24);
        lensGeo.rotateX(Math.PI / 2);
        const lensMat = new THREE.MeshStandardMaterial({
            color: 0x08080c,
            metalness: 0.9,
            roughness: 0.15
        });
        const lensCoords = [
            [-0.70, 1.80, -0.14],
            [-0.70, 1.50, -0.14],
            [-0.40, 1.65, -0.14]
        ];
        lensCoords.forEach(pos => {
            const lens = new THREE.Mesh(lensGeo, lensMat);
            lens.position.set(...pos);
            phoneGroup.add(lens);
        });

        // Side Buttons
        const buttonMat = new THREE.MeshStandardMaterial({ color: 0x181822, metalness: 0.8, roughness: 0.3 });
        [-0.6, -0.2].forEach(y => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.08), buttonMat);
            b.position.set(-1.18, y, 0);
            phoneGroup.add(b);
        });
        const pwrBtn = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.08), buttonMat);
        pwrBtn.position.set(1.18, 0.3, 0);
        phoneGroup.add(pwrBtn);

        // 5. Preloading the 7 FROGGY Screens
        const SCREENS = [
            { src: 'screens/screen0.png', title: 'Splash Screen · FROGGY Brand' },
            { src: 'screens/screen1.png', title: "Let's You In · Social Authentication" },
            { src: 'screens/screen2.png', title: 'Login Screen · Form Validation' },
            { src: 'screens/screen3.png', title: 'Password Recovery Flow' },
            { src: 'screens/screen4.png', title: 'Onboarding 4 · Stay On Track' },
            { src: 'screens/screen5.png', title: 'Sign Up · New Account Setup' },
            { src: 'screens/screen6.png', title: 'Sign Up Flow · Profile Setup' }
        ];

        const textureLoader = new THREE.TextureLoader();
        const textures = [];
        let texturesLoaded = 0;

        SCREENS.forEach((s, idx) => {
            textureLoader.load(
                s.src,
                tex => {
                    tex.encoding = THREE.sRGBEncoding;
                    tex.generateMipmaps = true;
                    tex.minFilter = THREE.LinearMipmapLinearFilter;
                    textures[idx] = tex;
                    texturesLoaded++;
                    if (idx === 0) {
                        screenMat.map = tex;
                        screenMat.needsUpdate = true;
                    }
                },
                undefined,
                err => {
                    console.error('Failed to load screen image:', s.src, err);
                }
            );
        });

        // 6. Screen Switching Logic
        let currentScreen = 0;

        function setScreen(idx) {
            if (idx < 0) idx = SCREENS.length - 1;
            if (idx >= SCREENS.length) idx = 0;
            currentScreen = idx;

            if (textures[currentScreen]) {
                screenMat.map = textures[currentScreen];
                screenMat.needsUpdate = true;
            }

            // Update UI Counters & Title
            const counterEl = document.querySelector('.screen-counter');
            const titleEl = document.getElementById('screenTitle');
            if (counterEl) counterEl.textContent = `Screen ${currentScreen + 1}/${SCREENS.length}`;
            if (titleEl) titleEl.textContent = SCREENS[currentScreen].title;

            // Update Active Dot
            document.querySelectorAll('.screen-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentScreen);
            });

            // Micro-haptic bounce on phone
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(
                    phoneGroup.scale,
                    { x: 1.04, y: 1.04, z: 1.04 },
                    { x: 1.0, y: 1.0, z: 1.0, duration: 0.35, ease: 'back.out(2.5)' }
                );
            }
        }

        // UI Event Listeners (Prev / Next buttons and clickable Dots)
        const prevBtn = document.getElementById('prevScreenBtn');
        const nextBtn = document.getElementById('nextScreenBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => setScreen(currentScreen - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => setScreen(currentScreen + 1));

        document.querySelectorAll('.screen-dot').forEach(dot => {
            dot.addEventListener('click', e => {
                const idx = parseInt(e.target.dataset.index, 10);
                if (!isNaN(idx)) setScreen(idx);
            });
        });

        // 7. Interactive 360° Drag & Click on the 3D Phone
        let isDragging = false;
        let startX = 0, startY = 0;
        let targetRotX = 0.04, targetRotY = -0.22;
        let currentRotX = 0.04, currentRotY = -0.22;
        let velX = 0, velY = 0;
        let dragDist = 0;

        canvas.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            dragDist = 0;
            velX = 0;
            velY = 0;
        });

        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            dragDist += Math.abs(dx) + Math.abs(dy);

            velY = dx * 0.007;
            velX = dy * 0.007;
            targetRotY += velY;
            targetRotX += velX;

            startX = e.clientX;
            startY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;

            // If barely moved, treat as direct click on phone to switch screen!
            if (dragDist < 6) {
                setScreen(currentScreen + 1);
            }
        });

        // Mobile Touch Gestures
        let touchX = 0, touchY = 0, touchDist = 0;
        canvas.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                isDragging = true;
                touchX = e.touches[0].clientX;
                touchY = e.touches[0].clientY;
                touchDist = 0;
                velX = 0;
                velY = 0;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', e => {
            if (!isDragging || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - touchX;
            const dy = e.touches[0].clientY - touchY;
            touchDist += Math.abs(dx) + Math.abs(dy);

            velY = dx * 0.007;
            velX = dy * 0.007;
            targetRotY += velY;
            targetRotX += velX;

            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
        }, { passive: true });

        canvas.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            if (touchDist < 8) {
                setScreen(currentScreen + 1);
            }
        });

        // 8. Responsive Resize
        function onResize() {
            width = container.clientWidth || 440;
            height = container.clientHeight || 520;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        window.addEventListener('resize', onResize);

        // 9. Animation Loop (60 FPS)
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            if (!isDragging) {
                // Apply rotation inertia
                velX *= 0.91;
                velY *= 0.91;
                targetRotX += velX;
                targetRotY += velY;

                // Clamp vertical tilt so it doesn't spin uncontrollably
                targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));

                // Gentle floating breath
                phoneGroup.position.y = Math.sin(t * 1.5) * 0.06;
            }

            // Smooth interpolation (lerp)
            currentRotX += (targetRotX - currentRotX) * 0.08;
            currentRotY += (targetRotY - currentRotY) * 0.08;

            phoneGroup.rotation.x = currentRotX;
            phoneGroup.rotation.y = currentRotY;

            renderer.render(scene, camera);
        }

        animate();
    }
})();
