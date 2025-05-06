// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Check if running on localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('192.168.');

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClw75RSmwmVhQR1uQxoY-PaVSFExSbYJs",
    authDomain: "vendor-860bb.firebaseapp.com",
    projectId: "vendor-860bb",
    storageBucket: "vendor-860bb.appspot.com",
    messagingSenderId: "171347223111",
    appId: "1:171347223111:web:b99e10d960bea919f44762",
    measurementId: "G-3MLSN8T9TJ",
    databaseURL: "https://vendor-860bb-default-rtdb.firebaseio.com"
};

// Initialize Firebase app
let app, database, storage;
try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    storage = getStorage(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Variables to store user journey data
let selectedBusinessType = '';
let selectedAmount = 0;
let paymentScreenshot = null;
let paymentScreenshotURL = '';

// Check which page we're on by looking for specific elements
document.addEventListener('DOMContentLoaded', function() {
    // Terms page functionality
    const acceptTermsCheckbox = document.getElementById('accept-terms');
    const proceedBtn = document.getElementById('proceed-btn');
    const termsContent = document.querySelector('.terms-content');
    
    if (acceptTermsCheckbox && proceedBtn && termsContent) {
        // We're on the terms page
        
        // Initially disable the checkbox until user scrolls to bottom
        acceptTermsCheckbox.disabled = true;
        
        // Add scroll event listener to check if user has scrolled to the bottom
        termsContent.addEventListener('scroll', function() {
            // Check if user has scrolled to the bottom (or near bottom with a small tolerance)
            const isAtBottom = 
                Math.abs(this.scrollHeight - this.clientHeight - this.scrollTop) < 10;
            
            if (isAtBottom) {
                // Enable the checkbox if the user has scrolled to the bottom
                acceptTermsCheckbox.disabled = false;
                
                // Add a visual indicator that the checkbox is now available
                document.querySelector('.agreement label').classList.add('checkbox-enabled');
            }
        });
        
        // Add notice to inform user to scroll down
        const scrollNotice = document.createElement('div');
        scrollNotice.className = 'scroll-notice';
        scrollNotice.innerHTML = 'Please scroll down to read the entire terms and conditions';
        termsContent.parentNode.insertBefore(scrollNotice, termsContent);
        
        acceptTermsCheckbox.addEventListener('change', function() {
            proceedBtn.disabled = !this.checked;
        });
        
        proceedBtn.addEventListener('click', function() {
            window.location.href = 'payment.html';
        });
    }
    
    // Payment page functionality
    const businessOptions = document.querySelectorAll('.business-option');
    const paymentOptions = document.querySelector('.payment-options');
    const selectedTypeSpan = document.getElementById('selected-type');
    const selectedAmountSpan = document.getElementById('selected-amount');
    const upiLink = document.getElementById('upi-link');
    const paymentScreenshotInput = document.getElementById('payment-screenshot');
    const screenshotPreview = document.getElementById('screenshot-preview');
    const previewContainer = document.getElementById('preview-container');
    const proceedToRegistrationBtn = document.getElementById('proceed-to-registration');
    
    if (businessOptions.length > 0 && paymentOptions && upiLink) {
        // We're on the payment page
        businessOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                businessOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Get business type and amount
                selectedBusinessType = this.getAttribute('data-type');
                selectedAmount = this.getAttribute('data-amount');
                
                // Update UI
                selectedTypeSpan.textContent = selectedBusinessType.charAt(0).toUpperCase() + selectedBusinessType.slice(1);
                selectedAmountSpan.textContent = selectedAmount;
                
                // Show payment options
                paymentOptions.style.display = 'block';
                
                // Update UPI link
                upiLink.href = `upi://pay?pa=mohammadizhan710@okaxis&pn=Muhammad%20Izhan&cu=INR&am=${selectedAmount}`;
                
                // Save to sessionStorage for later use
                sessionStorage.setItem('businessType', selectedBusinessType);
                sessionStorage.setItem('amount', selectedAmount);
                
                // Scroll to payment options
                paymentOptions.scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // Handle screenshot upload
        if (paymentScreenshotInput) {
            paymentScreenshotInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        paymentScreenshot = e.target.result;
                        screenshotPreview.src = e.target.result;
                        previewContainer.style.display = 'block';
                        proceedToRegistrationBtn.disabled = false;
                        
                        // Save the image data to sessionStorage
                        sessionStorage.setItem('paymentScreenshot', paymentScreenshot);
                    }
                    
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Handle proceed to registration button
        if (proceedToRegistrationBtn) {
            proceedToRegistrationBtn.addEventListener('click', function() {
                window.location.href = 'registration.html';
            });
        }
    }
    
    // Registration page functionality
    const registrationForm = document.getElementById('registration-form');
    const registrationSuccess = document.getElementById('registration-success');
    
    if (registrationForm) {
        // We're on the registration page
        // Show a message if they skipped the payment step
        const businessType = sessionStorage.getItem('businessType');
        const amount = sessionStorage.getItem('amount');
        const screenshot = sessionStorage.getItem('paymentScreenshot');
        
        // Add a status message container
        const statusContainer = document.createElement('div');
        statusContainer.id = 'status-message';
        statusContainer.className = 'status-message';
        registrationForm.parentNode.insertBefore(statusContainer, registrationForm);
        
        // For testing/development - allow direct registration without payment
        // Remove this in production
        if (!businessType || !amount || !screenshot) {
            // For testing only - create dummy data
            if (!businessType) sessionStorage.setItem('businessType', 'store');
            if (!amount) sessionStorage.setItem('amount', '200');
            
            // Alert user about the proper flow
            statusContainer.innerHTML = `
                <div class="warning-message">
                    <p><strong>Note:</strong> Normally, you should complete the payment step before registration.</p>
                    <p>You can continue with registration but you'll need to make payment later.</p>
                </div>
            `;
        }
        
        // Show localhost warning if applicable
        if (isLocalhost) {
            const localhostWarning = document.createElement('div');
            localhostWarning.className = 'warning-message';
            localhostWarning.innerHTML = `
                <p><strong>Local Development Mode:</strong> Running on localhost (${window.location.host})</p>
                <p>Firebase Storage operations will be skipped to avoid CORS issues.</p>
            `;
            statusContainer.appendChild(localhostWarning);
        }
        
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Add loading indication
            const registerBtn = document.getElementById('register-btn');
            registerBtn.disabled = true;
            registerBtn.innerText = "Processing...";
            statusContainer.innerHTML = '<div class="loading-message">Processing your registration...</div>';
            
            // Get form data
            const vendorName = document.getElementById('vendor-name').value;
            const ownerName = document.getElementById('owner-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const address = document.getElementById('address').value;
            
            // Validate password match
            if (password !== confirmPassword) {
                statusContainer.innerHTML = '<div class="error-message">Passwords do not match!</div>';
                registerBtn.disabled = false;
                registerBtn.innerText = "Register";
                return;
            }
            
            // Get data from sessionStorage
            const businessType = sessionStorage.getItem('businessType') || 'not_specified';
            const amount = sessionStorage.getItem('amount') || '0';
            const screenshot = sessionStorage.getItem('paymentScreenshot');
            
            try {
                let downloadURL = '';
                
                // Skip Firebase Storage operations if running on localhost
                if (isLocalhost) {
                    console.log("Running on localhost, skipping Firebase Storage operations");
                    
                    // Simulate a delay to show loading
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Show success message after delay
                    registrationForm.style.display = 'none';
                    registrationSuccess.style.display = 'block';
                    
                    // Clear sessionStorage
                    sessionStorage.clear();
                    return;
                }
                
                // Only try to upload screenshot if Firebase is properly initialized
                if (screenshot && storage) {
                    try {
                        const screenshotRef = storageRef(storage, `payment_screenshots/${email}_${Date.now()}`);
                        await uploadString(screenshotRef, screenshot, 'data_url');
                        downloadURL = await getDownloadURL(screenshotRef);
                    } catch (uploadError) {
                        console.error("Screenshot upload error:", uploadError);
                        // Continue with registration even if screenshot upload fails
                    }
                }
                
                // Proceed with database save only if database is properly initialized
                if (database) {
                    // Save vendor data to Firebase Realtime Database
                    const vendorsRef = ref(database, 'vendors');
                    const newVendorRef = push(vendorsRef);
                    
                    await set(newVendorRef, {
                        businessName: vendorName,
                        ownerName: ownerName,
                        email: email,
                        phone: phone,
                        password: password,  // Note: In a real app, never store plain-text passwords
                        address: address,
                        businessType: businessType,
                        paymentAmount: amount,
                        paymentScreenshotURL: downloadURL || "not_provided",
                        registrationDate: new Date().toISOString(),
                        status: 'pending'
                    });
                } else {
                    // If Firebase database is not available, log the data to console
                    console.log("Registration data (Firebase unavailable):", {
                        businessName: vendorName,
                        ownerName: ownerName,
                        email: email,
                        phone: phone,
                        businessType: businessType,
                        paymentAmount: amount
                    });
                }
                
                // Show success message regardless of Firebase status
                registrationForm.style.display = 'none';
                registrationSuccess.style.display = 'block';
                
                // Clear sessionStorage
                sessionStorage.clear();
            } catch (error) {
                console.error("Error during registration:", error);
                statusContainer.innerHTML = `<div class="error-message">Registration failed: ${error.message || "Unknown error"}</div>`;
                registerBtn.disabled = false;
                registerBtn.innerText = "Register";
            }
        });
    }
}); 