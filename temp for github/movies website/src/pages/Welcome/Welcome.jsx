import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() {
    const [showFirstButton, setShowFirstButton] = useState(false);
    const [showSecondButton, setShowSecondButton] = useState(false);
    const [showAccountOptions, setShowAccountOptions] = useState(false);
    const [headingAnimated, setHeadingAnimated] = useState(false);
    const [hoverOnSignup, setHoverOnSigup] = useState(false);
    const [hoverOnLogin, setHoverOnLogin] = useState(false);


    useEffect(() => {
        // Animate heading after short delay
        const moveHeading = setTimeout(() => setHeadingAnimated(true), 500);
        const showBtn1 = setTimeout(() => setShowFirstButton(true), 1500);
        const showBtn2 = setTimeout(() => setShowSecondButton(true), 2500);

        return () => {
            clearTimeout(moveHeading);
            clearTimeout(showBtn1);
            clearTimeout(showBtn2);
        };
    }, []);

    return (
        <div className="welcome-container">
            <h1 className={`neon-text ${headingAnimated ? "move-up" : ""}`}>
                Welcome to Moviology
            </h1>

            {!showAccountOptions ? (
                <div className="buttons-column">
                    <button
                        className={`btn neon-btn ${showFirstButton ? "fade-in" : "hidden"}`}
                        onClick={() => setShowAccountOptions(true)}>
                        Continue with an Account
                    </button>

                    <button
                        className={`btn neon-btn ${showSecondButton ? "fade-in" : "hidden"}`}>
                        <Link to={'/home'} style={{ textDecoration: "none", color: 'inherit' }}>Continue as Guest</Link>
                    </button>
                </div>) : (
                <div className="account-options fade-in">
                    <div className="subDiv">

                        <button className="btn neon-btn"
                            onMouseEnter={() => { setHoverOnSigup(true) }}
                            onMouseLeave={() => { setHoverOnSigup(false) }}><Link to={'/signup'} style={{ textDecoration: "none", color: 'inherit' }} >{hoverOnSignup ? 'sign up' : 'new here ?'}</Link></button>

                        <button className="btn neon-btn"
                            onMouseEnter={() => { setHoverOnLogin(true) }}
                            onMouseLeave={() => { setHoverOnLogin(false) }}><Link to={'/login'} style={{ textDecoration: "none", color: 'inherit' }}>{hoverOnLogin ? 'login' : 'Have an account ?'}</Link></button>
                    </div>
                    <button
                        className="btn back-btn"
                        onClick={() => setShowAccountOptions(false)}>
                        Back
                    </button>
                </div>
            )}
        </div>
    );
}
