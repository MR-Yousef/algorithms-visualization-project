import './Home.css';
import React from "react";
import { useState } from "react";
import movies from "../../assets/testData/filmes.jsx";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import MovieCard from "../../components/MovieCard/MovieCard.jsx";
import MoviePopupCard from "../../components/MoviePopupCard/MoviePopupCard.jsx";
import SidePanel from "../../components/SidePanel/SidePanel.jsx";

function Home() {
    let [showMoviePopup, setShowMoviePopup] = useState(null);
    let [isSidePanelOpen, setSidePanelOpen] = useState(false);
    let [movieSearchFor,setMovieSearchFor] = useState('')

    let handleClose = () => {
        setShowMoviePopup(null);
    };

    let handleFavoriteState = (tempID) => {
        movies.forEach(function (el) {
            if (el.id === tempID)
                el.isFavorite = !el.isFavorite;
        })}

    let handleSeacrhValueChange=(seacrhValue)=>{
        setMovieSearchFor(seacrhValue) ;
    }

    return (
        <div className="home-container">
            <Header onMenuClick={() => setSidePanelOpen(true)} seacrhValueChange={(seacrhValue)=>{handleSeacrhValueChange(seacrhValue)}}/>
            <SidePanel isOpen={isSidePanelOpen} onClose={() => setSidePanelOpen(false)} />
            <div className="movies-list" onClick={() => setSidePanelOpen(false)}>
                {/* show movies  */}
                { movies.filter((el)=>{return el.title.toLowerCase().includes(movieSearchFor.toLowerCase())})
                        .map((el) => {
                    return <MovieCard key={`movieCard-${el.id}`}
                        movie={el}
                        showPopup={() => {
                            setShowMoviePopup(movies.find((m) =>
                                m.id === el.id))
                        }}
                        updateFavoriteState={() => { handleFavoriteState(el.id) }} />
                })}
                {/* show popup movie */}
                {showMoviePopup && (<MoviePopupCard movie={showMoviePopup} onClose={handleClose} onClick={showMoviePopup} />)}

            </div>
            <Footer />
        </div>
    );
}

export default Home;
