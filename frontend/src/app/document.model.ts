export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';
export type DecisionStatus = Exclude<DocumentStatus, 'Pending'>;

export interface DocumentItem {
  id: string;
  documentNumber: string;
  title: string;
  category: string;
  submittedBy: string;
  submittedAt: string;
  status: DocumentStatus;
  decisionReason: string | null;
  decisionAt: string | null;
}
