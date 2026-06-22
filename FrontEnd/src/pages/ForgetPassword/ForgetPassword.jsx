import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgetPassword.css";
import { ENDPOINTS } from "../../config/api.config";
import { ArrowRightIcon, LockIcon, MailIcon, CheckIcon } from "../../assets/Icons/Icon";

/**
 * ForgotPassword – A three‑step password reset flow.
 * Step 1 : User enters email → an OTP is sent.
 * Step 2 : User enters the OTP → verified by the server.
 * Step 3 : User enters a new password (with confirmation) → password is reset.
 */
export default function ForgotPassword() {
    const navigate = useNavigate();

    // Current step (1, 2, or 3)
    const [step, setStep] = useState(1);
    // Form fields
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // Feedback messages
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // ─── Step 1 : Send OTP to the provided email ────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Basic client‑side validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(ENDPOINTS.FORGOT_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.detail || data.email?.[0] || "Failed to send OTP.");
            }

            setSuccess("OTP sent to your email.");
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ─── Step 2 : Verify the OTP ────────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!otp) {
            setError("Please enter the OTP.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(ENDPOINTS.VERIFY_OTP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: otp }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.detail || data.code?.[0] || "Invalid OTP.");
            }

            setSuccess("OTP verified.");
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ─── Step 3 : Set a new password ────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Client‑side validation
        if (!newPassword || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }
        // Password strength check
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
            setError("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(ENDPOINTS.RESET_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    code: otp,
                    new_password: newPassword,
                    confirm_password: confirmPassword,   // Matches backend expectation
                }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.detail || data.new_password?.[0] || "Failed to reset password.");
            }

            setSuccess("Password reset successful! Redirecting to login...");
            // Automatically redirect to login after a short delay
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ─── Navigate back to previous step ──────────────────────────────────────
    const goBack = () => {
        setError("");
        setSuccess("");
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="forgot-password-page">
            {/* Animated background */}
            <div className="forgot-canvas">
                <div className="mesh-wave" />
                <div className="center-glow" />
            </div>

            {/* Main card */}
            <div className="forgot-card">
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />

                <div className="forgot-content">
                    <h2 className="forgot-title">Reset Password</h2>

                    {/* Visual step indicators */}
                    <div className="step-indicators">
                        <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
                        <div className="step-line" />
                        <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
                        <div className="step-line" />
                        <div className={`step-dot ${step >= 3 ? "active" : ""}`}>3</div>
                    </div>

                    {/* Error / Success feedback */}
                    {error && <div className="error-msg">{error}</div>}
                    {success && <div className="success-msg">{success}</div>}

                    {/* Step 1: Email input */}
                    {step === 1 && (
                        <form className="forgot-form" onSubmit={handleSendOtp}>
                            <div className="field-group">
                                <label className="field-label">
                                    <span className="field-label-icon" />
                                    Email Address
                                </label>
                                <div className="field-wrapper">
                                    <input
                                        type="email"
                                        className="field-input"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <span className="field-icon"><MailIcon /></span>
                                </div>
                            </div>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? "Sending..." : <><ArrowRightIcon /> Send OTP</>}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP input */}
                    {step === 2 && (
                        <form className="forgot-form" onSubmit={handleVerifyOtp}>
                            <p className="email-display">
                                OTP sent to <strong>{email}</strong>
                            </p>
                            <div className="field-group">
                                <label className="field-label">
                                    <span className="field-label-icon" />
                                    Verification Code
                                </label>
                                <div className="field-wrapper">
                                    <input
                                        type="text"
                                        className="field-input"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                    <span className="field-icon"><LockIcon /></span>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-back" onClick={goBack}>
                                    Back
                                </button>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? "Verifying..." : <><CheckIcon /> Verify OTP</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New password */}
                    {step === 3 && (
                        <form className="forgot-form" onSubmit={handleResetPassword}>
                            <p className="email-display">
                                Resetting password for <strong>{email}</strong>
                            </p>
                            <div className="field-group">
                                <label className="field-label">
                                    <span className="field-label-icon" />
                                    New Password
                                </label>
                                <div className="field-wrapper">
                                    <input
                                        type="password"
                                        className="field-input"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <span className="field-icon"><LockIcon /></span>
                                </div>
                            </div>
                            <div className="field-group">
                                <label className="field-label">
                                    <span className="field-label-icon" />
                                    Confirm New Password
                                </label>
                                <div className="field-wrapper">
                                    <input
                                        type="password"
                                        className="field-input"
                                        placeholder="Re-enter new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <span className="field-icon"><LockIcon /></span>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-back" onClick={goBack}>
                                    Back
                                </button>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? "Resetting..." : <><CheckIcon /> Reset Password</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Footer link back to login */}
                    <div className="forgot-footer">
                        <a href="/login">← Back to Login</a>
                    </div>
                </div>
            </div>
        </div>
    );
}