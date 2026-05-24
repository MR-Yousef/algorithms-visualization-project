import React from "react";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import MovieCard from "../../components/MovieCard/MovieCard.jsx";
import MoviePopupCard from "../../components/MoviePopupCard/MoviePopupCard.jsx";
import SidePanel from "../../components/SidePanel/SidePanel.jsx";
import { useState, useEffect } from "react";
import movies from '../../assets/testData/filmes.jsx'
import './Favorites.css';

function Favorites() {
    //Effect changing
    useEffect(function () {
        setFavotraitesMovies(movies.filter(function (el) { return el.isFavorite; }))
    }, [])

    // state variables
    let [popupMovie, setpopupdMovie] = useState(null);
    let [isSidePanelOpen, setSidePanelOpen] = useState(false);
    let [favoraiteMovies, setFavotraitesMovies] = useState([]);

    // handle functions
    let handleClose = () => {
        setpopupdMovie(null);
    };

    let handleFavoriteStateUpdate = (tempID) => {
        movies.forEach(function (el) {
            if (el.id === tempID)
                el.isFavorite = false;
        })
        setFavotraitesMovies(movies.filter(function (el) {
            return el.isFavorite;
        }))
    };

    // final result
    return (
        <div className="home-container">
            <Header onMenuClick={() => setSidePanelOpen(true)} />
            <SidePanel isOpen={isSidePanelOpen} onClose={() => setSidePanelOpen(false)} />
            <div className="movies-list" onClick={() => setSidePanelOpen(false)}>
                {/* show movies  */}
                {favoraiteMovies.map((el) => { 
                    return <MovieCard key={`movieCard-${el.id}`}
                        movie={el}
                        showPopup={() => {
                            setpopupdMovie(movies.find((m) =>
                                m.id === el.id))
                        }}
                        updateFavoriteState={() => { handleFavoriteStateUpdate(el.id) } } />
                })}
                {/* show popup movie */}
                {popupMovie && (<MoviePopupCard movie={popupMovie} onClose={handleClose} />)}
            </div>
            <Footer />
        </div>
    );
}

export default Favorites;
