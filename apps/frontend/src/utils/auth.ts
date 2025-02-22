import type { UserData, User, Profile } from '../types/shared';
import { userSignal } from '../components/AuthForm';

export const checkAuth = async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return false;
    }

    const token = localStorage.getItem('token');
    const authTimestamp = localStorage.getItem('authTimestamp');
    
    // If no token or timestamp, user is not authenticated
    if (!token || !authTimestamp) {
        clearAuthData();
        return false;
    }

    try {
        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error();
        }

        const data = await response.json();
        
        // Update local storage with fresh data
        updateAuthData(data.user);
        
        // Update user signal
        userSignal.value = {
            ...data.user,
            authTimestamp: Number(authTimestamp)
        };
        
        return true;
    } catch {
        clearAuthData();
        return false;
    }
};

export const updateAuthData = (userData: User) => {
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('wallet', userData.wallet);
    
    if (userData.profile) {
        localStorage.setItem('username', userData.profile.username);
        if (userData.profile.bio) {
            localStorage.setItem('bio', userData.profile.bio);
        }
    }
    
    localStorage.setItem('authTimestamp', Date.now().toString());
};

export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('wallet');
    localStorage.removeItem('bio');
    localStorage.removeItem('authTimestamp');
    userSignal.value = null;
};

export const getAuthData = (): Partial<UserData> | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const profile: Profile = {
        id: '', // We don't store profile.id locally
        userId: localStorage.getItem('userId') || '',
        username: localStorage.getItem('username') || '',
        bio: localStorage.getItem('bio') || undefined
    };

    return {
        id: localStorage.getItem('userId') || '',
        email: localStorage.getItem('email') || '',
        wallet: localStorage.getItem('wallet') || '',
        profile,
        authTimestamp: Number(localStorage.getItem('authTimestamp')) || 0
    };
}; 