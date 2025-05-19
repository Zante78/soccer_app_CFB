```typescript
export function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  
  // Ensure at least one of each required character type
  password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  password += getRandomChar('abcdefghijklmnopqrstuvwxyz');
  password += getRandomChar('0123456789');
  password += getRandomChar('!@#$%^&*()_+');

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function getRandomChar(charset: string): string {
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Passwort muss mindestens 8 Zeichen lang sein' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Passwort muss mindestens einen Großbuchstaben enthalten' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Passwort muss mindestens einen Kleinbuchstaben enthalten' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Passwort muss mindestens eine Zahl enthalten' };
  }
  
  if (!/[!@#$%^&*()_+]/.test(password)) {
    return { valid: false, message: 'Passwort muss mindestens ein Sonderzeichen enthalten' };
  }
  
  return { valid: true };
}
```