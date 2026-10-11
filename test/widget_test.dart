// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'dart:ui';
import 'package:flutter_test/flutter_test.dart';
import 'package:admin_portal/core/theme/app_theme.dart';
import 'package:admin_portal/core/l10n/app_localizations.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('Admin Portal theme and localizations smoke test', () {
    expect(AppTheme.primaryBlue, isNotNull);
    expect(AppTheme.darkTheme, isNotNull);
    expect(AppTheme.lightTheme, isNotNull);
    const delegate = AppLocalizationsDelegate();
    expect(delegate.isSupported(const Locale('fr')), isTrue);
    expect(delegate.isSupported(const Locale('ar')), isTrue);
    expect(delegate.isSupported(const Locale('en')), isTrue);
    final fr = AppLocalizations(const Locale('fr'));
    expect(fr.get('annuler'), isNotEmpty);
  });
}
