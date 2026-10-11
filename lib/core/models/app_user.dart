class AppUser {
  final String id;
  final String role; // FORMATEUR, ADMINISTRATION, STAGIAIRE
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
      id: json['id'] as String,
      role: json['role'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      matricule: json['matricule'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'first_name': firstName,
      'last_name': lastName,
      'matricule': matricule,
    };
  }

  String get fullName => '$firstName $lastName';
}
