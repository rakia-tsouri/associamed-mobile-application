import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/room.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AppProvider with ChangeNotifier {
  final ApiService _api = ApiService();

  User? _user;
  List<Room> _rooms = [];
  List<User> _users = [];
  bool _isLoading = false;
  late Timer _refreshTimer; // Add this

  User? get user => _user;
  List<Room> get rooms => _rooms;
  List<User> get users => _users;
  bool get isLoading => _isLoading;

  // Start auto-refresh when user logs in
  void _startAutoRefresh() {
    _refreshTimer = Timer.periodic(Duration(seconds: 2), (_) {
      fetchRooms();
    });
  }

  // Stop auto-refresh when user logs out
  void _stopAutoRefresh() {
    if (_refreshTimer.isActive) {
      _refreshTimer.cancel();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final loginData = await _api.login(username, password);
      if (loginData['user'] != null && loginData['user']['id'] != null) {
        final userId = loginData['user']['id'];
        _user = await _api.getProfile(userId);
      }

      if (_user != null) {
        await fetchRooms();
        if (_user!.role == UserRole.admin) await fetchUsers();
        _startAutoRefresh(); // Start polling after login
      }
    } catch (e) {
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
    return _user != null;
  }

  Future<void> logout() async {
    _stopAutoRefresh(); // Stop polling before logout
    _user = null;
    _rooms = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }

  Future<void> fetchUsers() async {
    _users = await _api.getUsers();
    notifyListeners();
  }

  Future<void> addUser(String username, String password, String role) async {
    await _api.createUser(username, password, role);
    await fetchUsers();
  }

  Future<void> updateUser(int id, {String? username, String? password, String? role}) async {
    await _api.updateUser(id, username: username, password: password, role: role);
    await fetchUsers();
  }

  Future<void> deleteUser(int id) async {
    await _api.removeUser(id);
    _users.removeWhere((u) => u.id == id);
    notifyListeners();
  }

  Future<void> fetchRooms() async {
    try {
      _rooms = await _api.getRooms();
      notifyListeners();
    } catch (e) {
      debugPrint('Fetch rooms error: $e');
    }
  }

  Future<void> incrementSlots(Room room) async {
    if (room.availableSlots < room.capacity) {
      try {
        final updatedRoom = await _api.incrementSlots(room.id);
        _updateLocalRoom(updatedRoom);
      } catch (e) {
        debugPrint('Increment error: $e');
      }
    }
  }

  Future<void> decrementSlots(Room room) async {
    if (room.availableSlots > 0) {
      try {
        final updatedRoom = await _api.decrementSlots(room.id);
        _updateLocalRoom(updatedRoom);
      } catch (e) {
        debugPrint('Decrement error: $e');
      }
    }
  }

  Future<void> addRoom(String name, int capacity) async {
    final newRoom = await _api.addRoom(name, capacity);
    _rooms.add(newRoom);
    notifyListeners();
  }

  Future<void> deleteRoom(int roomId) async {
    await _api.removeRoom(roomId);
    _rooms.removeWhere((r) => r.id == roomId);
    notifyListeners();
  }

  Future<void> assignRoom(int roomId, int? userId) async {
    await _api.assignRoom(roomId, userId);
    await fetchRooms();
  }

  void _updateLocalRoom(Room room) {
    final index = _rooms.indexWhere((r) => r.id == room.id);
    if (index != -1) {
      _rooms[index] = room;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _stopAutoRefresh(); // Clean up timer
    super.dispose();
  }
}