// TMDB API Configuration
const API_KEY = 'c6ec2e09b4242cea749e54637f68a2a8'; // Replace with your TMDB API key
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM Elements
const showsGrid = document.getElementById('showsGrid');
const sortBy = document.getElementById('sortBy');
const genreFilter = document.getElementById('genreFilter');
const loadMoreBtn = document.getElementById('loadMore');

// State
let currentPage = 1;
let currentSortBy = 'popular';
let currentGenre = '';
let genres = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // Load genres
    await fetchGenres();
    
    // Load initial TV shows
    loadTVShows();
    
    // Event listeners
    sortBy.addEventListener('change', () => {
        currentSortBy = sortBy.value;
        currentPage = 1;
        showsGrid.innerHTML = '';
        loadTVShows();
    });
    
    genreFilter.addEventListener('change', () => {
        currentGenre = genreFilter.value;
        currentPage = 1;
        showsGrid.innerHTML = '';
        loadTVShows();
    });
    
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadTVShows();
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('hidden');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('#mobileMenu a').forEach(link => {
        link.addEventListener('click', () => mobileMenu?.classList.add('hidden'));
    });
});

// Fetch TV show genres from TMDB
async function fetchGenres() {
    try {
        const response = await fetch(`${API_BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        genres = data.genres || [];
        
        // Populate genre filter
        const genreFilter = document.getElementById('genreFilter');
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

// Create TV show card element
function createTVShowCard(show) {
    if (!show || !show.id) {
        console.error('Invalid show data:', show);
        return document.createElement('div');
    }

    const card = document.createElement('div');
    card.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group';
    
    // Create clickable link that wraps the entire card
    const link = document.createElement('a');
    link.href = `tv-details.html?id=${show.id}`;
    link.className = 'block h-full';
    
    // Add click handler to prevent default behavior and handle navigation
    link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `tv-details.html?id=${show.id}`;
    });

    link.innerHTML = `
        <div class="relative overflow-hidden h-80">
            <img 
                src="${show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
                alt="${show.name || 'TV Show'}" 
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/500x750?text=Image+Not+Available'"
            >
            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="bg-red-600 text-white px-4 py-2 rounded-md font-semibold">View Details</span>
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-white line-clamp-1">${show.name || 'Untitled'}</h3>
            <div class="flex justify-between items-center mt-2">
                <span class="text-gray-400 text-sm">${show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}</span>
                <span class="bg-red-600 text-white text-xs px-2 py-1 rounded">${show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
        </div>
    `;
    
    card.appendChild(link);
    return card;
}

// Fetch TV shows from TMDB
async function loadTVShows() {
    try {
        // Show loading state
        if (currentPage === 1) {
            showsGrid.innerHTML = `
                <div class="animate-pulse bg-gray-800 rounded-lg h-80 col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5"></div>
            `;
        } else {
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = 'Loading...';
        }
        
        // Build API URL
        let url = `${API_BASE_URL}/tv/${currentSortBy}?api_key=${API_KEY}&language=en-US&page=${currentPage}`;
        if (currentGenre) {
            url += `&with_genres=${currentGenre}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (currentPage === 1) {
            showsGrid.innerHTML = '';
        }
        
        if (data.results && data.results.length > 0) {
            data.results.forEach(show => {
                showsGrid.appendChild(createTVShowCard(show));
            });
            
            // Show/hide load more button
            if (data.page < data.total_pages) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } else {
            showsGrid.innerHTML = '<div class="col-span-5 text-center py-12">No TV shows found. Try different filters.</div>';
            loadMoreBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading TV shows:', error);
        showsGrid.innerHTML = '<div class="col-span-5 text-center py-12">Error loading TV shows. Please try again later.</div>';
    } finally {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = 'Load More';
    }
}

// Helper function to get genre names from genre IDs
function getGenreNames(genreIds) {
    return genreIds
        .map(id => genres.find(g => g.id === id)?.name)
        .filter(Boolean)
        .slice(0, 2); // Show max 2 genres to keep it clean
}
