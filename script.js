// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ensure images are loaded before showing
    preloadImages();
    
    // Handle popup functionality
    setupPopup();
    
    // Performance optimization - use passive event listeners
    const supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
                return true;
            }
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) {}
    
    const passiveOption = supportsPassive ? { passive: true } : false;
    
    // Create bubble particles
    createBubbles();
    
    // Phone slider functionality with smooth image transitions
    const dots = document.querySelectorAll('.dot');
    const screenContainers = document.querySelectorAll('.screen-image-container');
    
    // Make sure first image is visible
    document.querySelector('.screen-image-container[data-screen="phone-2-screen"]').classList.add('active');
    
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            
            // Update active screen
            screenContainers.forEach(screen => {
                screen.classList.remove('active');
            });
            document.querySelectorAll(`[data-screen="${screenId}"]`).forEach(screen => {
                screen.classList.add('active');
            });
            
            // Update active dot
            dots.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Auto rotate phone previews
    let currentScreenIndex = 0;
    const screens = ['phone-2-screen', 'phone-1-screen', 'phone-3-screen'];
    
    const autoRotateInterval = setInterval(() => {
        currentScreenIndex = (currentScreenIndex + 1) % screens.length;
        const currentScreen = screens[currentScreenIndex];
        
        // Update active screen
        screenContainers.forEach(screen => {
            screen.classList.remove('active');
        });
        document.querySelectorAll(`[data-screen="${currentScreen}"]`).forEach(screen => {
            screen.classList.add('active');
        });
        
        // Update active dot
        dots.forEach(d => d.classList.remove('active'));
        document.querySelector(`[data-screen="${currentScreen}"]`).classList.add('active');
    }, 4000);
    
    // Stop rotation when user interacts with dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(autoRotateInterval);
        });
    });
    
    // Setup Coming Soon popup
    function setupPopup() {
        const storeButtons = document.querySelectorAll('.store-btn');
        const popup = document.getElementById('comingSoonPopup');
        const closeBtn = document.getElementById('closePopup');
        const popupCloseBtn = document.getElementById('popupCloseBtn');
        
        // Show popup when store buttons are clicked
        storeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add active class with a small delay for better animation
                setTimeout(() => {
                    popup.classList.add('active');
                    
                    // After popup is visible, animate the content
                    setTimeout(() => {
                        popup.querySelector('.popup-content').style.opacity = '1';
                        popup.querySelector('.popup-content').style.transform = 'translateY(0)';
                    }, 50);
                }, 10);
            });
        });
        
        // Close popup when close button is clicked
        closeBtn.addEventListener('click', closePopup);
        popupCloseBtn.addEventListener('click', closePopup);
        
        // Close popup when clicking outside the content
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                closePopup();
            }
        });
        
        // Close popup with escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                closePopup();
            }
        });
        
        function closePopup() {
            // Animate out
            popup.querySelector('.popup-content').style.opacity = '0';
            popup.querySelector('.popup-content').style.transform = 'translateY(20px)';
            
            // After content animation, hide the overlay
            setTimeout(() => {
                popup.classList.remove('active');
            }, 300);
        }
    }
    
    // Preload images function
    function preloadImages() {
        const images = [
            'preview1.jpg',
            'preview2.jpg',
            'preview3.jpg'
        ];
        
        // Set first image active immediately
        const firstScreenContainer = document.querySelector('.screen-image-container[data-screen="phone-2-screen"]');
        if (firstScreenContainer) {
            firstScreenContainer.classList.add('active');
            
            // Force browser to load and render the image
            const firstImage = firstScreenContainer.querySelector('img');
            if (firstImage) {
                firstImage.style.visibility = 'visible';
                
                // Create a temporary img element to ensure it's loaded
                const tempImg = new Image();
                tempImg.onload = function() {
                    // Once loaded, make sure it's visible
                    firstImage.style.opacity = '1';
                };
                tempImg.src = firstImage.src;
            }
        }
        
        // Preload all images
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Lazy load images for better performance
    const lazyImages = document.querySelectorAll('img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (!img.hasAttribute('data-loaded')) {
                        // Force the image to load
                        const tempImg = new Image();
                        tempImg.onload = function() {
                            img.setAttribute('data-loaded', 'true');
                        };
                        tempImg.src = img.src;
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Enhanced Intersection Observer for fade-in effect with better performance
    const animatedElements = document.querySelectorAll('.glass-card, .feature');
    
    if ('IntersectionObserver' in window) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.classList.add('fade-in');
                        fadeObserver.unobserve(entry.target);
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            fadeObserver.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(element => {
            element.style.opacity = '1';
        });
    }
    
    // Debounced parallax effect for glassmorphic cards
    let ticking = false;
    const glassCards = document.querySelectorAll('.glass-card');
    
    function updateParallax(e) {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                glassCards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenterX = rect.left + rect.width / 2;
                    const cardCenterY = rect.top + rect.height / 2;
                    
                    const distanceX = (e.clientX - cardCenterX) / 30;
                    const distanceY = (e.clientY - cardCenterY) / 30;
                    
                    // Only apply effect if mouse is relatively close to the card and card is in viewport
                    const distance = Math.sqrt(Math.pow(e.clientX - cardCenterX, 2) + Math.pow(e.clientY - cardCenterY, 2));
                    
                    if (distance < 400 && rect.top < window.innerHeight && rect.bottom > 0) {
                        card.style.transform = `perspective(1000px) rotateX(${-distanceY * 0.05}deg) rotateY(${distanceX * 0.05}deg)`;
                    } else {
                        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Only use parallax effect on desktop devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        window.addEventListener('mousemove', updateParallax, passiveOption);
        
        window.addEventListener('mouseleave', () => {
            glassCards.forEach(card => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        }, passiveOption);
    }
    
    // Optimized ripple effect for buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - button.getBoundingClientRect().left;
            const y = e.clientY - button.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add smooth scrolling that works across browsers
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Smooth scroll using modern API if available
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback for browsers that don't support smooth scrolling
                    window.scrollTo(0, targetElement.offsetTop - 80);
                }
            }
        });
    });
    
    // Create bubble particles
    function createBubbles() {
        const bubblesContainer = document.querySelector('.bubbles');
        const bubbleCount = window.innerWidth < 768 ? 20 : 40;
        
        for (let i = 0; i < bubbleCount; i++) {
            const size = Math.random() * 80 + 20;
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random movement direction and duration for float animation
            const moveX = (Math.random() * 40 - 20) + 'px';
            const moveY = (Math.random() * 40 - 20) + 'px';
            const duration = (Math.random() * 3 + 2) + 's'; // Faster duration (2-5s)
            const opacity = Math.random() * 0.3 + 0.1;
            
            // Random values for the more dynamic movement
            const randomY = Math.random() * 50 - 25;  // -25 to 25
            const randomX = Math.random() * 50 - 25;  // -25 to 25
            const randomY2 = Math.random() * 50 - 25; // -25 to 25
            const randomX2 = Math.random() * 50 - 25; // -25 to 25
            const randomY3 = Math.random() * 50 - 25; // -25 to 25
            const randomX3 = Math.random() * 50 - 25; // -25 to 25
            
            // Apply styles
            bubble.style.setProperty('--duration', duration);
            bubble.style.setProperty('--move-x', moveX);
            bubble.style.setProperty('--move-y', moveY);
            bubble.style.setProperty('--opacity', opacity.toString());
            
            // Apply random movement variables
            bubble.style.setProperty('--random-y', randomY);
            bubble.style.setProperty('--random-x', randomX);
            bubble.style.setProperty('--random-y2', randomY2);
            bubble.style.setProperty('--random-x2', randomX2);
            bubble.style.setProperty('--random-y3', randomY3);
            bubble.style.setProperty('--random-x3', randomX3);
            
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = posX + 'vw';
            bubble.style.top = posY + 'vh';
            
            bubblesContainer.appendChild(bubble);
            
            // Add extra animation for some bubbles
            if (Math.random() > 0.7) {
                // Add a pulsate effect to some bubbles
                bubble.style.animation += ', pulsate 3s ease-in-out infinite';
            }
        }
    }
    
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
            // Remove existing bubbles and create new ones
            const bubblesContainer = document.querySelector('.bubbles');
            while (bubblesContainer.firstChild) {
                bubblesContainer.removeChild(bubblesContainer.firstChild);
            }
            createBubbles();
        }, 300);
    }, passiveOption);
}); 