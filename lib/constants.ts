// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'entrada',
  EXPENSE: 'despesa',
} as const;

// Recurrence frequencies
export const RECURRENCE_FREQUENCIES = {
  DAILY: 'diaria',
  WEEKLY: 'semanal',
  MONTHLY: 'mensal',
  ANNUAL: 'anual',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

// Category keywords for OCR detection
export const CATEGORY_KEYWORDS = {
  alimentacao: ['mercado', 'supermercado', 'restaurante', 'padaria', 'lanchonete', 'ifood', 'mcdonald', 'burger king', 'pizza'],
  transporte: ['uber', '99', 'taxi', 'combustivel', 'gasolina', 'estacionamento', 'passagem', 'bus', 'metro'],
  saude: ['farmacia', 'drogaria', 'clinica', 'hospital', 'medico', 'dentista'],
  lazer: ['cinema', 'shopping', 'teatro', 'parque', 'jogo', 'game', 'streaming'],
  educacao: ['livraria', 'curso', 'faculdade', 'escola', 'livro', 'aula'],
  utilidades: ['agua', 'energia', 'telefone', 'internet', 'gas', 'conta'],
  outros: [],
} as const;

// Default category
export const DEFAULT_CATEGORY = 'outros';

// Amount patterns for receipt processing
export const AMOUNT_PATTERN = /R\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;

// API configuration
export const API_CONFIG = {
  REQUEST_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ssZ',
  DISPLAY: 'DD/MM/YYYY',
  MONTH: 'YYYY-MM',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER: 'poupa_user',
  PREFERENCES: 'poupa_preferences',
  THEME: 'poupa_theme',
} as const;

// Bcrypt configuration
export const BCRYPT_CONFIG = {
  ROUNDS: 10,
  ALGORITHM: 'bcrypt',
} as const;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: false,
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Campo obrigatório',
  INVALID_EMAIL: 'Email inválido',
  PASSWORD_TOO_SHORT: `Senha deve ter no mínimo ${PASSWORD_REQUIREMENTS.MIN_LENGTH} caracteres`,
  PASSWORD_NEEDS_UPPERCASE: 'Senha deve conter pelo menos uma letra maiúscula',
  PASSWORD_NEEDS_NUMBER: 'Senha deve conter pelo menos um número',
  PASSWORDS_DONT_MATCH: 'Senhas não conferem',
  INVALID_AMOUNT: 'Valor deve ser um número positivo',
  INVALID_CATEGORY: 'Categoria inválida',
  INVALID_DATE: 'Data inválida',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'Usuário não encontrado',
  INCORRECT_PASSWORD: 'Senha incorreta',
  EMAIL_ALREADY_EXISTS: 'Email já registrado',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Recurso não encontrado',
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  NETWORK_ERROR: 'Erro de conexão',
  VALIDATION_ERROR: 'Erro ao validar requisição',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
