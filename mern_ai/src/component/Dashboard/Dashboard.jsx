import React, { useState, useContext, useRef } from 'react';
import styles from './Dashboard.module.css';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';

import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';

const SAMPLE_JD = `We are seeking an experienced Full Stack Software Engineer to build and scale web applications.
Requirements:
- 3+ years experience with React, JavaScript/TypeScript, and modern frontend architecture.
- Strong proficiency in Node.js, Express, and RESTful API development.
- Hands-on experience with MongoDB (Mongoose) or relational databases.
- Familiarity with Git, cloud deployment, and CI/CD pipelines.
- Strong problem-solving skills and communication in an agile team.`;

const Dashboard = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef(null);
    const { userInfo } = useContext(AuthContext);

    const handleFileSelect = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        setResumeFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!resumeFile) {
            alert('Please upload a resume in PDF format first.');
            return;
        }
        if (!jobDesc.trim()) {
            alert('Please enter or paste a target Job Description.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_desc', jobDesc);
        formData.append('user', userInfo?._id);

        setLoading(true);
        setResult(null);

        try {
            const res = await axios.post('/api/resume/addResume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(res.data.data);
        } catch (err) {
            console.error(err);
            const errMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Error analyzing resume. Please verify backend connection.';
            alert(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const copyFeedback = () => {
        if (!result?.feedback) return;
        navigator.clipboard.writeText(
            `Match Score: ${result.score}%\n\nAnalysis Feedback:\n${result.feedback}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (scoreNum) => {
        if (scoreNum >= 75) return '#10b981'; // Green
        if (scoreNum >= 50) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const getMatchLabel = (scoreNum) => {
        if (scoreNum >= 75) return 'Strong Candidate Match';
        if (scoreNum >= 50) return 'Moderate Match with Gaps';
        return 'Low Relevance for Role';
    };

    const numericScore = result ? parseInt(result.score, 10) || 0 : 0;

    return (
        <main className={styles.Dashboard}>
            <div className={styles.DashboardLeft}>
                <div className={styles.headerCard}>
                    <div className={styles.badgePill}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                        <span>Cohere AI Screening Engine</span>
                    </div>
                    <h1 className={styles.DashboardTitle}>Resume Match Benchmark</h1>
                    <p className={styles.DashboardSubtitle}>
                        Benchmark candidate resumes against specific job descriptions to instantly calculate skill alignment, keyword relevance, and gap analysis.
                    </p>
                </div>

                {/* Step 1: Upload Resume */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>1</span>
                            Candidate Resume (PDF)
                        </div>
                    </div>

                    {!resumeFile ? (
                        <div
                            className={[
                                styles.dropzone,
                                isDragOver ? styles.dropzoneActive : '',
                            ].join(' ')}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragOver(true);
                            }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.uploadIconWrap}>
                                <CloudUploadRoundedIcon sx={{ fontSize: 28 }} />
                            </div>
                            <div className={styles.dropzoneText}>
                                Click to browse or drag & drop resume here
                            </div>
                            <div className={styles.dropzoneSubtext}>
                                Supports PDF format up to 10MB
                            </div>
                        </div>
                    ) : (
                        <div className={styles.fileChosenCard}>
                            <div className={styles.fileMeta}>
                                <CheckCircleRoundedIcon sx={{ fontSize: 26, color: '#16a34a' }} />
                                <div>
                                    <div className={styles.fileName}>{resumeFile.name}</div>
                                    <div style={{ fontSize: '11px', color: '#15803d' }}>
                                        {(resumeFile.size / 1024).toFixed(1)} KB • Ready for analysis
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={styles.replaceBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Replace PDF
                            </button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className={styles.hiddenInput}
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />
                </div>

                {/* Step 2: Target Job Description */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>
                            <span className={styles.stepNumber}>2</span>
                            Target Job Description
                        </div>
                        <button
                            type="button"
                            className={styles.quickSampleBtn}
                            onClick={() => setJobDesc(SAMPLE_JD)}
                        >
                            Load Sample JD
                        </button>
                    </div>

                    <textarea
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        placeholder="Paste the job requirements, essential qualifications, and responsibilities here..."
                        rows={7}
                        className={styles.textArea}
                    />

                    <div className={styles.textAreaMeta}>
                        {jobDesc.length > 0 && `${jobDesc.length} characters`}
                    </div>
                </div>

                {/* Step 3: Run Analysis */}
                <button
                    type="button"
                    className={styles.ctaButton}
                    onClick={handleUpload}
                    disabled={loading || !resumeFile || !jobDesc.trim()}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                            <span>Analyzing Candidate with AI...</span>
                        </>
                    ) : (
                        <>
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
                            <span>Benchmark Resume Alignment</span>
                        </>
                    )}
                </button>
            </div>

            {/* Right Panel: Live Intelligence */}
            <div className={styles.DashboardRight}>
                {loading && (
                    <div className={styles.cardContainer}>
                        <div className={styles.resultTitle}>
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                            <span>Analyzing Candidate...</span>
                        </div>
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rounded" height={180} sx={{ borderRadius: '12px' }} />
                    </div>
                )}

                {result && !loading && (
                    <div className={styles.cardContainer}>
                        <div className={styles.resultHeader}>
                            <div className={styles.resultTitle}>
                                <InsightsRoundedIcon sx={{ fontSize: 22, color: '#4f46e5' }} />
                                <span>Evaluation Result</span>
                            </div>
                            <button
                                type="button"
                                className={styles.quickSampleBtn}
                                onClick={copyFeedback}
                                title="Copy evaluation to clipboard"
                            >
                                <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>

                        <div className={styles.scoreBanner}>
                            <div
                                className={styles.scoreCircle}
                                style={{ backgroundColor: getScoreColor(numericScore) }}
                            >
                                <span className={styles.scoreNumber}>{numericScore}%</span>
                                <span className={styles.scoreLabel}>Match</span>
                            </div>
                            <div className={styles.scoreDescription}>
                                <div className={styles.scoreMatchStatus}>
                                    {getMatchLabel(numericScore)}
                                </div>
                                <div className={styles.scoreMatchHint}>
                                    Scored based on semantic skill & experience overlap.
                                </div>
                            </div>
                        </div>

                        <div className={styles.feedbackBlock}>
                            <div className={styles.feedbackTitle}>
                                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#4f46e5' }} />
                                <span>Detailed AI Assessment</span>
                            </div>
                            <div className={styles.feedbackContent}>{result.feedback}</div>
                        </div>

                        <div className={styles.resultMetaRow}>
                            <span>File: <strong>{result.resume_name}</strong></span>
                            <span>{new Date(result.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}

                {!result && !loading && (
                    <div className={styles.cardContainer}>
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <InsightsRoundedIcon sx={{ fontSize: 32 }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
                                Live Screening Intelligence
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                                Upload a candidate resume on the left and specify your job requirements to generate a complete benchmark score and gap evaluation.
                            </p>

                            <div className={styles.featureList}>
                                <div className={styles.featureItem}>
                                    <TaskAltRoundedIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
                                    <span>Semantic matching with Cohere LLMs</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <TaskAltRoundedIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
                                    <span>Identifies missing required competencies</span>
                                </div>
                                <div className={styles.featureItem}>
                                    <TaskAltRoundedIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
                                    <span>Auto-saved to history for recruiter review</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default WithAuthHOC(Dashboard);