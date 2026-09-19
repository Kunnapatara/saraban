/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Sparkles, 
  Zap, 
  Award, 
  BookOpen, 
  Copy, 
  Check, 
  Terminal, 
  FileSearch,
  Network,
  Compass,
  Maximize2,
  FileText
} from 'lucide-react';
import { STS_REPOS_INDEX } from '../constants/templatesRepo';

export default function MethodologyPanel() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'pipeline' | 'prompts' | 'repository' | 'advantages'>('architecture');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('STS-INTMEMO-V1');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const PROMPT_LAYER_A = `# SARABAN.AI — Layer A: Fixed Layout Engine Generator
You are a Principal Government Document Systems Architect.
CORE PRINCIPLE: AI MUST NEVER CONTROL LAYOUT. Layout is deterministic.

Generate a complete layout specification system for "หนังสือภายใน/หนังสือภายนอก" using the following architecture:
1. Layout coordinates must be expressed in millimeters.
2. A4 portrait page only.
3. Every element must have: unique id, x, y, width, height, alignment, font, lock status.
4. Anchors: Garuda emblem, Header, Agency, Ref number, Date, Subject, Recipient, Body, Signature.
5. Layout engine must support: automatic page breaks, protected signature zones.`;

  const PROMPT_LAYER_C = `# SARABAN.AI — Layer C: Formatting Validator Generator
You are a Government Document Compliance Engineer.
Your task is to build a Formatting Compliance Validator for Thai administrative correspondence.

Validate rendered documents against template specifications:
1. Position Compliance: ± 0.5 mm tolerance on Garuda emblem, signature and margin coordinates.
2. Typography Compliance: approved TH Saraban Font, approved line spacing,approved sizes.
3. Placeholder Integrity: Detect {{variable}}, [[placeholder]], TODO, REQUIRED (unresolved = CRITICAL ERROR).
4. Pagination Compliance: no signature split, no footer collision, zero orphans.`;

  const PROMPT_LAYER_D = `# SARABAN.AI — Layer D: Administrative Protocol Compiler
Your task is to compile formal intents into strict government structures.
1. Translate JSON parameter fields into verified AST nodes.
2. Match recipient class protocols to correct salutations and closings.
3. Inject failsafe default nodes if metadata holds "REQUIRED" signatures.
4. Calculate compliance indices and generate an immutable secure signature hash.`;

  return (
    <div id="methodology-container" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="text-blue-600" size={24} />
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">คลังระบบและวิสัยทัศน์ Gov-Protocol Compiler</h2>
          <p className="text-xs text-slate-500 font-medium">สถาปัตยกรรม 4 เลเยอร์แบบบูรณาการและสเปกโค้ดควบคุมทั้งหมด</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap bg-slate-100 rounded-xl p-1 mb-6 gap-1">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex-grow flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition duration-150 ${
            activeTab === 'architecture'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Cpu size={12} />
          4-Layer Core
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex-grow flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition duration-150 ${
            activeTab === 'pipeline'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Network size={12} />
          Pipeline
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex-grow flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition duration-150 ${
            activeTab === 'prompts'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Terminal size={12} />
          Specs Focus
        </button>
        <button
          onClick={() => setActiveTab('repository')}
          className={`flex-grow flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition duration-150 ${
            activeTab === 'repository'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass size={12} />
          STS Repository
        </button>
        <button
          onClick={() => setActiveTab('advantages')}
          className={`flex-grow flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition duration-150 ${
            activeTab === 'advantages'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award size={12} />
          B2G Moat
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'architecture' && (
          <div id="tab-architecture" className="space-y-3.5 animate-fade-in text-slate-850">
            <div className="border border-slate-200 bg-slate-50 p-3.5 rounded-2xl flex gap-3">
              <div className="bg-sky-100 text-sky-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 border border-sky-200">A</div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Layer A — Fixed Layout Engine</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  สล็อตล็อกพิกัดเป็นมิลลิเมตรตามระเบียบสารบรรณ ล็อกระยะขอบกระดาษ A4 เสมอ โครงสร้าง รูปครุฑ ขนาดฟอนต์ ย่อหน้าได้รับการกำหนดตายตัว มีพฤติกรรมคงเส้นคงวา (Zero Formatting Variance)
                </p>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-3.5 rounded-2xl flex gap-3">
              <div className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 border border-purple-200">B</div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Layer B — Language Coprocessor (AI)</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  ตัวประมวลผลคำพูดไม่เป็นทางการของมนุษย์ แปลงร่างสาระเป็นคำทางการของรัฐ ปรับระดับความแปรปรวน (Temperature) เป็น 0.0 เสมอ เพื่อห้ามบิดพลิ้วสำนวน และใส่เครื่องหมายดักข้อมูล [_REQUIRED] ปิดช่องโหว่การมโน
                </p>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-3.5 rounded-2xl flex gap-3">
              <div className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 border border-emerald-200">C</div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Layer C — Formatting Validator & Linter</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  กลไกสแกนและตรวจสอบองค์ประกอบระยะขอบ โทรศัพท์ สิ่งที่ส่งมาด้วย และความเข้ากันของเลขครุฑกำกับ หากพบตัวแปรรอกรอกใดๆ เสมือนเป็นข้อผิดพลาดร้ายแรง (Critical Error) ที่ขวางการปล่อยเอกสาร
                </p>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-3.5 rounded-2xl flex gap-3">
              <div className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 border border-amber-200">D</div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">Layer D — Administrative Protocol Compiler</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  แกนหลักในการทำหน้าที่แปลง JSON หรือพจนานุกรมความจำนงเป็นกระดาษจำลอง ตรวจทานระเบียบและลำดับผู้รับ ตรวจการผูกมัดตัวแปรสะพาน และตีทะเบียน Immutable Checksum Signature
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div id="tab-pipeline" className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              ผังการไหลของข้อมูล Gov-Protocol Compiler แบบเรียลไทม์ (Deterministic Pipeline Scheme):
            </p>
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl border border-slate-800 font-mono text-[10px] space-y-2 leading-relaxed shadow-inner overflow-x-auto">
              <div>[USER INTENT INPUT] ── ระบุภาษาเขียนธรรมดาคนทั่วไป</div>
              <div className="text-slate-500 pl-4">│</div>
              <div className="text-purple-400">├──▶ [LAYER B: LANGUAGE COPROCESSOR (AI)]</div>
              <div className="text-purple-500 pl-8">│    └── สกัดสารัตถะ ปรับคำพูดทางการ บังคับ Temp=0.0</div>
              <div className="text-slate-500 pl-4">│</div>
              <div className="text-amber-400">├──▶ [LAYER D: ADMINISTRATIVE PROTOCOL COMPILER]</div>
              <div className="text-amber-500 pl-8">│    └── ตรวจลำดับชั้นความเคารพนายกฯ สารบรรณ ยัดค่า default AST</div>
              <div className="text-slate-500 pl-4">│</div>
              <div className="text-sky-400">├──▶ [LAYER A: FIXED LAYOUT ENGINE]</div>
              <div className="text-sky-500 pl-8">│    └── บังคับระยะ A4 เสมอ (Top 25mm, Left 25mm) Zero Variance</div>
              <div className="text-slate-500 pl-4">│</div>
              <div className="text-emerald-400">├──▶ [LAYER C: FORMATTING VALIDATOR (LINTER)]</div>
              <div className="text-emerald-500 pl-8">│    └── สแกน ตัวแปรว่างเว้น / คำห้ามใช้ / ออก Readiness Score & Hash</div>
              <div className="text-slate-500 pl-4">│</div>
              <div className="text-emerald-500 font-bold">[READY FOR SUBMISSION RELEASE 100%] ✔</div>
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div id="tab-prompts" className="space-y-4 animate-fade-in font-semibold">
            <p className="text-xs text-slate-500">
              ระดับสเปกพร้อมใช้ (System Specs) สำหรับกำหนดเจตจำนงแอปพลิเคชัน คัดลอกไปประยุกต์ใช้กับ LLM คอร์ได้เลย:
            </p>

            <div className="space-y-3.5 border-t border-slate-100 pt-3">
              {/* Spec Prompt A */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900">Layer A Prompt Specs (Fixed Layout)</span>
                  <button
                    onClick={() => handleCopy(PROMPT_LAYER_A, 'A')}
                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    {copiedText === 'A' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedText === 'A' ? 'คัดลอกแล้ว' : 'คัดลอกสเปก'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-350 text-[10px] whitespace-pre-wrap max-h-[140px] overflow-auto font-mono">
                  {PROMPT_LAYER_A}
                </pre>
              </div>

              {/* Spec Prompt C */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900">Layer C Prompt Specs (Validator)</span>
                  <button
                    onClick={() => handleCopy(PROMPT_LAYER_C, 'C')}
                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    {copiedText === 'C' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedText === 'C' ? 'คัดลอกแล้ว' : 'คัดลอกสเปก'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-350 text-[10px] whitespace-pre-wrap max-h-[140px] overflow-auto font-mono">
                  {PROMPT_LAYER_C}
                </pre>
              </div>

              {/* Spec Prompt D */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900">Layer D Prompt Specs (Protocol Compiler)</span>
                  <button
                    onClick={() => handleCopy(PROMPT_LAYER_D, 'D')}
                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    {copiedText === 'D' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedText === 'D' ? 'คัดลอกแล้ว' : 'คัดลอกสเปก'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-350 text-[10px] whitespace-pre-wrap max-h-[140px] overflow-auto font-mono">
                  {PROMPT_LAYER_D}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repository' && (
          <div id="tab-repository" className="space-y-4 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div>
                <span className="font-bold text-slate-950 block mb-0.5">เลือกค้นคลังระเบียบพิกัดสเปก (STS-Index)</span>
                <span className="text-[11px] text-slate-500 font-semibold block">สแกนดูพิกัดล็อกแบบแผนทางการใน Renderer และระบบ Validator</span>
              </div>
              <select
                id="template-inspect-selector"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="bg-white border border-slate-300 font-bold text-xs text-slate-800 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(STS_REPOS_INDEX).map((t) => (
                  <option key={t.template_id} value={t.template_id}>
                    {t.template_id} — {t.template_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Template specification card */}
            {(() => {
              const spec = STS_REPOS_INDEX[selectedTemplateId];
              if (!spec) return null;
              return (
                <div id="sts-raw-data-panel" className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <h4 id="sts-inspect-title" className="font-extrabold text-sm text-slate-900 leading-none mb-1">{spec.template_name}</h4>
                      <p id="sts-inspect-ref" className="text-[10px] text-slate-500 font-semibold">{spec.regulation_reference}</p>
                    </div>
                    <div className="flex gap-2">
                      <span id="sts-inspect-hash" className="text-[9px] bg-slate-200 text-slate-800 font-mono px-2 py-0.5 rounded font-black">{spec.template_hash}</span>
                      <span id="sts-inspect-version" className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded font-mono">v{spec.version}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Bounding metrics */}
                    <div id="sts-margins-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 border border-slate-100 p-3 rounded-xl text-center">
                      <div>
                        <span className="block text-[8px] text-slate-400 font-black uppercase">Top Margin</span>
                        <span className="font-extrabold text-xs text-slate-800 font-mono">{spec.page_spec.margin_top_mm} mm</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-black uppercase">Bottom Margin</span>
                        <span className="font-extrabold text-xs text-slate-800 font-mono">{spec.page_spec.margin_bottom_mm} mm</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-black uppercase">Left Margin</span>
                        <span className="font-extrabold text-xs text-slate-800 font-mono">{spec.page_spec.margin_left_mm} mm</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-black uppercase">Right Margin</span>
                        <span className="font-extrabold text-xs text-slate-800 font-mono">{spec.page_spec.margin_right_mm} mm</span>
                      </div>
                    </div>

                    {/* Anchors Coordinate Map list */}
                    <div>
                      <span className="font-extrabold text-slate-950 block mb-2 tracking-tight">📍 รายการล็อกสลักพิกัด (Layout Anchors Coordinate Map)</span>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left font-semibold border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                              <th className="px-3 py-2">หัวข้อพิกัด (Anchor Class)</th>
                              <th className="px-3 py-2 text-right">X (มม.)</th>
                              <th className="px-3 py-2 text-right">Y (มม.)</th>
                              <th className="px-3 py-2 text-right">กว้าง x สูง (มม.)</th>
                              <th className="px-3 py-2">ฟอนต์มาตรฐาน</th>
                              <th className="px-3 py-2 text-center">สถานะ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {spec.anchors.length > 0 ? (
                              spec.anchors.map((anchor) => (
                                <tr key={anchor.id} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-2 text-slate-900 font-bold select-all">
                                    <div className="flex flex-col">
                                      <span>{anchor.name}</span>
                                      <span className="text-[9px] text-blue-500 font-mono font-bold leading-none mt-0.5">{anchor.id}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-650">{anchor.x_mm} mm</td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-650">{anchor.y_mm} mm</td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-650">{anchor.width_mm}x{anchor.height_mm}</td>
                                  <td className="px-3 py-2 text-slate-500 font-mono text-[10px]">
                                    {anchor.font_size_pt > 0 ? `${anchor.font_family} ${anchor.font_size_pt}pt` : 'ตราสัญลักษณ์ภาพ'}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black border uppercase tracking-wider ${
                                      anchor.locked 
                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                      {anchor.locked ? 'LOCKED' : 'AI-OPEN'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-slate-400 font-medium">ไม่มีสลักพิกัดเฉพาะเจาะจง (สเปกโอนสากล)</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Validation layer C checks rules */}
                    <div>
                      <span className="font-extrabold text-slate-950 block mb-2 tracking-tight">🔍 ข้อตรวจสอบประสิทธิภาพคงเส้นคงวา (Validator Specs)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {spec.validation_rules.length > 0 ? (
                          spec.validation_rules.map((rule) => (
                            <div key={rule.rule_id} className="border border-slate-100 bg-slate-50/50 p-2.5 rounded-xl flex items-start gap-2">
                              <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border mt-0.5 ${
                                rule.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                              }`}>{rule.rule_id}</span>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight mb-0.5">{rule.name}</span>
                                <span className="text-[10px] text-slate-500 font-semibold leading-relaxed block">{rule.expected_condition}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center text-slate-400 font-medium py-3 border border-dashed border-slate-200 rounded-xl">สืบทอดกฎพื้นฐาน Linter แบบครอบจักรวาล</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'advantages' && (
          <div id="tab-advantages" className="space-y-3 animate-fade-in text-xs text-slate-600 leading-relaxed font-semibold">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="font-bold text-slate-950 block mb-1">🛡️ Thai Bureaucratic Protocol Graph (Moat ทรงคุณค่า)</span>
              ทรัพย์สินหลักไม่ใช่โมเดลเชิงภาษา แต่คือ Graph เชื่อมต่อคำวิทยากลภาษาพูดธรรม แปลเป็นโครงร่างสารบรรณตามระเบียบ ซึ่งจะฝังตัวแน่นในประเพณีการทำงานของกระทรวงและฝ่ายวิศวกรรมเอกสารราชการ
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="font-bold text-slate-950 block mb-1">💼 B2G Go-to-Market Strategy</span>
              นำเสนอเครื่องมือคอมไพเลอร์สารบรรณผ่านช่องทางสัมมนางานธุรการ ทวิภาคคีย์ประสานงาน มุ่งคุมพิกัดหน้าและลดอัตราหน้ากระดาษเสียหายสะดุดลงสู่ 0% พร้อมทั้งเพิ่มประสิทธิภาพการเขียนได้ถึง 80%
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-bold">
        <BookOpen size={14} className="text-slate-400" />
        <span>มาตรฐานสารบรรณตามลัทธิคุมพิกัดแบบ Deterministic และพระระเบียบสำนักนายกฯ</span>
      </div>
    </div>
  );
}
