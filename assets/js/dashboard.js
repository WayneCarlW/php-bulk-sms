// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard
    initializeDashboard();

    // Tab management
    initializeTabs();

    // Message composer
    initializeComposer();

    // Logs functionality
    initializeLogs();

    // Notifications
    initializeNotifications();

    // User menu
    initializeUserMenu();

    // Mobile responsiveness
    initializeMobile();
});

// Dashboard initialization
function initializeDashboard() {
    // Animate dashboard elements on load
    const elements = document.querySelectorAll('.sidebar, .content-header, .tab-navigation');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Update stats periodically (simulation)
    updateStatsDisplay();
    setInterval(updateStatsDisplay, 30000); // Update every 30 seconds
}

// Tab management
function initializeTabs() {
    // Show initial tab
    showTab('compose');
}

window.showTab = function (tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Remove active class from sidebar menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activate corresponding tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Activate corresponding sidebar menu item
    const selectedMenuItem = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (selectedMenuItem) {
        selectedMenuItem.closest('.menu-item').classList.add('active');
    }

    // Trigger tab-specific initialization
    if (tabName === 'logs') {
        refreshLogs();
    }
};

// Message composer functionality
function initializeComposer() {
    // Character counter
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', updateCharacterCount);
    }

    // Recipient counter
    const phoneTextarea = document.getElementById('phone');
    if (phoneTextarea) {
        phoneTextarea.addEventListener('input', updateRecipientCount);
    }

    // Delivery type radio buttons
    const deliveryRadios = document.querySelectorAll('input[name="delivery_type"]');
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', toggleScheduleInputs);
    });

    // Form submission
    const composeForm = document.querySelector('.compose-form');
    if (composeForm) {
        composeForm.addEventListener('submit', handleMessageSubmission);
    }
}

window.updateCharacterCount = function () {
    const textarea = document.getElementById('message');
    const charCount = document.querySelector('.char-count');
    const smsPartsSpan = document.querySelector('.sms-parts');
    const estimatedCost = document.querySelector('.estimated-cost');

    if (!textarea || !charCount) return;

    const length = textarea.value.length;
    const maxLength = 160;
    const parts = Math.ceil(length / maxLength) || 1;
    const cost = parts * 0.05; // $0.05 per SMS

    charCount.textContent = `${length}/${maxLength} characters`;

    if (smsPartsSpan) {
        smsPartsSpan.textContent = `${parts} SMS`;
    }

    if (estimatedCost) {
        estimatedCost.textContent = `Est. cost: $${cost.toFixed(2)}`;
    }

    // Update color based on length
    if (length > maxLength * 0.9) {
        charCount.style.color = 'var(--warning-color)';
    } else if (length > maxLength) {
        charCount.style.color = 'var(--error-color)';
    } else {
        charCount.style.color = 'var(--gray-500)';
    }
};

window.updateRecipientCount = function () {
    const textarea = document.getElementById('phone');
    const countSpan = document.querySelector('.recipient-count');

    if (!textarea || !countSpan) return;

    const text = textarea.value.trim();
    if (!text) {
        countSpan.textContent = '0 recipients';
        return;
    }

    // Count valid phone numbers (basic validation)
    const numbers = text.split(/[\n,;]/).filter(num => {
        const cleaned = num.trim().replace(/\D/g, '');
        return cleaned.length >= 10;
    });

    countSpan.textContent = `${numbers.length} recipient${numbers.length !== 1 ? 's' : ''}`;

    // Update estimated cost
    const messageLength = document.getElementById('message').value.length || 1;
    const parts = Math.ceil(messageLength / 160) || 1;
    const totalCost = numbers.length * parts * 0.05;

    const estimatedCost = document.querySelector('.estimated-cost');
    if (estimatedCost) {
        estimatedCost.textContent = `Est. cost: $${totalCost.toFixed(2)}`;
    }
};

function toggleScheduleInputs() {
    const scheduleInputs = document.getElementById('scheduleInputs');
    const scheduledRadio = document.querySelector('input[value="scheduled"]');

    if (scheduledRadio && scheduledRadio.checked) {
        scheduleInputs.style.display = 'block';
        // Set minimum date to today
        const dateInput = document.getElementById('schedule_date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            if (!dateInput.value) {
                dateInput.value = today;
            }
        }

        // Set default time to current + 1 hour
        const timeInput = document.getElementById('schedule_time');
        if (timeInput && !timeInput.value) {
            const now = new Date();
            now.setHours(now.getHours() + 1);
            timeInput.value = now.toTimeString().slice(0, 5);
        }
    } else {
        scheduleInputs.style.display = 'none';
    }
}

function handleMessageSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;

    // Validate form
    if (!validateComposeForm(form)) {
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // Simulate API call
    setTimeout(() => {
        // Success simulation
        showNotification('Message sent successfully!', 'success');

        // Reset form
        form.reset();
        updateCharacterCount();
        updateRecipientCount();

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Add to logs (simulation)
        addToLogs({
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            recipient: form.phone.value.split(/[\n,;]/)[0].trim(),
            message: form.message.value,
            status: 'sent'
        });

    }, 2000);
}

function validateComposeForm(form) {
    let isValid = true;
    const errors = [];

    // Validate recipients
    const phoneValue = form.phone.value.trim();
    if (!phoneValue) {
        errors.push('Please enter at least one phone number');
        isValid = false;
    } else {
        const numbers = phoneValue.split(/[\n,;]/).filter(num => {
            const cleaned = num.trim().replace(/\D/g, '');
            return cleaned.length >= 10;
        });

        if (numbers.length === 0) {
            errors.push('Please enter valid phone numbers');
            isValid = false;
        }
    }

    // Validate message
    const messageValue = form.message.value.trim();
    if (!messageValue) {
        errors.push('Please enter a message');
        isValid = false;
    }

    // Validate schedule if selected
    const scheduledRadio = form.querySelector('input[value="scheduled"]');
    if (scheduledRadio && scheduledRadio.checked) {
        const dateValue = form.schedule_date.value;
        const timeValue = form.schedule_time.value;

        if (!dateValue || !timeValue) {
            errors.push('Please select date and time for scheduled delivery');
            isValid = false;
        } else {
            const scheduledDateTime = new Date(`${dateValue}T${timeValue}`);
            const now = new Date();

            if (scheduledDateTime <= now) {
                errors.push('Scheduled time must be in the future');
                isValid = false;
            }
        }
    }

    // Show errors
    if (!isValid) {
        showNotification(errors.join('<br>'), 'error');
    }

    return isValid;
}

// Template functions
window.useTemplate = function (templateText) {
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        messageTextarea.value = templateText;
        updateCharacterCount();
        messageTextarea.focus();
    }
};

window.showTemplateModal = function () {
    // Simulate template modal (would be actual modal in real implementation)
    showNotification('Template modal would open here', 'info');
};

window.showContactModal = function () {
    // Simulate contact modal
    showNotification('Contact selection modal would open here', 'info');
};

window.importNumbers = function () {
    // Simulate CSV import
    showNotification('CSV import dialog would open here', 'info');
};

window.addPersonalization = function () {
    // Simulate personalization options
    showNotification('Personalization options would appear here', 'info');
};

// Logs functionality
function initializeLogs() {
    // Initialize with sample data
    populateSampleLogs();

    // Set up filters
    setupLogFilters();

    // Set up search
    setupLogSearch();

    // Set up table interactions
    setupLogTable();
}

function populateSampleLogs() {
    // Sample logs are already in HTML, but this could fetch from API
    updateLogsSummary();
}

function updateLogsSummary() {
    // This would typically fetch real data from an API
    const summary = {
        delivered: 1156,
        sent: 91,
        failed: 23,
        pending: 12
    };

    Object.keys(summary).forEach(status => {
        const element = document.querySelector(`.summary-card.${status} .summary-number`);
        if (element) {
            animateNumber(element, summary[status]);
        }
    });
}

function animateNumber(element, targetNumber) {
    const startNumber = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress);
        element.textContent = currentNumber.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function setupLogFilters() {
    const statusFilter = document.getElementById('log-status');
    const dateFilter = document.getElementById('log-date');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterLogs);
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', filterLogs);
    }
}

window.filterLogs = function () {
    // Simulate filtering (would interact with API in real implementation)
    const statusFilter = document.getElementById('log-status').value;
    const dateFilter = document.getElementById('log-date').value;

    console.log('Filtering logs:', { status: statusFilter, date: dateFilter });
    showNotification('Logs filtered', 'info');
};

function setupLogSearch() {
    const searchInput = document.getElementById('log-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchLogs();
            }, 300);
        });
    }
}

window.searchLogs = function () {
    const searchTerm = document.getElementById('log-search').value;
    console.log('Searching logs for:', searchTerm);
    // Implement search logic here
};

function setupLogTable() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }

    // Individual row checkboxes
    const rowCheckboxes = document.querySelectorAll('.row-select');
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectAllState);
    });
}

window.toggleSelectAll = function () {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-select');

    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
};

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-select');
    const checkedBoxes = document.querySelectorAll('.row-select:checked');

    if (checkedBoxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedBoxes.length === rowCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

// Log action functions
window.retryMessage = function () {
    showNotification('Message retry initiated', 'info');
};

window.viewDetails = function () {
    showNotification('Message details would open here', 'info');
};

window.cancelMessage = function () {
    showNotification('Message cancelled', 'warning');
};

window.showFullMessage = function () {
    showNotification('Full message modal would open here', 'info');
};

window.exportLogs = function () {
    showNotification('Export started - CSV will download shortly', 'success');
};

window.clearFilters = function () {
    document.getElementById('log-status').value = '';
    document.getElementById('log-date').value = 'today';
    document.getElementById('log-search').value = '';
    filterLogs();
};

function addToLogs(logEntry) {
    // Add new entry to logs table (simulation)
    const tbody = document.getElementById('logs-tbody');
    if (tbody && tbody.children.length > 0) {
        const newRow = tbody.children[0].cloneNode(true);

        // Update the row with new data
        const timeCell = newRow.querySelector('.time-cell .time');
        const dateCell = newRow.querySelector('.time-cell .date');
        const recipientCell = newRow.querySelector('.recipient-cell');
        const messageCell = newRow.querySelector('.message-preview');
        const statusBadge = newRow.querySelector('.status-badge');

        if (timeCell) timeCell.textContent = logEntry.time;
        if (dateCell) dateCell.textContent = logEntry.date;
        if (recipientCell) {
            recipientCell.innerHTML = `<i class="fas fa-mobile-alt"></i> ${logEntry.recipient}`;
        }
        if (messageCell) {
            messageCell.textContent = logEntry.message.substring(0, 50) + '...';
        }
        if (statusBadge) {
            statusBadge.className = `status-badge ${logEntry.status}`;
            statusBadge.innerHTML = `<i class="fas fa-paper-plane"></i> ${logEntry.status}`;
        }

        // Insert at top
        tbody.insertBefore(newRow, tbody.firstChild);

        // Highlight new row
        newRow.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        setTimeout(() => {
            newRow.style.backgroundColor = '';
        }, 3000);
    }
}

// Notification system
function initializeNotifications() {
    // Auto-hide notifications after 5 seconds
    setTimeout(() => {
        const notifications = document.querySelectorAll('.notification-item.unread');
        notifications.forEach(notification => {
            notification.classList.remove('unread');
        });

        updateNotificationBadge();
    }, 10000);
}

window.toggleNotifications = function () {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('show');
    }
};

window.markAllRead = function () {
    const notifications = document.querySelectorAll('.notification-item.unread');
    notifications.forEach(notification => {
        notification.classList.remove('unread');
    });

    updateNotificationBadge();
    showNotification('All notifications marked as read', 'success');
};

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${getNotificationIcon(type)}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles for toast notifications
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .notification-toast {
                position: fixed;
                top: 90px;
                right: 20px;
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                max-width: 400px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            }
            
            .notification-toast.success { border-left: 4px solid var(--success-color); }
            .notification-toast.error { border-left: 4px solid var(--error-color); }
            .notification-toast.warning { border-left: 4px solid var(--warning-color); }
            .notification-toast.info { border-left: 4px solid var(--info-color); }
            
            .toast-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
            }
            
            .notification-toast.success .toast-icon { background: rgba(16, 185, 129, 0.1); color: var(--success-color); }
            .notification-toast.error .toast-icon { background: rgba(239, 68, 68, 0.1); color: var(--error-color); }
            .notification-toast.warning .toast-icon { background: rgba(245, 158, 11, 0.1); color: var(--warning-color); }
            .notification-toast.info .toast-icon { background: rgba(59, 130, 246, 0.1); color: var(--info-color); }
            
            .toast-content { flex: 1; }
            .toast-message { font-size: 0.875rem; color: var(--gray-900); }
            
            .toast-close {
                background: none;
                border: none;
                color: var(--gray-400);
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
            }
            
            .toast-close:hover { background: var(--gray-100); }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// User menu
function initializeUserMenu() {
    // Close user menu when clicking outside
    document.addEventListener('click', function (e) {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');

        if (userMenu && !userMenu.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

window.toggleUserMenu = function () {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

// Mobile responsiveness
function initializeMobile() {
    // Add mobile menu toggle if needed
    if (window.innerWidth <= 768) {
        addMobileMenuToggle();
    }

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth <= 768) {
            addMobileMenuToggle();
        } else {
            removeMobileMenuToggle();
        }
    });
}

function addMobileMenuToggle() {
    if (document.querySelector('.mobile-menu-toggle')) return;

    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle btn-icon';
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
    toggle.onclick = toggleMobileSidebar;

    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.parentNode.insertBefore(toggle, navBrand.nextSibling);
    }
}

function removeMobileMenuToggle() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
        toggle.remove();
    }
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Refresh functions
window.refreshCurrentTab = function () {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabId = activeTab.id.replace('-tab', '');
        if (tabId === 'logs') {
            refreshLogs();
        } else if (tabId === 'compose') {
            refreshComposer();
        }
    }
};

function refreshLogs() {
    showNotification('Refreshing logs...', 'info');
    // Simulate API refresh
    setTimeout(() => {
        updateLogsSummary();
        showNotification('Logs refreshed', 'success');
    }, 1000);
}

function refreshComposer() {
    showNotification('Refreshing composer...', 'info');
    // Simulate refresh
    setTimeout(() => {
        updateStatsDisplay();
        showNotification('Composer refreshed', 'success');
    }, 1000);
}

function updateStatsDisplay() {
    // Simulate updating stats (would come from API)
    const stats = {
        sentToday: Math.floor(Math.random() * 1000) + 1000,
        credits: Math.floor(Math.random() * 5000) + 5000
    };

    const sentElements = document.querySelectorAll('.stat-value');
    if (sentElements[0]) {
        animateNumber(sentElements[0], stats.sentToday);
    }
    if (sentElements[1]) {
        animateNumber(sentElements[1], stats.credits);
    }
}
