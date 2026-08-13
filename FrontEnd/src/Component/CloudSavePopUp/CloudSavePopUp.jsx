import { useState } from "react";
import "./CloudSavePopUp.css";

/**
 * Multi‑step popup for saving an algorithm to the cloud.
 *
 * @param {object} props
 * @param {function} props.onClose   – close the popup
 * @param {function} props.onSubmit  – called with { title, description, code, topic }
 * @param {Array<object>} props.topics – list of available topics { id, name }
 * @param {string} props.code – the algorithm source code (optional)
 */
export default function CloudSavePopup({ onClose, onSubmit, topics, code = "" }) {
    const [step, setStep] = useState(0);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [error, setError] = useState("");

    const handleTopicToggle = (topic) => {
        setSelectedTopic((prev) => (prev?.id === topic.id ? null : topic));
        setError(""); // clear error when user interacts
    };

    const handleNext = () => {
        // Validate current step
        if (step === 0 && !title.trim()) {
            setError("Please enter an algorithm title.");
            return;
        }
        if (step === 1 && !description.trim()) {
            setError("Please enter a description.");
            return;
        }
        // Clear any previous error and advance
        setError("");
        setStep((s) => s + 1);
    };

    const handleBack = () => {
        setError("");
        setStep((s) => s - 1);
    };

    const handleSubmit = () => {
        if (!selectedTopic) {
            setError("Please select a topic.");
            return;
        }
        onSubmit({
            title,
            description,
            code,
            topic: selectedTopic.id,
        });
        onClose();
    };

    const steps = [
        {
            label: "Algorithm Title",
            description: "Enter the name of your algorithm.",
            content: (
                <input
                    type="text"
                    className="cloud-save-input"
                    placeholder="e.g., Bubble Sort"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(""); }}
                    autoFocus
                />
            ),
        },
        {
            label: "Description",
            description: "Write a short description of the algorithm.",
            content: (
                <textarea
                    className="cloud-save-input"
                    placeholder="Explain what your algorithm does…"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setError(""); }}
                    rows={5}
                />
            ),
        },
        {
            label: "Topic",
            description: "Select one topic.",
            content: (
                <div className="cloud-save-pill-group">
                    {topics.map((topic) => {
                        const isSelected = selectedTopic?.id === topic.id;
                        return (
                            <button
                                key={topic.id}
                                type="button"
                                className={`cloud-save-pill ${isSelected ? "cloud-save-pill--selected" : ""}`}
                                onClick={() => handleTopicToggle(topic)}
                            >
                                {topic.name}
                            </button>
                        );
                    })}
                </div>
            ),
        },
    ];

    return (
        <div className="cloud-save-backdrop" onClick={onClose}>
            <div className="cloud-save-content" onClick={(e) => e.stopPropagation()}>
                <button aria-label="Close" className="cloud-save-close-btn" onClick={onClose}>
                    ×
                </button>

                <h2 className="cloud-save-step-title">{steps[step].label}</h2>
                <p className="cloud-save-step-desc">{steps[step].description}</p>

                {/* Validation error */}
                {error && <p className="cloud-save-error">{error}</p>}

                <form className="cloud-save-form" onSubmit={(e) => e.preventDefault()}>
                    {steps[step].content}

                    <div className="cloud-save-buttons">
                        {step > 0 && (
                            <button type="button" className="cloud-save-btn cloud-save-btn--back" onClick={handleBack}>
                                ← Back
                            </button>
                        )}
                        {step < steps.length - 1 ? (
                            <button type="button" className="cloud-save-btn cloud-save-btn--next" onClick={handleNext}>
                                Next →
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="cloud-save-btn cloud-save-btn--submit"
                                onClick={handleSubmit}
                                disabled={!selectedTopic}
                            >
                                Save Algorithm
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}