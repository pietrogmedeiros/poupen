const express = require('express');
const cors = require('cors');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration with whitelist
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://poupen.com',
  'https://www.poupen.com',
  process.env.ALLOWED_ORIGINS?.split(',').map((origin: string) => origin.trim()),
].flat().filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

app.use(express.json({ limit: '50mb' }));

// Endpoint para processar comprovante com OCR
app.post('/api/process-receipt', async (req: any, res: any) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Imagem não fornecida' });
    }

    // Processar imagem com Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(
      image,
      'por'
    );

    // Importar constantes (ou definir inline para evitar imports de servidor)
    const AMOUNT_PATTERN = /R\$?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;
    const CATEGORY_KEYWORDS: Record<string, string[]> = {
      alimentacao: ['mercado', 'supermercado', 'restaurante', 'padaria', 'lanchonete', 'ifood', 'mcdonald', 'burger king', 'pizza'],
      transporte: ['uber', '99', 'taxi', 'combustivel', 'gasolina', 'estacionamento', 'passagem', 'bus', 'metro'],
      saude: ['farmacia', 'drogaria', 'clinica', 'hospital', 'medico', 'dentista'],
      lazer: ['cinema', 'shopping', 'teatro', 'parque', 'jogo', 'game', 'streaming'],
      educacao: ['livraria', 'curso', 'faculdade', 'escola', 'livro', 'aula'],
      utilidades: ['agua', 'energia', 'telefone', 'internet', 'gas', 'conta'],
      outros: [],
    };

    // Extrair valor (procura por padrões de valor monetário)
    const values = text.match(AMOUNT_PATTERN);
    
    let detectedCategory = 'outros';
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedCategory = category;
        break;
      }
    }

    res.json({
      success: true,
      data: {
        text,
        amount: values ? values[0]
          .replace('R$', '')
          .replace(/\./g, '') // Remove separador de milhares
          .replace(',', '.') // Converte vírgula para ponto
          .trim() : null,
        category: detectedCategory,
      }
    });
  } catch (error) {
    console.error('Erro ao processar comprovante:', error);
    res.status(500).json({ error: 'Erro ao processar comprovante' });
  }
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port ${PORT}`);
  }
});
