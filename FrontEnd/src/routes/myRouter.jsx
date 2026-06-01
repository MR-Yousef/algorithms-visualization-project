// src/router.js
import { createBrowserRouter } from "react-router-dom";
import Welcome from "../pages/Welcome/Welcome";
import Home from "../pages/Home/Home";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
const myRouter = createBrowserRouter([
    {
        path: '/',
        element: <Welcome />
    },
    {
        path: "/home",
        element: <Home />,
    },
    {
        path: '/signup',
        element: <Signup />
    },
    {
        path: '/login',
        element: <Login />
    }
]);

export default myRouter;
