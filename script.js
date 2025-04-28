document.addEventListener('DOMContentLoaded', function() {
    // Animate elements on load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
    
    // Show donation request modal after 10 seconds
    setTimeout(() => {
        const donateModal = document.getElementById('donateRequestModal');
        if (donateModal) {
            donateModal.style.display = 'flex';
            setTimeout(() => {
                donateModal.style.opacity = '1';
            }, 10);
            
            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            
            // Set up donate button to scroll to donate section
            const donateBtn = document.getElementById('donateNowBtn');
            if (donateBtn) {
                donateBtn.addEventListener('click', () => {
                    // Close the modal
                    closeModal(donateModal);
                    
                    // Scroll to donate section
                    const donateSection = document.getElementById('support');
                    if (donateSection) {
                        const targetPosition = donateSection.getBoundingClientRect().top + window.pageYOffset - 20;
                        butterScroll(targetPosition, butterScrollOptions.speed, butterScrollOptions.easing);
                    }
                });
            }
        }
    }, 10000); // 10 seconds
    
    // Enhanced ultra-smooth scrolling
    const butterScrollOptions = {
        speed: 1200,
        easing: 'cubicBezier',
        offset: 0,
        damping: 0.08,
        friction: 0.8
    };
    
    // Advanced easing functions for ultra-smooth physics
    const easingFunctions = {
        easeInOutQuint: function(t) {
            return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
        },
        cubicBezier: function(t) {
            // Creates a silky, soft ease - like butter
            return t * (3.0 - 2.0 * t) * t;
        },
        soft: function(t) {
            // Super soft easing, like melting butter
            return t * t * (3 - 2 * t) * (1 + 2 * t * (1 - t));
        }
    };
    
    // Initialize Butter.js-like smoothness
    class ButterScroller {
        constructor() {
            this.targetY = 0;
            this.currentY = window.pageYOffset;
            this.isScrolling = false;
            this.scrollRAF = null;
            this.damping = butterScrollOptions.damping;
            this.friction = butterScrollOptions.friction;
            
            // Set up scroll listeners
            window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
            
            // Start the animation loop
            this.update();
        }
        
        onScroll() {
            this.targetY = window.pageYOffset;
            if (!this.isScrolling) {
                this.isScrolling = true;
                this.currentY = window.pageYOffset;
            }
        }
        
        update() {
            if (this.isScrolling) {
                // Calculate delta with physics
                const delta = this.targetY - this.currentY;
                const acceleration = delta * this.damping;
                
                if (Math.abs(delta) < 0.1) {
                    this.currentY = this.targetY;
                    this.isScrolling = false;
                } else {
                    // Apply friction and damping for butter-smooth movement
                    this.currentY += acceleration * this.friction;
                    
                    // Apply the smooth transformation
                    document.body.style.transform = `translateY(${-this.currentY * 0.1}px) scale(${1 + Math.abs(delta) * 0.0001})`;
                    document.body.style.willChange = 'transform';
                }
            } else {
                document.body.style.transform = '';
                document.body.style.willChange = 'auto';
            }
            
            // Continue the loop
            this.scrollRAF = requestAnimationFrame(this.update.bind(this));
        }
    }
    
    // Initialize butter-smooth scroll only on non-touch devices
    if (!('ontouchstart' in window)) {
        const butterScroller = new ButterScroller();
    }
    
    // Super smooth scroll implementation
    function butterScroll(targetY, duration, easing) {
        const startY = window.pageYOffset;
        const difference = targetY - startY;
        const startTime = performance.now();
        
        // Cancel any ongoing animations to prevent conflict
        if (window._butterScrollTimeout) {
            clearTimeout(window._butterScrollTimeout);
            window._butterScrollAnimationFrame = null;
        }
        
        function step() {
            const currentTime = performance.now() - startTime;
            const progress = Math.min(currentTime / duration, 1);
            const easedProgress = easingFunctions[easing](progress);
            
            window.scrollTo({
                top: startY + difference * easedProgress,
                behavior: 'auto' // We're manually handling the animation
            });
            
            if (progress < 1) {
                window._butterScrollAnimationFrame = window.requestAnimationFrame(step);
            } else {
                // Set a timeout to ensure final position is reached
                window._butterScrollTimeout = setTimeout(() => {
                    window.scrollTo({
                        top: targetY,
                        behavior: 'auto'
                    });
                }, 100);
            }
        }
        
        window.requestAnimationFrame(step);
    }
    
    // Improved smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (!this.getAttribute('data-modal')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - butterScrollOptions.offset;
                    butterScroll(targetPosition, butterScrollOptions.speed, butterScrollOptions.easing);
                    
                    // Update URL without refreshing page
                    window.history.pushState(null, null, targetId);
                }
            }
        });
    });
    
    // Apply ultra-smooth wheel scrolling
    let wheelOpt = { passive: false };
    let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    
    // Advanced wheel handler with physics
    let lastScrollTime = 0;
    let scrollAmountQueue = 0;
    let isProcessingScroll = false;
    
    window.addEventListener(wheelEvent, function(e) {
        const now = performance.now();
        
        // Add wheel delta to queue but with damping
        scrollAmountQueue += e.deltaY * 0.3;
        
        // Limit maximum scroll speed
        scrollAmountQueue = Math.sign(scrollAmountQueue) * Math.min(Math.abs(scrollAmountQueue), 300);
        
        if (!isProcessingScroll) {
            isProcessingScroll = true;
            
            function processScrollQueue() {
                if (Math.abs(scrollAmountQueue) < 0.5) {
                    scrollAmountQueue = 0;
                    isProcessingScroll = false;
                    return;
                }
                
                // Apply scroll with physical damping
                window.scrollBy({
                    top: scrollAmountQueue * 0.2,
                    behavior: 'auto'
                });
                
                // Reduce queue with friction
                scrollAmountQueue *= 0.85;
                
                requestAnimationFrame(processScrollQueue);
            }
            
            requestAnimationFrame(processScrollQueue);
        }
        
        lastScrollTime = now;
    }, wheelOpt);
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navItems = document.querySelector('.nav-items');
    
    if (menuToggle && navItems) {
        menuToggle.addEventListener('click', function() {
            navItems.classList.toggle('show');
            
            if (navItems.classList.contains('show')) {
                navItems.style.display = 'flex';
                navItems.style.flexDirection = 'column';
                navItems.style.position = 'absolute';
                navItems.style.top = '100%';
                navItems.style.left = '0';
                navItems.style.right = '0';
                navItems.style.backgroundColor = 'white';
                navItems.style.padding = '1rem 2rem';
                navItems.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.1)';
                navItems.style.zIndex = '99';
            } else {
                navItems.style.display = '';
            }
        });
    }
    
    // Image slider for app preview
    const sliderImages = document.querySelectorAll('.phone-mockup img');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    
    // Function to show a specific slide
    function showSlide(index) {
        sliderImages.forEach(img => {
            img.style.opacity = '0';
            img.classList.remove('active');
        });
        dots.forEach(dot => dot.classList.remove('active'));
        
        setTimeout(() => {
            sliderImages[index].classList.add('active');
            sliderImages[index].style.opacity = '1';
            dots[index].classList.add('active');
        }, 300);
        
        currentSlide = index;
    }
    
    // Set up click events for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            
            // Reset auto rotation
            clearInterval(slideInterval);
            slideInterval = setInterval(autoSlide, index === 0 ? 5000 : 3000);
        });
    });
    
    // Auto-rotate slides with different timing
    function autoSlide() {
        const nextSlide = (currentSlide + 1) % sliderImages.length;
        showSlide(nextSlide);
        
        // Set different times for first slide vs others
        const nextDelay = nextSlide === 0 ? 5000 : 3000;
        clearInterval(slideInterval);
        slideInterval = setInterval(autoSlide, nextDelay);
    }
    
    // Start auto rotation with 5 seconds for first slide
    let slideInterval = setInterval(autoSlide, 5000);
    
    // Pause rotation when hovering over the slider
    const phoneContainer = document.querySelector('.phone-mockup');
    if (phoneContainer) {
        phoneContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        phoneContainer.addEventListener('mouseleave', () => {
            const nextDelay = currentSlide === 0 ? 5000 : 3000;
            slideInterval = setInterval(autoSlide, nextDelay);
        });
        
        // Add 3D tilt effect to phone mockup only on desktop
        if (window.innerWidth > 768) {
            phoneContainer.addEventListener('mousemove', (e) => {
                const rect = phoneContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                phoneContainer.style.transform = `perspective(1000px) rotateY(${deltaX * 8}deg) rotateX(${-deltaY * 8}deg)`;
            });
            
            phoneContainer.addEventListener('mouseleave', () => {
                phoneContainer.style.transform = 'none';
            });
        }
    }
    
    // Modal functionality
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Open modal
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.style.opacity = '1';
                }, 10);
                
                // Add event to close when clicking outside
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal(modal);
                    }
                });
                
                // Prevent scrolling
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal function
    function closeModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Close when clicking X
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal);
                }
            });
        }
    });
    
    // Intersection Observer for revealing elements when scrolled into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections and features
    document.querySelectorAll('.card-section, .feature, .step').forEach(element => {
        observer.observe(element);
    });
    
    // Particle effect in the background
    const backgroundDecoration = document.querySelector('.background-decoration');
    if (backgroundDecoration) {
        // Adjust number of particles based on screen size
        const particleCount = window.innerWidth < 768 ? 15 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random properties
            const size = Math.random() * 15 + 5;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const opacity = Math.random() * 0.3;
            const animationDuration = Math.random() * 15 + 10;
            const animationDelay = Math.random() * 5;
            
            // Apply styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.opacity = opacity;
            particle.style.animationDuration = `${animationDuration}s`;
            particle.style.animationDelay = `${animationDelay}s`;
            
            backgroundDecoration.appendChild(particle);
        }
    }

    // Responsive shape movement - less parallax on mobile
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) return; // Disable on mobile
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        document.querySelectorAll('.shape').forEach(shape => {
            const speed = shape.getAttribute('data-speed') || 0.03;
            
            shape.style.transform = `translate(${(mouseX * speed * 60) - 30}px, ${(mouseY * speed * 60) - 30}px)`;
        });
    });
    
    // Button hover effect
    document.querySelectorAll('.app-btn, .donate-btn, .modal-btn').forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                button.style.transform = 'translateY(-3px)';
                button.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
    });

    // Add CSS for particles and modal
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
        .particle {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(45deg, rgba(200, 182, 255, 0.4), rgba(156, 124, 245, 0.2));
            pointer-events: none;
            animation: float linear infinite;
        }
        
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0) rotate(0);
            }
            25% {
                transform: translateY(-15px) translateX(10px) rotate(90deg);
            }
            50% {
                transform: translateY(-30px) translateX(-10px) rotate(180deg);
            }
            75% {
                transform: translateY(-15px) translateX(-15px) rotate(270deg);
            }
            100% {
                transform: translateY(0) translateX(0) rotate(360deg);
            }
        }
        
        .in-view {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        body.loaded .shape {
            opacity: 1;
            transform: scale(1);
        }
        
        .card-section {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .card-section.in-view {
            opacity: 1;
            transform: translateY(0);
        }
        
        .modal {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-content {
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        
        .modal[style*="display: flex"] .modal-content {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Add initial attributes to shapes
    document.querySelector('.shape-1').setAttribute('data-speed', '0.02');
    document.querySelector('.shape-2').setAttribute('data-speed', '0.03');
    document.querySelector('.shape-3').setAttribute('data-speed', '0.01');

    // Apply initial styles to shapes
    document.querySelectorAll('.shape').forEach(shape => {
        shape.style.opacity = '0';
        shape.style.transform = 'scale(0.8)';
        shape.style.transition = 'opacity 1s ease, transform 1s ease';
    });
    
    // Handle resize events for better responsiveness
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.shape').forEach(shape => {
                shape.style.transform = 'none';
            });
        }
    });

    // Variables to store donation information
    let donorName = "";
    let donationAmount = 0;
    
    // Handle donate now button click in the support section
    const donateNowButton = document.querySelector('.donate-btn');
    if (donateNowButton) {
        donateNowButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Open donation form modal
            const donationFormModal = document.getElementById('donationFormModal');
            if (donationFormModal) {
                donationFormModal.style.display = 'flex';
                setTimeout(() => {
                    donationFormModal.style.opacity = '1';
                }, 10);
                
                // Prevent scrolling
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Handle donation form submission
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            donorName = document.getElementById('donorName').value.trim();
            donationAmount = document.getElementById('donationAmount').value;
            
            // Validate
            if (!donorName || !donationAmount || donationAmount <= 0) {
                alert('Please provide valid name and amount');
                return;
            }
            
            // Store data in localStorage (in case user refreshes page)
            localStorage.setItem('grozily_donor_name', donorName);
            localStorage.setItem('grozily_donation_amount', donationAmount);
            localStorage.setItem('grozily_donation_pending', 'true');
            
            // Close the modal
            const donationFormModal = document.getElementById('donationFormModal');
            closeModal(donationFormModal);
            
            // Open UPI payment in new window
            const upiId = "mohammadizhan710@oksbi";
            const upiUrl = `upi://pay?pa=${upiId}&pn=GrozilySupportTeam&am=${donationAmount}&cu=INR&tn=Donation_for_Grozily`;
            
            // Open UPI link
            window.location.href = upiUrl;
            
            // Show completion modal after a short delay (assuming the user has returned to the website)
            setTimeout(() => {
                // Check if we need to show completion modal (user has returned)
                checkAndShowCompletionModal();
            }, 1000);
        });
    }
    
    // Function to check if we need to show completion modal (when user returns from UPI app)
    function checkAndShowCompletionModal() {
        if (localStorage.getItem('grozily_donation_pending') === 'true') {
            // Get stored data
            const storedName = localStorage.getItem('grozily_donor_name');
            const storedAmount = localStorage.getItem('grozily_donation_amount');
            
            if (storedName && storedAmount) {
                // Update confirmation amount
                const confirmAmount = document.getElementById('confirmAmount');
                if (confirmAmount) {
                    confirmAmount.textContent = storedAmount;
                }
                
                // Show completion modal
                const paymentCompletionModal = document.getElementById('paymentCompletionModal');
                if (paymentCompletionModal) {
                    paymentCompletionModal.style.display = 'flex';
                    setTimeout(() => {
                        paymentCompletionModal.style.opacity = '1';
                    }, 10);
                    
                    // Prevent scrolling
                    document.body.style.overflow = 'hidden';
                }
            }
        }
    }
    
    // Check if we need to show completion modal on page load
    checkAndShowCompletionModal();
    
    // Handle payment completion
    const completePaymentBtn = document.getElementById('completePaymentBtn');
    if (completePaymentBtn) {
        completePaymentBtn.addEventListener('click', function() {
            // Get stored data
            const storedName = localStorage.getItem('grozily_donor_name');
            const storedAmount = localStorage.getItem('grozily_donation_amount');
            
            if (storedName && storedAmount) {
                // Create WhatsApp message
                const whatsappNumber = "+919596153432";
                const message = `Hello Izhaan, I've completed a donation of ₹${storedAmount} for Grozily. My name is ${storedName}. Thank you for creating this platform for Kashmir!`;
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                
                // Open WhatsApp
                window.open(whatsappUrl, '_blank');
                
                // Clear stored data
                localStorage.removeItem('grozily_donor_name');
                localStorage.removeItem('grozily_donation_amount');
                localStorage.removeItem('grozily_donation_pending');
                
                // Close the modal
                const paymentCompletionModal = document.getElementById('paymentCompletionModal');
                closeModal(paymentCompletionModal);
            }
        });
    }
    
    // Handle payment cancellation
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', function() {
            // Clear stored data
            localStorage.removeItem('grozily_donor_name');
            localStorage.removeItem('grozily_donation_amount');
            localStorage.removeItem('grozily_donation_pending');
            
            // Close the modal
            const paymentCompletionModal = document.getElementById('paymentCompletionModal');
            closeModal(paymentCompletionModal);
        });
    }
}); 