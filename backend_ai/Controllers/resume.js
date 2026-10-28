const ResumeModel = require('../Models/resume');
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const { CohereClient } = require("cohere-ai");

exports.addResume = async (req, res) => {
    let pdfPath = null;
    try {
        const { job_desc, user } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }
        if (!job_desc) {
            return res.status(400).json({ error: 'Job description is required' });
        }
        if (!user) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        pdfPath = req.file.path;
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(dataBuffer);

        const apiKey = process.env.COHERE_API_KEY;
        if (!apiKey || apiKey === "Add Your Own Client ID") {
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            return res.status(400).json({
                error: 'COHERE_API_KEY is not configured',
                message: 'Please provide a Cohere API key in the backend_ai/.env file'
            });
        }

        const cohere = new CohereClient({
            token: apiKey,
        });

        const prompt = `
            You are a resume screening assistant.
            Compare the following resume text with the provided Job Description (JD) and give a match score (0-100) and feedback.

            Resume:
            ${pdfData.text.slice(0, 4000)}

            Job Description:
            ${job_desc.slice(0, 2000)}

            Return the score and a brief explanation in this format:
            Score: XX
            Reason: ...
        `;

        const response = await cohere.chat({
            message: prompt,
            temperature: 0.7,
        });

        const result = response.text || "";

        let score = "0";
        let feedback = result.trim();

        const scoreMatch = result.match(/Score:\s*(\d+)/i);
        if (scoreMatch) {
            score = scoreMatch[1];
        }

        const reasonMatch = result.match(/Reason:\s*([\s\S]*)/i);
        if (reasonMatch) {
            feedback = reasonMatch[1].trim();
        }

        const newResume = new ResumeModel({
            user: user,
            resume_name: req.file.originalname,
            job_desc: job_desc,
            score: score,
            feedback: feedback
        });

        await newResume.save();

        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath); // remove temp file
        }

        return res.status(200).json({ message: "Your analysis are ready", data: newResume });
    } catch (err) {
        if (pdfPath && fs.existsSync(pdfPath)) {
            try { fs.unlinkSync(pdfPath); } catch (e) {}
        }
        console.error("Resume analysis error:", err);
        if (err.statusCode === 429 || err.message?.includes('TooManyRequests') || err.message?.includes('429')) {
            return res.status(429).json({
                error: 'Rate limit reached',
                message: 'Cohere Trial API key is limited to 5 calls/min. Please wait 15-30 seconds and try again.'
            });
        }
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getAllResumesForUser = async (req, res) => {
    try {
        const { user } = req.params;
        const resumes = await ResumeModel.find({ user }).sort({ createdAt: -1 });
        return res.status(200).json({ resumes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getResumeForAdmin = async (req, res) => {
    try {
        const resumes = await ResumeModel.find().populate('user').sort({ createdAt: -1 });
        return res.status(200).json({ resumes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
};