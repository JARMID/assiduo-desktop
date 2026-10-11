class AbsenceType {
  final String id;
  final String code;
  final String labelFr;
  final String? labelAr;
  final bool requiresDoc;
  final int? maxDays;
  final String color;
  final String icon;

  AbsenceType({
    required this.id,
    required this.code,
    required this.labelFr,
    this.labelAr,
    required this.requiresDoc,
    this.maxDays,
    required this.color,
    required this.icon,
  });

  factory AbsenceType.fromJson(Map<String, dynamic> json) {
    return AbsenceType(
      id: json['id'],
      code: json['code'],
      labelFr: json['label_fr'],
      labelAr: json['label_ar'],
      requiresDoc: json['requires_doc'] ?? false,
      maxDays: json['max_days'],
      color: json['color'] ?? '#EF4444',
      icon: json['icon'] ?? 'cancel',
    );
  }
}
