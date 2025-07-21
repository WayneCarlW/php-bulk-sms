let recipients = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Character counter
    document.getElementById('messageText').addEventListener('input', function () {
        const charCount = this.value.length;
        document.getElementById('charCounter').textContent = charCount + '/160';
        
        // Change color based on character count
        const counter = document.getElementById('charCounter');
        if (charCount > 140) {
            counter.style.color = '#dc2626';
        } else if (charCount > 120) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#6b7280';
        }
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

    // Report filter functionality
    document.getElementById('reportFilter').addEventListener('change', function() {
        filterReports(this.value);
    });

    // 🔽 Add this at the very end:
    loadReportsFromServer();
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

    // Basic phone number validation
    if (!phone) {
        showMessage('Please enter a phone number', 'error');
        return;
    }

    // Check if phone number is valid format (starts with + and contains only digits)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
        showMessage('Please enter a valid phone number in international format (e.g., +254712345678)', 'error');
        return;
    }

    // Check if phone number already exists
    if (recipients.includes(phone)) {
        showMessage('This phone number has already been added', 'error');
        return;
    }

    recipients.push(phone);
    updateRecipientsList();
    updateRecipientsInput();
    input.value = '';
    
    // Clear any previous error messages
    document.getElementById('messageDiv').innerHTML = '';
}

// Remove recipient
function removeRecipient(phone) {
    recipients = recipients.filter(r => r !== phone);
    updateRecipientsList();
    updateRecipientsInput();
}

// Update recipients list display
function updateRecipientsList() {
    const listElement = document.getElementById('recipientsList');

    if (recipients.length === 0) {
        listElement.style.display = 'none';
        return;
    }

    listElement.style.display = 'block';
    listElement.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: 600; color: #374151;">
            Recipients (${recipients.length})
        </div>
        ${recipients.map(phone => `
            <div class="recipient-item">
                <span>${phone}</span>
                <button type="button" class="remove-btn" onclick="removeRecipient('${phone}')" title="Remove recipient">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('')}
    `;
}

// Update hidden input with recipients
function updateRecipientsInput() {
    document.getElementById('recipientsInput').value = recipients.join(',');
}

// Handle CSV file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showMessage('Please upload a CSV file', 'error');
        return;
    }

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
        showMessage('File is too large. Please upload a file smaller than 1MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            let addedCount = 0;
            let skippedCount = 0;

            lines.forEach(line => {
                const phone = line.trim();
                // Skip empty lines and headers
                if (!phone || phone.toLowerCase().includes('phone') || phone.toLowerCase().includes('number')) {
                    return;
                }

                // Basic validation
                const phoneRegex = /^\+[1-9]\d{1,14}$/;
                if (phoneRegex.test(phone) && !recipients.includes(phone)) {
                    recipients.push(phone);
                    addedCount++;
                } else {
                    skippedCount++;
                }
            });

            updateRecipientsList();
            updateRecipientsInput();

            if (addedCount > 0) {
                showMessage(`Added ${addedCount} phone numbers from CSV file${skippedCount > 0 ? ` (${skippedCount} skipped due to invalid format or duplicates)` : ''}`, 'success');
            } else {
                showMessage('No valid phone numbers found in the CSV file', 'error');
            }
        } catch (error) {
            showMessage('Error reading CSV file. Please check the file format', 'error');
        }
    };

    reader.onerror = function() {
        showMessage('Error reading file', 'error');
    };

    reader.readAsText(file);
}

// Handle form submission
function handleFormSubmission(e) {
    const message = document.getElementById('messageText').value.trim();
    const messageDiv = document.getElementById('messageDiv');
    const loadingDiv = document.getElementById('loadingDiv');
    const sendBtn = document.getElementById('sendBtn');

    // Clear previous messages
    messageDiv.innerHTML = '';

    // Validate form
    if (!message) {
        showMessage('Please enter a message', 'error');
        e.preventDefault();
        return;
    }

    if (message.length > 160) {
        showMessage('Message is too long. Maximum 160 characters allowed', 'error');
        e.preventDefault();
        return;
    }

    if (recipients.length === 0) {
        showMessage('Please add at least one recipient', 'error');
        e.preventDefault();
        return;
    }

    // Update hidden input with current recipients
    updateRecipientsInput();

    // Show loading state
    loadingDiv.classList.add('show');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // Show confirmation message
    showMessage(`Sending message to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}...`, 'success');

    // Allow form to submit naturally to send_sms.php
    // Don't prevent default - let the form submit
}

// Show message helper
function showMessage(message, type) {
    const messageDiv = document.getElementById('messageDiv');
    const className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.innerHTML = `<div class="${className}"><i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}</div>`;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }
}

// Reset form after submission (if needed)
function resetForm() {
    document.getElementById('messageText').value = '';
    document.getElementById('charCounter').textContent = '0/160';
    document.getElementById('charCounter').style.color = '#6b7280';
    recipients = [];
    updateRecipientsList();
    updateRecipientsInput();
    
    // Reset loading state
    const loadingDiv = document.getElementById('loadingDiv');
    const sendBtn = document.getElementById('sendBtn');
    loadingDiv.classList.remove('show');
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Messages';

    // Clear messages
    document.getElementById('messageDiv').innerHTML = '';
}

// Clear all recipients
function clearAllRecipients() {
    if (recipients.length === 0) {
        showMessage('No recipients to clear', 'error');
        return;
    }

    if (confirm(`Are you sure you want to remove all ${recipients.length} recipients?`)) {
        recipients = [];
        updateRecipientsList();
        updateRecipientsInput();
        showMessage('All recipients cleared', 'success');
    }
}

// Filter reports (placeholder functionality)
function filterReports(filterValue) {
    const tbody = document.getElementById('reportsTableBody');
    const rows = tbody.getElementsByTagName('tr');

    for (let row of rows) {
        const statusCell = row.querySelector('.status-badge');
        if (!statusCell) continue;

        const status = statusCell.textContent.toLowerCase();
        
        if (filterValue === 'all') {
            row.style.display = '';
        } else if (filterValue === 'sent' && status.includes('sent')) {
            row.style.display = '';
        } else if (filterValue === 'failed' && status.includes('failed')) {
            row.style.display = '';
        } else if (filterValue === 'pending' && status.includes('pending')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// Utility functions
function formatPhoneNumber(phone) {
    // Remove any non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
}

function validatePhoneNumber(phone) {
    // Basic international phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

function loadReportsFromServer() {
    fetch('fetch_reports.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                console.error("Failed to fetch reports:", data.error);
                return;
            }

            const tbody = document.getElementById('reportsTableBody');
            tbody.innerHTML = ''; // Clear existing rows

            data.data.forEach(row => {
                const statusClass = {
                    sent: 'status-sent',
                    failed: 'status-failed',
                    pending: 'status-pending'
                }[row.status.toLowerCase()] || '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.created_at}</td>
                    <td>${row.recipients}</td>
                    <td><span class="status-badge ${statusClass}">${row.status}</span></td>
                    <td>${row.message}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Error fetching report data:', err));
}


// Export functions for testing or external use
window.BulkSMS = {
    addRecipient,
    removeRecipient,
    clearAllRecipients,
    resetForm,
    validatePhoneNumber,
    formatPhoneNumber
};
