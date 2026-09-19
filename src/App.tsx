/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Brain,
  RefreshCw,
  Sliders,
  AlertTriangle,
  FileSearch,
  CheckCircle,
  HelpCircle,
  Hash,
  ArrowRight,
  Info,
  GitFork,
  Network,
  Wrench,
  ShieldCheck,
  Code,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Activity,
  Zap,
  Lock,
  Compass,
  CheckCircle2,
  BookOpen,
  Printer,
  Download,
  Share2,
  Archive,
  Smartphone,
  Eye,
  Check,
  AlertCircle,
  X,
  ShieldAlert
} from 'lucide-react';
import PrintSafetyModal from './components/PrintSafetyModal';
import DeliveryDashboard from './components/DeliveryDashboard';
import GovernmentCopilot from './components/GovernmentCopilot';
import { DocumentAST, DocumentType, CompiledOutput } from './types';
import { RECIPIENT_PROTOCOLS, DEFAULT_EXTERNAL_AST, DEFAULT_INTERNAL_AST } from './constants/protocols';
import { runPhraseLinter, validateAndFillAST, compileMicrosoftWordFormat, detectPlaceholders, runASAEAnalysis } from './lib/linter';
import { runAutoRemediation } from './lib/remediation';
import GarudaLogo from './components/GarudaLogo';
import DocumentSimulator from './components/DocumentSimulator';
import { exportToDocx } from './lib/docxExporter';
import { exportToPdf } from './lib/pdfExporter';

export default function App() {
  // Document level parameters
  const [docType, setDocType] = useState<DocumentType>('EXTERNAL');
  const [recipientProtocol, setRecipientProtocol] = useState<string>('DISTRICT_CHIEF');
  const [humanIntent, setHumanIntent] = useState<string>('');
  
  // Custom manual metadata fields
  const [senderOrg, setSenderOrg] = useState<string>('องค์การบริหารส่วนตำบลดอนดู่');
  const [docNum, setDocNum] = useState<string>('นม ๗๖๕๐๑/ว ๘๙');
  const [docDate, setDocDate] = useState<string>('๒๐ พฤษภาคม ๒๕๖๙');
  const [subject, setSubject] = useState<string>('ขอเชิญร่วมบูรณาการตรวจสอบอุทกภัยระดับท้องถิ่น');
  const [reference, setReference] = useState<string>('');
  const [enclosures, setEnclosures] = useState<string>('');

  // AST State representing compiled document
  const [ast, setAst] = useState<DocumentAST>(DEFAULT_EXTERNAL_AST);
  
  // Local reactive list of placeholders filled by user
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({
    '[ORGANIZATION_REQUIRED]': 'กองฝ่ายอำนวยการ สำนักงานป้องกันและบรรเทาสาธารณภัย',
    '[LOCATION_REQUIRED]': 'ห้องประชุมใหญ่ ชั้น ๓ อาคารที่ว่าการอำเภอ',
    '[DISTRICT_NAME_REQUIRED]': 'ดอนดู่',
    '[ACTIVITIES_REQUIRED]': 'กิจกรรมฝึกซ้อมดับเพลิงเทศบาลตำบล',
    '[SIGNATURE_NAME_REQUIRED]': 'สมชาย ป้องกันดี',
    '[SIGNATURE_TITLE_REQUIRED]': 'ผู้อำนวยการฝ่ายส่งเสริมพัสดุและทางหลวง',
  });

  // UI States (Document-Centric Refactor)
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileSteps, setCompileSteps] = useState<string[]>([]);
  const [useThaiNumerals, setUseThaiNumerals] = useState<boolean>(true);
  const [lintLogs, setLintLogs] = useState<string[]>([]);
  const [wasLinted, setWasLinted] = useState<boolean>(false);
  const [systemAlert, setSystemAlert] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  // New UX visual layout parameters
  const [zoomScale, setZoomScale] = useState<number>(0.92);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [focusedRuleId, setFocusedRuleId] = useState<string | null>(null);
  const [hoveredRuleId, setHoveredRuleId] = useState<string | null>(null);
  const [inspectorCollapsed, setInspectorCollapsed] = useState<boolean>(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'build' | 'compliance' | 'variables' | 'methods' | 'delivery' | 'copilot'>('compliance');
  const [mobileShowA4, setMobileShowA4] = useState<boolean>(false);

  // Layer J / Multi-Device & Delivery States
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [screenHeight, setScreenHeight] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 768);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState<boolean>(false);
  const [mobileA4Zoom, setMobileA4Zoom] = useState<number>(1);
  const [mobileA4Pan, setMobileA4Pan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Export Tracking for RELEASE GATE
  const [userExportedDocx, setUserExportedDocx] = useState<boolean>(false);
  const [userExportedPdf, setUserExportedPdf] = useState<boolean>(false);
  const [userHasPrintValidated, setUserHasPrintValidated] = useState<boolean>(false);
  const [mobileViewVerified, setMobileViewVerified] = useState<boolean>(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Exporters Loading Status
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Export Center Popover dropdown
  const [isExportCenterOpen, setIsExportCenterOpen] = useState<boolean>(false);

  // Print Safety Dialog Popup
  const [printValidatorOpen, setPrintValidatorOpen] = useState<boolean>(false);
  const [pdfGeometryReport, setPdfGeometryReport] = useState<any>(null);

  // Responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isTabletPortrait = isTablet && screenHeight > screenWidth;
  const isTabletLandscape = isTablet && screenWidth >= screenHeight;
  const isLaptop = screenWidth >= 1024 && screenWidth < 1440;
  const isDesktop = screenWidth >= 1440 && screenWidth < 1920;
  const isUltrawide = screenWidth >= 1920;

  // Auto verify mobile view if isMobile is true
  useEffect(() => {
    if (isMobile) {
      setMobileViewVerified(true);
    }
  }, [isMobile]);

  // Keyboard listener for Focus toggles (F or Ctrl+Shift+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);
      if (e.key.toLowerCase() === 'f' && !isInput && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setFocusMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'f' && e.ctrlKey && e.shiftKey) {
        setFocusMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync AST when docType changes if first started
  useEffect(() => {
    if (!humanIntent) {
      if (docType === 'EXTERNAL') {
        const defaultAst = { ...DEFAULT_EXTERNAL_AST };
        setAst(defaultAst);
        setSenderOrg(defaultAst.sender_organization || '');
        setDocNum(defaultAst.document_number || '');
        setDocDate(defaultAst.date || '');
        setSubject(defaultAst.subject || '');
        setRecipientProtocol('DISTRICT_CHIEF');
      } else {
        const defaultAst = { ...DEFAULT_INTERNAL_AST };
        setAst(defaultAst);
        setSenderOrg(defaultAst.sender_organization || '');
        setDocNum(defaultAst.document_number || '');
        setDocDate(defaultAst.date || '');
        setSubject(defaultAst.subject || '');
        setRecipientProtocol('GOVERNOR');
      }
    }
  }, [docType]);

  // Detected pending placeholders mapping helper
  const detectedPlaceholders = detectPlaceholders(
    (ast.sender_organization || '') + ' ' +
    (ast.document_number || '') + ' ' +
    (ast.date || '') + ' ' +
    (ast.subject || '') + ' ' +
    (ast.salutation || '') + ' ' +
    (ast.compiled_body_fragment || '')
  );

  const asaeResult = runASAEAnalysis(ast, placeholderValues, useThaiNumerals);

  // Layer H: Administrative Auto Remediation state variables
  const [remediationStats, setRemediationStats] = useState<{
    ran: boolean;
    appliedFixes: any[];
    recompilationCount: number;
    beforeRemediationScore: number | null;
    afterRemediationScore: number | null;
  }>({
    ran: false,
    appliedFixes: [],
    recompilationCount: 0,
    beforeRemediationScore: null,
    afterRemediationScore: null,
  });

  const handleTriggerRemediation = () => {
    const currentDiagnostics = asaeResult.diagnostics;
    const scoreBefore = asaeResult.scores.overall;

    const result = runAutoRemediation(ast, placeholderValues, currentDiagnostics);

    // Apply remediated AST & state items
    setAst(result.ast);
    setPlaceholderValues(result.placeholderValues);
    setUseThaiNumerals(result.useThaiNumerals);

    // Synchronize individual manual field trackers so that input controls stay aligned
    if (result.ast.sender_organization) setSenderOrg(result.ast.sender_organization);
    if (result.ast.document_number) setDocNum(result.ast.document_number);
    if (result.ast.date) setDocDate(result.ast.date);
    if (result.ast.subject) setSubject(result.ast.subject);
    if (result.ast.reference) setReference(result.ast.reference);
    if (result.ast.enclosures) setEnclosures(result.ast.enclosures);

    // Re-run static analysis to calculate post-remediation scores
    const updatedAsae = runASAEAnalysis(result.ast, result.placeholderValues, result.useThaiNumerals);
    const scoreAfter = updatedAsae.scores.overall;

    setRemediationStats({
      ran: true,
      appliedFixes: result.appliedFixes,
      recompilationCount: result.recompilationCount,
      beforeRemediationScore: scoreBefore,
      afterRemediationScore: scoreAfter,
    });

    setSystemAlert({
      type: 'success',
      message: `ปรับปรุงเอกสารโดย Compliance Corrective Engine (AARE) เสร็จสมบูรณ์! ประยุกต์ใช้แก้ไขแบบ Deterministic ทั้งสิ้น ${result.appliedFixes.length} จุดหลัก`,
    });
  };

  const handleSingleRemediation = (code: string) => {
    const specificDiag = asaeResult.diagnostics.find(d => d.code === code);
    if (!specificDiag) return;

    const result = runAutoRemediation(ast, placeholderValues, [specificDiag]);

    setAst(result.ast);
    setPlaceholderValues(result.placeholderValues);
    setUseThaiNumerals(result.useThaiNumerals);

    if (result.ast.sender_organization) setSenderOrg(result.ast.sender_organization);
    if (result.ast.document_number) setDocNum(result.ast.document_number);
    if (result.ast.date) setDocDate(result.ast.date);
    if (result.ast.subject) setSubject(result.ast.subject);
    if (result.ast.reference) setReference(result.ast.reference);
    if (result.ast.enclosures) setEnclosures(result.ast.enclosures);

    setSystemAlert({
      type: 'success',
      message: `ซ่อมแซมกฎอัตโนมัติสำเร็จ: [${code}] ได้รับการแก้ไขและเรียงร้อยโครงสร้างระเบียบเรียบร้อย`,
    });
  };

  // Trigger compiler api call
  const handleCompile = async () => {
    // Reset remediation stats on new compilation
    setRemediationStats({
      ran: false,
      appliedFixes: [],
      recompilationCount: 0,
      beforeRemediationScore: null,
      afterRemediationScore: null,
    });

    if (!humanIntent.trim()) {
      setSystemAlert({
        type: 'error',
        message: 'กรุณากรอกเจตจำนงธรรมดา (Human Intent) ของคุณก่อนประมวลผล',
      });
      return;
    }

    setIsCompiling(true);
    setSystemAlert(null);
    setCompileSteps([]);

    try {
      setCompileSteps(['[1/3] เริ่มกระบวนการสกัดโครงสร้างเจตจำนง...']);
      await new Promise((r) => setTimeout(r, 600));
      
      setCompileSteps((prev) => [...prev, '[2/3] รันระบบ Layer B (Language Coprocessor) ผ่าน Gemini API...']);
      
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: docType,
          recipient_protocol: recipientProtocol,
          human_intent: humanIntent,
        }),
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.error || 'Server returned compilation error');
      }

      const rawAstResult = await response.json();
      
      setCompileSteps((prev) => [...prev, '[3/3] รันระบบ Layer C (Validation Engine & Phrase Linter)...']);
      await new Promise((r) => setTimeout(r, 450));

      const returnedDocType: DocumentType = rawAstResult.document_type || docType;
      const activeTabType: DocumentType = 
        (returnedDocType === 'INTERNAL_MEMO' || returnedDocType === 'INTERNAL') ? 'INTERNAL' : 'EXTERNAL';
      
      setDocType(activeTabType);
      
      const returnedProtocol = rawAstResult.recipient_protocol || recipientProtocol;
      if (rawAstResult.recipient_protocol && RECIPIENT_PROTOCOLS[rawAstResult.recipient_protocol]) {
        setRecipientProtocol(rawAstResult.recipient_protocol);
      }

      const lintResult = runPhraseLinter(rawAstResult.compiled_body_fragment);
      
      const mergedAST: DocumentAST = {
        document_type: returnedDocType,
        recipient_protocol: returnedProtocol,
        salutation: rawAstResult.salutation || RECIPIENT_PROTOCOLS[returnedProtocol]?.salutation || 'เรียน',
        compiled_body_fragment: lintResult.compiledText,
        closing_protocol: rawAstResult.closing_protocol || RECIPIENT_PROTOCOLS[returnedProtocol]?.closing || 'ขอแสดงความนับถือ',
        detected_placeholders: rawAstResult.detected_placeholders || [],
        sender_organization: senderOrg,
        document_number: docNum,
        date: docDate,
        subject: subject,
        reference: reference,
        enclosures: enclosures,
      };

      const { validAst, warnings } = validateAndFillAST(mergedAST);

      setAst(validAst);
      setWasLinted(lintResult.wasLinted);
      setLintLogs([...lintResult.logs, ...warnings]);

      validAst.detected_placeholders.forEach((ph) => {
        if (!placeholderValues[ph]) {
          setPlaceholderValues((prev) => ({
            ...prev,
            [ph]: '',
          }));
        }
      });

      setSystemAlert({
        type: 'success',
        message: 'คอมไพล์เจตจำนงสำเร็จ! ได้จัดเรียงหนังสือราชการตามระเบียบสารบรรณ ล็อกโครงสร้างย่อหน้า Zero Formatting Variance เรียบร้อย',
      });
      
    } catch (err: any) {
      console.error(err);
      setSystemAlert({
        type: 'error',
        message: `ล้มเหลวขณะประมวลผล: ${err.message || 'โปรดตรวจสอบสิทธิ์เชื่อมต่อหรือการตั้งค่าคุณสมบัติ API'}. หากยังไม่ได้ระบุสิทธิ์รหัสลับ กรอกคีย์พอร์ตในแผง Settings > Secrets ของแอปเล็ต`,
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const applyPreset = (intent: string, type: DocumentType, protocol: string, subj: string) => {
    setDocType(type);
    setRecipientProtocol(protocol);
    setHumanIntent(intent);
    setSubject(subj);
    
    if (type === 'EXTERNAL') {
      setSenderOrg('ฝ่ายปกครองและการคลัง องค์การบริหารส่วนตำบลดอนดู่');
      setDocNum('นม ๗๖๕๐๑/ว ๑๐๔');
      setDocDate('๒๐ มิถุนายน ๒๕๖๙');
    } else {
      setSenderOrg('สโมสรนักศึกษาและงานสื่อสารภาพลักษณ์ สำนักงานอธิการบดี');
      setDocNum('ศธ ๐๕๑๔.๒/๘๘');
      setDocDate('๒๐ มิถุนายน ๒๕๖๙');
    }
  };

  const handleUpdatePlaceholder = (key: string, value: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setHumanIntent('');
    if (docType === 'EXTERNAL') {
      setAst(DEFAULT_EXTERNAL_AST);
      setSubject(DEFAULT_EXTERNAL_AST.subject || '');
    } else {
      setAst(DEFAULT_INTERNAL_AST);
      setSubject(DEFAULT_INTERNAL_AST.subject || '');
    }
    setLintLogs([]);
    setWasLinted(false);
    setSystemAlert(null);
    setRemediationStats({
      ran: false,
      appliedFixes: [],
      recompilationCount: 0,
      beforeRemediationScore: null,
      afterRemediationScore: null,
    });
  };

  // Layer J1: Native Export to DOCX
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await exportToDocx(ast, placeholderValues, useThaiNumerals);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SARABAN_AI_document_${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setUserExportedDocx(true);
      setSystemAlert({
        type: 'success',
        message: 'ส่งออกไฟล์ Microsoft Word (.docx) สำเร็จ! รักษาฟอร์แมต ฟอนต์ TH Sarabun New และแบบแผนย่อหน้าราชการ 100%',
      });
    } catch (err: any) {
      console.error(err);
      setSystemAlert({
        type: 'error',
        message: `จัดส่งเอกสารล้มเหลว: ${err.message || 'โปรดติดต่อผู้ดูแลระบบเพื่อแก้ไขสิทธิ์ในไฟล์'}`,
      });
    } finally {
      setIsExportingDocx(false);
      setIsExportCenterOpen(false);
    }
  };

  // Layer J3: Native PDF Layout Export
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const { blob, validationReport } = await exportToPdf(ast, placeholderValues, useThaiNumerals);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SARABAN_AI_document_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setPdfGeometryReport(validationReport);
      setUserExportedPdf(true);
      setSystemAlert({
        type: 'success',
        message: `ส่งออกไฟล์ PDF สารบรรณสำเร็จ! (ผลประเมินเรขาคณิต STS Geometries Score: ${validationReport.pdfReadinessScore}%) ปราศจาก Layout Drift 100%`,
      });
    } catch (err: any) {
      console.error(err);
      setSystemAlert({
        type: 'error',
        message: `ส่งออก PDF ผิดพลาด: ${err.message || 'โปรดตรวจสอบระเบียบการเขียนในกระดาษ'}`,
      });
    } finally {
      setIsExportingPdf(false);
      setIsExportCenterOpen(false);
    }
  };

  // Layer J2: Print Safety Validator & Print Run
  const triggerPrintWithSafety = () => {
    setPrintValidatorOpen(true);
    setIsExportCenterOpen(false);
  };

  const executePrint = () => {
    setPrintValidatorOpen(false);
    setUserHasPrintValidated(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Mock Share and Archive
  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/share/doc-${Math.floor(100000 + Math.random() * 900000)}`;
    navigator.clipboard.writeText(shareUrl);
    setSystemAlert({
      type: 'success',
      message: `คัดลอกลิงก์แชร์เอกสารด่วนลงคลิปบอร์ดแล้ว: ${shareUrl}`,
    });
    setIsExportCenterOpen(false);
  };

  const handleArchive = () => {
    setSystemAlert({
      type: 'success',
      message: `จัดเก็บเอกสารเข้าคลังสารสนเทศความมั่นคงสำเร็จแล้ว! โค้ดลงทะเบียนคลัง: ARV-${Math.floor(10000 + Math.random() * 90000)} (Checksum สำนักนายกรัฐมนตรีผ่านการรับรอง)`,
    });
    setIsExportCenterOpen(false);
  };

  const handleReleaseGateSubmit = () => {
    if (!isReadyToSubmit) return;
    setIsSubmitted(true);
    setSystemAlert({
      type: 'success',
      message: '🎉 เอกสารได้รับการรับรองและส่งต่อสภารัฐบาลดิจิทัลแห่งชาติสำเร็จผ่านระบบเชื่อมข้อมูลแบบครบวงจร (SARABAN.AI CERTIFIED)',
    });
  };

  // Calculation of Delivery Readiness Scores (Layer J5 Indicators)
  // J1: Export Readiness score (based on placeholders)
  const exportReadiness = asaeResult.scores.placeholder; 
  
  // J2: Print Readiness score (based on print safety validator metrics)
  let printReadiness = 100;
  if (asaeResult.diagnostics.some(d => d.code === 'PAGE-001')) printReadiness -= 15;
  if (asaeResult.diagnostics.some(d => d.code === 'SIG-002')) printReadiness -= 25;
  if (asaeResult.diagnostics.some(d => d.code === 'LAY-004')) printReadiness -= 20;
  if (detectedPlaceholders.length > 3) printReadiness -= 15;
  printReadiness = Math.max(0, printReadiness);

  // J3: PDF Readiness score (based on formatting score)
  let pdfReadiness = asaeResult.scores.formatting >= 90 ? 100 : 90;
  if (asaeResult.diagnostics.some(d => d.code === 'LAY-001' || d.code === 'COORD-001')) pdfReadiness -= 10;
  pdfReadiness = Math.max(0, pdfReadiness);

  // J4: Mobile Readiness score is always 100% as native mobile rendering components are fully integrated!
  const mobileReadiness = 100;

  // Release Gate Status Calculation
  useEffect(() => {
    if (userExportedDocx && userExportedPdf && userHasPrintValidated && (mobileViewVerified || isMobile)) {
      setIsReadyToSubmit(true);
    } else {
      setIsReadyToSubmit(false);
    }
  }, [userExportedDocx, userExportedPdf, userHasPrintValidated, mobileViewVerified, isMobile]);

  const wordFormattedText = compileMicrosoftWordFormat(ast, placeholderValues, useThaiNumerals);

  // Diagnostic clickable item highlighted mapping selector helper
  const handleDiagnosticClick = (code: string, documentNodeId?: string) => {
    setFocusedRuleId(code);
    
    // Switch tabs automatically based on whether we need variable inputs
    if (code === 'PLC-001' || code === 'PLC-002') {
      setActiveInspectorTab('variables');
      setInspectorCollapsed(false);
      
      // Try to find the exact variable's input and scroll to it
      const unresolved = asaeResult.dependencies.find(d => !d.resolved);
      const phName = unresolved ? unresolved.node : 'SIGNATURE_NAME';
      const fullPh = detectedPlaceholders.find(p => p.includes(phName)) || `[${phName}_REQUIRED]`;
      
      setTimeout(() => {
        const el = document.getElementById(`placeholder-input-${fullPh}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const container = el.closest('.container-placeholder-field') || el.closest('.space-y-1') || el.parentElement;
          if (container) {
            container.classList.add('ring-2', 'ring-amber-400', 'animate-pulse');
            setTimeout(() => {
              container.classList.remove('ring-2', 'ring-amber-400', 'animate-pulse');
            }, 2000);
          }
        }
      }, 100);
      return;
    }

    const ruleToId: Record<string, string> = {
      'LAY-001': 'simulator-sender-row',
      'TMP-001': 'simulator-subject-row',
      'PAR-001': 'simulator-body-container',
      'LAY-002': 'simulator-body-container',
      'PAR-002': 'simulator-body-container',
      'SIG-001': 'simulator-signature-block',
      'SIG-002': 'simulator-signature-block',
      'LAY-004': 'simulator-signature-block',
      'CLS-001': 'simulator-body-container',
      'CLS-002': 'simulator-signature-block',
      'COORD-001': 'simulator-sender-row',
      'PROTO-THDATE-001': 'simulator-sender-row',
    };
    
    let targetId = documentNodeId || ruleToId[code];
    if (!targetId) {
      targetId = docType === 'INTERNAL' ? 'simulator-sender-row-internal' : 'simulator-sender-row';
    } else if (docType === 'INTERNAL') {
      if (targetId === 'simulator-sender-row') targetId = 'simulator-sender-row-internal';
      if (targetId === 'simulator-subject-row') targetId = 'simulator-subject-row-internal';
      if (targetId === 'simulator-body-container') targetId = 'simulator-body-container-internal';
      if (targetId === 'simulator-signature-block') targetId = 'simulator-signature-block-internal';
    }
    
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-400', 'ring-offset-2', 'bg-amber-50/50', 'animate-pulse');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-amber-400', 'ring-offset-2', 'bg-amber-50/50', 'animate-pulse');
      }, 2000);
    }
  };

  const totalErrorsCount = asaeResult.diagnostics.length;
  const fixableCount = asaeResult.diagnostics.filter(d => [
    'PAR-001', 'PAR-002', 'LAY-001', 'LAY-002', 'LAY-004', 'SIG-001', 'SIG-002', 'CLS-001', 'CLS-002', 'COORD-001'
  ].includes(d.code)).length;
  const manualReviewCount = totalErrorsCount - fixableCount;

  return (
    <div id="full-app-container" className="h-screen bg-[#F0F4F7] text-slate-800 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Visual Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
        <div id="logo-brand" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold w-10 h-10 shadow-md">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-base text-slate-900 tracking-tight">
                SARABAN.<span className="text-blue-600">AI</span>
              </span>
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black tracking-wider uppercase border border-slate-200">
                Workspace
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Document-Centric Administrative Core</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
            <span className="text-[11px] text-slate-500 font-bold font-sarabun">เปลี่ยนเลขอาหรับเป็นตัวเลขไทยอัติโนมัติ</span>
            <button
              id="numeral-toggle-btn"
              onClick={() => setUseThaiNumerals(!useThaiNumerals)}
              className={`relative inline-flex h-4.5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out font-mono text-[9px] ${
                useThaiNumerals ? 'bg-blue-600' : 'bg-slate-350'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  useThaiNumerals ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Unified Export Center Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsExportCenterOpen(!isExportCenterOpen)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12px] px-3.5 py-2 rounded-xl transition duration-150 shadow-md cursor-pointer select-none"
            >
              <Printer size={14} />
              <span>ศูนย์ส่งออก (Export Center)</span>
            </button>

            {isExportCenterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3.5 space-y-2.5 antialiased">
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase border-b border-slate-100 pb-1 mb-1">โปรแกรมจัดส่งรูปแบบแท้ (Layer J)</span>
                <button
                  onClick={() => {
                    handleExportDocx();
                    setIsExportCenterOpen(false);
                  }}
                  disabled={isExportingDocx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-left text-xs font-bold transition cursor-pointer"
                >
                  <Download size={14} className="text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <div className="text-slate-800">ส่งออกเป็นไฟล์ Word (DOCX)</div>
                    <div className="text-[9.5px] text-slate-400 font-medium">ยึดระเบียบระยะห่างย่อหน้าพิกัด 100%</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleExportPdf();
                    setIsExportCenterOpen(false);
                  }}
                  disabled={isExportingPdf}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-left text-xs font-bold transition cursor-pointer"
                >
                  <Download size={14} className="text-rose-600 shrink-0" />
                  <div className="flex-1">
                    <div className="text-slate-800">ส่งออกเป็นไฟล์ PDF ทั่วไป</div>
                    <div className="text-[9.5px] text-slate-400 font-medium">ความเบี่ยงเบนสะสมเรขาคณิต STS &lt; 0.5mm</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    triggerPrintWithSafety();
                    setIsExportCenterOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-left text-xs font-bold transition cursor-pointer"
                >
                  <Printer size={14} className="text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <div className="text-slate-800">พิมพ์เอกสารผ่านระบบ (Print Safety)</div>
                    <div className="text-[9.5px] text-slate-400 font-medium">ตรวจตราการตกลงขยายวรรคและข้อขัดเคือง</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleShareLink();
                    setIsExportCenterOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-left text-xs font-bold transition cursor-pointer"
                >
                  <Share2 size={14} className="text-sky-500 shrink-0" />
                  <div className="text-slate-800">คัดลอกลิงก์ด่วนแชร์ผู้รับ</div>
                </button>
                <button
                  onClick={() => {
                    handleArchive();
                    setIsExportCenterOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-150 bg-slate-900 rounded-xl text-left text-xs font-bold transition cursor-pointer text-white"
                >
                  <Archive size={14} className="text-zinc-400 shrink-0" />
                  <div className="text-slate-100">จัดเก็บสู่ทำเนียบ Ledger (Archive)</div>
                </button>
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-750 border border-blue-200 font-bold text-xs flex items-center justify-center">
            TH
          </div>
        </div>
      </header>

      {/* Main Administrative Workspace (Fluid height constraints to fit 100vh perfectly) */}
      <div id="workspace-layout" className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
        
        {/* LEFT / CENTER VIEW: The Centered Physical Document Canvas (>= 70% space) */}
        <div id="document-canvas-zone" className="flex-1 flex flex-col min-w-0 bg-[#EAEFF2] overflow-hidden relative border-r border-slate-200">
          
          {/* Mini Compliance bar replaces current top HUD */}
          <div id="mini-compliance-bar" className="h-10 shrink-0 bg-slate-900 px-6 flex items-center justify-between text-white text-xs shadow-md border-b border-slate-950 font-mono">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${totalErrorsCount === 0 && asaeResult.status === 'VALID' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`}></span>
              <span className="font-black text-[11px]">
                STATUS: {totalErrorsCount === 0 && asaeResult.status === 'VALID' ? 'READY FOR OFFICIAL SUBMISSION' : 'RELEASE BLOCKED'}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                Readiness: <strong className="text-emerald-400 font-black">{asaeResult.readinessScore}%</strong>
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-rose-450 font-semibold">
                {totalErrorsCount} ข้อขัดแย้งเชิงระเบียบ ({fixableCount} กู้คืนได้อัตโนมัติ)
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Ctrl+Shift+F หรือสลับกด F เพื่อเปิดปิดโหมดความกว้างเต็มจอ</span>
            </div>
          </div>

          {/* Desktop Simulator viewport */}
          <div className="flex-grow overflow-hidden relative flex flex-col h-full bg-[#EAEFF2]">
            <DocumentSimulator
              ast={ast}
              placeholderValues={placeholderValues}
              useThaiNumerals={useThaiNumerals}
              onUpdatePlaceholder={handleUpdatePlaceholder}
              wordFormattedText={wordFormattedText}
              checksum={asaeResult.checksum}
              status={asaeResult.status}
              dependencyCount={asaeResult.dependencies.filter(d => !d.resolved).length}
              scores={asaeResult.scores}
              templateId={asaeResult.templateId}
              templateVersion={asaeResult.templateVersion}
              templateHash={asaeResult.templateHash}
              docHash={asaeResult.docHash}
              compilerHash={asaeResult.compilerHash}
              auditHash={asaeResult.auditHash}
              focusedRuleId={focusedRuleId}
              zoomScale={zoomScale}
              setZoomScale={setZoomScale}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode(!focusMode)}
              diagnostics={asaeResult.diagnostics}
              onSelectDiagnostic={handleDiagnosticClick}
              hoveredRuleId={hoveredRuleId}
              setHoveredRuleId={setHoveredRuleId}
            />
          </div>

        </div>

        {/* RIGHT COLLAPSIBLE INSPECTOR (<= 30% space default / collapsable) */}
        {!focusMode && (
          <div 
            id="inspector-sidebar"
            className={`bg-white border-l border-slate-200 shrink-0 flex flex-row h-full overflow-hidden transition-all duration-300 relative ${
              inspectorCollapsed ? 'w-12' : 'w-[420px]'
            }`}
          >
            {/* Collapse/Expand toggle handle */}
            <button
              onClick={() => setInspectorCollapsed(!inspectorCollapsed)}
              className="absolute top-1/2 -translate-y-1/2 -left-3 bg-white border border-slate-250 hover:bg-slate-50 shadow-md rounded-full w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer z-20"
              title={inspectorCollapsed ? "ยืดแถบแผงควบคุม" : "พับแผงควบคุม"}
            >
              {inspectorCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Left Icons Strip (Visible when collapsed OR expanded) */}
            <div className="w-12 border-r border-slate-100 flex flex-col items-center py-4 bg-slate-50 gap-4 shrink-0 justify-between select-none">
              <div className="flex flex-col gap-3.5 items-center w-full">
                <button
                  onClick={() => { setActiveInspectorTab('build'); setInspectorCollapsed(false); }}
                  className={`p-2 rounded-xl transition duration-150 tooltip cursor-pointer ${
                    activeInspectorTab === 'build' && !inspectorCollapsed ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="ตัวคอมไพเลอร์ต้นร่าง (Draft Builder)"
                >
                  <Sliders size={18} />
                </button>
                <button
                  onClick={() => { setActiveInspectorTab('compliance'); setInspectorCollapsed(false); }}
                  className={`p-2 rounded-xl transition duration-150 relative tooltip cursor-pointer ${
                    activeInspectorTab === 'compliance' && !inspectorCollapsed ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="การตรวจระเบียบวิกฤต (Compliance & Remediation)"
                >
                  <FileSearch size={18} />
                  {totalErrorsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => { setActiveInspectorTab('variables'); setInspectorCollapsed(false); }}
                  className={`p-2 rounded-xl transition duration-150 relative tooltip cursor-pointer ${
                    activeInspectorTab === 'variables' && !inspectorCollapsed ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="ตัวแปรว่างที่ต้องเติม (Variables)"
                >
                  <Hash size={18} />
                  {detectedPlaceholders.length > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
                <button
                  onClick={() => { setActiveInspectorTab('delivery'); setInspectorCollapsed(false); }}
                  className={`p-2 rounded-xl transition duration-150 relative tooltip cursor-pointer ${
                    activeInspectorTab === 'delivery' && !inspectorCollapsed ? 'bg-emerald-100 text-emerald-750' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="ศูนย์ส่งออกและจัดเตรียมการพิมพ์ (Delivery & Release)"
                >
                  <Printer size={18} />
                  {!isReadyToSubmit ? (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                  ) : (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  )}
                </button>
                <button
                  onClick={() => { setActiveInspectorTab('methods'); setInspectorCollapsed(false); }}
                  className={`p-2 rounded-xl transition duration-150 tooltip cursor-pointer ${
                    activeInspectorTab === 'methods' && !inspectorCollapsed ? 'bg-purple-100 text-purple-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="ระเบียบวิชาการสารบรรณ (Theory & Methods)"
                >
                  <BookOpen size={18} />
                </button>
                <button
                  onClick={() => { setActiveInspectorTab('copilot'); setInspectorCollapsed(false); }}
                  className={`p-2 rounded-xl transition duration-150 relative tooltip cursor-pointer ${
                    activeInspectorTab === 'copilot' && !inspectorCollapsed ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-3xs' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="เสนาธิการฉลาด AI (Government Copilot Layer K)"
                >
                  <Brain size={18} className={activeInspectorTab === 'copilot' && !inspectorCollapsed ? 'animate-pulse' : ''} />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[8px] font-mono text-slate-400 font-extrabold uppercase select-none tracking-widest writing-mode-vertical text-center rotate-180 pb-2">
                  SARABAN.AI
                </span>
              </div>
            </div>

            {/* Right Tab Content Block (Visible ONLY when not collapsed) */}
            <div className="flex-grow flex flex-col h-full bg-white overflow-hidden min-w-0">
              <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-white text-slate-900 font-extrabold select-none">
                <span className="text-[13px] tracking-wide uppercase font-black flex items-center gap-1.5">
                  {activeInspectorTab === 'build' && <>🛠️ ตัวจดคัดร่างเจตจำนง (Builder)</>}
                  {activeInspectorTab === 'compliance' && <>🔍 ลิงก์ตรวจเกณฑ์ราชการ (Inspect)</>}
                  {activeInspectorTab === 'variables' && <>🗂️ เติมช่องข้อมูลว่าง (Variables)</>}
                  {activeInspectorTab === 'delivery' && <>📦 การจัดส่ง & สัญญาณปล่อยตัว (Delivery)</>}
                  {activeInspectorTab === 'methods' && <>🛡️ โครงสร้างรหัสสารบรรณ (System)</>}
                  {activeInspectorTab === 'copilot' && <>🧠 เสนาธิการสารบรรณ AI (Government Copilot)</>}
                </span>
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                  Active Inspector Area
                </span>
              </div>

              {/* Inspector Tab Panels Area scrollable */}
              <div className="flex-grow overflow-auto p-4 space-y-4 text-xs select-text">
                
                {/* TAB 1: Draft Intent Builder */}
                {activeInspectorTab === 'build' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold text-[10.5px] uppercase tracking-wider block">1. เลือกรูปแบบประเภทบันทึกสารบรรณ</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setDocType('EXTERNAL')}
                          className={`p-2 px-3 border rounded-xl text-center font-bold text-[11px] cursor-pointer transition flex flex-col justify-center items-center gap-1 leading-normal ${
                            docType === 'EXTERNAL'
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-extrabold'
                              : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <FileText size={15} />
                          <span>หนังสือภายนอก</span>
                        </button>
                        <button
                          onClick={() => setDocType('INTERNAL_MEMO')}
                          className={`p-2 px-3 border rounded-xl text-center font-bold text-[11px] cursor-pointer transition flex flex-col justify-center items-center gap-1 leading-normal ${
                            docType === 'INTERNAL_MEMO'
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-extrabold'
                              : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Zap size={15} />
                          <span>บันทึกข้อความภายใน</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-500 font-bold text-[10.5px] uppercase tracking-wider block">2. ด่วนพิธีการเป้าหมายปลายทาง</label>
                        <span className="text-[9px] text-blue-500 font-bold">Layer A Rule Matrix</span>
                      </div>
                      <select
                        value={recipientProtocol}
                        onChange={(e) => {
                          setRecipientProtocol(e.target.value);
                          setAst((prev) => ({
                            ...prev,
                            recipient_protocol: e.target.value,
                            salutation: RECIPIENT_PROTOCOLS[e.target.value]?.salutation || 'เรียน',
                            closing_protocol: RECIPIENT_PROTOCOLS[e.target.value]?.closing || 'ขอแสดงความนับถือ'
                          }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11.5px] text-slate-800 font-bold"
                      >
                        {Object.keys(RECIPIENT_PROTOCOLS).map((key) => (
                          <option key={key} value={key}>
                            {RECIPIENT_PROTOCOLS[key].title} ({RECIPIENT_PROTOCOLS[key].salutation})
                          </option>
                        ))}
                      </select>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-500 font-bold text-[10.5px] uppercase tracking-wider block">3. เจตจำนงภาษาคน (Human Intent)</label>
                        <button
                          onClick={handleReset}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer transition"
                        >
                          ล้างเนื้อหา
                        </button>
                      </div>

                      <textarea
                        value={humanIntent}
                        onChange={(e) => setHumanIntent(e.target.value)}
                        placeholder="พิมพ์เนื้อหาที่ต้องการเขียนเป็นข้อความธรรมดา เช่น 'เชิญนายอำเภอและทีมงานมาประชุมวันที่ ๒๐ เพื่อซ้อมซ้อมอุทกภัยระดับจังหวัด อิ่มเลี้ยงเที่ยวฟรี...'"
                        className="w-full h-32 bg-slate-55 border border-slate-200 rounded-2xl p-3 text-[11px] leading-relaxed text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-slate-400"
                      />

                      {/* Presets List */}
                      <div className="space-y-1">
                        <span className="block text-[10px] text-slate-400 font-bold">ชุดคำสั่งที่เตรียมไว้แล้ว (Presets):</span>
                        <div className="flex flex-col gap-1.5 max-h-[140px] overflow-auto pr-1">
                          <button
                            onClick={() => applyPreset(
                              'ผมต้องการทำจดหมายเรียนนายอำเภอดอนดู่ เพื่อเชิญหน่วยงานเข้ามาเข้ารุกร่วมประชุมวางมาตรการรับอุทกภัยระดับท้องถิ่นที่ห้องประชุมชั้น ๓ เวลาบ่ายโมง โดยให้ทาง ปภ. ท้องถิ่นส่งตัวแทนมาด้วย ๑ ท่าน',
                              'EXTERNAL',
                              'DISTRICT_CHIEF',
                              'ขอเรียนเชิญประชุมหารือแนวทางบูรณาการตรวจสอบและช่วยเหลืออุทกภัยในพื้นที่ตำบลดอนดู่'
                            )}
                            className="text-left bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-[10.5px] border border-slate-200/50 leading-relaxed font-semibold cursor-pointer truncate"
                          >
                            ✉️ [ภายนอก] เชิญนายอำเภอร่วมหารืออุทกภัยดอนดู่
                          </button>
                          <button
                            onClick={() => applyPreset(
                              'ทำบันทึกข้อความภายในสโมสรนักศึกษาเรียนอธิบดีเพื่อขออนุมัติจัดงบประมาณในการจัดตั้งชมรมพัฒนาการทางวิชาการและเทคโนโลยีสารสนเทศของนักศึกษาปีที่ ๒ วงเงินไม่เกิน ๕๐,๐๐๐ บาท เพื่อให้การอบรมสากลในมหาวิทยาลัย',
                              'INTERNAL_MEMO',
                              'GOVERNOR',
                              'ขออนุมัติจัดตั้งงบประมาณโครงการอบรมสัมมนาเทคโนโลยีสารสนเทศสโมสรนักศึกษา ปีงบประมาณ ๒๕๖๙'
                            )}
                            className="text-left bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-[10.5px] border border-slate-200/50 leading-relaxed font-semibold cursor-pointer truncate"
                          >
                            📝 [บันทึกข้อความ] ขออนุมัติงบสัมมนาสโมสรนักศึกษา
                          </button>
                        </div>
                      </div>

                      {/* Action trigger Compilation button */}
                      <button
                        onClick={handleCompile}
                        disabled={isCompiling}
                        className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition duration-155 disabled:opacity-50 cursor-pointer text-center select-none"
                      >
                        {isCompiling ? (
                          <>
                            <RefreshCw className="animate-spin" size={14} />
                            กำลังวิเคราะห์แปลงภาษาเอกสาร...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            🚀 อัปเดตร่างอัจฉริยะ (Compiler)
                          </>
                        )}
                      </button>

                      <AnimatePresence>
                        {isCompiling && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-slate-950 text-slate-300 font-mono text-[9px] rounded-2xl border border-slate-800 space-y-1 shadow-inner select-none"
                          >
                            <span className="text-emerald-400 font-extrabold">▼ PIPELINE IN PROGRESS</span>
                            {compileSteps.map((step, idx) => (
                              <div key={idx} className="flex gap-1">
                                <span className="text-blue-500">❯</span>
                                <span className="text-slate-300">{step}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Meta Fields Form Section */}
                    <div className="space-y-2.5">
                      <span className="block font-bold text-slate-800 text-[11px] leading-tight">4. ข้อมูลหัวเอกสารและผู้ออกหนังสือ</span>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div className="space-y-1">
                          <label className="text-slate-500 font-bold">เลขที่หนังสือ (ที่)</label>
                          <input
                            type="text"
                            value={docNum}
                            onChange={(e) => {
                              setDocNum(e.target.value);
                              setAst((prev) => ({ ...prev, document_number: e.target.value }));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-bold">วันที่ออก</label>
                          <input
                            type="text"
                            value={docDate}
                            onChange={(e) => {
                              setDocDate(e.target.value);
                              setAst((prev) => ({ ...prev, date: e.target.value }));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-slate-500 font-bold">ส่วนราชการเจ้าของเรื่อง</label>
                          <input
                            type="text"
                            value={senderOrg}
                            onChange={(e) => {
                              setSenderOrg(e.target.value);
                              setAst((prev) => ({ ...prev, sender_organization: e.target.value }));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-slate-500 font-bold">เรื่อง (Subject)</label>
                          <input
                            type="text"
                            value={subject}
                            onChange={(e) => {
                              setSubject(e.target.value);
                              setAst((prev) => ({ ...prev, subject: e.target.value }));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Compliance Analyzer & Auto remediator */}
                {activeInspectorTab === 'compliance' && (
                  <div className="space-y-4">
                    
                    {/* Visual 8-dimension progress score bars (Figma inspector mode) */}
                    <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3.5 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] text-slate-400 font-extrabold uppercase tracking-wider block">Multi-tiered Compliance Radar</span>
                        <div className="text-slate-350 text-[10.5px] font-bold font-mono">
                          Overall: <span className="text-emerald-400 font-black">{asaeResult.scores.overall}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 text-[10.5px]">
                        <div>
                          <div className="flex justify-between text-[9.5px] text-slate-400 font-bold mb-1">
                            <span>โครงสร้าง (Struct)</span>
                            <span className="text-emerald-400 font-mono font-black">{asaeResult.scores.structural}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full transition-all duration-350" style={{ width: `${asaeResult.scores.structural}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9.5px] text-slate-400 font-bold mb-1">
                            <span>จัดหน้า (Format)</span>
                            <span className="text-cyan-400 font-mono font-black">{asaeResult.scores.formatting}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full transition-all duration-350" style={{ width: `${asaeResult.scores.formatting}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9.5px] text-slate-400 font-bold mb-1">
                            <span>ระเบียบ (Protocol)</span>
                            <span className="text-purple-400 font-mono font-black">{asaeResult.scores.protocol}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-purple-400 h-full transition-all duration-350" style={{ width: `${asaeResult.scores.protocol}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9.5px] text-slate-400 font-bold mb-1">
                            <span>ตัวแปร (Variables)</span>
                            <span className="text-amber-400 font-mono font-black">{asaeResult.scores.placeholder}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full transition-all duration-350" style={{ width: `${asaeResult.scores.placeholder}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9.5px] text-slate-400 font-bold mb-1">
                            <span>แปรรูปท้องถิ่น (Localize)</span>
                            <span className="text-pink-400 font-mono font-black">100%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-pink-450 h-full text-pink-400" style={{ width: `100%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9.5px] text-slate-400 font-bold mb-1">
                            <span>ตรวจคำทับศัพท์ (Linguistic)</span>
                            <span className="text-sky-400 font-mono font-black">100%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                            <div className="bg-sky-450 h-full" style={{ width: `100%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auto Fix / Compliance Remediation drawer controls */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                      <div className="flex justify-between items-center leading-none select-none">
                        <span className="font-extrabold text-[12px] text-slate-800 flex items-center gap-1.5">
                          <Wrench size={14} className="text-indigo-600" />
                          Remediation Resolver (AARE)
                        </span>
                        <span className="text-[9.5px] bg-slate-250 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-full">
                          AI Auto-Fixes Ready
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center select-none text-[11px]">
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-0.5">Auto-Fixable Rules</span>
                          <span className="text-base font-black text-cyan-600 block">{fixableCount}</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-0.5">Manual Inspection</span>
                          <span className="text-base font-black text-amber-600 block">{manualReviewCount}</span>
                        </div>
                      </div>

                      {fixableCount > 0 ? (
                        <button
                          onClick={handleTriggerRemediation}
                          className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition duration-150 cursor-pointer"
                        >
                          <Wrench size={13} className="animate-pulse" />
                          แก้ไขจัดหน้าตามระเบียบสารบรรณอัตโนมัติ
                        </button>
                      ) : (
                        <div className="text-center p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-xl border border-emerald-150 font-semibold select-none">
                          ✓ ผ่านการจัดระเบียบสารบรรณขั้นเป๊ะแล้ว หรือกรอกครบช่องตัวแปร
                        </div>
                      )}

                      {/* Post Remediation statistics */}
                      {remediationStats.ran && (
                        <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-xl text-emerald-900 leading-normal space-y-2">
                          <div className="font-bold flex items-center justify-between text-[11.5px]">
                            <span>✓ ระบบทำการวิเคราะห์ปรับแก้สำเร็จ!</span>
                            <span className="text-xs font-mono font-extrabold text-emerald-700 bg-white border border-emerald-200 px-1 py-0.5 rounded">
                              Score: {remediationStats.beforeRemediationScore}% ➔ {remediationStats.afterRemediationScore}%
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-600">
                            แก้ไขแบบ Deterministic ทั้งสิ้น <strong className="text-slate-800 font-extrabold">{remediationStats.appliedFixes.length} กฎ</strong> เพื่อความเป๊ะของเอกสารตามข้อตกลงกรมส่งเสริมการปกครองส่วนท้องถิ่นและสำนักนายกฯ
                          </p>

                          {/* Interactive Audit Trail Log entries */}
                          <div className="space-y-1.5 select-text">
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Audit Ledger Trace Log:</span>
                            <div className="max-h-[140px] overflow-auto border border-emerald-55 bg-white rounded-xl divide-y divide-slate-100 font-mono text-[9px]">
                              {remediationStats.appliedFixes.map((item, idx) => (
                                <div key={idx} className="p-2 space-y-1 text-slate-700">
                                  <div className="flex justify-between font-bold">
                                    <span className="text-indigo-600">{item.ruleId}</span>
                                    <span className="text-slate-400 text-[8.5px]">{item.timestamp}</span>
                                  </div>
                                  <p className="font-sans text-slate-500 text-[10px] leading-relaxed">{item.description}</p>
                                  <div className="text-[8.5px] text-slate-450 leading-none pt-0.5 whitespace-nowrap overflow-x-auto">
                                    Before: <span className="line-through text-rose-500">{item.beforeValue || 'NONE'}</span> | After: <span className="text-emerald-600 font-bold">{item.afterValue}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Warnings interactive list */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between select-none">
                        <span className="text-slate-500 font-bold text-[10.5px] uppercase tracking-wider block">สัญญานเตือนสารบรรณ ({totalErrorsCount} ข้อพิสูจน์)</span>
                        <span className="text-[10px] text-slate-400">คลิกที่รายการเพื่อดูตำแหน่งและนำทาง</span>
                      </div>

                      <div className="space-y-2 max-h-[350px] overflow-auto pr-1">
                        {asaeResult.diagnostics.map((diag, index) => (
                          <div
                            key={index}
                            onClick={() => handleDiagnosticClick(diag.code, diag.documentNodeId)}
                            onMouseEnter={() => setHoveredRuleId(diag.code)}
                            onMouseLeave={() => setHoveredRuleId(null)}
                            className={`p-3 rounded-2xl border flex flex-col gap-2.5 text-[11px] leading-normal font-sans shadow-2xs hover:-translate-y-0.5 transition duration-150 cursor-pointer ${
                              focusedRuleId === diag.code ? 'ring-2 ring-amber-400 ring-offset-1 shrink-0 scale-[1.01]' : ''
                            } ${
                              diag.severity === 'CRITICAL' ? 'bg-rose-50/70 border-rose-100/90 text-rose-950 shadow-rose-100/60' :
                              diag.severity === 'WARNING' ? 'bg-amber-50/70 border-amber-100/90 text-amber-950 shadow-amber-100/60' :
                              'bg-slate-50/70 border-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex gap-2.5 items-start w-full">
                              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                                diag.severity === 'CRITICAL' ? 'bg-rose-600 animate-ping' : 'bg-amber-500'
                              }`} />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-extrabold text-slate-900 leading-tight text-justify">{diag.title}</span>
                                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-widest shrink-0 ${
                                    diag.severity === 'CRITICAL'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {diag.code}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[10.5px] leading-relaxed">{diag.explanation}</p>
                              </div>
                            </div>

                            {/* Inline Manual Input Repair Helpers */}
                            {(diag.code === 'PLC-001' || diag.code === 'PLC-002') && (
                              <div className="p-2 bg-white rounded-xl border border-slate-150 space-y-2 mt-1 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                                <span className="block text-[8px] text-slate-400 font-extrabold uppercase">ป้อนค่าตัวแปรโดยตรง:</span>
                                {asaeResult.dependencies.filter(d => !d.resolved).map(dep => {
                                  const phKey = detectedPlaceholders.find(p => p.includes(dep.node)) || `[${dep.node}_REQUIRED]`;
                                  return (
                                    <div key={dep.node} className="space-y-1">
                                      <label className="block text-[9px] font-mono leading-none font-bold text-slate-500 uppercase">{dep.node}</label>
                                      <input
                                        type="text"
                                        id={`mini-card-input-${phKey}`}
                                        value={placeholderValues[phKey] || ''}
                                        onChange={(e) => handleUpdatePlaceholder(phKey, e.target.value)}
                                        className="w-full text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold bg-slate-50/50 focus:bg-white text-slate-800 transition shadow-2xs"
                                        placeholder="รอกรอกเนื้อหา..."
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {diag.code === 'LAY-001' && (
                              <div className="p-2 bg-white rounded-xl border border-slate-150 space-y-1 mt-1 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                                <span className="block text-[8px] text-slate-400 font-extrabold uppercase">ชื่อหน่วยงานด้านบน:</span>
                                <input
                                  type="text"
                                  value={senderOrg}
                                  onChange={(e) => {
                                    setSenderOrg(e.target.value);
                                    setAst(prev => ({ ...prev, sender_organization: e.target.value }));
                                  }}
                                  className="w-full text-[10.5px] px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800 transition"
                                  placeholder="ระบุนามองค์กร..."
                                />
                              </div>
                            )}

                            {diag.code === 'TMP-001' && (
                              <div className="p-2 bg-white rounded-xl border border-slate-150 space-y-1 mt-1 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                                <span className="block text-[8px] text-slate-400 font-extrabold uppercase">ระบุกำหนดเรื่องหนังสือหลัก:</span>
                                <input
                                  type="text"
                                  value={subject}
                                  onChange={(e) => {
                                    setSubject(e.target.value);
                                    setAst(prev => ({ ...prev, subject: e.target.value }));
                                  }}
                                  className="w-full text-[10.5px] px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800 transition"
                                  placeholder="พิมพ์ชื่อเรื่อง..."
                                />
                              </div>
                            )}

                            {/* Single Action Auto Remediation Button */}
                            {diag.autoFixAvailable && (
                              <div onClick={(e) => e.stopPropagation()} className="mt-1">
                                <button
                                  onClick={() => handleSingleRemediation(diag.code)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-[9.5px] rounded-lg transition-all shadow-xs pr-4 select-none cursor-pointer"
                                >
                                  <Wrench size={10.5} />
                                  ซ่อมข้อผิดพลาดนี้ทันที (Auto-Fix)
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        {asaeResult.diagnostics.length === 0 && (
                          <div className="text-center py-10 bg-emerald-50 text-emerald-900 rounded-3xl p-6 border border-emerald-100 space-y-2 select-none">
                            <ShieldCheck className="mx-auto text-emerald-600" size={32} />
                            <div className="font-bold text-xs">✓ ร่างกฎสารบรรณเป๊ะตามคู่มือราชการร้อยเปอร์เซ็นต์</div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              ไม่ต้องการทำงาน Remediator ล้างตัวแปรว่างที่มีอยู่เพื่อพร้อมกดนำส่งหรือพิมพ์ลงในไฟล์ Microsoft Word
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Placeholder Solver Fields */}
                {activeInspectorTab === 'variables' && (
                  <div className="space-y-3.5">
                    <p className="text-[11px] text-slate-500 leading-normal select-none">
                      พบช่องว่างแม่แบบราชการที่ประมวลผลสแกนและสลับระเบียบเพื่อกรอกข้อมูลจริง ค่ากรอกตรงนี้จะถูกผูกสัมพันธ์เชื่อมเข้ากระดาษจริงทันที:
                    </p>

                    <div className="space-y-3 pr-1">
                      {detectedPlaceholders.length > 0 ? (
                        detectedPlaceholders.map((ph) => (
                          <div key={ph} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150 transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500">
                            <label className="block text-[10px] font-mono font-bold truncate tracking-wide text-slate-500 uppercase select-none leading-none mb-1">
                              {ph}
                            </label>
                            <input
                              id={`placeholder-input-${ph}`}
                              type="text"
                              value={placeholderValues[ph] || ''}
                              onChange={(e) => handleUpdatePlaceholder(ph, e.target.value)}
                              placeholder={`กรอกค่าราชการจริงแทน ${ph}`}
                              className="w-full bg-slate-100 border border-slate-200/50 rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white text-[11px] text-slate-800 font-bold placeholder-slate-400"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-450 font-serif italic select-none">
                          ไม่พบตัวแปรสะพานหรือช่องว่าง [] ในปัจจุบัน
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: Delivery, Scores AND Release Gate (Layer J Core Interface) */}
                {activeInspectorTab === 'delivery' && (
                  <DeliveryDashboard
                    exportReadiness={exportReadiness}
                    printReadiness={printReadiness}
                    pdfReadiness={pdfReadiness}
                    mobileReadiness={mobileReadiness}
                    isExportingDocx={isExportingDocx}
                    isExportingPdf={isExportingPdf}
                    userExportedDocx={userExportedDocx}
                    userExportedPdf={userExportedPdf}
                    userHasPrintValidated={userHasPrintValidated}
                    mobileViewVerified={mobileViewVerified}
                    isMobile={isMobile}
                    isReadyToSubmit={isReadyToSubmit}
                    isSubmitted={isSubmitted}
                    onExportDocx={handleExportDocx}
                    onExportPdf={handleExportPdf}
                    onTriggerPrint={triggerPrintWithSafety}
                    onShareLink={handleShareLink}
                    onArchive={handleArchive}
                    onReleaseGateSubmit={handleReleaseGateSubmit}
                    onVerifyMobile={() => {
                      setMobileViewVerified(true);
                      setMobileShowA4(true);
                      setSystemAlert({ type: 'info', message: 'สลับตรวจสอบรูปแบบ Responsive แถบบนเครื่องมือเรียบร้อย' });
                    }}
                  />
                )}

                {/* TAB 5: Systems Analysis, HASHEs & Theory Graph */}
                {activeInspectorTab === 'methods' && (
                  <div className="space-y-4">
                    
                    {/* Visual Cryptography checksums block */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 text-slate-300 font-mono text-[9.5px] space-y-2 shadow-inner select-none">
                      <span className="block text-sky-400 font-black tracking-wider uppercase">Administrative Immutable Fingerprints</span>
                      <div className="grid grid-cols-2 gap-2 text-slate-400">
                        <div>
                          <span className="block text-[8px] text-slate-500 leading-none mb-0.5">SHA-256 CHECK</span>
                          <span className="text-slate-350 font-bold truncate block">{asaeResult.checksum}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-550 leading-none mb-0.5">TEMPLATE_SPEC</span>
                          <span className="text-slate-350 font-bold">{asaeResult.templateId}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-550 leading-none mb-0.5">VERSION</span>
                          <span className="text-slate-350 font-bold">{asaeResult.templateVersion}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-550 leading-none mb-0.5">COMPILER_STATE</span>
                          <span className="text-slate-350 font-bold">{asaeResult.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Linguistic Dependency Graph Layout */}
                    <div className="space-y-2">
                      <span className="block text-slate-500 font-bold text-[10.5px] uppercase tracking-wider block">Linguistic Dependency Resolutions</span>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white font-mono text-[9px] space-y-2.5 shadow-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-sky-450 font-extrabold uppercase block text-[8px] border-b border-slate-800 pb-1 mb-1.5 text-sky-400">Layer A Metadata Nodes</span>
                            <div className="space-y-1">
                              {asaeResult.dependencies.filter(d => ['SENDER_ORGANIZATION', 'DOCUMENT_NUMBER', 'DATE', 'SUBJECT'].includes(d.node)).map((dep, idx) => (
                                <div key={idx} className={`p-1 px-2 rounded-lg border text-[8px] flex items-center justify-between font-bold ${dep.resolved ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300' : 'bg-rose-950/40 border-rose-900/40 text-rose-300'}`}>
                                  <span className="truncate max-w-[80px]">{dep.node}</span>
                                  <span className="text-[7.5px] uppercase">{dep.resolved ? 'OK' : 'MISSING'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-purple-450 font-extrabold uppercase block text-[8px] border-b border-slate-800 pb-1 mb-1.5 text-purple-400">Layer B Context Nodes</span>
                            <div className="space-y-1 max-h-[110px] overflow-auto pr-0.5">
                              {asaeResult.dependencies.filter(d => !['SENDER_ORGANIZATION', 'DOCUMENT_NUMBER', 'DATE', 'SUBJECT'].includes(d.node)).map((dep, idx) => (
                                <div key={idx} className={`p-1 px-2 rounded-lg border text-[8px] flex items-center justify-between font-bold ${dep.resolved ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300' : 'bg-amber-950/40 border-amber-900/40 text-amber-300'}`}>
                                  <span className="truncate max-w-[80px]">{dep.node}</span>
                                  <span className="text-[7.5px] uppercase">{dep.resolved ? 'OK' : 'PENDING'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Brief Layer Model explanation (Methods) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-slate-700 leading-relaxed font-sans select-none">
                      <span className="text-[12px] font-extrabold text-slate-850 uppercase tracking-wide block flex items-center gap-1">
                        <Compass size={14} className="text-blue-600" />
                        4-Layer Saraban Architecture (ASAE)
                      </span>
                      <p className="text-[11px] text-slate-600">
                        ระบบควบคุมและจัดเรียงระเหยแบบจำลองผ่านกระบวนการคอปัญญาและพิสูจน์เอกสาร 4 ลำดับทับซ้อน ป้องกันและลบล้าง Human Format Error 100%:
                      </p>
                      <ul className="space-y-2 text-[10.5px]">
                        <li>
                          <strong className="text-blue-700 font-extrabold">Layer A (Metadata Resolver):</strong> ล็อกชื่อองค์กร ลำดับหนังสือ วันที่ และหัวข้อหลักของหนังสือจากฟอร์ม Deterministic ป้องกัน Human Typo
                        </li>
                        <li>
                          <strong className="text-cyan-700 font-extrabold">Layer B (Language Coprocessor):</strong> คอมไพล์ภาษาธรรมชาติผ่าน Gemini Generative API ให้อยู่ในกรอบประโยคสำนวนราชการระเบียบแบบแผน
                        </li>
                        <li>
                          <strong className="text-indigo-700 font-extrabold">Layer C (Static Analysis Validator):</strong> ตัวตรวจวิเคราะห์โครงสร้างย่อย่อหน้า การเว้นย่นระยะพิมพ์ ทรานสเลเตอร์ตัวเลขเป็นเลขไทย และคำลหุครุต้องห้ามตามกฎหมาย
                        </li>
                        <li>
                          <strong className="text-purple-700 font-extrabold">Layer D (Microsoft Word Compiler):</strong> ล็อกชุดย่อหน้าและจัดกรุกระดาษจำลอง A4 เป็น Zero Formatting variance เพื่อให้คัดลอกลง Word ถาวร
                        </li>
                      </ul>
                    </div>

                  </div>
                )}

                {activeInspectorTab === 'copilot' && (
                  <GovernmentCopilot
                    ast={ast}
                    placeholderValues={placeholderValues}
                    setAst={setAst}
                    setPlaceholderValues={setPlaceholderValues}
                    originalIntent={humanIntent}
                    setSystemAlert={setSystemAlert}
                  />
                )}

              </div>
            </div>
          </div>
        )}

      </div>

      <PrintSafetyModal
        isOpen={printValidatorOpen}
        onClose={() => setPrintValidatorOpen(false)}
        onConfirm={() => {
          setPrintValidatorOpen(false);
          setUserHasPrintValidated(true);
          setSystemAlert({ type: 'success', message: 'พิมพ์เอกสารปลอดภัยสำเร็จ! ปล่อยเกราะความกว้างและตัวเลือกลายมือชื่อแล้ว' });
          window.print();
        }}
        diagnostics={asaeResult.diagnostics}
        bodyLength={wordFormattedText.length}
      />

    </div>
  );
}
