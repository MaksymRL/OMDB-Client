// Configurazione
const API_KEY = '145e3197'; // Sostituisci con la tua API Key di OMDb
const BASE_URL = 'https://www.omdbapi.com/';
const RESULTS_PER_PAGE = 10;

// Elementi DOM
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

// Variabili globali per la paginazione
let currentPage = 1;
let totalResults = 0;
let totalPages = 0;
let currentQuery = '';
let currentYear = '';

// Funzione per mostrare/nascondere il caricamento
function toggleLoading(show) {
    loading.classList.toggle('hidden', !show);
}

// Funzione per mostrare/nascondere la paginazione
function togglePagination(show) {
    pagination.classList.toggle('hidden', !show);
}

// Funzione per calcolare il numero totale di pagine
function calculateTotalPages(totalResults) {
    return Math.ceil(totalResults / RESULTS_PER_PAGE);
}

// Funzione per visualizzare i film
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
    
    // Aggiorna informazioni sulla ricerca
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
    
    // Crea le card per ogni film
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        
        movieElement.innerHTML = `
            <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x400/1a2a6c/ffffff?text=No+Image'}" alt="Locandina di ${movie.Title}">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">Anno: ${movie.Year}</p>
                <p class="movie-type">Tipo: ${movie.Type === 'movie' ? 'Film' : (movie.Type === 'series' ? 'Serie TV' : 'Episodio')}</p>
            </div>
        `;
        
        resultsContainer.appendChild(movieElement);
    });
    
    // Aggiorna la paginazione
    updatePagination(page);
}

// Funzione per aggiornare i controlli di paginazione
function updatePagination(currentPage) {
    // Calcola il numero totale di pagine
    totalPages = calculateTotalPages(totalResults);
    
    // Aggiorna le informazioni sulla pagina
    pageInfo.textContent = `Pagina ${currentPage} di ${totalPages}`;
    
    // Abilita/disabilita i pulsanti
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
    
    // Aggiorna i numeri di pagina
    updatePageNumbers(currentPage, totalPages);
    
    // Mostra la paginazione se ci sono più pagine
    togglePagination(totalPages > 1);
    
    // Aggiorna il placeholder del campo di salto
    jumpToPageInput.placeholder = `1-${totalPages}`;
}

// Funzione per aggiornare i numeri di pagina
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
    // Validazione: se il numero è minore o uguale a 0, va alla prima pagina
    if (page <= 0) {
        page = 1;
    }
    
    // Validazione: se il numero è superiore al totale delle pagine, va all'ultima
    if (page > totalPages) {
        page = totalPages;
    }
    
    currentPage = page;
    performSearch(currentQuery, currentYear, page);
}

// Funzione per gestire il salto a una pagina specifica
function handleJumpToPage() {
    const pageInput = parseInt(jumpToPageInput.value);
    
    if (isNaN(pageInput)) {
        // Se non è un numero, mostra un avviso e resetta il campo
        alert('Inserisci un numero di pagina valido');
        jumpToPageInput.value = '';
        return;
    }
    
    // Vai alla pagina specificata (con validazione incorporata in goToPage)
    goToPage(pageInput);
    
    // Resetta il campo di input
    jumpToPageInput.value = '';
}

// Funzione per gestire gli errori
function displayError(message) {
    resultsContainer.innerHTML = `<div class="message">${message}</div>`;
    resultCount.textContent = '';
    togglePagination(false);
}

// Funzione per validare l'anno
function isValidYear(year) {
    if (!year) return true; // Anno opzionale
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= 2030;
}

// Funzione principale di ricerca
async function performSearch(query, year, page = 1) {
    // Mostra il caricamento
    toggleLoading(true);
    
    try {
        // Costruisce l'URL con i parametri appropriati
        let url = `${BASE_URL}?apikey=${API_KEY}&page=${page}`;
        
        // Determina il tipo di ricerca in base ai parametri inseriti
        if (query && year) {
            // Ricerca per titolo e anno
            url += `&s=${encodeURIComponent(query)}&y=${year}`;
        } else if (query) {
            // Ricerca solo per titolo
            url += `&s=${encodeURIComponent(query)}`;
        } else if (year) {
            // Ricerca solo per anno (usa un termine generico)
            url += `&s=movie&y=${year}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }
        
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Aggiorna le variabili globali
            currentQuery = query;
            currentYear = year;
            totalResults = parseInt(data.totalResults);
            
            // Visualizza i film
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
        // Nascondi il caricamento
        toggleLoading(false);
    }
}

// Funzione per gestire la ricerca (chiamata dal pulsante)
function searchMovies() {
    const query = searchInput.value.trim();
    const year = yearInput.value.trim();
    
    // Validazione
    if (!query && !year) {
        displayError('Inserisci almeno un termine di ricerca (titolo o anno)');
        return;
    }
    
    if (year && !isValidYear(year)) {
        displayError('Inserisci un anno valido (tra 1900 e 2030)');
        return;
    }
    
    // Reimposta alla prima pagina
    currentPage = 1;
    
    // Esegui la ricerca
    performSearch(query, year, currentPage);
}

// Event Listeners
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

// Pulsanti di paginazione
firstPageBtn.addEventListener('click', () => goToPage(1));
prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
lastPageBtn.addEventListener('click', () => goToPage(totalPages));

// Salto a pagina specifica
jumpButton.addEventListener('click', handleJumpToPage);
jumpToPageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleJumpToPage();
    }
});

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    // Focus sulla barra di ricerca al caricamento della pagina
    searchInput.focus();
    
    // Imposta l'anno corrente come placeholder
    const currentYear = new Date().getFullYear();
    yearInput.placeholder = `Anno (opzionale) - es: ${currentYear}`;
    
    // Messaggio iniziale
    resultsContainer.innerHTML = '<div class="message">Inserisci titolo, anno o entrambi per effettuare la ricerca</div>';
});