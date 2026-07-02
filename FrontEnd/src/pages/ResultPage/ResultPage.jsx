import "./ResultPage.css"
import Header from "../../Component/Header/Header"
import Background  from "../../Component/Background/Background"
function ResultPage(){
    return(
        <div className="result-page-container">
            <Background noAnimation={true}/>
            <Header/>
            
        </div>
    )
}
export default ResultPage ;