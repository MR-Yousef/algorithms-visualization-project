import { useState } from "react";
import "./Signup.css";
import { NodesNetworkImg, BarChartImg, GraphImg, PlotChartImg, CubeOutlineImg } from "../../assets/Images/Images"
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, CheckIcon } from "../../assets/Icons/Icon";
import {Link} from "react-router-dom";

// ─── Main Component ───────────────────────────────────────────
export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!username) e.username = "USERNAME REQUIRED";
        else if (username.length < 3) e.username = "MINIMUM 3 CHARACTERS";
        if (!email) e.email = "EMAIL REQUIRED";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "INVALID FORMAT";
        if (!password) e.password = "PASSWORD REQUIRED";
        else if (password.length < 6) e.password = "MINIMUM 6 CHARACTERS";
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        setTimeout(() => setLoading(false), 2200);
    };

    return (
        <div className="signup-page">

            {/* ── Animated Background ── */}
            <div className="signup-canvas">
                <div className="mesh-wave" />
                <NodesNetworkImg />
                <div className="center-glow" />

                <div className="deco-panels">
                    <div className="deco-panel deco-panel-1">
                        <BarChartImg />
                    </div>
                    <div className="deco-panel deco-panel-2">
                        <GraphImg />
                    </div>
                    <div className="deco-panel deco-panel-3">
                        <PlotChartImg />
                    </div>
                    <div className="deco-panel deco-panel-4">
                        <CubeOutlineImg />
                    </div>
                </div>
            </div>

            {/* ── Signup Card ── */}
            <div className="signup-card">
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />
                <span className="corner-dot top-left" />
                <span className="corner-dot top-right" />
                <span className="corner-dot bottom-right" />
                <span className="corner-dot bottom-left" />

                {/* Form */}
                <form className="signup-form" onSubmit={handleSubmit} noValidate>

                    {/* Username */}
                    <div className="field-group">
                        <label className="field-label">
                            <span className="field-label-icon" />
                            Username
                        </label>
                        <div className="field-wrapper">
                            <input
                                type="text"
                                className="field-input"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                            <span className="field-icon"><UserIcon /></span>
                        </div>
                        {errors.username && <span className="error-msg">⚠ {errors.username}</span>}
                    </div>

                    {/* Email */}
                    <div className="field-group">
                        <label className="field-label">
                            <span className="field-label-icon" />
                            Email
                        </label>
                        <div className="field-wrapper">
                            <input
                                type="email"
                                className="field-input"
                                placeholder="user@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                            <span className="field-icon"><MailIcon /></span>
                        </div>
                        {errors.email && <span className="error-msg">⚠ {errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="field-group">
                        <label className="field-label">
                            <span className="field-label-icon" />
                            Password
                        </label>
                        <div className="field-wrapper">
                            <input
                                type={showPass ? "text" : "password"}
                                className="field-input"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                            <span className="field-icon"><LockIcon /></span>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPass(!showPass)}
                                aria-label="Toggle password visibility"
                            >
                                {showPass ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <span className="error-msg">⚠ {errors.password}</span>}
                    </div>

                    {/* Options */}
                    <div className="form-options">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <span className="custom-checkbox">
                                <CheckIcon />
                            </span>
                            I agree to Terms
                        </label>
                        <a href="#" className="forgot-link">Privacy Policy →</a>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`btn-signup${loading ? " loading" : ""}`}
                    >
                        {loading && <span className="btn-spinner" />}
                        {loading ? "CREATING ACCOUNT..." : "Sign Up"}
                    </button>

                </form>

                {/* Footer */}
                <div className="signup-footer">
                    Already have an account?&nbsp;
                    <Link to="/login" className="login-link">Login</Link>
                </div>
            </div>
        </div>
    );
}