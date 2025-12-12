import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não fornecida' },
        { status: 400 }
      );
    }

    // Processar imagem com Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(
      image,
      'por',
      {
        logger: (m: any) => console.log(m),
      }
    );

    // Extrair valor (procura por padrões de valor monetário)
    const valuePattern = /R\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;
    const values = text.match(valuePattern);

    // Extrair possíveis categorias (palavras-chave)
    const categories = {
      'alimentacao': ['mercado', 'supermercado', 'restaurante', 'padaria', 'lanchonete', 'ifood', 'mcdonald', 'burger king', 'pizza'],
      'transporte': ['uber', '99', 'taxi', 'combustivel', 'gasolina', 'estacionamento', 'passagem', 'bus', 'metro'],
      'saude': ['farmacia', 'drogaria', 'clinica', 'hospital', 'medico', 'dentista'],
      'lazer': ['cinema', 'shopping', 'teatro', 'parque', 'jogo', 'game', 'streaming'],
      'educacao': ['livraria', 'curso', 'faculdade', 'escola', 'livro', 'aula'],
      'utilidades': ['agua', 'energia', 'telefone', 'internet', 'gas', 'conta'],
      'outros': []
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
  } catch (error) {
    console.error('Erro ao processar comprovante:', error);
    return NextResponse.json(
      { error: 'Erro ao processar comprovante' },
      { status: 500 }
    );
  }
}
