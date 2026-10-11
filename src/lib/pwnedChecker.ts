/**
 * HaveIBeenPwned k-Anonymity Leak Verification
 * Implements SHA-1 partial hash prefix range matching without transmitting user password.
 */

export async function checkPwnedPassword(password: string): Promise<boolean> {
  if (!password) return false;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

    if (!response.ok) {
      console.warn('Pwned password verification unreachable', response.status);
      return false;
    }

    const text = await response.text();
    const lines = text.split('\n');
    for (const line of lines) {
      const [returnedSuffix] = line.split(':');
      if (returnedSuffix.trim() === suffix) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error verifying pwned password:', error);
    return false;
  }
}
