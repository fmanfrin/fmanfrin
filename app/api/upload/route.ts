import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import type { Training } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textContent = formData.get("content") as string | null;
    const title = (formData.get("title") as string) || "Sem título";
    const userId = (formData.get("userId") as string) || "admin";

    let rawContent = textContent || "";
    if (file) rawContent = await file.text();
    if (!rawContent.trim()) return NextResponse.json({ error: "Conteúdo vazio" }, { status: 400 });

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: `Você é um especialista em educação corporativa. Dado um conteúdo, crie:
1. Um resumo estruturado em Markdown
2. Exatamente 10 perguntas de múltipla escolha com 4 opções cada

Retorne APENAS JSON válido:
{
  "summary": "resumo em markdown",
  "questions": [
    {
      "id": 1,
      "question": "texto da pergunta",
      "options": ["A) opção", "B) opção", "C) opção", "D) opção"],
      "correct": 0,
      "explanation": "por que esta é a resposta correta"
    }
  ]
}`,
      messages: [{ role: "user", content: `Título: "${title}"\n\nConteúdo:\n${rawContent.slice(0, 10000)}` }],
    });

    const text = message.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Resposta da IA sem JSON válido");
    const parsed = JSON.parse(match[0]);

    const training: Training = {
      id: uuidv4(),
      title,
      description: (parsed.summary as string).slice(0, 200).replace(/[#*]/g, "").trim(),
      content: parsed.summary,
      questions: JSON.stringify(parsed.questions),
      created_by: userId,
      created_at: new Date().toISOString(),
    };
    db.insertTraining(training);

    return NextResponse.json({ id: training.id, title, questionsCount: parsed.questions.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
