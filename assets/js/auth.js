// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Password toggle functionality
    window.togglePassword = function (fieldId = 'password') {
        const passwordField = document.getElementById(fieldId);
        const toggleIcon = fieldId === 'password' ?
            document.getElementById('password-toggle-icon') :
            passwordField.nextElementSibling.querySelector('i');

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    };

    // Password strength checker
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('input', function () {
            checkPasswordStrength(this.value);
        });
    }

    function checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) strength += 25;

        // Uppercase check
        if (/[A-Z]/.test(password)) strength += 25;

        // Lowercase check
        if (/[a-z]/.test(password)) strength += 25;

        // Number or special character check
        if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;

        // Update visual feedback
        strengthBar.style.width = strength + '%';

        if (strength === 0) {
            strengthBar.style.background = '#e5e7eb';
            feedback = 'Enter a password';
        } else if (strength <= 25) {
            strengthBar.style.background = '#ef4444';
            feedback = 'Very weak password';
        } else if (strength <= 50) {
            strengthBar.style.background = '#f59e0b';
            feedback = 'Weak password';
        } else if (strength <= 75) {
            strengthBar.style.background = '#3b82f6';
            feedback = 'Good password';
        } else {
            strengthBar.style.background = '#10b981';
            feedback = 'Strong password';
        }

        strengthText.textContent = feedback;
    }

    // Form validation
    const authForm = document.querySelector('.auth-form');
    if (authForm) {
        authForm.addEventListener('submit', function (e) {
            if (!validateForm()) {
                e.preventDefault();
            }
        });
    }

    function validateForm() {
        let isValid = true;
        const formGroups = document.querySelectorAll('.form-group');

        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            if (input && input.hasAttribute('required')) {
                if (!input.value.trim()) {
                    showFieldError(group, 'This field is required');
                    isValid = false;
                } else {
                    clearFieldError(group);

                    // Email validation
                    if (input.type === 'email' && !isValidEmail(input.value)) {
                        showFieldError(group, 'Please enter a valid email address');
                        isValid = false;
                    }

                    // Password confirmation
                    if (input.name === 'confirm_password') {
                        const password = document.getElementById('password');
                        if (password && input.value !== password.value) {
                            showFieldError(group, 'Passwords do not match');
                            isValid = false;
                        }
                    }

                    // Phone validation
                    if (input.type === 'tel' && !isValidPhone(input.value)) {
                        showFieldError(group, 'Please enter a valid phone number');
                        isValid = false;
                    }
                }
            }
        });

        return isValid;
    }

    function showFieldError(group, message) {
        clearFieldError(group);
        group.classList.add('error');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        const input = group.querySelector('input, textarea');
        input.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(group) {
        group.classList.remove('error');
        const existingError = group.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    // Real-time validation
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            const group = this.closest('.form-group');
            if (group) {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    showFieldError(group, 'This field is required');
                } else {
                    clearFieldError(group);
                    group.classList.add('success');
                }
            }
        });

        input.addEventListener('input', function () {
            const group = this.closest('.form-group');
            if (group && group.classList.contains('error')) {
                clearFieldError(group);
            }
        });
    });

    // Loading state simulation
    const submitButton = document.querySelector('.btn-primary');
    if (submitButton && authForm) {
        authForm.addEventListener('submit', function (e) {
            if (validateForm()) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
                document.body.classList.add('loading');

                // Simulate API call delay
                setTimeout(() => {
                    // This would normally be handled by the server response
                    submitButton.disabled = false;
                    submitButton.innerHTML = submitButton.dataset.originalText || 'Submit';
                    document.body.classList.remove('loading');
                }, 2000);
            }
        });

        // Store original button text
        submitButton.dataset.originalText = submitButton.innerHTML;
    }

    // Auto-format phone number
    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value.startsWith('254')) {
                value = '+' + value;
            } else if (value.startsWith('0')) {
                value = '+254' + value.substring(1);
            } else if (!value.startsWith('+')) {
                value = '+254' + value;
            }
            this.value = value;
        });
    }

    // Enhanced accessibility
    document.addEventListener('keydown', function (e) {
        // Enter key on form elements
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            const form = e.target.closest('form');
            if (form) {
                const submitBtn = form.querySelector('.btn-primary');
                if (submitBtn) {
                    submitBtn.click();
                }
            }
        }
    });

    // Add smooth transitions
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.transform = 'translateY(20px)';

        setTimeout(() => {
            authCard.style.transition = 'all 0.6s ease';
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0)';
        }, 100);
    }

    // Feature animation on background
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateX(-30px)';

        setTimeout(() => {
            feature.style.transition = 'all 0.6s ease';
            feature.style.opacity = '1';
            feature.style.transform = 'translateX(0)';
        }, 200 + (index * 150));
    });
});
