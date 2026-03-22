// Main App logic for the Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let currentView = 'users'; // default
    let useMock = false;
    let currentUser = null;

    // --- DOM ELEMENTS ---
    const contentContainer = document.getElementById('content-container');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');
    const actionBtn = document.getElementById('action-btn');
    const statRooms = document.getElementById('stat-rooms');
    const statUsers = document.getElementById('stat-users');
    const toggleBtn = document.getElementById('toggle-data-source');
    const navUsers = document.getElementById('nav-users');
    const navRooms = document.getElementById('nav-rooms');
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    // --- UTILS ---
    const getService = () => useMock ? window.MockService : window.ApiService;

    const hideSplash = () => {
        const splash = document.getElementById('splash-screen');
        const logo = document.getElementById('splash-logo');
        const app = document.getElementById('app');

        const doHide = () => {
            if (splash) {
                splash.classList.add('opacity-0');
                setTimeout(() => splash.classList.add('hidden'), 700);
            }
            if (app) app.classList.remove('opacity-0');
        };

        // If logo is not yet loaded, wait for it
        if (logo && !logo.complete) {
            logo.onload = doHide;
            // Fallback to hide after 3.5s anyway to prevent blocking
            setTimeout(doHide, 3500);
        } else {
            // Buffer delay for smooth transition
            setTimeout(doHide, 1000);
        }
    };

    const checkLogin = () => {
        const token = localStorage.getItem('token');
        if (!token && !useMock) {
            showLoginForm();
            return false;
        }
        return true;
    };

    const initializeUser = async () => {
        if (useMock) {
            currentUser = { id: 99, username: 'Admin_Mock', role: 'ADMIN' };
        } else {
            currentUser = await window.ApiService.getMe();
        }

        if (currentUser) {
            updateSidebarForRole();
            updateMetrics();

            // Set initial view based on role if default is not allowed
            if (currentUser.role === 'USER_2') {
                setView('rooms');
            } else if (currentUser.role === 'USER_1') {
                setView('overview');
            }
        }
    };

    const updateMetrics = async () => {
        try {
            const users = await getService().getUsers();
            const rooms = await getService().getRooms();
            if (statUsers) statUsers.textContent = users.length;
            if (statRooms) statRooms.textContent = rooms.length;
        } catch (e) { /* silent fail */ }
    };

    const updateSidebarForRole = () => {
        const role = currentUser?.role;
        if (role === 'ADMIN') {
            navUsers?.classList.remove('hidden');
            navRooms?.classList.remove('hidden');
        } else if (role === 'USER_2') {
            navUsers?.classList.add('hidden');
            navRooms?.classList.remove('hidden');
        } else {
            navUsers?.classList.add('hidden');
            navRooms?.classList.add('hidden');
        }
    };

    // --- NAVIGATION ---
    const setView = (view) => {
        currentView = view;
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('nav-active');
            btn.classList.remove('bg-indigo-800');
        });

        if (view === 'users') {
            navUsers?.classList.add('nav-active');
            viewTitle.textContent = 'Membres du Personnel';
            viewSubtitle.textContent = 'Gérez les accès et les rôles.';
            actionBtn.style.display = 'block';
            actionBtn.textContent = '+ Ajouter Utilisateur';
        } else if (view === 'rooms') {
            navRooms?.classList.add('nav-active');
            viewTitle.textContent = currentUser?.role === 'USER_2' ? 'Mes Salles Assignées' : 'Gestion des Salles';
            viewSubtitle.textContent = 'Capacités et files d\'attente.';
            actionBtn.style.display = currentUser?.role === 'ADMIN' ? 'block' : 'none';
            actionBtn.textContent = '+ Nouvelle Salle';
        } else {
            viewTitle.textContent = 'Tableau de Bord';
            viewSubtitle.textContent = 'Aperçu global de l\'activité.';
            actionBtn.style.display = 'none';
        }
        renderView();
    };

    navUsers?.addEventListener('click', () => setView('users'));
    navRooms?.addEventListener('click', () => setView('rooms'));

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        location.reload();
    });

    toggleBtn?.addEventListener('click', () => {
        useMock = !useMock;
        toggleBtn.textContent = useMock ? 'Mock Active' : 'API Active';
        toggleBtn.classList.toggle('bg-blue-500', useMock);
        toggleBtn.classList.toggle('bg-indigo-500', !useMock);
        renderView();
    });

    actionBtn?.addEventListener('click', () => {
        if (currentView === 'users') showUserForm();
        else showRoomForm();
    });

    // --- RENDERING ---
    const renderView = async () => {
        if (!checkLogin()) {
            hideSplash();
            return;
        }

        if (!currentUser) await initializeUser();

        contentContainer.innerHTML = `
            <div class="p-20 flex flex-col items-center justify-center text-gray-400">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p class="font-medium animate-pulse">Chargement...</p>
            </div>
        `;

        try {
            if (currentView === 'users') {
                const users = await getService().getUsers();
                renderUserTable(users);
            } else if (currentView === 'rooms') {
                const rooms = await getService().getRooms();
                const filtered = currentUser.role === 'USER_2'
                    ? rooms.filter(r => r.assignedTo && r.assignedTo.id === currentUser.id)
                    : rooms;
                renderRoomTable(filtered);
            } else {
                renderOverview();
            }
            hideSplash();
        } catch (err) {
            hideSplash();
            contentContainer.innerHTML = `<div class="p-10 text-center text-red-500">Erreur: ${err.message}</div>`;
        }
    };

    const renderUserTable = (users) => {
        let html = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100">
                    <thead class="bg-gray-50/50">
                        <tr>
                            <th class="px-8 py-5 text-left text-[11px] font-black text-indigo-400 uppercase tracking-widest">Membre</th>
                            <th class="px-8 py-5 text-left text-[11px] font-black text-indigo-400 uppercase tracking-widest">Rôle</th>
                            <th class="px-8 py-5 text-right text-[11px] font-black text-indigo-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
        `;

        users.forEach(user => {
            html += `
                <tr class="group hover:bg-indigo-50/30 transition-all duration-300">
                    <td class="px-8 py-5 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
                                ${user.username.charAt(0).toUpperCase()}
                            </div>
                            <div class="ml-5 font-bold text-gray-900">@${user.username}</div>
                        </div>
                    </td>
                    <td class="px-8 py-5 whitespace-nowrap">
                        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleBadgeClass(user.role)} shadow-sm">
                            ${user.role}
                        </span>
                    </td>
                    <td class="px-8 py-5 whitespace-nowrap text-right">
                        <div class="flex justify-end space-x-2">
                            <button onclick="showUserForm(${user.id})" class="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg">✏️</button>
                            <button onclick="deleteUser(${user.id})" class="p-2 text-red-600 hover:bg-red-100 rounded-lg">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
        contentContainer.innerHTML = html;
    };

    const renderRoomTable = (rooms) => {
        let html = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100">
                    <thead class="bg-gray-50/50">
                        <tr>
                            <th class="px-8 py-5 text-left text-[11px] font-black text-indigo-400 uppercase tracking-widest">Salle</th>
                            <th class="px-8 py-5 text-left text-[11px] font-black text-indigo-400 uppercase tracking-widest">Places</th>
                            <th class="px-8 py-5 text-left text-[11px] font-black text-indigo-400 uppercase tracking-widest">Assignation</th>
                            <th class="px-8 py-5 text-right text-[11px] font-black text-indigo-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
        `;

        rooms.forEach(room => {
            const occupation = (room.availableSlots / 4) * 100;
            html += `
                <tr class="group hover:bg-indigo-50/30 transition-all">
                    <td class="px-8 py-6 whitespace-nowrap text-base font-bold text-gray-900">🛋️ ${room.name}</td>
                    <td class="px-8 py-6 whitespace-nowrap">
                        <div class="w-40 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div class="bg-indigo-600 h-full rounded-full" style="width: ${occupation}%"></div>
                        </div>
                        <span class="text-[10px] font-bold text-gray-400 mt-1 block">${room.availableSlots} / 4 Places</span>
                    </td>
                    <td class="px-8 py-6 whitespace-nowrap">
                        <span class="font-bold text-sm text-indigo-700">@${room.assignedTo?.username || 'Non assignée'}</span>
                    </td>
                    <td class="px-8 py-6 whitespace-nowrap text-right">
                        <button onclick="assignRoom(${room.id})" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100">Assigner</button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
        contentContainer.innerHTML = html;
        if (rooms.length === 0) contentContainer.innerHTML = '<div class="p-20 text-center text-gray-400 font-bold italic">Aucune salle trouvée.</div>';
    };

    const renderOverview = () => {
        contentContainer.innerHTML = `
            <div class="p-12 text-center">
                <h3 class="text-3xl font-black text-indigo-950 mb-4">Bienvenue, @${currentUser.username}</h3>
                <p class="text-gray-500 mb-12">Voici votre tableau de bord Associa-Med.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div class="p-10 bg-white rounded-[32px] shadow-xl shadow-indigo-100/50 border border-indigo-50 flex flex-col items-center">
                        <div class="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-4xl mb-6">🩺</div>
                        <div class="text-2xl font-black text-indigo-950">Statut: Actif</div>
                        <div class="text-indigo-400 font-black uppercase tracking-widest text-[10px] mt-2">Profil: ${currentUser.role}</div>
                    </div>
                    <div class="p-10 bg-white rounded-[32px] shadow-xl shadow-indigo-100/50 border border-indigo-50 flex flex-col items-center">
                        <div class="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-4xl mb-6">📅</div>
                        <div class="text-2xl font-black text-indigo-950">${new Date().toLocaleDateString('fr-FR')}</div>
                        <div class="text-green-400 font-black uppercase tracking-widest text-[10px] mt-2">Date d'aujourd'hui</div>
                    </div>
                </div>
            </div>
        `;
    };

    const getRoleBadgeClass = (role) => {
        if (role === 'ADMIN') return 'bg-red-50 text-red-600 border border-red-100';
        if (role === 'USER_2') return 'bg-amber-50 text-amber-600 border border-amber-100';
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
    };

    // --- MODALS ---
    window.showUserForm = (userId = null) => {
        const isEdit = userId !== null;
        let userData = { username: '', role: 'USER_2' };

        const html = `
            <div class="flex justify-between items-center mb-8">
                <h3 class="text-2xl font-black">${isEdit ? 'Modifier Membre' : 'Nouveau Membre'}</h3>
                <button onclick="closeModal()" class="font-bold text-gray-400">✕</button>
            </div>
            <form id="user-form" class="space-y-6">
                <div>
                    <label class="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Identifiant</label>
                    <input type="text" name="username" required class="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600 font-bold">
                </div>
                <div>
                    <label class="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Mot de passe</label>
                    <input type="password" name="password" ${isEdit ? '' : 'required'} class="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600 font-bold">
                </div>
                <div>
                    <label class="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Rôle</label>
                    <select name="role" class="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none">
                        <option value="USER_1">USER_1 (Consultant)</option>
                        <option value="USER_2" selected>USER_2 (Gestionnaire)</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <button type="submit" class="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest">Enregistrer</button>
            </form>
        `;
        showModal(html);

        if (isEdit) {
            getService().getUsers().then(users => {
                const u = users.find(x => x.id === userId);
                if (u) {
                    document.querySelector('[name="username"]').value = u.username;
                    document.querySelector('[name="role"]').value = u.role;
                }
            });
        }

        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            try {
                if (isEdit) await getService().updateUser(userId, data);
                else await getService().createUser(data);
                closeModal();
                renderView();
                updateMetrics();
            } catch (err) { alert(err.message); }
        };
    };

    window.showRoomForm = () => {
        const html = `
            <div class="flex justify-between items-center mb-8">
                <h3 class="text-2xl font-black">Nouvelle Salle</h3>
                <button onclick="closeModal()" class="font-bold text-gray-400">✕</button>
            </div>
            <form id="room-form" class="space-y-6">
                <div>
                    <label class="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Nom de la Salle</label>
                    <input type="text" name="name" required class="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold">
                </div>
                <button type="submit" class="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest">Créer</button>
            </form>
        `;
        showModal(html);
        document.getElementById('room-form').onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            try {
                await getService().createRoom(data);
                closeModal();
                renderView();
                updateMetrics();
            } catch (err) { alert(err.message); }
        };
    };

    window.assignRoom = async (roomId) => {
        try {
            const users = await getService().getUsers();
            const user2List = users.filter(u => u.role === 'USER_2');
            const html = `
                <h3 class="text-xl font-black mb-6">Assigner Responsable</h3>
                <div class="space-y-2">
                    <button onclick="handleAssign(${roomId}, null)" class="w-full p-4 text-left rounded-2xl border-2 border-dashed border-red-100 text-red-600 font-bold italic">Désassigner</button>
                    ${user2List.map(u => `<button onclick="handleAssign(${roomId}, ${u.id})" class="w-full p-4 text-left bg-gray-50 rounded-2xl font-bold hover:bg-indigo-50 transition">@${u.username}</button>`).join('')}
                </div>
            `;
            showModal(html);
        } catch (e) { alert(e.message); }
    };

    window.handleAssign = async (roomId, userId) => {
        try {
            await getService().updateRoom(roomId, { assignedToId: userId });
            closeModal();
            renderView();
        } catch (e) { alert(e.message); }
    };

    window.deleteUser = async (id) => {
        if (confirm('Supprimer ?')) { await getService().deleteUser(id); renderView(); updateMetrics(); }
    };

    const showModal = (content) => {
        modalContent.innerHTML = content;
        modalContainer.classList.remove('hidden');
        modalContainer.classList.add('flex');
    };

    window.closeModal = () => {
        modalContainer.classList.add('hidden');
        modalContainer.classList.remove('flex');
    };

    window.showLoginForm = () => {
        document.body.innerHTML = `
            <div class="h-screen flex items-center justify-center bg-indigo-950 p-6">
                <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 text-center">
                    <img src="https://associamed.org/wp-content/uploads/2024/09/Couleurs.svg" class="h-20 mx-auto mb-8">
                    <h1 class="text-3xl font-black text-indigo-950 mb-2">Accès Personnel</h1>
                    <p class="text-gray-400 mb-8 font-bold text-sm uppercase tracking-widest">Connectez-vous pour continuer</p>
                    <form id="login-form" class="space-y-4">
                        <input type="text" name="username" placeholder="Identifiant" required class="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold">
                        <input type="password" name="password" placeholder="Mot de passe" required class="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold">
                        <button type="submit" class="w-full p-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest mt-4">Entrer</button>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            try {
                await window.ApiService.login(data.username, data.password);
                location.reload();
            } catch (err) { alert('Identifiants incorrects'); }
        };
    };

    // --- INIT ---
    if (checkLogin()) renderView();
});
