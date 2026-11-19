import { BookIcon, FlowchartIcon, InputMethod, ProfileIcon } from "../Icons/Icon";

export const sections = [
    {
        title: "Language Guide",
        description: "Pseudo-code syntax, keywords and grammar rules.",
        icon: <BookIcon color="#4FC3F7" />,
        details: null,
    },
    {
        title: "Flowchart Guide",
        description: "Understand the generated flowchart symbols.",
        icon: <FlowchartIcon />,
        details: null,
    },
    {
        title: "Input Methods",
        description: "Text input, .txt file upload and the upcoming Block Editor.",
        icon: <InputMethod />,
        details: null,
    },
    {
        title: "Roles & Permissions",
        description: "Participant roles and permissions.",
        icon: <ProfileIcon color="#4FC3F7" />,
        details: (
            <>
                <h3>Roles</h3>
                <ul>
                    <li><strong>User</strong> – browse, run, save and unsave published algorithms.</li>
                    <li><strong>Contributor</strong> – create and delete their own algorithms.</li>
                    <li><strong>Admin</strong> – system administration according to backend permissions.</li>
                </ul>

                <h3>Permissions overview</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #00f5e4" }}>
                            <th style={{ textAlign: "left", padding: "0.5rem" }}>Action</th>
                            <th>User</th>
                            <th>Contributor</th>
                            <th>Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>View algorithms</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Run algorithms</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Save / unsave algorithms</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Create own algorithm</td><td>❌</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Delete own algorithm</td><td>❌</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Manage users</td><td>❌</td><td>❌</td><td>✔️</td></tr>
                    </tbody>
                </table>
            </>
        ),
    },
];
