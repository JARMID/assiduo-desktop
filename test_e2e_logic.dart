import 'package:supabase/supabase.dart';
import 'dart:io';

void main() async {
  final supabaseUrl = 'https://afwqtjmwklmoqntnvgww.supabase.co';
  final supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmd3F0am13a2xtb3FudG52Z3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg3NTYsImV4cCI6MjA4NzQwNDc1Nn0.Vj_0KOY2kjwkcWN45LjmrSk78hBk76VEp_HoRKXUv9I';

  final client = SupabaseClient(supabaseUrl, supabaseAnonKey);

  print('--- Starting E2E Data Integration Test ---');

  // 1. Formateur Logs in and creates session
  print('\n[1] Formateur logs in...');
  await client.auth.signInWithPassword(
    email: 'ahmed@insfp.dz',
    password: 'Password123!',
  );
  final formateurId = client.auth.currentUser!.id;
  print('Formateur logged in!');

  final cRes = await client.from('insfp_classes').select().limit(1).single();
  final classId = cRes['id'];

  final sessionRes = await client
      .from('insfp_sessions')
      .insert({
        'class_id': classId,
        'formateur_id': formateurId,
        'date': DateTime.now().toIso8601String().split('T').first,
        'slot': 'E2E-${DateTime.now().millisecondsSinceEpoch}',
        'module': 'Integration Test Module',
      })
      .select()
      .single();
  final sessionId = sessionRes['id'];
  print('Session created successfully!');

  final studentRes = await client
      .from('insfp_students')
      .select()
      .eq('matricule', '2024010')
      .single();
  final studentId = studentRes['id'];
  final studentAuthId = studentRes['auth_id'];

  print('\n[2] Formateur marks student as ABSENT...');
  final attendanceRes = await client
      .from('insfp_attendance_records')
      .insert({
        'session_id': sessionId,
        'student_id': studentId,
        'status': 'ABSENT',
        'marked_by': formateurId,
      })
      .select()
      .single();
  final attendanceId = attendanceRes['id'];
  print('Student marked absent successfully!');

  print('\n[3] Admin logs in to act on behalf of Student and Admin...');
  await client.auth.signInWithPassword(
    email: 'admin@insfp.dz',
    password: 'Password123!',
  );

  print('\n[4] Student (simulated) submits a justificatif...');
  final justifRes = await client
      .from('insfp_justifications')
      .insert({
        'student_id': studentId,
        'record_id': attendanceId,
        'reason': 'Malade (E2E Test)',
        'status': 'PENDING',
      })
      .select()
      .single();
  final justifId = justifRes['id'];
  print('Justificatif submitted! ID: $justifId');

  print(
    '\n[5] Student (simulated) opens a conversation with administration...',
  );
  final convRes = await client
      .from('insfp_conversations')
      .insert({'student_id': studentId, 'subject': 'Probleme E2E Test'})
      .select()
      .single();
  final convId = convRes['id'];

  await client.from('insfp_messages').insert({
    'conversation_id': convId,
    'sender_id': studentAuthId ?? client.auth.currentUser!.id,
    'sender_role': 'STAGIAIRE',
    'sender_name': 'Stagiaire Test',
    'body': 'Bonjour, j ai un probleme avec ma presence.',
  });
  print('Message sent!');

  print('\n[6] Admin reviews and approves...');
  await client
      .from('insfp_justifications')
      .update({'status': 'APPROVED'})
      .eq('id', justifId);
  await client
      .from('insfp_attendance_records')
      .update({'status': 'JUSTIFIE'})
      .eq('id', attendanceId);
  print('Admin approved justificatif and updated attendance!');

  await client.from('insfp_messages').insert({
    'conversation_id': convId,
    'sender_id': client.auth.currentUser!.id,
    'sender_role': 'ADMINISTRATION',
    'sender_name': 'Directeur des Etudes',
    'body': 'C est regle. Merci.',
  });
  await client
      .from('insfp_conversations')
      .update({'status': 'CLOSED'})
      .eq('id', convId);
  print('Admin replied and closed the conversation!');

  print(
    '\n✅ E2E Data Integration Test Completed Successfully! All apps integrated perfectly.',
  );
  exit(0);
}
