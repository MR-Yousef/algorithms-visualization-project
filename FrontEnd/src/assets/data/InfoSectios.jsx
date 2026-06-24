// src/assets/data/InfoSectios.js
import { BookIcon, FlowchartIcon, InputMethod, ProfileIcon } from "../Icons/Icon";

/*
  These four objects define the cards on the Help page.
  The first three receive their real content from the API.
  The "details" field here is only a fallback (shown while loading or if no API data exists).
  The Roles & Permissions card is fully static and never uses API data.
*/

export const sections = [
    {
        title: "Language Guide",
        description: "Pseudo-code syntax, keywords and grammar rules.",
        icon: <BookIcon color="#4FC3F7" />,
        details: null   // will be replaced by fetched data
    },
    {
        title: "Flowchart Guide",
        description: "Understand the generated flowchart symbols.",
        icon: <FlowchartIcon />,
        details: null
    },
    {
        title: "Input Methods",
        description: "Text input, file upload and drag & drop blocks.",
        icon: <InputMethod />,
        details: null
    },
    {
        title: "Roles & Permissions",
        description: "Participant roles and permissions.",
        icon: <ProfileIcon color="#4FC3F7" />,
        // this card is always the same, no API replacement
        details: (
            <>
                <p>AlgoVisual uses a role‑based access system.</p>
                <h3>Roles</h3>
                <ul>
                    <li><strong>User</strong> – browse and run algorithms.</li>
                    <li><strong>Contributor</strong> – create and manage own algorithms.</li>
                    <li><strong>Admin</strong> – full system control.</li>
                </ul>
                <h3>Permissions overview</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #00f5e4' }}>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Action</th>
                            <th>User</th>
                            <th>Contributor</th>
                            <th>Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>View algorithms</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Run algorithms</td><td>✔️</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Create algorithm</td><td>❌</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Edit own algorithm</td><td>❌</td><td>✔️</td><td>✔️</td></tr>
                        <tr><td>Delete any algorithm</td><td>❌</td><td>❌</td><td>✔️</td></tr>
                        <tr><td>Manage users</td><td>❌</td><td>❌</td><td>✔️</td></tr>
                    </tbody>
                </table>
            </>
        )
    }
];