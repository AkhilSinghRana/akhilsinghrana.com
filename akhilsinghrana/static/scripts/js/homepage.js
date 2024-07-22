document.addEventListener('DOMContentLoaded', () => {
    const dots = document.querySelectorAll('.dot');
    const sections = document.querySelectorAll('section');
    const blogCarousel = document.querySelector('.blog-carousel');
    const blogContainer = blogCarousel.querySelector('.blog-container');
    const blogItems = blogContainer.querySelectorAll('.blog-item');
    const prevBtn = blogCarousel.querySelector('.prev');
    const nextBtn = blogCarousel.querySelector('.next');
    const indicatorsContainer = blogCarousel.querySelector('.carousel-indicators');
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    let currentIndex = 0;
    let intervalId;

    // Smooth scrolling and active section
    dots.forEach(dot => {
        dot.addEventListener('click', event => {
            event.preventDefault();
            const targetId = dot.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    function setActiveSection() {
        const scrollPosition = window.pageYOffset;
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                dots.forEach(dot => dot.classList.remove('active'));
                dots[index].classList.add('active');
                sections.forEach(s => s.classList.remove('active'));
                section.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveSection);
    window.addEventListener('load', setActiveSection);

    // Carousel functionality
    function updateCarousel() {
        blogContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        blogItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });
        const indicators = indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % blogItems.length;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + blogItems.length) % blogItems.length;
        updateCarousel();
    }

    function startAutoScroll() {
        intervalId = setInterval(nextSlide, 5000);
    }

    function stopAutoScroll() {
        clearInterval(intervalId);
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoScroll();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoScroll();
    });

    blogCarousel.addEventListener('mouseenter', stopAutoScroll);
    blogCarousel.addEventListener('mouseleave', startAutoScroll);

    // Indicators
    blogItems.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });

    updateCarousel();
    startAutoScroll();

    // Theme Switch
    function switchTheme(e) {
        if (e.target.checked) {
            document.body.classList.remove('light');
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        }    
    }

    toggleSwitch.addEventListener('change', switchTheme, false);
});