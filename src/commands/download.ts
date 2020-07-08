import {Command, flags} from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';
import * as Listr from 'listr';
import * as Papa from 'papaparse';
import GoogleSheet from '../libs/googleSheets';
import mergeDiffCsv from '../libs/merge_diff';

export default class Download extends Command {
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
    let formatedSheet: string[][];
    let baseCsv: any[] | Papa.UnparseObject;
    const { flags } = this.parse(Download);
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
        title: 'mapping && wrapping the Context',
        task: async () => {
          formatedSheet = values.map((i18n: string[], rowIndex) => {
            const isHeader = rowIndex === 0;
            if (isHeader) {
              return i18n;
            }
            return i18n.map((val: string, colIndex: number) => {
              const isContext = colIndex === 1;
              const needWrapper = val.includes(',');
              return !isContext && needWrapper ? `"${val.replace(/"/g, '""')}"` : val;
            });
          });
        },
      },
      {
        title: `diff csv between output.csv and sheet: ${name}`,
        task: async () => {
          const baseCsvString = fs.readFileSync(path.resolve(__dirname, '../../output.csv'), 'utf8');
          const diffCsvString = formatedSheet.map((o: string[]) => o.join(',')).join('\n');

          baseCsv = mergeDiffCsv(baseCsvString, diffCsvString);
        },
      },
      {
        title: 'replace output.csv',
        task: () => {
          fs.writeFileSync('output.csv', Papa.unparse(baseCsv, { newline: '\n' }));
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
