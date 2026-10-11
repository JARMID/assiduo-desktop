class Justification {
  final String id;
  final String recordId;
  final String studentId;
  final String? absenceTypeId;
  final String title;
  final String reason;
  final String? documentUrl;
  final String status; // PENDING, APPROVED, REJECTED
  final String? adminNote;
  final DateTime createdAt;

  Justification({
    required this.id,
    required this.recordId,
    required this.studentId,
    this.absenceTypeId,
    required this.title,
    required this.reason,
    this.documentUrl,
    required this.status,
    this.adminNote,
    required this.createdAt,
  });

  factory Justification.fromJson(Map<String, dynamic> json) {
    return Justification(
      id: json['id'],
      recordId: json['record_id'] ?? '',
      studentId: json['student_id'] ?? '',
      absenceTypeId: json['absence_type_id'],
      title: json['title'] ?? '',
      reason: json['reason'] ?? '',
      documentUrl: json['document_url'],
      status: json['status'] ?? 'PENDING',
      adminNote: json['admin_note'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
