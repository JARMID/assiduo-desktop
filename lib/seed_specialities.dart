import 'package:supabase/supabase.dart';
import 'dart:io';

void main() async {
  final supabaseUrl = 'https://afwqtjmwklmoqntnvgww.supabase.co';
  final supabaseKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmd3F0am13a2xtb3FudG52Z3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg3NTYsImV4cCI6MjA4NzQwNDc1Nn0.Vj_0KOY2kjwkcWN45LjmrSk78hBk76VEp_HoRKXUv9I';

  final client = SupabaseClient(supabaseUrl, supabaseKey);

  final List<Map<String, dynamic>> specialities = [
    {
      'code': 'SON',
      'name_ar': 'الصوت',
      'name_fr': 'SON',
      'training_type': 'Présentiel',
      'duration': '30 mois',
      'diploma': 'BTS',
      'capacity': 30,
    },
    {
      'code': 'TEM',
      'name_ar': 'تقنية استغلال وصيانة',
      'name_fr': "Technique d'Exploitation et Maintenance",
      'training_type': 'Présentiel',
      'duration': '30 mois',
      'diploma': 'BTS',
      'capacity': 30,
    },
    {
      'code': 'DEV',
      'name_ar': 'تطوير الويب والموبايل',
      'name_fr': 'DEV WEB ET MOBILE',
      'training_type': 'Présentiel',
      'duration': '30 mois',
      'diploma': 'BTS',
      'capacity': 30,
    },
    {
      'code': 'IMAGE',
      'name_ar': 'الصورة',
      'name_fr': 'IMAGE',
      'training_type': 'Présentiel',
      'duration': '30 mois',
      'diploma': 'BTS',
      'capacity': 30,
    },
    {
      'code': 'MONTAGE',
      'name_ar': 'التركيب',
      'name_fr': 'MONTAGE',
      'training_type': 'Présentiel',
      'duration': '30 mois',
      'diploma': 'BTS',
      'capacity': 30,
    },
  ];

  print('Inserting specialities...');
  try {
    for (var spec in specialities) {
      // Check if it exists
      final existing = await client
          .from('insfp_specialities')
          .select()
          .eq('code', spec['code'] as String)
          .maybeSingle();
      if (existing == null) {
        await client.from('insfp_specialities').insert(spec);
        print('Inserted ${spec['code']}');
      } else {
        print('Already exists ${spec['code']}');
      }
    }
    print('Done!');
  } catch (e) {
    print('Error: $e');
  }

  exit(0);
}
