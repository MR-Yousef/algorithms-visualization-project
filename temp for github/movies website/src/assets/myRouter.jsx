// src/router.js
import { createBrowserRouter } from "react-router-dom";
import Welcome from "../pages/Welcome/welcome";
import Home from "../pages/Home/Home";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import Favorites from "../pages/Favorites/Favorites";
const myRouter = createBrowserRouter([
    {
        path:'/',
        element :<Welcome/>
    },
    {
        path: "/home",
        element: <Home />,
    },
    {
        path: "/favorites",
        element:<Favorites/>,
    },
    {
        path:'/signup',
        element :<Signup/>
    },
    {
        path:'/login',
        element:<Login/>
    }
]);

export default myRouter;
