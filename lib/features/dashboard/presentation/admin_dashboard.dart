import 'package:flutter/material.dart';
import 'package:admin_portal/core/providers/settings_provider.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../auth/domain/auth_controller.dart';
import '../../../../core/theme/app_theme.dart';

class AdminDashboard extends StatefulWidget {
  final Widget child;
  const AdminDashboard({super.key, required this.child});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _selectedIndex = 0;
  bool? _isExpandedManual;

  bool get _isExpanded {
    if (_isExpandedManual != null) return _isExpandedManual!;
    // Default: Expanded on large desktop, collapsed on tablet
    final size = MediaQuery.of(context).size;
    return size.width >= 1024;
  }

  int _indexFromRoute(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/teachers')) return 1;
    if (location.startsWith('/students')) return 2;
    if (location.startsWith('/classes')) return 3;
    if (location.startsWith('/specialities')) return 4;
    if (location.startsWith('/sessions')) return 5;
    if (location.startsWith('/reports')) return 6;
    if (location.startsWith('/justifications')) return 7;
    if (location.startsWith('/alerts')) return 8;
    if (location.startsWith('/notifications')) return 9;
    if (location.startsWith('/messages')) return 10;
    return 0;
  }

  static const _navItems = [
    _NavItem(Icons.dashboard_outlined, Icons.dashboard, 'Vue Globale', '/'),
    _NavItem(Icons.badge_outlined, Icons.badge, 'Formateurs', '/teachers'),
    _NavItem(Icons.school_outlined, Icons.school, 'Stagiaires', '/students'),
    _NavItem(Icons.class_outlined, Icons.class_, 'Classes', '/classes'),
    _NavItem(
      Icons.category_outlined,
      Icons.category,
      'Spécialités',
      '/specialities',
    ),
    _NavItem(
      Icons.menu_book_outlined,
      Icons.menu_book_rounded,
      'Modules',
      '/modules',
    ),
    _NavItem(
      Icons.event_note_outlined,
      Icons.event_note,
      'Séances',
      '/sessions',
    ),
    _NavItem(
      Icons.assessment_outlined,
      Icons.assessment,
      'Rapports',
      '/reports',
    ),
    _NavItem(
      Icons.document_scanner_outlined,
      Icons.document_scanner,
      'Justifications',
      '/justifications',
    ),
    _NavItem(Icons.warning_amber_outlined, Icons.warning, 'Alertes', '/alerts'),
    _NavItem(
      Icons.notifications_none_outlined,
      Icons.notifications,
      'Notifications',
      '/notifications',
    ),
    _NavItem(Icons.message_outlined, Icons.message_rounded, 'Messages', '/messages'),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    _selectedIndex = _indexFromRoute(context);
    final isWide = MediaQuery.of(context).size.width >= 800;

    // For mobile, always treat as expanded for the drawer items
    final bool expanded = !isWide || _isExpanded;

    if (!isWide) {
      return Scaffold(
        drawer: Drawer(
          child: Column(
            children: [
              DrawerHeader(
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isDark
                          ? AppTheme.primaryPurple.withAlpha(30)
                          : const Color(0xFFE8EDFF),
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: const LinearGradient(
                          colors: [AppTheme.primaryPurple, Color(0xFF6C5CE7)],
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.asset(
                          'assets/images/logo.jpg',
                          fit: BoxFit.contain,
                          errorBuilder: (_, _, _) =>
                              const Icon(Icons.school, color: Colors.white),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Présence INSFP',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: isDark ? Colors.white : AppTheme.textDark,
                            ),
                          ),
                          Text(
                            'Administration',
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
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  itemCount: _navItems.length,
                  itemBuilder: (context, index) {
                    final item = _navItems[index];
                    final isSelected = _selectedIndex == index;
                    return _buildNavItem(item, isSelected, index, isDark, true);
                  },
                ),
              ),
              _buildBottomActions(isDark, true),
            ],
          ),
        ),
        body: Stack(
          children: [
            widget.child,
            Positioned(
              top: 16,
              right: 16,
              child: Consumer<SettingsProvider>(
                builder: (context, settings, _) {
                  final isDark = Theme.of(context).brightness == Brightness.dark;
                  return SafeArea(
                    child: Container(
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black26 : Colors.white54,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
                        color: isDark ? Colors.yellow : Colors.blueGrey,
                        onPressed: () {
                          settings.setThemeMode(isDark ? ThemeMode.light : ThemeMode.dark);
                        },
                      ),
                    ),
                  );
                }
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          // Premium Glassmorphic Sidebar
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutCubic,
            width: _isExpanded ? 240 : 76,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDark
                      ? [const Color(0xFF111730), const Color(0xFF0D1025)]
                      : [Colors.white, const Color(0xFFF8FAFF)],
                ),
                border: Border(
                  right: BorderSide(
                    color: isDark
                        ? AppTheme.primaryPurple.withAlpha(30)
                        : const Color(0xFFE8EDFF),
                  ),
                ),
                boxShadow: [
                  BoxShadow(
                    color: isDark
                        ? Colors.black.withAlpha(50)
                        : AppTheme.primaryPurple.withAlpha(8),
                    blurRadius: 20,
                    offset: const Offset(4, 0),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Logo Header
                  _buildSidebarHeader(isDark),

                  const SizedBox(height: 8),

                  // Navigation Items
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      children: _navItems.asMap().entries.map((entry) {
                        final index = entry.key;
                        final item = entry.value;
                        final isSelected = _selectedIndex == index;
                        return _buildNavItem(
                          item,
                          isSelected,
                          index,
                          isDark,
                          expanded,
                        );
                      }).toList(),
                    ),
                  ),

                  // Bottom actions
                  _buildBottomActions(isDark, expanded),
                ],
              ),
            ),
          ),

          // Main Content Area
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(24),
                bottomLeft: Radius.circular(24),
              ),
              child: Stack(
                children: [
                  widget.child,
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Consumer<SettingsProvider>(
                      builder: (context, settings, _) {
                        final isDark = Theme.of(context).brightness == Brightness.dark;
                        return Container(
                          decoration: BoxDecoration(
                            color: isDark ? Colors.black26 : Colors.white54,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
                            color: isDark ? Colors.yellow : Colors.blueGrey,
                            onPressed: () {
                              settings.setThemeMode(isDark ? ThemeMode.light : ThemeMode.dark);
                            },
                          ),
                        );
                      }
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarHeader(bool isDark) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: _isExpanded ? 20 : 14,
        vertical: 20,
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        child: SizedBox(
          width: _isExpanded ? 200 : 44,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo (Clickable to expand when collapsed)
              MouseRegion(
                cursor: _isExpanded
                    ? SystemMouseCursors.basic
                    : SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: () {
                    if (!_isExpanded) setState(() => _isExpandedManual = true);
                  },
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppTheme.primaryPurple, Color(0xFF6C5CE7)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryPurple.withAlpha(50),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.asset(
                        'assets/images/logo.jpg',
                        fit: BoxFit.contain,
                        errorBuilder: (_, _, _) => const Icon(
                          Icons.school_rounded,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              if (_isExpanded) ...[
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Présence INSFP',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                          color: isDark ? Colors.white : AppTheme.textDark,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Administration',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: isDark
                              ? AppTheme.textLightMuted
                              : AppTheme.textDarkMuted,
                        ),
                      ),
                    ],
                  ),
                ),

                // Collapse button
                MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: GestureDetector(
                    onTap: () => setState(() => _isExpandedManual = false),
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF1E2640)
                            : const Color(0xFFF0F3FF),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.chevron_left_rounded,
                        size: 18,
                        color: isDark
                            ? AppTheme.textLightMuted
                            : AppTheme.textDarkMuted,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    _NavItem item,
    bool isSelected,
    int index,
    bool isDark,
    bool expanded,
  ) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedIndex = index);
          if (MediaQuery.of(context).size.width < 800) {
            Navigator.of(context).pop();
          }
          context.go(item.route);
        },
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(
              horizontal: expanded ? 14 : 0,
              vertical: 12,
            ),
            decoration: BoxDecoration(
              color: isSelected
                  ? (isDark
                        ? AppTheme.primaryPurple.withAlpha(25)
                        : AppTheme.primaryPurple.withAlpha(12))
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(14),
              border: isSelected
                  ? Border.all(color: AppTheme.primaryPurple.withAlpha(40))
                  : null,
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const NeverScrollableScrollPhysics(),
              child: SizedBox(
                width: expanded ? 200 : 36,
                child: Row(
                  mainAxisAlignment: expanded
                      ? MainAxisAlignment.start
                      : MainAxisAlignment.center,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryPurple.withAlpha(isDark ? 35 : 25)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        isSelected ? item.selectedIcon : item.icon,
                        size: 20,
                        color: isSelected
                            ? AppTheme.primaryPurple
                            : (isDark
                                  ? AppTheme.textLightMuted
                                  : AppTheme.textDarkMuted),
                      ),
                    ),
                    if (expanded) ...[
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected
                                ? FontWeight.w700
                                : FontWeight.w500,
                            color: isSelected
                                ? AppTheme.primaryPurple
                                : (isDark
                                      ? AppTheme.textLightMuted
                                      : AppTheme.textDarkMuted),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (isSelected)
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryPurple,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryPurple.withAlpha(60),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                        ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomActions(bool isDark, bool expanded) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: expanded ? 16 : 12,
        vertical: 16,
      ),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
          ),
        ),
      ),
      child: Column(
        children: [
          // Settings button
          _buildBottomButton(
            icon: Icons.settings_outlined,
            label: 'Paramètres',
            isDark: isDark,
            expanded: expanded,
            onTap: () {
              if (MediaQuery.of(context).size.width < 800) {
                Navigator.of(context).pop();
              }
              context.go('/settings');
            },
          ),
          const SizedBox(height: 8),
          // Logout button
          _buildBottomButton(
            icon: Icons.logout_rounded,
            label: 'Déconnexion',
            isDark: isDark,
            color: AppTheme.dangerRed,
            expanded: expanded,
            onTap: () {
              if (MediaQuery.of(context).size.width < 800) {
                Navigator.of(context).pop();
              }
              context.read<AuthController>().signOut();
              context.go('/login');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBottomButton({
    required IconData icon,
    required String label,
    required bool isDark,
    required bool expanded,
    Color? color,
    required VoidCallback onTap,
  }) {
    final c =
        color ?? (isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted);
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: expanded ? 12 : 0,
            vertical: 10,
          ),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const NeverScrollableScrollPhysics(),
            child: SizedBox(
              width: expanded ? 200 : 36,
              child: Row(
                mainAxisAlignment: expanded
                    ? MainAxisAlignment.start
                    : MainAxisAlignment.center,
                children: [
                  Icon(icon, size: 20, color: c),
                  if (expanded) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        label,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: c,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final String route;

  const _NavItem(this.icon, this.selectedIcon, this.label, this.route);
}
