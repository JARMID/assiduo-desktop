import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

class PremiumChartCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final List<Map<String, dynamic>> weekData;

  const PremiumChartCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.weekData,
  });

  @override
  State<PremiumChartCard> createState() => _PremiumChartCardState();
}

class _PremiumChartCardState extends State<PremiumChartCard> {
  int? _touchedIndex;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(
        MediaQuery.of(context).size.width > 600 ? 24.0 : 16.0,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [const Color(0xFF111730), const Color(0xFF0E1225)]
              : [Colors.white, const Color(0xFFF8F9FF)],
        ),
        border: Border.all(
          color: isDark ? const Color(0xFF1E2640) : const Color(0xFFE8EDFF),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withAlpha(40)
                : const Color(0xFF667EEA).withAlpha(10),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16,
            runSpacing: 12,
            children: [
              SizedBox(
                width: 200, // Provides a base width so Wrap works well
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : AppTheme.textDark,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark
                            ? AppTheme.textLightMuted
                            : AppTheme.textDarkMuted,
                      ),
                    ),
                  ],
                ),
              ),
              // Legend
              Wrap(
                spacing: 16,
                runSpacing: 8,
                children: [
                  _buildLegendDot('Présent', const Color(0xFF43E97B), isDark),
                  _buildLegendDot('Absent', const Color(0xFFF5576C), isDark),
                  _buildLegendDot('Retard', const Color(0xFFFFA726), isDark),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Chart
          SizedBox(
            height: 200,
            child: widget.weekData.isEmpty
                ? Center(
                    child: Text(
                      'Aucune donnée disponible',
                      style: TextStyle(
                        color: isDark
                            ? AppTheme.textLightMuted
                            : AppTheme.textDarkMuted,
                      ),
                    ),
                  )
                : BarChart(
                    BarChartData(
                      alignment: BarChartAlignment.spaceAround,
                      maxY: _getMaxY(),
                      barTouchData: BarTouchData(
                        enabled: true,
                        touchTooltipData: BarTouchTooltipData(
                          tooltipRoundedRadius: 12,
                          getTooltipColor: (_) =>
                              isDark ? const Color(0xFF1A2040) : Colors.white,
                          tooltipPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                          getTooltipItem: (group, groupIndex, rod, rodIndex) {
                            final data = widget.weekData[group.x.toInt()];
                            final labels = ['Présent', 'Absent', 'Retard'];
                            final values = [
                              data['present'],
                              data['absent'],
                              data['late'],
                            ];
                            return BarTooltipItem(
                              '${labels[rodIndex]}: ${values[rodIndex]}',
                              TextStyle(
                                color: isDark
                                    ? Colors.white
                                    : AppTheme.textDark,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            );
                          },
                        ),
                        touchCallback: (event, response) {
                          setState(() {
                            if (response?.spot != null) {
                              _touchedIndex =
                                  response!.spot!.touchedBarGroupIndex;
                            } else {
                              _touchedIndex = null;
                            }
                          });
                        },
                      ),
                      titlesData: FlTitlesData(
                        show: true,
                        topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 32,
                            getTitlesWidget: (value, meta) {
                              return Text(
                                value.toInt().toString(),
                                style: TextStyle(
                                  color: isDark
                                      ? AppTheme.textLightMuted.withAlpha(120)
                                      : AppTheme.textDarkMuted.withAlpha(120),
                                  fontSize: 11,
                                ),
                              );
                            },
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              final idx = value.toInt();
                              if (idx < 0 || idx >= widget.weekData.length) {
                                return const SizedBox.shrink();
                              }
                              final date =
                                  widget.weekData[idx]['date'] as DateTime;
                              final dayNames = [
                                'Lun',
                                'Mar',
                                'Mer',
                                'Jeu',
                                'Ven',
                                'Sam',
                                'Dim',
                              ];
                              return Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(
                                  dayNames[date.weekday - 1],
                                  style: TextStyle(
                                    color: isDark
                                        ? AppTheme.textLightMuted
                                        : AppTheme.textDarkMuted,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        horizontalInterval: _getMaxY() > 0
                            ? (_getMaxY() / 4).ceilToDouble().clamp(
                                1,
                                double.infinity,
                              )
                            : 1,
                        getDrawingHorizontalLine: (value) => FlLine(
                          color: isDark
                              ? const Color(0xFF1E2640)
                              : const Color(0xFFEEF1FF),
                          strokeWidth: 1,
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      barGroups: _buildBarGroups(isDark),
                    ),
                    duration: const Duration(milliseconds: 800),
                    curve: Curves.easeOutQuart,
                  ),
          ),
        ],
      ),
    ).animate().fade(duration: 300.ms).slideY(begin: 0.1);
  }

  double _getMaxY() {
    double max = 5;
    for (final d in widget.weekData) {
      final total =
          ((d['present'] as int) + (d['absent'] as int) + (d['late'] as int))
              .toDouble();
      if (total > max) max = total;
    }
    return (max * 1.2).ceilToDouble();
  }

  List<BarChartGroupData> _buildBarGroups(bool isDark) {
    return widget.weekData.asMap().entries.map((entry) {
      final i = entry.key;
      final d = entry.value;
      final isTouched = _touchedIndex == i;

      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: (d['present'] as int).toDouble(),
            color: const Color(0xFF43E97B),
            width: isTouched ? 14 : 10,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
            backDrawRodData: BackgroundBarChartRodData(
              show: true,
              toY: _getMaxY(),
              color: isDark
                  ? const Color(0xFF1A2040).withAlpha(30)
                  : const Color(0xFFF0F3FF),
            ),
          ),
          BarChartRodData(
            toY: (d['absent'] as int).toDouble(),
            color: const Color(0xFFF5576C),
            width: isTouched ? 14 : 10,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
          ),
          BarChartRodData(
            toY: (d['late'] as int).toDouble(),
            color: const Color(0xFFFFA726),
            width: isTouched ? 14 : 10,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
          ),
        ],
      );
    }).toList();
  }

  Widget _buildLegendDot(String label, Color color, bool isDark) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
            boxShadow: [BoxShadow(color: color.withAlpha(60), blurRadius: 6)],
          ),
        ),
        const SizedBox(width: 6),
        Flexible(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: isDark ? AppTheme.textLightMuted : AppTheme.textDarkMuted,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

/// Glassmorphic attendance rate indicator with animated circular progress
class AttendanceRateIndicator extends StatelessWidget {
  final double rate;

  const AttendanceRateIndicator({super.key, required this.rate});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = rate >= 80
        ? const Color(0xFF43E97B)
        : rate >= 60
        ? const Color(0xFFFFA726)
        : const Color(0xFFF5576C);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [color.withAlpha(15), color.withAlpha(5)]
              : [Colors.white, color.withAlpha(8)],
        ),
        border: Border.all(color: color.withAlpha(isDark ? 30 : 20)),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(isDark ? 15 : 10),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isSmall = constraints.maxWidth < 200;

          final content1 = SizedBox(
            width: 120,
            height: 120,
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: rate / 100),
              duration: const Duration(seconds: 2),
              curve: Curves.easeInOutQuart,
              builder: (context, value, _) {
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 120,
                      height: 120,
                      child: CustomPaint(
                        painter: AttendanceRingPainter(
                          percentage: value,
                          isDark: isDark,
                          color: color,
                        ),
                      ),
                    ),
                    Text(
                      '${(value * 100).toStringAsFixed(0)}%',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : AppTheme.textDark,
                      ),
                    ),
                  ],
                );
              },
            ),
          );

          final content2 = Column(
            crossAxisAlignment: isSmall
                ? CrossAxisAlignment.center
                : CrossAxisAlignment.start,
            children: [
              Text(
                'Taux de Présence Global',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                rate >= 80
                    ? 'Excellent — Les stagiaires sont assidus'
                    : rate >= 60
                    ? 'Moyen — Quelques absences à surveiller'
                    : 'Faible — Intervention recommandée',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark
                      ? AppTheme.textLightMuted
                      : AppTheme.textDarkMuted,
                ),
              ),
            ],
          );

          return isSmall
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [content1, const SizedBox(height: 12), content2],
                )
              : Row(
                  children: [
                    content1,
                    const SizedBox(width: 20),
                    Expanded(child: content2),
                  ],
                );
        },
      ),
    ).animate().fade(duration: 300.ms).slideX(begin: -0.1);
  }
}

class AttendanceRingPainter extends CustomPainter {
  final double percentage;
  final bool isDark;
  final Color color;

  AttendanceRingPainter({
    required this.percentage,
    required this.isDark,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 10;

    // Background circle
    final bgPaint = Paint()
      ..color = isDark ? Colors.white10 : Colors.black.withAlpha(15)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bgPaint);

    // Foreground arc
    final fgPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round
      ..shader = SweepGradient(
        colors: [color.withAlpha(128), color],
        stops: const [0.0, 1.0],
        transform: const GradientRotation(-math.pi / 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 2); // Soft glow

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * percentage,
      false,
      fgPaint,
    );

    // Draw dot at the end
    final double endAngle = -math.pi / 2 + (2 * math.pi * percentage);
    final dotCenter = Offset(
      center.dx + radius * math.cos(endAngle),
      center.dy + radius * math.sin(endAngle),
    );

    final dotPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 1);

    canvas.drawCircle(dotCenter, 6, dotPaint);
  }

  @override
  bool shouldRepaint(covariant AttendanceRingPainter oldDelegate) {
    return oldDelegate.percentage != percentage ||
        oldDelegate.isDark != isDark ||
        oldDelegate.color != color;
  }
}
