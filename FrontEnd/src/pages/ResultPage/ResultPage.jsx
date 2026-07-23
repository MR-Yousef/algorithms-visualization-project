import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ASTnode } from "../../Compiler/ASTNode";
import { ResultManager } from "../../Component/ResultManager/ResultManager";
import { FlowchartCanvas } from "./FlowchartCanvas";
import { useAuth } from "../../hooks/useAuth";
import "./ResultPage.css";

const resultManager = new ResultManager();

/**
 * Displays the flowchart generated from an already compiled AST.
 *
 * The input page is responsible for compilation.
 * This page is responsible for all subsequent flowchart stages.
 */
export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    // Always call hooks at the top, before any conditional return
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

    // While auth state is loading, show a simple message
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

    // Original rendering logic (unchanged)
    if (!ast) {
        return (
            <main className="result-page">
                <div className="result-page__message">
                    No compiled AST was provided.
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="result-page">
                <div className="result-page__error" role="alert">
                    {error.message}
                </div>
            </main>
        );
    }

    return (
        <main className="result-page">
            <FlowchartCanvas nodes={result.nodes} edges={result.edges} />
        </main>
    );
}