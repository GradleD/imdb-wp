// TMDB API Configuration
const API_KEY = 'c6ec2e09b4242cea749e54637f68a2a8'; // Replace with your TMDB API key
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM Elements
const app = document.getElementById('app');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// Toggle mobile menu
mobileMenuBtn?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden'));

// Fetch data from TMDB API
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
        return (await response.json()).results || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Create media card
function createMediaCard(media, type = 'movie') {
    if (!media || !media.id) {
        console.error('Invalid media data:', media);
        return document.createElement('div');
    }

    const card = document.createElement('div');
    card.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group';
    
    const detailUrl = type === 'tv' ? `tv-details.html?id=${media.id}` : `movie-details.html?id=${media.id}`;
    
    // Create clickable link that wraps the entire card
    const link = document.createElement('a');
    link.href = detailUrl;
    link.className = 'block h-full';
    
    // Add click handler to prevent default behavior and handle navigation
    link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = detailUrl;
    });

    const title = media.title || media.name || 'Untitled';
    const year = (media.release_date || media.first_air_date) ? 
        new Date(media.release_date || media.first_air_date).getFullYear() : 'N/A';
    
    link.innerHTML = `
        <div class="relative overflow-hidden h-64">
            <img 
                src="${media.poster_path ? `${IMAGE_BASE_URL}${media.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
                alt="${title}" 
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/500x750?text=Image+Not+Available'"
            >
            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="bg-red-600 text-white px-4 py-2 rounded-md font-semibold">View Details</span>
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-white line-clamp-1">${title}</h3>
            <div class="flex justify-between items-center mt-2">
                <span class="text-gray-400 text-sm">${year}</span>
                <span class="flex items-center text-sm text-gray-400">
                    <i class="fas ${type === 'tv' ? 'fa-tv' : 'fa-film'} text-red-500 mr-1"></i>
                    ${type === 'tv' ? 'TV' : 'Movie'}
                </span>
                <span class="bg-red-600 text-white text-xs px-2 py-1 rounded">
                    ${media.vote_average ? media.vote_average.toFixed(1) : 'N/A'}
                </span>
            </div>
        </div>
    `;
    
    card.appendChild(link);
    return card;
}

// Render content
async function renderContent() {
    try {
        const [trending, movies, shows] = await Promise.all([
            fetchData('/trending/all/week'),
            fetchData('/movie/popular'),
            fetchData('/tv/popular')
        ]);

        const sections = [
            { title: 'Trending Now', data: trending, link: '#' },
            { title: 'Popular Movies', data: movies, link: 'movies.html' },
            { title: 'Popular TV Shows', data: shows, link: 'tv-shows.html' }
        ];

        // Clear existing content
        app.innerHTML = '';
        
        sections.forEach(section => {
            const sectionElement = document.createElement('section');
            sectionElement.className = 'py-12 bg-gray-900';
            
            const sectionTitle = section.title.toLowerCase().replace(/\s+/g, '-');
            const gridId = `${sectionTitle}-grid`;
            
            sectionElement.innerHTML = `
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold flex items-center">
                            <span class="w-1 h-8 bg-red-600 mr-3"></span>
                            ${section.title}
                        </h2>
                        ${section.link !== '#' ? `<a href="${section.link}" class="text-red-500 hover:underline">View All</a>` : ''}
                    </div>
                    <div id="${gridId}" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <!-- Cards will be inserted here -->
                    </div>
                </div>
            `;
            
            app.appendChild(sectionElement);
            
            // Add cards to the grid
            const grid = document.getElementById(gridId);
            const type = section.title.includes('TV') ? 'tv' : 'movie';
            
            section.data.slice(0, 10).forEach(item => {
                const card = createMediaCard(item, type);
                if (card) {
                    grid.appendChild(card);
                }
            });
        });

    } catch (error) {
        console.error('Error rendering content:', error);
        app.innerHTML = '<div class="text-center py-12 text-red-500">Error loading content. Please try again later.</div>';
    }
}

// Initialize Swiper
let heroSwiper = null;

// Initialize hero carousel with dynamic content
async function initHeroCarousel() {
    try {
        // Fetch trending movies for the carousel
        const response = await fetch(`${API_BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        const trendingMovies = data.results.slice(0, 5); // Get top 5 trending movies
        
        const heroCarousel = document.querySelector('.hero-carousel .swiper-wrapper');
        heroCarousel.innerHTML = ''; // Clear existing slides
        
        // Create slides for each trending movie
        trendingMovies.forEach(movie => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide relative';
            
            slide.innerHTML = `
                <div class="absolute inset-0 bg-black bg-opacity-60"></div>
                <img src="${movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://via.placeholder.com/1920x1080?text=No+Backdrop'}" 
                     alt="${movie.title}" 
                     class="w-full h-full object-cover"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/1920x1080?text=Image+Not+Available'"
                >
                <div class="absolute bottom-0 left-0 right-0 p-8 md:p-16 bg-gradient-to-t from-black to-transparent">
                    <h2 class="text-3xl md:text-5xl font-bold mb-4">${movie.title}</h2>
                    <p class="text-gray-300 mb-6 max-w-2xl line-clamp-2">${movie.overview || 'No description available.'}</p>
                    <div class="flex space-x-4">
                        <a href="movie-details.html?id=${movie.id}" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold inline-flex items-center">
                            <i class="fas fa-play mr-2"></i> Watch Now
                        </a>
                        <a href="movie-details.html?id=${movie.id}" class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-semibold inline-flex items-center">
                            <i class="fas fa-info-circle mr-2"></i> More Info
                        </a>
                    </div>
                </div>
            `;
            
            heroCarousel.appendChild(slide);
        });
        
        // Initialize or update Swiper
        if (!heroSwiper) {
            heroSwiper = new Swiper('.hero-carousel', {
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
                speed: 1000,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
            });
        } else {
            heroSwiper.update();
        }
        
    } catch (error) {
        console.error('Error initializing hero carousel:', error);
    }
}

// Initialize
window.addEventListener('load', () => {
    // Initialize hero carousel
    initHeroCarousel();
    
    // Initialize mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('hidden');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('#mobileMenu a').forEach(link => {
        link.addEventListener('click', () => mobileMenu?.classList.add('hidden'));
    });
    
    // Render content
    renderContent();
});
