class Room {
  final int id;
  final String name;
  final int availableSlots;
  final int? assignedToId;

  Room({
    required this.id,
    required this.name,
    required this.availableSlots,
    this.assignedToId,
  });

  Room copyWith({
    int? id,
    String? name,
    int? availableSlots,
    int? assignedToId,
  }) {
    return Room(
      id: id ?? this.id,
      name: name ?? this.name,
      availableSlots: availableSlots ?? this.availableSlots,
      assignedToId: assignedToId ?? this.assignedToId,
    );
  }

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'],
      name: json['name'],
      availableSlots: json['availableSlots'],
      assignedToId: json['assignedTo']?['id'],
    );
  }
}
