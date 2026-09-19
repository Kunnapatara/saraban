/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface STSAnchor {
  id: string;
  name: string;
  required: boolean;
  locked: boolean;
  x_mm: number;
  y_mm: number;
  width_mm: number;
  height_mm: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  font_family: string;
  font_size_pt: number;
  can_ai_modify: boolean;
}

export interface STSSpacingRule {
  rule_id: string;
  name: string;
  expected_mm: number;
  tolerance_mm: number;
}

export interface STSPaginationRule {
  rule_id: string;
  description: string;
  action_under_space_limit: string;
}

export interface STSSignatureRule {
  reserved_height_mm: number;
  minimum_top_gap_mm: number;
  name_alignment: 'left' | 'center' | 'right';
  support_digital_sign: boolean;
}

export interface STSValidationRule {
  rule_id: string;
  name: string;
  severity: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';
  expected_condition: string;
}

export interface STSTemplateMap {
  template_id: string;
  template_name: string;
  document_type: string;
  version: string;
  template_hash: string;
  regulation_reference: string;
  page_spec: {
    paper_size: string;
    width_mm: number;
    height_mm: number;
    margin_top_mm: number;
    margin_bottom_mm: number;
    margin_left_mm: number;
    margin_right_mm: number;
  };
  anchors: STSAnchor[];
  spacing_rules: STSSpacingRule[];
  pagination_rules: STSPaginationRule[];
  signature_rules: STSSignatureRule[];
  validation_rules: STSValidationRule[];
}

export const STS_REPOS_INDEX: Record<string, STSTemplateMap> = {
  'STS-INTMEMO-V1': {
    template_id: 'STS-INTMEMO-V1',
    template_name: 'หนังสือภายใน (บันทึกข้อความ)',
    document_type: 'INTERNAL_MEMO',
    version: '1.3.4',
    template_hash: 'SHA256:84A91B87CD2DBB',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม ภาคผนวก ๑',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem', name: 'ตราซ้ายครุฑขนาดเล็กสูง ๑.๕ ซม.', required: true, locked: true, x_mm: 30, y_mm: 25, width_mm: 15, height_mm: 15, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false },
      { id: 'doc_title', name: 'คำบันทึกข้อความหัวเรื่อง', required: true, locked: true, x_mm: 80, y_mm: 25, width_mm: 100, height_mm: 15, alignment: 'center', font_family: 'TH Saraban New Bold', font_size_pt: 29, can_ai_modify: false },
      { id: 'gov_agency', name: 'ส่วนราชการเจ้าของเรื่อง', required: true, locked: false, x_mm: 55, y_mm: 44, width_mm: 125, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New Bold', font_size_pt: 16, can_ai_modify: true },
      { id: 'ref_num', name: 'ที่สารบรรณ (เลขครุฑกำกับ)', required: true, locked: false, x_mm: 35, y_mm: 52, width_mm: 65, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'date_block', name: 'วันที่ออกหนังสือภายใน', required: true, locked: false, x_mm: 110, y_mm: 52, width_mm: 70, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'subject_block', name: 'หัวข้อเรื่องหนังสือ', required: true, locked: false, x_mm: 45, y_mm: 60, width_mm: 135, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New Bold', font_size_pt: 16, can_ai_modify: true },
      { id: 'recipient', name: 'เรียนคำทักทายระดับตำแหน่ง', required: true, locked: false, x_mm: 45, y_mm: 68, width_mm: 135, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'body_area', name: 'ส่วนเนื้อความบทสารัตถะ', required: true, locked: false, x_mm: 30, y_mm: 80, width_mm: 160, height_mm: 140, alignment: 'justify', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'signature_block', name: 'พื้นที่ลายมือชื่อและวงเล็บชื่อเต็ม', required: true, locked: true, x_mm: 95, y_mm: 220, width_mm: 80, height_mm: 45, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: false }
    ],
    spacing_rules: [
      { rule_id: 'GAP-MAJOR-SEC', name: 'ระยะห่างระหว่างจุดหัวข้อหลัก', expected_mm: 8, tolerance_mm: 0.5 },
      { rule_id: 'GAP-MINOR-SEC', name: 'ระยะห่างแถวหัวข้อย่อย', expected_mm: 4, tolerance_mm: 0.5 },
      { rule_id: 'BODY-LINE-HT', name: 'ระนาบความสูงระยะบรรทัดมาตรฐาน', expected_mm: 8, tolerance_mm: 0.2 },
      { rule_id: 'INDENT-FIRST', name: 'ระยะเยื้องวรรคแรกพึงห่างขอบซ้าย', expected_mm: 25, tolerance_mm: 1.0 }
    ],
    pagination_rules: [
      { rule_id: 'PAG-001', description: 'ห้ามแยกบันทึก Signature Block สปิริตเดี่ยวข้ามหน้าเดียวดาย', action_under_space_limit: 'ดันย่อยหน้าธุรการลงท้ายทั้งหมดไปยังหน้า ๒ ทันที' },
      { rule_id: 'PAG-002', description: 'ตรวจจับย่อหน้าขัดขอบพิมพ์ล้นกระดาษกระชั้นชิด', action_under_space_limit: 'บีบขยายช่องไฟระหว่างบรรทัดลงเหลือ ๗ มม.' }
    ],
    signature_rules: [
      { reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }
    ],
    validation_rules: [
      { rule_id: 'SIG-001', name: 'ตรวจระยะช่องไฟลายมือชื่อติดขัดบทสรุป', severity: 'CRITICAL', expected_condition: 'ระยะห่างระหว่างข้อความเสร็จสิ้นกับวงเล็บลายเซ็นต้องอย่างน้อย ๑๒ มม.' },
      { rule_id: 'PLC-001', name: 'ตรวจพบดักตัวแปรรอกรอกค้างในเอกสาร', severity: 'CRITICAL', expected_condition: 'สัมประสิทธิ์ความตกค้างของตัวแปรต้องเท่ากับศูนย์' },
      { rule_id: 'PAR-001', name: 'ขาดการทำเยื้องเยื้องย่อหน้า (Indent)', severity: 'WARNING', expected_condition: 'ย่อหน้าธุรการสารัตถะต้องเว้นวรรคเยื้องเข้า ๒๕ มม.' }
    ]
  },
  'STS-EXTLETTER-V1': {
    template_id: 'STS-EXTLETTER-V1',
    template_name: 'หนังสือภายนอก (แบบตราครุฑกึ่งกลาง)',
    document_type: 'EXTERNAL',
    version: '1.4.2',
    template_hash: 'SHA256:4C83FF12A1F45E',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๑',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑกึ่งกลางพิกัดสูง ๓ ซม.', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false },
      { id: 'sender_field', name: 'ส่วนราชการเบื้องขวาบน', required: true, locked: false, x_mm: 120, y_mm: 35, width_mm: 70, height_mm: 15, alignment: 'left', font_family: 'TH Saraban New Bold', font_size_pt: 16, can_ai_modify: true },
      { id: 'ref_num_field', name: 'ที่ หนังสือสารบรรณออก', required: true, locked: false, x_mm: 30, y_mm: 45, width_mm: 50, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'date_str_field', name: 'วันเดือนปีออกจดหมาย', required: true, locked: false, x_mm: 95, y_mm: 55, width_mm: 60, height_mm: 8, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'subject_field', name: 'เรื่องนำเรียนพิกัดรอง', required: true, locked: false, x_mm: 30, y_mm: 65, width_mm: 160, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New Bold', font_size_pt: 16, can_ai_modify: true },
      { id: 'salutation_field', name: 'คำเชิญเรียนตามยศตำแหน่งผู้รับ', required: true, locked: false, x_mm: 30, y_mm: 73, width_mm: 160, height_mm: 8, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'body_field', name: 'เนื้อหาประโยคภาคความจริง', required: true, locked: false, x_mm: 30, y_mm: 90, width_mm: 160, height_mm: 120, alignment: 'justify', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'closing_text_field', name: 'คำขึ้นต้นคำลงท้ายเสรี', required: true, locked: true, x_mm: 110, y_mm: 220, width_mm: 80, height_mm: 8, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: false },
      { id: 'signature_block_field', name: 'บล็อกรับตำแหน่งลายเซ็น', required: true, locked: true, x_mm: 110, y_mm: 232, width_mm: 80, height_mm: 40, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: false }
    ],
    spacing_rules: [
      { rule_id: 'GAP-TOP-EMBLEM', name: 'ช่องว่างห่างจากขอบตราบนสุด', expected_mm: 10, tolerance_mm: 0.5 },
      { rule_id: 'GAP-SENDER-ROW', name: 'ช่องเว้นแถวฝ่ายเจ้าของตำแหน่ง', expected_mm: 8, tolerance_mm: 0.5 }
    ],
    pagination_rules: [
      { rule_id: 'PAG-003', description: 'ป้องขอบฟุตเตอร์ชนพิกัดอักขระส่งท้าย', action_under_space_limit: 'ตัดหน้าขึ้นย่อหน้าปิดทันทีถ้าระยะพิมพ์ล่าง < ๖๐ มม.' }
    ],
    signature_rules: [
      { reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }
    ],
    validation_rules: [
      { rule_id: 'LAY-001', name: 'ตราเครื่องหมายทับซ้อนหรือหลุดเฟรม', severity: 'CRITICAL', expected_condition: 'พิกัดครุฑต้องตรงจุดกึ่งกลางที่ x=๙๐ ยมม. เสมอ' }
    ]
  },
  'STS-STAMP-V1': {
    template_id: 'STS-STAMP-V1',
    template_name: 'หนังสือประทับตรา (แบบครุฑแกนบนกลาง)',
    document_type: 'STAMPED_LETTER',
    version: '1.0.0',
    template_hash: 'SHA256:1E2B3C4D5E6F7D',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๓',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑกึ่งกลางพิกัดสูง ๓ ซม.', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false },
      { id: 'body_stamped', name: 'เนื้อหาหนังสือประทับตรา', required: true, locked: false, x_mm: 30, y_mm: 60, width_mm: 160, height_mm: 140, alignment: 'justify', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true },
      { id: 'red_stamp_zone', name: 'วงประทับชื่อแดงกึ่งวิสุทธิ์', required: true, locked: true, x_mm: 90, y_mm: 210, width_mm: 45, height_mm: 45, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: false }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [
      { reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: false }
    ],
    validation_rules: []
  },
  'STS-ORDER-V1': {
    template_id: 'STS-ORDER-V1',
    template_name: 'แบบคำสั่ง (ตราครุฑกลางใหญ่)',
    document_type: 'ORDER',
    version: '1.0.1',
    template_hash: 'SHA256:FE82A9C104BB1E',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๔',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑกึ่งกลางพิกัดสูง ๓ ซม.', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [{ reserved_height_mm: 45, minimum_top_gap_mm: 15, name_alignment: 'center', support_digital_sign: true }],
    validation_rules: []
  },
  'STS-REGULATION-V1': {
    template_id: 'STS-REGULATION-V1',
    template_name: 'แบบระเบียบ (ตราครุฑกึ่งกลางข้อความพิกัดแนบ)',
    document_type: 'REGULATION',
    version: '1.0.0',
    template_hash: 'SHA256:7B8F9A0C1D2E3F',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๕',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑใหญ่กึ่งกลางบุกแถวบน', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [{ reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }],
    validation_rules: []
  },
  'STS-RULE-V1': {
    template_id: 'STS-RULE-V1',
    template_name: 'แบบข้อบังคับสัญญากลาง',
    document_type: 'RULE',
    version: '1.0.0',
    template_hash: 'SHA256:9F8E7D6C5B4A3B',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๖',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑกึ่งกลางพิกัดสูง ๓ ซม.', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [{ reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }],
    validation_rules: []
  },
  'STS-ANNOUNCE-V1': {
    template_id: 'STS-ANNOUNCE-V1',
    template_name: 'ประกาศพระราชโองการ / ประกาศทั่วไป',
    document_type: 'ANNOUNCEMENT',
    version: '1.1.0',
    template_hash: 'SHA256:EE77FF11A4CC11',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๗',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑกึ่งกลางพิกัดสูง ๓ ซม.', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false },
      { id: 'announce_title', name: 'ชื่อสถาบันประกาศนำเรื่อง', required: true, locked: false, x_mm: 30, y_mm: 45, width_mm: 150, height_mm: 10, alignment: 'center', font_family: 'TH Saraban New Bold', font_size_pt: 20, can_ai_modify: true }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [{ reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }],
    validation_rules: []
  },
  'STS-PUBLICITY-V1': {
    template_id: 'STS-PUBLICITY-V1',
    template_name: 'ข่าวและแถลงการณ์ราชการร่วม',
    document_type: 'PUBLICITY',
    version: '1.0.0',
    template_hash: 'SHA256:9A8B7C6C4D3E2F',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๘ และ ๙',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑกึ่งกลางพิกัดสูง ๓ ซม.', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [{ reserved_height_mm: 30, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }],
    validation_rules: []
  },
  'STS-CERTIFY-V1': {
    template_id: 'STS-CERTIFY-V1',
    template_name: 'แบบหนังสือรับรองสถานคุณประโยชน์',
    document_type: 'CERTIFICATION',
    version: '1.1.2',
    template_hash: 'SHA256:FA33EB449CD21F',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๑๐',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'garuda_emblem_mid', name: 'ตราครุฑกึ่งกลางพิกัดสูง ๓ ซม.', required: true, locked: true, x_mm: 90, y_mm: 10, width_mm: 30, height_mm: 30, alignment: 'center', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false },
      { id: 'pic_box', name: 'พิกัดกรอบติดรูปถ่ายถ่ายทอดมุมซ้าย', required: false, locked: true, x_mm: 30, y_mm: 220, width_mm: 40, height_mm: 60, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 0, can_ai_modify: false }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [{ reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }],
    validation_rules: []
  },
  'STS-MEETING-V1': {
    template_id: 'STS-MEETING-V1',
    template_name: 'รายงานการประชุมฉบับแบบแผน',
    document_type: 'MEETING_MINUTES',
    version: '1.2.0',
    template_hash: 'SHA256:AA22BB33CC44DD',
    regulation_reference: 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ แบบที่ ๑๑',
    page_spec: {
      paper_size: 'A4 Portrait',
      width_mm: 210,
      height_mm: 297,
      margin_top_mm: 25,
      margin_bottom_mm: 25,
      margin_left_mm: 30,
      margin_right_mm: 20
    },
    anchors: [
      { id: 'meeting_title', name: 'หัวข้อรายงานการประชุมใหญ่', required: true, locked: false, x_mm: 30, y_mm: 30, width_mm: 150, height_mm: 10, alignment: 'center', font_family: 'TH Saraban New Bold', font_size_pt: 20, can_ai_modify: true },
      { id: 'attendance_box', name: 'รายชื่อผู้เข้าร่วมประชุมอย่างเป็นทางการ', required: true, locked: false, x_mm: 30, y_mm: 45, width_mm: 150, height_mm: 40, alignment: 'left', font_family: 'TH Saraban New', font_size_pt: 16, can_ai_modify: true }
    ],
    spacing_rules: [],
    pagination_rules: [],
    signature_rules: [{ reserved_height_mm: 45, minimum_top_gap_mm: 12, name_alignment: 'center', support_digital_sign: true }],
    validation_rules: []
  }
};
