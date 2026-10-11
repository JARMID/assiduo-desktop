import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

/// Premium glass card with double-bezel depth
class GlassCard extends StatelessWidget {
  final Widget child;
  final double blur;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final bool isFloating;

  const GlassCard({
    super.key,
    required this.child,
    this.blur = 12.0,
    this.padding = const EdgeInsets.all(20),
    this.onTap,
    this.isFloating = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardContent = Container(
      // Outer shell (the "tray")
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.06)
              : Colors.black.withValues(alpha: 0.04),
        ),
      ),
      padding: const EdgeInsets.all(1.5),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22.5), // Concentric inner radius
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            // Inner core
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(22.5),
              boxShadow: [
                // Subtle inner highlight (top edge refraction)
                BoxShadow(
                  color: Colors.white.withValues(alpha: isDark ? 0.05 : 0.3),
                  offset: const Offset(0, 1),
                  blurRadius: 0,
                  spreadRadius: 0,
                ),
              ],
            ),
            padding: padding,
            child: child,
          ),
        ),
      ),
    );

    Widget finalContent = cardContent;
    if (onTap != null) {
      finalContent = GestureDetector(onTap: onTap, child: finalContent);
    }

    if (isFloating) {
      return finalContent
          .animate(onPlay: (controller) => controller.repeat())
          .moveY(
            begin: -5,
            end: 5,
            duration: 3000.ms,
            curve: Curves.easeInOutSine,
          )
          .then()
          .moveY(
            begin: 5,
            end: -5,
            duration: 3000.ms,
            curve: Curves.easeInOutSine,
          );
    }

    return finalContent;
  }
}
