/// Represents a class/group (formerly "Promotion") in the database.
/// Maps to the `classes` table.
class ClassGroup {
  final String id;
  final String name;
  final String level;
  final String speciality;
  final DateTime createdAt;
  final List<ClassModule>? modules;

  ClassGroup({
    required this.id,
    required this.name,
    required this.level,
    required this.speciality,
    required this.createdAt,
    this.modules,
  });

  factory ClassGroup.fromJson(Map<String, dynamic> json) {
    return ClassGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      level: json['level'] as String? ?? '',
      speciality: json['speciality'] as String? ?? '',
      createdAt: DateTime.parse(json['created_at'] as String),
      modules: json['modules'] != null
          ? (json['modules'] as List)
                .map((m) => ClassModule.fromJson(m))
                .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {'name': name, 'level': level, 'speciality': speciality};
  }

  @override
  String toString() => name;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ClassGroup && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

class ClassModule {
  final String id;
  final String classId;
  final String name;

  ClassModule({required this.id, required this.classId, required this.name});

  factory ClassModule.fromJson(Map<String, dynamic> json) {
    return ClassModule(
      id: json['id'] as String,
      classId: json['class_id'] as String,
      name: json['name'] as String,
    );
  }
}
