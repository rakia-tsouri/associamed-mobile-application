// Main App logic for the Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
    let currentView = 'users';
    let useMock = false; // DEFAULT TO REAL API AS REQUESTED

    const toggleBtn = document.getElementById('toggle-data-source');
    const contentContainer = document.getElementById('content-container');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');
    const actionBtn = document.getElementById('action-btn');

    // Get the active service based on toggle
    const getService = () => useMock ? window.MockService : window.ApiService;

    const checkLogin = () => {
        const token = localStorage.getItem('token');
        if (!token && !useMock) {
            showLoginForm();
            return false;
        }
        return true;
    };

    // UI State Management
    const setView = (view) => {
        currentView = view;
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('nav-active', 'bg-indigo-800'));

        if (view === 'users') {
            document.getElementById('nav-users').classList.add('nav-active', 'bg-indigo-800');
            viewTitle.textContent = 'Utilisateurs';
            viewSubtitle.textContent = 'Gérez les accès et les rôles du personnel.';
            actionBtn.textContent = '+ Ajouter Utilisateur';
        } else if (view === 'rooms') {
            document.getElementById('nav-rooms').classList.add('nav-active', 'bg-indigo-800');
            viewTitle.textContent = 'Gestion des Salles';
            viewSubtitle.textContent = 'Organisez les capacités et les affectations.';
            actionBtn.textContent = '+ Nouvelle Salle';
        }
        renderView();
    };

    // Toggle Data Source
    toggleBtn.addEventListener('click', () => {
        useMock = !useMock;
        toggleBtn.textContent = useMock ? 'Mock Active' : 'API Active';
        toggleBtn.classList.toggle('bg-blue-500', useMock);
        toggleBtn.classList.toggle('bg-green-600', !useMock);
        renderView();
    });

    // Navigation
    document.getElementById('nav-users').addEventListener('click', () => setView('users'));
    document.getElementById('nav-rooms').addEventListener('click', () => setView('rooms'));

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        location.reload();
    });

    // Action Button Logic
    actionBtn.addEventListener('click', () => {
        if (currentView === 'users') showUserForm();
        else showRoomForm();
    });

    // Rendering Logic
    const renderView = async () => {
        if (!checkLogin()) return; // BLOCK IF NOT LOGGED IN

        contentContainer.innerHTML = '<div class="p-10 text-center text-gray-400">Chargement...</div>';
        try {
            if (currentView === 'users') {
                const users = await getService().getUsers();
                renderUserTable(users);
            } else {
                const rooms = await getService().getRooms();
                renderRoomTable(rooms);
            }
        } catch (err) {
            contentContainer.innerHTML = `<div class="p-10 text-center text-red-500">Erreur: ${err.message}. <br> Vérifiez que le backend est lancé et que vous êtes bien admin.</div>`;
        }
    };

    window.showLoginForm = () => {
        const html = `
            <div class="p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-extrabold text-indigo-900 mb-2">Connexion Admin</h1>
                    <p class="text-gray-500">Accédez au panneau de contrôle</p>
                </div>
                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Utilisateur</label>
                        <input type="text" name="username" required class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                        <input type="password" name="password" required class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                        Se connecter
                    </button>
                </form>
            </div>
        `;
        // Instead of a modal, we can replace the entire content for a clean login look
        document.body.innerHTML = `
            <div class="h-screen flex items-center justify-center bg-gray-50 px-4">
                <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                    ${html}
                </div>
            </div>
        `;

        document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            try {
                await window.ApiService.login(data.username, data.password);
                location.reload(); // Reload to initialize regular app view
            } catch (err) { alert('Identifiants incorrects'); }
        };
    };

    const renderUserTable = (users) => {
        let html = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Rôle</th>
                        <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
        `;

        users.forEach(user => {
            html += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                ${user.username.charAt(0).toUpperCase()}
                            </div>
                            <div class="ml-4 font-semibold text-gray-900">${user.username}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}">
                            ${user.role}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onclick="editUser(${user.id})" class="text-indigo-600 hover:text-indigo-900">Modifier</button>
                        <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">Supprimer</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        contentContainer.innerHTML = html;
    };

    const renderRoomTable = (rooms) => {
        let html = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Salle</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Capacité</th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Assignation</th>
                        <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
        `;

        rooms.forEach(room => {
            html += `
                <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${room.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <span class="text-sm text-gray-900 mr-2">${room.availableSlots}/4</span>
                            <div class="w-24 bg-gray-200 rounded-full h-1.5">
                                <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${(room.availableSlots / 4) * 100}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${room.assignedTo ? `<span class="text-indigo-700 font-medium">@${room.assignedTo.username}</span>` : '<span class="italic text-gray-300">Non assignée</span>'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onclick="assignRoom(${room.id})" class="text-blue-600 hover:text-blue-900">Assigner</button>
                        <button onclick="deleteRoom(${room.id})" class="text-red-600 hover:text-red-900">Supprimer</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        contentContainer.innerHTML = html;
    };

    const getRoleBadgeClass = (role) => {
        if (role === 'ADMIN') return 'bg-red-100 text-red-800';
        if (role === 'USER_2') return 'bg-orange-100 text-orange-800';
        return 'bg-blue-100 text-blue-800';
    };

    // Modal helpers (Exposed to window for onclick handlers)
    window.deleteUser = async (id) => {
        if (confirm('Supprimer cet utilisateur ?')) {
            await getService().deleteUser(id);
            renderView();
        }
    };

    window.deleteRoom = async (id) => {
        if (confirm('Supprimer cette salle ?')) {
            await getService().deleteRoom(id);
            renderView();
        }
    };

    // Modal Logic
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    const showModal = (content) => {
        modalContent.innerHTML = content;
        modalContainer.classList.remove('hidden');
        modalContainer.classList.add('flex');
    };

    window.closeModal = () => {
        if (!modalContainer) return;
        modalContainer.classList.add('hidden');
        modalContainer.classList.remove('flex');
    };

    window.showUserForm = (userId = null) => {
        const isEdit = userId !== null;
        let userData = { username: '', role: 'USER_2' };

        if (isEdit) {
            // Find user data logic would go here
        }

        const html = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900">${isEdit ? 'Modifier User' : 'Nouvel Utilisateur'}</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form id="user-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                    <input type="text" name="username" value="${userData.username}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <input type="password" name="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                    <select name="role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                        <option value="USER_1" ${userData.role === 'USER_1' ? 'selected' : ''}>USER_1 (Consultant)</option>
                        <option value="USER_2" ${userData.role === 'USER_2' ? 'selected' : ''}>USER_2 (Gestionnaire)</option>
                        <option value="ADMIN" ${userData.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                    </select>
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
                        ${isEdit ? 'Enregistrer Changes' : 'Créer Utilisateur'}
                    </button>
                </div>
            </form>
        `;
        showModal(html);

        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            try {
                await getService().createUser(data);
                closeModal();
                renderView();
            } catch (err) { alert(err.message); }
        };
    };

    window.assignRoom = async (roomId) => {
        const users = await getService().getUsers();
        const user2List = users.filter(u => u.role === 'USER_2');

        const html = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900">Assigner la Salle</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                <button onclick="handleAssign(${roomId}, null)" class="w-full text-left p-3 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition">
                    Désassigner (Aucun)
                </button>
                ${user2List.map(user => `
                    <button onclick="handleAssign(${roomId}, ${user.id})" class="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition group">
                        <span class="font-bold text-gray-900">@${user.username}</span>
                        <span class="float-right opacity-0 group-hover:opacity-100 text-indigo-600">Assigner →</span>
                    </button>
                `).join('')}
            </div>
        `;
        showModal(html);
    };

    window.handleAssign = async (roomId, userId) => {
        try {
            await getService().updateRoom(roomId, { assignedToId: userId });
            closeModal();
            renderView();
        } catch (err) { alert(err.message); }
    };

    window.showRoomForm = () => {
        const html = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900">Nouvelle Salle</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form id="room-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la salle</label>
                    <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="ex: Urgences B">
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
                        Créer la Salle
                    </button>
                </div>
            </form>
        `;
        showModal(html);

        document.getElementById('room-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            try {
                await getService().createRoom(data);
                closeModal();
                renderView();
            } catch (err) { alert(err.message); }
        };
    };

    // Initial load
    if (checkLogin()) renderView();
});
