// This file defines the Error class, which is used to represent errors that occur during the compilation process.
// The Error class has properties for the error type, error line, and error message .
// It has methods to set and get these properties. 
// This allows the compiler to create and manage error objects when it encounters issues in the source code being compiled.
export class Error{
    // The constructor initializes the error object with default values for error type, error line, and error message.
    constructor(errorType = "defaultError",errorLine = -1 ,errorMessage = "defaultErrorMessage"){
        this.errorType = errorType ;
        this.errorLine = errorLine ;
        this.errorMessage = errorMessage ;
    }
    // The following methods are used to set the properties of the error object.
    setErrorType(errorType){
        this.errorType = errorType ;
    }
    setErrorLine(errorLine){
        this.errorLine = errorLine ;
    }
    setErrorMessage(errorMessage){
        this.errorMessage = errorMessage ;
    }
    // The following methods are used to get the properties of the error object.
    getErrorType(){
        return this.errorType ;
    }
    getErrorLine(){
        return this.errorLine ;
    }
    getErrorMesssage(){
        return this.errorMessage ;
    }
}