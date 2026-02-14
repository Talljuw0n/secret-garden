// Signup Page JavaScript with Paystack Integration

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const submitButton = signupForm.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');
    const formError = document.getElementById('formError');
    
    // Form Validation
    function validateForm() {
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const attendanceMode = document.getElementById('attendanceMode').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Clear previous errors
        formError.textContent = '';
        formError.classList.remove('show');
        
        // Validate full name
        if (fullName.length < 3) {
            showError('Please enter your full name');
            return false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return false;
        }
        
        // Validate phone
        const phoneRegex = /^[+]?[\d\s-()]+$/;
        if (!phoneRegex.test(phone) || phone.length < 10) {
            showError('Please enter a valid phone number');
            return false;
        }
        
        // Validate attendance mode
        if (!attendanceMode) {
            showError('Please select an attendance mode');
            return false;
        }
        
        // Validate terms agreement
        if (!agreeTerms) {
            showError('You must agree to the terms and conditions');
            return false;
        }
        
        return true;
    }
    
    function showError(message) {
        formError.textContent = message;
        formError.classList.add('show');
        formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        if (isLoading) {
            buttonText.style.display = 'none';
            buttonLoader.style.display = 'flex';
        } else {
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
        }
    }
    
    // Handle Form Submission
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        // Collect form data
        const formData = {
            full_name: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            attendance_mode: document.getElementById('attendanceMode').value,
            church: document.getElementById('church').value.trim(),
            special_needs: document.getElementById('specialNeeds').value.trim(),
            newsletter: document.getElementById('newsletter').checked
        };
        
        try {
            // Send registration data to backend
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            
            const data = await response.json();
            
            // Initialize Paystack payment
            initializePayment(data.registration_id, data.transaction_reference, formData.email, formData.full_name);
            
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred. Please try again.');
            setLoading(false);
        }
    });
    
    // Initialize Paystack Payment
    function initializePayment(registrationId, reference, email, fullName) {
        const handler = PaystackPop.setup({
            key: 'pk_test_your_paystack_public_key', // Replace with your actual Paystack public key
            email: email,
            amount: 500000, // Amount in kobo (₦5,000)
            currency: 'NGN',
            ref: reference,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Registration ID",
                        variable_name: "registration_id",
                        value: registrationId
                    },
                    {
                        display_name: "Full Name",
                        variable_name: "full_name",
                        value: fullName
                    },
                    {
                        display_name: "Event",
                        variable_name: "event",
                        value: "Divine Encounter 2026"
                    }
                ]
            },
            callback: function(response) {
                // Payment successful
                verifyPayment(response.reference);
            },
            onClose: function() {
                // Payment popup closed
                showError('Payment was cancelled. Please try again.');
                setLoading(false);
            }
        });
        
        handler.openIframe();
    }
    
    // Verify Payment on Backend
    async function verifyPayment(reference) {
        try {
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reference: reference })
            });
            
            if (!response.ok) {
                throw new Error('Payment verification failed');
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Redirect to success page
                window.location.href = '/success';
            } else {
                throw new Error('Payment verification failed');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showError('Payment verification failed. Please contact support with reference: ' + reference);
            setLoading(false);
        }
    }
    
    // Real-time validation feedback
    const inputs = signupForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#e8e4de';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#e8e4de';
            }
        });
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        // Remove non-numeric characters except + and spaces
        let value = e.target.value.replace(/[^\d+\s()-]/g, '');
        e.target.value = value;
    });
});