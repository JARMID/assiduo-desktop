import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:video_player/video_player.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/settings_dialog.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../core/widgets/animated_login_background.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/premium_button.dart';
import '../../../core/l10n/app_localizations.dart';
import '../domain/auth_controller.dart';
import 'widgets/download_apps_dialog.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  bool _obscurePassword = true;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  late AnimationController _staggerController;
  late AnimationController _pulseController;

  late Animation<double> _logoScale;
  late Animation<double> _headerFade;
  late Animation<Offset> _headerSlide;
  late Animation<double> _cardFade;
  late Animation<Offset> _cardSlide;
  late Animation<double> _footerFade;

  late VideoPlayerController _videoController;
  bool _isVideoInitialized = false;

  @override
  void initState() {
    super.initState();

    _emailFocus.addListener(_onFocusChange);
    _passwordFocus.addListener(_onFocusChange);

    // Background gradient animation has been moved to AnimatedLoginBackground

    // Staggered entrance animation
    _staggerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    // Pulsing glow for the logo
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _logoScale = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _staggerController,
        curve: const Interval(0.0, 0.35, curve: Curves.elasticOut),
      ),
    );

    _headerFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _staggerController,
        curve: const Interval(0.15, 0.45, curve: Curves.easeOut),
      ),
    );

    _headerSlide = Tween<Offset>(begin: const Offset(0, -0.3), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _staggerController,
            curve: const Interval(0.15, 0.45, curve: AppCurves.entrance),
          ),
        );

    _cardFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _staggerController,
        curve: const Interval(0.35, 0.7, curve: Curves.easeOut),
      ),
    );

    _cardSlide = Tween<Offset>(begin: const Offset(0, 0.15), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _staggerController,
            curve: const Interval(0.35, 0.7, curve: AppCurves.entrance),
          ),
        );

    _footerFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _staggerController,
        curve: const Interval(0.7, 1.0, curve: Curves.easeOut),
      ),
    );

    _videoController = VideoPlayerController.asset(
      'assets/images/logo3dmoving.mp4',
    );
    _videoController
        .initialize()
        .then((_) async {
          if (mounted) {
            setState(() {
              _isVideoInitialized = true;
            });
            await _videoController.setVolume(0.0);
            await _videoController.setLooping(false);
            await _videoController.play();
          }
        })
        .catchError((_) {
          // Gracefully fall back to static image
        });

    _staggerController.forward();
  }

  void _onFocusChange() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _emailFocus.removeListener(_onFocusChange);
    _passwordFocus.removeListener(_onFocusChange);
    _videoController.dispose();
    _staggerController.dispose();
    _pulseController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          // === Animated Background ===
          const Positioned.fill(child: AnimatedLoginBackground()),

          // === Main Content ===
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 28,
                  vertical: 40,
                ),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // === Logo with Pulse Glow ===
                      ScaleTransition(
                        scale: _logoScale,
                        child: AnimatedBuilder(
                          animation: _pulseController,
                          builder: (context, child) {
                            return Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.primaryBlue.withAlpha(
                                      (40 + _pulseController.value * 40)
                                          .toInt(),
                                    ),
                                    blurRadius:
                                        30 + _pulseController.value * 20,
                                    spreadRadius: _pulseController.value * 8,
                                  ),
                                ],
                              ),
                              child: child,
                            );
                          },
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isDark
                                  ? const Color(0xFF1A2340)
                                  : Colors.white,
                              border: Border.all(
                                color: AppTheme.accentGold.withAlpha(120),
                                width: 3,
                              ),
                            ),
                            clipBehavior: Clip.antiAlias,
                            padding: EdgeInsets.zero,
                            child: Transform.scale(
                              scale: 1.15,
                              child: _isVideoInitialized
                                  ? FittedBox(
                                      fit: BoxFit.cover,
                                      child: SizedBox(
                                        width:
                                            _videoController.value.size.width,
                                        height:
                                            _videoController.value.size.height,
                                        child: VideoPlayer(_videoController),
                                      ),
                                    )
                                  : Image.asset(
                                      'assets/images/logo.jpg',
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, e, st) => Icon(
                                        Icons.school_rounded,
                                        size: 50,
                                        color: AppTheme.accentGold,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 28),

                      // === Header Text ===
                      FadeTransition(
                        opacity: _headerFade,
                        child: SlideTransition(
                          position: _headerSlide,
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: AppTheme.accentGold.withAlpha(25),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: AppTheme.accentGold.withAlpha(60),
                                  ),
                                ),
                                child: Text(
                                  l10n.get('republique'),
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    letterSpacing: 0.8,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 9,
                                    color: isDark
                                        ? AppTheme.accentGold
                                        : AppTheme.primaryGreen,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              ShaderMask(
                                shaderCallback: (bounds) => LinearGradient(
                                  colors: [
                                    AppTheme.primaryBlue,
                                    isDark
                                        ? const Color(0xFF6BA3FF)
                                        : AppTheme.primaryGreen,
                                  ],
                                ).createShader(bounds),
                                child: Text(
                                  l10n.get('insfp_audio'),
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.headlineMedium
                                      ?.copyWith(
                                        fontWeight: FontWeight.w900,
                                        color: Colors.white,
                                        letterSpacing: -0.5,
                                      ),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                l10n.get('ouled_fayet'),
                                textAlign: TextAlign.center,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  color: AppTheme.accentGold,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 4,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  _buildDot(AppTheme.primaryBlue),
                                  _buildLine(isDark),
                                  _buildDot(AppTheme.accentGold),
                                  _buildLine(isDark),
                                  _buildDot(AppTheme.primaryBlue),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      AppTheme.primaryBlue.withAlpha(20),
                                      AppTheme.primaryGreen.withAlpha(20),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  l10n.get('space_admin'),
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppTheme.textLightMuted
                                        : AppTheme.textDarkMuted,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 36),

                      // === Login Card (Glassmorphism) ===
                      FadeTransition(
                        opacity: _cardFade,
                        child: SlideTransition(
                          position: _cardSlide,
                          child: GlassCard(
                            isFloating: true,
                            padding: const EdgeInsets.all(28),
                            child: Consumer<AuthController>(
                              builder: (context, auth, _) {
                                return Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    // Card Title
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.lock_open_rounded,
                                          size: 22,
                                          color: AppTheme.primaryBlue,
                                        ),
                                        const SizedBox(width: 10),
                                        Text(
                                          l10n.get('login_title'),
                                          style: theme.textTheme.titleLarge
                                              ?.copyWith(
                                                fontWeight: FontWeight.w800,
                                                letterSpacing: -0.3,
                                              ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      l10n.get('login_subtitle'),
                                      textAlign: TextAlign.center,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: isDark
                                                ? AppTheme.textLightMuted
                                                : AppTheme.textDarkMuted,
                                          ),
                                    ),
                                    const SizedBox(height: 28),

                                    // Email/Matricule Field
                                    _buildInputField(
                                      controller: _emailController,
                                      focusNode: _emailFocus,
                                      label: l10n.get('username'),
                                      icon: Icons.admin_panel_settings_outlined,
                                      isDark: isDark,
                                      theme: theme,
                                      textInputAction: TextInputAction.next,
                                      inputType: TextInputType.emailAddress,
                                      onSubmitted: (_) =>
                                          _passwordFocus.requestFocus(),
                                    ),
                                    const SizedBox(height: 16),

                                    // Password Field
                                    _buildInputField(
                                      controller: _passwordController,
                                      focusNode: _passwordFocus,
                                      label: l10n.get('password'),
                                      icon: Icons.lock_outline_rounded,
                                      isDark: isDark,
                                      theme: theme,
                                      obscure: _obscurePassword,
                                      textInputAction: TextInputAction.done,
                                      onSubmitted: (_) async {
                                        if (!auth.isLoading) {
                                          final success = await auth.signIn(
                                            _emailController.text,
                                            _passwordController.text,
                                          );
                                          if (success && mounted) {
                                            if (context.mounted) {
                                              context.go('/');
                                            }
                                          }
                                        }
                                      },
                                      suffix: IconButton(
                                        icon: AnimatedSwitcher(
                                          duration: const Duration(
                                            milliseconds: 200,
                                          ),
                                          child: Icon(
                                            _obscurePassword
                                                ? Icons.visibility_off_rounded
                                                : Icons.visibility_rounded,
                                            key: ValueKey(_obscurePassword),
                                            size: 20,
                                            color: isDark
                                                ? AppTheme.textLightMuted
                                                : AppTheme.textDarkMuted,
                                          ),
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _obscurePassword =
                                                !_obscurePassword;
                                          });
                                        },
                                      ),
                                    ),

                                    // Error Message
                                    if (auth.errorMessage != null) ...[
                                      const SizedBox(height: 16),
                                      TweenAnimationBuilder<double>(
                                        tween: Tween(begin: 0.0, end: 1.0),
                                        duration: const Duration(
                                          milliseconds: 300,
                                        ),
                                        builder: (context, value, child) {
                                          return Opacity(
                                            opacity: value,
                                            child: Transform.translate(
                                              offset: Offset(
                                                0,
                                                8 * (1 - value),
                                              ),
                                              child: child,
                                            ),
                                          );
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 14,
                                            vertical: 12,
                                          ),
                                          decoration: BoxDecoration(
                                            color: AppTheme.dangerRed.withAlpha(
                                              isDark ? 35 : 20,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              14,
                                            ),
                                            border: Border.all(
                                              color: AppTheme.dangerRed
                                                  .withAlpha(60),
                                            ),
                                          ),
                                          child: Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.all(
                                                  4,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: AppTheme.dangerRed
                                                      .withAlpha(30),
                                                  shape: BoxShape.circle,
                                                ),
                                                child: const Icon(
                                                  Icons.close_rounded,
                                                  color: AppTheme.dangerRed,
                                                  size: 14,
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              Expanded(
                                                child: Text(
                                                  auth.errorMessage!,
                                                  style: const TextStyle(
                                                    color: AppTheme.dangerRed,
                                                    fontWeight: FontWeight.w600,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],

                                    const SizedBox(height: 28),

                                    // Login Button
                                    PremiumButton(
                                      text: l10n.get('login_button'),
                                      isLoading: auth.isLoading,
                                      icon: Icons.arrow_forward_rounded,
                                      onPressed: () async {
                                        final success = await auth.signIn(
                                          _emailController.text,
                                          _passwordController.text,
                                        );
                                        if (success && mounted) {
                                          if (context.mounted) {
                                            context.go('/');
                                          }
                                        }
                                      },
                                    ),
                                    const SizedBox(height: 16),

                                    // Forgot Password Button
                                    TextButton(
                                      onPressed: () {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          SnackBar(
                                            content: Text(
                                              l10n.get('contact_support'),
                                            ),
                                          ),
                                        );
                                      },
                                      child: Text(
                                        l10n.get('forgot_password'),
                                        style: TextStyle(
                                          color: isDark
                                              ? AppTheme.textLightMuted
                                              : AppTheme.textDarkMuted,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 32),

                      // === Footer ===
                      FadeTransition(
                        opacity: _footerFade,
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.verified_user_rounded,
                                  size: 14,
                                  color: isDark
                                      ? AppTheme.primaryBlue.withAlpha(150)
                                      : AppTheme.primaryBlue.withAlpha(120),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  l10n.get('secure_access'),
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: isDark
                                        ? AppTheme.textLightMuted.withAlpha(120)
                                        : AppTheme.textDarkMuted.withAlpha(120),
                                    letterSpacing: 1.2,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              '© ${DateTime.now().year} INSFP Audiovisuel',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: isDark
                                    ? AppTheme.textLightMuted.withAlpha(80)
                                    : AppTheme.textDarkMuted.withAlpha(80),
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // === Download Apps Button ===
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            child: FadeTransition(
              opacity: _footerFade,
              child: Container(
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF1A2340).withAlpha(200)
                      : Colors.white.withAlpha(200),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark
                        ? AppTheme.primaryBlue.withAlpha(40)
                        : const Color(0xFFE0E6F0),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(15),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: IconButton(
                  icon: const Icon(Icons.install_mobile_rounded, size: 20),
                  tooltip: 'Télécharger les Applications',
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => const DownloadAppsDialog(),
                    );
                  },
                ),
              ),
            ),
          ),

          // === Settings Button ===
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            right: 16,
            child: FadeTransition(
              opacity: _footerFade,
              child: Container(
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF1A2340).withAlpha(200)
                      : Colors.white.withAlpha(200),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark
                        ? AppTheme.primaryBlue.withAlpha(40)
                        : const Color(0xFFE0E6F0),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(15),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: IconButton(
                  icon: const Icon(Icons.tune_rounded, size: 20),
                  tooltip: 'Paramètres',
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => const SettingsDialog(),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // === Custom Input Field ===
  Widget _buildInputField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String label,
    required IconData icon,
    required bool isDark,
    required ThemeData theme,
    String? hint,
    bool obscure = false,
    Widget? suffix,
    TextInputType? inputType,
    TextInputAction? textInputAction,
    void Function(String)? onSubmitted,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: focusNode.hasFocus
            ? (isDark ? const Color(0xFF141C30) : Colors.white)
            : (isDark
                  ? Colors.black.withAlpha(60)
                  : Colors.white.withAlpha(180)),
        border: Border.all(
          color: focusNode.hasFocus
              ? AppTheme.primaryBlue
              : (isDark
                    ? Colors.white.withAlpha(20)
                    : Colors.black.withAlpha(15)),
          width: focusNode.hasFocus ? 2 : 1,
        ),
        boxShadow: focusNode.hasFocus
            ? [
                BoxShadow(
                  color: AppTheme.primaryBlue.withAlpha(50),
                  blurRadius: 20,
                  spreadRadius: 4,
                ),
              ]
            : [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        obscureText: obscure,
        keyboardType: inputType,
        textInputAction: textInputAction,
        onSubmitted: onSubmitted,
        style: theme.textTheme.bodyLarge?.copyWith(
          fontWeight: FontWeight.w600,
          color: isDark ? Colors.white : AppTheme.textDark,
        ),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          floatingLabelBehavior: FloatingLabelBehavior.auto,
          labelStyle: TextStyle(
            color: focusNode.hasFocus
                ? AppTheme.primaryBlue
                : isDark
                ? Colors.white.withAlpha(150)
                : AppTheme.textDarkMuted,
            fontWeight: FontWeight.w600,
            fontSize: 14,
            letterSpacing: 0.5,
          ),
          prefixIcon: Container(
            margin: const EdgeInsets.only(left: 6, right: 8),
            child: Icon(
              icon,
              size: 22,
              color: focusNode.hasFocus
                  ? AppTheme.primaryBlue
                  : isDark
                  ? Colors.white.withAlpha(150)
                  : AppTheme.textDarkMuted,
            ),
          ),
          prefixIconConstraints: const BoxConstraints(
            minWidth: 52,
            minHeight: 52,
          ),
          suffixIcon: suffix,
          filled: true,
          fillColor: Colors.transparent,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 20,
          ),
        ),
      ),
    );
  }

  // === Decor Helpers ===

  Widget _buildDot(Color color) {
    return Container(
      width: 4,
      height: 4,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }

  Widget _buildLine(bool isDark) {
    return Container(
      width: 30,
      height: 1,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      color: isDark ? Colors.white.withAlpha(30) : Colors.black.withAlpha(20),
    );
  }
}
