import { useState } from "react";
import "./Login.css";
import { IconUser, IconLock, IconEye, IconEyeOff, IconCheck } from "../../assets/Component/Icons/Icon";

// ─── Node Network SVG ─────────────────────────────────────────
const NodeNetwork = () => (
    <svg className="node-network" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f5e4" stopOpacity="1" />
                <stop offset="100%" stopColor="#00f5e4" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Lines */}
        {[
            [80, 600, 220, 520], [220, 520, 380, 570], [380, 570, 520, 490],
            [520, 490, 700, 540], [700, 540, 860, 480], [860, 480, 1000, 560],
            [1000, 560, 1180, 500], [220, 520, 300, 420], [300, 420, 500, 380],
            [500, 380, 700, 540], [700, 540, 900, 360], [900, 360, 1100, 420],
            [300, 420, 480, 300], [480, 300, 640, 340], [640, 340, 900, 360],
            [80, 600, 160, 480], [160, 480, 300, 420],
        ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(0,245,228,0.25)" strokeWidth="1"
            />
        ))}
        {/* Nodes */}
        {[
            [80, 600], [220, 520], [380, 570], [520, 490], [700, 540],
            [860, 480], [1000, 560], [1180, 500], [300, 420], [500, 380],
            [900, 360], [1100, 420], [480, 300], [640, 340], [160, 480],
        ].map(([cx, cy], i) => (
            <g key={i}>
                <circle cx={cx} cy={cy} r="10" fill="rgba(0,245,228,0.06)" />
                <circle cx={cx} cy={cy} r="4" fill="rgba(0,245,228,0.7)" />
                <circle cx={cx} cy={cy} r="2" fill="#00f5e4" />
            </g>
        ))}
    </svg>
);

// ─── Mini Bar Chart for deco panels ──────────────────────────
const MiniChart = () => (
    <div className="mini-chart">
        {[40, 65, 50, 85, 55, 75, 45].map((h, i) => (
            <div key={i} className="bar" style={{ height: `${h}%` }} />
        ))}
    </div>
);

// ─── Main Component ───────────────────────────────────────────
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!email) e.email = "IDENTIFIER REQUIRED";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "INVALID FORMAT";
        if (!password) e.password = "ACCESS KEY REQUIRED";
        else if (password.length < 6) e.password = "MINIMUM 6 CHARACTERS";
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        window.location.href = './Home';
    };

    return (
        <div className="login-page">

            {/* ── Animated Background ── */}
            <div className="login-canvas">
                <div className="mesh-wave" />
                <NodeNetwork />
                <div className="center-glow" />

                {/* Decorative floating panels */}
                <div className="deco-panels">
                    <div className="deco-panel deco-panel-1">
                        <MiniChart />
                    </div>
                    <div className="deco-panel deco-panel-2">
                        {/* Tree nodes hint */}
                        <svg width="100%" height="100%" viewBox="0 0 240 160" style={{ opacity: 0.6 }}>
                            <circle cx="120" cy="28" r="10" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
                            <line x1="120" y1="38" x2="80" y2="60" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
                            <line x1="120" y1="38" x2="160" y2="60" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
                            <circle cx="80" cy="70" r="8" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
                            <circle cx="160" cy="70" r="8" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
                            <line x1="80" y1="78" x2="55" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
                            <line x1="80" y1="78" x2="105" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
                            <line x1="160" y1="78" x2="135" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
                            <line x1="160" y1="78" x2="185" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
                            {[55, 105, 135, 185].map((x, i) => (
                                <circle key={i} cx={x} cy="108" r="7" fill="none" stroke="#007a72" strokeWidth="1.5" />
                            ))}
                        </svg>
                    </div>
                    <div className="deco-panel deco-panel-3">
                        <svg width="100%" height="100%" viewBox="0 0 160 110" style={{ padding: 12, overflow: 'visible' }}>
                            <polyline
                                points="10,80 35,55 60,65 85,35 110,45 140,20"
                                fill="none" stroke="#00f5e4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            />
                            <polyline
                                points="10,80 35,55 60,65 85,35 110,45 140,20"
                                fill="none" stroke="#00f5e4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.08"
                            />
                        </svg>
                    </div>
                    <div className="deco-panel deco-panel-4">
                        {/* Cube outline hint */}
                        <svg width="100%" height="100%" viewBox="0 0 180 120" style={{ opacity: 0.7 }}>
                            <rect x="55" y="30" width="50" height="50" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
                            <rect x="75" y="45" width="50" height="50" fill="none" stroke="#007a72" strokeWidth="1" />
                            <line x1="55" y1="30" x2="75" y2="45" stroke="#00c9b8" strokeWidth="1" />
                            <line x1="105" y1="30" x2="125" y2="45" stroke="#00c9b8" strokeWidth="1" />
                            <line x1="55" y1="80" x2="75" y2="95" stroke="#00c9b8" strokeWidth="1" />
                            <line x1="105" y1="80" x2="125" y2="95" stroke="#00c9b8" strokeWidth="1" />
                            {[[55, 30], [105, 30], [55, 80], [105, 80], [75, 45], [125, 45], [75, 95], [125, 95]].map(([cx, cy], i) => (
                                <circle key={i} cx={cx} cy={cy} r="3" fill="#00f5e4" opacity="0.8" />
                            ))}
                        </svg>
                    </div>
                </div>
            </div>

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
                            <span className="field-icon"><IconUser /></span>
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
                            <span className="field-icon"><IconLock /></span>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPass(!showPass)}
                                aria-label="Toggle password visibility"
                            >
                                {showPass ? <IconEyeOff /> : <IconEye />}
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
                                <IconCheck />
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
                    <a href="/signup">Signup</a>
                </div>
            </div>
        </div>
    );
}
