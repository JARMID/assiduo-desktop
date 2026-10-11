import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/services/data_repository.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/export_service.dart';

class ClassesDashboardView extends StatefulWidget {
  const ClassesDashboardView({super.key});

  @override
  State<ClassesDashboardView> createState() => _ClassesDashboardViewState();
}

class _ClassesDashboardViewState extends State<ClassesDashboardView> {
  bool _isLoading = true;
  List<ClassGroup> _classes = [];
  List<Speciality> _specialities = [];
  Map<String, int> _studentCounts = {};
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
        repo.getClasses(),
        repo.getStudentCountPerClass(),
        repo.getSpecialities(),
      ]);
      if (mounted) {
        setState(() {
          _classes = results[0] as List<ClassGroup>;
          _studentCounts = results[1] as Map<String, int>;
          _specialities = results[2] as List<Speciality>;
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

  List<ClassGroup> get _filteredClasses {
    if (_searchQuery.isEmpty) return _classes;
    final q = _searchQuery.toLowerCase();
    return _classes.where((c) =>
        c.name.toLowerCase().contains(q) ||
        c.level.toLowerCase().contains(q) ||
        c.speciality.toLowerCase().contains(q)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filtered = _filteredClasses;

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
                      : _buildClassCards(filtered, isDark),
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
              colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF667EEA).withAlpha(40),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(Icons.class_rounded, color: Colors.white, size: 28),
        ),
        const SizedBox(width: 20),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Gestion des Classes',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppTheme.textDark,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$count classe${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}',
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
                  hintText: 'Rechercher une classe…',
                  hintStyle: TextStyle(color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted, fontSize: 14),
                  prefixIcon: Icon(Icons.search_rounded, size: 20, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
          ),
          _buildToolbarBtn(icon: Icons.refresh_rounded, tooltip: 'Actualiser', isDark: isDark, onTap: _loadData),
          // Add class
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: _showCreateClassDialog,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF667EEA), Color(0xFF764BA2)]),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: const Color(0xFF667EEA).withAlpha(30), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text('Nouvelle Classe', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
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
              decoration: BoxDecoration(color: const Color(0xFF667EEA).withAlpha(15), shape: BoxShape.circle),
              child: Icon(Icons.class_outlined, size: 40, color: const Color(0xFF667EEA).withAlpha(80)),
            ),
            const SizedBox(height: 24),
            Text(
              _searchQuery.isEmpty ? 'Aucune classe enregistrée' : 'Aucun résultat pour "$_searchQuery"',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppTheme.textDark),
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isEmpty ? 'Créez votre première classe pour commencer.' : 'Essayez un autre terme de recherche.',
              style: TextStyle(fontSize: 14, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClassCards(List<ClassGroup> classGroups, bool isDark) {
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
                _hdrCell('Classe', flex: 2),
                _hdrCell('Spécialité', flex: 2),
                _hdrCell('Niveau', flex: 1, align: TextAlign.center),
                _hdrCell('Stats', flex: 2, align: TextAlign.center),
                _hdrCell('Actions', flex: 2, align: TextAlign.center),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: classGroups.length,
              itemBuilder: (context, index) {
                final classGroup = classGroups[index];
                final count = _studentCounts[classGroup.id] ?? 0;
                final modCount = classGroup.modules?.length ?? 0;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: index.isEven ? Colors.transparent : (isDark ? const Color(0xFF0E1228) : const Color(0xFFF8FAFF)),
                    border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF1A2040) : const Color(0xFFF0F3FF))),
                  ),
                  child: Row(
                    children: [
                      // Name
                      Expanded(
                        flex: 2,
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
                                  classGroup.name.substring(0, 2).toUpperCase(),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(classGroup.name,
                                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: isDark ? Colors.white : AppTheme.textDark),
                                  overflow: TextOverflow.ellipsis),
                            ),
                          ],
                        ),
                      ),
                      // Speciality
                      Expanded(
                        flex: 2,
                        child: Text(classGroup.speciality,
                            style: TextStyle(fontSize: 13, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
                            overflow: TextOverflow.ellipsis, maxLines: 1),
                      ),
                      // Level badge
                      Expanded(
                        flex: 1,
                        child: Align(
                          alignment: Alignment.center,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryBlue.withAlpha(15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(classGroup.level,
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? AppTheme.textLightMuted : AppTheme.primaryBlue)),
                          ),
                        ),
                      ),
                      // Stats
                      Expanded(
                        flex: 2,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: (count > 0 ? AppTheme.primaryGreen : Colors.grey).withAlpha(15), borderRadius: BorderRadius.circular(6)),
                              child: Row(
                                children: [
                                  Icon(Icons.people_rounded, size: 12, color: count > 0 ? AppTheme.primaryGreen : Colors.grey),
                                  const SizedBox(width: 4),
                                  Text(count.toString(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: count > 0 ? AppTheme.primaryGreen : Colors.grey)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: AppTheme.primaryPurple.withAlpha(15), borderRadius: BorderRadius.circular(6)),
                              child: Row(
                                children: [
                                  const Icon(Icons.book_rounded, size: 12, color: AppTheme.primaryPurple),
                                  const SizedBox(width: 4),
                                  Text(modCount.toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryPurple)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Actions
                      Expanded(
                        flex: 2,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _actionBtn(Icons.people_outlined, AppTheme.accentGold, 'Voir les stagiaires', isDark, () => _showClassStudents(classGroup)),
                            const SizedBox(width: 4),
                            _actionBtn(Icons.print_outlined, Colors.teal, 'Imprimer fiche de présence vierge', isDark, () => _exportBlankAttendanceSheet(classGroup)),
                            const SizedBox(width: 4),
                            _actionBtn(Icons.edit_outlined, const Color(0xFF4FACFE), 'Modifier', isDark, () => _showEditClassDialog(classGroup)),
                            const SizedBox(width: 4),
                            _actionBtn(Icons.delete_outline_rounded, AppTheme.dangerRed, 'Supprimer', isDark, () => _confirmDelete(classGroup)),
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
            width: 32, height: 32,
            decoration: BoxDecoration(color: color.withAlpha(isDark ? 20 : 12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 16, color: color),
          ),
        ),
      ),
    );
  }

  Color _avatarColor(int index) {
    const colors = [Color(0xFF667EEA), Color(0xFF4FACFE), Color(0xFFFA709A), Color(0xFFA18CD1), Color(0xFF43E97B)];
    return colors[index % colors.length];
  }

  void _showCreateClassDialog() {
    final nameController = TextEditingController();
    final levelController = TextEditingController();
    final specialityController = TextEditingController();
    final modulesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.class_, color: AppTheme.primaryPurple),
              SizedBox(width: 12),
              Text('Nouvelle Classe'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Nom de la classe', prefixIcon: Icon(Icons.label)),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Spécialité *', prefixIcon: Icon(Icons.category)),
                items: _specialities.map((s) {
                  final text = s.nameFr ?? s.nameAr;
                  return DropdownMenuItem(
                    value: text,
                    child: Text('${s.code} - $text'),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    specialityController.text = val;
                  }
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: levelController,
                decoration: const InputDecoration(labelText: 'Niveau (ex: S1, S2, S3)', prefixIcon: Icon(Icons.school)),
              ),
              const SizedBox(height: 12),
              RawAutocomplete<String>(
                textEditingController: modulesController,
                focusNode: FocusNode(),
                optionsBuilder: (TextEditingValue textEditingValue) {
                  final allModules = _classes
                      .expand((c) => c.modules ?? <ClassModule>[])
                      .map((m) => m.name.trim())
                      .where((m) => m.isNotEmpty)
                      .toSet()
                      .toList();

                  final text = textEditingValue.text;
                  if (!text.contains(',')) {
                     if (text.isEmpty) return allModules;
                     return allModules.where((m) => m.toLowerCase().contains(text.toLowerCase()));
                  }

                  final segments = text.split(',');
                  final lastSegment = segments.last.trimLeft();
                  if (lastSegment.isEmpty) return allModules;
                  return allModules.where((m) => m.toLowerCase().contains(lastSegment.toLowerCase()));
                },
                onSelected: (String selection) {
                  final text = modulesController.text;
                  if (!text.contains(',')) {
                    modulesController.text = '$selection, ';
                  } else {
                    final segments = text.split(',');
                    segments.removeLast();
                    modulesController.text = '${segments.join(',')}, $selection, ';
                  }
                  modulesController.selection = TextSelection.fromPosition(TextPosition(offset: modulesController.text.length));
                },
                fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
                  return TextField(
                    controller: controller,
                    focusNode: focusNode,
                    decoration: const InputDecoration(labelText: 'Modules (séparés par des virgules)', prefixIcon: Icon(Icons.book)),
                    maxLines: 2,
                  );
                },
                optionsViewBuilder: (context, onSelected, options) {
                  final isDark = Theme.of(context).brightness == Brightness.dark;
                  return Align(
                    alignment: Alignment.topLeft,
                    child: Material(
                      elevation: 4.0,
                      color: isDark ? const Color(0xFF1A1F36) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxHeight: 200, maxWidth: 350),
                        child: ListView.builder(
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          itemCount: options.length,
                          itemBuilder: (BuildContext context, int index) {
                            final String option = options.elementAt(index);
                            return InkWell(
                              onTap: () => onSelected(option),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Text(option),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  );
                },
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
                if (nameController.text.trim().isEmpty || levelController.text.trim().isEmpty || specialityController.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Veuillez remplir tous les champs requis.')),
                  );
                  return;
                }
                final messenger = ScaffoldMessenger.of(context);
                final repo = context.read<DataRepository>();
                Navigator.pop(context);
                setState(() => _isLoading = true);
                try {
                  await repo.createClass(
                    nameController.text.trim(),
                    levelController.text.trim(),
                    specialityController.text.trim(),
                    modules: modulesController.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
                  );
                  _loadData();
                  if (mounted) {
                    messenger.showSnackBar(
                      const SnackBar(content: Text('✅ Classe créée avec succès')),
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
                backgroundColor: AppTheme.primaryPurple,
                foregroundColor: Colors.white,
              ),
              child: const Text('Créer'),
            ),
          ],
        );
      },
    );
  }

  void _showEditClassDialog(ClassGroup classGroup) {
    final nameController = TextEditingController(text: classGroup.name);
    final levelController = TextEditingController(text: classGroup.level);
    final specialityController = TextEditingController(text: classGroup.speciality);
    final modulesController = TextEditingController(text: classGroup.modules?.map((m) => m.name).join(', ') ?? '');

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.edit, color: AppTheme.primaryBlue),
              SizedBox(width: 12),
              Text('Modifier la Classe'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Nom de la classe', prefixIcon: Icon(Icons.label)),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _specialities.any((s) => (s.nameFr ?? s.nameAr) == specialityController.text) 
                    ? specialityController.text 
                    : null,
                decoration: const InputDecoration(labelText: 'Spécialité *', prefixIcon: Icon(Icons.category)),
                items: [
                  ..._specialities.map((s) {
                    final text = s.nameFr ?? s.nameAr;
                    return DropdownMenuItem(
                      value: text,
                      child: Text('${s.code} - $text'),
                    );
                  }),
                  if (!_specialities.any((s) => (s.nameFr ?? s.nameAr) == specialityController.text))
                    DropdownMenuItem(
                      value: specialityController.text,
                      child: Text(specialityController.text),
                    ),
                ],
                onChanged: (val) {
                  if (val != null) {
                    specialityController.text = val;
                  }
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: levelController,
                decoration: const InputDecoration(labelText: 'Niveau', prefixIcon: Icon(Icons.school)),
              ),
              const SizedBox(height: 12),
              RawAutocomplete<String>(
                textEditingController: modulesController,
                focusNode: FocusNode(),
                optionsBuilder: (TextEditingValue textEditingValue) {
                  final allModules = _classes
                      .expand((c) => c.modules ?? <ClassModule>[])
                      .map((m) => m.name.trim())
                      .where((m) => m.isNotEmpty)
                      .toSet()
                      .toList();

                  final text = textEditingValue.text;
                  if (!text.contains(',')) {
                     if (text.isEmpty) return allModules;
                     return allModules.where((m) => m.toLowerCase().contains(text.toLowerCase()));
                  }

                  final segments = text.split(',');
                  final lastSegment = segments.last.trimLeft();
                  if (lastSegment.isEmpty) return allModules;
                  return allModules.where((m) => m.toLowerCase().contains(lastSegment.toLowerCase()));
                },
                onSelected: (String selection) {
                  final text = modulesController.text;
                  if (!text.contains(',')) {
                    modulesController.text = '$selection, ';
                  } else {
                    final segments = text.split(',');
                    segments.removeLast();
                    modulesController.text = '${segments.join(',')}, $selection, ';
                  }
                  modulesController.selection = TextSelection.fromPosition(TextPosition(offset: modulesController.text.length));
                },
                fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
                  return TextField(
                    controller: controller,
                    focusNode: focusNode,
                    decoration: const InputDecoration(labelText: 'Modules (séparés par des virgules)', prefixIcon: Icon(Icons.book)),
                    maxLines: 2,
                  );
                },
                optionsViewBuilder: (context, onSelected, options) {
                  final isDark = Theme.of(context).brightness == Brightness.dark;
                  return Align(
                    alignment: Alignment.topLeft,
                    child: Material(
                      elevation: 4.0,
                      color: isDark ? const Color(0xFF1A1F36) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxHeight: 200, maxWidth: 350),
                        child: ListView.builder(
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          itemCount: options.length,
                          itemBuilder: (BuildContext context, int index) {
                            final String option = options.elementAt(index);
                            return InkWell(
                              onTap: () => onSelected(option),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Text(option),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  );
                },
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
                  await repo.updateClass(
                    classGroup.id,
                    nameController.text.trim(),
                    levelController.text.trim(),
                    specialityController.text.trim(),
                    modules: modulesController.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
                  );
                  _loadData();
                  if (mounted) {
                    messenger.showSnackBar(
                      const SnackBar(content: Text('✅ Classe modifiée avec succès')),
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

  Future<void> _exportBlankAttendanceSheet(ClassGroup classGroup) async {
    setState(() => _isLoading = true);
    try {
      final repo = context.read<DataRepository>();
      final students = await repo.getStudentsForClass(classGroup.id);
      await ExportService.exportBlankAttendanceSheet(classGroup: classGroup, students: students);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur lors de l\'export: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showClassStudents(ClassGroup classGroup) async {
    showDialog(
      context: context,
      builder: (ctx) => _ClassStudentsDialog(classGroup: classGroup),
    );
  }

  void _confirmDelete(ClassGroup classGroup) {
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
            'Êtes-vous sûr de vouloir supprimer la classe ${classGroup.name} ?\n\n'
            'Cela supprimera également toutes les affectations de stagiaires à cette classe.',
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
                  await repo.deleteClass(classGroup.id);
                  _loadData();
                  if (mounted) {
                    messenger.showSnackBar(
                      const SnackBar(content: Text('Classe supprimée.')),
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
}

class _ClassStudentsDialog extends StatefulWidget {
  final ClassGroup classGroup;
  const _ClassStudentsDialog({required this.classGroup});

  @override
  State<_ClassStudentsDialog> createState() => _ClassStudentsDialogState();
}

class _ClassStudentsDialogState extends State<_ClassStudentsDialog> {
  bool _isLoading = true;
  List<Student> _students = [];

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  Future<void> _loadStudents() async {
    try {
      final repo = context.read<DataRepository>();
      final students = await repo.getStudentsForClass(widget.classGroup.id);
      if (mounted) {
        setState(() {
          _students = students;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        width: 500,
        constraints: const BoxConstraints(maxHeight: 500),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.accentGold.withAlpha(25),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.people, color: AppTheme.accentGold),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.classGroup.name,
                        style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${widget.classGroup.speciality} — ${widget.classGroup.level}',
                        style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                if (!_isLoading)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryBlue.withAlpha(20),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${_students.length} stagiaires',
                      style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Flexible(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _students.isEmpty
                      ? const Center(
                          child: Text('Aucun stagiaire inscrit dans cette classe.',
                              style: TextStyle(color: Colors.grey)),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          itemCount: _students.length,
                          separatorBuilder: (_, i) => const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final student = _students[index];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AppTheme.primaryPurple.withAlpha(25),
                                child: Text(
                                  '${student.firstName[0]}${student.lastName[0]}',
                                  style: const TextStyle(color: AppTheme.primaryPurple, fontWeight: FontWeight.bold),
                                ),
                              ),
                              title: Text(
                                '${student.lastName.toUpperCase()} ${student.firstName}',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                              subtitle: Text('Matricule: ${student.matricule}', style: const TextStyle(fontSize: 12)),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
