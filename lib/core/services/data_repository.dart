import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
import '../models/conversation.dart';

class DataRepository {
  final SupabaseClient _client;

  DataRepository(this._client);

  /// ----------------------------------------
  /// Users (Teachers & Admins)
  /// ----------------------------------------
  Future<List<AppUser>> getUsers() async {
    final response = await _client
        .from('insfp_users')
        .select()
        .order('last_name');

    return (response as List).map((data) => AppUser.fromJson(data)).toList();
  }

  Future<AppUser> createUser(
    String matricule,
    String firstName,
    String lastName,
    String role,
  ) async {
    final response = await _client
        .from('insfp_users')
        .insert({
          'matricule': matricule,
          'first_name': firstName,
          'last_name': lastName,
          'role': role,
        })
        .select()
        .single();

    return AppUser.fromJson(response);
  }

  Future<void> updateUser(
    String id,
    String firstName,
    String lastName,
    String? matricule,
  ) async {
    await _client
        .from('insfp_users')
        .update({
          'first_name': firstName,
          'last_name': lastName,
          'matricule': matricule,
        })
        .eq('id', id);
  }

  Future<void> deleteUser(String id) async {
    final response = await _client.functions.invoke(
      'delete-user',
      body: {'targetUserId': id},
    );

    if (response.status != 200) {
      throw Exception('Failed to delete user: ${response.data}');
    }
  }

  Future<void> resetUserPassword(String id, String newPassword) async {
    final response = await _client.functions.invoke(
      'reset-user-password',
      body: {'targetUserId': id, 'newPassword': newPassword},
    );

    if (response.status != 200) {
      throw Exception('Failed to reset password: ${response.data}');
    }
  }

  /// ----------------------------------------
  /// Realtime subscriptions
  /// ----------------------------------------
  RealtimeChannel? _dashboardChannel;

  void subscribeToDashboardChanges(VoidCallback onUpdate) {
    _dashboardChannel = _client
        .channel('public:admin_dashboard')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'insfp_attendance_records',
          callback: (payload) => onUpdate(),
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'insfp_sessions',
          callback: (payload) => onUpdate(),
        )
        .subscribe();
  }

  void unsubscribeFromDashboardChanges() {
    _dashboardChannel?.unsubscribe();
    _dashboardChannel = null;
  }

  /// ----------------------------------------
  /// Specialities
  /// ----------------------------------------
  Future<List<Speciality>> getSpecialities() async {
    final response = await _client
        .from('insfp_specialities')
        .select()
        .order('name_ar');

    return (response as List).map((data) => Speciality.fromJson(data)).toList();
  }

  Future<Speciality> createSpeciality({
    required String code,
    required String nameAr,
    String? nameFr,
    String? trainingType,
    String? duration,
    String? diploma,
    String? conditions,
    int? capacity,
  }) async {
    final response = await _client
        .from('insfp_specialities')
        .insert({
          'code': code,
          'name_ar': nameAr,
          'name_fr': nameFr,
          'training_type': trainingType,
          'duration': duration,
          'diploma': diploma,
          'conditions': conditions,
          'capacity': capacity,
        })
        .select()
        .single();

    return Speciality.fromJson(response);
  }

  Future<void> updateSpeciality({
    required String id,
    required String code,
    required String nameAr,
    String? nameFr,
    String? trainingType,
    String? duration,
    String? diploma,
    String? conditions,
    int? capacity,
  }) async {
    await _client
        .from('insfp_specialities')
        .update({
          'code': code,
          'name_ar': nameAr,
          'name_fr': nameFr,
          'training_type': trainingType,
          'duration': duration,
          'diploma': diploma,
          'conditions': conditions,
          'capacity': capacity,
        })
        .eq('id', id);
  }

  Future<void> deleteSpeciality(String id) async {
    await _client.from('insfp_specialities').delete().eq('id', id);
  }

  /// ----------------------------------------
  /// Classes (Promotions)
  /// ----------------------------------------

  Future<List<ClassGroup>> getClasses() async {
    final response = await _client
        .from('insfp_classes')
        .select('*, modules:insfp_class_modules(*)')
        .order('name');

    return (response as List)
        .map<ClassGroup>((data) => ClassGroup.fromJson(data))
        .toList();
  }

  Future<ClassGroup> createClass(
    String name,
    String level,
    String speciality, {
    List<String> modules = const [],
  }) async {
    final response = await _client
        .from('insfp_classes')
        .insert({'name': name, 'level': level, 'speciality': speciality})
        .select('*, modules:insfp_class_modules(*)')
        .single();

    final classId = response['id'] as String;

    if (modules.isNotEmpty) {
      await _client
          .from('insfp_class_modules')
          .insert(
            modules
                .map((m) => {'class_id': classId, 'name': m.trim()})
                .toList(),
          );
      // Fetch again to get updated object with modules
      final updated = await _client
          .from('insfp_classes')
          .select('*, modules:insfp_class_modules(*)')
          .eq('id', classId)
          .single();
      return ClassGroup.fromJson(updated);
    }

    return ClassGroup.fromJson(response);
  }

  Future<void> updateClass(
    String id,
    String name,
    String level,
    String speciality, {
    List<String>? modules,
  }) async {
    await _client
        .from('insfp_classes')
        .update({'name': name, 'level': level, 'speciality': speciality})
        .eq('id', id);

    if (modules != null) {
      await _client.from('insfp_class_modules').delete().eq('class_id', id);
      if (modules.isNotEmpty) {
        await _client
            .from('insfp_class_modules')
            .insert(
              modules.map((m) => {'class_id': id, 'name': m.trim()}).toList(),
            );
      }
    }
  }

  Future<void> deleteClass(String id) async {
    // Delete junction rows first, then the class
    await _client.from('insfp_class_modules').delete().eq('class_id', id);
    await _client.from('insfp_class_students').delete().eq('class_id', id);
    await _client.from('insfp_classes').delete().eq('id', id);
  }

  /// ----------------------------------------
  /// Modules
  /// ----------------------------------------
  Future<ClassModule> createModule(String classId, String name) async {
    final response = await _client
        .from('insfp_class_modules')
        .insert({'class_id': classId, 'name': name.trim()})
        .select()
        .single();
    return ClassModule.fromJson(response);
  }

  Future<void> updateModule(String id, String classId, String name) async {
    await _client
        .from('insfp_class_modules')
        .update({'class_id': classId, 'name': name.trim()})
        .eq('id', id);
  }

  Future<void> deleteModule(String id) async {
    await _client.from('insfp_class_modules').delete().eq('id', id);
  }

  Future<List<Student>> getStudentsForClass(String classId) async {
    final response = await _client
        .from('insfp_class_students')
        .select('insfp_students(*)')
        .eq('class_id', classId);

    return (response as List)
        .map((row) => Student.fromJson(row['insfp_students']))
        .toList();
  }

  Future<Map<String, dynamic>> getUnreadCounts(String userId) async {
    // RPC get_unread_counts does not exist yet, returning default to prevent 404
    return {'messages': 0, 'notifications': 0, 'alerts': 0};
  }

  Future<Map<String, int>> getStudentCountPerClass() async {
    final response = await _client
        .from('insfp_class_students')
        .select('class_id');

    final Map<String, int> counts = {};
    for (final row in response as List) {
      final classId = row['class_id'] as String;
      counts[classId] = (counts[classId] ?? 0) + 1;
    }
    return counts;
  }

  /// ----------------------------------------
  /// Students
  /// ----------------------------------------
  Future<List<Student>> getStudents() async {
    final response = await _client
        .from('insfp_students')
        .select('*, insfp_class_students(classes(*))')
        .order('last_name');

    return (response as List).map((data) {
      final List classesData = data['insfp_class_students'] as List? ?? [];
      final parsedClasses = classesData
          .map((cs) => cs['insfp_classes'])
          .where((c) => c != null)
          .map((c) => ClassGroup.fromJson(c))
          .toList();

      return Student(
        id: data['id'],
        matricule: data['matricule'],
        firstName: data['first_name'],
        lastName: data['last_name'],
        qrCode: data['qr_code'],
        createdAt: DateTime.parse(data['created_at']),
        classes: parsedClasses,
      );
    }).toList();
  }

  Future<Student> createStudent(
    String matricule,
    String firstName,
    String lastName,
    String? qrCode,
  ) async {
    final response = await _client
        .from('insfp_students')
        .insert({
          'matricule': matricule,
          'first_name': firstName,
          'last_name': lastName,
          'qr_code': qrCode,
        })
        .select()
        .single();

    return Student.fromJson(response);
  }

  Future<Student?> findStudentByMatricule(String matricule) async {
    final response = await _client
        .from('insfp_students')
        .select('*, insfp_class_students(classes(*))')
        .eq('matricule', matricule)
        .maybeSingle();

    if (response == null) return null;

    final List classesData = response['insfp_class_students'] as List? ?? [];
    final parsedClasses = classesData
        .map((cs) => cs['insfp_classes'])
        .where((c) => c != null)
        .map((c) => ClassGroup.fromJson(c))
        .toList();

    return Student(
      id: response['id'],
      matricule: response['matricule'],
      firstName: response['first_name'],
      lastName: response['last_name'],
      qrCode: response['qr_code'],
      authId: response['auth_id'],
      createdAt: DateTime.parse(response['created_at']),
      classes: parsedClasses,
    );
  }

  /// Creates a student with a full Supabase Auth account.
  /// Returns a map with 'student', 'email', and 'password' keys.
  Future<Map<String, dynamic>> createStudentWithAuth({
    required String matricule,
    required String firstName,
    required String lastName,
    String? password,
  }) async {
    final email = '$matricule@insfp.dz';
    final generatedPassword = password ?? 'INSFP-$matricule';
    final qrCode = 'INSFP-$matricule';

    // 1. Call edge function to create auth account + insfp_users table entry
    final authResponse = await _client.functions.invoke(
      'create-user',
      body: {
        'email': email,
        'password': generatedPassword,
        'first_name': firstName,
        'last_name': lastName,
        'matricule': matricule,
        'role': 'STAGIAIRE',
      },
    );

    if (authResponse.status != 200) {
      final errorData = authResponse.data;
      throw Exception(
        errorData?['error'] ?? 'Échec de création du compte stagiaire',
      );
    }

    final authData = authResponse.data as Map<String, dynamic>;
    final authUserId = authData['user']?['id'] ?? authData['id'];

    // 2. Create student row in students table with auth_id linked
    final studentResponse = await _client
        .from('insfp_students')
        .insert({
          'matricule': matricule,
          'first_name': firstName,
          'last_name': lastName,
          'qr_code': qrCode,
          'auth_id': authUserId,
        })
        .select()
        .single();

    return {
      'student': Student.fromJson(studentResponse),
      'email': email,
      'password': generatedPassword,
    };
  }

  Future<void> updateStudent(
    String id,
    String matricule,
    String firstName,
    String lastName,
  ) async {
    await _client
        .from('insfp_students')
        .update({
          'matricule': matricule,
          'first_name': firstName,
          'last_name': lastName,
        })
        .eq('id', id);
  }

  Future<void> deleteStudent(String id) async {
    // Clean junction table first
    await _client.from('insfp_class_students').delete().eq('student_id', id);
    await _client.from('insfp_students').delete().eq('id', id);
  }

  Future<void> assignStudentToClass(String studentId, String classId) async {
    await _client.from('insfp_class_students').insert({
      'student_id': studentId,
      'class_id': classId,
    });
  }

  Future<void> removeStudentFromClass(String studentId, String classId) async {
    await _client
        .from('insfp_class_students')
        .delete()
        .eq('student_id', studentId)
        .eq('class_id', classId);
  }

  /// ----------------------------------------
  /// Sessions & Attendance
  /// ----------------------------------------
  Future<List<AttendanceSession>> getSessions() async {
    final response = await _client
        .from('insfp_sessions')
        .select('*, classes(*), insfp_users(*)')
        .order('date', ascending: false);

    return (response as List)
        .map((data) => AttendanceSession.fromJson(data))
        .toList();
  }

  Future<List<AttendanceRecord>> getAttendanceForSession(
    String sessionId,
  ) async {
    final response = await _client
        .from('insfp_attendance_records')
        .select('*, students(*)')
        .eq('session_id', sessionId)
        .order('marked_at');

    return (response as List)
        .map((data) => AttendanceRecord.fromJson(data))
        .toList();
  }

  /// ----------------------------------------
  /// Dashboard Global Stats
  /// ----------------------------------------
  Future<Map<String, dynamic>> getDashboardStats() async {
    final today = DateTime.now().toIso8601String().split('T')[0];

    final results = await Future.wait([
      _client.from('insfp_classes').select('id').count(CountOption.exact),
      _client.from('insfp_students').select('id').count(CountOption.exact),
      _client
          .from('insfp_users')
          .select('id')
          .eq('role', 'FORMATEUR')
          .count(CountOption.exact),
      _client
          .from('insfp_sessions')
          .select('id')
          .eq('date', today)
          .count(CountOption.exact),
      _client
          .from('insfp_attendance_records')
          .select('id')
          .gte('marked_at', '${today}T00:00:00Z')
          .lte('marked_at', '${today}T23:59:59Z')
          .count(CountOption.exact),
      _client.from('insfp_sessions').select('id').count(CountOption.exact),
    ]);

    return {
      'total_insfp_classes': results[0].count,
      'total_insfp_students': results[1].count,
      'total_teachers': results[2].count,
      'today_insfp_sessions': results[3].count,
      'today_records': results[4].count,
      'total_insfp_sessions': results[5].count,
    };
  }

  Future<List<AttendanceSession>> getRecentSessions({int limit = 5}) async {
    final response = await _client
        .from('insfp_sessions')
        .select('*, classes(*), insfp_users(*)')
        .order('date', ascending: false)
        .limit(limit);

    return (response as List)
        .map((data) => AttendanceSession.fromJson(data))
        .toList();
  }

  /// ----------------------------------------
  /// Formateur Account Creation (Edge Function)
  /// ----------------------------------------
  Future<Map<String, dynamic>> createFormateurAccount({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? matricule,
  }) async {
    final response = await _client.functions.invoke(
      'create-user',
      body: {
        'email': email,
        'password': password,
        'first_name': firstName,
        'last_name': lastName,
        'matricule': matricule,
        'role': 'FORMATEUR',
      },
    );

    if (response.status != 200) {
      final errorData = response.data;
      throw Exception(errorData?['error'] ?? 'Failed to create account');
    }

    return response.data as Map<String, dynamic>;
  }

  /// ----------------------------------------
  /// Bulk Student Import
  /// ----------------------------------------
  Future<ClassGroup> findOrCreateClass(String name) async {
    // Try to find existing class
    final existing = await _client
        .from('insfp_classes')
        .select()
        .eq('name', name)
        .maybeSingle();

    if (existing != null) {
      return ClassGroup.fromJson(existing);
    }

    // Create new class
    final created = await _client
        .from('insfp_classes')
        .insert({'name': name, 'level': '', 'speciality': ''})
        .select()
        .single();

    return ClassGroup.fromJson(created);
  }

  Future<Map<String, dynamic>> bulkCreateStudents(
    List<Map<String, String>> rows,
  ) async {
    int created = 0;
    int skipped = 0;
    int authCreated = 0;
    // Track results
    final List<String> errors = [];
    final Map<String, ClassGroup> classCache = {};

    for (var i = 0; i < rows.length; i++) {
      final row = rows[i];
      final matricule = row['matricule']?.trim() ?? '';
      final firstName = row['first_name']?.trim() ?? '';
      final lastName = row['last_name']?.trim() ?? '';
      final className = row['class_name']?.trim() ?? '';

      if (matricule.isEmpty || firstName.isEmpty || lastName.isEmpty) {
        errors.add('Ligne ${i + 1}: données manquantes');
        skipped++;
        continue;
      }

      try {
        // Check if student already exists
        final existing = await _client
            .from('insfp_students')
            .select('id')
            .eq('matricule', matricule)
            .maybeSingle();

        if (existing != null) {
          skipped++;
          continue;
        }

        // Try to create auth account + student with auth linking
        String? authUserId;
        try {
          final email = '$matricule@insfp.dz';
          final password = 'INSFP-$matricule';
          final authResponse = await _client.functions.invoke(
            'create-user',
            body: {
              'email': email,
              'password': password,
              'first_name': firstName,
              'last_name': lastName,
              'matricule': matricule,
              'role': 'STAGIAIRE',
            },
          );
          if (authResponse.status == 200) {
            final authData = authResponse.data as Map<String, dynamic>;
            authUserId = (authData['user']?['id'] ?? authData['id'])
                ?.toString();
            authCreated++;
          }
        } catch (_) {
          // Auth creation failed — still create student without auth
        }

        // Create student with auto-generated QR code (and auth_id if available)
        final insertData = <String, dynamic>{
          'matricule': matricule,
          'first_name': firstName,
          'last_name': lastName,
          'qr_code': 'INSFP-$matricule',
        };
        if (authUserId != null) {
          insertData['auth_id'] = authUserId;
        }
        final student = await _client
            .from('insfp_students')
            .insert(insertData)
            .select()
            .single();

        // Assign to class if specified
        if (className.isNotEmpty) {
          if (!classCache.containsKey(className)) {
            final cls = await findOrCreateClass(className);
            classCache[className] = cls;
          }
          final cls = classCache[className]!;

          await _client.from('insfp_class_students').insert({
            'student_id': student['id'],
            'class_id': cls.id,
          });
        }

        created++;
      } catch (e) {
        errors.add('Ligne ${i + 1} ($matricule): $e');
        skipped++;
      }
    }

    return {
      'created': created,
      'skipped': skipped,
      'errors': errors,
      'insfp_classes_created': classCache.length,
      'auth_created': authCreated,
    };
  }

  /// ----------------------------------------
  /// Attendance Summary Reports
  /// ----------------------------------------
  Future<List<Map<String, dynamic>>> getAttendanceSummary({
    required String classId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    // Get students in this class
    final students = await getStudentsForClass(classId);

    // Get sessions for this class in date range
    var query = _client
        .from('insfp_sessions')
        .select('id, date')
        .eq('class_id', classId);

    if (startDate != null) {
      query = query.gte('date', startDate.toIso8601String().split('T')[0]);
    }
    if (endDate != null) {
      query = query.lte('date', endDate.toIso8601String().split('T')[0]);
    }

    final sessions = await query.order('date');
    final sessionIds = (sessions as List)
        .map((s) => s['id'] as String)
        .toList();

    if (sessionIds.isEmpty) {
      return students
          .map(
            (s) => {
              'student_id': s.id,
              'first_name': s.firstName,
              'last_name': s.lastName,
              'matricule': s.matricule,
              'total': 0,
              'present': 0,
              'absent': 0,
              'late': 0,
              'justified': 0,
              'rate': '0.0',
            },
          )
          .toList();
    }

    // Get all records for these sessions
    final records = await _client
        .from('insfp_attendance_records')
        .select('student_id, status')
        .inFilter('session_id', sessionIds);

    // Aggregate per student
    final Map<String, Map<String, int>> stats = {};
    for (final s in students) {
      stats[s.id] = {'present': 0, 'absent': 0, 'late': 0, 'justified': 0};
    }

    for (final r in records as List) {
      final sid = r['student_id'] as String;
      if (!stats.containsKey(sid)) continue;
      switch (r['status']) {
        case 'PRESENT':
          stats[sid]!['present'] = (stats[sid]!['present'] ?? 0) + 1;
          break;
        case 'ABSENT':
          stats[sid]!['absent'] = (stats[sid]!['absent'] ?? 0) + 1;
          break;
        case 'EN_RETARD':
          stats[sid]!['late'] = (stats[sid]!['late'] ?? 0) + 1;
          break;
        case 'JUSTIFIE':
          stats[sid]!['justified'] = (stats[sid]!['justified'] ?? 0) + 1;
          break;
      }
    }

    return students.map((s) {
      final st = stats[s.id]!;
      final total = sessionIds.length;
      final present = st['present']!;
      final rate = total > 0
          ? (present / total * 100).toStringAsFixed(1)
          : '0.0';
      return {
        'student_id': s.id,
        'first_name': s.firstName,
        'last_name': s.lastName,
        'matricule': s.matricule,
        'total': total,
        'present': present,
        'absent': st['absent']!,
        'late': st['late']!,
        'justified': st['justified']!,
        'rate': rate,
      };
    }).toList();
  }

  /// ----------------------------------------
  /// Weekly Attendance Trends (for Charts)
  /// ----------------------------------------
  Future<List<Map<String, dynamic>>> getWeeklyAttendanceTrends() async {
    final now = DateTime.now();
    // Build all 7 day strings up front
    final days = List.generate(7, (i) => now.subtract(Duration(days: 6 - i)));
    final dayStrings = days
        .map((d) => d.toIso8601String().split('T')[0])
        .toList();

    // Fetch ALL sessions for the last 7 days in a SINGLE request
    final sessionsResponse = await _client
        .from('insfp_sessions')
        .select('id, date')
        .gte('date', dayStrings.first)
        .lte('date', dayStrings.last);

    final allSessions = sessionsResponse as List;
    final allSessionIds = allSessions.map((s) => s['id'] as String).toList();

    // Fetch ALL records for those sessions in a SINGLE request
    List allRecords = [];
    if (allSessionIds.isNotEmpty) {
      final recordsResponse = await _client
          .from('insfp_attendance_records')
          .select('session_id, status')
          .inFilter('session_id', allSessionIds);
      allRecords = recordsResponse as List;
    }

    // Group sessions by date
    final sessionsByDate = <String, List<String>>{};
    for (final s in allSessions) {
      final date = s['date'] as String;
      sessionsByDate.putIfAbsent(date, () => []).add(s['id'] as String);
    }

    // Group records by session_id
    final recordsBySession = <String, List<String>>{};
    for (final r in allRecords) {
      final sid = r['session_id'] as String;
      recordsBySession.putIfAbsent(sid, () => []).add(r['status'] as String);
    }

    // Aggregate per day
    return days.map((day) {
      final dayStr = day.toIso8601String().split('T')[0];
      final sessionIds = sessionsByDate[dayStr] ?? [];
      int present = 0, absent = 0, late = 0;
      for (final sid in sessionIds) {
        for (final status in recordsBySession[sid] ?? []) {
          if (status == 'PRESENT') {
            present++;
          } else if (status == 'ABSENT') {
            absent++;
          } else if (status == 'EN_RETARD') {
            late++;
          }
        }
      }
      return {
        'date': day,
        'present': present,
        'absent': absent,
        'late': late,
        'insfp_sessions': sessionIds.length,
      };
    }).toList();
  }

  /// Get overall attendance rate
  Future<double> getOverallAttendanceRate() async {
    try {
      final results = await Future.wait([
        _client
            .from('insfp_attendance_records')
            .select('id')
            .eq('status', 'PRESENT')
            .count(CountOption.exact),
        _client
            .from('insfp_attendance_records')
            .select('id')
            .count(CountOption.exact),
      ]);
      final presentCount = results[0].count;
      final totalCount = results[1].count;
      if (totalCount == 0) return 0.0;
      return (presentCount / totalCount) * 100;
    } catch (_) {
      return 0.0;
    }
  }

  // ─── V2: JUSTIFICATIONS ───────────────────────────────

  Future<List<Map<String, dynamic>>>
  getPendingJustificationsWithDetails() async {
    final data = await _client
        .from('insfp_justifications')
        .select(
          '*, student:insfp_students(first_name, last_name, matricule), absence_type:insfp_absence_types(label_fr, requires_doc)',
        )
        .eq('status', 'PENDING')
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> updateJustificationStatus(
    String justificationId,
    String status, {
    String? adminNote,
  }) async {
    await _client
        .from('insfp_justifications')
        .update({'status': status, 'admin_note': adminNote})
        .eq('id', justificationId);

    // V2 System Message Integration
    try {
      // 1. Get the student_id of the justification
      final justifData = await _client
          .from('insfp_justifications')
          .select('student_id, absence_type_id, status')
          .eq('id', justificationId)
          .single();

      final studentId = justifData['student_id'] as String;

      // 2. Find or create conversation for this student
      final convRes = await _client
          .from('insfp_conversations')
          .select('id')
          .eq('student_id', studentId)
          .limit(1);

      String conversationId;
      if (convRes.isEmpty) {
        final newConv = await _client
            .from('insfp_conversations')
            .insert({
              'student_id': studentId,
              'subject': 'Suivi des Justificatifs',
              'context_type': 'SYSTEM',
            })
            .select('id')
            .single();
        conversationId = newConv['id'] as String;
      } else {
        conversationId = convRes[0]['id'] as String;
      }

      // 3. Insert system message
      final statusFr = status == 'approved'
          ? 'approuvée'
          : (status == 'rejected' ? 'rejetée' : status);
      await _client.from('insfp_messages').insert({
        'conversation_id': conversationId,
        'sender_id': _client.auth.currentUser!.id,
        'sender_role': 'system', // or 'admin'
        'content':
            '[SYSTÈME] Votre justificatif a été $statusFr.${adminNote != null && adminNote.isNotEmpty ? '\nNote: $adminNote' : ''}',
      });
    } catch (e) {
      debugPrint('Failed to send system message: $e');
    }
  }

  // ─── V2: ABSENCE ALERTS (3 DAYS) ──────────────────────

  Future<void> _generateAbsenceAlerts() async {
    try {
      await _client.rpc('detect_absence_alerts');
      // Even if the RPC doesn't exist, we can gracefully fail or handle it manually in Dart.
      // But actually, we can just do a naive check if needed, or assume the database cron handles it.
      // To be safe, let's implement a Dart-level check for the last 50 sessions
      final recentSessions = await _client
          .from('insfp_sessions')
          .select('id')
          .order('date', ascending: false)
          .limit(10);

      final sessionIds = (recentSessions as List).map((s) => s['id']).toList();
      if (sessionIds.isEmpty) return;

      final records = await _client
          .from('insfp_attendance_records')
          .select('student_id, status, session_id')
          .inFilter('session_id', sessionIds)
          .order('marked_at', ascending: false);

      final Map<String, int> consecutiveAbsences = {};
      final Set<String> alertedStudents = {};

      final activeAlerts = await _client
          .from('insfp_absence_alerts')
          .select('student_id')
          .eq('status', 'ACTIVE');

      for (final a in activeAlerts as List) {
        alertedStudents.add(a['student_id'] as String);
      }

      for (final r in records as List) {
        final studentId = r['student_id'] as String;
        final status = r['status'] as String;

        if (alertedStudents.contains(studentId)) continue;

        if (status == 'ABSENT') {
          consecutiveAbsences[studentId] =
              (consecutiveAbsences[studentId] ?? 0) + 1;
          if (consecutiveAbsences[studentId]! >= 3) {
            // Create alert
            await _client.from('insfp_absence_alerts').insert({
              'student_id': studentId,
              'reason': '3 absences consécutives non justifiées',
              'status': 'ACTIVE',
            });
            alertedStudents.add(studentId); // Prevent multiple alerts
          }
        } else {
          // If they were present or justified, break the streak
          consecutiveAbsences[studentId] = -999;
        }
      }
    } catch (_) {
      // Silently fail if there's an error generating alerts to not block UI
    }
  }

  Future<List<Map<String, dynamic>>> getActiveAbsenceAlerts() async {
    await _generateAbsenceAlerts(); // Auto-check before fetching
    final data = await _client
        .from('insfp_absence_alerts')
        .select('*, student:insfp_students(first_name, last_name, matricule)')
        .eq('status', 'ACTIVE')
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> resolveAbsenceAlert(
    String alertId,
    String resolutionNote,
  ) async {
    await _client
        .from('insfp_absence_alerts')
        .update({'status': 'RESOLVED', 'resolution_note': resolutionNote})
        .eq('id', alertId);
  }

  // ─── V2: NOTIFICATIONS & PASSWORD RESET ───────────────

  Future<List<Map<String, dynamic>>> getNotifications() async {
    final data = await _client
        .from('insfp_notifications')
        .select()
        .isFilter('target_user_id', null) // Admin global notifications
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> updateStudentData(String id, Map<String, dynamic> data) async {
    await _client.from('insfp_students').update(data).eq('id', id);
  }

  Future<Map<String, dynamic>> getStudentProfileData(String studentId) async {
    // Fetch all 3 in parallel
    final results = await Future.wait([
      _client
          .from('insfp_students')
          .select('*, insfp_class_students(classes(*))')
          .eq('id', studentId)
          .single(),
      _client
          .from('insfp_absence_alerts')
          .select('*, absence_type:insfp_absence_types(*)')
          .eq('student_id', studentId)
          .order('created_at', ascending: false),
      _client
          .from('insfp_absence_insfp_justifications')
          .select('*, absence_type:insfp_absence_types(*)')
          .eq('student_id', studentId)
          .order('created_at', ascending: false),
    ]);

    return {
      'student': results[0],
      'alerts': results[1],
      'insfp_justifications': results[2],
    };
  }

  Future<void> markNotificationRead(String id) async {
    await _client
        .from('insfp_notifications')
        .update({'is_read': true})
        .eq('id', id);
  }

  Future<void> resetStudentPassword(
    String studentAuthId,
    String newPassword,
  ) async {
    await resetUserPassword(studentAuthId, newPassword);
  }

  // ─── V2: MESSAGES ──────────────────────────────────────

  Future<List<Map<String, dynamic>>> getAllConversations() async {
    final data = await _client
        .from('insfp_conversations')
        .select('*, student:insfp_students(first_name, last_name, matricule)')
        .order('updated_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<List<Message>> getMessages(String conversationId) async {
    final data = await _client
        .from('insfp_messages')
        .select()
        .eq('conversation_id', conversationId)
        .order('created_at');
    return data.map<Message>((e) => Message.fromJson(e)).toList();
  }

  Future<void> sendMessage(
    String conversationId,
    String senderId,
    String senderRole,
    String senderName,
    String body,
  ) async {
    await _client.from('insfp_messages').insert({
      'conversation_id': conversationId,
      'sender_id': senderId,
      'sender_role': senderRole,
      'sender_name': senderName,
      'body': body,
    });
  }

  Future<Conversation> createConversation(
    String studentId,
    String subject,
  ) async {
    final data = await _client
        .from('insfp_conversations')
        .insert({
          'student_id': studentId,
          'subject': subject,
          'context_type': 'ADMIN_INITIATED',
        })
        .select()
        .single();
    return Conversation.fromJson(data);
  }
}
