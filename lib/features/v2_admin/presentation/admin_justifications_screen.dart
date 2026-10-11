import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/data_repository.dart';
import '../../../core/services/nvidia_ai_service.dart';
import '../../../core/l10n/app_localizations.dart';

class AdminJustificationsScreen extends StatefulWidget {
  const AdminJustificationsScreen({super.key});

  @override
  State<AdminJustificationsScreen> createState() =>
      _AdminJustificationsScreenState();
}

class _AdminJustificationsScreenState extends State<AdminJustificationsScreen> {
  List<Map<String, dynamic>> _justifications = [];
  bool _isLoading = true;
  final Map<String, bool> _analyzingItems = {};
  final Map<String, JustificationAnalysisResult> _aiResults = {};
  final NvidiaAiService _aiService = NvidiaAiService();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final repo = context.read<DataRepository>();
      final data = await repo.getPendingJustificationsWithDetails();
      if (!mounted) return;
      setState(() {
        _justifications = data;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      final repo = context.read<DataRepository>();
      await repo.updateJustificationStatus(id, status);
      if (!mounted) return;
      _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    }
  }

  Future<void> _analyzeWithAi(String justificationId, String docUrl, String absenceDate) async {
    setState(() => _analyzingItems[justificationId] = true);

    try {
      // Download the document image and encode to base64
      final response = await http.get(Uri.parse(docUrl));
      if (response.statusCode != 200) {
        throw Exception('Impossible de télécharger le document (${response.statusCode})');
      }

      final base64Image = base64Encode(response.bodyBytes);
      final contentType = response.headers['content-type'] ?? 'image/jpeg';

      final result = await _aiService.analyzeMedicalCertificate(
        base64Image: base64Image,
        absenceDateStr: absenceDate,
        mimeType: contentType,
      );

      if (!mounted) return;
      setState(() {
        _aiResults[justificationId] = result;
        _analyzingItems[justificationId] = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _analyzingItems[justificationId] = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Analyse IA échouée: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_justifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.assignment_turned_in_outlined, size: 64, color: isDark ? Colors.grey[600] : Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              AppLocalizations.of(context).get('aucun_justificatif_e'),
              style: TextStyle(fontSize: 16, color: isDark ? Colors.grey[400] : Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      itemCount: _justifications.length,
      itemBuilder: (context, index) {
        final item = _justifications[index];
        final id = item['id'] as String;
        final student = item['student'] as Map<String, dynamic>? ?? {};
        final absenceType = item['absence_type'] as Map<String, dynamic>? ?? {};
        final docUrl = item['document_url'] as String?;
        final dateFrom = item['date_from'] as String? ?? 'Inconnue';
        final isAnalyzing = _analyzingItems[id] ?? false;
        final aiResult = _aiResults[id];

        return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: theme.cardTheme.color ?? (isDark ? const Color(0xFF1E222D) : Colors.white),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? const Color(0xFF2E3440) : const Color(0xFFE5E9F0),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(isDark ? 30 : 10),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header: Student Name + Matricule
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: theme.primaryColor.withAlpha(30),
                          radius: 20,
                          child: Text(
                            (student['first_name'] as String? ?? 'S').substring(0, 1).toUpperCase(),
                            style: TextStyle(fontWeight: FontWeight.bold, color: theme.primaryColor),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${student['first_name'] ?? ''} ${student['last_name'] ?? ''}',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                            ),
                            Text(
                              'Matricule: ${student['matricule'] ?? 'N/A'}',
                              style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.blue.withAlpha(25),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        absenceType['label_fr'] ?? 'Absence',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.blue),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Divider(height: 1),
                const SizedBox(height: 14),

                // Motifs & Details
                Row(
                  children: [
                    const Icon(Icons.event, size: 16, color: Colors.grey),
                    const SizedBox(width: 6),
                    Text(
                      'Date d\'absence: $dateFrom',
                      style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[300] : Colors.grey[700]),
                    ),
                  ],
                ),
                if (item['reason'] != null && (item['reason'] as String).isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Explication du stagiaire: ${item['reason']}',
                    style: TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: isDark ? Colors.grey[300] : Colors.grey[700]),
                  ),
                ],

                // Document Attachment + AI Audit Action
                if (docUrl != null) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        icon: const Icon(Icons.open_in_new, size: 16),
                        label: const Text('Ouvrir le justificatif'),
                        onPressed: () => launchUrl(Uri.parse(docUrl)),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton.icon(
                        icon: isAnalyzing
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.auto_awesome, size: 16),
                        label: Text(isAnalyzing ? 'Audit en cours...' : 'Audit IA (NVIDIA NIM)'),
                        onPressed: isAnalyzing ? null : () => _analyzeWithAi(id, docUrl, dateFrom),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF76B900), // NVIDIA Brand Green
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ],
                  ),
                ],

                // AI Result Display Card
                if (aiResult != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF141A24) : const Color(0xFFF7F9FC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: aiResult.authenticityStatus == 'VERIFIED'
                            ? Colors.green.withAlpha(120)
                            : (aiResult.authenticityStatus == 'SUSPICIOUS' ? Colors.red.withAlpha(120) : Colors.orange.withAlpha(120)),
                        width: 1.5,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.verified_user, size: 18, color: Color(0xFF76B900)),
                                const SizedBox(width: 8),
                                const Text(
                                  'Rapport d\'analyse IA',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: aiResult.authenticityStatus == 'VERIFIED'
                                    ? Colors.green.withAlpha(30)
                                    : (aiResult.authenticityStatus == 'SUSPICIOUS' ? Colors.red.withAlpha(30) : Colors.orange.withAlpha(30)),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                aiResult.authenticityStatus,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: aiResult.authenticityStatus == 'VERIFIED'
                                      ? Colors.green
                                      : (aiResult.authenticityStatus == 'SUSPICIOUS' ? Colors.red : Colors.orange),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Établissement détecté: ${aiResult.clinicName}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          'Médecin: ${aiResult.physicianName}',
                          style: const TextStyle(fontSize: 12),
                        ),
                        if (aiResult.dateIssued != null)
                          Text(
                            'Date de délivrance: ${aiResult.dateIssued}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        const SizedBox(height: 6),
                        Text(
                          aiResult.findingsSummary,
                          style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[300] : Colors.grey[800]),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Indice de confiance: ${(aiResult.confidenceScore * 100).toStringAsFixed(0)}%',
                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 20),

                // Decision Action Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      icon: const Icon(Icons.close, color: Colors.red, size: 18),
                      label: const Text('Refuser', style: TextStyle(color: Colors.red)),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onPressed: () => _updateStatus(id, 'REJECTED'),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.check, size: 18),
                      label: Text(AppLocalizations.of(context).get('approuver')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () => _updateStatus(id, 'APPROVED'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
