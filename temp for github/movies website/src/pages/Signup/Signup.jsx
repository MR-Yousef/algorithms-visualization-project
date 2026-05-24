import React from 'react';
import './Signup.css';
import { Link } from 'react-router-dom';

function Signup() {

    return (
        <>
        <div className="background"></div>
        <div className="signup-wrapper">
            <form className="signup-form">
                <h2 className="signup-title">Create Account</h2>
                <input type="text" placeholder="Username" className="signup-input" required />
                <input type="email" placeholder="Email" className="signup-input" required />
                <input type="password" placeholder="Password" className="signup-input" required />
                <input type="password" placeholder="Confirm Password" className="signup-input" required />
                <button type="submit" className="signup-button">Sign Up</button>
                <p className="signup-footer">
                    Already have an account? <Link to={'/login'} style={{textDecoration:"none"}}> Login</Link>
                </p>
                <div className="guest-option" >
                    <Link to={'/home'} style={{ textDecoration: "none", color: 'inherit' }}> Continue as Guest</Link>
                </div>
            </form>
        </div>
    </>
    );
}

export default Signup;
