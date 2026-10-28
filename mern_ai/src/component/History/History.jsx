import React, { useState, useEffect, useContext } from 'react';
import styles from './History.module.css';
import { Skeleton } from '@mui/material';
import WithAuthHOC from '../../utils/HOC/withAuthHOC';
import axios from '../../utils/axios';
import { AuthContext } from '../../utils/AuthContext';
import { Link } from 'react-router-dom';

import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const History = () => {
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(false);
    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userInfo?._id) return;
            setLoader(true);
            try {
                const res = await axios.get(`/api/resume/get/${userInfo._id}`);
                setData(res.data.resumes || []);
            } catch (err) {
                console.error('Error fetching resumes:', err);
            } finally {
                setLoader(false);
            }
        };

        fetchUserData();
    }, [userInfo]);

    const getScoreColor = (scoreNum) => {
        if (scoreNum >= 75) return '#10b981';
        if (scoreNum >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <main className={styles.History}>
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Screening History</h1>
                    <p className={styles.subtitle}>
                        Archive of your past resume benchmark evaluations and AI feedback.
                    </p>
                </div>
                {!loader && (
                    <div className={styles.countBadge}>
                        {data.length} {data.length === 1 ? 'Evaluation' : 'Evaluations'}
                    </div>
                )}
            </div>

            <div className={styles.HistoryGrid}>
                {loader && (
                    <>
                        <Skeleton variant="rounded" height={220} sx={{ borderRadius: '18px' }} />
                        <Skeleton variant="rounded" height={220} sx={{ borderRadius: '18px' }} />
                        <Skeleton variant="rounded" height={220} sx={{ borderRadius: '18px' }} />
                    </>
                )}

                {!loader && data.length === 0 && (
                    <div className={styles.emptyState}>
                        <HistoryRoundedIcon sx={{ fontSize: 44, color: '#94a3b8' }} />
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                            No screening records yet
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '400px' }}>
                            Upload your first resume against a job description in the Dashboard to generate benchmark scores.
                        </p>
                        <Link to="/dashboard" className={styles.primaryBtn} style={{ marginTop: '8px' }}>
                            Go to Dashboard →
                        </Link>
                    </div>
                )}

                {!loader &&
                    data.map((item) => {
                        const numericScore = parseInt(item.score, 10) || 0;
                        return (
                            <div key={item._id} className={styles.HistoryCard}>
                                <div className={styles.cardTopRow}>
                                    <div className={styles.fileChip} title={item.resume_name}>
                                        <PictureAsPdfRoundedIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                                        <span>{item.resume_name}</span>
                                    </div>
                                    <div
                                        className={styles.scoreBadge}
                                        style={{ backgroundColor: getScoreColor(numericScore) }}
                                    >
                                        {numericScore}%
                                    </div>
                                </div>

                                <div className={styles.feedbackBox}>
                                    {item.feedback || 'No detailed feedback recorded.'}
                                </div>

                                <div className={styles.cardFooter}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CalendarMonthRoundedIcon sx={{ fontSize: 14 }} />
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        ID: {item._id.slice(-6)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </main>
    );
};

export default WithAuthHOC(History);