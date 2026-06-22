import crypto from 'crypto';

/**
 * Validate CPF format and algorithm
 * Reference: https://www.gov.br/servicos/pt-br/cidadao/imposto-de-renda
 */
export function validateCPF(cpf: string): boolean {
  // Remove formatting
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check length
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Calculate first check digit
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return false;
  }

  // Calculate second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Hash CPF for secure storage (SHA-256)
 */
export function hashCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return crypto.createHash('sha256').update(cleanCPF).digest('hex');
}

/**
 * Format CPF to display format (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) {
    return cpf;
  }
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Get last 4 digits of CPF for display (for authorized users only)
 */
export function getCPFLastDigits(cpfHash: string): string {
  // This would require storing the last 4 digits separately if we want to display them
  // For now, return masked format
  return '***-**';
}

/**
 * Mask CPF for display
 */
export function maskCPF(cpf: string): string {
  const formatted = formatCPF(cpf);
  return formatted.substring(0, 3) + '.***.' + formatted.substring(9);
}
