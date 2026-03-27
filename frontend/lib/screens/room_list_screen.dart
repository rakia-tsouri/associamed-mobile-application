import 'package:flutter/material.dart';

import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/room.dart';
import '../models/user.dart';
import 'user_management_screen.dart';

class RoomListScreen extends StatefulWidget {
  const RoomListScreen({super.key});

  @override
  State<RoomListScreen> createState() => _RoomListScreenState();
}

class _RoomListScreenState extends State<RoomListScreen> {
  int _selectedRoomIndex = 0;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final user = provider.user;
    final allRooms = provider.rooms;
    final isAdmin = user?.role == UserRole.admin;
    final isUser2 = user?.role == UserRole.user2;
    final isUser1 = user?.role == UserRole.user1;

    // Filter rooms for User 2
    final userRooms = isUser2 
        ? allRooms.where((r) => r.assignedToId == user?.id).toList()
        : allRooms;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),

      appBar: AppBar(
        title: Image.asset(
          'assets/images/associamed.PNG',
          height: 40,
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (isAdmin)
             IconButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UserManagementScreen())),
              icon: const Icon(Icons.people, color: Color(0xFF1A237E)),
              tooltip: 'Gérer Utilisateurs',
            ),
          IconButton(
            onPressed: () => provider.logout(),
            icon: const Icon(Icons.logout, color: Colors.redAccent),
          ),
        ],
      ),
      body: Stack(
        children: [
          Center(
            child: Opacity(
              opacity: 0.15,
              child: Image.asset(
                'assets/images/doctime_logo.jpeg',
                fit: BoxFit.contain,
                width: double.infinity,
              ),
            ),
          ),
          RefreshIndicator(
            onRefresh: () => provider.fetchRooms(),
            child: isUser1 ? _buildUser1Overview(user, allRooms) : (isUser2 ? _buildUser2View(userRooms) : _buildAdminView(allRooms, provider)),
          ),
        ],
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: () => _showAddRoomDialog(context),
              backgroundColor: const Color(0xFF1A237E),
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('Nouvelle Salle', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
      bottomNavigationBar: isUser2 && userRooms.length > 1
          ? BottomNavigationBar(
              currentIndex: _selectedRoomIndex.clamp(0, userRooms.length - 1),
              onTap: (index) => setState(() => _selectedRoomIndex = index),
              selectedItemColor: const Color(0xFF1A237E),
              unselectedItemColor: Colors.grey,
              items: userRooms.map((r) => BottomNavigationBarItem(
                icon: const Icon(Icons.meeting_room),
                label: r.name,
              )).toList(),
            )
          : null,
    );
  }

  Widget _buildUser1Overview(User? user, List<Room> rooms) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Tableau de Bord', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF1A237E))),
          const SizedBox(height: 8),
          Text('Aperçu global Associa-Med', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold)),
          const SizedBox(height: 32),
          _buildStatCard('Salles Actives', rooms.length.toString(), Icons.door_front_door, Colors.indigo),
          const SizedBox(height: 16),
          _buildStatCard('Capacité Totale', (rooms.length * 4).toString(), Icons.people, Colors.green),
          const SizedBox(height: 32),
          const Text('Note: En tant que Consultant (USER_1), vous avez un accès en lecture seule aux statistiques.', 
            style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey)),
          const SizedBox(height: 24),
          const Text('CAPACITÉ DES SALLES', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1A237E), letterSpacing: 1.5, fontSize: 12)),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.0,
            ),
            itemCount: rooms.length,
            itemBuilder: (context, index) => _buildRoomCapacityCard(rooms[index]),
          ),
        ],
      ),
    );
  }

  Widget _buildRoomCapacityCard(Room room) {
    final statusColor = room.availableSlots == 0 ? Colors.red : (room.availableSlots < 2 ? Colors.orange : Colors.green);
    
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.indigo.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
        border: Border.all(color: Colors.indigo.withValues(alpha: 0.1)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.meeting_room, size: 48, color: statusColor),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              room.name,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF1A237E)),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '${room.availableSlots} / 4',
              style: TextStyle(color: statusColor, fontWeight: FontWeight.w900, fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUser2View(List<Room> rooms) {
    if (rooms.isEmpty) return const Center(child: Text('Aucune salle ne vous est assignée.'));
    
    final room = rooms[_selectedRoomIndex.clamp(0, rooms.length - 1)];
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(32),
              boxShadow: [BoxShadow(color: Colors.indigo.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, 10))],
            ),
            child: Column(
              children: [
                const Icon(Icons.room_service, size: 64, color: Color(0xFF1A237E)),
                const SizedBox(height: 16),
                Text(room.name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text('Gestion de la File', style: TextStyle(color: Colors.grey[400], fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildSlotControl(room, false),
                    Text(room.availableSlots.toString(), style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900)),
                    _buildSlotControl(room, true),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Places Disponibles', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
              ],
            ),
          ),
          if (rooms.length > 1)
            Padding(
              padding: const EdgeInsets.only(top: 24),
              child: Text('Utilisez la barre de navigation pour changer de salle', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
            ),
        ],
      ),
    );
  }

  Widget _buildAdminView(List<Room> rooms, AppProvider provider) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Row(
          children: [
             Expanded(child: _buildStatCard('Salles', rooms.length.toString(), Icons.meeting_room, Colors.indigo)),
             const SizedBox(width: 16),
             Expanded(child: _buildStatCard('Membres', provider.users.length.toString(), Icons.people, Colors.orange)),
          ],
        ),
        const SizedBox(height: 32),
        const Text('LISTE DES SALLES', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1A237E), letterSpacing: 1.5, fontSize: 12)),
        const SizedBox(height: 16),
        ...rooms.map((r) => _RoomCard(room: r)),
        const SizedBox(height: 100), // Space for FAB
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          Text(title, style: TextStyle(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildSlotControl(Room room, bool increment) {
    final provider = context.read<AppProvider>();
    return IconButton(
      onPressed: () => increment ? provider.incrementSlots(room) : provider.decrementSlots(room),
      iconSize: 48,
      icon: Icon(increment ? Icons.add_circle : Icons.remove_circle, color: increment ? Colors.green : Colors.redAccent),
    );
  }

  // User Management is now handled in UserManagementScreen

  void _showAddRoomDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nouvelle Salle'),
        content: TextField(controller: controller, decoration: const InputDecoration(labelText: 'Nom de la salle')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                context.read<AppProvider>().addRoom(controller.text);
                Navigator.pop(context);
              }
            },
            child: const Text('Créer'),
          ),
        ],
      ),
    );
  }
}

class _RoomCard extends StatelessWidget {
  final Room room;

  const _RoomCard({required this.room});

  @override
  Widget build(BuildContext context) {
    final provider = context.read<AppProvider>();
    final userRole = provider.user?.role;
    final isAdmin = userRole == UserRole.admin;
    final isUser2 = userRole == UserRole.user2;
    final canManage = isAdmin || isUser2;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onLongPress: isAdmin ? () => _showAdminOptions(context) : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      room.name,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.circle,
                          size: 12,
                          color: _getStatusColor(room.availableSlots),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${room.availableSlots} / 4 places disponibles',
                          style: TextStyle(color: Colors.grey[700]),
                        ),
                      ],
                    ),
                    if (isAdmin && room.assignedToId != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          'Assignée à l\'ID: ${room.assignedToId}',
                          style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic),
                        ),
                      ),
                  ],
                ),
              ),
              if (canManage)
                Row(
                  children: [
                    IconButton(
                      onPressed: () => provider.decrementSlots(room),
                      icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                    ),
                    Text(
                      '${room.availableSlots}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      onPressed: () => provider.incrementSlots(room),
                      icon: const Icon(Icons.add_circle_outline, color: Colors.green),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAdminOptions(BuildContext context) {
    final provider = context.read<AppProvider>();
    final user2s = provider.users.where((u) => u.role == UserRole.user2).toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('GESTION SALLE', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1A237E), letterSpacing: 2)),
              const SizedBox(height: 24),
              ListTile(
                leading: const Icon(Icons.person_add, color: Colors.blue),
                title: const Text('Assigner à un Membre'),
                onTap: () {
                  Navigator.pop(context);
                  _showAssignDialog(context, user2s);
                },
              ),
              ListTile(
                leading: const Icon(Icons.person_remove, color: Colors.orange),
                title: const Text('Désassigner'),
                onTap: () {
                  provider.assignRoom(room.id, null);
                  Navigator.pop(context);
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.delete, color: Colors.red),
                title: const Text('Supprimer la salle'),
                onTap: () {
                  provider.deleteRoom(room.id);
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAssignDialog(BuildContext context, List<User> user2s) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Choisir un Membre'),
        content: user2s.isEmpty 
          ? const Text('Aucun membre (USER_2) n\'est disponible.')
          : SizedBox(
              width: double.maxFinite,
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: user2s.length,
                itemBuilder: (context, index) {
                  final u = user2s[index];
                  return ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.person)),
                    title: Text(u.username),
                    onTap: () {
                      context.read<AppProvider>().assignRoom(room.id, u.id);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
      ),
    );
  }

  Color _getStatusColor(int slots) {
    if (slots == 0) return Colors.red;
    if (slots < 2) return Colors.orange;
    return Colors.green;
  }
}
