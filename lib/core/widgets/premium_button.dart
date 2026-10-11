import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

class PremiumButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final IconData? icon;
  final Color? color;
  final double? width;
  final double? height;

  const PremiumButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.color,
    this.width,
    this.height,
  });

  @override
  State<PremiumButton> createState() => _PremiumButtonState();
}

class _PremiumButtonState extends State<PremiumButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        if (!widget.isLoading) {
          widget.onPressed();
        }
      },
      child: AnimatedScale(
        scale: _isPressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: AppCurves.micro,
        child: Container(
          width: widget.width ?? double.infinity,
          height: widget.height ?? 56,
          decoration: BoxDecoration(
            color:
                widget.color ??
                (isDark ? AppTheme.primaryGreen : AppTheme.primaryGreen),
            borderRadius: BorderRadius.circular(28), // Fully rounded pill
            boxShadow: [
              BoxShadow(
                color: (widget.color ?? AppTheme.primaryGreen).withValues(
                  alpha: 0.3,
                ),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Content
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (widget.isLoading)
                    const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(),
                    )
                  else ...[
                    Text(
                      widget.text,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                    if (widget.icon != null) ...[
                      const SizedBox(width: 8),
                      // Button-in-button nested trailing icon architecture
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(widget.icon, color: Colors.white, size: 16),
                      ),
                    ],
                  ],
                ],
              ),

              // Shimmer overlay
              if (!widget.isLoading)
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(28),
                    child:
                        Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.centerLeft,
                                  end: Alignment.centerRight,
                                  colors: [
                                    Colors.white.withValues(alpha: 0.0),
                                    Colors.white.withValues(alpha: 0.1),
                                    Colors.white.withValues(alpha: 0.0),
                                  ],
                                  stops: const [0.0, 0.5, 1.0],
                                ),
                              ),
                            )
                            .animate(
                              onPlay: (controller) => controller.repeat(),
                            )
                            .moveX(
                              begin: -200,
                              end: 400,
                              duration: 2.seconds,
                              curve: Curves.easeInOutSine,
                            ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
