import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/room.dart';

class ApiService {
  // Use localhost for Web, 10.0.2.2 for Android Emulator
 String get baseUrl => 'https://associamed-gestion-salles-production.up.railway.app';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    ).timeout(const Duration(seconds: 5));

    if (response.statusCode == 201 || response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['access_token']);
      return data;
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  Future<List<Room>> getRooms() async {
    final response = await http.get(
      Uri.parse('$baseUrl/rooms'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Room.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch rooms');
    }
  }

  Future<Room> updateRoomSlots(int roomId, int slots) async {
    // Current logic uses increment/decrement endpoints in backend
    // But update endpoint also exists. 
    // Let's use the patch update for slots for simplicity or specific endpoints
    final response = await http.patch(
      Uri.parse('$baseUrl/rooms/$roomId'),
      headers: await _getHeaders(),
      body: jsonEncode({'availableSlots': slots}),
    );

    if (response.statusCode == 200) {
      return Room.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update slots');
    }
  }

  Future<Room> incrementSlots(int roomId) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/rooms/$roomId/increment'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) return Room.fromJson(jsonDecode(response.body));
    throw Exception('Failed to increment');
  }

  Future<Room> decrementSlots(int roomId) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/rooms/$roomId/decrement'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) return Room.fromJson(jsonDecode(response.body));
    throw Exception('Failed to decrement');
  }

  Future<void> assignRoom(int roomId, int? userId) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/rooms/$roomId'),
      headers: await _getHeaders(),
      body: jsonEncode({'assignedToId': userId}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to assign room');
    }
  }

  Future<Room> addRoom(String name) async {
    final response = await http.post(
      Uri.parse('$baseUrl/rooms'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'name': name,
        'availableSlots': 0, // Mandatory for CreateRoomDto
      }),
    );

    if (response.statusCode == 201) {
      return Room.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to add room');
    }
  }

  Future<void> removeRoom(int roomId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/rooms/$roomId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to remove room');
    }
  }

  Future<User> getProfile(int id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/profile/$id'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) return User.fromJson(jsonDecode(response.body));
    throw Exception('Failed to get profile');
  }

  Future<List<User>> getUsers() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch users');
  }

  Future<User> createUser(String username, String password, String role) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'username': username,
        'password': password,
        'role': role,
      }),
    );
    if (response.statusCode == 201) return User.fromJson(jsonDecode(response.body));
    throw Exception('Failed to create user: ${response.body}');
  }

  Future<User> updateUser(int id, {String? username, String? password, String? role}) async {
    final body = <String, dynamic>{};
    if (username != null && username.isNotEmpty) body['username'] = username;
    if (password != null && password.isNotEmpty) body['password'] = password;
    if (role != null) body['role'] = role;

    final response = await http.patch(
      Uri.parse('$baseUrl/users/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(body),
    );
    if (response.statusCode == 200) return User.fromJson(jsonDecode(response.body));
    throw Exception('Failed to update user: ${response.body}');
  }

  Future<void> removeUser(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/users/$id'),
      headers: await _getHeaders(),
    );
    if (response.statusCode != 200) throw Exception('Failed to delete user');
  }
}
