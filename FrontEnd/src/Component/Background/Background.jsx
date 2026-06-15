import "./Background.css";
import { NodesNetworkImg } from "../../assets/Images/Images";
function Background() {return ( 
    <div className="home-canvas">
        <div className="mesh-wave" />
        <NodesNetworkImg />
        <div className="center-glow" />
        <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
                <div key={i} className="particle" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`
                }} />
            ))}
        </div>
    </div>
    );}
export default Background;