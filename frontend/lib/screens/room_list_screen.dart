import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/room.dart';
import '../models/user.dart';

class RoomListScreen extends StatelessWidget {
  const RoomListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final user = provider.user;
    final rooms = provider.rooms;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestion des Salles'),
        backgroundColor: const Color(0xFF1976D2),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            onPressed: () => provider.logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.fetchRooms(),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.blue.withOpacity(0.05),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: _getRoleColor(user?.role),
                    child: const Icon(Icons.person, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bonjour, ${user?.username}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        _getRoleLabel(user?.role),
                        style: TextStyle(color: Colors.grey[600], fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: rooms.isEmpty
                  ? const Center(child: Text('Aucune salle assignée'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: rooms.length,
                      itemBuilder: (context, index) {
                        final room = rooms[index];
                        return _RoomCard(room: room);
                      },
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: user?.role == UserRole.admin
          ? FloatingActionButton(
              onPressed: () => _showAddRoomDialog(context),
              backgroundColor: const Color(0xFF1976D2),
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }

  void _showAddRoomDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nouvelle Salle'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'Nom de la salle'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
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

  Color _getRoleColor(UserRole? role) {
    switch (role) {
      case UserRole.admin:
        return Colors.red;
      case UserRole.user2:
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  String _getRoleLabel(UserRole? role) {
    switch (role) {
      case UserRole.admin:
        return 'Administrateur';
      case UserRole.user2:
        return 'Personnel Salle';
      default:
        return 'Consultant';
    }
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
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.person_add, color: Colors.blue),
              title: const Text('Assigner à User 2'),
              onTap: () {
                provider.assignRoom(room.id, 3); // Mock assign to User 2 (ID 3)
                Navigator.pop(context);
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
    );
  }

  Color _getStatusColor(int slots) {
    if (slots == 0) return Colors.red;
    if (slots < 2) return Colors.orange;
    return Colors.green;
  }
}
