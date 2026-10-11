import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/settings_provider.dart';
import '../theme/app_theme.dart';
import '../l10n/app_localizations.dart';
import '../widgets/glass_card.dart';
import '../widgets/premium_button.dart';
import 'package:flutter_animate/flutter_animate.dart';

class SettingsDialog extends StatefulWidget {
  const SettingsDialog({super.key});

  @override
  State<SettingsDialog> createState() => _SettingsDialogState();
}

class _SettingsDialogState extends State<SettingsDialog> {
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

  Future<void> _changePassword() async {
    final newPass = _newPasswordController.text.trim();
    final confirmPass = _confirmPasswordController.text.trim();

    if (newPass.isEmpty || confirmPass.isEmpty) {
      _showSnack(
        AppLocalizations.of(context).get('fill_fields'),
        isError: true,
      );
      return;
    }
    if (newPass.length < 6) {
      _showSnack(
        AppLocalizations.of(context).get('password_length'),
        isError: true,
      );
      return;
    }
    if (newPass != confirmPass) {
      _showSnack(
        AppLocalizations.of(context).get('password_mismatch'),
        isError: true,
      );
      return;
    }

    setState(() => _passwordLoading = true);
    try {
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(password: newPass),
      );
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      if (!mounted) return;
      _showSnack(AppLocalizations.of(context).get('password_success'));
    } catch (e) {
      if (!mounted) return;
      _showSnack(
        AppLocalizations.of(context).get('error') + e.toString(),
        isError: true,
      );
    } finally {
      if (mounted) setState(() => _passwordLoading = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final isAuthenticated = Supabase.instance.client.auth.currentUser != null;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),

      elevation: 0,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 450, maxHeight: 650),
        child: GlassCard(
          blur: 15,
          padding: const EdgeInsets.all(0),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children:
                  [
                        Row(
                          children: [
                            Icon(
                              Icons.settings,
                              color: isDark ? Colors.white : Colors.black,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              l10n.get('settings'),
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        _buildThemeSelector(context),
                        const Divider(height: 32),
                        _buildLanguageSelector(context),

                        if (isAuthenticated) ...[
                          const Divider(height: 32),
                          _buildPasswordChange(context),
                          const Divider(height: 32),
                          _buildDisconnect(context),
                        ],

                        const SizedBox(height: 32),
                        PremiumButton(
                          text: l10n.get('close'),
                          onPressed: () => Navigator.pop(context),
                          color: AppTheme.primaryPurple,
                          icon: Icons.close_rounded,
                        ),
                      ]
                      .animate(interval: 30.ms)
                      .fade(duration: 700.ms)
                      .slideY(
                        begin: 0.1,
                        duration: 700.ms,
                        curve: AppCurves.entrance,
                      ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordChange(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.get('change_password'),
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _newPasswordController,
          obscureText: _obscureNew,
          decoration: InputDecoration(
            labelText: l10n.get('new_password'),
            prefixIcon: const Icon(Icons.lock_outline, size: 20),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureNew ? Icons.visibility_off : Icons.visibility,
                size: 20,
              ),
              onPressed: () => setState(() => _obscureNew = !_obscureNew),
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            isDense: true,
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmPasswordController,
          obscureText: _obscureConfirm,
          decoration: InputDecoration(
            labelText: l10n.get('confirm_password'),
            prefixIcon: const Icon(Icons.lock_outline, size: 20),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                size: 20,
              ),
              onPressed: () =>
                  setState(() => _obscureConfirm = !_obscureConfirm),
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            isDense: true,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _passwordLoading ? null : _changePassword,
            icon: _passwordLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(),
                  )
                : const Icon(Icons.save_rounded, size: 18),
            label: Text(l10n.get('modify')),
            style: ElevatedButton.styleFrom(
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDisconnect(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: PremiumButton(
        text: AppLocalizations.of(context).get('disconnect'),
        color: AppTheme.dangerRed,
        icon: Icons.logout_rounded,
        onPressed: () async {
          await Supabase.instance.client.auth.signOut();
          if (context.mounted) {
            Navigator.pop(context);
          }
        },
      ),
    );
  }

  Widget _buildThemeSelector(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final settings = context.watch<SettingsProvider>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.get('theme'),
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _buildChoiceChip(
              context,
              label: l10n.get('system'),
              icon: Icons.brightness_auto,
              isSelected: settings.themeMode == ThemeMode.system,
              onSelected: () => settings.setThemeMode(ThemeMode.system),
            ),
            _buildChoiceChip(
              context,
              label: l10n.get('light'),
              icon: Icons.light_mode,
              isSelected: settings.themeMode == ThemeMode.light,
              onSelected: () => settings.setThemeMode(ThemeMode.light),
            ),
            _buildChoiceChip(
              context,
              label: l10n.get('dark'),
              icon: Icons.dark_mode,
              isSelected: settings.themeMode == ThemeMode.dark,
              onSelected: () => settings.setThemeMode(ThemeMode.dark),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLanguageSelector(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final settings = context.watch<SettingsProvider>();

    final currentLangCode =
        settings.locale?.languageCode ??
        Localizations.localeOf(context).languageCode;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.get('language'),
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _buildChoiceChip(
              context,
              label: 'العربية',
              icon: Icons.language,
              isSelected: currentLangCode == 'ar',
              onSelected: () => settings.setLocale(const Locale('ar', '')),
            ),
            _buildChoiceChip(
              context,
              label: 'Français',
              icon: Icons.language,
              isSelected: currentLangCode == 'fr',
              onSelected: () => settings.setLocale(const Locale('fr', '')),
            ),
            _buildChoiceChip(
              context,
              label: 'English',
              icon: Icons.language,
              isSelected: currentLangCode == 'en',
              onSelected: () => settings.setLocale(const Locale('en', '')),
            ),
            _buildChoiceChip(
              context,
              label: l10n.get('system_default'),
              icon: Icons.phone_android,
              isSelected: settings.locale == null,
              onSelected: () => settings.clearLocale(),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildChoiceChip(
    BuildContext context, {
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onSelected,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final activeColor = isDark ? Colors.blue[300]! : AppTheme.primaryPurple;
    final inactiveColor = isDark
        ? const Color(0xFF333333)
        : const Color(0xFFE0E0E0);
    final textColor = isDark ? Colors.white : Colors.black;

    return InkWell(
      onTap: onSelected,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withAlpha(25) : theme.cardTheme.color,
          border: Border.all(
            color: isSelected ? activeColor : inactiveColor,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? activeColor : textColor.withAlpha(150),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? activeColor : textColor,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
