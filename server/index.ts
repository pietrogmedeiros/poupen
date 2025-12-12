const express = require('express');
const cors = require('cors');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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
      'alimentacao': ['mercado', 'supermercado', 'restaurante', 'padaria', 'lanchonete', 'ifood'],
      'transporte': ['uber', '99', 'taxi', 'combustivel', 'gasolina', 'estacionamento'],
      'saude': ['farmacia', 'drogaria', 'clinica', 'hospital', 'medico'],
      'lazer': ['cinema', 'shopping', 'teatro', 'parque'],
      'educacao': ['livraria', 'curso', 'faculdade', 'escola'],
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
  console.log(`Servidor rodando na porta ${PORT}`);
});
