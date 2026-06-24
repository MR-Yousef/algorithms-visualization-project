import "./Help.css";
import InfoCard from "../../Component/InfoCard/InfoCard";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background"
import { sections } from "../../assets/data/InfoSectios";
import { BookIcon } from "../../assets/Icons/Icon";
/* 
help info page that contains the documentation of the system
It is divided into sections that explain : 
    different aspects of the system
    such as the language guide
    flowchart guide, input methods
    website guide
    roles & permissions and FAQ.
Each section has a title, description and an icon that represents it. 
The sections are displayed in a grid layout for easy navigation and readability. 
 */
export default function Help() {
    return (<>
        
        <Header />
        <div className="help-main">
            <div className="help-title-section">
                <h1 className="help-main-title">
                    <span className="title-icon"><BookIcon /></span>
                    Help & Documentation
                </h1>
                <p className="help-subtitle">
                    learn more about our system  
                </p>
            </div>
            <div className="info-cards-grid">
                {sections.map((item, index) => (
                    <InfoCard
                        index={index}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        key={index}
                    />
                ))}
            </div>
        </div>
    </>);
}