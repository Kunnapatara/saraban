/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DocumentType = 'EXTERNAL' | 'INTERNAL' | 'EXTERNAL_INVITATION' | 'INTERNAL_MEMO' | 'REQUEST_LETTER';

export type CompilationStatus = 'VALID' | 'INCOMPLETE' | 'CRITICAL_ERROR';
export type ASAESeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type ReadinessStatus = 'Ready for Submission' | 'Needs Review' | 'Incomplete';

export interface ASAEDiagnostic {
  code: string;
  severity: ASAESeverity;
  title: string;
  explanation: string;
  location: string;
  documentNodeId: string;
  remediationType: string;
  autoFixAvailable: boolean;
  fixAction: string;
}

export interface DependencyStatus {
  node: string;
  resolved: boolean;
  missing: string[];
}

export interface RecipientProtocol {
  id: string;
  name: string;
  title: string;
  salutation: string;
  closing: string;
  recipientLabel: string;
}

export interface DocumentAST {
  document_type: DocumentType;
  recipient_protocol: string;
  salutation: string;
  compiled_body_fragment: string;
  closing_protocol: string;
  detected_placeholders: string[];
  
  // Layer A Structured details
  sender_organization?: string;
  document_number?: string;
  date?: string;
  subject?: string;
  reference?: string;
  enclosures?: string;

  // Layer D Fingerprints
  template_id?: string;
  template_version?: string;
  template_hash?: string;
}

export interface PhraseLintRule {
  forbidden: string;
  replacement: string;
  explanation: string;
}

export interface ComplianceScores {
  structural: number;
  formatting: number;
  protocol: number;
  placeholder: number;
  localization: number;
  template: number;
  pagination: number;
  signature: number;
  overall: number;
}

export interface CompiledOutput {
  ast: DocumentAST;
  rawText: string;
  wordFormattedText: string;
  wasLinted: boolean;
  lintLogs: string[];
}

