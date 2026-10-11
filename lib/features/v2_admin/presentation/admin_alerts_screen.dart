import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/data_repository.dart';
import 'package:admin_portal/core/l10n/app_localizations.dart';

class AdminAlertsScreen extends StatefulWidget {
  const AdminAlertsScreen({super.key});

  @override
  State<AdminAlertsScreen> createState() => _AdminAlertsScreenState();
}

class _AdminAlertsScreenState extends State<AdminAlertsScreen> {
  List<Map<String, dynamic>> _alerts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final repo = context.read<DataRepository>();
      final data = await repo.getActiveAbsenceAlerts();
      setState(() {
        _alerts = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _resolveAlert(String id) async {
    final noteController = TextEditingController();
    final resolve = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Résoudre l\'alerte'),
        content: TextField(
          controller: noteController,
          decoration: const InputDecoration(labelText: 'Note de résolution'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(AppLocalizations.of(context).get('annuler')),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(AppLocalizations.of(context).get('valider')),
          ),
        ],
      ),
    );

    if (resolve == true) {
      if (!mounted) return;
      try {
        final repo = context.read<DataRepository>();
        await repo.resolveAbsenceAlert(id, noteController.text);
        if (mounted) _loadData();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Erreur: $e')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const SizedBox.shrink();

    if (_alerts.isEmpty) {
      return Center(
        child: Text(AppLocalizations.of(context).get('aucune_alerte_d_abse')),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _alerts.length,
      itemBuilder: (context, index) {
        final item = _alerts[index];
        final student = item['student'] as Map<String, dynamic>? ?? {};

        return Card(
          elevation: 2,
          color: Colors.red.shade50,
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            leading: const Icon(
              Icons.warning_amber_rounded,
              color: Colors.red,
              size: 40,
            ),
            title: Text(
              '${student['first_name']} ${student['last_name']} (Absences: ${item['absence_count']})',
            ),
            subtitle: Text(
              'Matricule: ${student['matricule']} | Dernière absence: ${item['last_absence_date']}',
            ),
            trailing: IconButton(
              icon: const Icon(Icons.check_circle_outline, color: Colors.green),
              tooltip: 'Résoudre',
              onPressed: () => _resolveAlert(item['id']),
            ),
          ),
        );
      },
    );
  }
}
