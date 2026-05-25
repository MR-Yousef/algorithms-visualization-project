// components
import React from "react";
import "./App.css" ;
import { RouterProvider } from "react-router-dom";
import myRouter from './assets/myRouter'
function App() {
  return (
    <>
      <RouterProvider router={myRouter} />
    </>
  );
}

export default App;

