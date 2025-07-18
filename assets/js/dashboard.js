let recipients = [];
let profiles = JSON.parse(localStorage.getItem('smsProfiles')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '',
    company: ''
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    loadProfiles();
    loadUserProfile();
});

function initializeApp() {
    // Character counter
    document.getElementById('messageText').addEventListener('input', function () {
        const charCount = this.value.length;
        document.getElementById('charCounter').textContent = charCount + '/160';
    });

    // Form submission
    document.getElementById('smsForm').addEventListener('submit', handleFormSubmission);

    // Allow Enter key to add recipient
    document.getElementById('recipientInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addRecipient();
        }
    });
}

// User Profile Management
function loadUserProfile() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;

    // Update avatar with initials
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
}

function openProfileModal() {
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editEmail').value = currentUser.email;
    document.getElementById('editPhone').value = currentUser.phone;
    document.getElementById('editCompany').value = currentUser.company;
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function saveUserProfile() {
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const company = document.getElementById('editCompany').value.trim();

    if (!name || !email) {
        alert('Please fill in all required fields');
        return;
    }

    currentUser = { name, email, phone, company };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadUserProfile();
    closeProfileModal();
    alert('Profile updated successfully!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user session (in real app, this would be server-side)
        localStorage.removeItem('currentUser');

        // Redirect to login page (you would create this)
        alert('Logged out successfully! Redirecting to login page...');
        // window.location.href = 'login.html';
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('profileModal');
    if (event.target === modal) {
        closeProfileModal();
    }
}

// Profile Management Functions
function saveProfile() {
    const profileName = document.getElementById('profileName').value.trim();
    const message = document.getElementById('messageText').value.trim();

    if (!profileName) {
        alert('Please enter a profile name');
        return;
    }

    if (!message && recipients.length === 0) {
        alert('Please add a message or recipients to save');
        return;
    }

    const profile = {
        id: Date.now(),
        name: profileName,
        message: message,
        recipients: [...recipients],
        createdAt: new Date().toISOString()
    };

    // Check if profile name already exists
    const existingIndex = profiles.findIndex(p => p.name === profileName);
    if (existingIndex !== -1) {
        if (confirm('Profile with this name already exists. Do you want to overwrite it?')) {
            profiles[existingIndex] = profile;
        } else {
            return;
        }
    } else {
        profiles.push(profile);
    }

    localStorage.setItem('smsProfiles', JSON.stringify(profiles));
    loadProfiles();
    document.getElementById('profileName').value = '';
    alert('Profile saved successfully!');
}

function loadProfile(profileId) {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
        document.getElementById('messageText').value = profile.message;
        document.getElementById('charCounter').textContent = profile.message.length + '/160';
        recipients = [...profile.recipients];
        updateRecipientsList();
        alert(`Profile "${profile.name}" loaded successfully!`);
    }
}

function deleteProfile(profileId) {
    if (confirm('Are you sure you want to delete this profile?')) {
        profiles = profiles.filter(p => p.id !== profileId);
        localStorage.setItem('smsProfiles', JSON.stringify(profiles));
        loadProfiles();
        alert('Profile deleted successfully!');
    }
}

function loadProfiles() {
    const profilesList = document.getElementById('profilesList');
    if (profiles.length === 0) {
        profilesList.innerHTML = '<p class="no-profiles">No saved profiles</p>';
        return;
    }

    profilesList.innerHTML = profiles.map(profile => `
        <div class="profile-item">
            <div class="profile-info">
                <h4>${profile.name}</h4>
                <p>${profile.recipients.length} recipients • ${profile.message.length} chars</p>
                <small>Created: ${new Date(profile.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="profile-actions">
                <button class="btn btn-sm btn-primary" onclick="loadProfile(${profile.id})">
                    <i class="fas fa-download"></i> Load
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProfile(${profile.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Switch between tabs
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Add recipient
function addRecipient() {
    const input = document.getElementById('recipientInput');
    const phone = input.value.trim();

    if (phone && !recipients.includes(phone)) {
        recipients.push(phone);
        updateRecipientsList();
        input.value = '';
    }
}

// Remove recipient
function removeRecipient(phone) {
    recipients = recipients.filter(r => r !== phone);
    updateRecipientsList();
}

// Update recipients list display
function updateRecipientsList() {
    const listElement = document.getElementById('recipientsList');

    if (recipients.length === 0) {
        listElement.style.display = 'none';
        return;
    }

    listElement.style.display = 'block';
    listElement.innerHTML = recipients.map(phone => `
        <div class="recipient-item">
            <span>${phone}</span>
            <button class="remove-btn" onclick="removeRecipient('${phone}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Handle CSV file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const csv = e.target.result;
            const lines = csv.split('\n');
            lines.forEach(line => {
                const phone = line.trim();
                if (phone && !recipients.includes(phone)) {
                    recipients.push(phone);
                }
            });
            updateRecipientsList();
        };
        reader.readAsText(file);
    }
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();

    const message = document.getElementById('messageText').value;

    if (!message.trim()) {
        alert('Please enter a message');
        return;
    }

    if (recipients.length === 0) {
        alert('Please add at least one recipient');
        return;
    }

    // Here you would typically send the data to your PHP backend
    console.log('Sending message:', message, 'to recipients:', recipients);

    // Simulate sending
    alert(`Message sent to ${recipients.length} recipients!`);

    // Reset form
    resetForm();
}

// Reset form after submission
function resetForm() {
    document.getElementById('messageText').value = '';
    document.getElementById('charCounter').textContent = '0/160';
    recipients = [];
    updateRecipientsList();
}
