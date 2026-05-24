import React from "react";
import "./Header.css";
import { ImMenu } from "react-icons/im";
function Header({ onMenuClick, seacrhValueChange }) {
    return (
        // header body
        <div className="header">
            {/* title */}
            <h1 >rrrrrahal</h1>
            {/* search bar */}
            <input type="search"
                id="search-bar"
                placeholder="start searching for movies... "
                onChange={(seacrhValue) => { seacrhValueChange(seacrhValue.target.value) }}>
            </input>
            {/* side menu button */}
            <button className="header-menu-button" onClick={onMenuClick}><ImMenu className="header-menu-button-icon" /></button>
        </div>
    );
}

export default Header;
