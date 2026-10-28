try {
    process.loadEnvFile();
} catch (e) {
    // If .env is not present, environment variables can still come from process.env
}

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

const path = require('path');

require('./conn');
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
}));

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');

app.use('/api/user', UserRoutes);
app.use('/api/resume', ResumeRoutes);

app.listen(PORT, () => {
    console.log("backend is running on port", PORT);
});