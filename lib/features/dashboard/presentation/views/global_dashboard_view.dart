import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/services/data_repository.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/premium_chart_card.dart';

class GlobalDashboardView extends StatefulWidget {
  const GlobalDashboardView({super.key});

  @override
  State<GlobalDashboardView> createState() => _GlobalDashboardViewState();
}

class _GlobalDashboardViewState extends State<GlobalDashboardView> {
  bool _isLoading = true;
  Map<String, dynamic> _stats = {};
  List<AttendanceSession> _recentSessions = [];
  List<Map<String, dynamic>> _weekData = [];
  double _overallRate = 0.0;
  late DataRepository _dataRepository;

  @override
  void initState() {
    super.initState();
    _dataRepository = context.read<DataRepository>();
    _loadDashboard();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _dataRepository.subscribeToDashboardChanges(() {
        if (mounted) _loadDashboard();
      });
    });
  }

  @override
  void dispose() {
    _dataRepository.unsubscribeFromDashboardChanges();
    super.dispose();
  }

  Future<void> _loadDashboard() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _dataRepository.getDashboardStats(),
        _dataRepository.getRecentSessions(limit: 5),
        _dataRepository.getWeeklyAttendanceTrends(),
        _dataRepository.getOverallAttendanceRate(),
      ]);
      if (mounted) {
        setState(() {
          _stats = results[0] as Map<String, dynamic>;
          _recentSessions = results[1] as List<AttendanceSession>;
          _weekData = results[2] as List<Map<String, dynamic>>;
          _overallRate = results[3] as double;
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;



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
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: KeyedSubtree(
          key: ValueKey(_isLoading),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            // Header with greeting
            _buildHeader(theme, isDark),
            const SizedBox(height: 32),

            // Stat cards in responsive grid
            LayoutBuilder(
              builder: (context, constraints) {
                final cardWidth = constraints.maxWidth > 900
                    ? (constraints.maxWidth - 80) / 3
                    : constraints.maxWidth > 600
                        ? (constraints.maxWidth - 40) / 2
                        : constraints.maxWidth;
                return Wrap(
                  spacing: 20,
                  runSpacing: 20,
                  children: [
                    _buildGlassStatCard(
                      icon: Icons.people_rounded,
                      label: 'Formateurs',
                      value: '${_stats['total_teachers'] ?? 0}',
                      gradient: const [Color(0xFF667EEA), Color(0xFF764BA2)],
                      isDark: isDark,
                      width: cardWidth,
                      onTap: () => context.go('/teachers'),
                    ),
                    _buildGlassStatCard(
                      icon: Icons.school_rounded,
                      label: 'Stagiaires',
                      value: '${_stats['total_students'] ?? 0}',
                      gradient: const [Color(0xFFF093FB), Color(0xFFF5576C)],
                      isDark: isDark,
                      width: cardWidth,
                      onTap: () => context.go('/students'),
                    ),
                    _buildGlassStatCard(
                      icon: Icons.class_rounded,
                      label: 'Classes',
                      value: '${_stats['total_classes'] ?? 0}',
                      gradient: const [Color(0xFF4FACFE), Color(0xFF00F2FE)],
                      isDark: isDark,
                      width: cardWidth,
                      onTap: () => context.go('/classes'),
                    ),
                    _buildGlassStatCard(
                      icon: Icons.event_note_rounded,
                      label: 'Total Séances',
                      value: '${_stats['total_sessions'] ?? 0}',
                      gradient: const [Color(0xFF43E97B), Color(0xFF38F9D7)],
                      isDark: isDark,
                      width: cardWidth,
                      onTap: () => context.go('/sessions'),
                    ),
                    _buildGlassStatCard(
                      icon: Icons.today_rounded,
                      label: 'Séances aujourd\'hui',
                      value: '${_stats['today_sessions'] ?? 0}',
                      gradient: const [Color(0xFFFA709A), Color(0xFFFEE140)],
                      isDark: isDark,
                      width: cardWidth,
                      onTap: () => context.go('/sessions'),
                    ),
                    _buildGlassStatCard(
                      icon: Icons.how_to_reg_rounded,
                      label: 'Pointages aujourd\'hui',
                      value: '${_stats['today_records'] ?? 0}',
                      gradient: const [Color(0xFFA18CD1), Color(0xFFFBC2EB)],
                      isDark: isDark,
                      width: cardWidth,
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: 40),

            // Advanced Charts & Visualizations
            LayoutBuilder(
              builder: (context, constraints) {
                final isDesktop = constraints.maxWidth > 900;
                return Flex(
                  direction: isDesktop ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: isDesktop ? 2 : 0,
                      child: PremiumChartCard(
                        title: 'Tendances Hebdomadaires',
                        subtitle: 'Synthèse des présences, absences et retards sur les 7 derniers jours',
                        weekData: _weekData,
                      ),
                    ),
                    if (isDesktop) const SizedBox(width: 24),
                    if (!isDesktop) const SizedBox(height: 24),
                    Expanded(
                      flex: isDesktop ? 1 : 0,
                      child: AttendanceRateIndicator(rate: _overallRate),
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: 40),

            // Quick actions
            _buildSectionHeader('Actions rapides', Icons.bolt_rounded, isDark),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                _buildActionChip(
                  icon: Icons.person_add_rounded,
                  label: 'Nouveau Formateur',
                  color: const Color(0xFF667EEA),
                  isDark: isDark,
                  onTap: () => context.go('/teachers'),
                ),
                _buildActionChip(
                  icon: Icons.person_add_alt_1_rounded,
                  label: 'Nouveau Stagiaire',
                  color: const Color(0xFFF5576C),
                  isDark: isDark,
                  onTap: () => context.go('/students'),
                ),
                _buildActionChip(
                  icon: Icons.add_box_rounded,
                  label: 'Nouvelle Classe',
                  color: const Color(0xFF4FACFE),
                  isDark: isDark,
                  onTap: () => context.go('/classes'),
                ),
                _buildActionChip(
                  icon: Icons.event_note_rounded,
                  label: 'Voir les Séances',
                  color: const Color(0xFF43E97B),
                  isDark: isDark,
                  onTap: () => context.go('/sessions'),
                ),
              ],
            ),

            const SizedBox(height: 40),

            // Recent sessions
            _buildSectionHeader('Séances récentes', Icons.history_rounded, isDark),
            const SizedBox(height: 16),
            _buildRecentSessionsList(isDark),
          ]
              .animate(interval: 100.ms)
              .fade(duration: 600.ms, curve: AppCurves.entrance)
              .slideY(begin: 0.1, duration: 600.ms, curve: AppCurves.entrance)
              .scale(begin: const Offset(0.95, 0.95), duration: 600.ms, curve: AppCurves.entrance),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme, bool isDark) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Bonjour'
        : hour < 18
            ? 'Bon après-midi'
            : 'Bonsoir';

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  '$greeting 👋',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Tableau de Bord',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppTheme.textDark,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGreen,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryGreen.withAlpha(80),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'Vue d\'ensemble — INSFP',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
                  ),
                ),
              ],
            ),
          ],
        ),
        // Refresh button
        MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTap: _loadDashboard,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0xFF1A2040)
                    : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF2A3250)
                      : const Color(0xFFE0E6F0),
                ),
                boxShadow: [
                  BoxShadow(
                    color: isDark
                        ? Colors.black.withAlpha(30)
                        : Colors.black.withAlpha(5),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                Icons.refresh_rounded,
                color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
                size: 22,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGlassStatCard({
    required IconData icon,
    required String label,
    required String value,
    required List<Color> gradient,
    required bool isDark,
    required double width,
    VoidCallback? onTap,
  }) {
    return MouseRegion(
      cursor: onTap != null ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: width.clamp(0, 280),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isDark
                  ? [
                      gradient[0].withAlpha(20),
                      gradient[1].withAlpha(10),
                    ]
                  : [
                      Colors.white.withAlpha(230),
                      Colors.white.withAlpha(200),
                    ],
            ),
            border: Border.all(
              color: isDark
                  ? gradient[0].withAlpha(40)
                  : gradient[0].withAlpha(30),
            ),
            boxShadow: [
              BoxShadow(
                color: gradient[0].withAlpha(isDark ? 15 : 20),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon with gradient background
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: gradient),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: gradient[0].withAlpha(40),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 24),
              ),
              const SizedBox(height: 20),
              // Value
              Text(
                value,
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppTheme.textDark,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 4),
              // Label
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, bool isDark) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primaryPurple.withAlpha(15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppTheme.primaryPurple, size: 20),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppTheme.textDark,
          ),
        ),
      ],
    );
  }

  Widget _buildActionChip({
    required IconData icon,
    required String label,
    required Color color,
    required bool isDark,
    VoidCallback? onTap,
  }) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          decoration: BoxDecoration(
            color: isDark ? color.withAlpha(15) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withAlpha(isDark ? 40 : 30)),
            boxShadow: isDark
                ? []
                : [
                    BoxShadow(
                      color: color.withAlpha(10),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(width: 12),
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentSessionsList(bool isDark) {
    if (_recentSessions.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF111730) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
          ),
        ),
        child: Column(
          children: [
            Icon(
              Icons.event_busy_rounded,
              size: 56,
              color: isDark ? const Color(0xFF2A3250) : const Color(0xFFCCCCCC),
            ),
            const SizedBox(height: 16),
            Text(
              'Aucune séance enregistrée',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Les séances créées par les formateurs apparaîtront ici.',
              style: TextStyle(
                fontSize: 13,
                color: isDark
                    ? AppTheme.textLightMuted.withAlpha(150)
                    : AppTheme.textDarkMuted.withAlpha(150),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111730) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withAlpha(30)
                : Colors.black.withAlpha(5),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: _recentSessions.asMap().entries.map((entry) {
          final index = entry.key;
          final session = entry.value;

          final shortMonths = [
            'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
            'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
          ];
          final dateStr =
              '${session.date.day} ${shortMonths[session.date.month - 1]} ${session.date.year}';

          return Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  children: [
                    // Date badge
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            session.date.day.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
                            ),
                          ),
                          Text(
                            shortMonths[session.date.month - 1],
                            style: TextStyle(
                              color: Colors.white.withAlpha(200),
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Session info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${session.classGroup?.name ?? "—"} — ${session.module ?? "—"}',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: isDark ? Colors.white : AppTheme.textDark,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${session.formateur?.fullName ?? "—"} • $dateStr',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark
                                  ? AppTheme.textLightMuted
                                  : AppTheme.textDarkMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Slot badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryPurple.withAlpha(15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: AppTheme.primaryPurple.withAlpha(30),
                        ),
                      ),
                      child: Text(
                        session.slot
                            .replaceAll('SLOT_', '')
                            .replaceAll('_', ':'),
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.primaryPurple,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (index < _recentSessions.length - 1)
                Divider(
                  height: 1,
                  indent: 88,
                  color: isDark
                      ? const Color(0xFF1E2640)
                      : const Color(0xFFF0F3FF),
                ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
