const API_KEY = '145e3197'; // Sostituisci con la tua API Key di OMDb
const BASE_URL = 'https://www.omdbapi.com/';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchTerm = document.getElementById('searchTerm');
const resultCount = document.getElementById('resultCount');
const loading = document.getElementById('loading');
const resultsContainer = document.getElementById('results');

// Funzione per mostrare/nascondere il caricamento
function toggleLoading(show) {
    loading.classList.toggle('hidden', !show);
}

// Funzione per visualizzare i film
function displayMovies(movies, query) {
    resultsContainer.innerHTML = '';
    
    if (!movies || movies.length === 0) {
        resultsContainer.innerHTML = '<div class="message">Nessun risultato trovato per "' + query + '"</div>';
        resultCount.textContent = '';
        return;
    }
    
    // Aggiorna informazioni sulla ricerca
    searchTerm.textContent = `Risultati per: "${query}"`;
    resultCount.textContent = `${movies.length} film trovati`;
    
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
}

// Funzione per gestire gli errori
function displayError(message) {
    resultsContainer.innerHTML = `<div class="message">${message}</div>`;
    resultCount.textContent = '';
}

// Funzione principale di ricerca
async function searchMovies() {
    const query = searchInput.value.trim();
    
    if (!query) {
        displayError('Inserisci un termine di ricerca');
        return;
    }
    
    // Mostra il caricamento
    toggleLoading(true);
    
    try {
        // Effettua la chiamata API
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('Errore nella richiesta API');
        }
        
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Prendi solo i primi 10 risultati
            const movies = data.Search.slice(0, 10);
            displayMovies(movies, query);
        } else {
            displayError(data.Error || 'Nessun risultato trovato');
        }
    } catch (error) {
        console.error('Errore:', error);
        displayError('Si è verificato un errore durante la ricerca. Riprova più tardi.');
    } finally {
        // Nascondi il caricamento
        toggleLoading(false);
    }
}

// Event Listeners
searchButton.addEventListener('click', searchMovies);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    // Focus sulla barra di ricerca al caricamento della pagina
    searchInput.focus();
    
    // Messaggio iniziale
    resultsContainer.innerHTML = '<div class="message">Inserisci un termine di ricerca per iniziare</div>';
});