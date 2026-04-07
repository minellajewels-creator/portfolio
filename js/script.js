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

});
