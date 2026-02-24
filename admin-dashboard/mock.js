// Mock data and functions to simulate backend behavior
const MockService = {
    users: [
        { id: 1, username: 'admin', role: 'ADMIN' },
        { id: 2, username: 'user1', role: 'USER_1' },
        { id: 3, username: 'user2', role: 'USER_2' }
    ],
    rooms: [
        { id: 1, name: 'Cardiologie', availableSlots: 2, assignedTo: { id: 3, username: 'user2' } },
        { id: 2, name: 'Urgences', availableSlots: 0, assignedTo: { id: 3, username: 'user2' } },
        { id: 3, name: 'Pédiatrie', availableSlots: 4, assignedTo: null },
        { id: 4, name: 'Radiologie', availableSlots: 1, assignedTo: null }
    ],

    getUsers: async () => {
        await new Promise(r => setTimeout(r, 500));
        return [...MockService.users];
    },

    getRooms: async () => {
        await new Promise(r => setTimeout(r, 500));
        return [...MockService.rooms];
    },

    createUser: async (userData) => {
        await new Promise(r => setTimeout(r, 1000));
        const newUser = { id: MockService.users.length + 1, ...userData };
        MockService.users.push(newUser);
        return newUser;
    },

    updateUser: async (id, userData) => {
        await new Promise(r => setTimeout(r, 800));
        const index = MockService.users.findIndex(u => u.id == id);
        if (index !== -1) {
            MockService.users[index] = { ...MockService.users[index], ...userData };
            return MockService.users[index];
        }
        throw new Error('User not found');
    },

    deleteUser: async (id) => {
        await new Promise(r => setTimeout(r, 800));
        MockService.users = MockService.users.filter(u => u.id != id);
    },

    createRoom: async (roomData) => {
        await new Promise(r => setTimeout(r, 1000));
        const newRoom = { id: MockService.rooms.length + 1, ...roomData, availableSlots: 0, assignedTo: null };
        MockService.rooms.push(newRoom);
        return newRoom;
    },

    updateRoom: async (id, roomData) => {
        await new Promise(r => setTimeout(r, 800));
        const index = MockService.rooms.indexWhere(r => r.id == id);
        if (index !== -1) {
            const assignedTo = roomData.assignedToId ? MockService.users.find(u => u.id == roomData.assignedToId) : null;
            MockService.rooms[index] = { ...MockService.rooms[index], ...roomData, assignedTo };
            return MockService.rooms[index];
        }
        throw new Error('Room not found');
    },

    deleteRoom: async (id) => {
        await new Promise(r => setTimeout(r, 800));
        MockService.rooms = MockService.rooms.filter(r => r.id != id);
    }
};
window.MockService = MockService;
