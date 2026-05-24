import React from "react";
import './SidePanel.css'
import { useState } from "react";
import { IoMdExit } from "react-icons/io";
import { Link } from "react-router-dom";
import categories from '../../assets/testData/catigories.jsx'
import AddMoviePopupCard from '../../components/AddMoviePopupCard/AddMoviePopupCard.jsx';
function SidePanel({ isOpen, onClose }) {

    let [showAddMoviePopup, setShowAddMoviePopup] = useState(false);



    {/* show add movie popup */ }
    return (
        <>
            <div className={`side-panel ${isOpen ? "open" : ""}`}>
                <ul>
                    <li><Link to={'/login'}>Login</Link></li>
                    <li><Link to={'/signup'}>sign up</Link></li>
                    <li onClick={()=>{setShowAddMoviePopup(true)}}>add movie</li>
                </ul>
                <button onClick={onClose}><IoMdExit className="close-sidepanal-icon" />Close</button>
            </div>
            {showAddMoviePopup && (<AddMoviePopupCard onClose={() => setShowAddMoviePopup(false)} onSubmit={()=>{console.log('added')}} categories={categories} />)}
        </>
    );
}

export default SidePanel;
