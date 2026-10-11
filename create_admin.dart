import 'package:supabase/supabase.dart';

void main() async {
  final supabaseUrl = 'https://afwqtjmwklmoqntnvgww.supabase.co';
  final supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmd3F0am13a2xtb3FudG52Z3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg3NTYsImV4cCI6MjA4NzQwNDc1Nn0.Vj_0KOY2kjwkcWN45LjmrSk78hBk76VEp_HoRKXUv9I';

  final client = SupabaseClient(supabaseUrl, supabaseAnonKey);

  print('Signing up Admin...');
  try {
    final response = await client.auth.signUp(
      email: 'admin@insfp.dz',
      password: 'Password123!',
      data: {'role': 'ADMIN', 'full_name': 'Super Admin'},
    );
    print('Admin created successfully: ${response.user?.id}');
  } catch (e) {
    print('Failed to create admin: $e');
  }
}
