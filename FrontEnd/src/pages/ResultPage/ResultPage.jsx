import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ASTnode } from "../../Compiler/ASTNode";
import { ResultManager } from "../../Component/ResultManager/ResultManager";
import { FlowchartCanvas } from "./FlowchartCanvas";
import { useAuth } from "../../hooks/useAuth";
import { SaveIcon } from "../../assets/Icons/Icon";   // ← import save icon
import "./ResultPage.css";

const resultManager = new ResultManager();

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    // Always call hooks at the top
    const ast = location.state?.ast ?? null;

    const { result, error } = useMemo(() => {
        if (!ast) return { result: null, error: null };
        try {
            return { result: resultManager.build(ast), error: null };
        } catch (buildError) {
            return {
                result: null,
                error:
                    buildError instanceof Error
                        ? buildError
                        : new Error("An unknown error occurred while building the flowchart."),
            };
        }
    }, [ast]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // While auth state is loading
    if (loading) {
        return (
            <main className="result-page">
                <div className="result-page__message">Checking authentication...</div>
            </main>
        );
    }

    // If not authenticated, render nothing (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    // No AST provided
    if (!ast) {
        return (
            <main className="result-page">
                <div className="result-page__message">
                    No compiled AST was provided.
                </div>
            </main>
        );
    }

    // Error building flowchart
    if (error) {
        return (
            <main className="result-page">
                <div className="result-page__error" role="alert">
                    {error.message}
                </div>
            </main>
        );
    }

    // Render the flowchart with a Save button (placeholder, does nothing)
    return (
        <main className="result-page">
            {/* Optional header bar with a save button */}
            <div className="result-page__header">
                <button
                    className="save-flowchart-btn"
                    disabled  // makes it look inactive, can be removed later
                    title="Save functionality coming soon"
                >
                    <SaveIcon />
                    Save Flowchart
                </button>
            </div>
            <FlowchartCanvas nodes={result.nodes} edges={result.edges} />
        </main>
    );
}