import './Header.css'
import { useNavigate } from "react-router-dom";
import { IconProfile } from "../Icons/Icon";
function Header() {
    const navigate = useNavigate();
    return (<>

        <header className="home-header">
            <div className="header-left">
                <span className="logo-icon">✦</span>
                <span className="logo-text">AlgoVisual</span>
            </div>
            <div className="header-right">
                <button className="header-btn" onClick={() => navigate("/profile")}>
                    <IconProfile />
                    <span>Profile</span>
                </button>
            </div>
        </header>

    </>)
}

export default Header;