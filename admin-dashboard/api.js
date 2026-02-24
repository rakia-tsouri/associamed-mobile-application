// Real API calls to the NestJS backend
const ApiService = {
    baseUrl: 'http://localhost:3000', // Update this if your backend port changes
    token: localStorage.getItem('token'),

    getHeaders: () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }),

    login: async (username, password) => {
        const res = await fetch(`${ApiService.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        return data;
    },

    getUsers: async () => {
        const res = await fetch(`${ApiService.baseUrl}/users`, { headers: ApiService.getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    getRooms: async () => {
        const res = await fetch(`${ApiService.baseUrl}/rooms`, { headers: ApiService.getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch rooms');
        return res.json();
    },

    createUser: async (userData) => {
        const res = await fetch(`${ApiService.baseUrl}/users`, {
            method: 'POST',
            headers: ApiService.getHeaders(),
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    },

    updateUser: async (id, userData) => {
        const res = await fetch(`${ApiService.baseUrl}/users/${id}`, {
            method: 'PATCH',
            headers: ApiService.getHeaders(),
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    },

    deleteUser: async (id) => {
        const res = await fetch(`${ApiService.baseUrl}/users/${id}`, {
            method: 'DELETE',
            headers: ApiService.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete user');
    },

    createRoom: async (roomData) => {
        const res = await fetch(`${ApiService.baseUrl}/rooms`, {
            method: 'POST',
            headers: ApiService.getHeaders(),
            body: JSON.stringify(roomData)
        });
        if (!res.ok) throw new Error('Failed to create room');
        return res.json();
    },

    updateRoom: async (id, roomData) => {
        const res = await fetch(`${ApiService.baseUrl}/rooms/${id}`, {
            method: 'PATCH',
            headers: ApiService.getHeaders(),
            body: JSON.stringify(roomData)
        });
        if (!res.ok) throw new Error('Failed to update room');
        return res.json();
    },

    deleteRoom: async (id) => {
        const res = await fetch(`${ApiService.baseUrl}/rooms/${id}`, {
            method: 'DELETE',
            headers: ApiService.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete room');
    }
};
window.ApiService = ApiService;
