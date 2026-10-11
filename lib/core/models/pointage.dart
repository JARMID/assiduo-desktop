/// Represents an attendance record (formerly "Pointage") in the database.
/// Maps to the `attendance_records` table.
class AttendanceRecord {
  final String id;
  final String sessionId;
  final String studentId;
  final String status; // PRESENT, ABSENT, EN_RETARD, JUSTIFIE
  final String? markedBy;
  final DateTime markedAt;

  // Joined data
  final String? studentName;
  final String? studentMatricule;

  AttendanceRecord({
    required this.id,
    required this.sessionId,
    required this.studentId,
    required this.status,
    this.markedBy,
    required this.markedAt,
    this.studentName,
    this.studentMatricule,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    String? name;
    String? mat;
    if (json['student'] != null) {
      final s = json['student'] as Map<String, dynamic>;
      name = '${s['first_name']} ${s['last_name']}';
      mat = s['matricule'] as String?;
    }

    return AttendanceRecord(
      id: json['id'] as String,
      sessionId: json['session_id'] as String,
      studentId: json['student_id'] as String,
      status: json['status'] as String,
      markedBy: json['marked_by'] as String?,
      markedAt: DateTime.parse(json['marked_at'] as String),
      studentName: name,
      studentMatricule: mat,
    );
  }

  AttendanceRecord copyWith({String? status, String? markedBy}) {
    return AttendanceRecord(
      id: id,
      sessionId: sessionId,
      studentId: studentId,
      status: status ?? this.status,
      markedBy: markedBy ?? this.markedBy,
      markedAt: DateTime.now(),
      studentName: studentName,
      studentMatricule: studentMatricule,
    );
  }
}
