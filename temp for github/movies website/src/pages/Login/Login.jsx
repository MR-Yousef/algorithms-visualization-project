import React from 'react';
import './Login.css';
import { Link } from 'react-router-dom';

function Login() {

    return (
        <>
        <div className="background"></div>
        <div className="login-wrapper">
            <form className="login-form">
                <h2 className="login-title">Welcome Back</h2>
                <input type="email" placeholder="Email" className="login-input" required/>
                <input type="password" placeholder="Password" className="login-input" required/>
                <button type="submit" className="login-button">Login</button>
                <p className="login-footer">
                    Don't have an account?<Link to={'/signup'} style={{textDecoration:"none"}}> Sign Up</Link>
                </p>
                <div className="guest-option" >
                    <Link to={'/home'} style={{ textDecoration: "none", color: 'inherit' }}> Continue as Guest</Link>
                </div>
            </form>
        </div>
    </>
    );
}

export default Login;
