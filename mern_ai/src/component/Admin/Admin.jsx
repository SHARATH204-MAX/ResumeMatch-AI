import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import axios from '../../utils/axios';

import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

const Admin = () => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoader(true);
            try {
                const res = await axios.get('/api/resume/get');
                setData(res.data.resumes || []);
            } catch (err) {
                console.error('Error fetching admin resumes:', err);
            } finally {
                setLoader(false);
            }
        };

        fetchAllData();
    }, []);

    const getScoreColor = (scoreNum) => {
        if (scoreNum >= 75) return '#10b981';
        if (scoreNum >= 50) return '#f59e0b';
        return '#ef4444';
    };

    // Calculate metrics
    const totalSubmissions = data.length;
    const avgScore = totalSubmissions
        ? Math.round(
              data.reduce((acc, curr) => acc + (parseInt(curr.score, 10) || 0), 0) /
                  totalSubmissions
          )
        : 0;
    const highMatches = data.filter(
        (item) => (parseInt(item.score, 10) || 0) >= 75
    ).length;

    return (
        <main className={styles.Admin}>
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Candidate Screening Hub</h1>
                    <p className={styles.subtitle}>
                        Overview of candidate benchmark submissions and Cohere AI evaluations across the organization.
                    </p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Screenings</div>
                    <div className={styles.statValue}>{totalSubmissions}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Average Match Score</div>
                    <div className={styles.statValue} style={{ color: getScoreColor(avgScore) }}>
                        {avgScore}%
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>High Matches (≥75%)</div>
                    <div className={styles.statValue} style={{ color: '#10b981' }}>
                        {highMatches}
                    </div>
                </div>
            </div>

            <div className={styles.AdminGrid}>
                {loader && (
                    <>
                        <Skeleton variant="rounded" height={260} sx={{ borderRadius: '18px' }} />
                        <Skeleton variant="rounded" height={260} sx={{ borderRadius: '18px' }} />
                        <Skeleton variant="rounded" height={260} sx={{ borderRadius: '18px' }} />
                    </>
                )}

                {!loader && data.length === 0 && (
                    <div className={styles.emptyState}>
                        <PeopleAltRoundedIcon sx={{ fontSize: 44, color: '#94a3b8' }} />
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                            No candidate evaluations submitted yet
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                            When candidates submit resumes through the screening portal, their evaluations will appear here.
                        </p>
                    </div>
                )}

                {!loader &&
                    data.map((item) => {
                        const numericScore = parseInt(item.score, 10) || 0;
                        return (
                            <div key={item._id} className={styles.AdminCard}>
                                <div className={styles.candidateHeader}>
                                    <div className={styles.candidateInfo}>
                                        {item.user?.photoUrl ? (
                                            <img
                                                src={item.user.photoUrl}
                                                alt={item.user.name || 'Candidate'}
                                                className={styles.avatar}
                                            />
                                        ) : (
                                            <div className={styles.avatarFallback}>
                                                {item.user?.name
                                                    ? item.user.name.charAt(0).toUpperCase()
                                                    : 'C'}
                                            </div>
                                        )}
                                        <div className={styles.candidateMeta}>
                                            <div className={styles.candidateName} title={item.user?.name}>
                                                {item.user?.name || 'Unknown Candidate'}
                                            </div>
                                            <div className={styles.candidateEmail} title={item.user?.email}>
                                                {item.user?.email || 'No email provided'}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={styles.scoreBadge}
                                        style={{ backgroundColor: getScoreColor(numericScore) }}
                                    >
                                        {numericScore}%
                                    </div>
                                </div>

                                <div className={styles.sectionBlock}>
                                    <div className={styles.blockTitle}>Resume Document</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                        <PictureAsPdfRoundedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.resume_name}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.sectionBlock}>
                                    <div className={styles.blockTitle}>Target Job Description</div>
                                    <div className={styles.blockContent}>
                                        {item.job_desc}
                                    </div>
                                </div>

                                <div className={styles.sectionBlock}>
                                    <div className={styles.blockTitle}>AI Evaluation Feedback</div>
                                    <div className={styles.blockContent}>
                                        {item.feedback}
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <span>
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString()
                                            : 'N/A'}
                                    </span>
                                    <span>ID: {item._id.slice(-6)}</span>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </main>
    );
};

export default WithAuthHOC(Admin);