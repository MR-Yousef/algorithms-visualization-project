// src/router.js
import { createBrowserRouter } from "react-router-dom";
import Welcome from "../pages/Welcome/Welcome";
import Help from "../pages/Help/Help";
import Home from "../pages/Home/Home";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import Profile from "../pages/Profile/Profile";
import InputAlgo from "../pages/InputAlgo/InputAlgo";
import ResultPage from "../pages/ResultPage/ResultPage"
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
    },
    {
        path:'/help',
        element: <Help/>
    },
    {
        path:'/profile',
        element:<Profile/>
    },
    {
        path :'/InputAlgo',
        element :<InputAlgo/>
    },
    {
        path:'/resultPage',
        element:<ResultPage/>
    }
]);

export default myRouter;
