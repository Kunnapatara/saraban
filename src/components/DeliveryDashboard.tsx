import React from 'react';
import { Printer, Download, Share2, Archive, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DeliveryDashboardProps {
  exportReadiness: number;
  printReadiness: number;
  pdfReadiness: number;
  mobileReadiness: number;
  isExportingDocx: boolean;
  isExportingPdf: boolean;
  userExportedDocx: boolean;
  userExportedPdf: boolean;
  userHasPrintValidated: boolean;
  mobileViewVerified: boolean;
  isMobile: boolean;
  isReadyToSubmit: boolean;
  isSubmitted: boolean;
  onExportDocx: () => void;
  onExportPdf: () => void;
  onTriggerPrint: () => void;
  onShareLink: () => void;
  onArchive: () => void;
  onReleaseGateSubmit: () => void;
  onVerifyMobile: () => void;
}

export default function DeliveryDashboard({
  exportReadiness,
  printReadiness,
  pdfReadiness,
  mobileReadiness,
  isExportingDocx,
  isExportingPdf,
  userExportedDocx,
  userExportedPdf,
  userHasPrintValidated,
  mobileViewVerified,
  isMobile,
  isReadyToSubmit,
  isSubmitted,
  onExportDocx,
  onExportPdf,
  onTriggerPrint,
  onShareLink,
  onArchive,
  onReleaseGateSubmit,
  onVerifyMobile,
}: DeliveryDashboardProps) {
  return (
    <div className="space-y-4 select-none text-xs">
      {/* Delivery Readiness Score Cards Container */}
      <div className="space-y-2">
        <span className="text-slate-500 font-bold text-[10.5px] uppercase tracking-wider block">ดัชนีชี้วัดความพร้อมการจัดส่ง (Delivery Readiness Score)</span>
        <div className="grid grid-cols-2 gap-2 text-center font-sans">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold block mb-1">J1 WORD EXPORT EXPLAIN</span>
            <span className={`text-base font-black ${exportReadiness === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>{exportReadiness}%</span>
            <div className="w-full bg-slate-200 h-1 mt-1 rounded-full overflow-hidden">
              <div className={`h-full ${exportReadiness === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${exportReadiness}%` }} />
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold block mb-1">J2 PRINT SAFETY EXPLAIN</span>
            <span className={`text-base font-black ${printReadiness === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>{printReadiness}%</span>
            <div className="w-full bg-slate-200 h-1 mt-1 rounded-full overflow-hidden">
              <div className={`h-full ${printReadiness === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${printReadiness}%` }} />
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold block mb-1">J3 PDF GEOMETRY EXPLAIN</span>
            <span className={`text-base font-black ${pdfReadiness === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>{pdfReadiness}%</span>
            <div className="w-full bg-slate-200 h-1 mt-1 rounded-full overflow-hidden">
              <div className={`h-full ${pdfReadiness === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pdfReadiness}%` }} />
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between">
            <span className="text-[9px] text-slate-400 font-extrabold block mb-1">J4 PORTABLE MOBILE EXPLAIN</span>
            <span className="text-base font-black text-emerald-600">{mobileReadiness}%</span>
            <div className="w-full bg-slate-200 h-1 mt-1 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${mobileReadiness}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Exporters Toolbelt */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
        <span className="font-extrabold text-[12px] text-slate-800 block flex items-center gap-1">
          <Printer size={13} className="text-emerald-600" />
          ศูนย์ทางเลือกการส่งออกจริง (Programmatic Exporters)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportDocx}
            disabled={isExportingDocx}
            className="flex items-center justify-center gap-1 bg-white border border-slate-200/90 hover:bg-slate-100 active:scale-95 text-slate-700 font-extrabold py-2 rounded-xl text-[11px] cursor-pointer shadow-2xs transition"
          >
            <Download size={12} className={isExportingDocx ? "animate-spin" : ""} />
            {isExportingDocx ? "กำลังแปลง Word..." : "ส่งออก Word (DOCX)"}
          </button>
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center justify-center gap-1 bg-white border border-slate-200/90 hover:bg-slate-100 active:scale-95 text-slate-700 font-extrabold py-2 rounded-xl text-[11px] cursor-pointer shadow-2xs transition"
          >
            <Download size={12} className={isExportingPdf ? "animate-spin" : ""} />
            {isExportingPdf ? "กำลังเขียน PDF..." : "ส่งออก PDF สยาม"}
          </button>
          <button
            onClick={onTriggerPrint}
            className="flex items-center justify-center gap-1 bg-white border border-slate-200/90 hover:bg-slate-100 active:scale-95 text-slate-700 font-extrabold py-2 rounded-xl text-[11px] cursor-pointer shadow-2xs transition"
          >
            <Printer size={12} />
            ทดสอบลอยตัวจัดพิมพ์
          </button>
          <button
            onClick={onShareLink}
            className="flex items-center justify-center gap-1 bg-white border border-slate-200/90 hover:bg-slate-100 active:scale-95 text-slate-700 font-extrabold py-2 rounded-xl text-[11px] cursor-pointer shadow-2xs transition"
          >
            <Share2 size={12} />
            ลิงก์ปลอดภัยด่วน
          </button>
        </div>
        <button
          onClick={onArchive}
          className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white hover:bg-black active:scale-[0.98] py-2 rounded-xl text-[11px] font-bold cursor-pointer transition shadow-xs"
        >
          <Archive size={12} />
          จัดเก็บจัดจำเริญเข้าแฟ้มตู้เอกสารความมั่นคงถาวร (Archive Ledger)
        </button>
      </div>

      {/* Release Gate Dashboard */}
      <div className="p-4 bg-slate-950/5 border border-slate-200 rounded-2xl space-y-3.5">
        <span className="font-extrabold text-[12px] text-slate-900 block flex items-center gap-1 border-b border-slate-150 pb-1.5 justify-between">
          <span className="flex items-center gap-1.5">
            <Lock size={13} className="text-blue-600" />
            ด่านล็อกสัญญาณปล่อยตัวนำส่ง (Release Gate)
          </span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-sans font-bold ${isReadyToSubmit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
            {isReadyToSubmit ? 'READY' : 'LOCKED'}
          </span>
        </span>

        <div className="space-y-2 text-[11px] font-sans">
          <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200/70 rounded-xl">
            <span className="text-slate-600 font-extrabold text-[10.5px]">1. แผ่นเอกสารพร้อมจัดหน้า (Canvas Area Visible)</span>
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200/70 rounded-xl">
            <span className="text-slate-600 font-extrabold text-[10.5px]">2. จัดทำเนื้อหา Word เป็นที่เสร็จสิ้น (J1 DOCX Export Pass)</span>
            {userExportedDocx ? (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">Pending</span>
            )}
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200/70 rounded-xl">
            <span className="text-slate-600 font-extrabold text-[10.5px]">3. โครงวิชาการ PDF ผ่านเกณฑ์พิกัด (J3 PDF Export Pass)</span>
            {userExportedPdf ? (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">Pending</span>
            )}
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200/70 rounded-xl">
            <span className="text-slate-600 font-extrabold text-[10.5px]">4. ลายมือชื่อและกระดาษตรวจสอบผ่าน (J2 Print Pass)</span>
            {userHasPrintValidated ? (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">Pending</span>
            )}
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200/70 rounded-xl">
            <span className="text-slate-600 font-extrabold text-[10.5px]">5. ผ่านการตรวจสอบหน้าจอมือถือ (J4 Mobile View Pass)</span>
            {mobileViewVerified || isMobile ? (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <button
                onClick={onVerifyMobile}
                className="text-[9px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-250 cursor-pointer transition"
              >
                Verify
              </button>
            )}
          </div>
        </div>

        {isSubmitted ? (
          <div className="text-center p-3.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-350 font-black flex items-center justify-center gap-1.5 animate-bounce font-sans">
            <ShieldCheck size={16} />
            ส่งต่อออกลายลงระบบเซ็นรับรองสำเร็จเกียรติยศ!
          </div>
        ) : (
          <button
            onClick={onReleaseGateSubmit}
            disabled={!isReadyToSubmit}
            className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs shadow-md transition-all duration-300 ${
              isReadyToSubmit
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] cursor-pointer cursor-emerald-glow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isReadyToSubmit ? (
              <>
                <ShieldCheck size={14} />
                ส่งประกาสนัยและปล่อยตัวอย่างเป็นทางการ (READY TO SUBMIT)
              </>
            ) : (
              <>
                <Lock size={12} fill="currentColor" />
                กรุณาสนองผลส่งออก & ทดสอบพิมพ์ให้ครบ 5 รายการเกณฑ์
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
