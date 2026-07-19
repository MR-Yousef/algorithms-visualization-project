import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ASTnode } from "../../Compiler/ASTNode";
import { ResultManager } from "../../Component/ResultManager/ResultManager";
import { FlowchartCanvas } from "./FlowchartCanvas";
import "./ResultPage.css"
const resultManager = new ResultManager();

/**
 * Displays the flowchart generated from an already compiled AST.
 *
 * The input page is responsible for compilation.
 * This page is responsible for all subsequent flowchart stages.
 *
 * @param {{ast: ASTnode}} props
 */
export default function ResultPage() {
    // useLocation hook is used to access the current location object, 
    // which contains information about the current URL and state passed through navigation.
    const location = useLocation();
    const ast = location.state?.ast ?? null;
    // useMemo is used to memoize the result of the flowchart building process,
    // so that it only re-runs when the AST changes. 
    // This avoids unnecessary recalculations and improves performance.
    const { result, error } = useMemo(() => {
        if (!ast)
            return { result: null, error: null };
        try {
            return { result: resultManager.build(ast), error: null };
        }
        catch (buildError) {
            return { result: null, error: buildError instanceof Error ? buildError : new Error("An unknown error occurred while building the flowchart.") };
        }
    }, [ast]);
    // render different content based on the presence of the AST and any errors that occurred during flowchart building
    if (!ast) {
        return (
            <main className="result-page">
                <div className="result-page__message">
                    No compiled AST was provided.
                </div>
            </main>
        );
    }
    // if an error occurred during flowchart building, display the error message
    if (error) {
        return (
            <main className="result-page">
                <div className="result-page__error" role="alert">
                    {error.message}
                </div>
            </main>);
    }
    // if the flowchart was built successfully, render the FlowchartCanvas with the generated nodes and edges
    return (
        <main className="result-page">
            <FlowchartCanvas nodes={result.nodes} edges={result.edges} />
        </main>
    );
}