import 'dart:io';
import 'package:supabase/supabase.dart';

void main() async {
  final supabaseUrl = 'https://afwqtjmwklmoqntnvgww.supabase.co';
  final supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmd3F0am13a2xtb3FudG52Z3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg3NTYsImV4cCI6MjA4NzQwNDc1Nn0.Vj_0KOY2kjwkcWN45LjmrSk78hBk76VEp_HoRKXUv9I';
  final client = SupabaseClient(supabaseUrl, supabaseAnonKey);

  final passwords = [
    'Password123!',
    'INSFP-ADMIN',
    'INSFP-admin',
    'admin',
    'admin123',
  ];

  for (final pwd in passwords) {
    try {
      final res = await client.auth.signInWithPassword(
        email: 'admin@insfp.dz',
        password: pwd,
      );
      print('SUCCESS with password: $pwd (User ID: ${res.user?.id})');
      exit(0);
    } catch (e) {
      print('Failed with $pwd: $e');
    }
  }
  exit(1);
}
