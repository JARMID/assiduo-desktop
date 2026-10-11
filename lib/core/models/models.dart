class AppUser {
  final String id;
  final String role; // 'ADMINISTRATION' or 'FORMATEUR'
  final String firstName;
  final String lastName;
  final String? matricule;
  final DateTime createdAt;

  AppUser({
    required this.id,
    required this.role,
    required this.firstName,
    required this.lastName,
    this.matricule,
    required this.createdAt,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      firstName: json['first_name']?.toString() ?? '',
      lastName: json['last_name']?.toString() ?? '',
      matricule: json['matricule']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  String get fullName => '$firstName $lastName';
}

class Student {
  final String id;
  final String matricule;
  final String firstName;
  final String lastName;
  final String? qrCode;
  final String? authId;
  final DateTime createdAt;

  // Optional, populated when fetching classes for a student
  final List<ClassGroup>? classes;

  Student({
    required this.id,
    required this.matricule,
    required this.firstName,
    required this.lastName,
    this.qrCode,
    this.authId,
    required this.createdAt,
    this.classes,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id']?.toString() ?? '',
      matricule: json['matricule']?.toString() ?? '',
      firstName: json['first_name']?.toString() ?? '',
      lastName: json['last_name']?.toString() ?? '',
      qrCode: json['qr_code']?.toString(),
      authId: json['auth_id']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      classes: json['classes'] != null
          ? (json['classes'] as List)
                .map((c) => ClassGroup.fromJson(c as Map<String, dynamic>))
                .toList()
          : null,
    );
  }

  String get fullName => '$firstName $lastName';
}

class ClassGroup {
  final String id;
  final String name;
  final String level;
  final String speciality;
  final DateTime createdAt;

  // Optional, populated when fetching classes with their modules
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
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      level: json['level']?.toString() ?? '',
      speciality: json['speciality']?.toString() ?? '',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      modules: json['modules'] != null
          ? (json['modules'] as List)
                .map((m) => ClassModule.fromJson(m as Map<String, dynamic>))
                .toList()
          : null,
    );
  }

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
  final DateTime createdAt;

  ClassModule({
    required this.id,
    required this.classId,
    required this.name,
    required this.createdAt,
  });

  factory ClassModule.fromJson(Map<String, dynamic> json) {
    return ClassModule(
      id: json['id']?.toString() ?? '',
      classId: json['class_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class AttendanceSession {
  final String id;
  final String classId;
  final String formateurId;
  final DateTime date;
  final String slot; // SLOT_08_30, SLOT_10_45, etc.
  final String? module;
  final DateTime createdAt;

  // Optional relations
  final ClassGroup? classGroup;
  final AppUser? formateur;

  AttendanceSession({
    required this.id,
    required this.classId,
    required this.formateurId,
    required this.date,
    required this.slot,
    this.module,
    required this.createdAt,
    this.classGroup,
    this.formateur,
  });

  factory AttendanceSession.fromJson(Map<String, dynamic> json) {
    return AttendanceSession(
      id: json['id']?.toString() ?? '',
      classId: json['class_id']?.toString() ?? '',
      formateurId: json['formateur_id']?.toString() ?? '',
      date: json['date'] != null
          ? DateTime.tryParse(json['date'].toString()) ?? DateTime.now()
          : DateTime.now(),
      slot: json['slot']?.toString() ?? '',
      module: json['module']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      classGroup: json['insfp_classes'] != null
          ? ClassGroup.fromJson(json['insfp_classes'] as Map<String, dynamic>)
          : null,
      formateur: json['insfp_users'] != null
          ? AppUser.fromJson(json['insfp_users'] as Map<String, dynamic>)
          : null,
    );
  }
}

class AttendanceRecord {
  final String id;
  final String sessionId;
  final String studentId;
  final String status; // PRESENT, ABSENT, EN_RETARD, JUSTIFIE
  final String? markedBy;
  final DateTime markedAt;

  // Optional relation
  final Student? student;

  AttendanceRecord({
    required this.id,
    required this.sessionId,
    required this.studentId,
    required this.status,
    this.markedBy,
    required this.markedAt,
    this.student,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id']?.toString() ?? '',
      sessionId: json['session_id']?.toString() ?? '',
      studentId: json['student_id']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      markedBy: json['marked_by']?.toString(),
      markedAt: json['marked_at'] != null
          ? DateTime.tryParse(json['marked_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      student: json['insfp_students'] != null
          ? Student.fromJson(json['insfp_students'] as Map<String, dynamic>)
          : null,
    );
  }
}

class Speciality {
  final String id;
  final String code;
  final String nameAr;
  final String? nameFr;
  final String? trainingType;
  final String? duration;
  final String? diploma;
  final String? conditions;
  final int? capacity;

  Speciality({
    required this.id,
    required this.code,
    required this.nameAr,
    this.nameFr,
    this.trainingType,
    this.duration,
    this.diploma,
    this.conditions,
    this.capacity,
  });

  factory Speciality.fromJson(Map<String, dynamic> json) {
    return Speciality(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      nameAr: json['name_ar']?.toString() ?? '',
      nameFr: json['name_fr']?.toString(),
      trainingType: json['training_type']?.toString(),
      duration: json['duration']?.toString(),
      diploma: json['diploma']?.toString(),
      conditions: json['conditions']?.toString(),
      capacity: json['capacity'] != null
          ? int.tryParse(json['capacity'].toString())
          : null,
    );
  }
}
