import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Search,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Check,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  FileText,
  AlertCircle,
  CornerDownRight,
  Undo
} from 'lucide-react';
import { DocumentAST } from '../types';

interface GovernmentCopilotProps {
  ast: DocumentAST;
  placeholderValues: Record<string, string>;
  setAst: React.Dispatch<React.SetStateAction<DocumentAST>>;
  setPlaceholderValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  originalIntent: string; // humanIntent raw text
  setSystemAlert: (alert: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
}

interface SearchResult {
  fieldKey: string;
  fieldLabel: string;
  matchedSnippet: string;
  score: number;
  explanation: string;
}

interface CopilotSuggestion {
  suggestions: {
    subject?: string;
    enclosures?: string;
    reference?: string;
    sender_organization?: string;
  };
  placeholdersToFill?: Record<string, string>;
  rationale: string;
}

interface CompareResult {
  diffHtml: string;
  stats: {
    added: number;
    removed: number;
    unchanged: number;
  };
  summary: string;
}

export default function GovernmentCopilot({
  ast,
  placeholderValues,
  setAst,
  setPlaceholderValues,
  originalIntent,
  setSystemAlert
}: GovernmentCopilotProps) {
  const [activeCopilotTab, setActiveCopilotTab] = useState<'advisor' | 'autosuggest' | 'compare' | 'explain' | 'search'>('advisor');

  // K-003 Protocol Advisor States
  const [advisorInput, setAdvisorInput] = useState('');
  const [advisorChat, setAdvisorChat] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: 'สวัสดีครับ ผมคือเสนาธิการสารบรรณ AI สะพานความรู้เชิงวิชาการสารบรรณของท่าน มีข้อสงสัยเรื่องคำขึ้นต้น คำลงท้าย หรือระเบียบสำนักนายกรัฐมนตรีข้อใด สามารถปรึกษาได้ทันทีครับ คัดกรองบทกฎหมายและมารยาททางรัฐการให้เสมอครับ'
    }
  ]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // K-007 Intelligent Template Completion States
  const [completionData, setCompletionData] = useState<CopilotSuggestion | null>(null);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);

  // K-005/K-006 Track Changes & Document Comparison States
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [customTextA, setCustomTextA] = useState('');
  const [customTextB, setCustomTextB] = useState('');
  const [compareMode, setCompareMode] = useState<'intent_vs_compiled' | 'custom'>('intent_vs_compiled');

  // K-002 Explain This Section States
  const [selectedSection, setSelectedSection] = useState<'compiled_body_fragment' | 'subject' | 'sender_organization' | 'salutation'>('compiled_body_fragment');
  const [explanationText, setExplanationText] = useState('');
  const [isExplainLoading, setIsExplainLoading] = useState(false);

  // K-001 Semantic Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Scroll current chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [advisorChat, isAdvisorLoading]);

  // Execute Semantic Search (K-001)
  const handleSemanticSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchLoading(true);
    try {
      const response = await fetch('/api/copilot/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search_query: searchQuery,
          document_context: { ast, placeholderValues }
        })
      });

      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อระบบค้นหาความหมาย');
      const data = await response.json();
      setSearchResults(data.matches || []);
      if (data.matches && data.matches.length > 0) {
        setSystemAlert({ type: 'success', message: `ค้นหาพบคีย์ที่มีความเกี่ยวข้องเชิงความหมายทั้งหมด ${data.matches.length} รายการ` });
      } else {
        setSystemAlert({ type: 'info', message: 'ไม่พบคีย์ที่มีนัยสำคัญเชิงความหมายที่เข้าคู่กันสูง' });
      }
    } catch (error: any) {
      setSystemAlert({ type: 'error', message: error.message || 'ระบบไม่สามารถประมวลผลการค้นหาได้' });
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Jump to and Flash Target Element (K-001 Navigation helper)
  const jumpToField = (fieldKey: string) => {
    const mapKeyToId: Record<string, string> = {
      sender_organization: 'simulator-sender-row',
      document_number: 'simulator-sender-row',
      date: 'simulator-sender-row',
      subject: 'simulator-subject-row',
      reference: 'simulator-subject-row',
      enclosures: 'simulator-subject-row',
      salutation: 'simulator-sender-row',
      compiled_body_fragment: 'simulator-body-container'
    };

    const targetId = mapKeyToId[fieldKey];
    if (!targetId) return;

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-400', 'ring-offset-2', 'bg-amber-50/50', 'animate-pulse');
      setSystemAlert({ type: 'info', message: `กำลังขยับเป้าสู่ฟิลด์: ${fieldKey}` });
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-amber-400', 'ring-offset-2', 'bg-amber-50/50', 'animate-pulse');
      }, 3000);
    }
  };

  // Talk to Protocol Advisor (K-003)
  const handleAdvisorSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!advisorInput.trim() || isAdvisorLoading) return;

    const userMsg = advisorInput;
    setAdvisorChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setAdvisorInput('');
    setIsAdvisorLoading(true);

    try {
      const response = await fetch('/api/copilot/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: advisorChat.slice(-10), // Limit history context
          document_context: { ast, placeholderValues }
        })
      });

      if (!response.ok) throw new Error('เกิดปัญหากลไกตอบรับ AI เสนาธิการสารบรรณ');
      const data = await response.json();
      setAdvisorChat(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (error: any) {
      setSystemAlert({ type: 'error', message: error.message || 'ที่ปรึกษาสัญญาณขาดหายชั่วคราว' });
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Get Section Explanation (K-002)
  const handleExplainSection = async () => {
    let textToExplain = '';
    let name = '';
    if (selectedSection === 'compiled_body_fragment') {
      textToExplain = ast.compiled_body_fragment;
      name = 'เนื้อหาหนังสือสารบรรณชั้นใน (Body File)';
    } else if (selectedSection === 'subject') {
      textToExplain = ast.subject || 'ยังไม่ได้ระบุ';
      name = 'เรื่องหนังสือราชการ (Document Subject)';
    } else if (selectedSection === 'sender_organization') {
      textToExplain = ast.sender_organization || 'ยังไม่ได้ระบุ';
      name = 'ส่วนราชการเจ้าของหนังสือ';
    } else if (selectedSection === 'salutation') {
      textToExplain = ast.salutation || 'ยังไม่ได้ระบุ';
      name = 'คำขึ้่นต้นและระเบียบเกณฑ์รับเรียนหนังสือ';
    }

    if (!textToExplain) {
      setSystemAlert({ type: 'error', message: 'กรุณากรอกข้อความในฟิลด์ที่ส่งติตลาดเพื่ออธิบาย' });
      return;
    }

    setIsExplainLoading(true);
    setExplanationText('');
    try {
      const response = await fetch('/api/copilot/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToExplain, section_name: name })
      });

      if (!response.ok) throw new Error('บริการให้คำอธิบายระบบสารบรรณติดขัด');
      const data = await response.json();
      setExplanationText(data.explanation || '');
      setSystemAlert({ type: 'success', message: 'สลักสกัดความเข้าใจระเบียบเรียบร้อยแล้ว' });
    } catch (error: any) {
      setSystemAlert({ type: 'error', message: error.message });
    } finally {
      setIsExplainLoading(false);
    }
  };

  // K-007 Smart Auto Complete Suggestions
  const handleAnalyzeCompletion = async () => {
    setIsCompletionLoading(true);
    setCompletionData(null);
    try {
      const response = await fetch('/api/copilot/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_context: { ast, placeholderValues } })
      });

      if (!response.ok) throw new Error('เกิดความล่าช้าในฟอร์แมตเตอร์เชิงอนุมาน');
      const data = await response.json();
      setCompletionData(data);
      setSystemAlert({ type: 'success', message: 'วิเคราะห์โครงสร้างข้อมูลตกหล่นและแนวทางร่างเสร็จสิ้น!' });
    } catch (error: any) {
      setSystemAlert({ type: 'error', message: error.message });
    } finally {
      setIsCompletionLoading(false);
    }
  };

  // Apply suggestions to AST and Placeholders (K-007 action)
  const applyCompletionSuggestions = () => {
    if (!completionData) return;

    // Apply main suggestions
    setAst(prev => ({
      ...prev,
      subject: completionData.suggestions.subject || prev.subject,
      enclosures: completionData.suggestions.enclosures || prev.enclosures,
      reference: completionData.suggestions.reference || prev.reference,
      sender_organization: completionData.suggestions.sender_organization || prev.sender_organization
    }));

    // Apply placeholder answers if any
    if (completionData.placeholdersToFill) {
      setPlaceholderValues(prev => {
        const next = { ...prev };
        Object.entries(completionData.placeholdersToFill || {}).forEach(([key, val]) => {
          if (!next[key] || next[key].trim() === '') {
            next[key] = val;
          }
        });
        return next;
      });
    }

    setSystemAlert({ type: 'success', message: 'นำข้อเสนอเสนอแนะเติมข้อมูลเข้าเอกสารหลักทันทีแบบไม่ทำลายเลย์เอาต์!' });
    setCompletionData(null);
  };

  // Compare documents (K-005/K-006)
  const handleCompareDocs = async () => {
    const textA = compareMode === 'intent_vs_compiled' ? originalIntent : customTextA;
    const textB = compareMode === 'intent_vs_compiled' ? ast.compiled_body_fragment : customTextB;

    if (!textA.trim() || !textB.trim()) {
      setSystemAlert({ type: 'error', message: 'กรุณากรอกข้อความต้นร่างทั้งสองฉบับเพื่อเปรียบต่างเชิงโครงสร้าง' });
      return;
    }

    setIsCompareLoading(true);
    setCompareResult(null);
    try {
      const response = await fetch('/api/copilot/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textA, textB })
      });

      if (!response.ok) throw new Error('สารสนเทศวิเคราะห์ความต่างติดลัดคิว');
      const data = await response.json();
      setCompareResult(data);
      setSystemAlert({ type: 'success', message: 'เปรียบเทียบเรียบร้อย! คุ้มครองการแก้ไขสีเชิงวินัยสารบรรณ' });
    } catch (error: any) {
      setSystemAlert({ type: 'error', message: error.message });
    } finally {
      setIsCompareLoading(false);
    }
  };

  // Auto trigger comparison on mount or intent change
  useEffect(() => {
    if (activeCopilotTab === 'compare' && compareMode === 'intent_vs_compiled' && originalIntent.trim()) {
      handleCompareDocs();
    }
  }, [activeCopilotTab, compareMode]);

  return (
    <div id="government-copilot-panel" className="bg-white rounded-2xl flex flex-col h-full border border-slate-100 select-text font-sarabun antialiased">
      
      {/* Tab Navigation header */}
      <div className="grid grid-cols-5 gap-0.5 bg-slate-105 p-1 rounded-xl border border-slate-200 shadow-3xs text-[10px] font-black shrink-0">
        <button
          onClick={() => setActiveCopilotTab('advisor')}
          className={`py-2 text-center rounded-lg transition cursor-pointer flex flex-col items-center gap-1 ${
            activeCopilotTab === 'advisor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          <MessageSquare size={13} />
          <span>AI ที่ปรึกษา</span>
        </button>

        <button
          onClick={() => setActiveCopilotTab('autosuggest')}
          className={`py-2 text-center rounded-lg transition cursor-pointer flex flex-col items-center gap-1 ${
            activeCopilotTab === 'autosuggest'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          <Sparkles size={13} />
          <span>วิเคราะห์ข้อมูล</span>
        </button>

        <button
          onClick={() => setActiveCopilotTab('compare')}
          className={`py-2 text-center rounded-lg transition cursor-pointer flex flex-col items-center gap-1 ${
            activeCopilotTab === 'compare'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          <RefreshCw size={13} />
          <span>เปรียบต่าง</span>
        </button>

        <button
          onClick={() => setActiveCopilotTab('explain')}
          className={`py-2 text-center rounded-lg transition cursor-pointer flex flex-col items-center gap-1 ${
            activeCopilotTab === 'explain'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          <HelpCircle size={13} />
          <span>ขยายความ</span>
        </button>

        <button
          onClick={() => setActiveCopilotTab('search')}
          className={`py-2 text-center rounded-lg transition cursor-pointer flex flex-col items-center gap-1 ${
            activeCopilotTab === 'search'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          <Search size={13} />
          <span>ค้นหาพิกัด</span>
        </button>
      </div>

      {/* Main Tab Content Body (Scrollable) */}
      <div className="flex-grow overflow-auto p-3 text-xs leading-relaxed">
        
        {/* TAB 1: K-003 Protocol Advisor */}
        {activeCopilotTab === 'advisor' && (
          <div className="flex flex-col h-[480px] max-h-[550px]">
            {/* Header explaining K-003 */}
            <div className="p-2.5 bg-blue-50/50 border border-blue-150 rounded-xl mb-3 flex items-start gap-2 select-none">
              <Brain size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[11px] text-blue-900 block font-sans">K-003 Protocol & Regulation Advisor</span>
                <span className="text-[10px] text-slate-500">เสนาธิการด้านสารบรรณอ้างระเบียบสำนักนายกฯ ให้คำแนะนำเรื่องคำขึ้นต้น คำลงท้าย การแบ่งโครง และนัยการอ้างระเบียบ</span>
              </div>
            </div>

            {/* Chat Box Scrollable Area */}
            <div className="flex-grow overflow-auto border border-slate-150 rounded-xl p-3 bg-slate-50/40 space-y-3 mb-2.5">
              {advisorChat.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-[11.5px] ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-3xs'
                      : 'bg-white border border-slate-200/80 text-slate-700 rounded-tl-none shadow-3xs'
                  }`}>
                    {msg.role === 'model' ? (
                      <div className="whitespace-pre-line prose max-w-none text-slate-700">{msg.text}</div>
                    ) : (
                      <p className="whitespace-pre-line">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {isAdvisorLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-3.5 space-y-1.5 shadow-2xs select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-extrabold uppercase font-sans animate-pulse">
                        เสนาธิการ AI กำลังเปิดตำราระเบียบ...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input send bar */}
            <form onSubmit={handleAdvisorSend} className="flex gap-1.5 shrink-0 select-none">
              <input
                type="text"
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                placeholder="ถามเรื่องระเบียบ: 'เรียนท่านรัฐมนตรีกระทรวงสาธารณสุข ควรใช้อะไรครับ?'"
                className="flex-1 px-3 py-2 bg-white border border-slate-250 focus:border-blue-500 outline-none rounded-xl text-xs font-medium"
                disabled={isAdvisorLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 rounded-xl transition cursor-pointer text-xs"
                disabled={isAdvisorLoading || !advisorInput.trim()}
              >
                ถามเสนาฯ
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: K-004 Missing Info & K-007 Smart Template Completion */}
        {activeCopilotTab === 'autosuggest' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl mb-3 flex items-start gap-2.5">
              <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[11.5px] text-amber-900 block font-sans">K-004 / K-007 Smart Completion Framework</span>
                <span className="text-[10px] text-slate-500">วิเคราะห์ใจความเด่นและโครงเนื้อความ เพื่อสกัดข้อเสนอการกรอกข้อมูลระดับส่วนหัว (เรื่อง, อ้างถึง, หน่วยงาน) เพื่อไม่เพิ่มภาระความเฉื่อยทางการ</span>
              </div>
            </div>

            <button
              onClick={handleAnalyzeCompletion}
              disabled={isCompletionLoading}
              className="w-full py-2.5 bg-slate-900 text-slate-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none hover:bg-black transition-all active:scale-[0.98]"
            >
              <Brain size={14} className={isCompletionLoading ? 'animate-spin' : ''} />
              {isCompletionLoading ? 'กำลังวิเคราะห์เนื้อหาเชิงสารบรรณ...' : 'วิเคราะห์ข้อมูลตรวจตกหล่น (Analyze Completeness)'}
            </button>

            {completionData && (
              <div className="space-y-3 mt-4 border border-slate-200 rounded-xl p-3.5 bg-white shadow-2xs antialiased">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 select-none">
                  <span className="font-black text-slate-800 text-[11px] flex items-center gap-1">
                    <FileText size={13} className="text-amber-600" />
                    ข้อเสนอการกรอกตารางหนังสืออัตโนมัติ
                  </span>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[9px]">
                    SUGGESTIONS READY
                  </span>
                </div>

                <div className="space-y-2.5">
                  {completionData.suggestions.subject && (
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] text-slate-400 font-bold block uppercase">เรื่องหนังสือที่ประเมิน</span>
                      <div className="bg-slate-50 border border-slate-150 px-3 py-2 rounded-lg font-medium text-slate-700 flex items-center gap-2">
                        <CornerDownRight size={11} className="text-amber-500 shrink-0" />
                        <div>{completionData.suggestions.subject}</div>
                      </div>
                    </div>
                  )}

                  {completionData.suggestions.sender_organization && (
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] text-slate-400 font-bold block uppercase">หน่วยงานหลักผู้ลงนาม</span>
                      <div className="bg-slate-50 border border-slate-150 px-3 py-2 rounded-lg font-medium text-slate-700 flex items-center gap-2">
                        <CornerDownRight size={11} className="text-amber-500 shrink-0" />
                        <div>{completionData.suggestions.sender_organization}</div>
                      </div>
                    </div>
                  )}

                  {(completionData.suggestions.enclosures || completionData.suggestions.reference) && (
                    <div className="grid grid-cols-2 gap-2">
                      {completionData.suggestions.reference && (
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-slate-400 font-bold block uppercase">อ้างอิงถึงหนังสือ</span>
                          <div className="bg-slate-50 border border-slate-150 px-2 py-1.5 rounded-lg text-[10px] text-slate-600 font-mono truncate">
                            {completionData.suggestions.reference}
                          </div>
                        </div>
                      )}
                      {completionData.suggestions.enclosures && (
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-slate-400 font-bold block uppercase">สิ่งที่ส่งมาด้วย</span>
                          <div className="bg-slate-50 border border-slate-150 px-2 py-1.5 rounded-lg text-[10px] text-slate-600 font-mono truncate">
                            {completionData.suggestions.enclosures}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {completionData.placeholdersToFill && Object.keys(completionData.placeholdersToFill).length > 0 && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg space-y-1">
                      <span className="text-[9.5px] text-rose-700 font-black block flex items-center gap-1 select-none">
                        <AlertCircle size={11} />
                        ตรวจพบตัวแปร Placeholder ที่ควรเติมตามข้อความ ({Object.keys(completionData.placeholdersToFill).length} จุด)
                      </span>
                      <div className="space-y-1">
                        {Object.entries(completionData.placeholdersToFill).map(([ph, suggestVal]) => (
                          <div key={ph} className="flex items-center justify-between text-[10px] bg-white px-2 py-1 border border-rose-200 rounded-sm">
                            <span className="font-mono text-slate-400">{ph}</span>
                            <span className="text-rose-950 font-bold flex items-center gap-0.5">
                              <ArrowRight size={10} className="text-rose-400" />
                              {suggestVal}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {completionData.rationale && (
                    <div className="p-3 bg-amber-50/30 border border-amber-100 rounded-lg text-[10.5px] text-slate-500 italic">
                      <strong>เหตุผลตามกฎสารบรรณ:</strong> {completionData.rationale}
                    </div>
                  )}

                  <button
                    onClick={applyCompletionSuggestions}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition shadow-sm cursor-pointer text-xs select-none flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Check size={12} />
                    นำเข้าเขียนตารางหลักทันที (Apply suggestions)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: K-005 Track Changes / K-006 Comparison */}
        {activeCopilotTab === 'compare' && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl mb-2 flex items-start gap-2 select-none">
              <RefreshCw size={15} className="text-emerald-600 shrink-0 mt-0.5 animate-spin-slow" />
              <div>
                <span className="font-extrabold text-[11.5px] text-emerald-900 block font-sans">K-005 / K-006 Administrative Track Changes</span>
                <span className="text-[10px] text-slate-500">ขยายทิศเปรียบเทียบจาก ร่างภาษาพูดดั้งเดิม (เจตจำนง) เทียบกับสารบรรณทางการ หรือเอกสารร่างสองตัว</span>
              </div>
            </div>

            {/* Toggle Modes */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg text-[10.5px] font-bold select-none mb-3">
              <button
                onClick={() => setCompareMode('intent_vs_compiled')}
                className={`py-1 rounded cursor-pointer text-center ${
                  compareMode === 'intent_vs_compiled' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                เทียบต้นร่างเจตจำนง VS สารบรรณ AI
              </button>
              <button
                onClick={() => setCompareMode('custom')}
                className={`py-1 rounded cursor-pointer text-center ${
                  compareMode === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                เปรียบเทียบ 2 ร่างพิมพ์อิสระ
              </button>
            </div>

            {compareMode === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="space-y-1">
                  <label className="font-bold text-[10px] text-slate-400 uppercase select-none">ร่างเดิม (Text A)</label>
                  <textarea
                    value={customTextA}
                    onChange={(e) => setCustomTextA(e.target.value)}
                    placeholder="ป้อนข้อความร่างเอกสารต้นฉบับ..."
                    className="w-full h-24 p-2 border border-slate-200 rounded-lg outline-none text-[11.5px] font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[10px] text-slate-400 uppercase select-none">ร่างแก้ไข (Text B)</label>
                  <textarea
                    value={customTextB}
                    onChange={(e) => setCustomTextB(e.target.value)}
                    placeholder="ป้อนข้อความราชการที่มีการปรับปรุงใหม่..."
                    className="w-full h-24 p-2 border border-slate-200 rounded-lg outline-none text-[11.5px] font-sans"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleCompareDocs}
              disabled={isCompareLoading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition cursor-pointer text-xs select-none shadow"
            >
              {isCompareLoading ? 'กำลังประมวลความแตกต่างคำ...' : 'ป้อนเปรียบเทียบเรียลไทม์ (Compare Changes)'}
            </button>

            {compareResult && (
              <div className="space-y-4 mt-3 mt-4 border border-slate-200/90 rounded-2xl p-4 bg-white shadow-2xs antialiased">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-[12.5px] text-slate-800 flex items-center gap-1.5 select-none">
                    <Check size={14} className="text-emerald-500" />
                    แผนภาพตารางเทียบต่าง (Track Changes Model)
                  </span>
                  
                  {/* Stats Badges */}
                  <div className="flex gap-1 lg:gap-1.5 select-none text-[9.5px] font-mono">
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">+{compareResult.stats.added}</span>
                    <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-black">-{compareResult.stats.removed}</span>
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">={compareResult.stats.unchanged}</span>
                  </div>
                </div>

                {/* Diff Html Render and Explanations */}
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 max-h-56 overflow-auto font-sarabun text-xs leading-relaxed space-y-1.5">
                    <p className="text-[9.5px] uppercase font-bold text-slate-400 select-none pb-1.5 border-b border-slate-100">
                      แผนภูมิลายเส้นลบเพิ่ม (Visual Diff Grid):
                    </p>
                    <div 
                      className="whitespace-pre-wrap leading-relaxed select-text"
                      dangerouslySetInnerHTML={{ __html: compareResult.diffHtml }} 
                    />
                  </div>

                  {compareResult.summary && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase select-none block">หลักวิจัยการวิเคราะห์ (Analysis Index):</span>
                      <p className="text-[11.5px] text-slate-600 text-justify">{compareResult.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: K-002 Explain Section */}
        {activeCopilotTab === 'explain' && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-150 rounded-xl mb-3 flex items-start gap-2 select-none">
              <HelpCircle size={15} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[11.5px] text-purple-900 block font-sans">K-002 In-Document Explain Engine</span>
                <span className="text-[10px] text-slate-500">คลิกประเมินย่อหน้าส่วนหัว หรือส่วนเนื้อจดหมายหลัก เพื่อขอรับคำอธิบายใจความ และนัยสัมพัทธ์ทางระเบียบสำนักนายกฯ ของสารบรรณข้อนั้น</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-slate-400 uppercase select-none">เลือกส่วนจัดพิกัดที่คุณต้องการอธิบาย</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:border-purple-500 font-medium"
              >
                <option value="compiled_body_fragment">โครงเนื้อความเอกสารหลัก (Body Segment)</option>
                <option value="subject">ชื่อเรื่องจดหมาย (Document Subject)</option>
                <option value="sender_organization">หน่วยงานผู้ขอกรรมสิทธิ์ (Sender Org)</option>
                <option value="salutation">การกราบเรียนเรียนรับและคำขึ้นต้น (Salutation Protocol)</option>
              </select>
            </div>

            <button
              onClick={handleExplainSection}
              disabled={isExplainLoading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition cursor-pointer text-xs select-none shadow flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Brain size={14} className={isExplainLoading ? 'animate-spin' : ''} />
              {isExplainLoading ? 'กำลังถอนเจตจำนงระเบียบ...' : 'ดึงโครงอธิบาย (Explain Section)'}
            </button>

            {explanationText && (
              <div className="mt-3 border border-purple-150 rounded-xl p-4 bg-white shadow-2xs antialiased max-h-72 overflow-auto">
                <span className="font-extrabold text-[12px] text-purple-950 block border-b border-purple-100 pb-1.5 mb-2 flex items-center gap-1 select-none">
                  <Brain size={13} />
                  รายงานแยกนัยสารบรรณชั้นวิเคราะห์
                </span>
                <div className="whitespace-pre-line text-[11px] text-slate-650 leading-relaxed text-justify">
                  {explanationText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: K-001 Semantic Search & Navigation */}
        {activeCopilotTab === 'search' && (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl mb-3 flex items-start gap-2 select-none">
              <Search size={15} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[11.5px] text-indigo-900 block font-sans">K-001 Semantic Search Navigator</span>
                <span className="text-[10px] text-slate-500">ค้นความหมายข้ามฟิลด์ เช่น พิมพ์ "ขอยืมตึกประชุม" ระบบจะวิเคราะห์หาคำใกล้ชิด (เช่น "ขอความอนุเคราะห์สถานที่") และพาจั๊มป์ไปจุดนั้นทันที</span>
              </div>
            </div>

            {/* Form query */}
            <form onSubmit={handleSemanticSearch} className="flex gap-2 mb-2 select-none">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ป้อนคำค้นความหมาย: 'ขอทรัพย์สิน', 'ส่งเอกสาร', 'เรียนนายก'"
                className="flex-1 px-3 py-2 bg-white border border-slate-250 focus:border-indigo-500 outline-none rounded-xl text-xs font-semibold"
                disabled={isSearchLoading}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 rounded-xl transition cursor-pointer text-xs"
                disabled={isSearchLoading || !searchQuery.trim()}
              >
                ค้นหา
              </button>
            </form>

            {isSearchLoading && (
              <div className="py-8 text-center bg-slate-50 border border-slate-100 rounded-xl select-none">
                <Brain size={20} className="text-indigo-500 animate-spin mx-auto mb-2" />
                <span className="text-[10.5px] text-slate-400 font-bold uppercase font-sans tracking-wide">
                  กำลังวิ่งหาความอุปมาอุปไมยข้ามฟิลด์...
                </span>
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2 mt-4">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block select-none">
                  ผลการตรวจเปรียบเทียบเชิงความหมาย (Semantic matches):
                </span>
                
                <div className="space-y-2 max-h-80 overflow-auto">
                  {searchResults.map((match, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-white border border-slate-150 hover:border-indigo-300 rounded-xl transition cursor-pointer flex flex-col justify-between shadow-3xs"
                      onClick={() => jumpToField(match.fieldKey)}
                    >
                      <div className="flex items-center justify-between border-b border-slate-50 pb-1.5 mb-1.5">
                        <span className="font-extrabold text-[11px] text-slate-700 flex items-center gap-1">
                          <CornerDownRight size={12} className="text-indigo-500" />
                          {match.fieldLabel} <span className="text-[9px] font-mono text-slate-405">({match.fieldKey})</span>
                        </span>
                        
                        <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                          match.score >= 80 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {match.score}% MATCH
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] italic text-slate-400">"{match.matchedSnippet}"</p>
                        <p className="text-[10.5px] text-slate-500 font-medium bg-slate-50 p-2 border border-slate-100 rounded-lg">
                          <strong>นัยความหมาย:</strong> {match.explanation}
                        </p>
                        <span className="text-[9px] text-indigo-600 font-extrabold flex items-center gap-1 select-none pt-1">
                          คลิกเพื่อเลื่อนพารากราฟขอบจอ &gt;&gt;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Branding Layer K */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-[9px] text-slate-400 select-none shrink-0 font-mono">
        <span className="font-extrabold uppercase">Government Copilot Layer K</span>
        <span className="font-black">CORE INTELLIGENCE & INTERACTION</span>
      </div>

    </div>
  );
}
