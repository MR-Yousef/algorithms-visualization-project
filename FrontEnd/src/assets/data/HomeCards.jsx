import { AddIcon, ShowIcon, HelpIcon } from "../../assets/Icons/Icon";
export const menuItems = [
    {   // algorithm builder card
        id: 1,
        title: "Add Algorithm",
        description: "Build ,Test and upload new algorithms",
        icon: <AddIcon />,
        path: "/InputAlgo",
        color: "#00f5a0",
        stats: "New Algorithm",

    },
    {   // show build-in algorithms
        id: 2,
        title: "Show Algorithms",
        description: "Browse and view many existing algorithms",
        icon: <ShowIcon />,
        path: "/show-algorithms",
        color: "#8b5cf6",
        stats: "View All",
    },
    {   // instructions card
        id: 3,
        title: "Help & Info",
        description: "Get help and learn about AlgoHub",
        icon: <HelpIcon />,
        path: "/help",
        color: "#f59e0b",
        stats: "Learn More",
    },
];
