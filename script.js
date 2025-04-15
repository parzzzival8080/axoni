document.addEventListener('DOMContentLoaded', function() {
    // Accordion functionality
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');

        header.addEventListener('click', () => {
            // Close all other open items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const icon = otherItem.querySelector('.accordion-icon i');
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            });

            // Toggle current item
            item.classList.toggle('active');

            // Toggle icon rotation
            const icon = item.querySelector('.accordion-icon i');
            if (icon) {
                if (item.classList.contains('active')) {
                    icon.style.transform = 'rotate(45deg)';
                    icon.style.transition = 'transform 0.3s ease';
                } else {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });

    // Video thumbnail hover effect
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');

    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('mouseenter', () => {
            thumbnail.querySelector('img').style.transform = 'scale(1.03)';
            thumbnail.querySelector('img').style.transition = 'transform 0.3s ease';
        });

        thumbnail.addEventListener('mouseleave', () => {
            thumbnail.querySelector('img').style.transform = 'scale(1)';
        });
    });

    // Nav dropdown simulation
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (item.querySelector('.fa-chevron-down')) {
                item.querySelector('.fa-chevron-down').style.transform = 'rotate(180deg)';
                item.querySelector('.fa-chevron-down').style.transition = 'transform 0.3s ease';
            }
        });

        item.addEventListener('mouseleave', () => {
            if (item.querySelector('.fa-chevron-down')) {
                item.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
            }
        });
    });

    // Subtle scroll effects
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Parallax effect for hero image
        const heroImage = document.querySelector('.hero-image');
        if (heroImage && scrollY < 800) {
            heroImage.style.transform = `translateY(${scrollY * 0.05}px)`;
        }

        // Fade in elements as they come into view
        const fadeElements = document.querySelectorAll('.trading, .journey, .about, .faq');
        fadeElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
            }
        });
    });

    // Initialize page with some animations
    const initAnimations = () => {
        // Fade in hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(20px)';

            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
                heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            }, 300);
        }

        // Fade in hero image
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.opacity = '0';
            heroImage.style.transform = 'translateY(20px)';

            setTimeout(() => {
                heroImage.style.opacity = '1';
                heroImage.style.transform = 'translateY(0)';
                heroImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            }, 600);
        }

        // Set initial opacity for scroll animations
        const fadeElements = document.querySelectorAll('.trading, .journey, .about, .faq');
        fadeElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transition = 'opacity 1s ease';
        });
    };

    initAnimations();

    // Chat bubble interaction
    const chatBubble = document.querySelector('.chat-bubble');
    if (chatBubble) {
        chatBubble.addEventListener('click', () => {
            chatBubble.style.transform = 'scale(0.95)';

            setTimeout(() => {
                chatBubble.style.transform = 'scale(1)';
            }, 200);

            // Here would be the code to open a chat window
            console.log('Chat bubble clicked');
        });
    }

    // Video playback handling
    function togglePlay(button) {
        const videoContainer = button.closest('.video-thumbnail');
        const video = videoContainer.querySelector('video');
        const icon = button.querySelector('i');

        if (video.paused) {
            video.play();
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            video.pause();
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    }

    // Update play button state when video ends
    document.querySelectorAll('video').forEach(video => {
        video.addEventListener('ended', () => {
            const button = video.closest('.video-thumbnail') ? .querySelector('.play-btn');
            if (button) {
                const icon = button.querySelector('i');
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        });
    });

    // Handle native video controls click
    document.querySelectorAll('video').forEach(video => {
        video.addEventListener('play', () => {
            const button = video.closest('.video-thumbnail') ? .querySelector('.play-btn');
            if (button) {
                const icon = button.querySelector('i');
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            }
        });

        video.addEventListener('pause', () => {
            const button = video.closest('.video-thumbnail') ? .querySelector('.play-btn');
            if (button) {
                const icon = button.querySelector('i');
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        });
    });
});