// Hall Pass Generator Application
let passLog = [];
let selectedLocation = '';
let teacherEmail = '';
let isAdmin = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    teacherEmail = localStorage.getItem('teacherEmail');
    
    if (!isLoggedIn || !teacherEmail) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    // Check if admin
    isAdmin = teacherEmail === 'meyere@wyomingps.org';
    
    initializeLocationButtons();
    setupEventListeners();
    
    if (isAdmin) {
        setupAdminView();
        loadAllTeachersLogs();
    } else {
        loadPassLog();
    }
    
    addLogoutButton();
});

// Initialize location buttons from config
function initializeLocationButtons() {
    const container = document.getElementById('location-buttons');
    
    HALLPASS_CONFIG.locations.forEach(location => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'location-btn';
        button.textContent = location;
        button.onclick = () => selectLocation(location);
        
        // Add icon if available
        if (HALLPASS_CONFIG.locationIcons[location]) {
            const icon = createLocationIcon(location);
            button.insertBefore(icon, button.firstChild);
        }
        
        container.appendChild(button);
    });
}

// Create SVG icon for location
function createLocationIcon(location) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'currentColor');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', HALLPASS_CONFIG.locationIcons[location]);
    
    svg.appendChild(path);
    return svg;
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('hallpass-form');
    const nameInput = document.getElementById('name');
    const otherLocationInput = document.getElementById('other-location');
    const closeModalBtn = document.getElementById('close-modal');
    
    form.addEventListener('submit', handleFormSubmit);
    nameInput.addEventListener('input', validateForm);
    otherLocationInput.addEventListener('input', validateForm);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Handle location selection
function selectLocation(location) {
    selectedLocation = location;
    
    // Update button states
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent === location);
    });
    
    // Show/hide other location input
    const otherGroup = document.getElementById('other-location-group');
    if (location === 'Other') {
        otherGroup.classList.remove('hidden');
    } else {
        otherGroup.classList.add('hidden');
        document.getElementById('other-location').value = '';
    }
    
    validateForm();
}

// Validate form
function validateForm() {
    const nameInput = document.getElementById('name');
    const otherLocationInput = document.getElementById('other-location');
    const submitBtn = document.querySelector('.submit-btn');
    const errorMessage = document.getElementById('error-message');
    
    const name = nameInput.value.trim();
    const isOtherSelected = selectedLocation === 'Other';
    const otherLocation = otherLocationInput.value.trim();
    
    let isValid = false;
    let error = '';
    
    if (!name) {
        error = 'Please enter your name.';
    } else if (!selectedLocation) {
        error = 'Please select a location.';
    } else if (isOtherSelected && !otherLocation) {
        error = 'Please specify the location.';
    } else {
        isValid = true;
    }
    
    submitBtn.disabled = !isValid;
    
    if (error && (name || selectedLocation)) {
        errorMessage.textContent = error;
        errorMessage.classList.remove('hidden');
    } else {
        errorMessage.classList.add('hidden');
    }
    
    return isValid;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const name = document.getElementById('name').value.trim();
    const otherLocation = document.getElementById('other-location').value.trim();
    const finalLocation = selectedLocation === 'Other' ? otherLocation : selectedLocation;
    
    const pass = {
        id: Date.now().toString(),
        name: name,
        location: finalLocation,
        timestamp: new Date().toISOString(),
        teacherEmail: teacherEmail
    };
    
    // Add to local log
    passLog.unshift(pass);
    updatePassLog();
    
    // Save to backend
    await savePassToBackend(pass);
    
    // Show the pass modal
    showPassModal(pass);
    
    // Print automatically after a short delay
    setTimeout(() => {
        window.print();
    }, 100);
}

// Save pass to backend
async function savePassToBackend(pass) {
    try {
        console.log('Saving pass to database:', pass);
        const response = await fetch('/api/log-pass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pass)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to save pass to database:', response.status, errorText);
        } else {
            const result = await response.json();
            console.log('Pass saved successfully to database:', result);
        }
    } catch (error) {
        console.error('Error saving pass to database:', error);
    }
}

// Load pass log from backend
async function loadPassLog() {
    try {
        console.log('Loading logs from database for teacher:', teacherEmail);
        const response = await fetch(`/api/get-logs?teacherEmail=${encodeURIComponent(teacherEmail)}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Loaded pass data from database:', data);
            passLog = data.logs || [];
            updatePassLog();
        } else {
            const errorText = await response.text();
            console.error('Failed to load logs from database:', response.status, errorText);
            passLog = [];
            updatePassLog();
        }
    } catch (error) {
        console.error('Error loading pass log from database:', error);
        passLog = [];
        updatePassLog();
    }
}

// Update pass log display
function updatePassLog() {
    const logContainer = document.getElementById('pass-log');
    
    // Save to local storage as backup for this teacher (if not admin)
    if (!isAdmin) {
        localStorage.setItem(`passLog_${teacherEmail}`, JSON.stringify(passLog));
    }
    
    if (passLog.length === 0) {
        logContainer.innerHTML = `
            <div class="empty-log">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p>No passes generated yet.</p>
            </div>
        `;
        return;
    }
    
    const logHTML = passLog.map(entry => {
        const date = new Date(entry.timestamp);
        const teacherInfo = isAdmin && entry.teacherEmail ? 
            `<div class="log-entry-teacher" style="color: #666; font-size: 0.85rem; font-style: italic;">Teacher: ${escapeHtml(entry.teacherEmail)}</div>` : '';
        return `
            <div class="log-entry">
                <div class="log-entry-name">${escapeHtml(entry.name)}</div>
                <div class="log-entry-location">to ${escapeHtml(entry.location)}</div>
                <div class="log-entry-time">${formatTime(date)}</div>
                ${teacherInfo}
            </div>
        `;
    }).join('');
    
    logContainer.innerHTML = logHTML;
}

// Show pass modal
function showPassModal(pass) {
    const modal = document.getElementById('pass-modal');
    const printablePass = document.getElementById('printable-pass');
    
    const date = new Date(pass.timestamp);
    
    printablePass.innerHTML = `
        <div class="pass-header">
            <div class="pass-school-name">${escapeHtml(HALLPASS_CONFIG.school.name)}</div>
            <div class="pass-title">${escapeHtml(HALLPASS_CONFIG.school.passTitle)}</div>
        </div>
        <div class="pass-body">
            <div class="pass-field">
                <strong>NAME:</strong>
                <span>${escapeHtml(pass.name)}</span>
            </div>
            <div class="pass-field">
                <strong>LOCATION:</strong>
                <span>${escapeHtml(pass.location)}</span>
            </div>
        </div>
        <div class="pass-footer">
            <div class="pass-footer-item">
                <strong>DATE</strong>
                <span>${formatDate(date)}</span>
            </div>
            <div class="pass-footer-item">
                <strong>TIME OUT</strong>
                <span>${formatTime(date)}</span>
            </div>
        </div>
    `;
    
    // Apply custom styles from config
    printablePass.style.width = HALLPASS_CONFIG.passDimensions.width;
    printablePass.style.height = HALLPASS_CONFIG.passDimensions.height;
    printablePass.style.borderWidth = HALLPASS_CONFIG.passStyle.borderWidth;
    printablePass.style.borderColor = HALLPASS_CONFIG.passStyle.borderColor;
    printablePass.style.backgroundColor = HALLPASS_CONFIG.passStyle.backgroundColor;
    
    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('pass-modal');
    modal.classList.add('hidden');
    
    // Reset form
    document.getElementById('hallpass-form').reset();
    selectedLocation = '';
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('other-location-group').classList.add('hidden');
    document.querySelector('.submit-btn').disabled = true;
}

// Utility functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', HALLPASS_CONFIG.dateFormat);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', HALLPASS_CONFIG.timeFormat);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup admin view
function setupAdminView() {
    // Update header to show admin status
    const header = document.querySelector('header h1');
    header.innerHTML = 'Hall Pass Generator <span style="color: #644186; font-size: 0.7em;">(Admin View)</span>';
    
    // Hide the form for admin
    const formSection = document.querySelector('.form-section');
    formSection.style.display = 'none';
    
    // Update log section title
    const logTitle = document.querySelector('.log-section h2');
    logTitle.textContent = 'All Teachers Pass Log';
    
    // Add filter controls for admin
    const logSection = document.querySelector('.log-section');
    const filterDiv = document.createElement('div');
    filterDiv.style.cssText = 'margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;';
    filterDiv.innerHTML = `
        <label style="margin-right: 1rem; font-weight: 500;">Filter by Teacher:</label>
        <select id="teacher-filter" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
            <option value="all">All Teachers</option>
        </select>
    `;
    logSection.insertBefore(filterDiv, document.getElementById('pass-log'));
}

// Load all teachers' logs (admin only)
async function loadAllTeachersLogs() {
    try {
        console.log('Loading all teachers logs from database for admin:', teacherEmail);
        const response = await fetch(`/api/get-all-logs?adminEmail=${encodeURIComponent(teacherEmail)}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Admin loaded data from database:', data);
            passLog = data.logs || [];
            
            // Populate teacher filter
            if (data.teachers && data.teachers.length > 0) {
                const filterSelect = document.getElementById('teacher-filter');
                data.teachers.forEach(teacher => {
                    const option = document.createElement('option');
                    option.value = teacher;
                    option.textContent = teacher;
                    filterSelect.appendChild(option);
                });
                
                // Add filter event listener
                filterSelect.addEventListener('change', (e) => {
                    filterLogsByTeacher(e.target.value, data.logs);
                });
            }
            
            updatePassLog();
        } else {
            const errorText = await response.text();
            console.error('Failed to load all logs from database:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error loading all logs from database:', error);
    }
}

// Filter logs by teacher
function filterLogsByTeacher(teacherEmail, allLogs) {
    if (teacherEmail === 'all') {
        passLog = allLogs;
    } else {
        passLog = allLogs.filter(log => log.teacherEmail === teacherEmail);
    }
    updatePassLog();
}

// Add logout button to the page
function addLogoutButton() {
    const headerRight = document.querySelector('.header-right');
    const roleLabel = isAdmin ? ' (Admin)' : '';
    headerRight.innerHTML = `
        <span style="color: #6d6d6d; font-size: 0.9rem; font-weight: 500;">${escapeHtml(teacherEmail)}${roleLabel}</span>
        <button id="logout-btn" style="
            background: #644186;
            color: #ffffff;
            border: 2px solid #644186;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.3s;
        " onmouseover="this.style.background='#4f3366'; this.style.borderColor='#4f3366'" onmouseout="this.style.background='#644186'; this.style.borderColor='#644186'">
            Logout
        </button>
    `;
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Clear login data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('teacherEmail');
        // Redirect to login
        window.location.href = 'login.html';
    });
}