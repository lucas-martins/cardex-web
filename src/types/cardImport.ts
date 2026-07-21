export interface CardImportPreviewItem {
  line: number;
  externalId: string;
  name: string;
  collectionName: string;
  cardNumber: string;
  quantity: number;
  valid: boolean;
  error?: string | null;
}

export interface CardImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  items: CardImportPreviewItem[];
}

export interface CardImportResult {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  skippedItems: CardImportPreviewItem[];
}