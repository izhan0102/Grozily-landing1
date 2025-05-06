// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Admin credentials (in a real app, this would be authenticated through Firebase Auth)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "grozily123";

document.addEventListener('DOMContentLoaded', function() {
    // Admin panel elements
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const vendorsList = document.getElementById('vendors-list');
    const noVendors = document.getElementById('no-vendors');
    const searchVendors = document.getElementById('search-vendors');
    const filterType = document.getElementById('filter-type');
    const vendorDetailsModal = document.getElementById('vendor-details-modal');
    
    // Handle admin login
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function() {
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                adminLogin.style.display = 'none';
                adminDashboard.style.display = 'block';
                
                // Load vendors data
                loadVendorsData();
            } else {
                alert('Invalid username or password');
            }
        });
    }
    
    // Handle vendor search and filtering
    if (searchVendors) {
        searchVendors.addEventListener('input', filterVendors);
    }
    
    if (filterType) {
        filterType.addEventListener('change', filterVendors);
    }
    
    // Close modal when clicking the X
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            vendorDetailsModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(event) {
        if (event.target === vendorDetailsModal) {
            vendorDetailsModal.style.display = 'none';
        }
    });
    
    // Function to load vendors data from Firebase
    function loadVendorsData() {
        const vendorsRef = ref(database, 'vendors');
        
        onValue(vendorsRef, (snapshot) => {
            // Clear existing list
            while (vendorsList.firstChild) {
                if (vendorsList.firstChild !== noVendors) {
                    vendorsList.removeChild(vendorsList.firstChild);
                }
            }
            
            if (snapshot.exists()) {
                noVendors.style.display = 'none';
                
                const vendors = snapshot.val();
                const vendorsArray = [];
                
                // Convert to array for easier handling
                for (const key in vendors) {
                    vendorsArray.push({
                        id: key,
                        ...vendors[key]
                    });
                }
                
                // Sort by registration date (newest first)
                vendorsArray.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
                
                // Create vendor cards
                vendorsArray.forEach(vendor => {
                    const vendorCard = createVendorCard(vendor);
                    vendorsList.appendChild(vendorCard);
                });
                
                // Add data attributes for filtering
                const allCards = document.querySelectorAll('.vendor-card');
                allCards.forEach(card => {
                    card.addEventListener('click', function() {
                        showVendorDetails(this.getAttribute('data-id'));
                    });
                });
            } else {
                noVendors.style.display = 'block';
            }
        });
    }
    
    // Function to create a vendor card
    function createVendorCard(vendor) {
        const vendorCard = document.createElement('div');
        vendorCard.className = 'vendor-card';
        vendorCard.setAttribute('data-id', vendor.id);
        vendorCard.setAttribute('data-business-type', vendor.businessType);
        vendorCard.setAttribute('data-business-name', vendor.businessName);
        vendorCard.setAttribute('data-email', vendor.email);
        vendorCard.setAttribute('data-phone', vendor.phone);
        
        const businessTypeCapitalized = vendor.businessType.charAt(0).toUpperCase() + vendor.businessType.slice(1);
        
        vendorCard.innerHTML = `
            <h3>${vendor.businessName}</h3>
            <span class="business-type">${businessTypeCapitalized}</span>
            <div class="vendor-info">
                <p><strong>Owner:</strong> ${vendor.ownerName}</p>
                <p><strong>Email:</strong> ${vendor.email}</p>
                <p><strong>Phone:</strong> ${vendor.phone}</p>
                <p><strong>Registered:</strong> ${new Date(vendor.registrationDate).toLocaleDateString()}</p>
            </div>
        `;
        
        return vendorCard;
    }
    
    // Function to show vendor details in modal
    function showVendorDetails(vendorId) {
        const vendorRef = ref(database, `vendors/${vendorId}`);
        
        onValue(vendorRef, (snapshot) => {
            if (snapshot.exists()) {
                const vendor = snapshot.val();
                const vendorDetailsContent = document.getElementById('vendor-details-content');
                
                // Format registration date
                const registrationDate = new Date(vendor.registrationDate).toLocaleString();
                
                vendorDetailsContent.innerHTML = `
                    <div class="details-grid">
                        <div class="vendor-details">
                            <h3>Business Information</h3>
                            <p><strong>Business Name:</strong> ${vendor.businessName}</p>
                            <p><strong>Business Type:</strong> ${vendor.businessType.charAt(0).toUpperCase() + vendor.businessType.slice(1)}</p>
                            <p><strong>Owner's Name:</strong> ${vendor.ownerName}</p>
                            <p><strong>Email:</strong> ${vendor.email}</p>
                            <p><strong>Phone:</strong> ${vendor.phone}</p>
                            <p><strong>Address:</strong> ${vendor.address}</p>
                            <p><strong>Registration Date:</strong> ${registrationDate}</p>
                            <p><strong>Payment Amount:</strong> ₹${vendor.paymentAmount}</p>
                            
                            <h3>Credentials (Unencrypted)</h3>
                            <p><strong>Email:</strong> ${vendor.email}</p>
                            <p><strong>Password:</strong> ${vendor.password}</p>
                        </div>
                        <div class="payment-proof">
                            <h3>Payment Proof</h3>
                            <img src="${vendor.paymentScreenshotURL}" alt="Payment Screenshot">
                        </div>
                    </div>
                `;
                
                vendorDetailsModal.style.display = 'block';
            }
        });
    }
    
    // Function to filter vendors based on search and filter type
    function filterVendors() {
        const searchTerm = searchVendors.value.toLowerCase();
        const filterValue = filterType.value;
        
        const vendorCards = document.querySelectorAll('.vendor-card');
        
        vendorCards.forEach(card => {
            const businessType = card.getAttribute('data-business-type');
            const businessName = card.getAttribute('data-business-name').toLowerCase();
            const email = card.getAttribute('data-email').toLowerCase();
            const phone = card.getAttribute('data-phone').toLowerCase();
            
            const matchesFilter = filterValue === 'all' || businessType === filterValue;
            const matchesSearch = businessName.includes(searchTerm) || 
                                email.includes(searchTerm) || 
                                phone.includes(searchTerm);
            
            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Check if any cards are visible
        const visibleCards = document.querySelectorAll('.vendor-card[style="display: block"]');
        if (visibleCards.length === 0) {
            noVendors.style.display = 'block';
            noVendors.textContent = 'No vendors match your search criteria.';
        } else {
            noVendors.style.display = 'none';
        }
    }
}); 