import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AnimatedLoginBackground extends StatefulWidget {
  const AnimatedLoginBackground({super.key});

  @override
  State<AnimatedLoginBackground> createState() =>
      _AnimatedLoginBackgroundState();
}

class _AnimatedLoginBackgroundState extends State<AnimatedLoginBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _bgController;

  @override
  void initState() {
    super.initState();
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _bgController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final size = MediaQuery.of(context).size;

    return Stack(
      children: [
        // === Animated Gradient Background ===
        AnimatedBuilder(
          animation: _bgController,
          builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment(-1.0 + _bgController.value * 0.5, -1.0),
                  end: Alignment(
                    1.0 - _bgController.value * 0.5,
                    1.0 + _bgController.value * 0.3,
                  ),
                  colors: isDark
                      ? [
                          const Color(0xFF0A0E27),
                          const Color(0xFF0D1B3E),
                          const Color(0xFF0A0E27),
                        ]
                      : [
                          const Color(0xFFF0F4FF),
                          const Color(0xFFE8EDFF),
                          const Color(0xFFF5F0FF),
                        ],
                ),
              ),
            );
          },
        ),

        // === Floating Decorative Circles ===
        ..._buildOptimizedOrbs(isDark, size),
      ],
    );
  }

  List<Widget> _buildOptimizedOrbs(bool isDark, Size size) {
    final random = Random(42);
    return List.generate(15, (index) {
      final startLeft = size.width * random.nextDouble();
      final startTop = size.height * random.nextDouble();
      final sizeOrb = 20.0 + random.nextDouble() * 60;
      final phaseOffset = random.nextDouble();

      // Pre-build the container to avoid rebuilding it every frame
      final orbChild = Opacity(
        opacity: isDark ? 0.3 : 0.6,
        child: Container(
          width: sizeOrb,
          height: sizeOrb,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDark
                ? const Color(0xFF6BA3FF).withAlpha(10 + random.nextInt(20))
                : AppTheme.primaryBlue.withAlpha(20 + random.nextInt(20)),
            boxShadow: [
              BoxShadow(
                color: (isDark ? const Color(0xFF6BA3FF) : AppTheme.primaryBlue)
                    .withAlpha(30),
                blurRadius: 40,
                spreadRadius: 10,
              ),
            ],
          ),
        ),
      );

      return Positioned(
        left: startLeft,
        top: startTop,
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
          duration: Duration(seconds: 15 + random.nextInt(20)),
          builder: (context, value, child) {
            return Transform.translate(
              offset: Offset(
                sin(value * pi * 2 + phaseOffset) * 100,
                cos(value * pi * 2 + phaseOffset) * 100,
              ),
              child: child,
            );
          },
          child: orbChild, // Pass the pre-built child
        ),
      );
    });
  }
}
