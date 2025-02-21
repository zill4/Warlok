import { userSignal } from '../components/AuthForm';

export const checkAuth = async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return false;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
        userSignal.value = null;
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
        userSignal.value = data.user;
        return true;
    } catch {
        localStorage.removeItem('token');
        userSignal.value = null;
        return false;
    }
}; 