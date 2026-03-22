import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/user.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch users when screen is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppProvider>().fetchUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final users = provider.users;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      appBar: AppBar(
        title: const Text('Gestion des Utilisateurs', style: TextStyle(color: Color(0xFF1A237E), fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1A237E)),
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
            onRefresh: () => provider.fetchUsers(),
            child: ListView.builder(
          padding: const EdgeInsets.all(24),
          itemCount: users.length,
          itemBuilder: (context, index) {
            final user = users[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: _getRoleColor(user.role).withValues(alpha: 0.2),
                  child: Icon(Icons.person, color: _getRoleColor(user.role)),
                ),
                title: Text(user.username, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(_getRoleName(user.role), style: TextStyle(color: _getRoleColor(user.role))),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit, color: Colors.blue),
                      onPressed: () => _showEditUserDialog(context, user),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _confirmDeleteUser(context, user),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddUserDialog(context),
        backgroundColor: const Color(0xFF1A237E),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Color _getRoleColor(UserRole role) {
    if (role == UserRole.admin) return Colors.purple;
    if (role == UserRole.user1) return Colors.teal;
    return Colors.orange;
  }

  String _getRoleName(UserRole role) {
    if (role == UserRole.admin) return 'ADMIN';
    if (role == UserRole.user1) return 'USER_1';
    return 'USER_2';
  }

  void _showAddUserDialog(BuildContext context) {
    final userController = TextEditingController();
    final passController = TextEditingController();
    String role = 'USER_2';
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Nouveau Membre'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: userController, decoration: const InputDecoration(labelText: 'Identifiant')),
              TextField(controller: passController, decoration: const InputDecoration(labelText: 'Mot de passe')),
              DropdownButton<String>(
                value: role,
                isExpanded: true,
                onChanged: (v) => setDialogState(() => role = v!),
                items: ['ADMIN', 'USER_1', 'USER_2'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
            ElevatedButton(
              onPressed: () {
                if (userController.text.isNotEmpty && passController.text.isNotEmpty) {
                  context.read<AppProvider>().addUser(userController.text, passController.text, role);
                  Navigator.pop(context);
                }
              },
              child: const Text('Créer'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditUserDialog(BuildContext context, User user) {
    final userController = TextEditingController(text: user.username);
    final passController = TextEditingController(); // Empty for password updates
    String role = _getRoleName(user.role);
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Modifier Membre'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: userController, decoration: const InputDecoration(labelText: 'Identifiant')),
              TextField(controller: passController, decoration: const InputDecoration(labelText: 'Nouveau mot de passe (optionnel)')),
              DropdownButton<String>(
                value: role,
                isExpanded: true,
                onChanged: (v) => setDialogState(() => role = v!),
                items: ['ADMIN', 'USER_1', 'USER_2'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
            ElevatedButton(
              onPressed: () {
                context.read<AppProvider>().updateUser(
                  user.id,
                  username: userController.text.isNotEmpty ? userController.text : null,
                  password: passController.text.isNotEmpty ? passController.text : null,
                  role: role,
                );
                Navigator.pop(context);
              },
              child: const Text('Sauvegarder'),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteUser(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer Membre'),
        content: Text('Voulez-vous vraiment supprimer ${user.username} ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              context.read<AppProvider>().deleteUser(user.id);
              Navigator.pop(context);
            },
            child: const Text('Supprimer', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
