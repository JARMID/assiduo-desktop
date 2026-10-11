import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../core/services/data_repository.dart';
import '../../../../core/services/export_service.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_theme.dart';

class ReportsDashboardView extends StatefulWidget {
  const ReportsDashboardView({super.key});

  @override
  State<ReportsDashboardView> createState() => _ReportsDashboardViewState();
}

class _ReportsDashboardViewState extends State<ReportsDashboardView> {
  bool _isLoading = false;
  List<ClassGroup> _classes = [];
  ClassGroup? _selectedClass;
  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();
  List<Map<String, dynamic>> _reportData = [];
  bool _hasGenerated = false;

  @override
  void initState() {
    super.initState();
    _loadClasses();
  }

  Future<void> _loadClasses() async {
    final repo = context.read<DataRepository>();
    final classes = await repo.getClasses();
    if (mounted) setState(() => _classes = classes);
  }

  Future<void> _generateReport() async {
    if (_selectedClass == null) return;
    setState(() { _isLoading = true; _hasGenerated = false; });
    try {
      final repo = context.read<DataRepository>();
      final data = await repo.getAttendanceSummary(
        classId: _selectedClass!.id,
        startDate: _startDate,
        endDate: _endDate,
      );
      if (mounted) {
        setState(() {
          _reportData = data..sort((a, b) => (a['last_name'] as String).compareTo(b['last_name'] as String));
          _isLoading = false;
          _hasGenerated = true;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: AppTheme.dangerRed),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startDate : _endDate,
      firstDate: DateTime(2024),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (picked != null && mounted) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final dateFormat = DateFormat('dd/MM/yyyy');

    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Icon(Icons.assessment_rounded, size: 32, color: AppTheme.primaryPurple),
              const SizedBox(width: 12),
              Text('Rapports de Présence', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 24),

          // Filters Bar
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? Colors.white12 : Colors.black12),
            ),
            child: Wrap(
              spacing: 16,
              runSpacing: 16,
              crossAxisAlignment: WrapCrossAlignment.end,
              children: [
                // Class selector
                SizedBox(
                  width: 250,
                  child: DropdownButtonFormField<ClassGroup>(
                    isExpanded: true,
                    initialValue: _selectedClass,
                    decoration: InputDecoration(
                      labelText: 'Classe',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    items: _classes.map((c) => DropdownMenuItem(value: c, child: Text(c.name, overflow: TextOverflow.ellipsis))).toList(),
                    onChanged: (v) => setState(() => _selectedClass = v),
                  ),
                ),
                // Start date
                _DatePickerButton(
                  label: 'Du',
                  date: dateFormat.format(_startDate),
                  onTap: () => _pickDate(true),
                ),
                // End date
                _DatePickerButton(
                  label: 'Au',
                  date: dateFormat.format(_endDate),
                  onTap: () => _pickDate(false),
                ),
                // Generate button
                FilledButton.icon(
                  onPressed: _selectedClass == null || _isLoading ? null : _generateReport,
                  icon: _isLoading
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.play_arrow_rounded),
                  label: const Text('Générer'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppTheme.primaryPurple,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                // Export CSV
                if (_hasGenerated && _reportData.isNotEmpty) ...[
                  OutlinedButton.icon(
                    onPressed: () {
                      ExportService.exportReportCsv(
                        summaryRows: _reportData,
                        className: _selectedClass!.name,
                        period: '${dateFormat.format(_startDate)}-${dateFormat.format(_endDate)}',
                      );
                    },
                    icon: const Icon(Icons.download_rounded),
                    label: const Text('CSV'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {
                      ExportService.exportReportPdf(
                        summaryRows: _reportData,
                        className: _selectedClass!.name,
                        period: '${dateFormat.format(_startDate)} au ${dateFormat.format(_endDate)}',
                      );
                    },
                    icon: const Icon(Icons.picture_as_pdf_rounded, color: AppTheme.dangerRed),
                    label: const Text('Fiche Pédagogique (PDF)'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Report Content
          Expanded(
            child: !_hasGenerated
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.bar_chart_rounded, size: 64, color: isDark ? Colors.white24 : Colors.black26),
                        const SizedBox(height: 16),
                        Text('Sélectionnez une classe et un intervalle de dates',
                            style: TextStyle(color: isDark ? Colors.white54 : Colors.black45, fontSize: 16)),
                      ],
                    ),
                  )
                : _reportData.isEmpty
                    ? Center(
                        child: Text('Aucune donnée pour cette période',
                            style: TextStyle(color: isDark ? Colors.white54 : Colors.black45, fontSize: 16)),
                      )
                    : Column(
                        children: [
                          // Summary cards
                          _buildOverviewCards(isDark),
                          const SizedBox(height: 20),
                          // Data table
                          Expanded(child: _buildDataTable(isDark)),
                        ],
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewCards(bool isDark) {
    if (_reportData.isEmpty) return const SizedBox();
    final total = _reportData.first['total'] as int;
    int totalP = 0, totalA = 0, totalR = 0, totalJ = 0;
    for (final r in _reportData) {
      totalP += r['present'] as int;
      totalA += r['absent'] as int;
      totalR += r['late'] as int;
      totalJ += r['justified'] as int;
    }
    final totalRecords = totalP + totalA + totalR + totalJ;
    final overallRate = totalRecords > 0 ? (totalP / totalRecords * 100).toStringAsFixed(1) : '0.0';

    return Row(
      children: [
        _overviewCard('Séances', '$total', Icons.event_rounded, AppTheme.primaryBlue, isDark),
        const SizedBox(width: 12),
        _overviewCard('Stagiaires', '${_reportData.length}', Icons.people_rounded, AppTheme.primaryPurple, isDark),
        const SizedBox(width: 12),
        _overviewCard('Taux global', '$overallRate%', Icons.trending_up_rounded, AppTheme.primaryGreen, isDark),
        const SizedBox(width: 12),
        _overviewCard('Absences', '$totalA', Icons.person_off_rounded, AppTheme.dangerRed, isDark),
      ],
    );
  }

  Widget _overviewCard(String label, String value, IconData icon, Color color, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withAlpha(50)),
        ),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: color.withAlpha(20),
              radius: 22,
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
                Text(label, style: TextStyle(fontSize: 12, color: isDark ? Colors.white54 : Colors.black54)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataTable(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white12 : Colors.black12),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: SingleChildScrollView(
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(isDark ? const Color(0xFF2A2A2A) : const Color(0xFFF5F5FF)),
            columns: const [
              DataColumn(label: Text('N°', style: TextStyle(fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Nom & Prénom', style: TextStyle(fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Matricule', style: TextStyle(fontWeight: FontWeight.bold))),
              DataColumn(label: Text('Séances', style: TextStyle(fontWeight: FontWeight.bold)), numeric: true),
              DataColumn(label: Text('Présent', style: TextStyle(fontWeight: FontWeight.bold)), numeric: true),
              DataColumn(label: Text('Absent', style: TextStyle(fontWeight: FontWeight.bold)), numeric: true),
              DataColumn(label: Text('Retard', style: TextStyle(fontWeight: FontWeight.bold)), numeric: true),
              DataColumn(label: Text('Justifié', style: TextStyle(fontWeight: FontWeight.bold)), numeric: true),
              DataColumn(label: Text('Taux %', style: TextStyle(fontWeight: FontWeight.bold)), numeric: true),
            ],
            rows: _reportData.asMap().entries.map((entry) {
              final i = entry.key;
              final r = entry.value;
              final rate = double.tryParse(r['rate'].toString()) ?? 0;
              final rateColor = rate >= 80 ? AppTheme.primaryGreen : rate >= 50 ? AppTheme.accentGold : AppTheme.dangerRed;
              return DataRow(cells: [
                DataCell(Text('${i + 1}')),
                DataCell(Text('${r['last_name']} ${r['first_name']}', style: const TextStyle(fontWeight: FontWeight.w600))),
                DataCell(Text(r['matricule'] ?? '')),
                DataCell(Text('${r['total']}')),
                DataCell(Text('${r['present']}', style: TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.bold))),
                DataCell(Text('${r['absent']}', style: TextStyle(color: AppTheme.dangerRed, fontWeight: FontWeight.bold))),
                DataCell(Text('${r['late']}', style: TextStyle(color: AppTheme.accentGold, fontWeight: FontWeight.bold))),
                DataCell(Text('${r['justified']}')),
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: rateColor.withAlpha(20),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text('${r['rate']}%', style: TextStyle(color: rateColor, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ),
              ]);
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _DatePickerButton extends StatelessWidget {
  final String label;
  final String date;
  final VoidCallback onTap;

  const _DatePickerButton({required this.label, required this.date, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w600)),
            Text(date),
            const SizedBox(width: 8),
            const Icon(Icons.calendar_today, size: 16),
          ],
        ),
      ),
    );
  }
}
