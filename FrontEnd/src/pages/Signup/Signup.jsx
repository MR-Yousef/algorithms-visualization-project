
import { useState } from "react";
import "./Signup.css";
import { NodesNetworkImg, BarChartImg, GraphImg, PlotChartImg, CubeOutlineImg } from "../../assets/Images/Images"
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, CheckIcon } from "../../assets/Icons/Icon";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// ─── Main Component ───────────────────────────────────────────
export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false); // 👈 RENAMED from remember
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!username) e.username = "USERNAME REQUIRED";
        else if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) e.username = "3-16 CHAR, ALPHANUMERIC & UNDERSCORES ONLY";
        if (!email) e.email = "EMAIL REQUIRED";
        else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)) e.email = "INVALID FORMAT";
        if (!password) e.password = "PASSWORD REQUIRED";
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) e.password = "MIN 8 CHAR, 1 UPPER, 1 LOWER & 1 NUMBER";
        if (!agreeTerms) e.terms = "YOU MUST AGREE TO THE TERMS"; // 👈 ADDED
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setSuccessMessage("");

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setErrors({});
        setLoading(true);

        const result = await register(username, email, password);

        setLoading(false);

        if (result.success) {
            setSuccessMessage("Account created successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } else {
            setApiError(result.error || "Registration failed. Please try again.");
        }
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
                    {apiError && <div className="api-error">{apiError}</div>}
                    {successMessage && <div className="api-success">{successMessage}</div>}

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

                    {/* Options - Terms Checkbox */}
                    <div className="form-options">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={agreeTerms} // 👈 Updated
                                onChange={(e) => setAgreeTerms(e.target.checked)} // 👈 Updated
                            />
                            <span className="custom-checkbox">
                                <CheckIcon />
                            </span>
                            I agree to Terms
                        </label>
                        <a onClick={() => navigate('/privacy-policy')} className="forgot-link">Privacy Policy →</a>
                    </div>
                    {errors.terms && <span className="error-msg">⚠ {errors.terms}</span>} {/* 👈 ADDED */}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`btn-signup${loading ? " loading" : ""}`}
                        disabled={loading}
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