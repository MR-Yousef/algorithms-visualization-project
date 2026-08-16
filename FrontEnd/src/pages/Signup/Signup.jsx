import { useEffect, useState } from "react";
import "./Signup.css";
import {
    NodesNetworkImg,
    BarChartImg,
    GraphImg,
    PlotChartImg,
    CubeOutlineImg,
} from "../../assets/Images/Images";
import {
    UserIcon,
    MailIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    CheckIcon,
} from "../../assets/Icons/Icon";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RESEND_TIME = 60;

export default function Signup() {
    const navigate = useNavigate();
    const {
        register,
        verifyRegistrationOtp,
        resendVerificationOtp,
    } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [preparingOtp, setPreparingOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpInfo, setOtpInfo] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (!showOtpModal || resendTimer <= 0) return;

        const timer = setTimeout(() => {
            setResendTimer((previous) => Math.max(previous - 1, 0));
        }, 1000);

        return () => clearTimeout(timer);
    }, [showOtpModal, resendTimer]);

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
    };

    const validate = () => {
        const validationErrors = {};
        const cleanUsername = username.trim();
        const cleanEmail = email.trim();

        if (!cleanUsername) {
            validationErrors.username = "USERNAME REQUIRED";
        } else if (!/^[a-zA-Z0-9_]{3,16}$/.test(cleanUsername)) {
            validationErrors.username = "3-16 CHAR, ALPHANUMERIC & UNDERSCORES ONLY";
        }

        if (!cleanEmail) {
            validationErrors.email = "EMAIL REQUIRED";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            validationErrors.email = "INVALID EMAIL FORMAT";
        }

        if (!password) {
            validationErrors.password = "PASSWORD REQUIRED";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            validationErrors.password = "MIN 8 CHAR, 1 UPPER, 1 LOWER & 1 NUMBER";
        }

        if (!agreeTerms) {
            validationErrors.terms = "YOU MUST AGREE TO THE TERMS";
        }

        return validationErrors;
    };

    const handleSubmit = async (event) => {

        event.preventDefault();


        setApiError("");
        setSuccessMessage("");
        setOtpError("");
        setOtpInfo("");


        const validationErrors =
            validate();


        if (
            Object.keys(
                validationErrors
            ).length > 0
        ) {

            setErrors(
                validationErrors
            );

            return;
        }


        setErrors({});


        const cleanUsername =
            username.trim();


        const cleanEmail =
            email
                .trim()
                .toLowerCase();


        /* =====================================================
           OPEN OTP POPUP IMMEDIATELY
        ===================================================== */

        setOtp("");

        setResendTimer(0);

        setPreparingOtp(true);

        setShowOtpModal(true);

        setLoading(true);


        try {

            console.log(
                "Starting registration..."
            );


            const result =
                await register(
                    cleanUsername,
                    cleanEmail,
                    password
                );


            console.log(
                "REGISTER RESULT:",
                result
            );


            /* =================================================
               FAILED
            ================================================= */

            if (
                !result ||
                !result.success
            ) {

                setShowOtpModal(false);


                setApiError(

                    result?.error ||

                    "Registration failed. Please try again."

                );


                return;
            }


            /* =================================================
               SUCCESS
    
               Django returned 201 and OTP was sent.
            ================================================= */

            setOtpInfo(
                "Verification code sent to your email."
            );


            setResendTimer(
                RESEND_TIME
            );


            console.log(
                "Registration complete. OTP input enabled."
            );

        }
        catch (error) {

            console.error(
                "SIGNUP ERROR:",
                error
            );


            setShowOtpModal(false);


            setApiError(

                error?.message ||

                "Registration failed. Please try again."

            );

        }
        finally {

            /*
             * VERY IMPORTANT:
             *
             * This ALWAYS runs.
             *
             * So the popup can never remain
             * permanently on "Please wait..."
             */

            setPreparingOtp(false);

            setLoading(false);

        }

    };

    const handleOtpChange = (event) => {
        const value = event.target.value.replace(/\D/g, "").slice(0, 6);
        setOtp(value);
        setOtpError("");
    };

    const handleVerifyOtp = async (event) => {
        event.preventDefault();

        if (preparingOtp) return;

        setOtpError("");
        setOtpInfo("");

        if (!/^\d{6}$/.test(otp)) {
            setOtpError("Please enter the 6-digit verification code.");
            return;
        }

        setOtpLoading(true);

        const result = await verifyRegistrationOtp(
            email.trim().toLowerCase(),
            otp
        );

        setOtpLoading(false);

        if (!result.success) {
            setOtpError(result.error || "Invalid verification code.");
            return;
        }

        setResendTimer(0);
        setOtpInfo("Email verified successfully!");
        setSuccessMessage("Email verified successfully! Redirecting to login...");

        setTimeout(() => {
            setShowOtpModal(false);
            navigate("/login", { replace: true });
        }, 1200);
    };

    const handleResendOtp = async () => {
        if (preparingOtp || resendLoading || resendTimer > 0) return;

        setOtpError("");
        setOtpInfo("");
        setResendLoading(true);

        const result = await resendVerificationOtp(
            email.trim().toLowerCase()
        );

        setResendLoading(false);

        if (!result.success) {
            setOtpError(result.error || "Failed to resend verification code.");
            return;
        }

        setOtp("");
        setOtpInfo("A new verification code was sent to your email.");
        setResendTimer(RESEND_TIME);
    };

    return (
        <div className="signup-page">
            <div className="signup-canvas">
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

            <div className="signup-card">
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />
                <span className="corner-dot top-left" />
                <span className="corner-dot top-right" />
                <span className="corner-dot bottom-right" />
                <span className="corner-dot bottom-left" />

                <form className="signup-form" onSubmit={handleSubmit} noValidate>
                    {apiError && <div className="api-error">{apiError}</div>}
                    {successMessage && <div className="api-success">{successMessage}</div>}

                    <div className="field-group">
                        <label className="field-label">
                            <span className="field-label-icon" /> Username
                        </label>
                        <div className="field-wrapper">
                            <input
                                type="text"
                                className="field-input"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(event) => {
                                    setUsername(event.target.value);
                                    setErrors((previous) => ({ ...previous, username: "" }));
                                }}
                                autoComplete="username"
                            />
                            <span className="field-icon"><UserIcon /></span>
                        </div>
                        <span className="hint-text">This username is permanent and cannot be changed later.</span>
                        {errors.username && <span className="error-msg">⚠ {errors.username}</span>}
                    </div>

                    <div className="field-group">
                        <label className="field-label">
                            <span className="field-label-icon" /> Email
                        </label>
                        <div className="field-wrapper">
                            <input
                                type="email"
                                className="field-input"
                                placeholder="user@gmail.com"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setErrors((previous) => ({ ...previous, email: "" }));
                                }}
                                autoComplete="email"
                            />
                            <span className="field-icon"><MailIcon /></span>
                        </div>
                        <span className="hint-text">This email is permanent and cannot be changed later.</span>
                        {errors.email && <span className="error-msg">⚠ {errors.email}</span>}
                    </div>

                    <div className="field-group">
                        <label className="field-label">
                            <span className="field-label-icon" /> Password
                        </label>
                        <div className="field-wrapper">
                            <input
                                type={showPass ? "text" : "password"}
                                className="field-input"
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setErrors((previous) => ({ ...previous, password: "" }));
                                }}
                                autoComplete="new-password"
                            />
                            <span className="field-icon"><LockIcon /></span>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPass((previous) => !previous)}
                                aria-label={showPass ? "Hide password" : "Show password"}
                            >
                                {showPass ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <span className="error-msg">⚠ {errors.password}</span>}
                    </div>

                    <div className="form-options">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(event) => {
                                    setAgreeTerms(event.target.checked);
                                    setErrors((previous) => ({ ...previous, terms: "" }));
                                }}
                            />
                            <span className="custom-checkbox"><CheckIcon /></span>
                            I agree to Terms
                        </label>

                        <a
                            type="button"
                            className="forgot-link"
                            onClick={() => navigate("/privacy-policy")}
                        >
                            Privacy Policy →
                        </a>
                    </div>

                    {errors.terms && <span className="error-msg">⚠ {errors.terms}</span>}

                    <button
                        type="submit"
                        className={`btn-signup${loading ? " loading" : ""}`}
                        disabled={loading}
                    >
                        {loading && <span className="btn-spinner" />}
                        {loading ? "CREATING ACCOUNT..." : "Sign Up"}
                    </button>
                </form>

                <div className="signup-footer">
                    Already have an account?&nbsp;
                    <Link to="/login" className="login-link">Login</Link>
                </div>
            </div>

            {showOtpModal && (
                <div className="otp-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="otp-title">
                    <div className="otp-modal-border">
                        <form className="otp-modal" onSubmit={handleVerifyOtp}>
                            <h2 className="otp-modal-title" id="otp-title">Verify Your Email</h2>

                            {preparingOtp ? (
                                <p className="otp-modal-desc">
                                    Creating your account and sending a verification code to
                                    <br />
                                    <strong>{email.trim().toLowerCase()}</strong>
                                    <br /><br />
                                    Please wait...
                                </p>
                            ) : (
                                <>
                                    <p className="otp-modal-desc">
                                        We sent a 6-digit verification code to
                                        <br />
                                        <strong>{email.trim().toLowerCase()}</strong>
                                        <br />
                                        Enter the code below to activate your account.
                                    </p>

                                    <div className="otp-input-group">
                                        <input
                                            className="otp-input"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={handleOtpChange}
                                            maxLength={6}
                                            autoFocus
                                            aria-label="6-digit verification code"
                                        />
                                    </div>
                                </>
                            )}

                            {otpError && <div className="otp-error">⚠ {otpError}</div>}

                            {otpInfo && (
                                <div style={{ color: "#00f5a0", margin: "0.8rem 0" }}>
                                    ✓ {otpInfo}
                                </div>
                            )}

                            {!preparingOtp && (
                                <div className="otp-actions">
                                    <button
                                        type="submit"
                                        className="otp-verify-btn"
                                        disabled={otpLoading || otp.length !== 6}
                                    >
                                        {otpLoading ? "VERIFYING..." : "Verify Email"}
                                    </button>

                                    <button
                                        type="button"
                                        className="otp-resend-btn"
                                        onClick={handleResendOtp}
                                        disabled={resendLoading || resendTimer > 0}
                                    >
                                        {resendLoading
                                            ? "SENDING..."
                                            : resendTimer > 0
                                                ? `Resend in ${formatTimer(resendTimer)}`
                                                : "Resend Code"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
