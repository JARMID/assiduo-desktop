import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';

class DownloadAppsDialog extends StatelessWidget {
  const DownloadAppsDialog({super.key});

  final String studentAppUrl =
      'https://afwqtjmwklmoqntnvgww.supabase.co/storage/v1/object/public/apks/student_app.apk';
  final String teacherAppUrl =
      'https://afwqtjmwklmoqntnvgww.supabase.co/storage/v1/object/public/apks/teacher_app.apk';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Dialog(
      elevation: 0,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: GlassCard(
        padding: const EdgeInsets.all(32),
        isFloating: true,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryBlue.withAlpha(25),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.system_update_rounded,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        'Télécharger les Applications',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                    style: IconButton.styleFrom(),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              Text(
                'Scannez les QR Codes ci-dessous avec votre téléphone pour télécharger les applications.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: isDark
                      ? AppTheme.textLightMuted
                      : AppTheme.textDarkMuted,
                ),
              ),
              const SizedBox(height: 32),

              // QR Codes Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildQrAppCard(
                    context: context,
                    title: 'Application Étudiant',
                    icon: Icons.school_rounded,
                    url: studentAppUrl,
                    color: AppTheme.primaryBlue,
                    isDark: isDark,
                  ),
                  _buildQrAppCard(
                    context: context,
                    title: 'Application Enseignant',
                    icon: Icons.person_add_alt_1_rounded,
                    url: teacherAppUrl,
                    color: AppTheme.primaryGreen,
                    isDark: isDark,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQrAppCard({
    required BuildContext context,
    required String title,
    required IconData icon,
    required String url,
    required Color color,
    required bool isDark,
  }) {
    final theme = Theme.of(context);
    return Container(
      width: 220,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withAlpha(5) : Colors.black.withAlpha(5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withAlpha(76), width: 2),
      ),
      child: Column(
        children: [
          Icon(icon, size: 32, color: color),
          const SizedBox(height: 12),
          Text(
            title,
            textAlign: TextAlign.center,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: QrImageView(
              data: url,
              version: QrVersions.auto,
              size: 140,

              eyeStyle: QrEyeStyle(eyeShape: QrEyeShape.square, color: color),
              dataModuleStyle: const QrDataModuleStyle(
                dataModuleShape: QrDataModuleShape.circle,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
