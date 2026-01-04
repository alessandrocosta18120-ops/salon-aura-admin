// Input mask utilities for Brazilian formats

export const phoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '').substring(0, 11);
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (match, p1, p2, p3) => {
      if (p3) return `(${p1}) ${p2}-${p3}`;
      if (p2) return `(${p1}) ${p2}`;
      if (p1) return `(${p1}`;
      return '';
    });
  }
  return numbers.replace(/(\d{2})(\d{0,5})(\d{0,4})/, (match, p1, p2, p3) => {
    if (p3) return `(${p1}) ${p2}-${p3}`;
    if (p2) return `(${p1}) ${p2}`;
    if (p1) return `(${p1}`;
    return '';
  });
};

export const cpfMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '').substring(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const cnpjMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '').substring(0, 14);
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

export const currencyMask = (value: string | number): string => {
  // Se for número, formata diretamente
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }
  
  // Limpa a string mantendo apenas dígitos, vírgula e ponto
  const cleanValue = value.replace(/[^\d.,]/g, '');
  
  // Se tiver vírgula ou ponto, trata como valor decimal já formatado
  if (cleanValue.includes(',') || cleanValue.includes('.')) {
    const normalizedValue = cleanValue.replace(/\./g, '').replace(',', '.');
    const numberValue = parseFloat(normalizedValue) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numberValue);
  }
  
  // Se só tiver dígitos, trata como valor em reais inteiros (35 = R$ 35,00)
  const digitsOnly = cleanValue.replace(/\D/g, '');
  const numberValue = parseInt(digitsOnly, 10) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numberValue);
};

export const formatCurrency = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return parseFloat(numbers) / 100;
};

export const emailValidation = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const bankAccountMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '').substring(0, 13);
  return numbers.replace(/(\d)(\d{1})$/, '$1-$2');
};

export const bankAgencyMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '').substring(0, 5);
  return numbers.replace(/(\d)(\d{1})$/, '$1-$2');
};
