import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import "./Privacy.css";
import { ShieldIcon, BackIcon, BookIcon } from "../../assets/Icons/Icon";

/**
 * Privacy Policy page – explains how AlgoHub handles user data.
 */
export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="privacy-page">
            {/* Animated Background */}
            <Background />


            <main className="privacy-main">
                <div className="privacy-card">
                    <span className="neon-border neon-tl" />
                    <span className="neon-border neon-tr" />
                    <span className="neon-border neon-bl" />
                    <span className="neon-border neon-br" />

                    <div className="privacy-content">
                        <h1 className="privacy-title">
                            <ShieldIcon />
                            Privacy Policy
                        </h1>

                        <div className="privacy-body">
                            <p>
                                <strong>Last updated:</strong> June 2026
                            </p>

                            <section>
                                <h2>1. Information We Collect</h2>
                                <p>
                                    When you register for AlgoHub, we may collect your username,
                                    email address, and any profile information you choose to provide
                                    (such as a biography or avatar). If you upload or create algorithms,
                                    the code and associated metadata are stored on our servers.
                                </p>
                                <p>
                                    We also automatically collect certain technical data when you visit
                                    the site, such as your IP address, browser type, and usage patterns
                                    through standard server logs and analytics tools.
                                </p>
                            </section>

                            <section>
                                <h2>2. How We Use Your Data</h2>
                                <p>
                                    Your personal information is used solely to provide and improve the
                                    AlgoHub service. This includes:
                                </p>
                                <ul>
                                    <li>Managing your account and authentication</li>
                                    <li>Displaying your public profile and contributed algorithms</li>
                                    <li>Analyzing site usage to improve performance and user experience</li>
                                    <li>Responding to your inquiries or support requests</li>
                                </ul>
                            </section>

                            <section>
                                <h2>3. Sharing Your Information</h2>
                                <p>
                                    We do not sell, trade, or rent your personal information to third
                                    parties. Your data may be shared only in the following circumstances:
                                </p>
                                <ul>
                                    <li>With your explicit consent</li>
                                    <li>To comply with legal obligations</li>
                                    <li>To protect the rights, property, or safety of AlgoHub, its users, or the public</li>
                                </ul>
                            </section>

                            <section>
                                <h2>4. Cookies</h2>
                                <p>
                                    AlgoHub uses essential cookies to keep you signed in and to remember
                                    your preferences (such as "Remember Me"). We do not use third‑party
                                    tracking cookies for advertising purposes.
                                </p>
                            </section>

                            <section>
                                <h2>5. Data Security</h2>
                                <p>
                                    We implement industry‑standard security measures to protect your data
                                    against unauthorized access, alteration, or destruction. However, no
                                    method of transmission over the Internet is 100% secure, and we cannot
                                    guarantee absolute security.
                                </p>
                            </section>

                            <section>
                                <h2>6. Your Rights</h2>
                                <p>
                                    Depending on your jurisdiction, you may have the right to:
                                </p>
                                <ul>
                                    <li>Access the personal data we hold about you</li>
                                    <li>Request correction or deletion of your data</li>
                                    <li>Object to or restrict certain processing activities</li>
                                    <li>Withdraw consent at any time (where processing is based on consent)</li>
                                </ul>
                                <p>
                                    To exercise these rights, please contact us using the information below.
                                </p>
                            </section>

                            <section>
                                <h2>7. Changes to This Policy</h2>
                                <p>
                                    We may update this privacy policy from time to time. Any changes will be
                                    posted on this page, and we will update the "Last updated" date
                                    accordingly.
                                </p>
                            </section>

                            <section>
                                <h2>8. Contact Us</h2>
                                <p>
                                    If you have any questions about this privacy policy or our data
                                    practices, please contact us at:
                                </p>
                                <p>
                                    <strong>Email:</strong> privacy@algohub.com<br />
                                </p>
                            </section>
                        </div>

                        {/* Back to Home */}
                        <div className="privacy-footer">
                            <button className="back-btn" onClick={() => navigate('/signup')}>
                                <BackIcon />
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}