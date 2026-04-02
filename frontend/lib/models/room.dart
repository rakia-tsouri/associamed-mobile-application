class Room {
  final int id;
  final String name;
  final int availableSlots;
  final int capacity;
  final int? assignedToId;

  Room({
    required this.id,
    required this.name,
    required this.availableSlots,
    required this.capacity,
    this.assignedToId,
  });

  Room copyWith({
    int? id,
    String? name,
    int? availableSlots,
    int? capacity,
    int? assignedToId,
  }) {
    return Room(
      id: id ?? this.id,
      name: name ?? this.name,
      availableSlots: availableSlots ?? this.availableSlots,
      capacity: capacity ?? this.capacity,
      assignedToId: assignedToId ?? this.assignedToId,
    );
  }

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'],
      name: json['name'],
      availableSlots: json['availableSlots'],
      capacity: json['capacity'] ?? 4,
      assignedToId: json['assignedTo']?['id'],
    );
  }
}
