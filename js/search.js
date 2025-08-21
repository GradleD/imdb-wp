// TMDB API Configuration
const API_KEY = 'c6ec2e09b4242cea749e54637f68a2a8';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let searchTimeout;

// Debounce search input
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
    }
    
    searchTimeout = setTimeout(() => {
        searchMoviesAndTVShows(query);
    }, 500);
});

// Search for movies and TV shows
async function searchMoviesAndTVShows(query) {
    try {
        const [moviesResponse, tvShowsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`),
            fetch(`${API_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
        ]);
        
        const moviesData = await moviesResponse.json();
        const tvShowsData = await tvShowsResponse.json();
        
        const results = [
            ...(moviesData.results || []).map(item => ({ ...item, media_type: 'movie' })),
            ...(tvShowsData.results || []).map(item => ({ ...item, media_type: 'tv' }))
        ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Error searching:', error);
        searchResults.innerHTML = `
            <div class="p-4 text-red-500">
                Error loading search results. Please try again.
            </div>
        `;
        searchResults.classList.remove('hidden');
    }
}

// Display search results
function displaySearchResults(results) {
    if (!results || results.length === 0) {
        searchResults.innerHTML = `
            <div class="p-4 text-gray-400">
                No results found. Try a different search term.
            </div>
        `;
        searchResults.classList.remove('hidden');
        return;
    }
    
    searchResults.innerHTML = results.slice(0, 8).map(item => `
        <a href="${item.media_type === 'movie' ? 'movie' : 'tv'}-details.html?id=${item.id}" 
           class="flex items-center p-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0">
            <img src="${item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/100x150?text=No+Poster'}" 
                 alt="${item.title || item.name}" 
                 class="w-12 h-16 object-cover rounded"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/100x150?text=No+Poster'"
            >
            <div class="ml-3">
                <h4 class="text-white font-medium">${item.title || item.name}</h4>
                <div class="flex items-center text-xs text-gray-400">
                    <span>${item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
                    ${item.release_date || item.first_air_date ? 
                        `<span class="mx-1">•</span>
                         <span>${(item.release_date || item.first_air_date).split('-')[0]}</span>` : ''
                    }
                    ${item.vote_average ? 
                        `<span class="mx-1">•</span>
                         <span>${item.vote_average.toFixed(1)} <i class="fas fa-star text-yellow-400"></i></span>` : ''
                    }
                </div>
            </div>
        </a>
    `).join('');
    
    searchResults.classList.remove('hidden');
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

// Handle keyboard navigation
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchResults.classList.add('hidden');
    }
});
