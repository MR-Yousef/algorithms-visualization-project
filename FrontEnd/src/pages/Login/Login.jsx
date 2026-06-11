import { useState } from "react";
import "./Login.css";
import { NodesNetworkImg, BarChartImg, GraphImg, PlotChartImg, CubeOutlineImg } from "../../assets/Images/Images"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, CheckIcon } from "../../assets/Icons/Icon";
import {Link} from "react-router-dom";


// ─── Main Component ───────────────────────────────────────────
export default function Login() {
    // State variables for form fields, validation, and UI behavior
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    // Validation function to check form inputs
    const validate = () => {
        const e = {};
        if (!email) e.email = "IDENTIFIER REQUIRED";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "INVALID FORMAT";
        if (!password) e.password = "ACCESS KEY REQUIRED";
        else if (password.length < 6) e.password = "MINIMUM 6 CHARACTERS";
        return e;
    };
    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        setTimeout(() => window.location.href = './Home', 2200);

    };
    // JSX structure for the login page
    return (
        <div className="login-page">
            {/* ── Animated Background ── */}
            <div className="login-canvas">
                <div className="mesh-wave" />
                <NodesNetworkImg />
                <div className="center-glow" />
                {/* Decorative floating panels */}
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
            {/*end of animated background*/}
            {/* ── Login Card ── */}
            <div className="login-card">
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit} noValidate>

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
                            <span className="field-icon"><UserIcon /></span>
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
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
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
                            Remember Me
                        </label>
                        <a href="#" className="forgot-link">Reset Password →</a>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`btn-login${loading ? " loading" : ""}`}
                    >
                        {loading && <span className="btn-spinner" />}
                        {loading ? "AUTHENTICATING..." : "Login"}
                    </button>

                </form>

                {/* Footer */}
                <div className="login-footer">
                    No account?&nbsp;
                    <Link to="/signup" className="signup-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
