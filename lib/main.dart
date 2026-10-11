import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/theme/app_theme.dart';
import 'core/l10n/app_localizations.dart';
import 'core/providers/settings_provider.dart';
import 'core/services/supabase_service.dart';
import 'core/services/data_repository.dart';

import 'features/auth/domain/auth_controller.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/dashboard/presentation/admin_dashboard.dart';
import 'features/dashboard/presentation/views/global_dashboard_view.dart';
import 'features/dashboard/presentation/views/teachers_dashboard_view.dart';
import 'features/dashboard/presentation/views/students_dashboard_view.dart';
import 'features/dashboard/presentation/views/classes_dashboard_view.dart';
import 'features/dashboard/presentation/views/sessions_dashboard_view.dart';
import 'features/dashboard/presentation/views/reports_dashboard_view.dart';
import 'features/dashboard/presentation/views/specialities_dashboard_view.dart';
import 'features/dashboard/presentation/views/modules_dashboard_view.dart';
import 'features/dashboard/presentation/views/student_details_view.dart';
import 'features/v2_admin/presentation/admin_justifications_screen.dart';
import 'features/v2_admin/presentation/admin_alerts_screen.dart';
import 'features/v2_admin/presentation/admin_messages_screen.dart';
import 'features/v2_admin/presentation/admin_conversation_screen.dart';
import 'features/v2_admin/presentation/admin_notifications_screen.dart';
import 'features/settings/presentation/settings_screen.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/services/push_notification_service.dart';

import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Animate.defaultDuration = const Duration(milliseconds: 600);
  Animate.defaultCurve = Curves.easeOutCubic;

  tz.initializeTimeZones();
  tz.setLocalLocation(tz.getLocation('Africa/Algiers'));

  // Initialize Supabase
  await SupabaseService().initialize();

  // Initialize Firebase (Skip on Web for now)
  if (!kIsWeb) {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      await PushNotificationService.initialize();
    } catch (e) {
      debugPrint('Firebase init error: $e');
    }
  }

  // Pre-flight check: If there's an existing session from the Teacher App, verify it's an admin
  final supabase = SupabaseService();
  if (supabase.isAuthenticated && supabase.currentUser != null) {
    // Run this asynchronously so it doesn't block runApp if the network is hanging
    Future(() async {
      try {
        final userRecord = await supabase.client
            .from('insfp_users')
            .select('role')
            .eq('id', supabase.currentUser!.id)
            .single()
            .timeout(const Duration(seconds: 5));

        if (userRecord['role'] != 'ADMINISTRATION') {
          // Not an admin, silently sign out so they hit the login screen
          await supabase.signOut();
        }
      } catch (_) {
        // If network fails or role doesn't exist, safely sign out to prevent unauthorized access
        await supabase.signOut();
      }
    });
  }

  runApp(const AdminPortalApp());
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final goRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  redirect: (context, state) {
    final auth = SupabaseService();
    final isLoggingIn = state.uri.toString() == '/login';

    if (!auth.isAuthenticated && !isLoggingIn) {
      return '/login';
    }

    // If authenticated and trying to go to login, send to home
    if (auth.isAuthenticated && isLoggingIn) {
      return '/';
    }

    return null;
  },
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return AdminDashboard(child: child);
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const GlobalDashboardView(),
        ),
        GoRoute(
          path: '/teachers',
          builder: (context, state) => const TeachersDashboardView(),
        ),
        GoRoute(
          path: '/students',
          builder: (context, state) => const StudentsDashboardView(),
          routes: [
            GoRoute(
              path: ':id',
              builder: (context, state) =>
                  StudentDetailsView(studentId: state.pathParameters['id']!),
            ),
          ],
        ),
        GoRoute(
          path: '/classes',
          builder: (context, state) => const ClassesDashboardView(),
        ),
        GoRoute(
          path: '/sessions',
          builder: (context, state) => const SessionsDashboardView(),
        ),
        GoRoute(
          path: '/reports',
          builder: (context, state) => const ReportsDashboardView(),
        ),
        GoRoute(
          path: '/specialities',
          builder: (context, state) => const SpecialitiesDashboardView(),
        ),
        GoRoute(
          path: '/modules',
          builder: (context, state) => const ModulesDashboardView(),
        ),
        GoRoute(
          path: '/justifications',
          builder: (context, state) => const AdminJustificationsScreen(),
        ),
        GoRoute(
          path: '/alerts',
          builder: (context, state) => const AdminAlertsScreen(),
        ),
        GoRoute(
          path: '/notifications',
          builder: (context, state) => const AdminNotificationsScreen(),
        ),
        GoRoute(
          path: '/messages',
          builder: (context, state) => const AdminMessagesScreen(),
          routes: [
            GoRoute(
              path: ':id',
              builder: (context, state) => AdminConversationScreen(
                conversationId: state.pathParameters['id']!,
              ),
            ),
          ],
        ),
        GoRoute(
          path: '/settings',
          builder: (context, state) => const SettingsScreen(),
        ),
      ],
    ),
  ],
);

class AdminPortalApp extends StatelessWidget {
  const AdminPortalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthController()),
        ChangeNotifierProvider(create: (_) => SettingsProvider()),
        Provider(create: (_) => DataRepository(SupabaseService().client)),
      ],
      child: Consumer<SettingsProvider>(
        builder: (context, settings, _) {
          return MaterialApp.router(
            title: 'INSFP Admin Portal',
            debugShowCheckedModeBanner: false,

            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: settings.themeMode,

            routerConfig: goRouter,

            supportedLocales: const [
              Locale('ar', ''),
              Locale('fr', ''),
              Locale('en', ''),
            ],
            localizationsDelegates: [
              AppLocalizationsDelegate(),
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            locale: settings.locale,
            localeResolutionCallback: (deviceLocale, supportedLocales) {
              if (settings.locale != null) return settings.locale;
              if (deviceLocale != null) {
                for (var supportedLocale in supportedLocales) {
                  if (supportedLocale.languageCode ==
                      deviceLocale.languageCode) {
                    return supportedLocale;
                  }
                }
              }
              return supportedLocales.first; // Default to Arabic
            },
          );
        },
      ),
    );
  }
}
