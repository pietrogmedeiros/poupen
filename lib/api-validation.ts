import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export function validateRequest<T>(
  schema: z.ZodSchema,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { _general: ['Erro ao validar requisição'] },
    };
  }
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function extractUserIdFromRequest(req: NextRequest): string | null {
  // Try to get from header first
  const userId = req.headers.get('x-user-id');
  return userId;
}

export function validateUserIdHeader(req: NextRequest): ValidationResult<string> {
  const userId = extractUserIdFromRequest(req);
  
  if (!userId) {
    return {
      success: false,
      errors: { userId: ['User ID não fornecido no header x-user-id'] },
    };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return {
      success: false,
      errors: { userId: ['User ID inválido'] },
    };
  }

  return { success: true, data: userId };
}
