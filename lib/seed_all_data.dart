// ignore_for_file: avoid_print

import 'package:supabase/supabase.dart';
import 'dart:io';
import 'dart:math';

void main() async {
  final supabaseUrl = 'https://afwqtjmwklmoqntnvgww.supabase.co';
  final supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmd3F0am13a2xtb3FudG52Z3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg3NTYsImV4cCI6MjA4NzQwNDc1Nn0.Vj_0KOY2kjwkcWN45LjmrSk78hBk76VEp_HoRKXUv9I';

  final client = SupabaseClient(supabaseUrl, supabaseAnonKey);

  print('Logging in as Admin...');
  try {
    await client.auth.signInWithPassword(
      email: 'admin@insfp.dz',
      password: 'Password123!',
    );
  } catch (e) {
    print('Failed to login as admin: $e');
    exit(1);
  }

  final random = Random();

  // 1. Classes
  print('\n--- Seeding Classes ---');
  final classNames = [
    'DEV1',
    'DEV2',
    'DEV3',
    'DEV4',
    'DEV5',
    'SON1',
    'SON2',
    'SON3',
    'SON4',
    'SON5',
    'TEM1',
    'TEM2',
    'TEM3',
    'TEM4',
    'TEM5',
    'IMAGE1',
    'IMAGE2',
    'IMAGE3',
    'IMAGE4',
    'IMAGE5',
    'MONTAGE1',
    'MONTAGE2',
    'MONTAGE3',
    'MONTAGE4',
    'MONTAGE5',
  ];
  List<Map<String, dynamic>> classes = [];
  for (var name in classNames) {
    var res = await client
        .from('insfp_classes')
        .select()
        .eq('name', name)
        .maybeSingle();
    if (res == null) {
      // Extract the semester number from the end of the string (e.g. 'DEV3' -> 'S3')
      final levelNum = RegExp(r'\d+').firstMatch(name)?.group(0) ?? '1';

      res = await client
          .from('insfp_classes')
          .insert({
            'name': name,
            'level': 'S$levelNum',
            'speciality': name.replaceAll(RegExp(r'[0-9]'), ''),
          })
          .select()
          .single();
    }

    classes.add(res);
    print('Class $name seeded: ${res['id']}');
  }

  // 2. Formateurs
  print('\n--- Seeding Formateurs ---');
  final formateursData = [
    {'first': 'Ahmed', 'last': 'Ali', 'matricule': 'F001'},
    {'first': 'Sara', 'last': 'Brahimi', 'matricule': 'F002'},
    {'first': 'Karim', 'last': 'Zitouni', 'matricule': 'F003'},
  ];
  List<String> formateurIds = [];

  for (var f in formateursData) {
    try {
      final authResponse = await client.functions.invoke(
        'create-user',
        body: {
          'email': '${f['first']!.toLowerCase()}@insfp.dz',
          'password': 'Password123!',
          'first_name': f['first'],
          'last_name': f['last'],
          'matricule': f['matricule'],
          'role': 'FORMATEUR',
        },
      );

      final authData = authResponse.data as Map<String, dynamic>;
      final authUserId = authData['user']?['id'] ?? authData['id'];
      if (authUserId != null) {
        formateurIds.add(authUserId);
        print('Formateur ${f['first']} seeded.');
      }
    } catch (e) {
      print('Formateur ${f['first']} might already exist. Fetching id...');
      final existing = await client
          .from('insfp_users')
          .select('id')
          .eq('matricule', f['matricule']!)
          .maybeSingle();
      if (existing != null) {
        formateurIds.add(existing['id']);
      }
    }
  }

  // 3. Students
  print('\n--- Seeding Students ---');
  List<Map<String, dynamic>> students = [];
  int matriculeCounter = 2024010;

  for (int i = 0; i < 12; i++) {
    final mat = '${matriculeCounter++}';
    final first = 'Student$i';
    final last = 'Test';
    try {
      final authResponse = await client.functions.invoke(
        'create-user',
        body: {
          'email': 'student$i@insfp.dz',
          'password': 'Password123!',
          'first_name': first,
          'last_name': last,
          'matricule': mat,
          'role': 'STAGIAIRE',
        },
      );

      final authData = authResponse.data as Map<String, dynamic>;
      final authUserId = authData['user']?['id'] ?? authData['id'];

      if (authUserId != null) {
        var studentRes = await client
            .from('insfp_students')
            .select()
            .eq('matricule', mat)
            .maybeSingle();
        studentRes ??= await client
            .from('insfp_students')
            .insert({
              'matricule': mat,
              'first_name': first,
              'last_name': last,
              'qr_code': 'QR-$mat',
              'auth_id': authUserId,
            })
            .select()
            .single();

        students.add(studentRes);
        print('Student $mat seeded.');
      }
    } catch (e) {
      print('Student $mat might exist. Fetching...');
      final existing = await client
          .from('insfp_students')
          .select()
          .eq('matricule', mat)
          .maybeSingle();
      if (existing != null) students.add(existing);
    }
  }

  // Assign Students to Classes
  print('\n--- Assigning Students to Classes ---');
  for (int i = 0; i < students.length; i++) {
    final studentId = students[i]['id'];
    final classId = classes[i % classes.length]['id'];
    final existing = await client
        .from('insfp_class_students')
        .select()
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .maybeSingle();
    if (existing == null) {
      await client.from('insfp_class_students').insert({
        'student_id': studentId,
        'class_id': classId,
      });
    }
  }
  print('Students assigned to classes.');

  // 4. Sessions & Attendance
  print('\n--- Seeding Sessions & Attendance ---');
  final slots = [
    '08:00 - 09:30',
    '09:30 - 11:00',
    '11:00 - 12:30',
    '13:30 - 15:00',
  ];
  final modules = ['Algo', 'Web', 'Mobile', 'Design', 'Base de données'];

  for (int i = 0; i < 15; i++) {
    final c = classes[random.nextInt(classes.length)];
    final fId = formateurIds[random.nextInt(formateurIds.length)];
    final date = DateTime.now()
        .subtract(Duration(days: random.nextInt(30)))
        .toIso8601String()
        .split('T')
        .first;
    final slot = slots[random.nextInt(slots.length)];

    var sessionRes = await client
        .from('insfp_sessions')
        .select()
        .eq('class_id', c['id'])
        .eq('date', date)
        .eq('slot', slot)
        .maybeSingle();
    if (sessionRes == null) {
      try {
        sessionRes = await client
            .from('insfp_sessions')
            .insert({
              'class_id': c['id'],
              'formateur_id': fId,
              'date': date,
              'slot': slot,
              'module': modules[random.nextInt(modules.length)],
            })
            .select()
            .single();
      } catch (e) {
        print('Session skipped (duplicate): $e');
      }
    }

    if (sessionRes != null) {
      final sessionId = sessionRes['id'];
      // Get students for this class
      final classStudents = await client
          .from('insfp_class_students')
          .select('student_id')
          .eq('class_id', c['id']);

      for (var cs in classStudents) {
        final stId = cs['student_id'];
        final statusRoll = random.nextInt(100);
        String status = 'PRESENT';
        if (statusRoll > 85) {
          status = 'ABSENT';
        } else if (statusRoll > 75)
          status = 'EN_RETARD';
        else if (statusRoll > 70)
          status = 'JUSTIFIE';

        final existingRecord = await client
            .from('insfp_attendance_records')
            .select()
            .eq('session_id', sessionId)
            .eq('student_id', stId)
            .maybeSingle();
        if (existingRecord == null) {
          await client.from('insfp_attendance_records').insert({
            'session_id': sessionId,
            'student_id': stId,
            'status': status,
            'marked_by': fId,
          });
        }
      }
    }
  }
  print('Sessions and attendance seeded.');

  // 5. Notifications
  print('\n--- Seeding Notifications ---');
  final adminUserId = client.auth.currentUser!.id;
  for (int i = 0; i < 5; i++) {
    await client.from('insfp_notifications').insert({
      'target_user_id': adminUserId,
      'title': 'System Update ${i + 1}',
      'body': 'This is a test notification for the admin portal.',
      'type': 'SYSTEM',
      'is_read': random.nextBool(),
    });
  }

  final studentIds = students.map((s) => s['auth_id'] as String).toList();
  for (var studentId in studentIds) {
    await client.from('insfp_notifications').insert({
      'target_user_id': studentId,
      'title': 'Welcome to INSFP',
      'body': 'Your account has been set up successfully.',
      'type': 'INFO',
      'data_payload': {'welcome': true},
    });
  }

  // Create a password reset notification
  if (students.isNotEmpty) {
    await client.from('insfp_notifications').insert({
      'target_user_id': adminUserId,
      'title': 'Demande de réinitialisation',
      'body':
          'Le stagiaire ${students[0]['first_name']} a oublié son mot de passe.',
      'type': 'PASSWORD_RESET',
      'data_payload': {'matricule': students[0]['matricule']},
      'is_read': false,
    });
  }
  print('Notifications seeded.');

  // 6. Conversations & Messages
  print('\n--- Seeding Messages ---');
  if (students.isNotEmpty) {
    final st = students[0];
    var convRes = await client
        .from('insfp_conversations')
        .select()
        .eq('student_id', st['id'])
        .maybeSingle();
    convRes ??= await client
        .from('insfp_conversations')
        .insert({
          'student_id': st['id'],
          'subject': 'Question à propos des absences',
          'status': 'OPEN',
        })
        .select()
        .single();

    await client.from('insfp_messages').insert([
      {
        'conversation_id': convRes['id'],
        'sender_id': st['id'],
        'sender_role': 'STAGIAIRE',
        'sender_name': '${st['first_name']} ${st['last_name']}',
        'body':
            'Bonjour, j\'ai une absence non justifiée que je voudrais corriger.',
      },
      {
        'conversation_id': convRes['id'],
        'sender_id': adminUserId,
        'sender_role': 'ADMIN',
        'sender_name': 'Administration',
        'body': 'Bonjour, veuillez nous apporter le justificatif médical.',
      },
    ]);
  }
  print('Messages seeded.');

  print('\nAll data seeded successfully!');
  exit(0);
}
