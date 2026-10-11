import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Premium Institutional Colors
  static const Color darkBackground = Color(
    0xFF0A0F1A,
  ); // Deep navy-tinted black
  static const Color darkSurface = Color(0xFF121829); // Slightly lighter navy
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);

  static const Color primaryGreen = Color(0xFF003875); // Navy Blue
  static const Color primaryBlue = Color(0xFF0058A8); // Lighter Blue
  static const Color primaryPurple = Color(0xFF003875); // Navy Blue
  static const Color accentGold = Color(0xFFE8A838); // Desaturated warm gold
  static const Color dangerRed = Color(0xFFD32F2F); // Absences/Alerts

  // Premium Surface Tokens
  static const Color surfaceGlass = Color(
    0x1AFFFFFF,
  ); // 10% white for glass cards
  static const Color borderSubtle = Color(
    0x14FFFFFF,
  ); // 8% white hairline borders

  // Text Colors
  static const Color textLight = Color(0xFFF8FAFC);
  static const Color textLightMuted = Color(0xFF94A3B8);
  static const Color textDark = Color(0xFF0F172A);
  static const Color textDarkMuted = Color(0xFF475569);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBackground,
      primaryColor: primaryGreen,
      colorScheme: const ColorScheme.dark(
        primary: primaryGreen,
        secondary: primaryBlue,
        surface: darkSurface,
        error: dangerRed,
        onPrimary: textLight,
        onSecondary: textLight,
        onSurface: textLight,
        onError: textLight,
      ),
      textTheme:
          GoogleFonts.plusJakartaSansTextTheme(
            ThemeData.dark().textTheme,
          ).copyWith(
            displayLarge: GoogleFonts.outfit(
              fontSize: 42,
              fontWeight: FontWeight.w700,
              letterSpacing: -1.5,
            ),
            headlineMedium: GoogleFonts.plusJakartaSans(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.5,
            ),
            bodyLarge: GoogleFonts.plusJakartaSans(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              height: 1.6,
            ),
            labelSmall: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              letterSpacing: 1.2,
            ),
          ),
      appBarTheme: const AppBarTheme(elevation: 0, centerTitle: true),
      cardTheme: CardThemeData(
        color: darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF2C2C2C), width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: textLight,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryGreen, width: 2),
        ),
        hintStyle: const TextStyle(color: textLightMuted),
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      primaryColor: primaryGreen,
      colorScheme: const ColorScheme.light(
        primary: primaryGreen,
        secondary: primaryBlue,
        surface: lightSurface,
        error: dangerRed,
        onPrimary: textLight,
        onSecondary: textLight,
        onSurface: textDark,
        onError: textLight,
      ),
      textTheme:
          GoogleFonts.plusJakartaSansTextTheme(
            ThemeData.light().textTheme,
          ).copyWith(
            displayLarge: GoogleFonts.outfit(
              fontSize: 42,
              fontWeight: FontWeight.w700,
              letterSpacing: -1.5,
            ),
            headlineMedium: GoogleFonts.plusJakartaSans(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.5,
            ),
            bodyLarge: GoogleFonts.plusJakartaSans(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              height: 1.6,
            ),
            labelSmall: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              letterSpacing: 1.2,
            ),
          ),
      appBarTheme: const AppBarTheme(
        foregroundColor: textDark,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: lightSurface,
        elevation: 2,
        shadowColor: Colors.black12,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFEEEEEE), width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: textLight,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightSurface,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFDDDDDD), width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFDDDDDD), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryGreen, width: 2),
        ),
        hintStyle: const TextStyle(color: textDarkMuted),
      ),
    );
  }
}

/// Premium motion curves — never use linear or standard ease
class AppCurves {
  /// Smoother, slower entrance
  static const Curve entrance = Curves.easeOutCubic;

  /// Responsive micro-interaction
  static const Curve micro = Curves.easeOutQuad;

  /// Elastic spring for attention-grabbing elements
  static const Curve spring = Curves.elasticOut;

  /// Smooth deceleration for dismissals
  static const Curve exit = Curves.easeInCubic;
}
