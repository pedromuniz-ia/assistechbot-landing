import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lista de temas possíveis para diversificar os posts diários
const TEMAS = [
  "Cuidados cruciais na troca de tela de aparelhos modernos",
  "Como organizar a bancada de manutenção para aumentar a produtividade",
  "Ferramentas essenciais de micro-soldagem que todo técnico iniciante precisa",
  "Como precificar serviços de reparo de celular sem perder margem",
  "Atendimento pós-venda na assistência técnica: como fidelizar o cliente",
  "O que fazer quando o celular molha: guia definitivo de recuperação",
  "Principais defeitos em conectores de carga tipo C e como diagnosticar",
  "Como lidar com clientes difíceis no balcão da assistência técnica",
  "Dicas práticas para gerenciar o estoque de peças e evitar dinheiro parado",
  "Como reativar baterias de celular completamente descarregadas (choque de bateria)"
];

async function generatePost() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ Erro: OPENAI_API_KEY não configurada nas variáveis de ambiente.");
    process.exit(1);
  }

  // Escolhe um tema aleatório
  const temaEscolhido = TEMAS[Math.floor(Math.random() * TEMAS.length)];
  const hoje = new Date().toISOString().split('T')[0];

  console.log(`🤖 Iniciando geração do post com o tema: "${temaEscolhido}"...`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um redator profissional especialista em gestão, marketing e bancada para assistências técnicas de celular. Escreve artigos pragmáticos, diretos e sem enrolação, usando o tom coloquial e técnico de quem trabalha no dia a dia da bancada.'
          },
          {
            role: 'user',
            content: `Escreva um artigo de blog sobre o seguinte tema: "${temaEscolhido}".

Diretrizes obrigatórias:
1. O post deve começar exatamente com o cabeçalho (frontmatter) YAML:
---
title: "Título focado em cliques e SEO sobre o tema"
description: "Descrição curta e chamativa de até 150 caracteres para SEO"
pubDate: ${hoje}
author: Guilherme
tags: ["Tag1", "Tag2"]
---

2. O conteúdo deve ser estruturado com títulos (##), listas e parágrafos curtos.
3. Use jargões reais de assistência técnica (ex: bancada, fluxo de solda, fonte de bancada, curto na placa, tela original, frontal paralela, consumo, etc.).
4. No final do texto, inclua esta chamada para o WhatsApp:
"Se você quer profissionalizar sua assistência técnica de celulares, gerenciar garantias e ordens de serviço em PDF em 1 minuto direto no WhatsApp do cliente, conheça o AssisTech BOT. 👉 [Clique aqui para testar o AssisTech BOT gratuitamente no WhatsApp](https://assistechbot.online/chat?utm_source=blog&utm_campaign=auto-post)"


Retorne apenas o markdown completo do post, sem envolver o resultado em caixas de código markdown (como \`\`\`markdown).`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API retornou status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let text = data.choices[0].message.content.trim();

    // Limpa possíveis marcações de código da IA
    if (text.startsWith("```")) {
      text = text.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
    }

    // Cria o slug do arquivo
    const slug = temaEscolhido
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const fileName = `${hoje}-${slug}.md`;
    const outputPath = path.join(__dirname, '../src/content/blog', fileName);

    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log(`✅ Post gerado e salvo com sucesso em: src/content/blog/${fileName}`);
  } catch (error) {
    console.error("❌ Falha ao gerar o post:", error);
    process.exit(1);
  }
}

generatePost();
