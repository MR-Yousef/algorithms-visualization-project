import { BookIcon, FlowchartIcon, InputMethod, WebsiteGuodeIcon, ProfileIcon, FAQIcon } from "../Icons/Icon";

export const sections = [
    {
        title: "Language Guide",
        description: "Pseudo-code syntax, keywords and grammar rules.",
        icon: <BookIcon color="#4FC3F7" />,
        details: (
            <>
                <p>Our platform uses a simple pseudo-code language to describe algorithms. Below you’ll find the basic syntax, keywords, and examples.</p>

                <h3>Basic Commands</h3>
                code

                <h3>Notes</h3>
                <ul>
                    <li>All statements must be on separate lines.</li>
                    <li>Indentation is optional but recommended for readability.</li>
                    <li>Variable names are case‑sensitive.</li>
                </ul>
            </>
        )
    },
    {
        title: "Flowchart Guide",
        description: "Understand the generated flowchart symbols.",
        icon: <FlowchartIcon />,
        details: (
            <>
                <p>Flowcharts provide a visual representation of algorithm logic. The system generates them automatically from your pseudo‑code, but you can also create them manually using the following standard shapes:</p>

                <h3>Symbols</h3>
                <ul>
                    <li><strong>Oval</strong> – Start / End</li>
                    <li><strong>Rectangle</strong> – Process (e.g., assignment)</li>
                    <li><strong>Diamond</strong> – Decision (if/else)</li>
                    <li><strong>Parallelogram</strong> – Input / Output</li>
                    <li><strong>Arrow</strong> – Flow direction</li>
                </ul>

                <h3>How to create a flowchart</h3>
                <ol>
                    <li>Open the Flowchart Editor from the algorithm page.</li>
                    <li>Drag shapes from the toolbar onto the canvas.</li>
                    <li>Connect them with arrows to define the flow.</li>
                    <li>Double‑click any shape to edit its text.</li>
                    <li>Use the “Auto‑arrange” button for a clean layout.</li>
                </ol>
            </>
        )
    },
    {
        title: "Input Methods",
        description: "Text input, file upload and drag & drop blocks.",
        icon: <InputMethod />,
        details: (
            <>
                <p>You can supply input to your algorithms in several ways, depending on what the algorithm expects:</p>

                <h3>Manual Entry</h3>
                <p>Type the required values directly into the text field when prompted. Separate multiple values with spaces or new lines.</p>

                <h3>File Upload</h3>
                <p>Upload a <code>.txt</code> file containing the input data. The first row may optionally contain column headers.</p>

                <h3>Random Generator</h3>
                <p>Let the system generate random integer values within a specified range. This is useful for testing algorithms with large datasets without manual input.</p>

                <h3>Drag & Drop Blocks</h3>
                <p>For visual algorithm builders, you can drag predefined input blocks and connect them to the start of your flowchart.</p>
            </>
        )
    },
    {
        title: "Roles & Permissions",
        description: "Participant roles and permissions.",
        icon: <ProfileIcon color="#4FC3F7" />,
        details: (
            <>
                <p>AlgoVisual uses a role‑based access system to control what each user can do. Your role is displayed on your profile page.</p>

                <h3>Roles</h3>
                <ul>
                    <li><strong>User</strong> – Can browse public algorithms, run them, and view visualizations. Can also manage their own profile.</li>
                    <li><strong>Contributor</strong> – All User permissions, plus the ability to create, edit, and delete their own algorithms. Can submit algorithms for public listing.</li>
                    <li><strong>Admin</strong> – Full access to manage all algorithms, user accounts, and system settings. Can review and approve algorithms submitted by contributors.</li>
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