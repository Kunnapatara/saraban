/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecipientProtocol, PhraseLintRule, DocumentAST } from '../types';

export const RECIPIENT_PROTOCOLS: Record<string, RecipientProtocol> = {
  PRIME_MINISTER: {
    id: 'PRIME_MINISTER',
    name: 'นายกรัฐมนตรี',
    title: 'นายกรัฐมนตรี',
    salutation: 'กราบเรียน นายกรัฐมนตรี',
    closing: 'ขอแสดงความนับถืออย่างยิ่ง',
    recipientLabel: 'นายกรัฐมนตรี',
  },
  MINISTER: {
    id: 'MINISTER',
    name: 'รัฐมนตรีว่าการกระทรวง',
    title: 'รัฐมนตรีว่าการกระทรวง...',
    salutation: 'เรียน รัฐมนตรีว่าการกระทรวง[MINISTRY_REQUIRED]',
    closing: 'ขอแสดงความนับถือ',
    recipientLabel: 'รัฐมนตรีว่าการกระทรวง[MINISTRY_REQUIRED]',
  },
  PERMANENT_SECRETARY: {
    id: 'PERMANENT_SECRETARY',
    name: 'ปลัดกระทรวง',
    title: 'ปลัดกระทรวง...',
    salutation: 'เรียน ปลัดกระทรวง[MINISTRY_REQUIRED]',
    closing: 'ขอแสดงความนับถือ',
    recipientLabel: 'ปลัดกระทรวง[MINISTRY_REQUIRED]',
  },
  DIRECTOR_GENERAL: {
    id: 'DIRECTOR_GENERAL',
    name: 'อธิบดีกรม',
    title: 'อธิบดีกรม...',
    salutation: 'เรียน อธิบดีกรม[DEPARTMENT_REQUIRED]',
    closing: 'ขอแสดงความนับถือ',
    recipientLabel: 'อธิบดีกรม[DEPARTMENT_REQUIRED]',
  },
  GOVERNOR: {
    id: 'GOVERNOR',
    name: 'ผู้ว่าราชการจังหวัด',
    title: 'ผู้ว่าราชการจังหวัด',
    salutation: 'เรียน ผู้ว่าราชการจังหวัด[PROVINCE_REQUIRED]',
    closing: 'ขอแสดงความนับถือ',
    recipientLabel: 'ผู้ว่าราชการจังหวัด[PROVINCE_REQUIRED]',
  },
  DISTRICT_CHIEF: {
    id: 'DISTRICT_CHIEF',
    name: 'นายอำเภอ',
    title: 'นายอำเภอ',
    salutation: 'เรียน นายอำเภอ[DISTRICT_NAME_REQUIRED]',
    closing: 'ขอแสดงความนับถือ',
    recipientLabel: 'นายอำเภอ[DISTRICT_NAME_REQUIRED]',
  },
  MONK: {
    id: 'MONK',
    name: 'พระภิกษุสงฆ์ / เจ้าอาวาส',
    title: 'พระภิกษุสงฆ์',
    salutation: 'นมัสการ [MONK_TITLE_REQUIRED]',
    closing: 'ขอนมัสการด้วยความเคารพอย่างยิ่ง',
    recipientLabel: '[MONK_TITLE_REQUIRED]',
  },
  PUBLIC_ORGANIZATION: {
    id: 'PUBLIC_ORGANIZATION',
    name: 'หัวหน้าหน่วยงานราชการ / บุคคลทั่วไป',
    title: 'หัวหน้าหน่วยงาน',
    salutation: 'เรียน [RECIPIENT_TITLE_REQUIRED]',
    closing: 'ขอแสดงความนับถือ',
    recipientLabel: '[RECIPIENT_TITLE_REQUIRED]',
  },
};

export const PHRASE_LINT_RULES: PhraseLintRule[] = [
  {
    forbidden: 'ไลน์มาบอก',
    replacement: 'ประสานแจ้งความประสงค์',
    explanation: 'เปลี่ยนจากการระบุชื่อแอปพลิเคชันส่วนตัว (Line) เป็นความคุ้มครองทางสารบรรณอย่างเป็นทางการ',
  },
  {
    forbidden: 'ทักมาบอก',
    replacement: 'ประสานแจ้งความประสงค์',
    explanation: 'เปลี่ยนจากคำกริยาไม่เป็นทางการส่งสารนอกระบบ เป็นคำประสานราชการที่ถูกต้องพึงปฏิบัติ',
  },
  {
    forbidden: 'ทักไลน์',
    replacement: 'ติดต่อประสานงาน',
    explanation: 'เป็นคำไม่เป็นทางการทางสังคมออนไลน์',
  },
  {
    forbidden: 'ขอใช้ห้อง',
    replacement: 'ขอความอนุเคราะห์ใช้สถานที่',
    explanation: 'วรรณศิลป์ราชการควรมีความสุภาพนบนอบด้วยคำภาษาที่ขัดเกลาแล้ว',
  },
  {
    forbidden: 'ขอยืมสถานที่',
    replacement: 'ขอความอนุเคราะห์ใช้สถานที่',
    explanation: 'เปลี่ยนคำขอหยาบในระบบยืมสถานที่ราชการเป็นระดับคำขอความอนุเคราะห์ที่เป็นแบบแผน',
  },
  {
    forbidden: 'ยืมป้าย',
    replacement: 'ขอความอนุเคราะห์ยืมใช้วัสดุอุปกรณ์ประชาสัมพันธ์',
    explanation: 'คำว่า ยืม สำหรับสิ่งของที่เป็นทางการต้องระบุหมวดวัสดุอุปกรณ์ที่เหมาะสม',
  },
  {
    forbidden: 'ให้รีบมา',
    replacement: 'โปรดเดินทางมาร่วมประชุมตามวันและเวลาดังกล่าว',
    explanation: 'เปลี่ยนคำบังคับรวบรัดเชิงปฏิเสธมารยาท ให้เป็นการเรียนเชิญอย่างเป็นทางการและสมบูรณ์',
  },
  {
    forbidden: 'บอกให้รู้',
    replacement: 'จึงเรียนมาเพื่อโปรดทราบ',
    explanation: 'เปลี่ยนระดับการเรียนเสนอเพื่อรับทราบให้สุภาพเรียบร้อยถูกต้องตามระเบียบงานสารบรรณ',
  },
  {
    forbidden: 'แจ้งให้ทราบ',
    replacement: 'จึงเรียนมาเพื่อโปรดทราบและถือปฏิบัติ',
    explanation: 'ใช้ประโยคแจ้งมติราชการแบบถูกต้องสมบูรณ์และเด็ดขาด',
  },
  {
    forbidden: 'เลื่อนกำหนด',
    replacement: 'ขอขยายระยะเวลาการดำเนินงาน',
    explanation: 'ให้ใช้วลีอย่างเป็นทางการเพื่อระบุสิทธิ์ตามกฎหมายระเบียบจัดซื้อจัดจ้าง',
  },
  {
    forbidden: 'แจ้งว่า',
    replacement: 'ขอเรียนแจ้งเพื่อโปรดทราบว่า',
    explanation: 'เพิ่มระดับความเป็นทางการในการนำความกราบเรียนหัวหน้าส่วนงาน',
  },
  {
    forbidden: 'ส่งเมลไปละ',
    replacement: 'จัดส่งข้อมูลผ่านระบบสารสนเทศอิเล็กทรอนิกส์เรียบร้อยแล้ว',
    explanation: 'สารบรรณดิจิทัลกำหนดให้เรียกอีเมลหรือระบบแชร์ข้อมูลว่าระบบสารสนเทศ',
  },
  {
    forbidden: 'ขอเงินเพิ่ม',
    replacement: 'ขออนุมัติสนับสนุนงบประมาณเพิ่มเติม',
    explanation: 'หลีกเลี่ยงพฤติกรรมใช้ถ้อยคำตรงไปตรงมาเกินไปในข้อตกลงการคลัง',
  },
  {
    forbidden: 'อยากให้ช่วย',
    replacement: 'มีความประสงค์ขอความอนุเคราะห์',
    explanation: 'เปลี่ยนคำร้องขอภาษาปากทั่วไปให้เป็นระดับเจตนาขอพึ่งความอนุเคราะห์ที่เป็นทางการ',
  },
  {
    forbidden: 'ช่วยหน่อย',
    replacement: 'มีความประสงค์ขอความอนุเคราะห์',
    explanation: 'ปรับระดับภาษาให้มีความสุภาพ นอบน้อม และเป็นทางราชการ',
  },
  {
    forbidden: 'แก้ปัญหา',
    replacement: 'บรรเทาความเดือดร้อนและแก้ไขปัญหาอุปสรรค',
    explanation: 'ขยายความและระบุเจตนารักษาประโยชน์สาธารณะตามวัตถุประสงค์งานส่วนท้องถิ่น',
  },
  {
    forbidden: 'อยากให้มาช่วย',
    replacement: 'ใคร่ขอความอนุเคราะห์สนับสนุนวิทยากรและบุคลากรเพื่อร่วมบูรณาการ',
    explanation: 'การร้องขอความร่วมมือทางราชการต้องมีระดับความสุภาพและเอื้อเฟื้อ',
  },
  {
    forbidden: 'เซ็นให้หน่อย',
    replacement: 'จึงเรียนมาเพื่อโปรดพิจารณาลงนาม',
    explanation: 'ประโยคลงท้ายเสนอแฟ้มที่มีน้ำหนักความเคารพตามสายบังคับบัญชา',
  },
  {
    forbidden: 'แกบอกว่า',
    replacement: 'ผู้ประสานงานได้เรียนชี้แจงว่า',
    explanation: 'เปลี่ยนสรรพนามไม่สุภาพให้ถูกต้องตาระเบียบ',
  },
  {
    forbidden: 'ตามเรื่องให้ที',
    replacement: 'ประสานเพื่อติดตามความก้าวหน้าผลการดำเนินงาน',
    explanation: 'แก้ไขระดับภาษาที่สบประมาทให้เป็นคำประสานเชิงสุภาพ',
  },
];

export const DEFAULT_EXTERNAL_AST: DocumentAST = {
  document_type: 'EXTERNAL',
  recipient_protocol: 'DISTRICT_CHIEF',
  salutation: 'เรียน นายอำเภอ[DISTRICT_NAME_REQUIRED]',
  compiled_body_fragment: 'ด้วย [ORGANIZATION_REQUIRED] มีความประสงค์จะดำเนินกิจกรรม [ACTIVITIES_REQUIRED] ในวันเวลาที่กำหนด จึงเรียนมาเพื่อโปรดทราบและขอความร่วมมือมา ณ โอกาสนี้',
  closing_protocol: 'ขอแสดงความนับถือ',
  detected_placeholders: ['[DISTRICT_NAME_REQUIRED]', '[ORGANIZATION_REQUIRED]', '[ACTIVITIES_REQUIRED]'],
  sender_organization: 'องค์การบริหารส่วนตำบลดอนดู่',
  document_number: 'นม ๗๖๕๐๑/๑๐๔',
  date: '๒๐ พฤษภาคม ๒๕๖๙',
  subject: 'ขอเชิญเข้าร่วมพิธีเปิดการแข่งขันกีฬาเยาวชนดอนดู่ต้านยาเสพติดประจำปี',
};

export const DEFAULT_INTERNAL_AST: DocumentAST = {
  document_type: 'INTERNAL',
  recipient_protocol: 'GOVERNOR',
  salutation: 'เรียน ผู้ว่าราชการจังหวัดชัยภูมิ',
  compiled_body_fragment: 'ด้วย ฝ่ายปกครองและการคลัง สำนักงานเทศบาลเมืองชัยภูมิ ได้รวบรวมแบบรายงานตรวจนับวัสดุภัณฑ์ประจำไตรมาสที่ ๒ แผนกครุภัณฑ์สำนักงาน เพื่อเสนอโปรดลงเกียรติยศลงนามรับทราบ ทั้งนี้ รายการครุภัณฑ์ดังกล่าวผ่านระดับมาตรฐานการสำรวจแล้วในเกณฑ์เรียบร้อยดี',
  closing_protocol: '',
  detected_placeholders: [],
  sender_organization: 'ฝ่ายบริหารทั่วไป สำนักปลัดเทศบาล',
  document_number: 'ชย ๕๒๐๐๑/ว ๘๙',
  date: '๒๐ พฤษภาคม ๒๕๖๙',
  subject: 'รายงานสรุปการตรวจรับพัสดุครุภัณฑ์ประจำปีงบประมาณ',
};
