import React, { useState } from "react";
import PropTypes from "prop-types";
import './AddMoviePopupCard.css';
import movies from "../../assets/testData/filmes";
function AddMoviePopupCard({ onClose, onSubmit, categories }) {
    // states variables for handling input 
    const [step, setStep] = useState(0);
    const [title, setTitle] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [poster, setPoster] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [actors, setActors] = useState(['']);

    // handling categories adding and removing
    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]);
    };
    //
    const handleActorChange = (index, value) => {
        const updated = [...actors];
        updated[index] = value;
        setActors(updated);
    };

    const addActorField = () => {
        setActors([...actors, '']);
    };

    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);

    const handleSubmit = () => {
        onSubmit({
            title,
            releaseYear,
            poster,
            description,
            categories: selectedCategories,
            actors: actors.filter(a => a.trim() !== '')
        });
        movies.push({poster:poster,
                    title:title,
                    actors:actors,
                    releaseYear:releaseYear,
                    categories:selectedCategories,
                    isFavorite:false,
                    id:movies[movies.length-1].id+1,
                    description:description});
        onClose();
    };

    const steps = [
        {
            label: "🎬 Movie Title",
            description: "Enter the name of the movie.",
            element: (
                <input
                    type="text"
                    value={title}
                    placeholder="e.g. Inception"
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            )
        },
        {
            label: "📅 Release Year",
            description: "Enter the year the movie was released.",
            element: (
                <input
                    type="number"
                    value={releaseYear}
                    placeholder="e.g. 2010"
                    onChange={(e) => setReleaseYear(e.target.value)}
                    required
                />
            )
        },
        {
            label: "🖼️ Poster Link",
            description: "Paste a URL for the movie poster.",
            element: (
                <input
                    type="text"
                    value={poster}
                    placeholder="https://example.com/poster.jpg"
                    onChange={(e) => setPoster(e.target.value)}
                    required
                />
            )
        },
        {
            label: "📝 Description",
            description: "Write a short description of the movie.",
            element: (
                <textarea
                    value={description}
                    placeholder="A mind-bending sci-fi thriller..."
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            )
        },
        {
            label: "🎭 Categories",
            description: "Select one or more genres.",
            element: (
                <div className="category-pill-group">
                    {categories.map((cat) => (
                        <button
                            type="button"
                            key={cat}
                            className={`category-pill ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                            onClick={() => handleCategoryToggle(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )
        },
        {
            label: "👥 Actors",
            description: "Add the main actors. Add more if needed.",
            element: (
                <div>
                    {actors.map((actor, index) => (
                        <input
                            key={index}
                            type="text"
                            placeholder={`Actor ${index + 1}`}
                            value={actor}
                            onChange={(e) => handleActorChange(index, e.target.value)}
                        />
                    ))}
                    <button type="button" onClick={addActorField}>
                        + Add Another Actor
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="popup-backdrop" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button aria-label="Close" onClick={onClose} className="close-button">
                    &times;
                </button>
                <h2>{steps[step].label}</h2>
                <p style={{ marginBottom: '1rem', color: '#FFD700' }}>
                    {steps[step].description}
                </p>
                <form onSubmit={(e) => e.preventDefault()} className="add-movie-form">
                    {steps[step].element}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                        {step > 0 && (<button type="button" onClick={handleBack}>⬅ Back</button>)}
                        {step < steps.length - 1 ? (<button type="button" onClick={handleNext}>Next ➡</button>)
                            :(<button type="button" onClick={handleSubmit}>✅ Submit</button>)}
                    </div>
                </form>
            </div>
        </div>
    );
}

AddMoviePopupCard.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default AddMoviePopupCard;
