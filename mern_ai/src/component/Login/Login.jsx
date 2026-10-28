import React, { useContext, useState } from 'react';
import styles from './Login.module.css';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GoogleIcon from '@mui/icons-material/Google';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CircularProgress from '@mui/material/CircularProgress';

import { auth, provider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { AuthContext } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const Login = () => {
    const { setLogin, setUserInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const res = await axios.post('/api/user', {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                photoUrl:
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.displayName || 'User'
                    )}&background=4f46e5&color=fff`,
            });

            const loggedInUser = res.data.user;
            setUserInfo(loggedInUser);
            localStorage.setItem('userInfo', JSON.stringify(loggedInUser));

            setLogin(true);
            localStorage.setItem('isLogin', 'true');

            navigate('/dashboard');
        } catch (err) {
            console.error('Google Login Error:', err);
            alert('Google Sign-In error: ' + (err.message || 'Please check Firebase setup'));
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role = 'user') => {
        setLoading(true);
        try {
            const demoEmail = role === 'admin' ? 'admin@demo.com' : 'candidate@demo.com';
            const demoName = role === 'admin' ? 'Demo Admin' : 'Demo Candidate';

            const res = await axios.post('/api/user', {
                name: demoName,
                email: demoEmail,
                photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    demoName
                )}&background=4f46e5&color=fff`,
            });

            let loggedInUser = res.data.user;
            if (role === 'admin' && loggedInUser.role !== 'admin') {
                loggedInUser = { ...loggedInUser, role: 'admin' };
            }

            setUserInfo(loggedInUser);
            localStorage.setItem('userInfo', JSON.stringify(loggedInUser));

            setLogin(true);
            localStorage.setItem('isLogin', 'true');

            navigate('/dashboard');
        } catch (err) {
            console.error('Demo Login Error:', err);
            alert('Backend connection error. Make sure the server is running on port 4000.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.Login}>
            <div className={styles.loginCard}>
                <div className={styles.brandBadge}>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 32 }} />
                </div>

                <h1 className={styles.loginTitle}>ResumeMatch AI</h1>
                <p className={styles.loginSubtitle}>
                    AI-powered candidate screening and resume benchmark intelligence.
                </p>

                <div
                    className={styles.googleBtn}
                    onClick={!loading ? handleGoogleLogin : undefined}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? (
                        <CircularProgress size={20} sx={{ color: '#4f46e5' }} />
                    ) : (
                        <GoogleIcon sx={{ fontSize: 20, color: '#ea4335' }} />
                    )}
                    <span>{loading ? 'Signing In...' : 'Sign in with Google'}</span>
                </div>

                <div className={styles.divider}>
                    <span>or fast demo access</span>
                </div>

                <div className={styles.demoRow}>
                    <button
                        type="button"
                        className={styles.demoBtn}
                        onClick={() => handleDemoLogin('user')}
                        disabled={loading}
                    >
                        <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        <span>Candidate</span>
                    </button>

                    <button
                        type="button"
                        className={styles.demoBtn}
                        onClick={() => handleDemoLogin('admin')}
                        disabled={loading}
                    >
                        <AdminPanelSettingsRoundedIcon sx={{ fontSize: 18 }} />
                        <span>Admin Recruiter</span>
                    </button>
                </div>

                <div className={styles.securityNote}>
                    Powered by Cohere LLMs • Confidential candidate screening
                </div>
            </div>
        </div>
    );
};

export default Login;