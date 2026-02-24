import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/room.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AppProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  User? _user;
  List<Room> _rooms = [];
  bool _isLoading = false;

  User? get user => _user;
  List<Room> get rooms => _rooms;
  bool get isLoading => _isLoading;

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final loginData = await _api.login(username, password);
      // Backend returns { access_token: string, user: { id: number, ... } }
      if (loginData['user'] != null && loginData['user']['id'] != null) {
        final userId = loginData['user']['id'];
        _user = await _api.getProfile(userId);
      } else {
        debugPrint('Login response missing user data: $loginData');
        _user = null;
      }
      
      if (_user != null) {
        await fetchRooms();
      }
    } catch (e) {
      debugPrint('Login details: User=$username, Error=$e');
      _user = null;
    }
    
    _isLoading = false;
    notifyListeners();
    return _user != null;
  }

  Future<void> logout() async {
    _user = null;
    _rooms = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }

  Future<void> fetchRooms() async {
    _rooms = await _api.getRooms();
    notifyListeners();
  }

  Future<void> incrementSlots(Room room) async {
    if (room.availableSlots < 4) {
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

  Future<void> addRoom(String name) async {
    final newRoom = await _api.addRoom(name);
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
    await fetchRooms(); // Refresh to see assignment logic if needed
  }

  void _updateLocalRoom(Room room) {
    final index = _rooms.indexWhere((r) => r.id == room.id);
    if (index != -1) {
      _rooms[index] = room;
      notifyListeners();
    }
  }
}
