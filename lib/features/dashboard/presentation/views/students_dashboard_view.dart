import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:csv/csv.dart';
import 'dart:convert';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/services/data_repository.dart';
import '../../../../core/services/export_service.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_theme.dart';

class StudentsDashboardView extends StatefulWidget {
  const StudentsDashboardView({super.key});

  @override
  State<StudentsDashboardView> createState() => _StudentsDashboardViewState();
}

class _StudentsDashboardViewState extends State<StudentsDashboardView> {
  bool _isLoading = true;
  List<Student> _students = [];
  List<ClassGroup> _allClasses = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final repo = context.read<DataRepository>();
      final results = await Future.wait([
        repo.getStudents(),
        repo.getClasses(),
      ]);
      if (mounted) {
        setState(() {
          _students = results[0] as List<Student>;
          _allClasses = results[1] as List<ClassGroup>;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur du chargement: $e')),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  List<Student> get _filteredStudents {
    if (_searchQuery.isEmpty) return _students;
    final q = _searchQuery.toLowerCase();
    return _students.where((s) =>
        s.firstName.toLowerCase().contains(q) ||
        s.lastName.toLowerCase().contains(q) ||
        s.matricule.toLowerCase().contains(q)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filtered = _filteredStudents;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [const Color(0xFF0A0E1A), const Color(0xFF0E1225)]
              : [const Color(0xFFF2F5FA), const Color(0xFFE8EDFF)],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Premium Header
            _buildHeader(isDark, filtered.length),
            const SizedBox(height: 24),

            // Toolbar
            _buildToolbar(isDark),
            const SizedBox(height: 24),

            // Content
            Expanded(
              child: _isLoading
                  ? const SizedBox.shrink()
                  : filtered.isEmpty
                      ? _buildEmptyState(isDark)
                      : _buildStudentCards(filtered, isDark),
            ),
          ]
              .animate(interval: 30.ms)
              .fade(duration: 250.ms)
              .slideY(begin: 0.02, duration: 250.ms, curve: Curves.easeOutQuad),
        ),
      ),
    );
  }

  Widget _buildHeader(bool isDark, int count) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFF093FB), Color(0xFFF5576C)],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFF093FB).withAlpha(40),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(Icons.school_rounded, color: Colors.white, size: 28),
        ),
        const SizedBox(width: 20),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Gestion des Stagiaires',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppTheme.textDark,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$count stagiaire${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''}',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildToolbar(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111730) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withAlpha(20) : Colors.black.withAlpha(5),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          // Search
          SizedBox(
            width: 280,
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0D1025) : const Color(0xFFF5F7FF),
                borderRadius: BorderRadius.circular(14),
              ),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                style: TextStyle(color: isDark ? Colors.white : AppTheme.textDark, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Rechercher un stagiaire…',
                  hintStyle: TextStyle(color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted, fontSize: 14),
                  prefixIcon: Icon(Icons.search_rounded, size: 20, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
          ),
          _buildToolbarBtn(icon: Icons.refresh_rounded, tooltip: 'Actualiser', isDark: isDark, onTap: _loadData),
          _buildToolbarBtn(icon: Icons.download_rounded, tooltip: 'Exporter CSV', isDark: isDark, onTap: () => ExportService.exportStudentsCsv(_students)),
          // Import CSV
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: _showCsvImportDialog,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
                decoration: BoxDecoration(
                  color: const Color(0xFF43E97B).withAlpha(isDark ? 20 : 12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF43E97B).withAlpha(40)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.upload_file_rounded, color: Color(0xFF43E97B), size: 18),
                    SizedBox(width: 8),
                    Text('Importer CSV', style: TextStyle(color: Color(0xFF43E97B), fontWeight: FontWeight.w600, fontSize: 13)),
                  ],
                ),
              ),
            ),
          ),
          // Add student
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: _showCreateStudentDialog,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFF093FB), Color(0xFFF5576C)]),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: const Color(0xFFF093FB).withAlpha(30), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.person_add_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text('Nouveau Stagiaire', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToolbarBtn({required IconData icon, required String tooltip, required bool isDark, required VoidCallback onTap}) {
    return Tooltip(
      message: tooltip,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1A2040) : const Color(0xFFF0F3FF),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? const Color(0xFF2A3250) : const Color(0xFFE0E6F0)),
            ),
            child: Icon(icon, size: 20, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(48),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF111730) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: const Color(0xFFF093FB).withAlpha(15), shape: BoxShape.circle),
              child: Icon(Icons.school_outlined, size: 40, color: const Color(0xFFF093FB).withAlpha(80)),
            ),
            const SizedBox(height: 24),
            Text(
              _searchQuery.isEmpty ? 'Aucun stagiaire enregistré' : 'Aucun résultat pour "$_searchQuery"',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppTheme.textDark),
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isEmpty ? 'Ajoutez des stagiaires manuellement ou via un import CSV.' : 'Essayez un autre terme de recherche.',
              style: TextStyle(fontSize: 14, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentCards(List<Student> students, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111730) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF)),
        boxShadow: [BoxShadow(color: isDark ? Colors.black.withAlpha(20) : Colors.black.withAlpha(5), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF141938) : const Color(0xFFF8FAFF),
              border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF))),
            ),
            child: Row(
              children: [
                _hdrCell('Stagiaire', flex: 3),
                _hdrCell('Matricule', flex: 2),
                _hdrCell('Classes', flex: 2),
                _hdrCell('Actions', flex: 2, align: TextAlign.center),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: students.length,
              itemBuilder: (context, index) {
                final student = students[index];
                final classesNames = student.classes?.map((c) => c.name).join(', ') ?? 'Aucune';
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: index.isEven ? Colors.transparent : (isDark ? const Color(0xFF0E1228) : const Color(0xFFF8FAFF)),
                    border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF1A2040) : const Color(0xFFF0F3FF))),
                  ),
                  child: Row(
                    children: [
                      // Avatar + Name
                      Expanded(
                        flex: 3,
                        child: Row(
                          children: [
                            Container(
                              width: 40, height: 40,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [_avatarColor(index), _avatarColor(index).withAlpha(180)]),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  '${student.firstName[0]}${student.lastName[0]}'.toUpperCase(),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${student.lastName.toUpperCase()} ${student.firstName}',
                                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: isDark ? Colors.white : AppTheme.textDark),
                                      overflow: TextOverflow.ellipsis),
                                  const SizedBox(height: 2),
                                  Text(student.matricule,
                                      style: TextStyle(fontSize: 12, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
                                      overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Matricule badge
                      Expanded(
                        flex: 2,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryPurple.withAlpha(12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(student.matricule,
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: isDark ? AppTheme.textLightMuted : AppTheme.primaryPurple)),
                        ),
                      ),
                      // Classes
                      Expanded(
                        flex: 2,
                        child: Text(classesNames,
                            style: TextStyle(fontSize: 13, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
                            overflow: TextOverflow.ellipsis, maxLines: 1),
                      ),
                      // Actions
                      Expanded(
                        flex: 2,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _actionBtn(Icons.qr_code_rounded, AppTheme.accentGold, 'QR Code', isDark, () => _showQrCode(student)),
                            const SizedBox(width: 4),
                            _actionBtn(Icons.edit_outlined, const Color(0xFF4FACFE), 'Modifier', isDark, () => _showEditStudentDialog(student)),
                            const SizedBox(width: 4),
                            _actionBtn(Icons.delete_outline_rounded, AppTheme.dangerRed, 'Supprimer', isDark, () => _confirmDelete(student)),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _hdrCell(String text, {int flex = 1, TextAlign align = TextAlign.left}) {
    return Expanded(flex: flex, child: Text(text, textAlign: align,
        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: AppTheme.textDarkMuted.withAlpha(180))));
  }

  Widget _actionBtn(IconData icon, Color color, String tooltip, bool isDark, VoidCallback onTap) {
    return Tooltip(
      message: tooltip,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 34, height: 34,
            decoration: BoxDecoration(color: color.withAlpha(isDark ? 20 : 12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 16, color: color),
          ),
        ),
      ),
    );
  }

  Color _avatarColor(int index) {
    const colors = [Color(0xFFF093FB), Color(0xFF667EEA), Color(0xFF4FACFE), Color(0xFF43E97B), Color(0xFFFA709A), Color(0xFFA18CD1)];
    return colors[index % colors.length];
  }

  void _showCreateStudentDialog() {
    final matriculeController = TextEditingController();
    final firstNameController = TextEditingController();
    final lastNameController = TextEditingController();
    List<String> selectedClassIds = [];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Row(
                children: [
                  Icon(Icons.person_add, color: AppTheme.primaryPurple),
                  SizedBox(width: 12),
                  Text('Nouveau Stagiaire'),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: matriculeController,
                      decoration: const InputDecoration(labelText: 'Matricule', prefixIcon: Icon(Icons.badge)),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: firstNameController,
                      decoration: const InputDecoration(labelText: 'Prénom', prefixIcon: Icon(Icons.person)),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: lastNameController,
                      decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.person_outline)),
                    ),
                    const SizedBox(height: 20),
                    const Text('Assigner aux classes:', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _allClasses.map((cls) {
                        final isSelected = selectedClassIds.contains(cls.id);
                        return FilterChip(
                          label: Text(cls.name),
                          selected: isSelected,
                          selectedColor: AppTheme.primaryPurple.withAlpha(40),
                          checkmarkColor: AppTheme.primaryPurple,
                          onSelected: (selected) {
                            setDialogState(() {
                              if (selected) {
                                selectedClassIds.add(cls.id);
                              } else {
                                selectedClassIds.remove(cls.id);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Annuler'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (matriculeController.text.isEmpty ||
                        firstNameController.text.isEmpty ||
                        lastNameController.text.isEmpty) {
                      return;
                    }

                    final messenger = ScaffoldMessenger.of(context);
                    final repo = context.read<DataRepository>();
                    Navigator.pop(context);
                    setState(() => _isLoading = true);

                    try {
                      // Create student with auth account
                      final result = await repo.createStudentWithAuth(
                        matricule: matriculeController.text.trim(),
                        firstName: firstNameController.text.trim(),
                        lastName: lastNameController.text.trim(),
                      );

                      final student = result['student'] as Student;
                      final email = result['email'] as String;
                      final password = result['password'] as String;

                      // Assign to selected classes
                      for (final classId in selectedClassIds) {
                        await repo.assignStudentToClass(student.id, classId);
                      }

                      _loadData();
                      if (mounted) {
                        // Show credentials dialog
                        _showCredentialsDialog(
                          studentName: student.fullName,
                          email: email,
                          password: password,
                        );
                      }
                    } catch (e) {
                      if (mounted) {
                        messenger.showSnackBar(
                          SnackBar(content: Text('Erreur: $e'), backgroundColor: AppTheme.dangerRed),
                        );
                        setState(() => _isLoading = false);
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryPurple,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Créer'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showCredentialsDialog({
    required String studentName,
    required String email,
    required String password,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: AppTheme.primaryGreen, size: 28),
              SizedBox(width: 12),
              Text('Stagiaire créé avec succès'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                studentName,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Text(
                'Identifiants de connexion :',
                style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey),
              ),
              const SizedBox(height: 12),
              _credentialRow(Icons.email_outlined, 'Email', email),
              const SizedBox(height: 8),
              _credentialRow(Icons.lock_outline, 'Mot de passe', password),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.accentGold.withAlpha(25),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.accentGold.withAlpha(80)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppTheme.accentGold, size: 20),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Le stagiaire peut se connecter avec son matricule uniquement (sans @insfp.dz)',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('✅ Stagiaire créé avec compte de connexion')),
                );
              },
              icon: const Icon(Icons.done),
              label: const Text('Fermer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _credentialRow(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF1E1E1E)
            : const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppTheme.primaryBlue),
          const SizedBox(width: 8),
          Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
          Expanded(
            child: SelectableText(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  void _showEditStudentDialog(Student student) {
    final matriculeController = TextEditingController(text: student.matricule);
    final firstNameController = TextEditingController(text: student.firstName);
    final lastNameController = TextEditingController(text: student.lastName);

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.edit, color: AppTheme.primaryBlue),
              SizedBox(width: 12),
              Text('Modifier le Stagiaire'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: matriculeController,
                decoration: const InputDecoration(labelText: 'Matricule', prefixIcon: Icon(Icons.badge)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: firstNameController,
                decoration: const InputDecoration(labelText: 'Prénom', prefixIcon: Icon(Icons.person)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: lastNameController,
                decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.person_outline)),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final repo = context.read<DataRepository>();
                Navigator.pop(context);
                setState(() => _isLoading = true);
                try {
                  await repo.updateStudent(
                    student.id,
                    matriculeController.text.trim(),
                    firstNameController.text.trim(),
                    lastNameController.text.trim(),
                  );
                  _loadData();
                  if (mounted) {
                    messenger.showSnackBar(
                      const SnackBar(content: Text('✅ Stagiaire modifié avec succès')),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    messenger.showSnackBar(
                      SnackBar(content: Text('Erreur: $e')),
                    );
                    setState(() => _isLoading = false);
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                foregroundColor: Colors.white,
              ),
              child: const Text('Enregistrer'),
            ),
          ],
        );
      },
    );
  }

  void _showQrCode(Student student) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.qr_code_2, color: AppTheme.accentGold),
              const SizedBox(width: 12),
              Text('QR Code — ${student.fullName}'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFEEEEEE)),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.qr_code_2, size: 80, color: Colors.black87),
                    const SizedBox(height: 16),
                    SelectableText(
                      student.qrCode ?? 'Non généré',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Matricule: ${student.matricule}',
                style: const TextStyle(color: Colors.grey),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryPurple,
                foregroundColor: Colors.white,
              ),
              child: const Text('Fermer'),
            ),
          ],
        );
      },
    );
  }

  void _confirmDelete(Student student) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: AppTheme.dangerRed),
              SizedBox(width: 12),
              Text('Confirmer la suppression'),
            ],
          ),
          content: Text(
            'Êtes-vous sûr de vouloir supprimer le stagiaire ${student.fullName} (${student.matricule}) ?\n\nCette action supprimera également toutes ses affectations de classes.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final repo = context.read<DataRepository>();
                Navigator.pop(context);
                setState(() => _isLoading = true);
                try {
                  await repo.deleteStudent(student.id);
                  _loadData();
                  if (mounted) {
                    messenger.showSnackBar(
                      const SnackBar(content: Text('Stagiaire supprimé.')),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    messenger.showSnackBar(
                      SnackBar(content: Text('Erreur: $e')),
                    );
                    setState(() => _isLoading = false);
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.dangerRed,
                foregroundColor: Colors.white,
              ),
              child: const Text('Supprimer'),
            ),
          ],
        );
      },
    );
  }

  void _showCsvImportDialog() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['csv'],
      withData: true,
    );

    if (result == null || result.files.isEmpty) return;

    final bytes = result.files.first.bytes;
    if (bytes == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Impossible de lire le fichier'), backgroundColor: AppTheme.dangerRed),
        );
      }
      return;
    }

    final csvString = utf8.decode(bytes);
    final rows = const CsvDecoder().convert(csvString);

    if (rows.length < 2) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Le fichier CSV est vide ou ne contient qu\'un en-tête'), backgroundColor: AppTheme.dangerRed),
        );
      }
      return;
    }

    // Parse header
    final header = rows.first.map((e) => e.toString().toLowerCase().trim()).toList();
    final matIdx = header.indexWhere((h) => h.contains('matri'));
    final fnIdx = header.indexWhere((h) => h.contains('prenom') || h.contains('first'));
    final lnIdx = header.indexWhere((h) => h.contains('nom') || h.contains('last'));
    final clsIdx = header.indexWhere((h) => h.contains('class') || h.contains('groupe') || h.contains('section'));

    if (matIdx < 0 || fnIdx < 0 || lnIdx < 0) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('En-tête CSV invalide. Colonnes requises: matricule, prénom/first_name, nom/last_name'),
            backgroundColor: AppTheme.dangerRed,
            duration: Duration(seconds: 5),
          ),
        );
      }
      return;
    }

    final dataRows = rows.skip(1).map((row) {
      return {
        'matricule': row.length > matIdx ? row[matIdx].toString().trim() : '',
        'first_name': row.length > fnIdx ? row[fnIdx].toString().trim() : '',
        'last_name': row.length > lnIdx ? row[lnIdx].toString().trim() : '',
        'class_name': clsIdx >= 0 && row.length > clsIdx ? row[clsIdx].toString().trim() : '',
      };
    }).where((r) => r['matricule']!.isNotEmpty).toList();

    // Find which classes are new vs existing
    final existingClassNames = _allClasses.map((c) => c.name).toSet();
    final csvClassNames = dataRows.map((r) => r['class_name']!).where((n) => n.isNotEmpty).toSet();
    final newClasses = csvClassNames.difference(existingClassNames);

    if (!mounted) return;

    // Show preview dialog
    showDialog(
      context: context,
      builder: (context) {
        bool isImporting = false;
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  const Icon(Icons.upload_file, color: AppTheme.primaryGreen),
                  const SizedBox(width: 12),
                  Text('Importer ${dataRows.length} Stagiaire(s)'),
                ],
              ),
              content: SizedBox(
                width: 500,
                height: 400,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Stats row
                    Row(
                      children: [
                        _importChip('${dataRows.length} stagiaires', Icons.people, AppTheme.primaryBlue),
                        const SizedBox(width: 8),
                        _importChip('${csvClassNames.length} classes', Icons.class_, AppTheme.primaryPurple),
                        if (newClasses.isNotEmpty) ...[                          const SizedBox(width: 8),
                          _importChip('${newClasses.length} nouvelles', Icons.add_circle, AppTheme.accentGold),
                        ],
                      ],
                    ),
                    if (newClasses.isNotEmpty) ...[                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.accentGold.withAlpha(15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.accentGold.withAlpha(40)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline, size: 16, color: AppTheme.accentGold),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Nouvelles classes à créer: ${newClasses.join(", ")}',
                                style: const TextStyle(fontSize: 12, color: AppTheme.accentGold),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    const Text('Aperçu:', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey.withAlpha(60)),
                        ),
                        child: SingleChildScrollView(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              columnSpacing: 24,
                              columns: const [
                                DataColumn(label: Text('Matricule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                                DataColumn(label: Text('Nom', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                                DataColumn(label: Text('Prénom', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                                DataColumn(label: Text('Classe', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                              ],
                              rows: dataRows.take(50).map((r) {
                                final isNew = newClasses.contains(r['class_name']);
                                return DataRow(cells: [
                                  DataCell(Text(r['matricule']!, style: const TextStyle(fontSize: 12))),
                                  DataCell(Text(r['last_name']!, style: const TextStyle(fontSize: 12))),
                                  DataCell(Text(r['first_name']!, style: const TextStyle(fontSize: 12))),
                                  DataCell(Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(r['class_name']!, style: TextStyle(fontSize: 12, color: isNew ? AppTheme.accentGold : null)),
                                      if (isNew) const Padding(
                                        padding: EdgeInsets.only(left: 4),
                                        child: Icon(Icons.fiber_new, size: 14, color: AppTheme.accentGold),
                                      ),
                                    ],
                                  )),
                                ]);
                              }).toList(),
                            ),
                          ),
                        ),
                      ),
                    ),
                    if (dataRows.length > 50)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text('... et ${dataRows.length - 50} de plus',
                            style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isImporting ? null : () => Navigator.pop(context),
                  child: const Text('Annuler'),
                ),
                ElevatedButton.icon(
                  onPressed: isImporting
                      ? null
                      : () async {
                          final messenger = ScaffoldMessenger.of(context);
                          final navigator = Navigator.of(context);
                          final repo = context.read<DataRepository>();
                          setDialogState(() => isImporting = true);
                          try {
                            final result = await repo.bulkCreateStudents(dataRows);
                            navigator.pop();
                            _loadData();
                            if (mounted) {
                              messenger.showSnackBar(
                                SnackBar(
                                  content: Text(
                                    '✅ ${result['created']} créé(s), ${result['auth_created'] ?? 0} compte(s) auth, ${result['skipped']} ignoré(s)'
                                    '${(result['errors'] as List).isNotEmpty ? ', ${(result['errors'] as List).length} erreur(s)' : ''}',
                                  ),
                                  backgroundColor: AppTheme.primaryGreen,
                                  duration: const Duration(seconds: 5),
                                ),
                              );
                            }
                          } catch (e) {
                            setDialogState(() => isImporting = false);
                            if (mounted) {
                              messenger.showSnackBar(
                                SnackBar(content: Text('Erreur: $e'), backgroundColor: AppTheme.dangerRed),
                              );
                            }
                          }
                        },
                  icon: isImporting
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.upload),
                  label: Text(isImporting ? 'Import en cours…' : 'Importer'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _importChip(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
