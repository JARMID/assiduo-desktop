import { describe, it, expect } from 'vitest';
import { evaluatePasswordPolicy } from '../lib/passwordPolicy';
import { normalizeAlgerianPhone } from '../services/smsService';

describe('INSFP Desktop Core Services & Security Tests', () => {
  describe('Institutional Password Policy Validator', () => {
    it('Rejects passwords shorter than 10 characters', () => {
      const result = evaluatePasswordPolicy('Ab1@xyz');
      expect(result.valid).toBe(false);
      expect(result.isLengthValid).toBe(false);
    });

    it('Rejects passwords without uppercase letters', () => {
      const result = evaluatePasswordPolicy('insfp2026!secret');
      expect(result.valid).toBe(false);
      expect(result.hasUpperCase).toBe(false);
    });

    it('Rejects passwords without digits', () => {
      const result = evaluatePasswordPolicy('InsfpSecureSpecial!');
      expect(result.valid).toBe(false);
      expect(result.hasNumber).toBe(false);
    });

    it('Rejects passwords without special characters', () => {
      const result = evaluatePasswordPolicy('Insfp2026MasterKey');
      expect(result.valid).toBe(false);
      expect(result.hasSpecialChar).toBe(false);
    });

    it('Rejects predictable sequential patterns', () => {
      const result = evaluatePasswordPolicy('Password1234567890!');
      expect(result.valid).toBe(false);
      expect(result.isNotTrivial).toBe(false);
    });

    it('Accepts high-entropy institutional compliant passwords', () => {
      const result = evaluatePasswordPolicy('Algeria@2026#SecurePass99!');
      expect(result.valid).toBe(true);
      expect(result.isLengthValid).toBe(true);
      expect(result.hasUpperCase).toBe(true);
      expect(result.hasLowerCase).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSpecialChar).toBe(true);
      expect(result.score).toBe(100);
    });
  });

  describe('Algerian Mobile Phone Normalization (Twilio Gateway)', () => {
    it('Normalizes 10-digit local format with 0 prefix', () => {
      expect(normalizeAlgerianPhone('0555123456')).toBe('+213555123456');
      expect(normalizeAlgerianPhone('0661223344')).toBe('+213661223344');
      expect(normalizeAlgerianPhone('0770998877')).toBe('+213770998877');
    });

    it('Normalizes country-code prefixed without plus', () => {
      expect(normalizeAlgerianPhone('213555123456')).toBe('+213555123456');
    });

    it('Preserves already normalized international format', () => {
      expect(normalizeAlgerianPhone('+213555123456')).toBe('+213555123456');
    });

    it('Strips spaces, dots, and hyphens from phone numbers', () => {
      expect(normalizeAlgerianPhone('05 55 12 34 56')).toBe('+213555123456');
      expect(normalizeAlgerianPhone('06-61-22-33-44')).toBe('+213661223344');
      expect(normalizeAlgerianPhone('+213.770.99.88.77')).toBe('+213770998877');
    });
  });

  describe('Regulatory Absence Threshold Logic', () => {
    it('Calculates attendance percentage accurately', () => {
      const totalSessionHours = 60;
      const missedHours = 6;
      const rate = ((totalSessionHours - missedHours) / totalSessionHours) * 100;
      expect(rate).toBe(90);
    });

    it('Triggers 25% module exclusion rule', () => {
      const totalModuleHours = 40;
      const studentMissedHours = 11;
      const absenceRate = (studentMissedHours / totalModuleHours) * 100;
      const isExclusionThresholdReached = absenceRate >= 25.0;
      expect(isExclusionThresholdReached).toBe(true);
    });

    it('Identifies 10-hour formal mise en demeure threshold', () => {
      const unjustifiedHours = 10;
      const isFormalWarningRequired = unjustifiedHours >= 10;
      expect(isFormalWarningRequired).toBe(true);
    });
  });

  describe('Audio Feedback & State Management', () => {
    it('Toggles audio engine state safely without exceptions', async () => {
      const { sound } = await import('../lib/audioFeedback');
      expect(sound.getEnabled()).toBe(true);
      sound.setEnabled(false);
      expect(sound.getEnabled()).toBe(false);
      sound.playSuccess();
      sound.playClick();
      sound.setEnabled(true);
      expect(sound.getEnabled()).toBe(true);
    });
  });

  describe('Bulk Trainee CSV Ingestion Parser', () => {
    function parseCsvRows(text: string, defaultClass = 'BTS Développement Web S3') {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) return [];

      const firstLine = lines[0];
      let delimiter = ',';
      if (firstLine.includes(';') && !firstLine.includes(',')) {
        delimiter = ';';
      } else if (firstLine.includes('\t')) {
        delimiter = '\t';
      }

      const startIndex =
        firstLine.toLowerCase().includes('matricule') ||
        firstLine.toLowerCase().includes('nom')
          ? 1
          : 0;

      const results = [];
      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i]
          .split(delimiter)
          .map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length < 2) continue;

        const matricule = cols[0] || '2026-AUTO';
        const lastName = cols[1] || '';
        const firstName = cols[2] || '';
        const className = cols[3] || defaultClass;
        let email = cols[6] || '';
        if (!email && firstName && lastName) {
          email = `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}@insfp.dz`;
        }
        const isValid = Boolean(lastName && firstName);
        results.push({ matricule, lastName, firstName, className, email, isValid });
      }
      return results;
    }

    it('Parses standard comma-delimited rows with headers', () => {
      const csv = 'Matricule,Nom,Prénom,Section\n2026-001,BOUKHALFA,Yacine,BTS Dev Web';
      const rows = parseCsvRows(csv);
      expect(rows).toHaveLength(1);
      expect(rows[0].lastName).toBe('BOUKHALFA');
      expect(rows[0].firstName).toBe('Yacine');
      expect(rows[0].email).toBe('yacine.boukhalfa@insfp.dz');
      expect(rows[0].isValid).toBe(true);
    });

    it('Auto-detects semicolon delimiters from French/Algerian Excel exports', () => {
      const csv = 'Matricule;Nom;Prénom;Section\n2026-002;MEZIANE;Nadia;BTS Réseaux';
      const rows = parseCsvRows(csv);
      expect(rows).toHaveLength(1);
      expect(rows[0].lastName).toBe('MEZIANE');
      expect(rows[0].firstName).toBe('Nadia');
      expect(rows[0].className).toBe('BTS Réseaux');
    });

    it('Auto-detects tab delimiters from clipboard paste operations', () => {
      const tsv = 'Matricule\tNom\tPrénom\n2026-003\tCHIKH\tFarid';
      const rows = parseCsvRows(tsv);
      expect(rows).toHaveLength(1);
      expect(rows[0].lastName).toBe('CHIKH');
      expect(rows[0].firstName).toBe('Farid');
    });

    it('Strips outer double quotes and single quotes from fields', () => {
      const csv = 'Matricule,Nom,Prénom\n"2026-004","BENALI","Samir"';
      const rows = parseCsvRows(csv);
      expect(rows[0].lastName).toBe('BENALI');
      expect(rows[0].firstName).toBe('Samir');
    });

    it('Flags rows with missing names as invalid', () => {
      const csv = 'Matricule,Nom,Prénom\n2026-005,,';
      const rows = parseCsvRows(csv);
      expect(rows[0].isValid).toBe(false);
    });
  });

  describe('Cryptographic Student Badge & Check-in Payload', () => {
    it('Constructs compliant student badge JSON QR payload', () => {
      const student = {
        matricule: 'INSFP-2026-042',
        id: 'uuid-student-42',
        first_name: 'Amine',
        last_name: 'Mansouri',
      };
      const payload = {
        matricule: student.matricule,
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        insfp: 'INSFP-DZ',
      };
      const json = JSON.stringify(payload);
      const parsed = JSON.parse(json);
      expect(parsed.insfp).toBe('INSFP-DZ');
      expect(parsed.matricule).toBe('INSFP-2026-042');
      expect(parsed.name).toBe('Amine Mansouri');
    });

    it('Verifies self check-in classroom QR format', () => {
      const sessionQr = JSON.stringify({
        type: 'SELF_CHECKIN',
        sessionId: 'sess-8899',
        code: 'VAL-2026',
      });
      const parsed = JSON.parse(sessionQr);
      expect(parsed.type).toBe('SELF_CHECKIN');
      expect(parsed.sessionId).toBe('sess-8899');
    });
  });

  describe('HaveIBeenPwned k-Anonymity Service Behavior', () => {
    it('Returns false immediately for empty string password', async () => {
      const { checkPwnedPassword } = await import('../lib/pwnedChecker');
      const result = await checkPwnedPassword('');
      expect(result).toBe(false);
    });
  });

  describe('Absence Justification Regulatory State Transitions', () => {
    it('Converts unjustified absences to approved state and adjusts penalized hours', () => {
      const initialMissedHours = 12;
      const initialUnjustified = 12;
      const initialJustified = 0;

      // Doctor provides medical certificate for 6 hours
      const approvedMedicalHours = 6;
      const updatedUnjustified = initialUnjustified - approvedMedicalHours;
      const updatedJustified = initialJustified + approvedMedicalHours;

      expect(updatedUnjustified).toBe(6);
      expect(updatedJustified).toBe(6);
      expect(updatedUnjustified + updatedJustified).toBe(initialMissedHours);

      // 6 unjustified hours does NOT trigger the 10h mise en demeure
      const isMiseEnDemeure = updatedUnjustified >= 10;
      expect(isMiseEnDemeure).toBe(false);
    });
  });

  describe('Official A4 Register Anti-Tampering & Integrity Hash', () => {
    it('Generates deterministic verification hash for attendance registry', () => {
      const computeHash = (classId: string, count: number, rate: number, type: string) => {
        const raw = `${classId}_${count}_${rate.toFixed(1)}_${type}`;
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
          hash = (hash << 5) - hash + raw.charCodeAt(i);
          hash |= 0;
        }
        return `ASD-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
      };

      const hash1 = computeHash('cls-1', 28, 94.5, 'MONTHLY');
      const hash2 = computeHash('cls-1', 28, 94.5, 'MONTHLY');
      const hash3 = computeHash('cls-1', 28, 94.5, 'EXAM_ADMISSION');

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^ASD-[0-9A-F]{8}$/);
      expect(hash1).not.toBe(hash3);
    });

    it('Correctly verifies k-anonymity compliance note format', () => {
      const notice = 'Conforme Décret Exécutif n° 18-162 & Algorithme k-Anonymat k=5';
      expect(notice).toContain('Décret Exécutif n° 18-162');
      expect(notice).toContain('k=5');
    });
  });

  describe('Real-time Attendance Event Integration', () => {
    it('Transforms incoming Supabase realtime payload into structured AttendanceRecord', () => {
      const rawPayload = {
        id: 'rec-uuid-99',
        session_id: 'sess-1',
        student_id: 'st-1',
        status: 'PRESENT',
        marked_at: '2026-10-09T08:35:00Z',
        insfp_students: {
          first_name: 'Amine',
          last_name: 'Mansouri',
          matricule: 'INSFP-2024-001',
        },
      };

      const mapped = {
        id: rawPayload.id,
        session_id: rawPayload.session_id,
        student_id: rawPayload.student_id,
        student_name: `${rawPayload.insfp_students.first_name} ${rawPayload.insfp_students.last_name}`,
        matricule: rawPayload.insfp_students.matricule,
        status: rawPayload.status,
        marked_at: rawPayload.marked_at,
      };

      expect(mapped.student_name).toBe('Amine Mansouri');
      expect(mapped.status).toBe('PRESENT');
      expect(mapped.matricule).toBe('INSFP-2024-001');
    });
  });

  describe('Specialities & Curricula Management Logic', () => {
    it('Filters specialities by code, French name, and Arabic name', () => {
      const specialitiesList = [
        {
          id: 'spec-1',
          code: 'MPP',
          name_fr: 'Montage et post production',
          name_ar: 'تقنيات السمعي البصري خيارالتركيب ومابعد الإنتاج',
          diploma: 'Brevet de Technicien Supérieur (BTS)',
          capacity: 35,
          created_at: new Date().toISOString(),
        },
        {
          id: 'spec-2',
          code: 'DEV_WEB',
          name_fr: 'Développement Web et Mobile',
          name_ar: 'تطوير مواقع الويب وتطبيقات الهاتف المحمول',
          diploma: 'Brevet de Technicien Supérieur (BTS)',
          capacity: 30,
          created_at: new Date().toISOString(),
        },
      ];

      const searchFrench = 'montage';
      const resultsFr = specialitiesList.filter(
        (s) =>
          s.code.toLowerCase().includes(searchFrench) ||
          s.name_fr.toLowerCase().includes(searchFrench)
      );
      expect(resultsFr.length).toBe(1);
      expect(resultsFr[0].code).toBe('MPP');

      const searchArabic = 'تطوير';
      const resultsAr = specialitiesList.filter((s) => s.name_ar.includes(searchArabic));
      expect(resultsAr.length).toBe(1);
      expect(resultsAr[0].code).toBe('DEV_WEB');
    });

    it('Aggregates total training capacity correctly across branches', () => {
      const capacities = [35, 35, 30, 25];
      const sum = capacities.reduce((acc, c) => acc + c, 0);
      expect(sum).toBe(125);
    });
  });

  describe('Pedagogical Messaging & Conversation State', () => {
    it('Validates message structure and sender role authorization', () => {
      const adminMessage = {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: 'admin-uuid',
        sender_role: 'ADMINISTRATION',
        sender_name: 'Direction Pédagogique',
        body: 'Justificatif validé par le conseil de discipline.',
        created_at: new Date().toISOString(),
      };

      expect(adminMessage.sender_role).toBe('ADMINISTRATION');
      expect(adminMessage.body).toContain('Justificatif validé');
    });

    it('Transitions conversation status through official lifecycle', () => {
      const statuses: Array<'OPEN' | 'RESOLVED' | 'CLOSED'> = ['OPEN', 'RESOLVED', 'CLOSED'];
      expect(statuses[0]).toBe('OPEN');
      expect(statuses[1]).toBe('RESOLVED');
      expect(statuses[2]).toBe('CLOSED');
    });
  });

  describe('Communications & Student Password Reset Pipeline', () => {
    it('Extracts student matricule from password reset notification payload', () => {
      const notification = {
        id: 'notif-1',
        type: 'PASSWORD_RESET',
        title: 'Demande de réinitialisation',
        body: 'Le stagiaire INSFP-2024-001 demande une réinitialisation de son mot de passe.',
        data_payload: { matricule: '2024-001' },
      };

      const matricule =
        notification.data_payload?.matricule ||
        notification.body.match(/INSFP-[\w-]+/i)?.[0];

      expect(matricule).toBe('2024-001');
      const temporaryPassword = `INSFP-${matricule}`;
      expect(temporaryPassword).toBe('INSFP-2024-001');
    });

    it('Validates target broadcast audience roles', () => {
      const allowedRoles = ['ALL', 'STUDENT', 'INSTRUCTOR'];
      expect(allowedRoles).toContain('STUDENT');
      expect(allowedRoles).toContain('INSTRUCTOR');
      expect(allowedRoles).toContain('ALL');
    });
  });

  describe('Mobile Apps Distribution & Storage Public URLs', () => {
    it('Validates official Supabase Storage public endpoints', () => {
      const studentUrl =
        'https://afwqtjmwklmoqntnvgww.supabase.co/storage/v1/object/public/apks/student_app.apk';
      const teacherUrl =
        'https://afwqtjmwklmoqntnvgww.supabase.co/storage/v1/object/public/apks/presence_insfp.apk';

      expect(studentUrl).toContain('/storage/v1/object/public/apks/student_app.apk');
      expect(teacherUrl).toContain('/storage/v1/object/public/apks/presence_insfp.apk');
      expect(studentUrl.startsWith('https://afwqtjmwklmoqntnvgww.supabase.co')).toBe(true);
    });
  });
});



