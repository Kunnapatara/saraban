/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Paragraph, TextRun, AlignmentType, Packer } from 'docx';
import { DocumentAST } from '../types';
import { convertToThaiNumerals, runLocalizationEngine } from './linter';

/**
 * High-quality programmatic native DOCX exporter from Administrative AST.
 * This ensures no format regression, exact margins, correct TH Sarabun New font, 
 * proper administrative spacing, first-line indentation, and right-hand signature blocks.
 * 
 * Works beautifully with Microsoft Word, LibreOffice, WPS, and OnlyOffice.
 */
export async function exportToDocx(
  ast: DocumentAST,
  placeholderValues: Record<string, string>,
  useThaiNumerals: boolean
): Promise<Blob> {
  // Extract and replace placeholders
  const replaceAll = (text: string) => {
    if (!text) return '';
    let replaced = text;
    for (const [key, value] of Object.entries(placeholderValues)) {
      if (value.trim() !== '') {
        replaced = replaced.replaceAll(key, value);
      }
    }
    return replaced;
  };

  const cleanText = (text: string) => {
    let raw = replaceAll(text);
    if (useThaiNumerals) {
      raw = runLocalizationEngine(raw, true);
    }
    return raw;
  };

  const docType = ast.document_type;
  const isInternal = docType === 'INTERNAL' || docType === 'INTERNAL_MEMO';

  const docNum = cleanText(ast.document_number || '');
  const senderOrg = cleanText(ast.sender_organization || '');
  const docDate = cleanText(ast.date || '');
  const subjectStr = cleanText(ast.subject || '');
  const recipientStr = cleanText(ast.salutation || '');
  const referenceStr = cleanText(ast.reference || '');
  const enclosuresStr = cleanText(ast.enclosures || '');
  const bodyText = cleanText(ast.compiled_body_fragment || '');
  const closingText = cleanText(ast.closing_protocol || 'ขอแสดงความนับถือ');

  const signatureName = cleanText(placeholderValues['[SIGNATURE_NAME_REQUIRED]'] || '(........................................)');
  const signatureTitle = cleanText(placeholderValues['[SIGNATURE_TITLE_REQUIRED]'] || 'ตำแหน่ง [SIGNATURE_TITLE_REQUIRED]');

  const FONT_NAME = 'TH Sarabun New';

  // Margins in Twips:
  // Top: 2.5 cm ~ 1417 twips
  // Bottom: 2.5 cm ~ 1417 twips
  // Left: 3.0 cm ~ 1701 twips
  // Right: 2.0 cm ~ 1134 twips

  const docChildren: Paragraph[] = [];

  if (!isInternal) {
    // EXTERNAL BOOK (หนังสือภายนอก)

    // Garuda space placeholder - let's add a large Centered Heading
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 600 },
        children: [
          new TextRun({
            text: '(ตราครุฑ)',
            font: FONT_NAME,
            size: 32, // 16pt
            bold: true,
          }),
        ],
      })
    );

    // Number & Sender org row
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `ที่ ${docNum}`,
            font: FONT_NAME,
            size: 32,
            bold: true,
          }),
          new TextRun({
            text: '\t\t\t\t\t\t\t' + senderOrg,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    // Date
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: docDate,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    // Subject
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: 'เรื่อง   ',
            font: FONT_NAME,
            size: 32,
            bold: true,
          }),
          new TextRun({
            text: subjectStr,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    // Recipient salutation
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: recipientStr,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    // References
    if (referenceStr) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'อ้างถึง   ',
              font: FONT_NAME,
              size: 32,
              bold: true,
            }),
            new TextRun({
              text: referenceStr,
              font: FONT_NAME,
              size: 32,
            }),
          ],
        })
      );
    }

    // Enclosures
    if (enclosuresStr) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: 'สิ่งที่ส่งมาด้วย   ',
              font: FONT_NAME,
              size: 32,
              bold: true,
            }),
            new TextRun({
              text: enclosuresStr,
              font: FONT_NAME,
              size: 32,
            }),
          ],
        })
      );
    }

    // Paragraphs of Body Text with correct indent of 2.5 cm (~1440 twips / 360 dxa per tab)
    const bodyPars = bodyText.split('\n');
    bodyPars.forEach((pText) => {
      if (pText.trim() === '') return;
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 720 }, // 0.5 inches first line indent
          spacing: { after: 200, line: 360 }, // 1.5 line spacing equivalent
          children: [
            new TextRun({
              text: pText.trim(),
              font: FONT_NAME,
              size: 32,
            }),
          ],
        })
      );
    });

    // Signature Block with administrative spacer offset to bottom right
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 600, after: 100 },
        children: [
          new TextRun({
            text: closingText + '\t\t\t\t',
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 1000, after: 100 },
        children: [
          new TextRun({
            text: `${signatureName}\t\t\t`,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `${signatureTitle}\t\t\t`,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

  } else {
    // INTERNAL MEMORANDUM (บันทึกข้อความ)
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 300 },
        children: [
          new TextRun({
            text: 'บันทึกข้อความ',
            font: FONT_NAME,
            size: 44, // 22pt
            bold: true,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: 'ส่วนราชการ   ',
            font: FONT_NAME,
            size: 32,
            bold: true,
          }),
          new TextRun({
            text: senderOrg,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: `ที่   `,
            font: FONT_NAME,
            size: 32,
            bold: true,
          }),
          new TextRun({
            text: docNum,
            font: FONT_NAME,
            size: 32,
          }),
          new TextRun({
            text: '\t\t\t\tวันที่   ',
            font: FONT_NAME,
            size: 32,
            bold: true,
          }),
          new TextRun({
            text: docDate,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: 'เรื่อง   ',
            font: FONT_NAME,
            size: 32,
            bold: true,
          }),
          new TextRun({
            text: subjectStr,
            font: FONT_NAME,
            size: 32,
            bold: true,
          }),
        ],
      })
    );

    // Body text for internal memo
    const bodyPars = bodyText.split('\n');
    bodyPars.forEach((pText) => {
      if (pText.trim() === '') return;
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 720 },
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: pText.trim(),
              font: FONT_NAME,
              size: 32,
            }),
          ],
        })
      );
    });

    // Signature Block for Internal memo
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 1200, after: 100 },
        children: [
          new TextRun({
            text: `(ลงชื่อ)...................................................\t\t`,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `${signatureName}\t\t\t`,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `${signatureTitle}\t\t\t`,
            font: FONT_NAME,
            size: 32,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1417,     // 2.5 cm
              bottom: 1417,  // 2.5 cm
              left: 1701,    // 3.0 cm
              right: 1134,   // 2.0 cm
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
