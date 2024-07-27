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
    const publicationPreviewImage = document.getElementById('publication-preview');
    const publicationList = document.getElementById('publication-list');

    let publicationCurrentIndex = 0;
    let publicationAutoScrollInterval;
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

    // Blog Modal loading
    const blogModal = document.getElementById('blogModal');
    const blogContent = document.getElementById('blogContent');

    blogModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const blogFile = button.getAttribute('data-blog');
        
        fetch(blogFile)
            .then(response => response.text())
            .then(html => {
                blogContent.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading blog content:', error);
                blogContent.innerHTML = '<p>Error loading blog content. Please try again later.</p>';
            });
    });
    
    // Blog Carousel functionality
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
    function updatePublicationPreview(item) {
        const previewSrc = item.getAttribute('data-preview');
        publicationPreviewImage.src = previewSrc;
        document.querySelectorAll('#publication-list li').forEach(li => li.classList.remove('active'));
        item.classList.add('active');
    }
    
    function publicationAutoScroll() {
        const items = publicationList.querySelectorAll('li');
        updatePublicationPreview(items[publicationCurrentIndex]);
        publicationCurrentIndex = (publicationCurrentIndex + 1) % items.length;
    }
    
    function startPublicationAutoScroll() {
        stopPublicationAutoScroll();
        publicationAutoScrollInterval = setInterval(publicationAutoScroll, 3000);
    }
    
    function stopPublicationAutoScroll() {
        clearInterval(publicationAutoScrollInterval);
    }
    
    publicationList?.addEventListener('click', function(e) {
        const clickedItem = e.target.closest('li');
        if (clickedItem && publicationPreviewImage) {
            updatePublicationPreview(clickedItem);
            stopPublicationAutoScroll();
            startPublicationAutoScroll(); // Restart auto-scroll after manual selection
        }
    });
    
    publicationPreviewImage?.addEventListener('click', function() {
        const activeItem = publicationList?.querySelector('li.active');
        if (activeItem) {
            const officialLink = activeItem.querySelector('a')?.getAttribute('href');
            if (officialLink) {
                window.open(officialLink, '_blank');
            }
        }
    });
    
    publicationList?.addEventListener('mouseenter', stopPublicationAutoScroll);
    publicationList?.addEventListener('mouseleave', startPublicationAutoScroll);
    
    // Start auto-scrolling when the page loads
    startPublicationAutoScroll();

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