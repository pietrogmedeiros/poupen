import { NextRequest, NextResponse } from 'next/server';
import { processReceiptSchema } from '@/lib/schemas';
import { validateRequest, errorResponse, successResponse } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = validateRequest(processReceiptSchema, body);
    if (!validation.success) {
      return errorResponse('Imagem inválida ou não fornecida', 400);
    }

    const { image } = validation.data!;

    // Usar Google Cloud Vision API como fallback
    // Se não tiver API key, retornar erro que será tratado no frontend
    const apiKey = process.env.GOOGLE_VISION_API_KEY;

    if (!apiKey) {
      // Se não tiver API key, retornar sucesso vazio para permitir entrada manual
      return NextResponse.json({
        success: true,
        data: {
          text: '',
          amount: null,
          category: 'outros',
        },
      });
    }

    try {
      // Enviar imagem para Google Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: image.replace(/^data:image\/[a-z]+;base64,/, ''),
                },
                features: [{ type: 'TEXT_DETECTION' }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!data.responses?.[0]?.fullTextAnnotation?.text) {
        // Se não conseguir extrair texto, retornar vazio
        return NextResponse.json({
          success: true,
          data: {
            text: '',
            amount: null,
            category: 'outros',
          },
        });
      }

      const text = data.responses[0].fullTextAnnotation.text;

      // Extrair valor (procura por padrões de valor monetário)
      const valuePattern = /R\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;
      const values = text.match(valuePattern);

      // Extrair possíveis categorias (palavras-chave)
      const categories = {
        alimentacao: ['mercado', 'supermercado', 'restaurante', 'padaria', 'lanchonete', 'ifood', 'mcdonald', 'burger king', 'pizza'],
        transporte: ['uber', '99', 'taxi', 'combustivel', 'gasolina', 'estacionamento', 'passagem', 'bus', 'metro'],
        saude: ['farmacia', 'drogaria', 'clinica', 'hospital', 'medico', 'dentista'],
        lazer: ['cinema', 'shopping', 'teatro', 'parque', 'jogo', 'game', 'streaming'],
        educacao: ['livraria', 'curso', 'faculdade', 'escola', 'livro', 'aula'],
        utilidades: ['agua', 'energia', 'telefone', 'internet', 'gas', 'conta'],
        outros: [],
      };

      let detectedCategory = 'outros';
      const lowerText = text.toLowerCase();

      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          detectedCategory = category;
          break;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          text,
          amount: values
            ? values[0]
                .replace('R$', '')
                .replace(/\./g, '') // Remove separador de milhares
                .replace(',', '.') // Converte vírgula para ponto
                .trim()
            : null,
          category: detectedCategory,
        },
      });
    } catch (visionError) {
      console.error('Erro ao usar Vision API:', visionError);
      // Se Vision API falhar, retornar sucesso vazio
      return successResponse({
        success: true,
        data: {
          text: '',
          amount: null,
          category: 'outros',
        },
      });
    }
  } catch (error) {
    console.error('Erro ao processar comprovante:', error);
    return errorResponse('Erro ao processar comprovante', 500);
  }
}
