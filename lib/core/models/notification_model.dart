class AppNotification {
  final String id;
  final String userId;
  final String title;
  final String body;
  final String type;
  final String? refType;
  final String? refId;
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    this.refType,
    this.refId,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'],
      userId: json['user_id'],
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: json['type'] ?? 'INFO',
      refType: json['ref_type'],
      refId: json['ref_id'],
      isRead: json['is_read'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
