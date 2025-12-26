import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/Config';

export const authService = {
    async login(email: string, password: string) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.access_token);
        await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));

        return data;
    },

    async signup(name: string, email: string, password: string) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                password_confirmation: password, // Laravel expects this
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.access_token);
        await SecureStore.setItemAsync(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));

        return data;
    },

    async logout() {
        const token = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);

        if (token) {
            await fetch(`${CONFIG.API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
        }

        await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(CONFIG.STORAGE_KEYS.USER_DATA);
    },

    async getToken() {
        return await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    },

    async getUser() {
        const user = await SecureStore.getItemAsync(CONFIG.STORAGE_KEYS.USER_DATA);
        return user ? JSON.parse(user) : null;
    }
};
