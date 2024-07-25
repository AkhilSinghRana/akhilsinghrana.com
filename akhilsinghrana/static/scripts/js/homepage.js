document.addEventListener('DOMContentLoaded', () => {
    // Variables
    const dots = document.querySelectorAll('.dot');
    const sections = document.querySelectorAll('section');

    // Blog carousel
    const blogCarousel = document.querySelector('.blog-carousel');
    const blogContainer = blogCarousel?.querySelector('.blog-container');
    const blogItems = blogContainer?.querySelectorAll('.blog-item');
    const prevBtn = blogCarousel?.querySelector('.prev');
    const nextBtn = blogCarousel?.querySelector('.next');
    const indicatorsContainer = blogCarousel?.querySelector('.carousel-indicators');
    
    // Toggle switch
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    
    // Publications
    const previewImage = document.getElementById('publication-preview');
    const publicationList = document.getElementById('publication-list');
    
    // Portfolio carousel
    const portfolioCarousel = document.querySelector('.portfolio-carousel');
    const portfolioContainer = portfolioCarousel?.querySelector('.portfolio-container');
    const portfolioItems = portfolioContainer?.querySelectorAll('.portfolio-item');
    const portfolioPrevBtn = portfolioCarousel?.querySelector('.portfolio-arrow.prev');
    const portfolioNextBtn = portfolioCarousel?.querySelector('.portfolio-arrow.next');
    const portfolioIndicatorsContainer = portfolioCarousel?.querySelector('.portfolio-indicators');
    
    let currentIndex = 0;
    let intervalId;
    let portfolioCurrentIndex = 0;
    let portfolioIntervalId;

    // Smooth scrolling and active section
    dots.forEach(dot => {
        dot.addEventListener('click', event => {
            event.preventDefault();
            const targetId = dot.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    function setActiveSection() {
        const scrollPosition = window.pageYOffset;
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                dots.forEach(dot => dot.classList.remove('active'));
                dots[index]?.classList.add('active');
                sections.forEach(s => s.classList.remove('active'));
                section.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveSection);
    window.addEventListener('load', setActiveSection);

    // Carousel functionality
    function updateCarousel() {
        if (!blogContainer || !blogItems?.length) return;
        const itemWidth = blogItems[0].offsetWidth;
        blogContainer.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        blogItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });
        const indicators = indicatorsContainer?.querySelectorAll('.indicator');
        indicators?.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        if (!blogItems?.length) return;
        currentIndex = index;
        updateCarousel();
    }

    function nextSlide() {
        if (!blogItems?.length) return;
        currentIndex = (currentIndex + 1) % blogItems.length;
        updateCarousel();
    }

    function prevSlide() {
        if (!blogItems?.length) return;
        currentIndex = (currentIndex - 1 + blogItems.length) % blogItems.length;
        updateCarousel();
    }

    function startAutoScroll() {
        intervalId = setInterval(nextSlide, 5000);
    }

    function stopAutoScroll() {
        clearInterval(intervalId);
    }

    if (prevBtn && nextBtn && blogItems?.length > 0) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoScroll();
            startAutoScroll(); // Restart auto-scroll after manual navigation
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoScroll();
            startAutoScroll(); // Restart auto-scroll after manual navigation
        });

        blogCarousel?.addEventListener('mouseenter', stopAutoScroll);
        blogCarousel?.addEventListener('mouseleave', startAutoScroll);

        // Indicators
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = ''; // Clear existing indicators
            blogItems.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.classList.add('indicator');
                indicator.addEventListener('click', () => {
                    goToSlide(index);
                    stopAutoScroll();
                    startAutoScroll(); // Restart auto-scroll after manual navigation
                });
                indicatorsContainer.appendChild(indicator);
            });
        }

        updateCarousel();
        startAutoScroll();
    }

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

    toggleSwitch?.addEventListener('change', switchTheme, false);

    // Preview Publications
    publicationList?.addEventListener('click', function(e) {
        const clickedItem = e.target.closest('li');
        if (clickedItem && previewImage) {
            const previewSrc = clickedItem.getAttribute('data-preview');
            previewImage.src = previewSrc;
        }
    });

    previewImage?.addEventListener('click', function() {
        const activeItem = publicationList?.querySelector(`li[data-preview="${previewImage.src}"]`);
        if (activeItem) {
            const officialLink = activeItem.querySelector('a')?.getAttribute('href');
            if (officialLink) {
                window.open(officialLink, '_blank');
            }
        }
    });

    // Portfolio Section
    function updatePortfolioCarousel() {
        if (!portfolioContainer || !portfolioItems?.length) return;
        portfolioContainer.style.transform = `translateX(-${portfolioCurrentIndex * 100}%)`;
        portfolioItems.forEach((item, index) => {
            item.classList.toggle('active', index === portfolioCurrentIndex);
        });
        const portfolioIndicators = portfolioIndicatorsContainer?.querySelectorAll('.portfolio-indicator');
        portfolioIndicators?.forEach((pIndicator, index) => {
            pIndicator.classList.toggle('active', index === portfolioCurrentIndex);
        });
    }

    function goToPortfolioSlide(index) {
        if (!portfolioItems?.length) return;
        portfolioCurrentIndex = index;
        updatePortfolioCarousel();
    }

    function nextPortfolioSlide() {
        if (!portfolioItems?.length) return;
        portfolioCurrentIndex = (portfolioCurrentIndex + 1) % portfolioItems.length;
        updatePortfolioCarousel();
    }

    function prevPortfolioSlide() {
        if (!portfolioItems?.length) return;
        portfolioCurrentIndex = (portfolioCurrentIndex - 1 + portfolioItems.length) % portfolioItems.length;
        updatePortfolioCarousel();
    }

    function startPortfolioAutoScroll() {
        portfolioIntervalId = setInterval(nextPortfolioSlide, 5000);
    }

    function stopPortfolioAutoScroll() {
        clearInterval(portfolioIntervalId);
    }

    if (portfolioPrevBtn && portfolioNextBtn && portfolioItems?.length > 0) {
        portfolioPrevBtn.addEventListener('click', () => {
            prevPortfolioSlide();
            stopPortfolioAutoScroll();
            startPortfolioAutoScroll(); // Restart auto-scroll after manual navigation
        });

        portfolioNextBtn.addEventListener('click', () => {
            nextPortfolioSlide();
            stopPortfolioAutoScroll();
            startPortfolioAutoScroll(); // Restart auto-scroll after manual navigation
        });

        portfolioCarousel?.addEventListener('mouseenter', stopPortfolioAutoScroll);
        portfolioCarousel?.addEventListener('mouseleave', startPortfolioAutoScroll);

        // Indicators
        if (portfolioIndicatorsContainer) {
            portfolioItems.forEach((_, index) => {
                const pIndicator = document.createElement('div');
                pIndicator.classList.add('portfolio-indicator');
                pIndicator.addEventListener('click', () => {
                    goToPortfolioSlide(index);
                    stopPortfolioAutoScroll();
                    startPortfolioAutoScroll(); // Restart auto-scroll after manual navigation
                });
                portfolioIndicatorsContainer.appendChild(pIndicator);
            });
        }

        updatePortfolioCarousel();
        startPortfolioAutoScroll();
    }
});