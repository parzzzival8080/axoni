document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');
    const nextStep1 = document.getElementById('next-step-1');
    const nextStep2 = document.getElementById('next-step-2');
    const signupBtn = document.getElementById('signup-btn');
    const uploadIcon = document.querySelector('.upload-icon');
    const profilePicUpload = document.getElementById('profile-pic-upload');
    const profilePreview = document.getElementById('profile-preview');
    const navItems = document.querySelectorAll('.nav-item');
    const chatBubble = document.querySelector('.chat-bubble');
    
    // Step navigation
    nextStep1.addEventListener('click', function() {
        if (document.getElementById('terms').checked && document.getElementById('country').value) {
            goToStep(2);
        } else {
            alert('Please select a country and agree to the terms');
        }
    });
    
    nextStep2.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (email && password && confirmPassword) {
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            goToStep(3);
        } else {
            alert('Please fill in all fields');
        }
    });
    
    signupBtn.addEventListener('click', function() {
        const fullName = document.getElementById('full-name').value;
        const phone = document.getElementById('phone').value;
        
        if (fullName && phone) {
            alert('Registration successful! Welcome to OKX.');
        } else {
            alert('Please fill in all fields');
        }
    });
    
    // Navigate between steps
    function goToStep(stepNumber) {
        formSteps.forEach((step, index) => {
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        steps.forEach((step, index) => {
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else if (index + 1 < stepNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }
    
    // Profile picture upload
    uploadIcon.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the event from bubbling up
        profilePicUpload.click();
    });
    
    // Allow clicking on the entire profile picture container
    const profileContainer = document.querySelector('.profile-pic-container');
    profileContainer.addEventListener('click', function() {
        profilePicUpload.click();
    });
    
    profilePicUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Nav item hover effect
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(180deg)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(0)';
            }
        });
    });
    
    // Chat bubble animation
    chatBubble.addEventListener('click', () => {
        chatBubble.style.transform = 'scale(0.9)';
        setTimeout(() => {
            chatBubble.style.transform = 'scale(1)';
        }, 150);
    });
});