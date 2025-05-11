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

// Admin credentials
const ADMIN_USERNAME = 'izhan';
const ADMIN_PASSWORD = 'izhan123';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const adminDashboard = document.getElementById('adminDashboard');
const vendorList = document.getElementById('vendorList');
const logoutBtn = document.getElementById('logoutBtn');
const noVendorsMessage = document.querySelector('.no-vendors');

// DOM Elements for search and filter
const searchInput = document.getElementById('searchVendors');
const statusFilter = document.getElementById('statusFilter');
const passwordToggle = document.querySelector('.toggle-password');

// Check if user is already logged in
function checkAuthState() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
  if (isLoggedIn) {
    showDashboard();
  }
}

// Login handler
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  // Show loading state
  const originalText = loginBtn.innerHTML;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  loginBtn.disabled = true;
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set session storage to keep login state
    sessionStorage.setItem('adminLoggedIn', 'true');
    showDashboard();
  } else {
    loginError.classList.remove('hidden');
    // Reset button
    loginBtn.innerHTML = originalText;
    loginBtn.disabled = false;
  }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('adminLoggedIn');
  showLoginForm();
});

// Show dashboard and load vendors
function showDashboard() {
  loginForm.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  loadVendors();
}

// Show login form
function showLoginForm() {
  loginForm.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  loginError.classList.add('hidden');
}

// Toggle password visibility in admin login
passwordToggle.addEventListener('click', () => {
  const targetId = passwordToggle.getAttribute('data-for');
  const targetInput = document.getElementById(targetId);
  
  if (targetInput.type === 'password') {
    targetInput.type = 'text';
    passwordToggle.classList.remove('fa-eye-slash');
    passwordToggle.classList.add('fa-eye');
  } else {
    targetInput.type = 'password';
    passwordToggle.classList.remove('fa-eye');
    passwordToggle.classList.add('fa-eye-slash');
  }
});

// Store all vendors for filtering
let allVendors = [];

// Load vendors from Firebase with search and filter
function loadVendors() {
  const vendorsRef = database.ref('vendors');
  
  // Show loading state
  vendorList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading vendors...</div>';
  
  vendorsRef.on('value', (snapshot) => {
    // Clear current list
    vendorList.innerHTML = '';
    
    const vendors = snapshot.val();
    
    if (!vendors) {
      noVendorsMessage.classList.remove('hidden');
      return;
    }
    
    noVendorsMessage.classList.add('hidden');
    
    // Convert object to array and sort by date (newest first)
    allVendors = Object.entries(vendors)
      .map(([id, data]) => ({id, ...data}))
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    
    // Apply current filter and search
    filterAndDisplayVendors();
  });
}

// Filter and display vendors based on search and status filter
function filterAndDisplayVendors() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;
  
  // Clear current list
  vendorList.innerHTML = '';
  
  // Filter vendors
  const filteredVendors = allVendors.filter(vendor => {
    // Status filter
    if (statusValue !== 'all' && vendor.status !== statusValue) {
      return false;
    }
    
    // Skip rejected vendors entirely
    if (vendor.status === 'rejected') {
      return false;
    }
    
    // Search filter - check if any field contains the search term
    if (searchTerm) {
      const vendorName = vendor.name.toLowerCase();
      const vendorPhone = vendor.phone.toLowerCase();
      const vendorEmail = vendor.email ? vendor.email.toLowerCase() : '';
      const vendorCity = vendor.location.city ? vendor.location.city.toLowerCase() : '';
      const vendorDistrict = vendor.location.district ? vendor.location.district.toLowerCase() : '';
      const vendorArea = vendor.location.areaName.toLowerCase();
      
      return vendorName.includes(searchTerm) || 
             vendorPhone.includes(searchTerm) ||
             vendorEmail.includes(searchTerm) ||
             vendorCity.includes(searchTerm) ||
             vendorDistrict.includes(searchTerm) ||
             vendorArea.includes(searchTerm);
    }
    
    return true;
  });
  
  // Show no results message if needed
  if (filteredVendors.length === 0) {
    vendorList.innerHTML = '<p class="no-vendors">No vendors match your search criteria.</p>';
    return;
  }
  
  // Create vendor cards for filtered vendors
  filteredVendors.forEach(vendor => {
    const vendorCard = createVendorCard(vendor);
    vendorList.appendChild(vendorCard);
  });
}

// Add event listeners for search and filter
searchInput.addEventListener('input', filterAndDisplayVendors);
statusFilter.addEventListener('change', filterAndDisplayVendors);

// Create vendor card
function createVendorCard(vendor) {
  const card = document.createElement('div');
  card.className = 'vendor-card';
  
  // Format store type for display
  const storeTypeMap = {
    generalStore: 'General Store',
    wholeSale: 'Whole Sale',
    kirana: 'Kirana',
    vegetableSeller: 'Vegetable Seller',
    mart: 'Mart'
  };
  
  // Format date for display
  const registrationDate = new Date(vendor.registrationDate).toLocaleString();
  
  // Build HTML content
  let cardContent = `
    <h3>${vendor.name}</h3>
    <div class="vendor-details">
      <div class="detail-section">
        <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
        <p><span class="label">Phone:</span> ${vendor.phone}</p>
        <p><span class="label">Email:</span> ${vendor.email || 'Not provided'}</p>
        <p><span class="label">Store Type:</span> ${storeTypeMap[vendor.storeType] || vendor.storeType}</p>
        <p><span class="label">Status:</span> <span class="status ${vendor.status}">${vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}</span></p>
      </div>
      
      <div class="detail-section">
        <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
        <p><span class="label">City:</span> ${vendor.location.city || 'Not provided'}</p>
        <p><span class="label">District:</span> ${vendor.location.district || 'Not provided'}</p>
        <p><span class="label">Area:</span> ${vendor.location.areaName}</p>
        <p><span class="label">PIN Code:</span> ${vendor.location.pinCode}</p>
      </div>
      
      <div class="detail-section">
        <h4><i class="fas fa-calendar-alt"></i> Registration Info</h4>
        <p><span class="label">Date:</span> ${registrationDate}</p>
        <p><span class="label">ID:</span> <span class="vendor-id">${vendor.id}</span></p>
      </div>
    </div>
    
    <div class="vendor-actions">
      <button class="action-btn approve-btn" data-id="${vendor.id}" ${vendor.status === 'approved' ? 'disabled' : ''}>
        <i class="fas fa-check"></i> ${vendor.status === 'approved' ? 'Approved' : 'Approve'}
      </button>
      <button class="action-btn reject-btn" data-id="${vendor.id}" ${vendor.status === 'rejected' ? 'disabled' : ''}>
        <i class="fas fa-times"></i> ${vendor.status === 'rejected' ? 'Rejected' : 'Reject'}
      </button>
    </div>
  `;
  
  card.innerHTML = cardContent;
  
  // Add event listeners to approve/reject buttons
  const approveBtn = card.querySelector('.approve-btn');
  const rejectBtn = card.querySelector('.reject-btn');
  
  if (!approveBtn.disabled) {
    approveBtn.addEventListener('click', () => updateVendorStatus(vendor.id, 'approved', approveBtn, rejectBtn));
  }
  
  if (!rejectBtn.disabled) {
    rejectBtn.addEventListener('click', () => updateVendorStatus(vendor.id, 'rejected', approveBtn, rejectBtn));
  }
  
  return card;
}

// Update vendor status
function updateVendorStatus(vendorId, status, approveBtn, rejectBtn) {
  // Show loading state on button
  const btn = status === 'approved' ? approveBtn : rejectBtn;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing...`;
  btn.disabled = true;
  
  database.ref(`vendors/${vendorId}`).update({
    status: status
  }).then(() => {
    console.log(`Vendor ${vendorId} ${status}`);
    
    if (status === 'rejected') {
      // Remove the card from UI when rejected
      const vendorCard = btn.closest('.vendor-card');
      vendorCard.classList.add('card-fade-out');
      setTimeout(() => {
        vendorCard.remove();
        
        // Check if there are no more vendors
        if (vendorList.children.length === 0) {
          vendorList.innerHTML = '<p class="no-vendors">No vendor registrations to display.</p>';
        }
      }, 500);
    } else {
      // Update buttons for approved
      approveBtn.innerHTML = `<i class="fas fa-check"></i> Approved`;
      approveBtn.disabled = true;
      rejectBtn.disabled = false;
      
      // Update status display in the card
      const statusElem = approveBtn.closest('.vendor-card').querySelector('.status');
      statusElem.className = `status ${status}`;
      statusElem.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
    
  }).catch(error => {
    console.error('Error updating vendor status:', error);
    alert('Error updating vendor status. Please try again.');
    btn.innerHTML = originalText;
    btn.disabled = false;
  });
}

// Initialize admin page
checkAuthState(); 