import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/services/data_repository.dart';
import '../../../core/theme/app_theme.dart';
import 'package:admin_portal/core/l10n/app_localizations.dart';

class AdminNotificationsScreen extends StatefulWidget {
  const AdminNotificationsScreen({super.key});

  @override
  State<AdminNotificationsScreen> createState() =>
      _AdminNotificationsScreenState();
}

class _AdminNotificationsScreenState extends State<AdminNotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      final repo = context.read<DataRepository>();
      final data = await repo.getNotifications();
      if (!mounted) return;
      setState(() {
        _notifications = data;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handlePasswordReset(Map<String, dynamic> notification) async {
    final matricule = notification['data']?['matricule'] as String?;
    if (matricule == null) return;

    final repo = context.read<DataRepository>();
    final newPasswordController = TextEditingController(
      text: 'INSFP-$matricule',
    );

    final doReset = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(AppLocalizations.of(context).get('r_initialiser_le_mot')),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Stagiaire Matricule: $matricule'),
              const SizedBox(height: 16),
              TextField(
                controller: newPasswordController,
                decoration: const InputDecoration(
                  labelText: 'Nouveau mot de passe',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text(AppLocalizations.of(context).get('annuler')),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(),
              child: const Text(
                'Réinitialiser',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        );
      },
    );

    if (doReset == true && mounted) {
      setState(() => _isLoading = true);
      try {
        final student = await repo.findStudentByMatricule(matricule);
        if (student == null || student.authId == null) {
          throw Exception(
            'Stagiaire non trouvé ou aucun compte de connexion associé.',
          );
        }

        await repo.resetStudentPassword(
          student.authId!,
          newPasswordController.text,
        );
        await repo.markNotificationRead(notification['id']);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                AppLocalizations.of(context).get('mot_de_passe_r_initi'),
              ),
            ),
          );
        }
        _loadNotifications();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
          );
          setState(() => _isLoading = false);
        }
      }
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      await context.read<DataRepository>().markNotificationRead(id);
      _loadNotifications();
    } catch (e) {
      // Ignore
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
      child: Padding(
        padding: EdgeInsets.all(
          MediaQuery.of(context).size.width > 600 ? 32.0 : 16.0,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Premium Header
            Row(
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
                  child: const Icon(
                    Icons.notifications_rounded,
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
                        'Notifications & Alertes',
                        style: TextStyle(
                          fontSize: MediaQuery.of(context).size.width > 600
                              ? 28
                              : 22,
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : AppTheme.textDark,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Alertes système et demandes des stagiaires',
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark
                              ? AppTheme.textLightMuted
                              : AppTheme.textDarkMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: Icon(
                    Icons.refresh,
                    color: isDark ? Colors.white : AppTheme.primaryPurple,
                  ),
                  onPressed: () {
                    setState(() => _isLoading = true);
                    _loadNotifications();
                  },
                ),
              ],
            ).animate().fade(duration: 700.ms).slideY(begin: -0.1),
            const SizedBox(height: 24),

            // List
            Expanded(
              child: _isLoading
                  ? const SizedBox.shrink()
                  : _notifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.notifications_off_rounded,
                            size: 64,
                            color: isDark ? Colors.white24 : Colors.black26,
                          ).animate().scale(
                            duration: 300.ms,
                            curve: AppCurves.spring,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Aucune notification',
                            style: TextStyle(
                              fontSize: 18,
                              color: isDark ? Colors.white54 : Colors.black54,
                            ),
                          ).animate().fade(delay: 100.ms),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: _notifications.length,
                      itemBuilder: (context, index) {
                        final notif = _notifications[index];
                        final isRead = notif['is_read'] as bool? ?? false;
                        final isPasswordReset =
                            notif['type'] == 'PASSWORD_RESET';

                        return Card(
                          elevation: isRead ? 0 : 2,
                          color: isRead
                              ? (isDark
                                    ? const Color(0xFF141938)
                                    : Colors.white)
                              : (isDark
                                    ? const Color(0xFF1E2640)
                                    : const Color(0xFFE8F0FE)),
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(
                              color: isDark
                                  ? const Color(0xFF2A3352)
                                  : const Color(0xFFE8EDFF),
                            ),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            leading: CircleAvatar(
                              child: Icon(
                                isPasswordReset
                                    ? Icons.lock_reset_rounded
                                    : Icons.info_outline_rounded,
                                color: isPasswordReset
                                    ? Colors.orange
                                    : AppTheme.primaryPurple,
                              ),
                            ),
                            title: Text(
                              notif['title'] ?? 'Notification',
                              style: TextStyle(
                                fontWeight: isRead
                                    ? FontWeight.normal
                                    : FontWeight.bold,
                                color: isDark
                                    ? Colors.white
                                    : AppTheme.textDark,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text(
                                  notif['body'] ?? '',
                                  style: TextStyle(
                                    color: isDark
                                        ? AppTheme.textLightMuted
                                        : AppTheme.textDarkMuted,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  DateTime.parse(
                                    notif['created_at'],
                                  ).toLocal().toString().substring(0, 16),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isDark
                                        ? Colors.white38
                                        : Colors.black38,
                                  ),
                                ),
                              ],
                            ),
                            trailing: isPasswordReset && !isRead
                                ? ElevatedButton(
                                    onPressed: () =>
                                        _handlePasswordReset(notif),
                                    style: ElevatedButton.styleFrom(
                                      foregroundColor: Colors.white,
                                    ),
                                    child: Text(
                                      AppLocalizations.of(
                                        context,
                                      ).get('r_initialiser'),
                                    ),
                                  )
                                : !isRead
                                ? IconButton(
                                    icon: const Icon(
                                      Icons.check_circle_outline,
                                      color: Colors.green,
                                    ),
                                    tooltip: 'Marquer comme lu',
                                    onPressed: () => _markAsRead(notif['id']),
                                  )
                                : const Icon(Icons.check, color: Colors.grey),
                          ),
                        ).animate().fade().slideX();
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
