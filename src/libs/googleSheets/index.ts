import { google, sheets_v4 } from 'googleapis';
import {
  SheetInfo,
  SheetUpdate,
  DelDimensionPayload,
} from './types';

export default class GoogleSheet {
  public sheet: sheets_v4.Resource$Spreadsheets

  constructor(credentials: {
    installed: {
      client_id: string;
      project_id: string;
      auth_uri: string;
      token_uri: string;
      auth_provider_x509_cert_url: string;
      client_secret: string;
      redirect_uris: string[];
    };
  }, token: {
    access_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
  }) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    oAuth2Client.setCredentials(token);

    this.sheet = google.sheets({ version: 'v4', auth: oAuth2Client }).spreadsheets;
  }

  async getSheetByName({ spreadsheetId, sheetName }: SheetInfo) {
    return this.sheet.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A1:Z`,
    });
  }

  async getSheetDetailByName({ spreadsheetId, sheetName }: SheetInfo) {
    const { data } = await this.listSheets(spreadsheetId);
    return data.sheets!.find(o => o.properties!.title === sheetName);
  }

  async listSheets(spreadsheetId: string) {
    return this.sheet.get({
      spreadsheetId,
      ranges: [],
      includeGridData: false,
    });
  }

  async createSheet({ spreadsheetId, sheetName }: SheetInfo) {
    return this.sheet.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        }],
      },
    });
  }

  async updateSheet({ spreadsheetId, sheetName, data }: SheetUpdate) {
    return this.sheet.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [...data],
      },
    });
  }

  async clearSheet({ spreadsheetId, sheetName }: SheetInfo) {
    return this.sheet.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z`,
    });
  }

  async deleteSheet({ spreadsheetId, sheetId }: { spreadsheetId: string; sheetId: number}) {
    return this.sheet.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteSheet: {
            sheetId,
          },
        }],
      },
    });
  }

  async delSheetDimension(payload: DelDimensionPayload): Promise<void> {
    if (!payload.rowTo && !payload.colTo) {
      throw new Error('Please set "rowTo" or "colTo"');
    }

    const requests = [];
    if (payload.rowTo) {
      requests.push({
        deleteDimension: {
          range: {
            sheetId: payload.sheetId,
            dimension: 'ROWS',
            startIndex: payload.rowFrom || 1,
            endIndex: payload.rowTo,
          },
        },
      });
    }

    if (payload.colTo) {
      requests.push({
        deleteDimension: {
          range: {
            sheetId: payload.sheetId,
            dimension: 'COLUMNS',
            startIndex: payload.colFrom || 1,
            endIndex: payload.colTo,
          },
        },
      });
    }

    await this.sheet.batchUpdate({
      spreadsheetId: payload.spreadsheetId,
      requestBody: { requests },
    });
  }
}
