import { useState, useEffect } from "react";
import "./Login.css";
import { NodesNetworkImg, BarChartImg, GraphImg, PlotChartImg, CubeOutlineImg } from "../../assets/Images/Images"
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, CheckIcon } from "../../assets/Icons/Icon";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";


// ─── Main Component ───────────────────────────────────────────
export default function Login() {
    const [ID, setID] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';

    // Load saved email on mount
    useEffect(() => {
        const savedID = localStorage.getItem('remembered_ID');
        if (savedID) {
            setID(savedID);
        }
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const validate = () => {
        const e = {};
        if (!ID) e.ID = "IDENTIFIER REQUIRED";
        if (!password) e.password = "ACCESS KEY REQUIRED";
        else if (password.length < 6) e.password = "MINIMUM 6 CHARACTERS";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setErrors({});
        setLoading(true);

        // Pass remember to login
        const result = await login(ID, password, remember);

        if (result.success) {
            // Save ID for auto-fill if Remember Me checked
            if (remember) {
                localStorage.setItem('remembered_ID', ID);
            } else {
                localStorage.removeItem('remembered_ID');
            }
        } else {
            setLoading(false);
            setApiError(result.error || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-page">
            {/* ── Animated Background ── */}
            <div className="login-canvas">
                <div className="mesh-wave" />
                <NodesNetworkImg />
                <div className="center-glow" />
                <div className="deco-panels">
                    <div className="deco-panel deco-panel-1"><BarChartImg /></div>
                    <div className="deco-panel deco-panel-2"><GraphImg /></div>
                    <div className="deco-panel deco-panel-3"><PlotChartImg /></div>
                    <div className="deco-panel deco-panel-4"><CubeOutlineImg /></div>
                </div>
            </div>

            {/* ── Login Card ── */}
            <div className="login-card">
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    {apiError && <div className="api-error">{apiError}</div>}

                    {/* ID */}
                    <div className="field-group">
                        <label className="field-label">
                            <span className="field-label-icon" />
                            Enter Username or Email
                        </label>
                        <div className="field-wrapper">
                            <input
                                type="text"
                                className="field-input"
                                placeholder="username or email"
                                value={ID}
                                onChange={(e) => setID(e.target.value)}
                                autoComplete="email"
                            />
                            <span className="field-icon"><UserIcon /></span>
                        </div>
                        {errors.ID && <span className="error-msg">⚠ {errors.ID}</span>}
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
                        <a onClick={() => navigate('/forget-password')} className="forgot-link">Forget Password →</a>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`btn-login${loading ? " loading" : ""}`}
                        disabled={loading}
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