import { z } from 'zod';
import { VALIDATION_MESSAGES, PASSWORD_REQUIREMENTS, TRANSACTION_TYPES } from './constants';

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL),
  password: z.string()
    .min(PASSWORD_REQUIREMENTS.MIN_LENGTH, VALIDATION_MESSAGES.PASSWORD_TOO_SHORT)
    .regex(/[A-Z]/, VALIDATION_MESSAGES.PASSWORD_NEEDS_UPPERCASE)
    .regex(/[0-9]/, VALIDATION_MESSAGES.PASSWORD_NEEDS_NUMBER),
  name: z.string().min(2, VALIDATION_MESSAGES.REQUIRED),
});

export const signInSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL),
  password: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  newPassword: z.string()
    .min(PASSWORD_REQUIREMENTS.MIN_LENGTH, VALIDATION_MESSAGES.PASSWORD_TOO_SHORT)
    .regex(/[A-Z]/, VALIDATION_MESSAGES.PASSWORD_NEEDS_UPPERCASE)
    .regex(/[0-9]/, VALIDATION_MESSAGES.PASSWORD_NEEDS_NUMBER),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH,
  path: ['confirmPassword'],
});

// Transaction schemas
export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().datetime(),
  type: z.enum(['entrada', 'despesa']),
  notes: z.string().optional(),
});

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hexadecimal válido'),
});

// Budget schemas
export const budgetSchema = z.object({
  category: z.string().min(1, 'Categoria é obrigatória'),
  limit: z.number().positive('Limite deve ser positivo'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Mês deve estar no formato YYYY-MM'),
});

// Receipt processing schemas
export const processReceiptSchema = z.object({
  image: z.string().min(1, 'Imagem é obrigatória'),
});

// Recurring transaction schemas
export const recurringTransactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  frequency: z.enum(['diaria', 'semanal', 'mensal', 'anual']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['entrada', 'despesa']),
  notes: z.string().optional(),
});

// Notification schemas
export const notificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  type: z.enum(['info', 'warning', 'error', 'success']),
  userId: z.string().uuid(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>;
