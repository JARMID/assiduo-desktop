import 'package:flutter/material.dart';

class StudentDetailsView extends StatelessWidget {
  final String studentId;

  const StudentDetailsView({super.key, required this.studentId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Details')),
      body: Center(
        child: Text('Details for student: $studentId'),
      ),
    );
  }
}
