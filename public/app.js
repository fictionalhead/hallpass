// Hall Pass Generator Application
let passLog = [];
let selectedLocation = '';
let teacherEmail = '';
let isAdmin = false;
let currentPass = null; // Store the current pass being created/viewed
let isNewPass = false; // Track if this is a new pass or viewing an existing one

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
    const closeXBtn = document.getElementById('modal-close-x');
    const printPassBtn = document.getElementById('print-pass');
    
    form.addEventListener('submit', handleFormSubmit);
    nameInput.addEventListener('input', validateForm);
    otherLocationInput.addEventListener('input', validateForm);
    closeModalBtn.addEventListener('click', closeModal);
    closeXBtn.addEventListener('click', closeModal);
    printPassBtn.addEventListener('click', printPass);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Print events
    window.addEventListener('beforeprint', () => {
        // Hide all other content during print
        document.querySelector('.container').style.display = 'none';
    });

    window.addEventListener('afterprint', () => {
        // Restore content after print
        document.querySelector('.container').style.display = '';
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
    
    // Store the pass temporarily and mark as new
    currentPass = pass;
    isNewPass = true;
    
    // Show the pass modal (but don't save to DB yet)
    showPassModal(pass, true);
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
    
    // Count passes per student for abuse detection (admin only)
    const studentPassCounts = {};
    if (isAdmin) {
        passLog.forEach(entry => {
            studentPassCounts[entry.name] = (studentPassCounts[entry.name] || 0) + 1;
        });
    }

    const logHTML = passLog.map((entry, index) => {
        const date = new Date(entry.timestamp);
        const teacherInfo = isAdmin && entry.teacherEmail ?
            `<div class="log-entry-teacher" style="color: #666; font-size: 0.85rem; font-style: italic;">Teacher: ${escapeHtml(entry.teacherEmail)}</div>` : '';
        const deleteBtn = isAdmin ?
            `<button class="delete-pass-btn" onclick="event.stopPropagation(); deletePass('${entry.id}')" title="Delete this pass">×</button>` : '';

        // Add warning badge for students with multiple passes
        const passCount = studentPassCounts[entry.name] || 0;
        let warningBadge = '';
        if (isAdmin && passCount >= 5) {
            warningBadge = `<span style="background: #dc3545; color: white; padding: 0.15rem 0.4rem; border-radius: 12px; font-size: 0.7rem; font-weight: bold; margin-left: 0.5rem;">🚨 ${passCount}x</span>`;
        } else if (isAdmin && passCount >= 3) {
            warningBadge = `<span style="background: #ffc107; color: #333; padding: 0.15rem 0.4rem; border-radius: 12px; font-size: 0.7rem; font-weight: bold; margin-left: 0.5rem;">⚠️ ${passCount}x</span>`;
        }

        return `
            <div class="log-entry" data-pass-index="${index}" onclick="viewPassByIndex(${index})">
                ${deleteBtn}
                <div class="log-entry-content">
                    <div class="log-entry-name">${escapeHtml(entry.name)}${warningBadge}</div>
                    <div class="log-entry-location">to ${escapeHtml(entry.location)}</div>
                    <div class="log-entry-time">${formatTime(date)}</div>
                    ${teacherInfo}
                </div>
            </div>
        `;
    }).join('');
    
    logContainer.innerHTML = logHTML;
}

// View an existing pass from the log by index
function viewPassByIndex(index) {
    if (passLog[index]) {
        currentPass = passLog[index];
        isNewPass = false;
        showPassModal(passLog[index], false);
    }
}

// Show pass modal
function showPassModal(pass, isNew = false) {
    const modal = document.getElementById('pass-modal');
    const container = document.getElementById('printable-pass-container');
    
    const date = new Date(pass.timestamp);
    
    // Clear the entire container and recreate the pass element to ensure clean slate
    container.innerHTML = '';
    const printablePass = document.createElement('div');
    printablePass.id = 'printable-pass';
    printablePass.className = 'printable-pass';
    container.appendChild(printablePass);
    
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
                <strong>DATE:</strong>
                <span>${formatDate(date)}</span>
            </div>
            <div class="pass-footer-item">
                <strong>TIME OUT:</strong>
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
    
    // Update modal message
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = isNew ? 'Your pass is ready to print.' : 'Viewing pass.'
    
    modal.classList.remove('hidden');
}

// Print pass
async function printPass() {
    // If this is a new pass, save it to the database first
    if (isNewPass && currentPass) {
        // Add to local log
        passLog.unshift(currentPass);
        updatePassLog();

        // Save to backend
        await savePassToBackend(currentPass);

        // Mark as no longer new
        isNewPass = false;
    }

    // Simply trigger the browser's print dialog
    window.print();
}

// Close modal
function closeModal() {
    const modal = document.getElementById('pass-modal');
    modal.classList.add('hidden');
    
    // Clear the entire container to prevent stacking
    const container = document.getElementById('printable-pass-container');
    container.innerHTML = '';
    
    // Reset current pass tracking
    currentPass = null;
    isNewPass = false;
    
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
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <label style="margin-right: 1rem; font-weight: 500;">Filter by Teacher:</label>
                    <select id="teacher-filter" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="all">All Teachers</option>
                    </select>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button id="delete-teacher-passes" class="admin-action-btn" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 500;
                        display: none;
                    " onclick="deleteTeacherPasses()">
                        Delete Teacher's Passes
                    </button>
                    <button id="delete-all-passes" class="admin-action-btn" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 500;
                    " onclick="deleteAllPasses()">
                        Delete All Passes
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; border-top: 1px solid #ddd; padding-top: 1rem;">
                <div>
                    <label style="display: block; font-weight: 500; margin-bottom: 0.25rem; font-size: 0.9rem;">Student Name:</label>
                    <input type="text" id="student-name-filter" placeholder="Search by name..." style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                </div>
                <div>
                    <label style="display: block; font-weight: 500; margin-bottom: 0.25rem; font-size: 0.9rem;">Location:</label>
                    <select id="location-filter" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="all">All Locations</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-weight: 500; margin-bottom: 0.25rem; font-size: 0.9rem;">Date From:</label>
                    <input type="date" id="date-from-filter" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                </div>
                <div>
                    <label style="display: block; font-weight: 500; margin-bottom: 0.25rem; font-size: 0.9rem;">Date To:</label>
                    <input type="date" id="date-to-filter" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                </div>
            </div>

            <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <button id="clear-filters-btn" style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #644186; background: white; color: #644186; cursor: pointer; font-weight: 500;" onclick="clearAllFilters()">
                    Clear Filters
                </button>
                <div id="filter-stats" style="font-size: 0.9rem; color: #666; font-weight: 500;"></div>
            </div>
        </div>
    `;
    logSection.insertBefore(filterDiv, document.getElementById('pass-log'));
}

// Store all logs globally for filtering
let allTeacherLogs = [];
let currentFilters = {
    teacher: 'all',
    studentName: '',
    location: 'all',
    dateFrom: '',
    dateTo: ''
};

// Load all teachers' logs (admin only)
async function loadAllTeachersLogs() {
    try {
        console.log('Loading all teachers logs from database for admin:', teacherEmail);
        const response = await fetch(`/api/get-all-logs?adminEmail=${encodeURIComponent(teacherEmail)}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Admin loaded data from database:', data);
            passLog = data.logs || [];
            allTeacherLogs = data.logs || []; // Store for filtering
            
            // Clear and repopulate teacher filter
            if (data.teachers && data.teachers.length > 0) {
                const filterSelect = document.getElementById('teacher-filter');

                // Clear existing options except "All Teachers"
                while (filterSelect.options.length > 1) {
                    filterSelect.remove(1);
                }

                // Add teacher options
                data.teachers.forEach(teacher => {
                    const option = document.createElement('option');
                    option.value = teacher;
                    option.textContent = teacher;
                    filterSelect.appendChild(option);
                });

                // Remove old event listeners by cloning and replacing
                const newFilterSelect = filterSelect.cloneNode(true);
                filterSelect.parentNode.replaceChild(newFilterSelect, filterSelect);

                // Add fresh filter event listener
                newFilterSelect.addEventListener('change', (e) => {
                    currentFilters.teacher = e.target.value;
                    applyAllFilters();
                    // Show/hide delete teacher passes button
                    const deleteTeacherBtn = document.getElementById('delete-teacher-passes');
                    if (e.target.value !== 'all') {
                        deleteTeacherBtn.style.display = 'block';
                    } else {
                        deleteTeacherBtn.style.display = 'none';
                    }
                });
            }

            // Populate location filter with unique locations
            const locationFilter = document.getElementById('location-filter');
            const uniqueLocations = [...new Set(allTeacherLogs.map(log => log.location))].sort();
            uniqueLocations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationFilter.appendChild(option);
            });

            // Setup filter event listeners
            setupAdminFilterListeners();

            updatePassLog();
        } else {
            const errorText = await response.text();
            console.error('Failed to load all logs from database:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error loading all logs from database:', error);
    }
}

// Setup admin filter event listeners
function setupAdminFilterListeners() {
    const studentNameFilter = document.getElementById('student-name-filter');
    const locationFilter = document.getElementById('location-filter');
    const dateFromFilter = document.getElementById('date-from-filter');
    const dateToFilter = document.getElementById('date-to-filter');

    studentNameFilter.addEventListener('input', (e) => {
        currentFilters.studentName = e.target.value.toLowerCase();
        applyAllFilters();
    });

    locationFilter.addEventListener('change', (e) => {
        currentFilters.location = e.target.value;
        applyAllFilters();
    });

    dateFromFilter.addEventListener('change', (e) => {
        currentFilters.dateFrom = e.target.value;
        applyAllFilters();
    });

    dateToFilter.addEventListener('change', (e) => {
        currentFilters.dateTo = e.target.value;
        applyAllFilters();
    });
}

// Apply all filters
function applyAllFilters() {
    let filtered = [...allTeacherLogs];

    // Filter by teacher
    if (currentFilters.teacher !== 'all') {
        filtered = filtered.filter(log => log.teacherEmail === currentFilters.teacher);
    }

    // Filter by student name
    if (currentFilters.studentName) {
        filtered = filtered.filter(log =>
            log.name.toLowerCase().includes(currentFilters.studentName)
        );
    }

    // Filter by location
    if (currentFilters.location !== 'all') {
        filtered = filtered.filter(log => log.location === currentFilters.location);
    }

    // Filter by date range
    if (currentFilters.dateFrom) {
        const fromDate = new Date(currentFilters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(log => {
            const logDate = new Date(log.timestamp);
            logDate.setHours(0, 0, 0, 0);
            return logDate >= fromDate;
        });
    }

    if (currentFilters.dateTo) {
        const toDate = new Date(currentFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate <= toDate;
        });
    }

    passLog = filtered;
    updateFilterStats(filtered);
    updatePassLog();
}

// Update filter statistics
function updateFilterStats(filtered) {
    const statsDiv = document.getElementById('filter-stats');
    if (!statsDiv) return;

    // Count passes per student
    const studentCounts = {};
    filtered.forEach(log => {
        studentCounts[log.name] = (studentCounts[log.name] || 0) + 1;
    });

    const totalPasses = filtered.length;
    const uniqueStudents = Object.keys(studentCounts).length;
    const repeatOffenders = Object.entries(studentCounts)
        .filter(([name, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1]);

    let statsText = `Showing ${totalPasses} pass${totalPasses !== 1 ? 'es' : ''} from ${uniqueStudents} student${uniqueStudents !== 1 ? 's' : ''}`;

    if (repeatOffenders.length > 0) {
        statsText += ` | ⚠️ ${repeatOffenders.length} student${repeatOffenders.length !== 1 ? 's' : ''} with 3+ passes`;
    }

    statsDiv.innerHTML = statsText;
}

// Clear all filters
function clearAllFilters() {
    currentFilters = {
        teacher: 'all',
        studentName: '',
        location: 'all',
        dateFrom: '',
        dateTo: ''
    };

    document.getElementById('teacher-filter').value = 'all';
    document.getElementById('student-name-filter').value = '';
    document.getElementById('location-filter').value = 'all';
    document.getElementById('date-from-filter').value = '';
    document.getElementById('date-to-filter').value = '';

    // Hide delete teacher button
    const deleteTeacherBtn = document.getElementById('delete-teacher-passes');
    if (deleteTeacherBtn) {
        deleteTeacherBtn.style.display = 'none';
    }

    applyAllFilters();
}

// Delete single pass
async function deletePass(passId) {
    if (!confirm('Are you sure you want to delete this pass?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/delete-pass?id=${passId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminEmail: teacherEmail, passId: passId })
        });
        
        if (response.ok) {
            // Remove from local array
            passLog = passLog.filter(p => p.id !== passId);
            updatePassLog();
            console.log('Pass deleted successfully');
        } else {
            console.error('Failed to delete pass');
            alert('Failed to delete pass. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting pass:', error);
        alert('Error deleting pass. Please try again.');
    }
}

// Delete all passes for a specific teacher
async function deleteTeacherPasses() {
    const filterSelect = document.getElementById('teacher-filter');
    const selectedTeacher = filterSelect.value;
    
    if (selectedTeacher === 'all') {
        alert('Please select a specific teacher first.');
        return;
    }
    
    const passCount = passLog.filter(p => p.teacherEmail === selectedTeacher).length;
    
    if (!confirm(`Are you sure you want to delete ALL ${passCount} passes for ${selectedTeacher}?\n\nThis action cannot be undone!`)) {
        return;
    }
    
    // Second confirmation for safety
    if (!confirm(`FINAL CONFIRMATION: Delete all passes for ${selectedTeacher}?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/delete-teacher-passes', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                adminEmail: teacherEmail,
                targetTeacher: selectedTeacher 
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Delete result:', result);
            
            // Reset filter to "All Teachers" before reloading
            const filterSelect = document.getElementById('teacher-filter');
            filterSelect.value = 'all';
            
            // Hide the delete teacher button
            const deleteTeacherBtn = document.getElementById('delete-teacher-passes');
            deleteTeacherBtn.style.display = 'none';
            
            // Reload all logs
            await loadAllTeachersLogs();
            
            alert(`All passes for ${selectedTeacher} have been deleted.`);
        } else {
            const errorText = await response.text();
            console.error('Failed to delete teacher passes:', errorText);
            alert('Failed to delete passes. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting teacher passes:', error);
        alert('Error deleting passes. Please try again.');
    }
}

// Delete all passes (admin only)
async function deleteAllPasses() {
    const totalCount = passLog.length;
    
    if (!confirm(`Are you sure you want to delete ALL ${totalCount} passes in the system?\n\nThis will remove all passes for all teachers!`)) {
        return;
    }
    
    // Second confirmation
    if (!confirm(`FINAL CONFIRMATION: This will permanently delete ALL passes.\n\nType "DELETE ALL" to confirm.`)) {
        return;
    }
    
    const userInput = prompt('Type "DELETE ALL" to confirm deletion of all passes:');
    
    if (userInput !== 'DELETE ALL') {
        alert('Deletion cancelled.');
        return;
    }
    
    try {
        const response = await fetch('/api/delete-all-passes', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminEmail: teacherEmail })
        });
        
        if (response.ok) {
            passLog = [];
            updatePassLog();
            alert('All passes have been deleted.');
        } else {
            console.error('Failed to delete all passes');
            alert('Failed to delete passes. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting all passes:', error);
        alert('Error deleting passes. Please try again.');
    }
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