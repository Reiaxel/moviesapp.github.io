import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [trailerKey, setTrailerKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('https://api.themoviedb.org/3/movie/popular?api_key=d4b8f6b8b887bfe6ed9677f9ba44a041&language=es-ES');
        setMovies(response.data.results);
        setFilteredMovies(response.data.results);
        if (response.data.results.length > 0) {
          fetchTrailer(response.data.results[0].id);
        }
      } catch (error) {
        setError('Error fetching movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const fetchTrailer = async (movieId) => {
    try {
      const trailerResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=d4b8f6b8b887bfe6ed9677f9ba44a041&language=es-ES`);
      const trailer = trailerResponse.data.results.find(video => video.type === 'Trailer');
      setTrailerKey(trailer ? trailer.key : '');
      const movie = movies.find(m => m.id === movieId);
      setSelectedMovie(movie);
    } catch (error) {
      setError('Error fetching trailer. Please try again later.');
      setTrailerKey('');
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setFilteredMovies(movies);
      return;
    }

    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=d4b8f6b8b887bfe6ed9677f9ba44a041&query=${encodeURIComponent(searchQuery)}&language=es-ES`);
      setFilteredMovies(response.data.results);
    } catch (error) {
      setError('Error fetching search results. Please try again later.');
    }
  };

  return (
    <div className="app">
      <h1>Películas</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar películas..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-bar"
        />
        <button onClick={handleSearch} className="search-button">Buscar</button>
      </div>
      {loading && <p>Cargando películas...</p>}
      {error && <p className="error-message">{error}</p>}
      {trailerKey && (
        <div className="trailer">
          <h4>Reproduciendo tráiler:</h4>
          <iframe
            width="800"
            height="450"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          {selectedMovie && (
            <div className="movie-description">
              <h3>{selectedMovie.title}</h3>
              <p>{selectedMovie.overview}</p>
            </div>
          )}
        </div>
      )}
      <div className="movie-list">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="movie-item"
            onMouseEnter={() => fetchTrailer(movie.id)}
          >
            <a href={`https://www.youtube.com/watch?v=${trailerKey}`} target="_blank" rel="noopener noreferrer">
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`Poster de ${movie.title}`} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

