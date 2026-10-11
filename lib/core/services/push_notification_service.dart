import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:supabase_flutter/supabase_flutter.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Handles background messages
  debugPrint("Handling a background message: ${message.messageId}");
}

class PushNotificationService {
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    // Request permission (iOS/Web)
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (details) {
        // Handle foreground notification tap
        _handleNotificationTap(details.payload);
      },
    );

    // Get token and store in Supabase
    final token = await FirebaseMessaging.instance.getToken();
    if (token != null) {
      await _saveToken(token);
    }

    // Listen for token refresh
    FirebaseMessaging.instance.onTokenRefresh.listen(_saveToken);

    // Foreground messages -> show local notification
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Background tap -> navigate to screen
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationTap(message.data['ref_id']);
    });
  }

  static Future<void> _saveToken(String token) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return; // Only save if user is logged in

    try {
      await Supabase.instance.client.from('insfp_fcm_tokens').upsert({
        'user_id': user.id,
        'token': token,
        'device_type': kIsWeb
            ? 'web'
            : (Platform.isAndroid
                  ? 'android'
                  : (Platform.isIOS ? 'ios' : 'other')),
        'app_name': 'admin_portal',
        'updated_at': DateTime.now().toIso8601String(),
      }, onConflict: 'user_id,token');
    } catch (e) {
      debugPrint('Failed to save FCM token: $e');
    }
  }

  static void _handleForegroundMessage(RemoteMessage message) {
    RemoteNotification? notification = message.notification;
    AndroidNotification? android = message.notification?.android;

    if (notification != null && android != null) {
      _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'high_importance_channel', // id
            'High Importance Notifications', // name
            channelDescription:
                'This channel is used for important notifications.',
            importance: Importance.max,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
          ),
        ),
        payload: message.data['ref_id'],
      );
    }
  }

  static void _handleNotificationTap(String? payload) {
    if (payload != null) {
      debugPrint("Notification tapped with payload: $payload");
      // TODO: Use a global navigator key or deep link router to navigate to the correct screen
    }
  }
}
