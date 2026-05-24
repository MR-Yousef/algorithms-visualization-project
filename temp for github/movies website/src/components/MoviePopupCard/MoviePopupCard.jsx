import React from "react";
import './MoviePopupCard.css'
import PropTypes from "prop-types";

function MoviePopupCard({ movie, onClose }) {
    if (!movie) return null;

    return (
        <div className="popup-backdrop" onClick={onClose}>
            <div className="popup-content">
                <button aria-label="Close" onClick={onClose} className="close-button">
                    &times;
                </button>
                <img src={movie.poster} alt={`${movie.title} poster`} />
                <h2>{movie.title}</h2>
                <p>Release Year : {movie.releaseYear}</p>
                <p>{movie.categories.join(' , ')}</p>
                <p className="movie-popup-description">
                    {movie.description}
                </p>
            </div>
        </div>
    );
}

MoviePopupCard.propTypes = {
    movie: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

export default MoviePopupCard;
