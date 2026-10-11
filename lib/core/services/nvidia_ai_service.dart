import 'dart:convert';
import 'package:http/http.dart' as http;

class JustificationAnalysisResult {
  final String clinicName;
  final String physicianName;
  final String? dateIssued;
  final String? coveredStartDate;
  final String? coveredEndDate;
  final double confidenceScore;
  final String authenticityStatus;
  final String findingsSummary;

  const JustificationAnalysisResult({
    required this.clinicName,
    required this.physicianName,
    this.dateIssued,
    this.coveredStartDate,
    this.coveredEndDate,
    required this.confidenceScore,
    required this.authenticityStatus,
    required this.findingsSummary,
  });

  factory JustificationAnalysisResult.fromJson(Map<String, dynamic> json) {
    return JustificationAnalysisResult(
      clinicName: json['clinic_name'] as String? ?? 'Inconnu',
      physicianName: json['physician_name'] as String? ?? 'Inconnu',
      dateIssued: json['date_issued'] as String?,
      coveredStartDate: json['covered_start_date'] as String?,
      coveredEndDate: json['covered_end_date'] as String?,
      confidenceScore: (json['confidence_score'] as num?)?.toDouble() ?? 0.0,
      authenticityStatus: json['authenticity_status'] as String? ?? 'INCONCLUSIVE',
      findingsSummary: json['findings_summary'] as String? ?? 'Aucun détail fourni.',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'clinic_name': clinicName,
      'physician_name': physicianName,
      'date_issued': dateIssued,
      'covered_start_date': coveredStartDate,
      'covered_end_date': coveredEndDate,
      'confidence_score': confidenceScore,
      'authenticity_status': authenticityStatus,
      'findings_summary': findingsSummary,
    };
  }
}

class AttendanceRiskReport {
  final double absencePercentage;
  final String riskLevel;
  final int consecutiveMisses;
  final String primaryAbsenceSlot;
  final String trendAnalysis;
  final String preventiveActions;

  const AttendanceRiskReport({
    required this.absencePercentage,
    required this.riskLevel,
    required this.consecutiveMisses,
    required this.primaryAbsenceSlot,
    required this.trendAnalysis,
    required this.preventiveActions,
  });

  factory AttendanceRiskReport.fromJson(Map<String, dynamic> json) {
    return AttendanceRiskReport(
      absencePercentage: (json['absence_percentage'] as num?)?.toDouble() ?? 0.0,
      riskLevel: json['risk_level'] as String? ?? 'LOW',
      consecutiveMisses: json['consecutive_misses'] as int? ?? 0,
      primaryAbsenceSlot: json['primary_absence_slot'] as String? ?? 'Non identifié',
      trendAnalysis: json['trend_analysis'] as String? ?? 'Données insuffisantes.',
      preventiveActions: json['preventive_actions'] as String? ?? 'Poursuivre le suivi normal.',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'absence_percentage': absencePercentage,
      'risk_level': riskLevel,
      'consecutive_misses': consecutiveMisses,
      'primary_absence_slot': primaryAbsenceSlot,
      'trend_analysis': trendAnalysis,
      'preventive_actions': preventiveActions,
    };
  }
}

class NvidiaAiService {
  static const String _apiEndpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';

  // Read from environment if specified, fallback to project keys ledger
  static const String visionApiKey = String.fromEnvironment(
    'NVIDIA_VISION_KEY',
    defaultValue: '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',
  );

  static const String reasoningApiKey = String.fromEnvironment(
    'NVIDIA_REASONING_KEY',
    defaultValue: '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',
  );

  static const String _visionModel = 'meta/llama-3.2-90b-vision-instruct';
  static const String _reasoningModel = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';

  final http.Client _client;

  NvidiaAiService({http.Client? client}) : _client = client ?? http.Client();

  /// Analyzes an uploaded medical certificate or administrative summons using computer vision.
  Future<JustificationAnalysisResult> analyzeMedicalCertificate({
    required String base64Image,
    required String absenceDateStr,
    String? mimeType,
  }) async {
    final mediaType = mimeType ?? 'image/jpeg';
    final payload = {
      'model': _visionModel,
      'temperature': 0.1,
      'max_tokens': 1024,
      'messages': [
        {
          'role': 'system',
          'content': 'You are an institutional document verification assistant for an Algerian public institute (INSFP). '
              'Analyze the uploaded image of a medical certificate or administrative summons. '
              'Extract the relevant information and output ONLY a valid JSON object with the following keys: '
              '"clinic_name" (string), "physician_name" (string), "date_issued" (YYYY-MM-DD or null), '
              '"covered_start_date" (YYYY-MM-DD or null), "covered_end_date" (YYYY-MM-DD or null), '
              '"confidence_score" (number between 0.0 and 1.0), '
              '"authenticity_status" ("VERIFIED", "SUSPICIOUS", or "INCONCLUSIVE"), '
              '"findings_summary" (concise summary in French of the findings, stamps, and signatures detected). '
              'Do not enclose the JSON in markdown code blocks.',
        },
        {
          'role': 'user',
          'content': [
            {
              'type': 'text',
              'text': 'Please analyze this medical certificate submitted to justify an absence on date: $absenceDateStr',
            },
            {
              'type': 'image_url',
              'image_url': {
                'url': 'data:$mediaType;base64,$base64Image',
              },
            },
          ],
        },
      ],
    };

    final response = await _client.post(
      Uri.parse(_apiEndpoint),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $visionApiKey',
      },
      body: jsonEncode(payload),
    );

    if (response.statusCode != 200) {
      throw Exception('NVIDIA Vision API request failed with status: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final rawText = decoded['choices']?[0]?['message']?['content'] as String? ?? '{}';
    final sanitizedJson = _extractJsonBlock(rawText);

    return JustificationAnalysisResult.fromJson(jsonDecode(sanitizedJson) as Map<String, dynamic>);
  }

  /// Evaluates attendance records and identifies trainees approaching the regulatory absence limit.
  Future<AttendanceRiskReport> evaluateAttendanceTrajectory({
    required String studentName,
    required String studentMatricule,
    required String className,
    required int totalSessions,
    required int absentSessions,
    required int lateSessions,
    required int justifiedSessions,
    required List<Map<String, dynamic>> recentHistory,
  }) async {
    final payload = {
      'model': _reasoningModel,
      'temperature': 0.2,
      'max_tokens': 1024,
      'messages': [
        {
          'role': 'system',
          'content': 'You are a pedagogical risk assessor for Algerian vocational training institutes (INSFP). '
              'In Algerian vocational training regulations, exceeding twenty-five percent unexcused absences triggers disciplinary exclusion. '
              'Analyze the student attendance metrics provided and output ONLY a valid JSON object with the following keys: '
              '"absence_percentage" (number, unexcused absence rate), '
              '"risk_level" ("LOW", "MEDIUM", or "CRITICAL"), '
              '"consecutive_misses" (integer, maximum streak of missed sessions), '
              '"primary_absence_slot" (string, e.g. "08:30" or "13:30"), '
              '"trend_analysis" (concise pedagogical diagnosis in French), '
              '"preventive_actions" (actionable pedagogical recommendations in French). '
              'Do not enclose the JSON in markdown code blocks.',
        },
        {
          'role': 'user',
          'content': jsonEncode({
            'student_name': studentName,
            'matricule': studentMatricule,
            'class': className,
            'total_sessions': totalSessions,
            'absent_sessions': absentSessions,
            'late_sessions': lateSessions,
            'justified_sessions': justifiedSessions,
            'recent_history': recentHistory,
          }),
        },
      ],
    };

    final response = await _client.post(
      Uri.parse(_apiEndpoint),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $reasoningApiKey',
      },
      body: jsonEncode(payload),
    );

    if (response.statusCode != 200) {
      throw Exception('NVIDIA Reasoning API request failed with status: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final rawText = decoded['choices']?[0]?['message']?['content'] as String? ?? '{}';
    final sanitizedJson = _extractJsonBlock(rawText);

    return AttendanceRiskReport.fromJson(jsonDecode(sanitizedJson) as Map<String, dynamic>);
  }

  static String _extractJsonBlock(String text) {
    var trimmed = text.trim();
    if (trimmed.startsWith('```json')) {
      trimmed = trimmed.substring(7);
    } else if (trimmed.startsWith('```')) {
      trimmed = trimmed.substring(3);
    }
    if (trimmed.endsWith('```')) {
      trimmed = trimmed.substring(0, trimmed.length - 3);
    }
    return trimmed.trim();
  }
}
