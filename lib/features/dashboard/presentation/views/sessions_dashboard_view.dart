import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/services/data_repository.dart';
import '../../../../core/services/export_service.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_theme.dart';

class SessionsDashboardView extends StatefulWidget {
  const SessionsDashboardView({super.key});

  @override
  State<SessionsDashboardView> createState() => _SessionsDashboardViewState();
}

class _SessionsDashboardViewState extends State<SessionsDashboardView> {
  bool _isLoading = true;
  List<AttendanceSession> _sessions = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    setState(() => _isLoading = true);
    try {
      final repo = context.read<DataRepository>();
      final sessions = await repo.getSessions();
      if (mounted) {
        setState(() {
          _sessions = sessions;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur du chargement: $e')),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  List<AttendanceSession> get _filteredSessions {
    if (_searchQuery.isEmpty) return _sessions;
    final q = _searchQuery.toLowerCase();
    return _sessions.where((s) {
      final className = s.classGroup?.name.toLowerCase() ?? '';
      final formateurName = s.formateur?.fullName.toLowerCase() ?? '';
      final module = s.module?.toLowerCase() ?? '';
      final date = s.date.toIso8601String().split('T')[0];
      return className.contains(q) ||
          formateurName.contains(q) ||
          module.contains(q) ||
          date.contains(q);
    }).toList();
  }

  String _formatSlot(String slot) {
    switch (slot) {
      case 'SLOT_08_30':
        return '08:30 – 10:30';
      case 'SLOT_10_45':
        return '10:45 – 12:45';
      case 'SLOT_13_30':
        return '13:30 – 15:00';
      case 'SLOT_15_00':
        return '15:00 – 16:30';
      default:
        return slot;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filtered = _filteredSessions;

    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Séances & Présences',
                style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  SizedBox(
                    width: 280,
                    child: TextField(
                      onChanged: (v) => setState(() => _searchQuery = v),
                      decoration: InputDecoration(
                        hintText: 'Rechercher par classe, formateur, date…',
                        prefixIcon: const Icon(Icons.search, size: 20),
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  IconButton(
                    icon: const Icon(Icons.refresh),
                    onPressed: _loadSessions,
                    tooltip: 'Actualiser',
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Summary chips
          Wrap(
            spacing: 12,
            children: [
              _buildChip('Total séances: ${_sessions.length}', AppTheme.primaryBlue),
              _buildChip('Résultats: ${filtered.length}', AppTheme.accentGold),
            ],
          ),
          const SizedBox(height: 24),

          Expanded(
            child: _isLoading
                ? const SizedBox.shrink()
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.event_busy, size: 64, color: Colors.grey.withAlpha(100)),
                            const SizedBox(height: 16),
                            const Text('Aucune séance trouvée.', style: TextStyle(color: Colors.grey)),
                          ],
                        ),
                      )
                    : Container(
                        decoration: BoxDecoration(
                          color: theme.cardTheme.color,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isDark ? const Color(0xFF333333) : const Color(0xFFE0E0E0)),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: SingleChildScrollView(
                            child: DataTable(
                              headingRowColor: WidgetStateProperty.resolveWith(
                                (states) => isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5),
                              ),
                              columns: const [
                                DataColumn(label: Text('Date', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Créneau', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Classe', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Formateur', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Module', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Actions', style: TextStyle(fontWeight: FontWeight.bold))),
                              ],
                              rows: filtered.map((session) {
                                return DataRow(
                                  cells: [
                                    DataCell(Text(
                                      session.date.toIso8601String().split('T')[0],
                                      style: const TextStyle(fontWeight: FontWeight.w600),
                                    )),
                                    DataCell(
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: AppTheme.primaryBlue.withAlpha(20),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          _formatSlot(session.slot),
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                                        ),
                                      ),
                                    ),
                                    DataCell(Text(session.classGroup?.name ?? '—')),
                                    DataCell(Text(session.formateur?.fullName ?? '—')),
                                    DataCell(Text(session.module ?? '—', style: const TextStyle(fontStyle: FontStyle.italic))),
                                    DataCell(
                                      ElevatedButton.icon(
                                        onPressed: () => _showAttendanceDetail(session),
                                        icon: const Icon(Icons.list_alt, size: 16),
                                        label: const Text('Voir présences'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppTheme.primaryPurple,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          textStyle: const TextStyle(fontSize: 12),
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              }).toList(),
                            ),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
    );
  }

  void _showAttendanceDetail(AttendanceSession session) async {
    showDialog(
      context: context,
      builder: (ctx) => _AttendanceDetailDialog(session: session),
    );
  }
}

class _AttendanceDetailDialog extends StatefulWidget {
  final AttendanceSession session;
  const _AttendanceDetailDialog({required this.session});

  @override
  State<_AttendanceDetailDialog> createState() => _AttendanceDetailDialogState();
}

class _AttendanceDetailDialogState extends State<_AttendanceDetailDialog> {
  bool _isLoading = true;
  List<AttendanceRecord> _records = [];

  @override
  void initState() {
    super.initState();
    _loadAttendance();
  }

  Future<void> _loadAttendance() async {
    try {
      final repo = context.read<DataRepository>();
      final records = await repo.getAttendanceForSession(widget.session.id);
      if (mounted) {
        setState(() {
          _records = records;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PRESENT':
        return Colors.green;
      case 'ABSENT':
        return AppTheme.dangerRed;
      case 'EN_RETARD':
        return Colors.orange;
      case 'JUSTIFIE':
        return AppTheme.primaryBlue;
      default:
        return Colors.grey;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'PRESENT':
        return 'P';
      case 'ABSENT':
        return 'A';
      case 'EN_RETARD':
        return 'R';
      case 'JUSTIFIE':
        return 'J';
      default:
        return '?';
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final theme = Theme.of(context);

    final presentCount = _records.where((r) => r.status == 'PRESENT').length;
    final absentCount = _records.where((r) => r.status == 'ABSENT').length;
    final lateCount = _records.where((r) => r.status == 'EN_RETARD').length;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        width: 600,
        constraints: const BoxConstraints(maxHeight: 600),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryPurple.withAlpha(20),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.event_note, color: AppTheme.primaryPurple),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${s.classGroup?.name ?? "—"} — ${s.date.toIso8601String().split("T")[0]}',
                        style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Formateur: ${s.formateur?.fullName ?? "—"} • Module: ${s.module ?? "—"}',
                        style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.picture_as_pdf, color: AppTheme.dangerRed),
                  tooltip: 'Exporter PDF (Fiche d\'appel)',
                  onPressed: _records.isEmpty
                      ? null
                      : () => ExportService.exportSessionPdf(
                            session: widget.session,
                            records: _records,
                            className: widget.session.classGroup?.name ?? 'classe',
                          ),
                ),
                IconButton(
                  icon: const Icon(Icons.table_chart, color: AppTheme.primaryGreen),
                  tooltip: 'Exporter CSV',
                  onPressed: _records.isEmpty
                      ? null
                      : () => ExportService.exportAttendanceCsv(
                            records: _records,
                            className: widget.session.classGroup?.name ?? 'classe',
                            date: widget.session.date.toIso8601String().split('T')[0],
                          ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Stats row
            if (!_isLoading) ...[
              Row(
                children: [
                  _statBadge('Présents', presentCount, Colors.green),
                  const SizedBox(width: 12),
                  _statBadge('Absents', absentCount, AppTheme.dangerRed),
                  const SizedBox(width: 12),
                  _statBadge('En retard', lateCount, Colors.orange),
                  const SizedBox(width: 12),
                  _statBadge('Total', _records.length, AppTheme.primaryBlue),
                ],
              ),
              const SizedBox(height: 20),
            ],

            // Content
            Flexible(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _records.isEmpty
                      ? const Center(
                          child: Text('Aucun pointage enregistré pour cette séance.',
                              style: TextStyle(color: Colors.grey)),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          itemCount: _records.length,
                          separatorBuilder: (_, i) => const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final record = _records[index];
                            final student = record.student;
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: _statusColor(record.status).withAlpha(30),
                                child: Text(
                                  _statusLabel(record.status),
                                  style: TextStyle(
                                    color: _statusColor(record.status),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              title: Text(
                                student != null
                                    ? '${student.lastName.toUpperCase()} ${student.firstName}'
                                    : 'Étudiant inconnu',
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                              subtitle: Text(
                                'Matricule: ${student?.matricule ?? "—"}',
                                style: const TextStyle(fontSize: 12),
                              ),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _statusColor(record.status).withAlpha(25),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: _statusColor(record.status).withAlpha(80)),
                                ),
                                child: Text(
                                  record.status.replaceAll('_', ' '),
                                  style: TextStyle(
                                    color: _statusColor(record.status),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statBadge(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withAlpha(15),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withAlpha(60)),
        ),
        child: Column(
          children: [
            Text(count.toString(),
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: TextStyle(fontSize: 11, color: color)),
          ],
        ),
      ),
    );
  }
}
