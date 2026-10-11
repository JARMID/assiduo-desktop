import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/services/data_repository.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_theme.dart';

class SpecialitiesDashboardView extends StatefulWidget {
  const SpecialitiesDashboardView({super.key});

  @override
  State<SpecialitiesDashboardView> createState() => _SpecialitiesDashboardViewState();
}

class _SpecialitiesDashboardViewState extends State<SpecialitiesDashboardView> {
  bool _isLoading = true;
  List<Speciality> _specialities = [];
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
      final results = await repo.getSpecialities();
      if (mounted) {
        setState(() {
          _specialities = results;
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

  List<Speciality> get _filteredSpecialities {
    if (_searchQuery.isEmpty) return _specialities;
    final q = _searchQuery.toLowerCase();
    return _specialities.where((s) =>
        s.code.toLowerCase().contains(q) ||
        s.nameAr.toLowerCase().contains(q) ||
        (s.nameFr?.toLowerCase().contains(q) ?? false)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filtered = _filteredSpecialities;

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
                      : _buildSpecialityCards(filtered, isDark),
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
              colors: [Color(0xFFFA709A), Color(0xFFFEE140)],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFA709A).withAlpha(40),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(Icons.category_rounded, color: Colors.white, size: 28),
        ),
        const SizedBox(width: 20),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Spécialités',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppTheme.textDark,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$count spécialité${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}',
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
                  hintText: 'Rechercher par code ou nom...',
                  hintStyle: TextStyle(color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted, fontSize: 14),
                  prefixIcon: Icon(Icons.search_rounded, size: 20, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
          ),
          _buildToolbarBtn(icon: Icons.refresh_rounded, tooltip: 'Actualiser', isDark: isDark, onTap: _loadData),
          // Add Speciality
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () => _showEditDialog(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFFA709A), Color(0xFFFEE140)]),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: const Color(0xFFFA709A).withAlpha(30), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text('Nouvelle spécialité', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
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
              decoration: BoxDecoration(color: const Color(0xFFFA709A).withAlpha(15), shape: BoxShape.circle),
              child: Icon(Icons.category_outlined, size: 40, color: const Color(0xFFFA709A).withAlpha(80)),
            ),
            const SizedBox(height: 24),
            Text(
              _searchQuery.isEmpty ? 'Aucune spécialité enregistrée' : 'Aucun résultat pour "$_searchQuery"',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppTheme.textDark),
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isEmpty ? 'Créez votre première spécialité pour commencer.' : 'Essayez un autre terme de recherche.',
              style: TextStyle(fontSize: 14, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecialityCards(List<Speciality> specialitiesList, bool isDark) {
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
                _hdrCell('Code', flex: 1),
                _hdrCell('Nom (Ar)', flex: 2),
                _hdrCell('Nom (Fr)', flex: 2),
                _hdrCell('Type', flex: 1, align: TextAlign.center),
                _hdrCell('Durée & Places', flex: 2, align: TextAlign.center),
                _hdrCell('Actions', flex: 1, align: TextAlign.center),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: specialitiesList.length,
              itemBuilder: (context, index) {
                final spec = specialitiesList[index];
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: index.isEven ? Colors.transparent : (isDark ? const Color(0xFF0E1228) : const Color(0xFFF8FAFF)),
                    border: Border(bottom: BorderSide(color: isDark ? const Color(0xFF1A2040) : const Color(0xFFF0F3FF))),
                  ),
                  child: Row(
                    children: [
                      // Code
                      Expanded(
                        flex: 1,
                        child: Text(spec.code, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: isDark ? Colors.white : AppTheme.textDark)),
                      ),
                      // Name Ar
                      Expanded(
                        flex: 2,
                        child: Text(spec.nameAr, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: isDark ? Colors.white : AppTheme.textDark), overflow: TextOverflow.ellipsis, maxLines: 2),
                      ),
                      // Name Fr
                      Expanded(
                         flex: 2,
                         child: Text(spec.nameFr ?? '-', style: TextStyle(fontSize: 13, color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted), overflow: TextOverflow.ellipsis, maxLines: 2),
                      ),
                      // Type badge
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
                            child: Text(spec.trainingType ?? '-',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? AppTheme.textLightMuted : AppTheme.primaryBlue)),
                          ),
                        ),
                      ),
                      // Duration & Places
                      Expanded(
                        flex: 2,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                             Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: (AppTheme.primaryGreen).withAlpha(15), borderRadius: BorderRadius.circular(6)),
                              child: Row(
                                children: [
                                  const Icon(Icons.timer_outlined, size: 12, color: AppTheme.primaryGreen),
                                  const SizedBox(width: 4),
                                  Text(spec.duration ?? '-', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryGreen)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: AppTheme.primaryPurple.withAlpha(15), borderRadius: BorderRadius.circular(6)),
                              child: Row(
                                children: [
                                  const Icon(Icons.people_outline, size: 12, color: AppTheme.primaryPurple),
                                  const SizedBox(width: 4),
                                  Text(spec.capacity?.toString() ?? '-', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryPurple)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Actions
                      Expanded(
                        flex: 1,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _actionBtn(Icons.edit_outlined, const Color(0xFF4FACFE), 'Modifier', isDark, () => _showEditDialog(speciality: spec)),
                            const SizedBox(width: 8),
                            _actionBtn(Icons.delete_outline_rounded, AppTheme.dangerRed, 'Supprimer', isDark, () => _confirmDelete(spec)),
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

  void _showEditDialog({Speciality? speciality}) {
    final codeController = TextEditingController(text: speciality?.code);
    final nameArController = TextEditingController(text: speciality?.nameAr);
    final nameFrController = TextEditingController(text: speciality?.nameFr);
    final typeController = TextEditingController(text: speciality?.trainingType);
    final durationController = TextEditingController(text: speciality?.duration);
    final diplomaController = TextEditingController(text: speciality?.diploma);
    final conditionsController = TextEditingController(text: speciality?.conditions);
    final capacityController = TextEditingController(text: speciality?.capacity?.toString());

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(speciality == null ? Icons.add_circle : Icons.edit, color: AppTheme.primaryPurple),
              const SizedBox(width: 12),
              Text(speciality == null ? 'Nouvelle Spécialité' : 'Modifier la Spécialité'),
            ],
          ),
          content: SizedBox(
            width: 400,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: codeController,
                    decoration: const InputDecoration(labelText: 'Code (Unique) *', prefixIcon: Icon(Icons.code)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameArController,
                    decoration: const InputDecoration(labelText: 'Nom (Arabe) *', prefixIcon: Icon(Icons.language)),
                    textAlign: TextAlign.right,
                    textDirection: TextDirection.rtl,
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameFrController,
                    decoration: const InputDecoration(labelText: 'Nom (Français)', prefixIcon: Icon(Icons.language)),
                  ),
                  const SizedBox(height: 12),
                  Autocomplete<String>(
                    initialValue: TextEditingValue(text: typeController.text),
                    optionsBuilder: (TextEditingValue textEditingValue) {
                      final types = _specialities
                          .map((s) => s.trainingType ?? '')
                          .where((s) => s.isNotEmpty)
                          .toSet()
                          .toList();
                      if (textEditingValue.text.isEmpty) return types;
                      return types.where((t) => t.toLowerCase().contains(textEditingValue.text.toLowerCase()));
                    },
                    onSelected: (String selection) {
                      typeController.text = selection;
                    },
                    fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
                      // Sync changes from user typing back to our typeController
                      controller.addListener(() {
                        typeController.text = controller.text;
                      });
                      return TextField(
                        controller: controller,
                        focusNode: focusNode,
                        decoration: const InputDecoration(labelText: 'Type (ex: حضوري, تمهين)', prefixIcon: Icon(Icons.category)),
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
                  const SizedBox(height: 12),
                  Row(
                     children: [
                       Expanded(
                         child: TextField(
                           controller: durationController,
                           decoration: const InputDecoration(labelText: 'Durée', prefixIcon: Icon(Icons.timer)),
                         ),
                       ),
                       const SizedBox(width: 12),
                       Expanded(
                         child: TextField(
                           controller: capacityController,
                           keyboardType: TextInputType.number,
                           decoration: const InputDecoration(labelText: 'Places', prefixIcon: Icon(Icons.people)),
                         ),
                       ),
                     ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: diplomaController,
                    decoration: const InputDecoration(labelText: 'Diplôme', prefixIcon: Icon(Icons.card_membership)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: conditionsController,
                    decoration: const InputDecoration(labelText: 'Conditions', prefixIcon: Icon(Icons.rule)),
                    maxLines: 2,
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (codeController.text.isEmpty || nameArController.text.isEmpty) {
                  return;
                }
                final messenger = ScaffoldMessenger.of(context);
                final repo = context.read<DataRepository>();
                Navigator.pop(context);
                setState(() => _isLoading = true);
                try {
                  if (speciality == null) {
                     await repo.createSpeciality(
                       code: codeController.text.trim(),
                       nameAr: nameArController.text.trim(),
                       nameFr: nameFrController.text.trim().isEmpty ? null : nameFrController.text.trim(),
                       trainingType: typeController.text.trim().isEmpty ? null : typeController.text.trim(),
                       duration: durationController.text.trim().isEmpty ? null : durationController.text.trim(),
                       diploma: diplomaController.text.trim().isEmpty ? null : diplomaController.text.trim(),
                       conditions: conditionsController.text.trim().isEmpty ? null : conditionsController.text.trim(),
                       capacity: int.tryParse(capacityController.text.trim()),
                     );
                     _loadData();
                     if (mounted) messenger.showSnackBar(const SnackBar(content: Text('✅ Spécialité créée')));
                  } else {
                     await repo.updateSpeciality(
                       id: speciality.id,
                       code: codeController.text.trim(),
                       nameAr: nameArController.text.trim(),
                       nameFr: nameFrController.text.trim().isEmpty ? null : nameFrController.text.trim(),
                       trainingType: typeController.text.trim().isEmpty ? null : typeController.text.trim(),
                       duration: durationController.text.trim().isEmpty ? null : durationController.text.trim(),
                       diploma: diplomaController.text.trim().isEmpty ? null : diplomaController.text.trim(),
                       conditions: conditionsController.text.trim().isEmpty ? null : conditionsController.text.trim(),
                       capacity: int.tryParse(capacityController.text.trim()),
                     );
                     _loadData();
                     if (mounted) messenger.showSnackBar(const SnackBar(content: Text('✅ Modifiée avec succès')));
                  }
                } catch (e) {
                  if (mounted) {
                    messenger.showSnackBar(SnackBar(content: Text('Erreur: $e')));
                    setState(() => _isLoading = false);
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryPurple,
                foregroundColor: Colors.white,
              ),
              child: const Text('Enregistrer'),
            ),
          ],
        );
      },
    );
  }

  void _confirmDelete(Speciality speciality) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: AppTheme.dangerRed),
              SizedBox(width: 12),
              Text('Confirmer'),
            ],
          ),
          content: Text('Êtes-vous sûr de vouloir supprimer ${speciality.code} ?'),
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
                  await repo.deleteSpeciality(speciality.id);
                  _loadData();
                  if (mounted) {
                    messenger.showSnackBar(const SnackBar(content: Text('Supprimée.')));
                  }
                } catch (e) {
                  if (mounted) {
                    messenger.showSnackBar(SnackBar(content: Text('Erreur: $e')));
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
