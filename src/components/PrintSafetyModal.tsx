import React from 'react';
import { X, Printer, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface PrintSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  diagnostics: any[];
  bodyLength: number;
}

export default function PrintSafetyModal({
  isOpen,
  onClose,
  onConfirm,
  diagnostics,
  bodyLength
}: PrintSafetyModalProps) {
  if (!isOpen) return null;

  // Print Safety Rules and Validation Checks
  const hasPageOverflow = bodyLength > 1000 || diagnostics.some(d => d.code === 'PAGE-001');
  const hasSigCollision = diagnostics.some(d => d.code === 'SIG-002' || d.code === 'LAY-004');
  const hasOmission = diagnostics.some(d => d.severity === 'CRITICAL');

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Block with Red/Gold Badge */}
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-amber-400" />
            <span className="font-extrabold text-[13.5px] uppercase tracking-wide">
              เครื่องตรวจสอบความเรขาคณิตปลอดภัยก่อนสั่งพิมพ์ (Print Safety Validator)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Validator Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex gap-3">
            <ShieldAlert size={28} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed text-slate-600">
              <span className="font-bold text-slate-800 text-[12px] block">คำแนะนำระเบียบจัดพิมพ์พัสดุ (๕๕ มม.)</span>
              เพื่อการรักษาขอบเขตลอยของกระดาษ A4 เสมอกัน ระยะห่างท้ายจากตำแหน่งปิดหนังสือจนสิ้นสุดแผ่นต้องมีช่องกิเลสเว้นไว้อย่างน้อย ๕๕ มม. เพื่อสำรองพื้นที่สำหรับการเขียนปากกาสดลายมือเจ้าเมืองผู้มีอำนาจ
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px] block">
              ผลประเมินตามกฎหมายพจนานุกรมสารบรรณ:
            </span>

            {/* Check 1: Page Overflow / Page boundary */}
            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white shadow-2xs">
              <div>
                <span className="font-bold text-slate-800 text-[11.5px] block">1. ระเบียบตรวจสอบพื้นที่กระดาษหน้าแรก [ PAGE-001 ]</span>
                <span className="text-[10.5px] text-slate-400 font-medium">ป้องกันอาการตัวอักษรล้นขาดหรือหลุดไปหน้าสองอย่างไร้แบบแผน</span>
              </div>
              {hasPageOverflow ? (
                <span className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertTriangle size={12} /> Warning
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-150">
                  <CheckCircle size={12} /> Pass (Green)
                </span>
              )}
            </div>

            {/* Check 2: Signature block coordinates / Collision safety */}
            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white shadow-2xs">
              <div>
                <span className="font-bold text-slate-800 text-[11.5px] block">2. การประกันพิกัดลายมือชื่อสด [ SIG-002 ]</span>
                <span className="text-[10.5px] text-slate-400 font-medium">ตรวจตราไม่ให้ตำแหน่งนามประทับชนชิดขอบกระดาษล่าง (๕๕ มม.)</span>
              </div>
              {hasSigCollision ? (
                <span className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertTriangle size={12} /> Collision Risk
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-150">
                  <CheckCircle size={12} /> Clear Margin
                </span>
              )}
            </div>

            {/* Check 3: General critical violations check */}
            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white shadow-2xs">
              <div>
                <span className="font-bold text-slate-800 text-[11.5px] block">3. คุณสมบัติตัวแปรครบเครื่องพงศาวดาร [ STS-001 ]</span>
                <span className="text-[10.5px] text-slate-400 font-medium">สัญญาณตรวจสอบรอยพิมพ์ว่าง [] และข้อความทดลองทั้งหมด</span>
              </div>
              {hasOmission ? (
                <span className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-150">
                  <AlertTriangle size={12} /> Blocked
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-150">
                  <CheckCircle size={12} /> Ready
                </span>
              )}
            </div>
          </div>

          {/* Warnings alerting */}
          {(hasPageOverflow || hasSigCollision) && (
            <p className="text-[10px] text-amber-600 leading-normal bg-amber-50 border border-amber-100 rounded-xl p-3 font-medium">
              ⚠️ <strong>ข้อระวังราชการ:</strong> ตรวจพบระดับเนื้อหาหรือช่วงเว้นบรรทัดอาจทำให้ขอบการพิมพ์หรือพิกัดจัดหน้า Word/PDF ลอยเบี่ยงคลาดจากจุดกึ่งกลาง STS แนะนำให้กดปุ่ม "Auto-Remediation" ก่อนยืนยันการพิมพ์จริงเพื่อความเนี้ยบเป๊ะ
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex items-center justify-end gap-2.5 select-none">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-bold cursor-pointer text-xs"
          >
            ยกเลิกเพื่อไปจัดหน้าใหม่
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-xl shadow-md cursor-pointer text-xs flex items-center gap-1.5"
          >
            <Printer size={13} />
            พิมพ์ระบบราชการตามความเข้าใจความปลอดภัย
          </button>
        </div>

      </div>
    </div>
  );
}
