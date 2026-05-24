import React from 'react'
import './MovieCard.css'
import PropTypes from 'prop-types'
import { FaHeart, FaInfoCircle, FaClock } from 'react-icons/fa';
import { useState } from 'react';
/*
    MovieCard general prototype :
        <div className="card-container">
            <img>movie poster</img>
            <h2>movie title</h2>
            <h3>movie releaseYear</h3>
            <h4>movie categories</h4>
            <div className="card-buttons">
                <button className='info-button'>
                <button className='favorites-button'>
                <button className='watchLater-button'>
*/
// functoin component  header
function MovieCard({ movie,showPopup,updateFavoriteState}) {
    let [heartColor,setHeartColor] = useState('white') ;
    return (
        // the main card container 
        <div className="card-container" >

            {/* movie poster element*/}
            <img src={movie.poster} alt={movie.title} />

            {/* movie title (name) element */}
            <h2>{movie.title}</h2 >

            {/* movie release year element */}
            <h3>{movie.releaseYear}</h3>

            {/* movie categories */}
            <h4>{movie.categories.join(" , ")}</h4>

            {/* movie buttons container */}
            <div className="card-buttons">

                {/* information button , will show a popup that containes a short describtion about the movie */}
                <button className='info-button' onClick={showPopup} >
                    <FaInfoCircle style={{ backgroundColor: "transparent", color: "hsla(240, 100%, 7%, 1.00)" }} />
                </button>
                
                {/* favorite button , will add the movie to the favorites page and favorite array */}
                <button className='favorites-button' onClick={()=>{updateFavoriteState();setHeartColor(heartColor=='red'?'white':'red')}} >
                    <FaHeart style={{ backgroundColor: "transparent", color: `${heartColor}` }} />
                </button>
                
                {/* watch later button , will add the movie to the watch later page and watch later array  */}
                <button className='watchLater-button'  >
                    <FaClock style={{ backgroundColor: "transparent", color: "#E0E0E0" }} />
                </button>
            </div>
        </div>
    );
}

// setting dataTypes
MovieCard.prototypes ={
    movie : {
        poster: PropTypes.string ,
        title : PropTypes.string ,
        releaseYear : PropTypes.number ,
        categories :[PropTypes.string]
    } 
}

// setting default data
MovieCard.defaultProps={
    movie : {
        poster :'',
        title:'default title',
        releaseYear :-1,
        categories :['default category'],
    }
    
}

// export the MovieCard function as a default component
export default MovieCard;



