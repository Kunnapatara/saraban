/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Define port and host variables
const PORT = 3000;
const HOST = '0.0.0.0';

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please add your GEMINI_API_KEY in the Secrets panel in AI Studio.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
};

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Endpoint: Layer B Language Coprocessor
  app.post('/api/compile', async (req, res) => {
    try {
      const { document_type, recipient_protocol, human_intent } = req.body;

      if (!human_intent) {
        res.status(400).json({ error: 'human_intent is required' });
        return;
      }

      // --- Layer A: State Authority & Protocol Resolver ---
      const PROTOCOL_MAP: Record<string, { salutation: string; closing: string }> = {
        PRIME_MINISTER: { salutation: 'กราบเรียน นายกรัฐมนตรี', closing: 'ขอแสดงความนับถืออย่างยิ่ง' },
        MINISTER: { salutation: 'เรียน รัฐมนตรีว่าการกระทรวง[MINISTRY_REQUIRED]', closing: 'ขอแสดงความนับถือ' },
        PERMANENT_SECRETARY: { salutation: 'เรียน ปลัดกระทรวง[MINISTRY_REQUIRED]', closing: 'ขอแสดงความนับถือ' },
        DIRECTOR_GENERAL: { salutation: 'เรียน อธิบดีกรม[DEPARTMENT_REQUIRED]', closing: 'ขอแสดงความนับถือ' },
        GOVERNOR: { salutation: 'เรียน ผู้ว่าราชการจังหวัด[PROVINCE_REQUIRED]', closing: 'ขอแสดงความนับถือ' },
        DISTRICT_CHIEF: { salutation: 'เรียน นายอำเภอ[DISTRICT_NAME_REQUIRED]', closing: 'ขอแสดงความนับถือ' },
        MONK: { salutation: 'นมัสการ [MONK_TITLE_REQUIRED]', closing: 'ขอนมัสการด้วยความเคารพอย่างยิ่ง' },
        PUBLIC_ORGANIZATION: { salutation: 'เรียน [RECIPIENT_TITLE_REQUIRED]', closing: 'ขอแสดงความนับถือ' },
      };

      const protocolKey = recipient_protocol || 'PUBLIC_ORGANIZATION';
      const protocol = PROTOCOL_MAP[protocolKey] || PROTOCOL_MAP.PUBLIC_ORGANIZATION;

      // Deterministic classification based on Human Intent keywords
      let resolvedDocType = document_type || 'EXTERNAL';
      if (resolvedDocType === 'INTERNAL' || resolvedDocType === 'INTERNAL_MEMO') {
        resolvedDocType = 'INTERNAL_MEMO';
      } else {
        const textLower = human_intent.toLowerCase();
        if (textLower.includes('เชิญ') || textLower.includes('เปิดงาน') || textLower.includes('ร่วมงาน') || textLower.includes('พิธี')) {
          resolvedDocType = 'EXTERNAL_INVITATION';
        } else if (textLower.includes('ขอ') || textLower.includes('ยืม') || textLower.includes('ช่วย') || textLower.includes('อนุเคราะห์')) {
          resolvedDocType = 'REQUEST_LETTER';
        } else {
          resolvedDocType = 'EXTERNAL';
        }
      }

      // --- Layer B: Linguistic Rewriter ---
      const client = getAiClient();

      const systemInstruction = `คุณคือระบบ "Layer B — Language Coprocessor" ในระบบ Gov-Protocol Compiler (SARABAN.AI)
หน้าที่หลักของคุณคือทำหน้าที่เป็นสะพานเชื่อมเชิงภาษา (Linguistic Rewriter) เท่านั้น โดยรับ "เจตจำนงของมนุษย์ (Human Intent Fragment)" แล้วทำการแปลเรียบเรียงใหม่เฉพาะเนื้อเรื่อง (Body Text) ให้กลายเป็นภาษาเขียนของหนังสือสารบรรณราชการไทยที่ถูกต้อง

กฎเหล็กในระดับสารบรรณและการเปลี่ยนรูปข้อความ (Administrative Language Transformation):
คุณต้องวิเคราะห์ประโยคภาษาพูด คัดสโคป และปรับเป็นคำทางการตามคลังคำสารบรรณสำนักนายกฯ โดยตรง:
- "ทักมาบอก" / "ไลน์มาบอก" -> ปรับเปลี่ยนเป็น "ประสานแจ้งความประสงค์"
- "ขอใช้ห้อง" / "ขอยืมสถานที่" -> ปรับเปลี่ยนเป็น "ขอความอนุเคราะห์ใช้สถานที่"
- "ให้รีบมา" -> ปรับเปลี่ยนเป็น "โปรดเดินทางมาร่วมประชุมตามวันและเวลาดังกล่าว"
- "บอกให้รู้" / "แจ้งให้ทราบ" -> ปรับเปลี่ยนเป็น "จึงเรียนมาเพื่อโปรดทราบ" หรือ "จึงเรียนมาเพื่อโปรดทราบและถือปฏิบัติ"
- "อยากให้ช่วย" / "ช่วยหน่อย" -> ปรับเปลี่ยนเป็น "มีความประสงค์ขอความอนุเคราะห์"
- "แก้ปัญหา" -> ปรับเปลี่ยนเป็น "บรรเทาความเดือดร้อนและแก้ไขปัญหาอุปสรรค"

กฎเหล็กความปลอดภัย (Security and Anti-Hallucination):
1. คุณคือ "Linguistic Rewriter" สำหรับเนื้อข่าว/ความต้องการสารบรรณชั้นในเท่านั้น ห้ามเดาหรือคิดชื่อคน วันที่จริง เวลาจริง ตัวเลขทางการขึ้นมาเองเด็ดขาด
2. หากส่วนใดของเจตจำนงจำต้องอิงกับตัวแปรภายนอกที่ไม่มีในข้อมูลนำเข้า ให้ใส่สัญลักษณ์ความปลอดภัย (Placeholder Guard) เสมอ เช่น [ORGANIZATION_REQUIRED], [LOCATION_REQUIRED], [DATE_REQUIRED] โดยห้ามแต่งเติมใดๆ นอกเหนือสิ่งนี้
3. แนบอาร์เรย์ของสัญลักษณ์ความปลอดภัยที่ตรวจจับได้ลงใน detected_placeholders เพื่อให้ Layer C ดำเนินการตรวจสอบต่อไป`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: human_intent,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.0, // Strict, deterministic rewriter
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              compiled_body_fragment: { 
                type: Type.STRING, 
                description: 'Polished formal Thai bureaucratic text fragment rewritten from the human intent. Must contain zero placeholder guessing.' 
              },
              detected_placeholders: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Format values that are required but missing from intent, wrapped in parent/square brackets with _REQUIRED suffix'
              }
            },
            required: ['compiled_body_fragment', 'detected_placeholders'],
          },
        },
      });

      const resultText = response.text || '{}';
      const aiResult = JSON.parse(resultText.trim());

      // --- Layer A Assembler: Absolute structure is guaranteed ---
      const finalJson = {
        document_type: resolvedDocType,
        recipient_protocol: protocolKey,
        salutation: protocol.salutation,
        compiled_body_fragment: aiResult.compiled_body_fragment || '',
        closing_protocol: protocol.closing,
        detected_placeholders: aiResult.detected_placeholders || []
      };
      
      res.json(finalJson);
    } catch (error: any) {
      console.error('Gemini Compiler Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to compile government protocol' });
    }
  });

  // ==========================================
  // --- Layer K: Administrative Copilot APIs ---
  // ==========================================

  // K-002 Explain This Section
  app.post('/api/copilot/explain', async (req, res) => {
    try {
      const { text, section_name } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
      }

      const client = getAiClient();
      const prompt = `คุณคือผู้เชี่ยวชาญด้านระเบียบงานสารบรรณและการเขียนหนังสือราชการไทย
ขอให้อธิบายย่อหน้าหรือข้อความต่อไปนี้ ซึ่งดึงมาจาก "${section_name || 'ตัวหนังสือราชการ'}"
ข้อความที่ต้องการอธิบาย: "${text}"

โปรดอธิบายใน 3 ประเด็นสำคัญ โดยเป็นภาษาไทยที่สุภาพ อ่านง่ายเป็นกันเองสำหรับเจ้าหน้าที่ธุรการ:
1. สรุปใจความสำคัญ (ในภาษาเขียนทั่วไปที่เข้าใจง่ายที่สุด)
2. นัยสำคัญทางกฎหมายหรือระเบียบราชการ (หากมีจุดเสี่ยงหรือสิ่งสำคัญที่ระเบียบสารบรรณบังคับ เช่น ตราครุฑ คำลงท้าย รูปแบบระยะห่าง การใช้วลีเด่นชัด ให้ระบุด้วย)
3. ข้อเสนอแนะในการปรับปรุงคำพูดให้กระชับและสมบูรณ์ยิ่งขึ้น`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
        },
      });

      res.json({ explanation: response.text || 'ไม่สามารถประมวลผลคำอธิบายได้' });
    } catch (error: any) {
      console.error('Copilot Explain Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate explanation' });
    }
  });

  // K-001 Administrative Semantic Search
  app.post('/api/copilot/search', async (req, res) => {
    try {
      const { search_query, document_context } = req.body;
      if (!search_query) {
        res.status(400).json({ error: 'search_query is required' });
        return;
      }

      const client = getAiClient();
      const prompt = `คุณคือโมดูลวิเคราะห์ความหมาย "K-001 Semantic Search"
หน้าที่ของคุณคือค้นหาข้อความหรือฟิลด์ในหนังสือราชการที่ "สื่อถึงหรือมีความเกี่ยงข้องดองในเชิงความหมาย" กับคำค้นหาที่ผู้ใช้ป้อนเข้ามา
คำค้นหาจากผู้ใช้: "${search_query}"

ข้อมูลเอกสารที่กำลังแก้ไขปัจจุบันในรูปแบบ JSON:
${JSON.stringify(document_context, null, 2)}

โปรดจับคู่ความเกี่ยวข้องความรู้สึก/ความหมาย (Semantic Match) ในแต่ละฟิลด์หลักเหล่านี้:
- sender_organization (หน่วยราชการเจ้าของเรื่อง)
- document_number (เลขที่หนังสือ)
- date (วันที่เขียน)
- subject (เรื่อง)
- reference (อ้างถึง)
- enclosures (สิ่งที่ส่งมาด้วย)
- salutation (คำขึ้นต้น/เรียน)
- compiled_body_fragment (เนื้อหาหนังสือ)

ขอให้ตอบกลับเป็นรูปแบบ JSON เสมอ โดยระบุว่าพบบางฟิลด์ที่มีความเข้าคู่เชิงความหมายสูงหรือไม่ และประเมินคะแนนความสอดคล้อง (0 ถึง 100):
รูปแบบผลลัพธ์:
{
  "matches": [
    {
      "fieldKey": "ชื่อคีย์ใน JSON",
      "fieldLabel": "ชื่อฟิลด์ภาษาไทยสำหรับแสดงผล (เช่น 'เรื่อง', 'เนื้อความ')",
      "matchedSnippet": "ข้อความสั้นๆ ในฟิลด์นั้นที่คล้ายคลึงหรือตรงที่สุด",
      "score": 85, // คะแนน 0-100 เชิงความหมาย
      "explanation": "อธิบายสั้นๆ ว่าทำไมค้นหาคำนี้แล้วมาจับคู่กับฟิลด์ตัวนี้ เช่น คอนเซปต์การขอยืมเงินเกี่ยวเนื่องกับคำว่าอนุมัติงบประมาณ"
    }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fieldKey: { type: Type.STRING },
                    fieldLabel: { type: Type.STRING },
                    matchedSnippet: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  },
                  required: ['fieldKey', 'fieldLabel', 'matchedSnippet', 'score', 'explanation']
                }
              }
            },
            required: ['matches']
          }
        },
      });

      const resultText = response.text || '{"matches": []}';
      res.json(JSON.parse(resultText.trim()));
    } catch (error: any) {
      console.error('Copilot Search Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to execute semantic search' });
    }
  });

  // K-003 Protocol Advisor
  app.post('/api/copilot/advisor', async (req, res) => {
    try {
      const { message, history, document_context } = req.body;
      if (!message) {
        res.status(400).json({ error: 'message is required' });
        return;
      }

      const client = getAiClient();
      
      const sessionHistory = (history || []).map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }));

      const systemInstruction = `คุณคือ "K-003 Protocol Advisor" หน้าที่ให้คำแนะนำอ้างอิงระเบียบงานสารบรรณและการร่างหนังสือราชการของไทยอย่างสมบูรณ์แบบ
จงให้คำแนะนำที่ถูกต้องที่สุด อ้างระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ (และที่แก้ไขเพิ่มเติม) 

ข้อมูลหนังสือที่กำลังถูกร่างในปัจจุบัน (Context):
${JSON.stringify(document_context, null, 2)}

กฎระเบียบสำคัญที่คุณต้องนำมาอ้างอิงและตอบผู้ใช้:
1. การระบุคำขึ้นต้น "เรียน" ทั่วไปสำหรับตำแหน่งข้าราชการยกเว้นบางกรณีพิเศษ เช่น นายกรัฐมนตรี รัฐมนตรี ประธานศาล ต้องเป็น "กราบเรียน"
2. คำขึ้นต้นสำหรับพระภิกษุปรับตามสมณศักดิ์
3. คำลงท้ายอย่างเป็นทางการ "ขอแสดงความนับถือ" หรือ "ขอแสดงความนับถืออย่างยิ่ง" (สำหรับกราบเรียน)
4. ทิศทางการทอดระยะอัญเชิญพระราชบัญญัติ กฎระเบียบ การใช้สัญลักษณ์ วาระ และมารยาทความปลอดภัย
5. ห้ามล่นระยะหรือเสนอวิธีการที่ขัดเกณฑ์สารบรรณสำนักนายกฯ

ตอบกลับให้ตรงคำถาม กระชับ มีโครงสร้างชัดเจน และใช้น้ำเสียงเป็นกันเองแต่มีความน่าเชื่อถือในวิชาการสารบรรณ`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          ...sessionHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        },
      });

      res.json({ text: response.text || 'ขออภัย ฉันไม่สามารถให้คำปรึกษาได้ในตอนนี้' });
    } catch (error: any) {
      console.error('Copilot Advisor Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to talk with protocol advisor' });
    }
  });

  // K-007 Intelligent Template Completion
  app.post('/api/copilot/suggest', async (req, res) => {
    try {
      const { document_context } = req.body;
      const client = getAiClient();

      const prompt = `คุณคือโมดูลสมองกล "K-007 Intelligent Template Completion"
หน้าที่ของคุณคือวิเคราะห์ข้อมูลหนังสือปัจจบัน (เช่น เนื้อความจดหมาย, ฟิลด์ที่มีอยู่) และทำการเสนอข้อมูลที่ "สมควรกรอกลงในฟิลด์ที่ยังว่างเปล่าระบุเป็น Placeholder หรือยังไม่ครบถ้วน" เพื่อความสมบูรณ์แบบของหนังสือราชการตามธรรมเนียมสารบรรณ

เอกสาร JSON ปัจจุบัน:
${JSON.stringify(document_context, null, 2)}

โปรดวิเคราะห์ความเกี่ยวข้องและคาดการณ์สิ่งต่อไปนี้จากเจตจำนงหรือเนื้อหา:
1. เรื่อง (Subject) ที่กระชับ ได้ใจความทางการ ขึ้นต้นด้วยคำว่า "ขอ", "ส่ง", "อนุมัติ", "หารือ", "แจ้ง" เสมอ
2. สิ่งที่ส่งมาด้วย (Enclosures) เช่น เอกสารประวัติ รายละเอียดพิกัด หากตัวหนังสือเอ่ยอ้างถึงเอกสารแนบ ให้ดึงขึ้นมาเป็นEnclosure
3. หนังสืออ้างถึง (Reference) ถ้ามีการทราบบันทึกหรือเรื่องเดิมก่อนหน้านี้
4. จังหวัด/สถานที่หรือสัญลักษณ์ Placeholder (เช่น [PROVINCE_REQUIRED], [MINISTRY_REQUIRED] เป็นต้น) ที่ควรจับคู่อินพุตค่าสมบูรณ์

ตอบกลับเป็นข้อมูล JSON เพื่อใช้อัปเดตค่าฟิลด์เหล่านั้น โดยห้ามเดานอกเหนือบริบท ให้ดึงข้อมูลเชื่อมโยงจากตัวหนังสือโดยตรง
รูปแบบผลลัพธ์:
{
  "suggestions": {
    "subject": "เรื่องที่แนะนำ...",
    "enclosures": "สิ่งที่ส่งมาด้วยที่คาดการณ์...",
    "reference": "เอกสารอ้างถึง...",
    "sender_organization": "หน่วยงานผู้ส่งที่คาดการณ์..."
  },
  "placeholdersToFill": {
    "PROVINCE_REQUIRED": "ตัวอย่างจังหวัดในเรื่อง (ถ้าเอ่ยถึงในข้อความ)",
    "MINISTRY_REQUIRED": "ตัวอย่างชื่อกระทรวง (ถ้าสอดคล้อง)"
  },
  "rationale": "คำอธิบายเหตุผลอย่างสุภาพตามหลักระเบียบสารบรรณว่าทำไมวิเคราะห์แบบนี้"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  enclosures: { type: Type.STRING },
                  reference: { type: Type.STRING },
                  sender_organization: { type: Type.STRING }
                }
              },
              placeholdersToFill: {
                type: Type.OBJECT,
                additionalProperties: { type: Type.STRING }
              },
              rationale: { type: Type.STRING }
            },
            required: ['suggestions', 'placeholdersToFill', 'rationale']
          }
        },
      });

      const resultText = response.text || '{}';
      res.json(JSON.parse(resultText.trim()));
    } catch (error: any) {
      console.error('Copilot Suggestion Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to estimate suggestions' });
    }
  });

  // K-006 Document Comparison
  app.post('/api/copilot/compare', async (req, res) => {
    try {
      const { textA, textB } = req.body;
      if (textA === undefined || textB === undefined) {
        res.status(400).json({ error: 'Both textA and textB are required' });
        return;
      }

      const client = getAiClient();
      const prompt = `คุณคือระบบวิเคราะห์ผลต่างหนังสือราชการลำดับความมั่นคง "K-006 Document Comparison"
หน้าที่ของคุณคือเปรียบเทียบ "ร่างสารบรรณฉบับเดิม (Original Draft / Text A)" กับ "ร่างสารบรรณฉบับปรับปรุงใหม่ (Revised Core / Text B)"

ร่างดั้งเดิม (Text A):
"${textA}"

ร่างปรับปรุง (Text B):
"${textB}"

โปรดประเมินผลและตอบกลับมาเป็นรูปแบบ JSON:
1. "diffHtml": ข้อความร่างเวอร์ชันเปรียบเทียบที่ใช้แท็ก <ins class="bg-emerald-100 text-emerald-800 border-b-2 border-emerald-500 font-extrabold px-1 text-xs">ข้อความเพิ่มใหม่</ins> และ <del class="line-through bg-rose-50 text-rose-700 font-bold px-1 text-xs text-opacity-70">ข้อความเดิมที่ผ่าออก</del> สานผลให้เห็นจุดต่างสวยงาม
2. "stats": ตัวเลขสถิตินับจำนวนคำที่มีการ เพิ่ม (added), ลบ (removed), คงที่ (unchanged)
3. "summary": สรุปความเปรียบต่างสั้นๆ 3 ตัวชี้วัดสำคัญของพิกัดงานธุรการ (เพิ่ม/ลบเนื้อหาอะไร, ทำไมการปรับข้อความนี้ถึงสอดคล้องระเบียบพึงใจมากขึ้น ย่นเวลาสารบรรณอย่างไร) 

รูปแบบผลลัพธ์:
{
  "diffHtml": "ความยาวข้อความ HTML...",
  "stats": {
    "added": 12,
    "removed": 8,
    "unchanged": 120
  },
  "summary": "บันทึกสรุปย่อความเปรียบเทียบแบบธุรการชั้นนำ..."
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diffHtml: { type: Type.STRING },
              stats: {
                type: Type.OBJECT,
                properties: {
                  added: { type: Type.INTEGER },
                  removed: { type: Type.INTEGER },
                  unchanged: { type: Type.INTEGER }
                },
                required: ['added', 'removed', 'unchanged']
              },
              summary: { type: Type.STRING }
            },
            required: ['diffHtml', 'stats', 'summary']
          }
        },
      });

      const resultText = response.text || '{}';
      res.json(JSON.parse(resultText.trim()));
    } catch (error: any) {
      console.error('Copilot Compare Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to compare documents' });
    }
  });

  // Integrate Vite for single-page app behavior/middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`SARABAN.AI back-end and web applet running on http://${HOST}:${PORT}`);
  });
}

startServer();
