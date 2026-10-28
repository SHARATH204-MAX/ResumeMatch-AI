import React, { useContext } from 'react';
import styles from './SideBar.module.css';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../utils/AuthContext';

const SideBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { isLogin, setLogin, userInfo, setUserInfo } = useContext(AuthContext);

    const handleLogout = () => {
        localStorage.removeItem('isLogin');
        localStorage.removeItem('userInfo');
        setLogin(false);
        setUserInfo(null);
        navigate('/');
    };

    if (!isLogin && location.pathname === '/') {
        return null;
    }

    return (
        <aside className={styles.sideBar}>
            <div>
                <div className={styles.brandHeader}>
                    <div className={styles.brandIconBadge}>
                        <AutoAwesomeIcon sx={{ fontSize: 24 }} />
                    </div>
                    <div className={styles.brandTextGroup}>
                        <div className={styles.brandTitle}>
                            ResumeMatch
                            <span className={styles.badgeAI}>AI</span>
                        </div>
                        <div className={styles.brandSubtitle}>Screening Intelligence</div>
                    </div>
                </div>

                <nav className={styles.navSection}>
                    <div className={styles.sectionLabel}>Overview</div>

                    <Link
                        to='/dashboard'
                        className={[
                            styles.sideBarOption,
                            location.pathname === '/dashboard' ? styles.selectedOption : ''
                        ].join(' ')}
                    >
                        <DashboardCustomizeRoundedIcon sx={{ fontSize: 20 }} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to='/history'
                        className={[
                            styles.sideBarOption,
                            location.pathname === '/history' ? styles.selectedOption : ''
                        ].join(' ')}
                    >
                        <HistoryRoundedIcon sx={{ fontSize: 20 }} />
                        <span>History</span>
                    </Link>

                    {userInfo?.role === 'admin' && (
                        <>
                            <div className={styles.sectionLabel} style={{ marginTop: '12px' }}>Admin</div>
                            <Link
                                to='/admin'
                                className={[
                                    styles.sideBarOption,
                                    location.pathname === '/admin' ? styles.selectedOption : ''
                                ].join(' ')}
                            >
                                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 20 }} />
                                <span>Candidate Hub</span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            <div className={styles.userFooter}>
                <div className={styles.userProfileGroup}>
                    {userInfo?.photoUrl ? (
                        <img
                            src={userInfo.photoUrl}
                            alt={userInfo.name || 'User'}
                            className={styles.userAvatar}
                        />
                    ) : (
                        <div className={styles.userAvatarFallback}>
                            {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                    <div className={styles.userMeta}>
                        <div className={styles.userName} title={userInfo?.name}>
                            {userInfo?.name || 'Candidate'}
                        </div>
                        <div className={styles.userRole}>
                            {userInfo?.role || 'User'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                    title="Sign Out"
                    aria-label="Sign Out"
                >
                    <LogoutRoundedIcon sx={{ fontSize: 20 }} />
                </button>
            </div>
        </aside>
    );
};

export default SideBar;