document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Preloader Animation
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        gsap.to('.loading-bar', { 
            width: '100%', 
            duration: 1.5, 
            ease: 'power2.inOut', 
            onComplete: () => {
                gsap.to(preloader, { yPercent: -100, duration: 1, ease: 'power4.inOut' });
                // Optional: trigger timeline for hero elements
                const evt = new CustomEvent('preloaderDone');
                document.dispatchEvent(evt);
            }
        });
    } else {
        const evt = new CustomEvent('preloaderDone');
        document.dispatchEvent(evt);
    }

    // 2. Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        const hoverables = document.querySelectorAll('a, .btn, button, input, textarea');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    // 3. Magnetic Buttons / Elements
    const magnets = document.querySelectorAll('.magnetic-wrap');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(magnet.children[0] || magnet, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: "power2.out" });
        });

        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet.children[0] || magnet, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        });
    });

    // 4. Page Transitions Interceptor
    const links = document.querySelectorAll('a');
    const transitionEl = document.querySelector('.page-transition');
    const transitionText = document.querySelector('.transition-text');

    links.forEach(link => {
        link.addEventListener('click', e => {
            // Internal links handling
            if(link.hostname === window.location.hostname && targetIsPage(link) && link.target !== "_blank") {
                e.preventDefault();
                const targetUrl = link.href;
                
                if (transitionEl) {
                    const tl = gsap.timeline();
                    let pageName = targetUrl.split('/').pop().split('.')[0] || "Home";
                    if(pageName === "index" || pageName === "") pageName = "Home";
                    
                    if(transitionText) {
                        transitionText.innerText = pageName.toUpperCase();
                    }

                    tl.to(transitionEl, { y: 0, duration: 0.8, ease: "power4.inOut" })
                      .to(transitionText, { opacity: 1, duration: 0.3 })
                      .to({}, { duration: 0.2, onComplete: () => {
                          window.location.href = targetUrl;
                      }});
                } else {
                    window.location.href = targetUrl;
                }
            }
        });
    });
    
    // Page load transition (if returning back)
    if(transitionEl && transitionEl.style.transform === 'translateY(0px)') {
        gsap.to(transitionEl, { y: '-100%', duration: 0.8, ease: "power4.inOut", delay: 0.2 });
    }

    // Helper for transitions
    function targetIsPage(link) {
        if(link.getAttribute('href').startsWith('#')) return false;
        if(link.pathname === window.location.pathname) return false;
        return true;
    }

    // 5. Interactive Particle Background
    const canvas = document.createElement('canvas');
    canvas.id = 'interactive-particles';
    document.body.prepend(canvas);

    Object.assign(canvas.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: '-1',
        pointerEvents: 'none'
    });

    const ctx = canvas.getContext('2d');
    let w, h;
    let particlesArray = [];
    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        initParticles();
    }
    
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 25) + 1; 
        }
        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
        update() {
            if(mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 10;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
            }
        }
    }

    function initParticles() {
        particlesArray = [];
        let numParticles = (w * h) / 10000;
        for (let i = 0; i < numParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].draw();
            particlesArray[i].update();
        }
        requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    animateParticles();

});
