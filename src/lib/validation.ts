import { z } from 'zod';

// Phone validation - Brazilian format
const phoneRegex = /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/;

// Only letters, numbers, and common punctuation
const safeTextRegex = /^[a-zA-ZÀ-ÿ0-9\s\-.,!?()]+$/;

// Service validation schema
export const serviceSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(safeTextRegex, "Nome contém caracteres inválidos"),
  
  description: z.string()
    .trim()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal('')),
  
  duration: z.number()
    .int("Duração deve ser um número inteiro")
    .min(15, "Duração mínima: 15 minutos")
    .max(480, "Duração máxima: 8 horas (480 minutos)"),
  
  price: z.number()
    .min(0, "Preço deve ser positivo")
    .max(100000, "Preço máximo: R$ 100.000"),
  
  professionalIds: z.array(z.string())
    .min(1, "Selecione pelo menos um profissional"),
  
  isActive: z.boolean()
});

// Professional validation schema
export const professionalSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(safeTextRegex, "Nome contém caracteres inválidos"),
  
  email: z.string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .trim()
    .regex(phoneRegex, "Telefone inválido. Use o formato: (11) 99999-9999")
    .optional()
    .or(z.literal('')),
  
  workingDays: z.array(z.string()),
  
  startTime: z.string()
    .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido")
    .optional()
    .or(z.literal('')),
  
  endTime: z.string()
    .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido")
    .optional()
    .or(z.literal('')),
  
  isActive: z.boolean(),
  
  photoUrl: z.string().nullable()
});

// Salon validation schema
export const salonSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(safeTextRegex, "Nome contém caracteres inválidos"),
  
  description: z.string()
    .trim()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .trim()
    .min(10, "Endereço deve ter no mínimo 10 caracteres")
    .max(500, "Endereço deve ter no máximo 500 caracteres"),
  
  phone: z.string()
    .trim()
    .regex(phoneRegex, "Telefone inválido. Use o formato: (11) 99999-9999"),
  
  workingDays: z.array(z.string())
    .min(1, "Selecione pelo menos um dia de funcionamento"),
  
  openTime: z.string()
    .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido")
    .optional()
    .or(z.literal('')),
  
  closeTime: z.string()
    .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de horário inválido")
    .optional()
    .or(z.literal('')),
  
  whatsappCustomText: z.string()
    .max(1000, "Texto deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal('')),
  
  evadedClientsReminderText: z.string()
    .max(1000, "Texto deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal('')),
  
  instagram: z.string()
    .trim()
    .max(100, "Link muito longo")
    .optional()
    .or(z.literal('')),
  
  facebook: z.string()
    .trim()
    .max(100, "Link muito longo")
    .optional()
    .or(z.literal('')),
  
  youtube: z.string()
    .trim()
    .max(100, "Link muito longo")
    .optional()
    .or(z.literal('')),
  
  tiktok: z.string()
    .trim()
    .max(100, "Link muito longo")
    .optional()
    .or(z.literal(''))
});

// Client validation schema
export const clientSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(safeTextRegex, "Nome contém caracteres inválidos"),
  
  phone: z.string()
    .trim()
    .regex(phoneRegex, "Telefone inválido. Use o formato: (11) 99999-9999"),
  
  email: z.string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .optional()
    .or(z.literal(''))
});

// Message validation schema
export const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(10, "Mensagem deve ter no mínimo 10 caracteres")
    .max(1000, "Mensagem deve ter no máximo 1000 caracteres"),
  
  method: z.enum(['sms', 'whatsapp', 'both']),
  
  clientIds: z.array(z.string())
    .min(1, "Selecione pelo menos um cliente")
});

// Login validation schema
export const loginSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Usuário deve ter no mínimo 3 caracteres")
    .max(50, "Usuário deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Usuário contém caracteres inválidos"),
  
  password: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
});

// Settings validation schema
export const settingsSchema = z.object({
  confirmationEnabled: z.boolean(),
  
  confirmationMessage: z.string()
    .trim()
    .max(500, "Mensagem deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal('')),
  
  reminderEnabled: z.boolean(),
  
  reminderHours: z.number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo: 1 hora")
    .max(168, "Máximo: 168 horas (7 dias)")
    .optional()
});

// Holiday validation schema
export const holidaySchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(safeTextRegex, "Nome contém caracteres inválidos"),
  
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida. Use o formato: YYYY-MM-DD")
});

/**
 * Helper function to handle validation errors
 * @param error - Zod validation error
 * @returns User-friendly error message
 */
export const getValidationErrorMessage = (error: z.ZodError): string => {
  if (error.errors.length > 0) {
    return error.errors[0].message;
  }
  return "Dados inválidos. Verifique os campos e tente novamente.";
};

/**
 * Sanitize HTML to prevent XSS attacks
 * IMPORTANTE: Esta é uma sanitização básica.
 * Para produção, use DOMPurify: npm install dompurify
 * 
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML
 */
export const sanitizeHTML = (html: string): string => {
  // Remove script tags
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous event handlers
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  // Remove iframe, object, embed tags
  cleaned = cleaned.replace(/<(iframe|object|embed|applet)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  return cleaned;
};

/**
 * Validate file upload
 * @param file - File to validate
 * @param options - Validation options
 */
export const validateFileUpload = (
  file: File | null,
  options: {
    maxSize?: number; // in bytes, default 5MB
    allowedTypes?: string[]; // default: images only
  } = {}
): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: "Nenhum arquivo selecionado" };
  }

  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};
