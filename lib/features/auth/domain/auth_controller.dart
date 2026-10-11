import 'package:flutter/material.dart';
import '../../../../core/services/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthController with ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();

  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  User? get currentUser => _supabaseService.client.auth.currentUser;

  Future<bool> signIn(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // --- Input Validation ---
      final trimmedEmail = email.trim();
      if (trimmedEmail.isEmpty) {
        _errorMessage = 'L\'adresse email est requise.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // Only allow alphanumeric, dots, hyphens, underscores, and @
      final matriculeRegex = RegExp(r'^[a-zA-Z0-9._@\-]+$');
      if (!matriculeRegex.hasMatch(trimmedEmail)) {
        _errorMessage = 'Identifiant contient des caractères invalides.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      if (password.isEmpty) {
        _errorMessage = 'Le mot de passe est requis.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      if (password.length < 6) {
        _errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final String emailForm = trimmedEmail.contains('@')
          ? trimmedEmail
          : '$trimmedEmail@insfp.dz';
      final String inputMatricule = trimmedEmail.contains('@')
          ? trimmedEmail.split('@')[0]
          : trimmedEmail;

      try {
        final userCheck = await _supabaseService.client
            .from('insfp_users')
            .select('id')
            .ilike('matricule', inputMatricule)
            .maybeSingle();

        if (userCheck == null) {
          _errorMessage = "Cette adresse email ou matricule n'existe pas.";
          _isLoading = false;
          notifyListeners();
          return false;
        }
      } catch (e) {
        // Proceed if query fails
      }

      final response = await _supabaseService.client.auth.signInWithPassword(
        email: emailForm,
        password: password,
      );

      if (response.user != null) {
        // Verify this is an ADMIN
        final userRecord = await _supabaseService.client
            .from('insfp_users')
            .select('role')
            .eq('id', response.user!.id)
            .single();

        if (userRecord['role'] != 'ADMINISTRATION') {
          _errorMessage = "Accès refusé. Vous n'êtes pas administrateur.";
          await _supabaseService.signOut();
          _isLoading = false;
          notifyListeners();
          return false;
        }

        _isLoading = false;
        notifyListeners();
        return true;
      }
    } on AuthException catch (e) {
      if (e.message.contains('Invalid login credentials')) {
        _errorMessage = 'Mot de passe incorrect.';
      } else {
        _errorMessage = e.message;
      }
    } catch (_) {
      _errorMessage = 'Une erreur est survenue.';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> signOut() async {
    await _supabaseService.signOut();
    notifyListeners();
  }
}
