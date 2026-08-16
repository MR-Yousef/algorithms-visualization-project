import { useMemo, useState } from "react";
import "./CloudSavePopUp.css";

export default function CloudSavePopup({
    onClose,
    onSubmit,
    topics = [],
    topicsLoading = false,
    topicsError = "",
    code = "",
}) {
    const [step, setStep] = useState(0);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const normalizedTopics = useMemo(() => {
        return topics
            .map((topic) => ({
                id: topic?.id ?? topic?.pk,
                name:
                    topic?.name ??
                    topic?.title ??
                    topic?.topic_name ??
                    topic?.label ??
                    "Unnamed topic",
            }))
            .filter((topic) => topic.id !== undefined && topic.id !== null);
    }, [topics]);

    const handleTopicToggle = (topic) => {
        setSelectedTopics((previous) => {
            const exists = previous.some(
                (selected) => String(selected.id) === String(topic.id)
            );

            if (exists) {
                return previous.filter(
                    (selected) => String(selected.id) !== String(topic.id)
                );
            }

            return [...previous, topic];
        });
        setError("");
    };

    const handleNext = () => {
        if (step === 0 && !title.trim()) {
            setError("Please enter an algorithm title.");
            return;
        }

        if (step === 1 && !description.trim()) {
            setError("Please enter a description.");
            return;
        }

        setError("");
        setStep((previous) => previous + 1);
    };

    const handleBack = () => {
        setError("");
        setStep((previous) => Math.max(0, previous - 1));
    };

    const handleSubmit = async () => {
        if (selectedTopics.length === 0) {
            setError("Please select at least one topic.");
            return;
        }

        setError("");
        setSaving(true);

        try {
            const success = await onSubmit({
                title: title.trim(),
                description: description.trim(),
                code,
                topics: selectedTopics.map((topic) => topic.id),
            });

            if (success !== false) {
                onClose();
            }
        } catch (submitError) {
            setError(submitError.message || "Failed to save algorithm.");
        } finally {
            setSaving(false);
        }
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
                    onChange={(event) => {
                        setTitle(event.target.value);
                        setError("");
                    }}
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
                    placeholder="Explain what your algorithm does..."
                    value={description}
                    onChange={(event) => {
                        setDescription(event.target.value);
                        setError("");
                    }}
                    rows={5}
                />
            ),
        },
        {
            label: "Topics",
            description: "Select one or more topics.",
            content: (
                <div>
                    {topicsLoading && (
                        <p className="cloud-save-loading">Loading topics...</p>
                    )}

                    {!topicsLoading && topicsError && (
                        <p className="cloud-save-error">{topicsError}</p>
                    )}

                    {!topicsLoading && !topicsError && normalizedTopics.length === 0 && (
                        <p className="cloud-save-error">No topics are available.</p>
                    )}

                    {!topicsLoading && normalizedTopics.length > 0 && (
                        <div className="cloud-save-pill-group">
                            {normalizedTopics.map((topic) => {
                                const selected = selectedTopics.some(
                                    (item) => String(item.id) === String(topic.id)
                                );

                                return (
                                    <button
                                        key={topic.id}
                                        type="button"
                                        className={`cloud-save-pill ${selected ? "cloud-save-pill--selected" : ""}`}
                                        onClick={() => handleTopicToggle(topic)}
                                    >
                                        {topic.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedTopics.length > 0 && (
                        <p className="cloud-save-selected-summary">
                            Selected: {selectedTopics.map((topic) => topic.name).join(", ")}
                        </p>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="cloud-save-backdrop" onClick={saving ? undefined : onClose}>
            <div className="cloud-save-content" onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    aria-label="Close"
                    className="cloud-save-close-btn"
                    onClick={onClose}
                    disabled={saving}
                >
                    ×
                </button>

                <h2 className="cloud-save-step-title">{steps[step].label}</h2>
                <p className="cloud-save-step-desc">{steps[step].description}</p>
                <p className="cloud-save-step-counter">Step {step + 1} of {steps.length}</p>

                {error && <p className="cloud-save-error">{error}</p>}

                <form className="cloud-save-form" onSubmit={(event) => event.preventDefault()}>
                    {steps[step].content}

                    <div className="cloud-save-buttons">
                        {step > 0 && (
                            <button
                                type="button"
                                className="cloud-save-btn cloud-save-btn--back"
                                onClick={handleBack}
                                disabled={saving}
                            >
                                ← Back
                            </button>
                        )}

                        {step < steps.length - 1 ? (
                            <button
                                type="button"
                                className="cloud-save-btn cloud-save-btn--next"
                                onClick={handleNext}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="cloud-save-btn cloud-save-btn--submit"
                                onClick={handleSubmit}
                                disabled={saving || topicsLoading || selectedTopics.length === 0}
                            >
                                {saving ? "Saving..." : "Save Algorithm"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
