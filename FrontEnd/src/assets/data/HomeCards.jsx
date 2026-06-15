import { AddIcon, ShowIcon, HelpIcon } from "../../assets/Icons/Icon";
export const menuItems = [
        // {   // profile card
        //     id: 1,
        //     title: "Profile",
        //     description: "Manage your account settings and preferences",
        //     icon: <ProfileIcon />,
        //     path: "/profile",
        //     color: "#00d4ff",
        //     stats: "View Profile"
        // },
        {   // instructions card
            id:2,
            title: "Help & Info",
            description: "Get help and learn about AlgoVisual",
            icon: <HelpIcon />,
            path: "/help",
            color: "#f59e0b",
            stats: "Learn More",
        },
        {   // show build-in algorithms
            id: 3,
            title: "Show Algorithms",
            description: "Browse and view many existing algorithms",
            icon: <ShowIcon />,
            path: "/algorithms",
            color: "#8b5cf6",
            stats: "View All",
        },
        {   // algorithm builder card
            id: 4,
            title: "Add Algorithm",
            description: "Build ,Test and upload new algorithms",
            icon: <AddIcon />,
            path: "/add-algorithm",
            color: "#00f5a0",
            stats: "New Algorithm",

        },
    ];
