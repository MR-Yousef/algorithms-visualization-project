import './Header.css'
import { useNavigate,Link } from "react-router-dom";
import { ProfileIcon } from "../../assets/Icons/Icon";
function Header() {
    const navigate = useNavigate();
    const handelLogoClick = () => {
        navigate("/home");
    }
    return (<>

        <header className="home-header">
            <div className="header-left">
                <span className="logo-icon">✦</span>
                <span className="logo-text" onClick={handelLogoClick}>
                    AlgoVisual
                </span>
            </div>
            <div className="header-right">
                <button className="header-btn" onClick={() => navigate("/profile")}>
                    <ProfileIcon />
                    <span>Profile</span>
                    <Link to="/profile"></Link>
                </button>
            </div>
        </header>

    </>)
}

export default Header;