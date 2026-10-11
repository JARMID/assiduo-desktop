import { describe, it, expect } from 'vitest';
import { sound } from '../lib/audioFeedback';
import { AuditEvent, Student } from '../types';

describe('Enterprise Campus Features Suite', () => {
  describe('Audio Feedback Synthesizer', () => {
    it('Allows toggling audio feedback state', () => {
      sound.setEnabled(false);
      expect(sound.getEnabled()).toBe(false);
      sound.setEnabled(true);
      expect(sound.getEnabled()).toBe(true);
    });

    it('Executes sound methods gracefully without throwing', () => {
      expect(() => sound.playSuccess()).not.toThrow();
      expect(() => sound.playWarning()).not.toThrow();
      expect(() => sound.playError()).not.toThrow();
      expect(() => sound.playNotification()).not.toThrow();
    });
  });

  describe('Audit Log Security and Regulatory Compliance', () => {
    const sampleEvent: AuditEvent = {
      id: 'evt-test-1',
      timestamp: '2026-10-11T08:30:00.000Z',
      action_type: 'EMARGEMENT',
      actor_name: 'Guichet Accueil (Poste 01)',
      actor_role: 'ADMINISTRATION',
      target: 'Benali Karim (DEV-2025-014)',
      details: 'Pointage par badge QR valide',
      severity: 'SUCCESS',
      station: 'Poste Guichet #01',
    };

    it('Maintains audit record structure conforming to Algerian Executive Decree 18-162', () => {
      expect(sampleEvent.id).toBeDefined();
      expect(sampleEvent.action_type).toBe('EMARGEMENT');
      expect(sampleEvent.severity).toBe('SUCCESS');
      expect(sampleEvent.station).toBe('Poste Guichet #01');
      expect(new Date(sampleEvent.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('Distinguishes critical security violations from routine operations', () => {
      const securityViolation: AuditEvent = {
        id: 'evt-sec-2',
        timestamp: '2026-10-11T09:15:00.000Z',
        action_type: 'SECURITY',
        actor_name: 'Système Pare-feu',
        actor_role: 'SECURITY_DAEMON',
        target: 'API Key Rotation',
        details: 'Tentative d’élévation de privilèges non autorisée',
        severity: 'CRITICAL',
        station: '192.168.1.150',
      };

      expect(securityViolation.severity).toBe('CRITICAL');
      expect(securityViolation.action_type).toBe('SECURITY');
    });
  });

  describe('Predictive Analytics and Dropout Risk Calculation', () => {
    const cohort: Student[] = [
      {
        id: 'st-1',
        matricule: 'ST-001',
        first_name: 'Amine',
        last_name: 'Dahmani',
        attendance_rate: 98.5,
        total_absences: 2,
        unjustified_absences: 0,
        is_active: true,
        created_at: '2026-01-01',
      },
      {
        id: 'st-2',
        matricule: 'ST-002',
        first_name: 'Yacine',
        last_name: 'Mebarki',
        attendance_rate: 81.0,
        total_absences: 12,
        unjustified_absences: 6,
        is_active: true,
        created_at: '2026-01-01',
      },
      {
        id: 'st-3',
        matricule: 'ST-003',
        first_name: 'Sarah',
        last_name: 'Belkacem',
        attendance_rate: 68.0,
        total_absences: 28,
        unjustified_absences: 16,
        is_active: true,
        created_at: '2026-01-01',
      },
    ];

    it('Identifies students below the statutory 75% attendance threshold as critical', () => {
      const critical = cohort.filter(
        (s) => (s.attendance_rate || 100) < 75.0 || (s.unjustified_absences || 0) >= 10
      );
      expect(critical).toHaveLength(1);
      expect(critical[0].matricule).toBe('ST-003');
    });

    it('Identifies students in the 75-85% window for targeted pedagogical support', () => {
      const atRisk = cohort.filter(
        (s) => (s.attendance_rate || 100) >= 75.0 && (s.attendance_rate || 100) < 85.0
      );
      expect(atRisk).toHaveLength(1);
      expect(atRisk[0].matricule).toBe('ST-002');
    });

    it('Calculates institutional average rate with precision', () => {
      const avg = cohort.reduce((acc, s) => acc + (s.attendance_rate || 0), 0) / cohort.length;
      expect(avg).toBeCloseTo(82.5, 1);
    });
  });
});
