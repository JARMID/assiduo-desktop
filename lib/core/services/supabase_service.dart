import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();

  factory SupabaseService() {
    return _instance;
  }

  SupabaseService._internal();

  SupabaseClient get client => Supabase.instance.client;

  // Read from --dart-define at build time, fallback to defaults for dev only.
  // Production builds MUST supply these via:
  //   flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://afwqtjmwklmoqntnvgww.supabase.co',
  );
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmd3F0am13a2xtb3FudG52Z3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg3NTYsImV4cCI6MjA4NzQwNDc1Nn0.Vj_0KOY2kjwkcWN45LjmrSk78hBk76VEp_HoRKXUv9I',
  );

  Future<void> initialize() async {
    await Supabase.initialize(url: supabaseUrl, publishableKey: supabaseAnonKey);
  }

  bool get isAuthenticated => client.auth.currentSession != null;
  User? get currentUser => client.auth.currentUser;

  Future<void> signOut() async {
    await client.auth.signOut();
  }
}
