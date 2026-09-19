/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { DocumentAST, ASAEDiagnostic } from '../types';
import GarudaLogo from './GarudaLogo';
import { convertToThaiNumerals, runLocalizationEngine } from '../lib/linter';
import { 
  FileText, 
  Clipboard, 
  Printer, 
  AlertCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ListChecks,
  Activity,
  History
} from 'lucide-react';

interface DocumentSimulatorProps {
  ast: DocumentAST;
  placeholderValues: Record<string, string>;
  useThaiNumerals: boolean;
  onUpdatePlaceholder: (key: string, value: string) => void;
  wordFormattedText: string;
  checksum?: string;
  status: string;
  dependencyCount: number;
  scores?: {
    structural: number;
    formatting: number;
    protocol: number;
    placeholder: number;
    overall: number;
  };
  templateId?: string;
  templateVersion?: string;
  templateHash?: string;
  docHash?: string;
  compilerHash?: string;
  auditHash?: string;
  focusedRuleId: string | null;
  zoomScale: number;
  setZoomScale: (zoom: number) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  diagnostics?: ASAEDiagnostic[];
  onSelectDiagnostic?: (code: string, documentNodeId?: string) => void;
  hoveredRuleId?: string | null;
  setHoveredRuleId?: (id: string | null) => void;
}

export default function DocumentSimulator({
  ast,
  placeholderValues,
  useThaiNumerals,
  onUpdatePlaceholder,
  wordFormattedText,
  checksum = 'SARABAN-ASAE-SECURE',
  status,
  dependencyCount,
  scores,
  templateId = 'STS-EXTLETTER-V1',
  templateVersion = 'v1.4.2',
  templateHash = 'T-4C83FF',
  docHash = 'D-000000',
  compilerHash = 'C-000000',
  auditHash = 'A-000000',
  focusedRuleId,
  zoomScale,
  setZoomScale,
  focusMode,
  onToggleFocusMode,
  diagnostics = [],
  onSelectDiagnostic,
  hoveredRuleId = null,
  setHoveredRuleId,
}: DocumentSimulatorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const isHighlighted = (rules: string[]) => {
    return (focusedRuleId && rules.includes(focusedRuleId)) || (hoveredRuleId && rules.includes(hoveredRuleId));
  };

  const getProportionalOffsetPercent = (code: string) => {
    const mapping: Record<string, number> = {
      'LAY-001': 10,          // Top - organization / header
      'LAY-003': 10,
      'PROTO-THDATE-001': 18,  // Date - center-right
      'TMP-001': 28,          // Subject - middle upper
      'PAR-001': 42,          // Body paragraphs - middle
      'LAY-002': 48,
      'PAR-002': 54,
      'CLS-001': 62,          // Closing statement - lower middle
      'SIG-001': 68,
      'SIG-002': 80,          // Signature - bottom
      'LAY-004': 86,
    };
    return mapping[code] || 40;
  };

  const handleBlockClick = (rules: string[], nodeId: string) => {
    const activeDiag = diagnostics.find(d => rules.includes(d.code));
    if (activeDiag) {
      onSelectDiagnostic?.(activeDiag.code, nodeId);
    }
  };

  // Helper function to format text with user replaced placeholders and highlight unfilled ones
  const renderTextWithPlaceholders = (text: string) => {
    if (!text) return '';

    // Scan for all occurrences of placeholders [SOMETHING] or [KEY_REQUIRED]
    const regex = /(\[[A-Z_]+_REQUIRED\]|\[[ก-๙A-Za-z0-9_]+\])/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        // Find if this placeholder has a custom value mapping
        const rawKey = Object.keys(placeholderValues).find(
          (k) => k === part || (useThaiNumerals && convertToThaiNumerals(k) === part)
        ) || part;
        const userValue = placeholderValues[rawKey];

        if (userValue && userValue.trim() !== '') {
          const processedUserValue = useThaiNumerals ? runLocalizationEngine(userValue, true) : userValue;
          return (
            <span key={index} id={`filled-placeholder-${index}`} className="text-gray-950 font-medium underline decoration-blue-400 bg-blue-50 px-0.5 rounded">
              {processedUserValue}
            </span>
          );
        } else {
          return (
            <span
              key={index}
              id={`unfilled-placeholder-${index}`}
              className={`inline-flex items-center gap-0.5 px-1 rounded text-sm font-semibold cursor-pointer py-0.5 transition-all duration-300 ${
                focusedRuleId === 'PLC-001'
                  ? 'bg-amber-100 border border-amber-400 text-amber-900 animate-pulse scale-[1.05]'
                  : 'bg-rose-50 border-b border-rose-300 text-rose-800 animate-pulse'
              }`}
              onClick={() => {
                const inputElement = document.getElementById(`placeholder-input-${rawKey}`);
                if (inputElement) {
                  inputElement.focus();
                  inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              title="คลิกเพื่อกรอกข้อมูล"
            >
              <AlertCircle size={10} className="stroke-rose-600" />
              {part}
            </span>
          );
        }
      }
      const processedPart = useThaiNumerals ? runLocalizationEngine(part, true) : part;
      return <span key={index}>{processedPart}</span>;
    });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(wordFormattedText);
      alert('คัดลอกรูปแบบพร้อมใช้งานลงในคลิปบอร์ดแล้ว! คุณสามารถนำไปกดวาง (Ctrl+V) ใน Microsoft Word ได้ทันที โดยจัดย่อหน้าและปุ่มแท็บจะถูกล็อกให้เว้นมาตรฐานโดยอัตโนมัติ');
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Safe variables with fallbacks
  const senderOrg = ast.sender_organization || 'หน่วยสารบรรณ [SENDER_ORGANIZATION_REQUIRED]';
  const docNum = ast.document_number || 'ที่ [DOC_NUMBER_REQUIRED]';
  const letterDate = ast.date || '[DATE_REQUIRED]';
  const subjectStr = ast.subject || 'เรื่อง [SUBJECT_REQUIRED]';
  const referenceStr = ast.reference || '';
  const enclosuresStr = ast.enclosures || '';
  const bodyText = ast.compiled_body_fragment || '';
  const closingText = ast.closing_protocol || '';

  return (
    <div id="document-simulator-panel" className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      {/* Top action bar buttons with premium controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-b border-slate-200">
        <div id="simulation-header" className="flex items-center gap-2">
          <FileText className="text-emerald-600" size={18} />
          <span className="text-slate-800 font-bold text-[13px]">
            เครื่องพิมพ์จำลองขนาดจริง (A4 View)
          </span>
          <span className="text-[10px] bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full font-sans font-extrabold border border-emerald-200/45">
            {ast.document_type === 'EXTERNAL_INVITATION' ? 'หนังสือภายนอก (เชิญ)' :
             ast.document_type === 'REQUEST_LETTER' ? 'หนังสือภายนอก (ขออนุมัติ)' :
             ast.document_type === 'INTERNAL_MEMO' ? 'บันทึกข้อความ (ภายใน)' :
             ast.document_type === 'EXTERNAL' ? 'หนังสือภายนอก' : 'บันทึกข้อความ'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls inside the main toolbar */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-0.5 h-8">
            <button
              onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
              className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 font-extrabold text-xs transition active:scale-95"
              title="ซูมออก (-)"
            >
              -
            </button>
            <span className="text-[11px] font-mono font-bold w-12 text-center text-slate-600 select-none">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(Math.min(1.4, zoomScale + 0.1))}
              className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 font-extrabold text-xs transition active:scale-95"
              title="ซูมเข้า (+)"
            >
              +
            </button>
          </div>

          <button
            onClick={onToggleFocusMode}
            className={`flex items-center gap-1.5 h-8 text-[11px] font-bold px-3 rounded-xl transition duration-150 border cursor-pointer ${
              focusMode
                ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
            title="โฟกัสกระดาษเอกสารสารบรรณอย่างเดียว ปิดเครื่องมือด้านข้างทั้งหมด"
          >
            <span>โฟกัสกระดาษ</span>
            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono font-bold">F</span>
          </button>

          <button
            id="copy-to-word-btn"
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 h-8 text-[11px] font-bold bg-blue-550 hover:bg-blue-600 text-white px-3 rounded-xl transition duration-150 shadow-xs cursor-pointer"
          >
            <Clipboard size={12} />
            คัดลอกลง Word
          </button>
          
          <button
            id="print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 h-8 text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl transition duration-150 shadow-xs cursor-pointer"
          >
            <Printer size={12} />
            สั่งพิมพ์ / PDF
          </button>
        </div>
      </div>

      {/* Main simulated document paper */}
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-100 select-text flex justify-center items-start relative">
        <div
          className="origin-top transition-all duration-300"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            width: '210mm',
            marginBottom: `calc(297mm * (${zoomScale} - 1))`, // Fix scrolling whitespace artifacts
          }}
        >
          <div
            ref={printRef}
            id="government-document-paper"
            className="bg-white text-slate-900 shadow-lg font-sans rounded select-text text-sm transition-all duration-300 print:shadow-none print:my-0 print:mx-auto print:border-none print:p-0"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '25mm 20mm 25mm 25mm', // Traditional Thai formal margins (Top, Right, Bottom, Left)
              boxSizing: 'border-box',
              fontFamily: '"Sarabun", "Inter", sans-serif',
              lineHeight: '1.625',
            }}
          >
            {ast.document_type === 'EXTERNAL' || ast.document_type === 'EXTERNAL_INVITATION' || ast.document_type === 'REQUEST_LETTER' ? (
              /* =======================================================
                 THAI EXTERNAL LETTER LAYOUT (หนังสือภายนอก)
                 ======================================================= */
              <div id="letter-external" className="flex flex-col h-full text-[15px]">
                {/* Garuda logo centered */}
                <div className="flex justify-center mb-6">
                  <GarudaLogo size={100} className="text-red-600 print:text-red-600" />
                </div>

                {/* Header row containing Doc Number and Sender Organization */}
                <div
                  id="simulator-sender-row"
                  className={`grid grid-cols-2 mb-4 p-2 rounded-xl transition-all duration-300 relative border border-transparent ${
                    isHighlighted(['LAY-001', 'LAY-003', 'COORD-001'])
                      ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                      : diagnostics.some(d => ['LAY-001'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-50/80 cursor-pointer'
                  }`}
                  onMouseEnter={() => setHoveredRuleId?.('LAY-001')}
                  onMouseLeave={() => setHoveredRuleId?.(null)}
                  onClick={() => handleBlockClick(['LAY-001', 'COORD-001'], 'simulator-sender-row')}
                >
                  {isHighlighted(['LAY-001']) && (
                    <div className="absolute left-2 -top-6 bg-rose-550 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ⚠️ สังกัดองค์กรต้นขั้วล้นขอบหรือว่าง (LAY-001)
                    </div>
                  )}
                  <div className="text-left font-sarabun">
                    <span className="font-bold">ที่ </span>
                    {renderTextWithPlaceholders(docNum)}
                  </div>
                  <div className="text-right font-sarabun pl-4 break-words">
                    <span className="font-bold block">{renderTextWithPlaceholders(senderOrg)}</span>
                  </div>
                </div>

                {/* Date Block aligned right of center */}
                <div className="flex justify-end mb-6">
                  <div className="w-1/2 text-left font-sarabun pl-10">
                    {renderTextWithPlaceholders(letterDate)}
                  </div>
                </div>

                {/* Core administrative parameters: Subject, Recipients, Refs, Enclosures */}
                <div 
                  id="simulator-subject-row"
                  className={`flex flex-col gap-2.5 mb-6 font-sarabun border-b border-slate-100 pb-4 p-2 rounded-xl transition-all duration-300 relative border border-transparent ${
                    isHighlighted(['TMP-001'])
                      ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                      : diagnostics.some(d => ['TMP-001'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-50/80 cursor-pointer'
                  }`}
                  onMouseEnter={() => setHoveredRuleId?.('TMP-001')}
                  onMouseLeave={() => setHoveredRuleId?.(null)}
                  onClick={() => handleBlockClick(['TMP-001'], 'simulator-subject-row')}
                >
                  {isHighlighted(['TMP-001']) && (
                    <div className="absolute left-2 -top-6 bg-rose-550 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ⚠️ ขาดชื่อเรื่องสารบรรณสำคัญ (TMP-001)
                    </div>
                  )}
                  <div className="flex">
                    <span className="font-bold min-w-[80px] shrink-0">เรื่อง</span>
                    <div className="flex-1 font-bold">{renderTextWithPlaceholders(subjectStr)}</div>
                  </div>
                  
                  <div className="flex">
                    <span className="font-bold min-w-[80px] shrink-0">เรียน</span>
                    <div className="flex-1 text-slate-800">{renderTextWithPlaceholders(ast.salutation)}</div>
                  </div>

                  {referenceStr && (
                    <div className="flex text-slate-700">
                      <span className="font-bold min-w-[80px] shrink-0">อ้างถึง</span>
                      <div className="flex-1">{renderTextWithPlaceholders(referenceStr)}</div>
                    </div>
                  )}

                  {enclosuresStr && (
                    <div className="flex text-slate-700">
                      <span className="font-bold min-w-[80px] shrink-0 font-sarabun text-sm">สิ่งที่ส่งมาด้วย</span>
                      <div className="flex-1">{renderTextWithPlaceholders(enclosuresStr)}</div>
                    </div>
                  )}
                </div>

                {/* Document Body with administrative paragraph spacing and Thai indentation (๖ อักขระ / ~48px) */}
                <div
                  id="simulator-body-container"
                  className={`flex-1 font-sarabun leading-relaxed text-justify mb-12 whitespace-pre-line p-2 rounded-xl transition-all duration-300 relative border border-transparent ${
                    isHighlighted(['PAR-001', 'LAY-002', 'PAR-002', 'CLS-001', 'SIG-001', 'ERR-HIERARCHY-01', 'PROTO-THTIME-001'])
                      ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                      : diagnostics.some(d => ['PAR-001', 'LAY-002', 'PAR-002', 'CLS-001', 'SIG-001', 'ERR-HIERARCHY-01'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-50/80 cursor-pointer'
                  }`}
                  style={{ textIndent: '48px', textJustify: 'inter-word' }}
                  onMouseEnter={() => setHoveredRuleId?.('PAR-001')}
                  onMouseLeave={() => setHoveredRuleId?.(null)}
                  onClick={() => handleBlockClick(['PAR-001', 'LAY-002', 'PAR-002', 'CLS-001', 'SIG-001', 'ERR-HIERARCHY-01'], 'simulator-body-container')}
                >
                  {isHighlighted(['PAR-001', 'LAY-002']) && (
                    <div className="absolute left-2 -top-6 bg-amber-500 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ← เยื้องสารบรรณพิกัด ๖ อักขระ (~๒.๕ ซม.)
                    </div>
                  )}
                  {isHighlighted(['PAR-002']) && (
                    <div className="absolute left-2 -top-6 bg-amber-500 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ↕ เว้นระเบียบช่องไฟระหว่างย่อหน้าสารัตถะหลัก ๔ มม.
                    </div>
                  )}
                  {isHighlighted(['ERR-HIERARCHY-01']) && (
                    <div className="absolute left-2 -top-6 bg-rose-550 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ⚠️ ระดับชั้นความเคารพคำขึ้นต้น/ลงท้ายไม่สะท้อนระดับผู้รับหนังสือ
                    </div>
                  )}
                  {renderTextWithPlaceholders(bodyText)}
                </div>

                {/* Closing block right aligned */}
                <div 
                  id="simulator-signature-block"
                  className={`flex justify-end mt-auto font-sarabun p-2 rounded-xl transition-all duration-300 relative border border-transparent ${
                    isHighlighted(['SIG-001', 'CLS-002', 'LAY-004', 'SIG-002'])
                      ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                      : diagnostics.some(d => ['SIG-002', 'LAY-004', 'CLS-002'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-50/80 cursor-pointer'
                  }`}
                  onMouseEnter={() => setHoveredRuleId?.('SIG-002')}
                  onMouseLeave={() => setHoveredRuleId?.(null)}
                  onClick={() => handleBlockClick(['SIG-001', 'CLS-002', 'LAY-004', 'SIG-002'], 'simulator-signature-block')}
                >
                  {isHighlighted(['SIG-002', 'LAY-004']) && (
                    <div className="absolute right-2 -top-12 bg-rose-550 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ↕ ต้องมีระยะเว้นปลอดภัยล่างลายมือชื่อ ๔๕-๕๕ มม.
                    </div>
                  )}
                  <div className="w-1/2 text-center flex flex-col items-center">
                    <div className="mb-10 text-[15px]">
                      {renderTextWithPlaceholders(closingText || 'ขอแสดงความนับถือ')}
                    </div>
                    <div className="w-full max-w-[280px] border-b border-slate-200/50 py-1 mb-2 text-slate-400 text-xs italic font-sans">
                      (ลงลายมือชื่อจริงของเจ้าพนักงาน)
                    </div>
                    <div className="font-bold text-slate-800">
                      ( {placeholderValues['[SIGNATURE_NAME_REQUIRED]'] || placeholderValues['[SIGNATURE_NAME]'] || 'กรอกชื่อผู้ลงนามด้านข้าง'} )
                    </div>
                    <div className="text-slate-600 text-[13px] mt-1">
                      {placeholderValues['[SIGNATURE_TITLE_REQUIRED]'] || 'ตำแหน่ง [SIGNATURE_TITLE_REQUIRED]'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* =======================================================
                 THAI INTERNAL MEMO LAYOUT (บันทึกข้อความ)
                 ======================================================= */
              <div id="letter-internal" className="flex flex-col h-full text-[15px]">
                {/* Header block with Garuda in upper-left and bold 'บันทึกข้อความ' */}
                <div className="flex items-center gap-4 mb-4 border-b-4 border-slate-900 pb-3">
                  <GarudaLogo size={75} className="text-red-600 shrink-0" />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold font-sarabun tracking-wide text-gray-900">
                      บันทึกข้อความ
                    </h1>
                  </div>
                </div>

                {/* Core internal metadata matrix */}
                <div 
                  id="simulator-sender-row-internal"
                  className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 pb-4 border-b border-dashed border-gray-300 font-sarabun text-sm p-2 rounded-xl transition-all duration-300 relative border border-transparent ${
                    isHighlighted(['LAY-001', 'LAY-003', 'COORD-001'])
                      ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                      : diagnostics.some(d => ['LAY-001'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-55'
                  }`}
                  onMouseEnter={() => setHoveredRuleId?.('LAY-001')}
                  onMouseLeave={() => setHoveredRuleId?.(null)}
                  onClick={() => handleBlockClick(['LAY-001', 'COORD-001'], 'simulator-sender-row-internal')}
                >
                  {isHighlighted(['LAY-001']) && (
                    <div className="absolute left-2 -top-6 bg-rose-550 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ⚠️ สังกัดองค์กรต้นขั้วล้นขอบหรือว่าง (LAY-001)
                    </div>
                  )}
                  <div className="flex col-span-2">
                    <span className="font-bold pr-2 shrink-0">ส่วนราชการ</span>
                    <div className="border-b border-slate-200 flex-1 pb-0.5">
                      {renderTextWithPlaceholders(senderOrg)}
                    </div>
                  </div>

                  <div className="flex">
                    <span className="font-bold pr-2 shrink-0">ที่</span>
                    <div className="border-b border-slate-200 flex-1 pb-0.5">
                      {renderTextWithPlaceholders(docNum)}
                    </div>
                  </div>

                  <div className="flex">
                    <span className="font-bold pr-2 shrink-0">วันที่</span>
                    <div className="border-b border-slate-200 flex-1 pb-0.5">
                      {renderTextWithPlaceholders(letterDate)}
                    </div>
                  </div>

                  <div 
                    id="simulator-subject-row-internal"
                    className={`flex col-span-2 p-1 rounded-xl transition-all duration-300 relative border border-transparent ${
                      isHighlighted(['TMP-001'])
                        ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                        : diagnostics.some(d => ['TMP-001'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-55'
                    }`}
                    onMouseEnter={() => setHoveredRuleId?.('TMP-001')}
                    onMouseLeave={() => setHoveredRuleId?.(null)}
                    onClick={() => handleBlockClick(['TMP-001'], 'simulator-subject-row-internal')}
                  >
                    {isHighlighted(['TMP-001']) && (
                      <div className="absolute left-2 -top-6 bg-rose-550 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                        ⚠️ ขาดชื่อเรื่องสารบรรณสำคัญ (TMP-001)
                      </div>
                    )}
                    <span className="font-bold pr-2 shrink-0">เรื่อง</span>
                    <div className="border-b border-slate-200 flex-1 pb-0.5 font-bold">
                      {renderTextWithPlaceholders(subjectStr)}
                    </div>
                  </div>
                </div>

                {/* Recipient salutation */}
                <div className="font-bold font-sarabun mb-4 text-gray-900">
                  {renderTextWithPlaceholders(ast.salutation)}
                </div>

                {/* Document Body paragraph with indent option */}
                <div
                  id="simulator-body-container-internal"
                  className={`flex-1 font-sarabun leading-relaxed text-justify mb-10 whitespace-pre-line p-2 rounded-xl transition-all duration-300 relative border border-transparent ${
                    isHighlighted(['PAR-001', 'LAY-002', 'PAR-002', 'CLS-001'])
                      ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                      : diagnostics.some(d => ['PAR-001', 'LAY-002', 'PAR-002'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-55'
                  }`}
                  style={{ textIndent: '48px', textJustify: 'inter-word' }}
                  onMouseEnter={() => setHoveredRuleId?.('PAR-001')}
                  onMouseLeave={() => setHoveredRuleId?.(null)}
                  onClick={() => handleBlockClick(['PAR-001', 'LAY-002', 'PAR-002', 'CLS-001'], 'simulator-body-container-internal')}
                >
                  {isHighlighted(['PAR-001', 'LAY-002']) && (
                    <div className="absolute left-2 -top-6 bg-amber-500 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ← เยื้องสารบรรณพิกัด ๖ อักขระ (~๒.๕ ซม.)
                    </div>
                  )}
                  {isHighlighted(['PAR-002']) && (
                    <div className="absolute left-2 -top-6 bg-amber-500 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ↕ เว้นระเบียบช่องไฟระหว่างย่อหน้าสารัตถะหลัก ๔ มม.
                    </div>
                  )}
                  {renderTextWithPlaceholders(bodyText)}
                </div>

                {/* Signature block */}
                <div 
                  id="simulator-signature-block-internal"
                  className={`flex justify-end mt-auto font-sarabun p-2 rounded-xl transition-all duration-300 relative border border-transparent ${
                    isHighlighted(['SIG-001', 'CLS-002', 'LAY-004', 'SIG-002'])
                      ? 'ring-4 ring-amber-400 ring-offset-2 bg-amber-50/50 animate-pulse scale-[1.01]'
                      : diagnostics.some(d => ['SIG-002', 'LAY-004', 'CLS-002'].includes(d.code)) ? 'border-dashed border-rose-300 hover:bg-rose-50/40 cursor-help' : 'hover:bg-slate-55'
                  }`}
                  onMouseEnter={() => setHoveredRuleId?.('SIG-002')}
                  onMouseLeave={() => setHoveredRuleId?.(null)}
                  onClick={() => handleBlockClick(['SIG-001', 'CLS-002', 'LAY-004', 'SIG-002'], 'simulator-signature-block-internal')}
                >
                  {isHighlighted(['SIG-002', 'LAY-004']) && (
                    <div className="absolute right-2 -top-12 bg-rose-550 text-white rounded px-2 py-0.5 text-[9px] font-bold z-20 shadow-md animate-bounce">
                      ↕ ต้องมีระยะเว้นปลอดภัยล่างลายมือชื่อ ๔๕-๕๕ มม.
                    </div>
                  )}
                  <div className="w-1/2 text-center flex flex-col items-center">
                    <div className="mb-2 text-slate-500 text-xs italic font-sans">
                      (ลงลายมือชื่อผู้จัดทำเอกสาร)
                    </div>
                    <div className="mb-4 text-slate-300">
                      ......................................................................
                    </div>
                    <div className="font-bold text-gray-800">
                      ( {placeholderValues['[SIGNATURE_NAME_REQUIRED]'] || placeholderValues['[SIGNATURE_NAME]'] || 'กรอกชื่อผู้ออกหนังสือ'} )
                    </div>
                    <div className="text-gray-600 text-[13px] mt-1">
                      ตำแหน่ง {placeholderValues['[SIGNATURE_TITLE_REQUIRED]'] || '[SIGNATURE_TITLE_REQUIRED]'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Compliance Minimap on the right edge */}
        {diagnostics && diagnostics.length > 0 && (
          <div id="compliance-minimap" className="absolute right-4 top-16 bottom-16 w-12 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xl rounded-2xl p-1.5 flex flex-col justify-between items-center select-none z-30 transition duration-300">
            <div className="text-[7.5px] font-black text-slate-400 text-center select-none uppercase tracking-widest pb-1 border-b border-slate-100 w-full mb-1">
              MINIMAP
            </div>
            {/* The virtual vertical scroll bar channel */}
            <div className="relative flex-grow w-full rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex flex-col">
              {/* Map active diagnostics over vertical height percentages */}
              {diagnostics.map((diag, index) => {
                const offsetPct = getProportionalOffsetPercent(diag.code);
                const colorClass = diag.severity === 'CRITICAL' ? 'bg-rose-500 hover:bg-rose-600' : diag.severity === 'WARNING' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-400 hover:bg-slate-500';
                return (
                  <button
                    key={index}
                    onClick={() => onSelectDiagnostic?.(diag.code, diag.documentNodeId)}
                    className="absolute left-0 right-0 h-2 px-1 cursor-pointer transition transform -translate-y-1/2 group z-10"
                    style={{ top: `${offsetPct}%` }}
                    title={`${diag.code}: ${diag.title}`}
                  >
                    <div className={`w-full h-full rounded-xs ${colorClass} group-hover:scale-y-125 shadow-xs transition-all`} />
                    <span className="hidden group-hover:block absolute right-7 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white rounded-lg px-2 py-1 text-[9px] font-bold whitespace-nowrap shadow-2xl">
                      [{diag.code}] {diag.title.substring(0, 30)}...
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white ${diagnostics.length === 0 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'} shadow-md`}>
                {diagnostics.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compiler Audit Footer Ribbon - Compact secure display */}
      <div className="px-6 py-2 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-slate-400">
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="text-slate-500 font-bold">SHA-256: </span>
            <span className="text-slate-300 font-black truncate max-w-[80px] inline-block align-bottom">{checksum}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold">STATE: </span>
            <span className={`font-black ${status === 'VALID' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
              {status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-bold">UNRESOLVED: </span>
            <span className={`font-black ${dependencyCount === 0 ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
              {dependencyCount}
            </span>
          </div>
        </div>
        <span className="text-slate-500 font-black">SARABAN.AI CERTIFIED RELIABILITY</span>
      </div>
    </div>
  );
}
