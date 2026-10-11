class AttendanceSession {
  final String id;
  final String classId;
  final String? formateurId;
  final DateTime date;
  final String slot; // SLOT_08_30, SLOT_10_45, SLOT_13_30, SLOT_15_00
  final String? module;
  final DateTime createdAt;

  // Joined data
  final String? className;
  final String? formateurName;

  AttendanceSession({
    required this.id,
    required this.classId,
    this.formateurId,
    required this.date,
    required this.slot,
    this.module,
    required this.createdAt,
    this.className,
    this.formateurName,
  });

  factory AttendanceSession.fromJson(Map<String, dynamic> json) {
    // Handle joined class/formateur data
    String? clsName;
    if (json['classes'] != null) {
      clsName = (json['classes'] as Map<String, dynamic>)['name'] as String?;
    }
    String? fmtName;
    if (json['formateur'] != null) {
      final f = json['formateur'] as Map<String, dynamic>;
      fmtName = '${f['first_name']} ${f['last_name']}';
    }

    return AttendanceSession(
      id: json['id'] as String,
      classId: json['class_id'] as String,
      formateurId: json['formateur_id'] as String?,
      date: DateTime.parse(json['date'] as String),
      slot: json['slot'] as String,
      module: json['module'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      className: clsName,
      formateurName: fmtName,
    );
  }

  String get slotLabel {
    switch (slot) {
      case 'SLOT_08_30':
        return '08:30';
      case 'SLOT_10_45':
        return '10:45';
      case 'SLOT_13_30':
        return '13:30';
      case 'SLOT_15_00':
        return '15:00';
      default:
        return slot;
    }
  }
}
