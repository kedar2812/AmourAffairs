document.addEventListener("DOMContentLoaded", () => {
    
    gsap.registerPlugin(ScrollTrigger);

    // 2. SplitText Initialization
    const splitTexts = document.querySelectorAll('.split-text');
    splitTexts.forEach(el => {
        new SplitType(el, { types: 'lines, words' });
    });

    // 3. ScrollTrigger for Snap Slides with Cool Interconnected Animations
    const slides = document.querySelectorAll('.slide');
    const sliderContainer = document.getElementById('slider');

    slides.forEach((slide, index) => {
        const words = slide.querySelectorAll('.word');
        const fades = slide.querySelectorAll('.fade-text');
        const bgWrap = slide.querySelector('.slide-bg');
        const bgImg = slide.querySelector('.slide-bg img');
        
        ScrollTrigger.create({
            trigger: slide,
            scroller: sliderContainer,
            start: 'top 50%',
            onEnter: () => animateSlideIn(words, fades, bgWrap, bgImg),
            onEnterBack: () => animateSlideIn(words, fades, bgWrap, bgImg),
            onLeave: () => resetSlide(words, fades, bgWrap, bgImg),
            onLeaveBack: () => resetSlide(words, fades, bgWrap, bgImg)
        });
    });

    function animateSlideIn(words, fades, bgWrap, bgImg) {
        // Text animation
        if(words.length) {
            gsap.to(words, {
                y: 0,
                duration: 1,
                stagger: 0.05,
                ease: 'power4.out',
                overwrite: true
            });
        }
        if(fades.length) {
            gsap.to(fades, {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.05,
                delay: 0.3,
                ease: 'power3.out',
                overwrite: true
            });
        }
        // Very cool interconnected background expansion/scale animation
        if(bgWrap) {
            gsap.to(bgWrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.inOut', overwrite: true });
        }
        if(bgImg) {
            gsap.to(bgImg, { scale: 1, duration: 1.8, ease: 'power2.out', overwrite: true });
        }
    }

    function resetSlide(words, fades, bgWrap, bgImg) {
        if(words.length) { gsap.set(words, { y: '110%' }); }
        if(fades.length) { gsap.set(fades, { opacity: 0, y: 30 }); }
        if(bgWrap) { gsap.set(bgWrap, { clipPath: 'inset(10% 10% 10% 10%)' }); }
        if(bgImg) { gsap.set(bgImg, { scale: 1.15 }); }
    }

    // Trigger animation for the first slide immediately
    const firstSlide = slides[0];
    setTimeout(() => {
        animateSlideIn(
            firstSlide.querySelectorAll('.word'), 
            firstSlide.querySelectorAll('.fade-text'),
            firstSlide.querySelector('.slide-bg'),
            firstSlide.querySelector('.slide-bg img')
        );
    }, 100);

    // 4. Global Mouse Parallax for Floating Elements
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2);
        const y = (e.clientY - window.innerHeight / 2);

        parallaxLayers.forEach(layer => {
            const speed = layer.getAttribute('data-speed') || 0.05;
            gsap.to(layer, {
                x: x * speed,
                y: y * speed,
                duration: 1,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    });

    // 5. Slider Controls
    const upBtn = document.querySelector('.up-btn');
    const downBtn = document.querySelector('.down-btn');

    if(upBtn && downBtn) {
        upBtn.addEventListener('click', () => {
            sliderContainer.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
        });
        downBtn.addEventListener('click', () => {
            sliderContainer.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        });
    }

    // Form Override
    const form = document.querySelector('.sleek-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button span');
            btn.innerHTML = 'ENQUIRY SENT &check;';
            gsap.to(form.querySelectorAll('.form-group'), { opacity: 0.3, pointerEvents: 'none' });
        });
    }

    // 6. WebGL Shader Background (Slide 5)
    const shaderCanvas = document.getElementById("slide-5-shader");
    if(shaderCanvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ canvas: shaderCanvas, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new THREE.Color(0x0a0a0b));

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

        const uniforms = {
            resolution: { value: [window.innerWidth, window.innerHeight] },
            time: { value: 0.0 },
            xScale: { value: 1.0 },
            yScale: { value: 0.5 },
            distortion: { value: 0.05 },
        };

        const vertexShader = `
            attribute vec3 position;
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            precision highp float;
            uniform vec2 resolution;
            uniform float time;
            uniform float xScale;
            uniform float yScale;
            uniform float distortion;

            void main() {
                vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
                
                float d = length(p) * distortion;
                
                float rx = p.x * (1.0 + d);
                float gx = p.x;
                float bx = p.x * (1.0 - d);

                float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
                float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
                float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
                
                gl_FragColor = vec4(r, g, b, 1.0);
            }
        `;

        const position = [
            -1.0, -1.0, 0.0,
             1.0, -1.0, 0.0,
            -1.0,  1.0, 0.0,
             1.0, -1.0, 0.0,
            -1.0,  1.0, 0.0,
             1.0,  1.0, 0.0,
        ];

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(position), 3));

        const material = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: uniforms,
            side: THREE.DoubleSide,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        function resizeShader() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            uniforms.resolution.value = [width, height];
        }
        window.addEventListener("resize", resizeShader);
        resizeShader();

        let shaderTime = 0;
        function animateShader() {
            shaderTime += 0.01;
            uniforms.time.value = shaderTime;
            renderer.render(scene, camera);
            requestAnimationFrame(animateShader);
        }
        animateShader();
    }

    // 8. Animated Gradient Background (Slide 4)
    const gradientContainer = document.getElementById("slide-4-gradient");
    if(gradientContainer) {
        const startingGap = 125;
        const Breathing = true;
        const gradientColors = ["#0A0A0A", "#2979FF", "#FF80AB", "#FF6D00", "#FFD600", "#00E676", "#3D5AFE"];
        const gradientStops = [35, 50, 60, 70, 80, 90, 100];
        const animationSpeed = 0.05;
        const breathingRange = 5;
        const topOffset = 0;

        let width = startingGap;
        let directionWidth = 1;

        const gradientStopsString = gradientStops
            .map((stop, index) => `${gradientColors[index]} ${stop}%`)
            .join(", ");

        function animateGradient() {
            if (width >= startingGap + breathingRange) directionWidth = -1;
            if (width <= startingGap - breathingRange) directionWidth = 1;

            if (!Breathing) directionWidth = 0;
            width += directionWidth * animationSpeed;

            const gradient = `radial-gradient(${width}% ${width+topOffset}% at 50% 20%, ${gradientStopsString})`;
            gradientContainer.style.background = gradient;

            requestAnimationFrame(animateGradient);
        }
        
        animateGradient();
    }

    // 7. Gooey Text Morphing (Hero Section)
    const gooeyTexts = [
        "of Capturing Forever",
        "of Preserving Love Stories",
        "of Framing Your Forever",
        "of Celebrating Two Souls",
        "of Turning Moments into Memories",
        "of Holding On to Love",
        "of Storytelling in Love",
        "of Curating Love in Motion",
        "of Creating Eternal Frames",
        "of Documenting Your Beginning"
    ];

    const text1 = document.getElementById("gooey-text-1");
    const text2 = document.getElementById("gooey-text-2");

    if(text1 && text2) {
        const morphTime = 1;
        const cooldownTime = 1.5;

        let textIndex = gooeyTexts.length - 1;
        let time = new Date();
        let morph = 0;
        let cooldown = cooldownTime;

        text1.textContent = gooeyTexts[textIndex % gooeyTexts.length];
        text2.textContent = gooeyTexts[(textIndex + 1) % gooeyTexts.length];

        function setMorph(fraction) {
            text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
            text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

            fraction = 1 - fraction;
            text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
            text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
        }

        function doCooldown() {
            morph = 0;
            text2.style.filter = "";
            text2.style.opacity = "100%";
            text1.style.filter = "";
            text1.style.opacity = "0%";
        }

        function doMorph() {
            morph -= cooldown;
            cooldown = 0;
            let fraction = morph / morphTime;

            if (fraction > 1) {
                cooldown = cooldownTime;
                fraction = 1;
            }

            setMorph(fraction);
        }

        function animateGooey() {
            requestAnimationFrame(animateGooey);
            const newTime = new Date();
            const shouldIncrementIndex = cooldown > 0;
            const dt = (newTime.getTime() - time.getTime()) / 1000;
            time = newTime;

            cooldown -= dt;

            if (cooldown <= 0) {
                if (shouldIncrementIndex) {
                    textIndex = (textIndex + 1) % gooeyTexts.length;
                    text1.textContent = gooeyTexts[textIndex % gooeyTexts.length];
                    text2.textContent = gooeyTexts[(textIndex + 1) % gooeyTexts.length];
                }
                doMorph();
            } else {
                doCooldown();
            }
        }

        animateGooey();
    }
});
