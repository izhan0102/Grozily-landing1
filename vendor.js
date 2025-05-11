// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMF4q20GiGPCya5VIn18wZh0kVw6YOhEo",
  authDomain: "grozily-user.firebaseapp.com",
  databaseURL: "https://grozily-user-default-rtdb.firebaseio.com",
  projectId: "grozily-user",
  storageBucket: "grozily-user.firebasestorage.app",
  messagingSenderId: "807882408217",
  appId: "1:807882408217:web:1e5f9321e429fea6468588",
  measurementId: "G-8R9GE715PX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const vendorForm = document.getElementById('vendorForm');
const successMessage = document.getElementById('successMessage');
const nextBtn1 = document.getElementById('nextBtn1');
const nextBtn2 = document.getElementById('nextBtn2');
const backBtn1 = document.getElementById('backBtn1');
const backBtn2 = document.getElementById('backBtn2');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step1Indicator = document.getElementById('step1-indicator');
const step2Indicator = document.getElementById('step2-indicator');
const step3Indicator = document.getElementById('step3-indicator');
const passwordToggles = document.querySelectorAll('.toggle-password');

// Form navigation - Step 1 to Step 2
nextBtn1.addEventListener('click', () => {
  // Validate first step
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const storeType = document.getElementById('storeType').value;
  
  // Simple validation
  if (!name || !phone || !storeType) {
    alert('Please fill all fields in this step');
    return;
  }
  
  if (!isValidPhoneNumber(phone)) {
    alert('Please enter a valid phone number (10 digits)');
    return;
  }
  
  // Navigate to next step
  step1.classList.remove('active');
  step2.classList.add('active');
  step1Indicator.classList.remove('active');
  step2Indicator.classList.add('active');
  
  // Scroll to top of form
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
});

// Form navigation - Step 2 to Step 3
nextBtn2.addEventListener('click', () => {
  // Validate second step
  const city = document.getElementById('city').value.trim();
  const district = document.getElementById('district').value.trim();
  const areaName = document.getElementById('areaName').value.trim();
  const pinCode = document.getElementById('pinCode').value.trim();
  
  // Simple validation
  if (!city || !district || !areaName || !pinCode) {
    alert('Please fill all fields in this step');
    return;
  }
  
  // Navigate to next step
  step2.classList.remove('active');
  step3.classList.add('active');
  step2Indicator.classList.remove('active');
  step3Indicator.classList.add('active');
  
  // Scroll to top of form
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
});

// Navigate back from Step 2 to Step 1
backBtn1.addEventListener('click', () => {
  step2.classList.remove('active');
  step1.classList.add('active');
  step2Indicator.classList.remove('active');
  step1Indicator.classList.add('active');
  
  // Scroll to top of form
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
});

// Navigate back from Step 3 to Step 2
backBtn2.addEventListener('click', () => {
  step3.classList.remove('active');
  step2.classList.add('active');
  step3Indicator.classList.remove('active');
  step2Indicator.classList.add('active');
  
  // Scroll to top of form
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
});

// Toggle password visibility
passwordToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const targetId = toggle.getAttribute('data-for');
    const targetInput = document.getElementById(targetId);
    
    if (targetInput.type === 'password') {
      targetInput.type = 'text';
      toggle.classList.remove('fa-eye-slash');
      toggle.classList.add('fa-eye');
    } else {
      targetInput.type = 'password';
      toggle.classList.remove('fa-eye');
      toggle.classList.add('fa-eye-slash');
    }
  });
});

// Form submission handler
vendorForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Show loading state
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  submitBtn.disabled = true;
  
  try {
    // Get all form values
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const storeType = document.getElementById('storeType').value;
    const city = document.getElementById('city').value.trim();
    const district = document.getElementById('district').value.trim();
    const areaName = document.getElementById('areaName').value.trim();
    const pinCode = document.getElementById('pinCode').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Final validation
    if (!isValidPhoneNumber(phone)) {
      throw new Error('Please enter a valid phone number');
    }
    
    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    // Create vendor data object
    const vendorData = {
      name,
      phone,
      storeType,
      location: {
        city,
        district,
        areaName,
        pinCode
      },
      email,
      // Store hashed password in a real app instead of plaintext
      // This is just for demonstration
      password: password, 
      registrationDate: new Date().toISOString(),
      status: 'pending' // pending, approved, rejected
    };
    
    // Save to Firebase
    const newVendorRef = database.ref('vendors').push();
    await newVendorRef.set(vendorData);
    
    // Show success message
    vendorForm.reset();
    vendorForm.parentElement.classList.add('hidden');
    successMessage.classList.remove('hidden');
    
    // Reset form after 5 seconds
    setTimeout(() => {
      window.location.reload();
    }, 5000);
    
  } catch (error) {
    console.error('Error submitting form:', error);
    
    // Show error alert
    alert(error.message || 'There was an error submitting your registration. Please try again.');
    
    // Reset submit button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Phone number validation
function isValidPhoneNumber(phone) {
  // Simple validation - 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 