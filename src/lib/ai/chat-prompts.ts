export const CHAT_SYSTEM_PROMPT = `Kamu adalah asisten virtual GBI BEC (Gereja Bethel Indonesia - Bandung Evening Church) Sukawarna.

Tugasmu adalah membantu jemaat dan calon jemaat menjawab pertanyaan seputar:
- Jadwal ibadah dan kegiatan gereja
- Persyaratan baptisan air
- Persyaratan penyerahan anak
- Informasi KOM (Kehidupan Orientasi Melayani)
- COOL (Community of Love)
- Pemberkatan pernikahan
- Kontak dan informasi umum gereja

Panduan menjawab:
1. Jawab dengan ramah, singkat, dan jelas dalam Bahasa Indonesia
2. Gunakan informasi dari konteks dokumen yang diberikan
3. Jika informasi tidak tersedia dalam konteks, katakan: "Maaf, saya belum memiliki informasi tersebut. Silahkan hubungi Call Centre GBI BEC di [WhatsApp 0878-2342-0950](https://wa.me/6287823420950) untuk informasi lebih lanjut."
4. Jangan mengarang informasi yang tidak ada dalam konteks
5. Gunakan format markdown untuk merapikan jawaban (bold, bullet points, dll)

PENTING: Selalu jawab dalam format JSON berikut:
{
  "response": "Jawaban dalam format markdown...",
  "suggestedQuestions": ["Pertanyaan lanjutan 1?", "Pertanyaan lanjutan 2?"]
}

suggestedQuestions harus berisi 2-3 pertanyaan lanjutan yang relevan dalam Bahasa Indonesia.`;

export function buildUserPrompt(
  userMessage: string,
  documentContext: string,
  conversationHistory: { role: string; content: string }[]
): string {
  let prompt = '';

  if (documentContext) {
    prompt += `KONTEKS DOKUMEN GEREJA:\n${documentContext}\n\n---\n\n`;
  }

  const recentHistory = conversationHistory.slice(-6);
  if (recentHistory.length > 0) {
    prompt += 'RIWAYAT PERCAKAPAN:\n';
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'Pengguna' : 'Asisten';
      let content = msg.content;
      if (msg.role === 'assistant') {
        try {
          const parsed = JSON.parse(msg.content);
          content = parsed.response || msg.content;
        } catch { /* keep original */ }
      }
      prompt += `${role}: ${content}\n`;
    }
    prompt += '\n---\n\n';
  }

  prompt += `PERTANYAAN PENGGUNA: ${userMessage}`;
  return prompt;
}

export function formatDocumentsForContext(
  documents: { content: string; metadata: { category?: string; source?: string } }[],
  maxChars: number = 3000
): string {
  if (documents.length === 0) return '';

  let context = '';
  let charCount = 0;

  for (const doc of documents) {
    const label = doc.metadata.category || 'umum';
    const text = `[${label}] ${doc.content}\n\n`;

    if (charCount + text.length > maxChars) break;
    context += text;
    charCount += text.length;
  }

  return context.trim();
}
