// src/App.jsx
import React from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import myRouter from './routes/myRouter';
import { AuthProvider } from './context/AuthContext'; // 👈 ADD THIS

function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={myRouter} />
      </AuthProvider>
    </>
  );
}

export default App;