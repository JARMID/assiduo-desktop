import 'package:flutter/material.dart';

import 'package:provider/provider.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:go_router/go_router.dart';

import 'package:flutter_animate/flutter_animate.dart';

import '../../../core/providers/settings_provider.dart';

import '../../../core/theme/app_theme.dart';

import '../../../core/widgets/glass_card.dart';

import '../../../core/widgets/premium_button.dart';

import '../../auth/domain/auth_controller.dart';

import 'package:admin_portal/core/l10n/app_localizations.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _newPasswordController = TextEditingController();

  final _confirmPasswordController = TextEditingController();

  bool _passwordLoading = false;

  bool _obscureNew = true;

  bool _obscureConfirm = true;

  @override
  void dispose() {
    _newPasswordController.dispose();

    _confirmPasswordController.dispose();

    super.dispose();
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), behavior: SnackBarBehavior.floating),
    );
  }

  Future<void> _changePassword() async {
    final newPass = _newPasswordController.text.trim();

    final confirmPass = _confirmPasswordController.text.trim();

    if (newPass.isEmpty || confirmPass.isEmpty) {
      _showSnack('Veuillez remplir tous les champs', isError: true);

      return;
    }

    if (newPass.length < 6) {
      _showSnack(
        'Le mot de passe doit contenir au moins 6 caractères',

        isError: true,
      );

      return;
    }

    if (newPass != confirmPass) {
      _showSnack('Les mots de passe ne correspondent pas', isError: true);

      return;
    }

    setState(() => _passwordLoading = true);

    try {
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(password: newPass),
      );

      _newPasswordController.clear();

      _confirmPasswordController.clear();

      _showSnack('Mot de passe mis à jour avec succès');
    } catch (e) {
      _showSnack('Erreur lors de la mise à jour: $e', isError: true);
    } finally {
      if (mounted) setState(() => _passwordLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();

    final authCtrl = context.read<AuthController>();

    final theme = Theme.of(context);

    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      // Inherits from dashboard wrapper
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),

          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,

              children: [
                // Header
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,

                        children: [
                          Text(
                            'Paramètres',

                            style: TextStyle(
                              fontSize: 28,

                              fontWeight: FontWeight.w800,

                              color: isDark ? Colors.white : AppTheme.textDark,

                              letterSpacing: -0.5,
                            ),
                          ),

                          const SizedBox(height: 4),

                          Text(
                            'Gérez vos préférences et votre compte',

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
                  ],
                ).animate().fade().slideY(begin: -0.1),

                const SizedBox(height: 32),

                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 100,

                        height: 100,

                        decoration: BoxDecoration(
                          color: AppTheme.primaryPurple.withAlpha(25),

                          shape: BoxShape.circle,

                          border: Border.all(
                            color: AppTheme.primaryPurple.withAlpha(70),

                            width: 2,
                          ),
                        ),

                        child: const Center(
                          child: Icon(
                            Icons.admin_panel_settings,

                            size: 50,

                            color: AppTheme.primaryPurple,
                          ),
                        ),
                      ).animate().scale(
                        duration: 700.ms,

                        curve: Curves.easeOutBack,
                      ),

                      const SizedBox(height: 16),

                      Text(
                        'Administrateur',

                        style: TextStyle(
                          fontSize: 22,

                          fontWeight: FontWeight.bold,

                          color: isDark ? Colors.white : AppTheme.textDark,
                        ),
                      ),

                      const SizedBox(height: 4),

                      Text(
                        'Compte système',

                        style: TextStyle(
                          fontSize: 16,

                          color: isDark
                              ? AppTheme.textLightMuted
                              : AppTheme.textDarkMuted,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),

                _buildSectionTitle(
                  'Apparence & Langue',

                  Icons.palette_rounded,

                  isDark,
                ),

                const SizedBox(height: 16),

                GlassCard(
                  blur: 10,

                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,

                    vertical: 16,
                  ),

                  child: Column(
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.dark_mode_rounded,

                            color: isDark
                                ? Colors.white70
                                : AppTheme.textDarkMuted,

                            size: 20,
                          ),

                          const SizedBox(width: 12),

                          Expanded(
                            child: Text(
                              AppLocalizations.of(context).get('theme'),
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                          ),

                          DropdownButtonHideUnderline(
                            child: DropdownButton<ThemeMode>(
                              value: settings.themeMode,
                              dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                              icon: Icon(Icons.arrow_drop_down, color: isDark ? Colors.white : Colors.black),
                              style: TextStyle(color: isDark ? Colors.white : AppTheme.textDark, fontSize: 14, fontWeight: FontWeight.w600),
                              items: [
                                DropdownMenuItem(value: ThemeMode.system, child: Text(AppLocalizations.of(context).get('system_default'))),
                                DropdownMenuItem(value: ThemeMode.light, child: Text(AppLocalizations.of(context).get('light'))),
                                DropdownMenuItem(value: ThemeMode.dark, child: Text(AppLocalizations.of(context).get('dark'))),
                              ],
                              onChanged: (v) { if (v != null) settings.setThemeMode(v); },
                            ),
                          ),
                        ],
                      ),

                      Divider(
                        color: isDark ? Colors.white10 : Colors.black12,

                        height: 24,
                      ),

                      Row(
                        children: [
                          Icon(
                            Icons.language_rounded,

                            color: isDark
                                ? Colors.white70
                                : AppTheme.textDarkMuted,

                            size: 20,
                          ),

                          const SizedBox(width: 12),

                          Expanded(
                            child: Text(
                              AppLocalizations.of(context).get('language'),
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                          ),

                          DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: settings.locale?.languageCode ?? 'fr',

                              dropdownColor: isDark
                                  ? const Color(0xFF1E293B)
                                  : Colors.white,

                              icon: Icon(
                                Icons.arrow_drop_down,

                                color: isDark ? Colors.white : Colors.black,
                              ),

                              style: TextStyle(
                                color: isDark
                                    ? Colors.white
                                    : AppTheme.textDark,

                                fontSize: 14,

                                fontWeight: FontWeight.w600,
                              ),

                              items: const [
                                DropdownMenuItem(
                                  value: 'fr',
                                  child: Text('Français'),
                                ),
                                DropdownMenuItem(
                                  value: 'ar',
                                  child: Text('🇩🇿 العربية'),
                                ),
                                DropdownMenuItem(
                                  value: 'en',
                                  child: Text('English'),
                                ),
                              ],

                              onChanged: (lang) {
                                if (lang != null) {
                                  settings.setLocale(Locale(lang));
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                _buildSectionTitle('Sécurité', Icons.security_rounded, isDark),

                const SizedBox(height: 16),

                GlassCard(
                  blur: 10,

                  padding: const EdgeInsets.all(24),

                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,

                    children: [
                      const Text(
                        'Changer de mot de passe',

                        style: TextStyle(
                          fontWeight: FontWeight.bold,

                          fontSize: 16,
                        ),
                      ),

                      const SizedBox(height: 16),

                      _buildTextField(
                        controller: _newPasswordController,

                        label: 'Nouveau mot de passe',

                        icon: Icons.lock_outline_rounded,

                        isDark: isDark,

                        isPassword: true,

                        obscureText: _obscureNew,

                        onToggleObscure: () =>
                            setState(() => _obscureNew = !_obscureNew),
                      ),

                      const SizedBox(height: 16),

                      _buildTextField(
                        controller: _confirmPasswordController,

                        label: 'Confirmer le mot de passe',

                        icon: Icons.lock_reset_rounded,

                        isDark: isDark,

                        isPassword: true,

                        obscureText: _obscureConfirm,

                        onToggleObscure: () =>
                            setState(() => _obscureConfirm = !_obscureConfirm),
                      ),

                      const SizedBox(height: 24),

                      SizedBox(
                        width: double.infinity,

                        child: PremiumButton(
                          text: 'Mettre à jour le mot de passe',

                          isLoading: _passwordLoading,

                          onPressed: _changePassword,

                          color: AppTheme.primaryPurple,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                InkWell(
                  onTap: () async {
                    await authCtrl.signOut();

                    if (context.mounted) {
                      context.go('/login');
                    }
                  },

                  borderRadius: BorderRadius.circular(16),

                  child: Container(
                    width: double.infinity,

                    padding: const EdgeInsets.symmetric(vertical: 16),

                    decoration: BoxDecoration(
                      color: AppTheme.dangerRed.withAlpha(20),

                      borderRadius: BorderRadius.circular(16),

                      border: Border.all(
                        color: AppTheme.dangerRed.withAlpha(80),

                        width: 1.5,
                      ),
                    ),

                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,

                      children: [
                        Icon(
                          Icons.logout_rounded,

                          color: isDark
                              ? const Color(0xFFFCA5A5)
                              : AppTheme.dangerRed,
                        ),

                        const SizedBox(width: 12),

                        Text(
                          'Déconnexion',

                          style: TextStyle(
                            color: isDark
                                ? const Color(0xFFFCA5A5)
                                : AppTheme.dangerRed,

                            fontSize: 16,

                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon, bool isDark) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryPurple, size: 20),

        const SizedBox(width: 8),

        Text(
          title,

          style: TextStyle(
            fontSize: 18,

            fontWeight: FontWeight.bold,

            color: isDark ? Colors.white : AppTheme.textDark,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,

    required String label,

    required IconData icon,

    required bool isDark,

    bool isPassword = false,

    bool obscureText = false,

    VoidCallback? onToggleObscure,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1524) : Colors.white,

        borderRadius: BorderRadius.circular(14),

        border: Border.all(
          color: isDark ? const Color(0xFF2A3352) : const Color(0xFFE2E8F0),
        ),
      ),

      child: TextField(
        controller: controller,

        obscureText: obscureText,

        style: TextStyle(color: isDark ? Colors.white : AppTheme.textDark),

        decoration: InputDecoration(
          hintText: label,

          hintStyle: TextStyle(
            color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
          ),

          prefixIcon: Icon(icon, color: AppTheme.primaryPurple, size: 20),

          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(
                    obscureText
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,

                    color: isDark
                        ? AppTheme.textLightMuted
                        : AppTheme.textDarkMuted,

                    size: 20,
                  ),

                  onPressed: onToggleObscure,
                )
              : null,

          border: InputBorder.none,

          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,

            vertical: 14,
          ),
        ),
      ),
    );
  }
}
