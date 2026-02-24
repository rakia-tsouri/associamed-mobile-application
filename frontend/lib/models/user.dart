enum UserRole {
  admin,
  user1,
  user2,
}

class User {
  final int id;
  final String username;
  final UserRole role;

  User({
    required this.id,
    required this.username,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      role: _parseRole(json['role']),
    );
  }

  static UserRole _parseRole(String roleStr) {
    switch (roleStr) {
      case 'ADMIN':
        return UserRole.admin;
      case 'USER_1':
        return UserRole.user1;
      case 'USER_2':
        return UserRole.user2;
      default:
        return UserRole.user1;
    }
  }
}
