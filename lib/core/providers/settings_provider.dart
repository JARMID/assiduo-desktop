import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsProvider with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  Locale? _locale;

  ThemeMode get themeMode => _themeMode;
  Locale? get locale => _locale;

  SettingsProvider() {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();

    // Load Theme
    final themeIndex = prefs.getInt('themeMode');
    if (themeIndex != null &&
        themeIndex >= 0 &&
        themeIndex < ThemeMode.values.length) {
      _themeMode = ThemeMode.values[themeIndex];
    }

    // Load Locale
    final langCode = prefs.getString('languageCode');
    if (langCode != null && langCode.isNotEmpty) {
      _locale = Locale(langCode);
    }

    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('themeMode', mode.index);
  }

  Future<void> setLocale(Locale locale) async {
    _locale = locale;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('languageCode', locale.languageCode);
  }

  Future<void> clearLocale() async {
    _locale = null;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('languageCode');
  }
}
