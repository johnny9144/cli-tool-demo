import {Command, flags} from '@oclif/command';
import { sheets_v4 } from 'googleapis';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as Listr from 'listr';
import GoogleSheet from '../libs/googleSheets';

export default class UpdateMain extends Command {
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
      description: 'sheet name of target branch',
      required: true,
    }),
    file: flags.string({
      char: 'f',
      description: 'output.csv path',
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
    let data: any;
    let googleSheet: GoogleSheet;
    let targetSheet: sheets_v4.Schema$Sheet | undefined;
    const { flags } = this.parse(UpdateMain);
    const { sheetName: name, sheetId: id, credential, token, file } = flags;
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
        title: `read data from ${file} && parse to JSON`,
        task: () => {
          const rawData = fs.readFileSync(file, 'utf8');
          data = Papa.parse(rawData).data;
        },
      },
      {
        title: `get sheet: ${name} detail`,
        task: async () => {
          targetSheet = await googleSheet.getSheetDetailByName({ spreadsheetId: id, sheetName: name });
        },
      },
      {
        title: `delete sheet: ${name} dimension`,
        task: async () => {
          await googleSheet.delSheetDimension({
            spreadsheetId: id,
            sheetId: targetSheet!.properties!.sheetId!,
            rowFrom: 2, // the first row is frozen, it can't be deleted
            rowTo: targetSheet!.properties!.gridProperties!.rowCount!,
          });
        },
      },
      {
        title: `update data to sheet: ${name}`,
        task: async () => {
          await googleSheet.updateSheet({ spreadsheetId: id, sheetName: name, data });
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
