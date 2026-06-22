import { createHash } from 'crypto';

export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(digits[i - 1], 10) * (11 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9], 10)) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(digits[i - 1], 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10], 10)) return false;
  
  return true;
}

export function hashCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return createHash('sha256').update(digits).digest('hex');
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.substring(0, 9).replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3') + '-**';
}
