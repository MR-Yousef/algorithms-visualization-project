import { useState } from "react";
import "./Help.css";
import InfoCard from "../../Component/InfoCard/InfoCard";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import { sections } from "../../assets/data/InfoSectios";
import { BookIcon, BackIcon } from "../../assets/Icons/Icon";

export default function Help() {
    const [selectedSection, setSelectedSection] = useState(null);

    return (
        <>
            <Background />
            <Header />
            <div className="help-main">
                <div className="help-title-section">
                    <h1 className="help-main-title">
                        <span className="title-icon"><BookIcon /></span>
                        Help & Documentation
                    </h1>
                    <p className="help-subtitle">
                        Click on a topic to view the full guide.
                    </p>
                </div>

                <div className="info-cards-grid">
                    {sections.map((item, index) => (
                        <div
                            key={index}
                            className="info-card-wrapper"
                            onClick={() => setSelectedSection(item)}
                        >
                            <InfoCard
                                index={index}
                                icon={item.icon}
                                title={item.title}
                                description={item.description}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for detailed documentation */}
            {selectedSection && (
                <div className="modal-overlay" onClick={() => setSelectedSection(null)}>
                    <div
                        className="modal-content help-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <span className="modal-icon">{selectedSection.icon}</span>
                            <h2 className="modal-title">{selectedSection.title}</h2>
                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedSection(null)}
                            >
                                <BackIcon />
                            </button>
                        </div>
                        <div className="modal-body documentation-body">
                            {selectedSection.details}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}