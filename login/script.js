document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.login-tabs .tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Chart tabs functionality
    const chartTabs = document.querySelectorAll('.chart-tabs span');
    
    chartTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            chartTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Chart timeframe selection
    const timeframes = document.querySelectorAll('.chart-timeframes span');
    
    timeframes.forEach(timeframe => {
        timeframe.addEventListener('click', () => {
            timeframes.forEach(t => t.style.backgroundColor = '');
            timeframe.style.backgroundColor = '#1e1e1e';
        });
    });
    
    // Star button toggle
    const starButton = document.querySelector('.chart-title .fa-star');
    
    if (starButton) {
        starButton.addEventListener('click', () => {
            if (starButton.classList.contains('far')) {
                starButton.classList.remove('far');
                starButton.classList.add('fas');
                starButton.style.color = '#f7a600';
            } else {
                starButton.classList.remove('fas');
                starButton.classList.add('far');
                starButton.style.color = '#7e8299';
            }
        });
    }
    
    // Country code selection effect
    const countryCode = document.querySelector('.country-code');
    
    countryCode.addEventListener('click', () => {
        countryCode.style.backgroundColor = '#eaeaea';
        setTimeout(() => {
            countryCode.style.backgroundColor = '#f5f5f5';
        }, 200);
    });
    
    // Next button hover effect
    const nextBtn = document.querySelector('.next-btn');
    
    nextBtn.addEventListener('mouseenter', () => {
        nextBtn.style.backgroundColor = '#eaeaea';
    });
    
    nextBtn.addEventListener('mouseleave', () => {
        nextBtn.style.backgroundColor = '#f5f5f5';
    });
    
    // Social login buttons hover effect
    const socialBtns = document.querySelectorAll('.social-btn');
    
    socialBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const iconCircle = btn.querySelector('.icon-circle');
            if (iconCircle) {
                iconCircle.style.backgroundColor = '#eaeaea';
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            const iconCircle = btn.querySelector('.icon-circle');
            if (iconCircle) {
                iconCircle.style.backgroundColor = '#f5f5f5';
            }
        });
    });
    
    // Chat bubble animation
    const chatBubble = document.querySelector('.chat-bubble');
    
    chatBubble.addEventListener('click', () => {
        chatBubble.style.transform = 'scale(0.9)';
        setTimeout(() => {
            chatBubble.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Nav item hover effect
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(180deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(0)';
            }
        });
    });
});