// Hall Pass Generator Application
let passLog = [];
let selectedLocation = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeLocationButtons();
    setupEventListeners();
    loadPassLog();
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
        timestamp: new Date().toISOString()
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
        const response = await fetch('/api/log-pass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pass)
        });
        
        if (!response.ok) {
            console.error('Failed to save pass to backend');
        }
    } catch (error) {
        console.error('Error saving pass:', error);
        // Continue anyway - the pass is saved locally
    }
}

// Load pass log from backend
async function loadPassLog() {
    try {
        const response = await fetch('/api/get-logs');
        if (response.ok) {
            const data = await response.json();
            passLog = data.logs || [];
            updatePassLog();
        }
    } catch (error) {
        console.error('Error loading pass log:', error);
        // Use local storage as fallback
        const stored = localStorage.getItem('passLog');
        if (stored) {
            passLog = JSON.parse(stored);
            updatePassLog();
        }
    }
}

// Update pass log display
function updatePassLog() {
    const logContainer = document.getElementById('pass-log');
    
    // Save to local storage as backup
    localStorage.setItem('passLog', JSON.stringify(passLog));
    
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
        return `
            <div class="log-entry">
                <div class="log-entry-name">${escapeHtml(entry.name)}</div>
                <div class="log-entry-location">to ${escapeHtml(entry.location)}</div>
                <div class="log-entry-time">${formatTime(date)}</div>
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
            <div class="pass-footer-item">
                <strong>TIME IN</strong>
                <span class="time-blank">&nbsp;</span>
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