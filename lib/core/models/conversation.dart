class Conversation {
  final String id;
  final String studentId;
  final String subject;
  final String contextType;
  final String status;
  final DateTime updatedAt;

  Conversation({
    required this.id,
    required this.studentId,
    required this.subject,
    required this.contextType,
    required this.status,
    required this.updatedAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'],
      studentId: json['student_id'],
      subject: json['subject'] ?? '',
      contextType: json['context_type'] ?? 'GENERAL',
      status: json['status'] ?? 'OPEN',
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
}

class Message {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderRole;
  final String senderName;
  final String body;
  final bool isSystem;
  final DateTime createdAt;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderRole,
    required this.senderName,
    required this.body,
    required this.isSystem,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'],
      conversationId: json['conversation_id'],
      senderId: json['sender_id'],
      senderRole: json['sender_role'],
      senderName: json['sender_name'] ?? '',
      body: json['body'] ?? '',
      isSystem: json['is_system'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
