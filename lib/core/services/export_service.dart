import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:csv/csv.dart';
import '../models/models.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart' show rootBundle;

import 'export_service_stub.dart'
    if (dart.library.html) 'export_service_web.dart';

class ExportService {
  // ─── PDF: Fiche d'appel for a session ─────────────────────

  static Future<pw.MemoryImage?> _loadLogo() async {
    try {
      final ByteData data = await rootBundle.load('assets/images/INSFP.png');
      return pw.MemoryImage(data.buffer.asUint8List());
    } catch (e) {
      return null;
    }
  }

  static Future<void> exportSessionPdf({
    required AttendanceSession session,
    required List<AttendanceRecord> records,
    required String className,
  }) async {
    final pdf = pw.Document();

    final slotLabel = _slotLabel(session.slot);
    final dateStr =
        '${session.date.day.toString().padLeft(2, '0')}/${session.date.month.toString().padLeft(2, '0')}/${session.date.year}';
    final logoImage = await _loadLogo();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        header: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Row(
                  children: [
                    if (logoImage != null)
                      pw.Container(
                        width: 40,
                        height: 40,
                        margin: const pw.EdgeInsets.only(right: 12),
                        child: pw.Image(logoImage),
                      ),
                    pw.Text(
                      'INSFP - Fiche d\'Appel',
                      style: pw.TextStyle(
                        fontSize: 18,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                pw.Text(
                  'Date: $dateStr',
                  style: const pw.TextStyle(fontSize: 12),
                ),
              ],
            ),
            pw.SizedBox(height: 12),
            pw.Row(
              children: [
                _infoChip('Classe', className),
                pw.SizedBox(width: 16),
                _infoChip('Module', session.module ?? '-'),
                pw.SizedBox(width: 16),
                _infoChip('Créneau', slotLabel),
              ],
            ),
            pw.SizedBox(height: 16),
            pw.Divider(),
            pw.SizedBox(height: 8),
          ],
        ),
        footer: (context) => pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text(
              'Signature du formateur: ____________________',
              style: const pw.TextStyle(fontSize: 10),
            ),
            pw.Text(
              'Page ${context.pageNumber}/${context.pagesCount}',
              style: const pw.TextStyle(fontSize: 10),
            ),
          ],
        ),
        build: (context) {
          // Sort records by student name
          final sorted = List<AttendanceRecord>.from(records)
            ..sort(
              (a, b) => (a.student?.lastName ?? '').compareTo(
                b.student?.lastName ?? '',
              ),
            );

          return [
            pw.Table(
              border: pw.TableBorder.all(width: 0.5),
              columnWidths: {
                0: const pw.FixedColumnWidth(30),
                1: const pw.FlexColumnWidth(2),
                2: const pw.FlexColumnWidth(1.5),
                3: const pw.FixedColumnWidth(70),
                4: const pw.FlexColumnWidth(1),
              },
              children: [
                // Header
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: PdfColors.grey200),
                  children: [
                    _headerCell('N°'),
                    _headerCell('Nom & Prénom'),
                    _headerCell('Matricule'),
                    _headerCell('Statut'),
                    _headerCell('Observations'),
                  ],
                ),
                // Data rows
                ...sorted.asMap().entries.map((entry) {
                  final i = entry.key;
                  final r = entry.value;
                  return pw.TableRow(
                    children: [
                      _dataCell('${i + 1}'),
                      _dataCell(r.student?.fullName ?? r.studentId),
                      _dataCell(r.student?.matricule ?? '-'),
                      _statusCell(r.status),
                      _dataCell(''),
                    ],
                  );
                }),
              ],
            ),
            pw.SizedBox(height: 16),
            _summaryRow(records),
          ];
        },
      ),
    );

    final bytes = await pdf.save();
    await Printing.sharePdf(
      bytes: bytes,
      filename: 'fiche_appel_${className}_$dateStr.pdf',
    );
  }

  // ─── PDF: Blank Attendance Sheet ─────────────────────────────

  static Future<void> exportBlankAttendanceSheet({
    required ClassGroup classGroup,
    required List<Student> students,
  }) async {
    final pdf = pw.Document();
    final logoImage = await _loadLogo();
    final dateStr =
        '${DateTime.now().day.toString().padLeft(2, '0')}/${DateTime.now().month.toString().padLeft(2, '0')}/${DateTime.now().year}';

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        header: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Row(
                  children: [
                    if (logoImage != null)
                      pw.Container(
                        width: 40,
                        height: 40,
                        margin: const pw.EdgeInsets.only(right: 12),
                        child: pw.Image(logoImage),
                      ),
                    pw.Text(
                      'INSFP - Fiche de Présence (Semaine)',
                      style: pw.TextStyle(
                        fontSize: 16,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                pw.Text(
                  'Édité le: $dateStr',
                  style: const pw.TextStyle(fontSize: 10),
                ),
              ],
            ),
            pw.SizedBox(height: 12),
            pw.Row(
              children: [
                _infoChip('Classe', classGroup.name),
                pw.SizedBox(width: 16),
                _infoChip('Spécialité', classGroup.speciality),
                pw.SizedBox(width: 16),
                _infoChip('Niveau', classGroup.level),
              ],
            ),
            pw.SizedBox(height: 16),
          ],
        ),
        footer: (context) => pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.center,
          children: [
            pw.Text(
              'Page ${context.pageNumber}/${context.pagesCount}',
              style: const pw.TextStyle(fontSize: 10),
            ),
          ],
        ),
        build: (context) {
          final sorted = List<Student>.from(students)
            ..sort((a, b) => a.lastName.compareTo(b.lastName));

          return [
            pw.Text(
              'Module : ____________________   Formateur : ____________________   Semaine du : ___/___ au ___/___',
              style: const pw.TextStyle(fontSize: 10),
            ),
            pw.SizedBox(height: 12),
            pw.Table(
              border: pw.TableBorder.all(width: 0.5),
              columnWidths: {
                0: const pw.FixedColumnWidth(25),
                1: const pw.FlexColumnWidth(2),
                2: const pw.FlexColumnWidth(1),
                3: const pw.FlexColumnWidth(1),
                4: const pw.FlexColumnWidth(1),
                5: const pw.FlexColumnWidth(1),
                6: const pw.FlexColumnWidth(1),
                7: const pw.FlexColumnWidth(1),
                8: const pw.FlexColumnWidth(1),
              },
              children: [
                // Header
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: PdfColors.grey200),
                  children: [
                    _headerCell('N°'),
                    _headerCell('Nom & Prénom'),
                    _headerCell('Dim'),
                    _headerCell('Lun'),
                    _headerCell('Mar'),
                    _headerCell('Mer'),
                    _headerCell('Jeu'),
                    _headerCell('Ven'),
                    _headerCell('Sam'),
                  ],
                ),
                // Data rows
                ...sorted.asMap().entries.map((entry) {
                  final i = entry.key;
                  final s = entry.value;
                  return pw.TableRow(
                    children: [
                      _dataCell('${i + 1}'),
                      _dataCell(s.fullName),
                      _dataCell(''), // Dim
                      _dataCell(''), // Lun
                      _dataCell(''), // Mar
                      _dataCell(''), // Mer
                      _dataCell(''), // Jeu
                      _dataCell(''), // Ven
                      _dataCell(''), // Sam
                    ],
                  );
                }),
              ],
            ),
          ];
        },
      ),
    );

    final bytes = await pdf.save();
    await Printing.sharePdf(
      bytes: bytes,
      filename: 'fiche_presence_${classGroup.name}_vierge.pdf',
    );
  }

  // ─── CSV: Attendance records ──────────────────────────────

  static void exportAttendanceCsv({
    required List<AttendanceRecord> records,
    required String className,
    required String date,
  }) {
    final rows = <List<String>>[
      ['N°', 'Nom', 'Prénom', 'Matricule', 'Statut', 'Heure'],
    ];

    final sorted = List<AttendanceRecord>.from(records)
      ..sort(
        (a, b) =>
            (a.student?.lastName ?? '').compareTo(b.student?.lastName ?? ''),
      );

    for (var i = 0; i < sorted.length; i++) {
      final r = sorted[i];
      rows.add([
        '${i + 1}',
        r.student?.lastName ?? '',
        r.student?.firstName ?? '',
        r.student?.matricule ?? '',
        _statusFr(r.status),
        '${r.markedAt.hour.toString().padLeft(2, '0')}:${r.markedAt.minute.toString().padLeft(2, '0')}',
      ]);
    }

    final csvString = const CsvEncoder().convert(rows);
    _downloadFile(csvString, 'presence_${className}_$date.csv', 'text/csv');
  }

  // ─── CSV: Student list ────────────────────────────────────

  static void exportStudentsCsv(List<Student> students) {
    final rows = <List<String>>[
      ['Matricule', 'Nom', 'Prénom', 'QR Code', 'Classes'],
    ];

    for (final s in students) {
      rows.add([
        s.matricule,
        s.lastName,
        s.firstName,
        s.qrCode ?? '',
        s.classes?.map((c) => c.name).join('; ') ?? '',
      ]);
    }

    final csvString = const CsvEncoder().convert(rows);
    _downloadFile(csvString, 'students_export.csv', 'text/csv');
  }

  // ─── CSV: Reports ─────────────────────────────────────────

  static void exportReportCsv({
    required List<Map<String, dynamic>> summaryRows,
    required String className,
    required String period,
  }) {
    final rows = <List<String>>[
      [
        'Nom',
        'Prénom',
        'Matricule',
        'Séances',
        'Présent',
        'Absent',
        'Retard',
        'Justifié',
        'Taux (%)',
      ],
    ];

    for (final r in summaryRows) {
      rows.add([
        r['last_name'] ?? '',
        r['first_name'] ?? '',
        r['matricule'] ?? '',
        '${r['total']}',
        '${r['present']}',
        '${r['absent']}',
        '${r['late']}',
        '${r['justified']}',
        '${r['rate']}',
      ]);
    }

    final csvString = const CsvEncoder().convert(rows);
    _downloadFile(csvString, 'rapport_${className}_$period.csv', 'text/csv');
  }

  static Future<void> exportReportPdf({
    required List<Map<String, dynamic>> summaryRows,
    required String className,
    required String period,
  }) async {
    final pdf = pw.Document();
    final logoImage = await _loadLogo();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4.portrait,
        margin: const pw.EdgeInsets.all(32),
        header: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Row(
                  children: [
                    if (logoImage != null)
                      pw.Container(
                        width: 40,
                        height: 40,
                        margin: const pw.EdgeInsets.only(right: 12),
                        child: pw.Image(logoImage),
                      ),
                    pw.Text(
                      'INSFP - Fiche Pédagogique (Rapport global)',
                      style: pw.TextStyle(
                        fontSize: 14,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                pw.Text(
                  'Date: $period',
                  style: const pw.TextStyle(fontSize: 10),
                ),
              ],
            ),
            pw.SizedBox(height: 12),
            pw.Row(children: [_infoChip('Classe', className)]),
            pw.SizedBox(height: 16),
            pw.Divider(),
            pw.SizedBox(height: 8),
          ],
        ),
        footer: (context) => pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.end,
          children: [
            pw.Text(
              'Page ${context.pageNumber}/${context.pagesCount}',
              style: const pw.TextStyle(fontSize: 10),
            ),
          ],
        ),
        build: (context) {
          final sortedRows = List<Map<String, dynamic>>.from(summaryRows)
            ..sort(
              (a, b) => (a['last_name'] as String).compareTo(
                b['last_name'] as String,
              ),
            );

          return [
            pw.TableHelper.fromTextArray(
              border: pw.TableBorder.all(width: 0.5),
              headerDecoration: const pw.BoxDecoration(
                color: PdfColors.grey200,
              ),
              headerHeight: 25,
              cellHeight: 20,
              cellAlignments: {
                0: pw.Alignment.centerLeft,
                1: pw.Alignment.center,
                2: pw.Alignment.center,
                3: pw.Alignment.center,
                4: pw.Alignment.center,
                5: pw.Alignment.center,
                6: pw.Alignment.center,
                7: pw.Alignment.center,
              },
              headers: [
                'Nom & Prenom',
                'Matricule',
                'Seances',
                'P',
                'A',
                'R',
                'J',
                'Taux',
              ],
              data: sortedRows
                  .map(
                    (r) => [
                      '${r['last_name']} ${r['first_name']}',
                      r['matricule'] ?? '',
                      '${r['total']}',
                      '${r['present']}',
                      '${r['absent']}',
                      '${r['late']}',
                      '${r['justified']}',
                      '${r['rate']}%',
                    ],
                  )
                  .toList(),
            ),
          ];
        },
      ),
    );

    final bytes = await pdf.save();
    // Utiliser le nom Fiche Pédagogique (rapport)
    await Printing.sharePdf(
      bytes: bytes,
      filename: 'fiche_pedagogique_${className}_$period.pdf',
    );
  }

  // ─── Private Helpers ──────────────────────────────────────

  static pw.Widget _infoChip(String label, String value) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: pw.BoxDecoration(
        border: pw.Border.all(width: 0.5),
        borderRadius: pw.BorderRadius.circular(4),
      ),
      child: pw.RichText(
        text: pw.TextSpan(
          children: [
            pw.TextSpan(
              text: '$label: ',
              style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10),
            ),
            pw.TextSpan(text: value, style: const pw.TextStyle(fontSize: 10)),
          ],
        ),
      ),
    );
  }

  static pw.Widget _headerCell(String text) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(6),
      child: pw.Text(
        text,
        style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9),
      ),
    );
  }

  static pw.Widget _dataCell(String text) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(6),
      child: pw.Text(text, style: const pw.TextStyle(fontSize: 9)),
    );
  }

  static pw.Widget _statusCell(String status) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(6),
      child: pw.Text(
        _statusFr(status),
        style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold),
      ),
    );
  }

  static pw.Widget _summaryRow(List<AttendanceRecord> records) {
    int p = 0, a = 0, r = 0, j = 0;
    for (final rec in records) {
      switch (rec.status) {
        case 'PRESENT':
          p++;
          break;
        case 'ABSENT':
          a++;
          break;
        case 'EN_RETARD':
          r++;
          break;
        case 'JUSTIFIE':
          j++;
          break;
      }
    }
    return pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.spaceEvenly,
      children: [
        pw.Text('Présents: $p', style: const pw.TextStyle(fontSize: 10)),
        pw.Text('Absents: $a', style: const pw.TextStyle(fontSize: 10)),
        pw.Text('Retards: $r', style: const pw.TextStyle(fontSize: 10)),
        pw.Text('Justifiés: $j', style: const pw.TextStyle(fontSize: 10)),
        pw.Text(
          'Total: ${records.length}',
          style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold),
        ),
      ],
    );
  }

  static String _statusFr(String status) {
    switch (status) {
      case 'PRESENT':
        return 'Présent';
      case 'ABSENT':
        return 'Absent';
      case 'EN_RETARD':
        return 'Retard';
      case 'JUSTIFIE':
        return 'Justifié';
      default:
        return status;
    }
  }

  static String _slotLabel(String slot) {
    switch (slot) {
      case 'SLOT_08_30':
        return '08:30';
      case 'SLOT_10_45':
        return '10:45';
      case 'SLOT_13_30':
        return '13:30';
      case 'SLOT_15_00':
        return '15:00';
      default:
        return slot;
    }
  }

  static void _downloadFile(String content, String filename, String mimeType) {
    if (kIsWeb) {
      downloadFileImpl(content, filename, mimeType);
    }
  }
}
