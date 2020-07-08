export interface SheetInfo {
 spreadsheetId: string;
 sheetName: string;
}

export interface SheetUpdate extends SheetInfo {
  data: any;
}

export interface DelDimensionPayload {
  rowFrom?: number; // default is 1
  rowTo?: number;
  colFrom?: number; // default is 1
  colTo?: number;
  spreadsheetId: string;
  sheetId: number;
}
