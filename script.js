
const API_KEY = '145e3197'; 
const BASE_URL = 'https://www.omdbapi.com/';
const RESULTS_PER_PAGE = 10;

const searchInput = document.getElementById('searchInput');
const yearInput = document.getElementById('yearInput');
const searchButton = document.getElementById('searchButton');
const searchTerm = document.getElementById('searchTerm');
const resultCount = document.getElementById('resultCount');
const loading = document.getElementById('loading');
const resultsContainer = document.getElementById('results');
const pagination = document.getElementById('pagination');
const pageInfo = document.getElementById('pageInfo');
const firstPageBtn = document.getElementById('firstPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const lastPageBtn = document.getElementById('lastPage');
const pageNumbers = document.getElementById('pageNumbers');
const jumpToPageInput = document.getElementById('jumpToPage');
const jumpButton = document.getElementById('jumpButton');


const movieModal = document.getElementById('movieModal');
const closeModalBtn = document.querySelector('.close-modal');
const modalBody = document.getElementById('modalBody');


let currentPage = 1;
let totalResults = 0;
let totalPages = 0;
let currentQuery = '';
let currentYear = '';


function toggleLoading(show) {
    loading.classList.toggle('hidden', !show);
}


function togglePagination(show) {
    pagination.classList.toggle('hidden', !show);
}


function calculateTotalPages(totalResults) {
    return Math.ceil(totalResults / RESULTS_PER_PAGE);
}


function displayMovies(movies, query, year, page = 1) {
    resultsContainer.innerHTML = '';
    
    if (!movies || movies.length === 0) {
        let message = 'Nessun risultato trovato';
        if (query && year) {
            message = `Nessun risultato trovato per "${query}" nell'anno ${year}`;
        } else if (query) {
            message = `Nessun risultato trovato per "${query}"`;
        } else if (year) {
            message = `Nessun film trovato per l'anno ${year}`;
        }
        resultsContainer.innerHTML = `<div class="message">${message}</div>`;
        resultCount.textContent = '';
        togglePagination(false);
        return;
    }
    
    
    let searchInfo = '';
    if (query && year) {
        searchInfo = `Risultati per: "${query}" (anno: ${year})`;
    } else if (query) {
        searchInfo = `Risultati per: "${query}"`;
    } else if (year) {
        searchInfo = `Film dell'anno: ${year}`;
    }
    
    searchTerm.textContent = searchInfo;
    resultCount.textContent = `${totalResults} film trovati`;
    
   
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.dataset.imdbId = movie.imdbID; 
        
        movieElement.innerHTML = `
            <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x400/1a2a6c/ffffff?text=No+Image'}" alt="Locandina di ${movie.Title}">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">Anno: ${movie.Year}</p>
                <p class="movie-type">Tipo: ${movie.Type === 'movie' ? 'Film' : (movie.Type === 'series' ? 'Serie TV' : 'Episodio')}</p>
            </div>
        `;
        
        
        movieElement.addEventListener('click', () => {
            openMovieDetails(movie.imdbID);
        });
        
        resultsContainer.appendChild(movieElement);
    });
    
    
    updatePagination(page);
}


function updatePagination(currentPage) {
    
    totalPages = calculateTotalPages(totalResults);
    
   
    pageInfo.textContent = `Pagina ${currentPage} di ${totalPages}`;
    
    
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
    

    updatePageNumbers(currentPage, totalPages);
    
   
    togglePagination(totalPages > 1);
    
    
    jumpToPageInput.placeholder = `1-${totalPages}`;
}


function updatePageNumbers(currentPage, totalPages) {
    pageNumbers.innerHTML = '';
    
    // Calcola l'intervallo di pagine da mostrare
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Aggiusta l'intervallo se siamo vicini agli estremi
    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }
    
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }
    
    // Aggiunge i numeri di pagina
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            if (i !== currentPage) {
                goToPage(i);
            }
        });
        pageNumbers.appendChild(pageNumber);
    }
}

// Funzione per andare a una pagina specifica
function goToPage(page) {
    
    if (page <= 0) {
        page = 1;
    }
    
    
    if (page > totalPages) {
        page = totalPages;
    }
    
    currentPage = page;
    performSearch(currentQuery, currentYear, page);
}


function handleJumpToPage() {
    const pageInput = parseInt(jumpToPageInput.value);
    
    if (isNaN(pageInput)) {
       
        alert('Inserisci un numero di pagina valido');
        jumpToPageInput.value = '';
        return;
    }
    
    
    goToPage(pageInput);
    
    
    jumpToPageInput.value = '';
}


function displayError(message) {
    resultsContainer.innerHTML = `<div class="message">${message}</div>`;
    resultCount.textContent = '';
    togglePagination(false);
}


function isValidYear(year) {
    if (!year) return true; 
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2030;
}

async function performSearch(query, year, page = 1) {
    
    toggleLoading(true);
    
    try {
        
        let url = `${BASE_URL}?apikey=${API_KEY}&page=${page}`;
        
        
        if (query && year) {
            
            url += `&s=${encodeURIComponent(query)}&y=${year}`;
        } else if (query) {
           
            url += `&s=${encodeURIComponent(query)}`;
        } else if (year) {
            
            url += `&s=movie&y=${year}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }
        
        const data = await response.json();
        
        if (data.Response === 'True') {
           
            currentQuery = query;
            currentYear = year;
            totalResults = parseInt(data.totalResults);
            
            
            displayMovies(data.Search, query, year, page);
        } else {
            if (query && year) {
                displayError(`Nessun risultato trovato per "${query}" nell'anno ${year}`);
            } else if (query) {
                displayError(`Nessun risultato trovato per "${query}"`);
            } else if (year) {
                displayError(`Nessun film trovato per l'anno ${year}`);
            } else {
                displayError('Nessun risultato trovato');
            }
        }
    } catch (error) {
        console.error('Errore:', error);
        displayError('Si è verificato un errore durante la ricerca. Riprova più tardi.');
    } finally {
        
        toggleLoading(false);
    }
}


function searchMovies() {
    const query = searchInput.value.trim();
    const year = yearInput.value.trim();
    
    
    if (!query && !year) {
        displayError('Inserisci almeno un termine di ricerca (titolo o anno)');
        return;
    }
    
    if (year && !isValidYear(year)) {
        displayError('Inserisci un anno valido (tra 1900 e 2030)');
        return;
    }
    
    
    currentPage = 1;
    
   
    performSearch(query, year, currentPage);
}


async function openMovieDetails(imdbId) {
    toggleLoading(true);
    
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbId}&plot=full`);
        
        if (!response.ok) {
            throw new Error('Errore nel recupero dei dettagli del film');
        }
        
        const movieDetails = await response.json();
        
        if (movieDetails.Response === 'True') {
            displayMovieDetails(movieDetails);
            movieModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; 
        } else {
            throw new Error('Dettagli del film non disponibili');
        }
    } catch (error) {
        console.error('Errore:', error);
        modalBody.innerHTML = `<div class="message">Errore nel caricamento dei dettagli</div>`;
        movieModal.classList.remove('hidden');
    } finally {
        toggleLoading(false);
    }
}


function displayMovieDetails(movie) {
    
    const runtime = movie.Runtime !== 'N/A' ? movie.Runtime : 'Non disponibile';
    
    
    let ratingsHTML = '';
    if (movie.Ratings && movie.Ratings.length > 0) {
        ratingsHTML = `
            <div class="movie-details-ratings">
                <h3>Valutazioni</h3>
                <div class="ratings-container">
                    ${movie.Ratings.map(rating => `
                        <div class="rating-item">
                            <span class="rating-source">${rating.Source}</span>
                            <span class="rating-value">${rating.Value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="movie-details">
            <img class="movie-details-poster" 
                 src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/1a2a6c/ffffff?text=No+Image'}" 
                 alt="${movie.Title}">
            
            <div class="movie-details-info">
                <h2>${movie.Title} (${movie.Year})</h2>
                
                <div class="movie-details-meta">
                    <div class="meta-item">
                        <span class="meta-label">Tipo</span>
                        <span class="meta-value">${movie.Type === 'movie' ? 'Film' : (movie.Type === 'series' ? 'Serie TV' : 'Episodio')}</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="meta-label">Durata</span>
                        <span class="meta-value">${runtime}</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="meta-label">Genere</span>
                        <span class="meta-value">${movie.Genre !== 'N/A' ? movie.Genre : 'Non disponibile'}</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="meta-label">IMDb Rating</span>
                        <span class="meta-value">${movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/D'}</span>
                    </div>
                </div>
                
                <div class="movie-details-plot">
                    <h3>Trama</h3>
                    <p>${movie.Plot !== 'N/A' ? movie.Plot : 'Trama non disponibile'}</p>
                </div>
                
                <div class="movie-details-cast">
                    <h3>Cast e Produzione</h3>
                    <p><strong>Regista:</strong> ${movie.Director !== 'N/A' ? movie.Director : 'Non disponibile'}</p>
                    <p><strong>Sceneggiatori:</strong> ${movie.Writer !== 'N/A' ? movie.Writer : 'Non disponibile'}</p>
                    <p><strong>Attori:</strong> ${movie.Actors !== 'N/A' ? movie.Actors : 'Non disponibile'}</p>
                </div>
                
                ${ratingsHTML}
                
                <div class="movie-details-meta" style="margin-top: 20px;">
                    <div class="meta-item">
                        <span class="meta-label">Paese</span>
                        <span class="meta-value">${movie.Country !== 'N/A' ? movie.Country : 'Non disponibile'}</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="meta-label">Lingua</span>
                        <span class="meta-value">${movie.Language !== 'N/A' ? movie.Language : 'Non disponibile'}</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="meta-label">Premi</span>
                        <span class="meta-value">${movie.Awards !== 'N/A' ? movie.Awards : 'Nessuno'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function closeMovieModal() {
    movieModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; 
}


function handleClickOutsideModal(event) {
    if (event.target === movieModal) {
        closeMovieModal();
    }
}


searchButton.addEventListener('click', searchMovies);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

yearInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});


firstPageBtn.addEventListener('click', () => goToPage(1));
prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
lastPageBtn.addEventListener('click', () => goToPage(totalPages));


jumpButton.addEventListener('click', handleJumpToPage);
jumpToPageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleJumpToPage();
    }
});


closeModalBtn.addEventListener('click', closeMovieModal);
movieModal.addEventListener('click', handleClickOutsideModal);


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !movieModal.classList.contains('hidden')) {
        closeMovieModal();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    
    searchInput.focus();
    
    
    const currentYear = new Date().getFullYear();
    yearInput.placeholder = `Anno (opzionale) - es: ${currentYear}`;
    
    
    resultsContainer.innerHTML = '<div class="message">Inserisci titolo, anno o entrambi per effettuare la ricerca</div>';
});