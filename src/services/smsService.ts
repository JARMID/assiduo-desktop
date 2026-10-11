/**
 * Twilio SMS Gateway Service for INSFP Administrative Portal
 * Dispatches absence alerts, urgent parent notices, and formal convocations.
 */

export interface TwilioSMSResult {
  success: boolean;
  sid?: string;
  error?: string;
}

const TWILIO_ACCOUNT_SID = 'AC0ceb35fa7864f0928281ae3f84d46d52';
const TWILIO_AUTH_TOKEN = 'c90e3728b1c8698e02ff1d53e635d981';
const TWILIO_PHONE_NUMBER = '+16415005159';

export function normalizeAlgerianPhone(phone: string): string {
  let cleaned = phone.trim().replace(/[\s.-]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) {
      cleaned = `+213${cleaned.slice(1)}`;
    } else if (cleaned.startsWith('213')) {
      cleaned = `+${cleaned}`;
    } else {
      cleaned = `+213${cleaned}`;
    }
  }
  return cleaned;
}

export async function sendTwilioSMS(
  toPhoneNumber: string,
  messageBody: string
): Promise<TwilioSMSResult> {
  const formattedPhone = normalizeAlgerianPhone(toPhoneNumber);

  try {
    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const formData = new URLSearchParams();
    formData.append('To', formattedPhone);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Body', messageBody);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio SMS Error:', data);
      return {
        success: false,
        error: data.message || `Erreur d'envoi Twilio (Statut: ${response.status})`,
      };
    }

    return {
      success: true,
      sid: data.sid,
    };
  } catch (err: any) {
    console.error('Twilio SMS Exception:', err);
    return {
      success: false,
      error: err.message || "Échec de connexion au service d'envoi SMS",
    };
  }
}

export async function sendAbsenceAlertSMS(
  toPhoneNumber: string,
  studentName: string,
  alertType:
    | 'WARNING_3_DAYS'
    | 'CRITICAL_10_DAYS'
    | 'EXCLUSION_THRESHOLD'
    | 'FORMAL_WARNING_10H'
    | 'MODULE_EXCLUSION_25PCT'
    | string
): Promise<TwilioSMSResult> {
  let message = '';
  switch (alertType) {
    case 'WARNING_3_DAYS':
      message = `INSFP Ouled Fayet: Avis urgent. Le stagiaire ${studentName} cumule 3 jours d'absence non justifiee. Veuillez contacter le service scolarite.`;
      break;
    case 'CRITICAL_10_DAYS':
    case 'FORMAL_WARNING_10H':
      message = `INSFP Ouled Fayet: Mise en demeure. Le stagiaire ${studentName} a atteint 10 heures d'absence sans justificatif. Risque de sanctions disciplinaires.`;
      break;
    case 'EXCLUSION_THRESHOLD':
    case 'MODULE_EXCLUSION_25PCT':
      message = `INSFP Ouled Fayet: Alerte critique. Le stagiaire ${studentName} depasse le seuil reglementaire de 25% d'absence. Convocation immediate requise.`;
      break;
    default:
      message = `INSFP Ouled Fayet: Notification d'absence pour le stagiaire ${studentName}. Veuillez contacter le service scolarite.`;
      break;
  }
  return sendTwilioSMS(toPhoneNumber, message);
}
