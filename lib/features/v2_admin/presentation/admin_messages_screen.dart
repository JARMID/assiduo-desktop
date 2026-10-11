import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/data_repository.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/theme/app_theme.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:admin_portal/core/l10n/app_localizations.dart';

class AdminMessagesScreen extends StatefulWidget {
  const AdminMessagesScreen({super.key});

  @override
  State<AdminMessagesScreen> createState() => _AdminMessagesScreenState();
}

class _AdminMessagesScreenState extends State<AdminMessagesScreen> {
  List<Map<String, dynamic>> _conversations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final repo = context.read<DataRepository>();
      final data = await repo.getAllConversations();
      setState(() {
        _conversations = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _startNewConversation() async {
    final repo = context.read<DataRepository>();
    final students = await repo.getStudents();

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (dialogCtx) {
        String? selectedStudentId;
        final subjectController = TextEditingController();

        return StatefulBuilder(
          builder: (builderCtx, setState) {
            return AlertDialog(
              title: Text(AppLocalizations.of(builderCtx).get('nouveau_message')),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Stagiaire'),
                    items: students.map((s) {
                      return DropdownMenuItem(
                        value: s.id,
                        child: Text(
                          '${s.firstName} ${s.lastName} (${s.matricule})',
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setState(() => selectedStudentId = val);
                    },
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: subjectController,
                    decoration: const InputDecoration(labelText: 'Sujet'),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(builderCtx),
                  child: Text(AppLocalizations.of(builderCtx).get('annuler')),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (selectedStudentId == null ||
                        subjectController.text.isEmpty) {
                      return;
                    }

                    try {
                      final newConv = await repo.createConversation(
                        selectedStudentId!,
                        subjectController.text,
                      );
                      if (builderCtx.mounted) {
                        Navigator.pop(builderCtx);
                      }
                      if (mounted) {
                        context.go('/messages/${newConv.id}');
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(
                          context,
                        ).showSnackBar(SnackBar(content: Text('Erreur: $e')));
                      }
                    }
                  },
                  child: Text(AppLocalizations.of(builderCtx).get('cr_er')),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(
            MediaQuery.of(context).size.width > 600 ? 32.0 : 16.0,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6A11CB).withAlpha(40),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.mail_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Messages',
                      style: TextStyle(
                        fontSize: MediaQuery.of(context).size.width > 600
                            ? 28
                            : 22,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : const Color(0xFF1E2640),
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Messagerie avec les stagiaires',
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? Colors.white70 : Colors.black54,
                      ),
                    ),
                  ],
                ),
              ),
              MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: _startNewConversation,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2575FC), Color(0xFF6A11CB)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2575FC).withAlpha(40),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.add_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                        if (MediaQuery.of(context).size.width > 600) ...[
                          const SizedBox(width: 8),
                          const Text(
                            'Nouveau Message',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: _conversations.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.speaker_notes_off_rounded,
                        size: 64,
                        color: isDark ? Colors.white24 : Colors.black26,
                      ).animate().scale(
                        duration: 300.ms,
                        curve: AppCurves.spring,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "Aucun message",
                        style: TextStyle(
                          color: isDark ? Colors.white54 : Colors.black54,
                          fontSize: 16,
                        ),
                      ).animate().fade(delay: 100.ms),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 8,
                  ),
                  itemCount: _conversations.length,
                  itemBuilder: (context, index) {
                    final item = _conversations[index];
                    final student =
                        item['student'] as Map<String, dynamic>? ?? {};

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: GlassCard(
                        blur: 10,
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      if (student['id'] != null) {
                                        context.go(
                                          '/students/${student['id']}',
                                        );
                                      }
                                    },
                                    borderRadius: BorderRadius.circular(8),
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: const Color(
                                              0xFF6A11CB,
                                            ).withAlpha(30),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.person_rounded,
                                            color: Color(0xFF6A11CB),
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                '${student['first_name']} ${student['last_name']}',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 18,
                                                  color: isDark
                                                      ? Colors.white
                                                      : const Color(0xFF1E2640),
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              Text(
                                                student['matricule'] ?? '',
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  color: isDark
                                                      ? Colors.white54
                                                      : Colors.black54,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: item['status'] == 'OPEN'
                                        ? Colors.green.withAlpha(30)
                                        : Colors.grey.withAlpha(30),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    item['status'] == 'OPEN'
                                        ? 'Ouvert'
                                        : 'Fermé',
                                    style: TextStyle(
                                      color: item['status'] == 'OPEN'
                                          ? Colors.green
                                          : Colors.grey,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              item['subject'] ?? 'Sans objet',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF1E2640),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton.icon(
                                  onPressed: () {
                                    // Navigate to conversation detail
                                    if (item['id'] != null) {
                                      context.go('/messages/${item['id']}');
                                    }
                                  },
                                  icon: const Icon(
                                    Icons.chat_bubble_outline_rounded,
                                    size: 18,
                                  ),
                                  label: Text(
                                    AppLocalizations.of(
                                      context,
                                    ).get('ouvrir_la_conversati'),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFF6A11CB),
                                    side: const BorderSide(
                                      color: Color(0xFF6A11CB),
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
