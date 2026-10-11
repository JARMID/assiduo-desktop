import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/services/data_repository.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_theme.dart';

class TeachersDashboardView extends StatefulWidget {
  const TeachersDashboardView({super.key});

  @override
  State<TeachersDashboardView> createState() => _TeachersDashboardViewState();
}

class _TeachersDashboardViewState extends State<TeachersDashboardView> {
  bool _isLoading = true;
  List<AppUser> _teachers = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadTeachers();
  }

  Future<void> _loadTeachers() async {
    setState(() => _isLoading = true);
    try {
      final repo = context.read<DataRepository>();
      final users = await repo.getUsers();
      if (mounted) {
        setState(() {
          _teachers = users.where((u) => u.role == 'FORMATEUR').toList();
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

  List<AppUser> get _filteredTeachers {
    if (_searchQuery.isEmpty) return _teachers;
    final q = _searchQuery.toLowerCase();
    return _teachers
        .where((t) =>
            t.firstName.toLowerCase().contains(q) ||
            t.lastName.toLowerCase().contains(q) ||
            (t.matricule?.toLowerCase().contains(q) ?? false))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filtered = _filteredTeachers;

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

            // Search & Actions Bar
            _buildToolbar(isDark),
            const SizedBox(height: 24),

            // Table
            Expanded(
              child: _isLoading
                  ? const SizedBox.shrink()
                  : filtered.isEmpty
                      ? _buildEmptyState(isDark)
                      : _buildTeacherCards(filtered, isDark),
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
          child: const Icon(Icons.badge_rounded, color: Colors.white, size: 28),
        ),
        const SizedBox(width: 20),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Gestion des Formateurs',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppTheme.textDark,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$count formateur${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''}',
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
      child: Row(
        children: [
          // Search
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0D1025) : const Color(0xFFF5F7FF),
                borderRadius: BorderRadius.circular(14),
              ),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                style: TextStyle(
                  color: isDark ? Colors.white : AppTheme.textDark,
                  fontSize: 14,
                ),
                decoration: InputDecoration(
                  hintText: 'Rechercher un formateur…',
                  hintStyle: TextStyle(
                    color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
                    fontSize: 14,
                  ),
                  prefixIcon: Icon(
                    Icons.search_rounded,
                    size: 20,
                    color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Refresh
          _buildToolbarButton(
            icon: Icons.refresh_rounded,
            tooltip: 'Actualiser',
            isDark: isDark,
            onTap: _loadTeachers,
          ),
          const SizedBox(width: 8),
          // Add
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: _showCreateTeacherDialog,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF667EEA).withAlpha(30),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add_rounded, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Nouveau Formateur',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToolbarButton({
    required IconData icon,
    required String tooltip,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return Tooltip(
      message: tooltip,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1A2040) : const Color(0xFFF0F3FF),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? const Color(0xFF2A3250) : const Color(0xFFE0E6F0),
              ),
            ),
            child: Icon(
              icon,
              size: 20,
              color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
            ),
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
          border: Border.all(
            color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFF667EEA).withAlpha(15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.badge_outlined,
                size: 40,
                color: const Color(0xFF667EEA).withAlpha(80),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              _searchQuery.isEmpty
                  ? 'Aucun formateur enregistré'
                  : 'Aucun résultat pour "$_searchQuery"',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : AppTheme.textDark,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isEmpty
                  ? 'Ajoutez votre premier formateur en cliquant sur le bouton ci-dessus.'
                  : 'Essayez un autre terme de recherche.',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTeacherCards(List<AppUser> teachers, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111730) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withAlpha(20) : Colors.black.withAlpha(5),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Table header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF141938) : const Color(0xFFF8FAFF),
              border: Border(
                bottom: BorderSide(
                  color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
                ),
              ),
            ),
            child: Row(
              children: [
                _headerCell('Formateur', flex: 3),
                _headerCell('Matricule', flex: 2),
                _headerCell('Date de création', flex: 2),
                _headerCell('Actions', flex: 2, align: TextAlign.center),
              ],
            ),
          ),
          // Rows
          Expanded(
            child: ListView.builder(
              itemCount: teachers.length,
              itemBuilder: (context, index) {
                final teacher = teachers[index];
                return _buildTeacherRow(teacher, index, isDark);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _headerCell(String text, {int flex = 1, TextAlign align = TextAlign.left}) {
    return Expanded(
      flex: flex,
      child: Text(
        text,
        textAlign: align,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
          color: AppTheme.textDarkMuted.withAlpha(180),
        ),
      ),
    );
  }

  Widget _buildTeacherRow(AppUser teacher, int index, bool isDark) {
    final dateStr = '${teacher.createdAt.toLocal().day.toString().padLeft(2, '0')}/'
        '${teacher.createdAt.toLocal().month.toString().padLeft(2, '0')}/'
        '${teacher.createdAt.toLocal().year}';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: index.isEven
            ? Colors.transparent
            : (isDark ? const Color(0xFF0E1228) : const Color(0xFFF8FAFF)),
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF1A2040) : const Color(0xFFF0F3FF),
          ),
        ),
      ),
      child: Row(
        children: [
          // Avatar + Name
          Expanded(
            flex: 3,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _getAvatarColor(index),
                        _getAvatarColor(index).withAlpha(180),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      '${teacher.firstName[0]}${teacher.lastName[0]}'.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${teacher.lastName.toUpperCase()} ${teacher.firstName}',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: isDark ? Colors.white : AppTheme.textDark,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        teacher.matricule ?? 'Matricule non défini',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppTheme.primaryPurple.withAlpha(12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                teacher.matricule ?? '—',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppTheme.textLightMuted : AppTheme.primaryPurple,
                ),
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              dateStr,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildActionButton(
                  icon: Icons.edit_outlined,
                  color: const Color(0xFF4FACFE),
                  tooltip: 'Modifier',
                  isDark: isDark,
                  onTap: () => _showEditTeacherDialog(teacher),
                ),
                const SizedBox(width: 4),
                _buildActionButton(
                  icon: Icons.lock_reset_rounded,
                  color: AppTheme.accentGold,
                  tooltip: 'Réinitialiser MDP',
                  isDark: isDark,
                  onTap: () => _showResetPasswordDialog(teacher),
                ),
                const SizedBox(width: 4),
                _buildActionButton(
                  icon: Icons.delete_outline_rounded,
                  color: AppTheme.dangerRed,
                  tooltip: 'Supprimer',
                  isDark: isDark,
                  onTap: () => _confirmDelete(teacher),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required Color color,
    required String tooltip,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return Tooltip(
      message: tooltip,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: color.withAlpha(isDark ? 20 : 12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
        ),
      ),
    );
  }

  Color _getAvatarColor(int index) {
    const colors = [
      Color(0xFF667EEA),
      Color(0xFFF093FB),
      Color(0xFF4FACFE),
      Color(0xFF43E97B),
      Color(0xFFFA709A),
      Color(0xFFA18CD1),
    ];
    return colors[index % colors.length];
  }

  // ─── Dialogs ───────────────────────────────────────────────

  void _showCreateTeacherDialog() {
    final emailController = TextEditingController();
    final passwordController = TextEditingController(text: 'password123');
    final firstNameController = TextEditingController();
    final lastNameController = TextEditingController();
    final matriculeController = TextEditingController();
    bool obscurePassword = true;
    bool isCreating = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [
                  Icon(Icons.person_add_rounded, color: AppTheme.primaryPurple),
                  SizedBox(width: 12),
                  Text('Créer un Compte Formateur'),
                ],
              ),
              content: SingleChildScrollView(
                child: SizedBox(
                  width: 420,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue.withAlpha(15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.primaryBlue.withAlpha(40)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.info_outline, size: 18, color: AppTheme.primaryBlue),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Ceci crée un compte avec accès à l\'app Formateur.',
                                style: TextStyle(fontSize: 12, color: AppTheme.primaryBlue),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: emailController,
                        decoration: const InputDecoration(
                          labelText: 'E-mail *',
                          prefixIcon: Icon(Icons.email),
                          hintText: 'formateur@insfp.dz',
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: passwordController,
                        obscureText: obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Mot de passe *',
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(obscurePassword ? Icons.visibility : Icons.visibility_off),
                            onPressed: () => setDialogState(() => obscurePassword = !obscurePassword),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: firstNameController,
                        decoration: const InputDecoration(labelText: 'Prénom *', prefixIcon: Icon(Icons.person)),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: lastNameController,
                        decoration: const InputDecoration(labelText: 'Nom *', prefixIcon: Icon(Icons.person_outline)),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: matriculeController,
                        decoration: const InputDecoration(labelText: 'Matricule (optionnel)', prefixIcon: Icon(Icons.badge)),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isCreating ? null : () => Navigator.pop(context),
                  child: const Text('Annuler'),
                ),
                ElevatedButton.icon(
                  onPressed: isCreating
                      ? null
                      : () async {
                          if (emailController.text.isEmpty ||
                              passwordController.text.isEmpty ||
                              firstNameController.text.isEmpty ||
                              lastNameController.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Veuillez remplir tous les champs obligatoires (*)'), backgroundColor: AppTheme.dangerRed),
                            );
                            return;
                          }
                          final messenger = ScaffoldMessenger.of(context);
                          final navigator = Navigator.of(context);
                          final repo = context.read<DataRepository>();
                          setDialogState(() => isCreating = true);
                          try {
                            await repo.createFormateurAccount(
                              email: emailController.text.trim(),
                              password: passwordController.text,
                              firstName: firstNameController.text.trim(),
                              lastName: lastNameController.text.trim(),
                              matricule: matriculeController.text.trim().isEmpty ? null : matriculeController.text.trim(),
                            );
                            navigator.pop();
                            _loadTeachers();
                            if (mounted) {
                              messenger.showSnackBar(SnackBar(
                                content: Text('✅ Compte créé pour ${firstNameController.text} (${emailController.text})'),
                                backgroundColor: AppTheme.primaryGreen,
                              ));
                            }
                          } catch (e) {
                            setDialogState(() => isCreating = false);
                            if (mounted) {
                              messenger.showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppTheme.dangerRed));
                            }
                          }
                        },
                  icon: isCreating
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.check),
                  label: Text(isCreating ? 'Création…' : 'Créer le Compte'),
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryPurple, foregroundColor: Colors.white),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showEditTeacherDialog(AppUser teacher) {
    final firstNameController = TextEditingController(text: teacher.firstName);
    final lastNameController = TextEditingController(text: teacher.lastName);
    final matriculeController = TextEditingController(text: teacher.matricule ?? '');

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [Icon(Icons.edit_rounded, color: AppTheme.primaryBlue), SizedBox(width: 12), Text('Modifier le Formateur')],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: matriculeController, decoration: const InputDecoration(labelText: 'Matricule', prefixIcon: Icon(Icons.badge))),
              const SizedBox(height: 12),
              TextField(controller: firstNameController, decoration: const InputDecoration(labelText: 'Prénom', prefixIcon: Icon(Icons.person))),
              const SizedBox(height: 12),
              TextField(controller: lastNameController, decoration: const InputDecoration(labelText: 'Nom', prefixIcon: Icon(Icons.person_outline))),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
            ElevatedButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final repo = context.read<DataRepository>();
                Navigator.pop(context);
                setState(() => _isLoading = true);
                try {
                  await repo.updateUser(
                    teacher.id,
                    firstNameController.text.trim(),
                    lastNameController.text.trim(),
                    matriculeController.text.trim().isEmpty ? null : matriculeController.text.trim(),
                  );
                  _loadTeachers();
                  if (mounted) {
                    messenger.showSnackBar(const SnackBar(content: Text('✅ Formateur modifié avec succès')));
                  }
                } catch (e) {
                  if (mounted) {
                    messenger.showSnackBar(SnackBar(content: Text('Erreur: $e')));
                    setState(() => _isLoading = false);
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue, foregroundColor: Colors.white),
              child: const Text('Enregistrer'),
            ),
          ],
        );
      },
    );
  }

  void _showResetPasswordDialog(AppUser teacher) {
    final passwordController = TextEditingController();
    bool obscurePassword = true;
    bool isSaving = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [Icon(Icons.lock_reset, color: AppTheme.accentGold), SizedBox(width: 12), Text('Réinitialiser Mot de Passe')],
              ),
              content: SizedBox(
                width: 400,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Nouveau mot de passe pour ${teacher.fullName} (${teacher.matricule ?? teacher.id})'),
                    const SizedBox(height: 16),
                    TextField(
                      controller: passwordController,
                      obscureText: obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Nouveau Mot de passe',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(obscurePassword ? Icons.visibility_off : Icons.visibility),
                          onPressed: () => setDialogState(() => obscurePassword = !obscurePassword),
                        ),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
                ElevatedButton(
                  onPressed: isSaving
                      ? null
                      : () async {
                          if (passwordController.text.trim().length < 6) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Le mot de passe doit contenir au moins 6 caractères.')),
                            );
                            return;
                          }
                          setDialogState(() => isSaving = true);
                          try {
                            final repo = context.read<DataRepository>();
                            await repo.resetUserPassword(teacher.id, passwordController.text.trim());
                            if (context.mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Mot de passe de ${teacher.firstName} réinitialisé avec succès.')),
                              );
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
                              setDialogState(() => isSaving = false);
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentGold, foregroundColor: Colors.white),
                  child: isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Réinitialiser'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _confirmDelete(AppUser teacher) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [Icon(Icons.warning_amber_rounded, color: AppTheme.dangerRed), SizedBox(width: 12), Text('Confirmer la suppression')],
          ),
          content: Text('Êtes-vous sûr de vouloir supprimer le formateur ${teacher.fullName} ?\n\nCette action est irréversible.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
            ElevatedButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final repo = context.read<DataRepository>();
                Navigator.pop(context);
                setState(() => _isLoading = true);
                try {
                  await repo.deleteUser(teacher.id);
                  _loadTeachers();
                  if (mounted) {
                    messenger.showSnackBar(const SnackBar(content: Text('Formateur supprimé.')));
                  }
                } catch (e) {
                  if (mounted) {
                    messenger.showSnackBar(SnackBar(content: Text('Erreur: $e')));
                    setState(() => _isLoading = false);
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.dangerRed, foregroundColor: Colors.white),
              child: const Text('Supprimer'),
            ),
          ],
        );
      },
    );
  }
}
