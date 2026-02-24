import 'dart:async';
import '../models/user.dart';
import '../models/room.dart';

class MockApiService {
  // Mock data
  final List<User> _users = [
    User(id: 1, username: 'admin', role: UserRole.admin),
    User(id: 2, username: 'user1', role: UserRole.user1),
    User(id: 3, username: 'user2', role: UserRole.user2),
  ];

  final List<Room> _rooms = [
    Room(id: 1, name: 'Cardiologie', availableSlots: 2, assignedToId: 3),
    Room(id: 2, name: 'Urgences', availableSlots: 0, assignedToId: 3),
    Room(id: 3, name: 'Pédiatrie', availableSlots: 4, assignedToId: null),
    Room(id: 4, name: 'Radiologie', availableSlots: 1, assignedToId: null),
  ];

  User? _currentUser;

  Future<User?> login(String username, String password) async {
    await Future.delayed(const Duration(seconds: 1));
    try {
      final user = _users.firstWhere((u) => u.username == username);
      _currentUser = user;
      return user;
    } catch (_) {
      return null;
    }
  }

  void logout() {
    _currentUser = null;
  }

  Future<List<Room>> getRooms() async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (_currentUser?.role == UserRole.user2) {
      return _rooms.where((r) => r.assignedToId == _currentUser?.id).toList();
    }
    return List.from(_rooms);
  }

  Future<Room> updateRoomSlots(int roomId, int slots) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _rooms.indexWhere((r) => r.id == roomId);
    if (index != -1) {
      _rooms[index] = _rooms[index].copyWith(availableSlots: slots);
      return _rooms[index];
    }
    throw Exception('Room not found');
  }

  Future<void> assignRoom(int roomId, int? userId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _rooms.indexWhere((r) => r.id == roomId);
    if (index != -1) {
      _rooms[index] = _rooms[index].copyWith(assignedToId: userId);
    }
  }

  Future<Room> addRoom(String name) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final newRoom = Room(
      id: _rooms.length + 1,
      name: name,
      availableSlots: 0,
    );
    _rooms.add(newRoom);
    return newRoom;
  }

  Future<void> removeRoom(int roomId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _rooms.removeWhere((r) => r.id == roomId);
  }

  // NOTE: This MockApiService can be replaced with a real ApiService 
  // that uses the http package to communicate with the NestJS backend.
}
