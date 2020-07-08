import * as Listr from 'listr';
import {Command, flags} from '@oclif/command';
import { sheets_v4 } from 'googleapis';
import GoogleSheet from '../libs/googleSheets';

export default class Backup extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    sheetId: flags.string({
      char: 's',
      description: 'sheet ID',
      required: true,
    }),

    sheetName: flags.string({
      char: 'n',
      description: 'sheet name',
      required: true,
    }),
    // credential
    credential: flags.string({
      char: 'c',
      description: 'installed credential from google',
      required: true,
    }),
    // token
    token: flags.string({
      char: 't',
      description: 'token from google',
      required: true,
    }),
  }

  async run() {
    let values: any[][];
    let googleSheet: GoogleSheet;
    let targetSheet: sheets_v4.Schema$Sheet | undefined;
    const toSheetName = 'BACKUP';
    const { flags } = this.parse(Backup);
    const { sheetName: name, sheetId: id, credential, token } = flags;
    const Credential = JSON.parse(credential);
    const Token = JSON.parse(token);
    const tasks = new Listr([
      {
        title: 'valid authorization from oauth',
        task: async () => {
          googleSheet = new GoogleSheet(Credential, Token);
        },
      },
      {
        title: 'check if sheet:BACKUP exists',
        task: async () => {
          const { data: sheetsRes } = await googleSheet.listSheets(id);
          targetSheet = sheetsRes.sheets!.find(o => o.properties!.title === toSheetName);
        },
      },
      {
        title: 'clear sheet:BACKUP',
        skip: () => {
          if (!targetSheet) {
            return 'sheet not exists';
          }
        },
        task: async () => {
          await googleSheet.clearSheet({ spreadsheetId: id, sheetName: toSheetName });
        },
      },
      {
        title: 'create sheet:BACKUP',
        skip: () => {
          if (targetSheet) {
            return 'sheet exists';
          }
        },
        task: async () => {
          await googleSheet.createSheet({ spreadsheetId: id, sheetName: toSheetName });
        },
      },
      {
        title: `download sheet: ${name}`,
        task: async () => {
          const { data } = await googleSheet.getSheetByName({ spreadsheetId: id, sheetName: name });
          values = data.values!;
          if (values.length > 0) {
            return;
          }

          throw new Error(`💣 fail to get sheet: ${name}`);
        },
      },
      {
        title: `set data to sheet:${toSheetName}`,
        task: async () => {
          await googleSheet.updateSheet({
            spreadsheetId: id,
            sheetName: toSheetName,
            data: values,
          });
        },
      },
    ]);

    try {
      await tasks.run();
    } catch (error) {
      this.error(error);
    }
  }
}
