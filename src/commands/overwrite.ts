import { Command, flags } from '@oclif/command';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as Listr from 'listr';
import GoogleSheet from '../libs/googleSheets';

export default class Overwrite extends Command {
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
    // flag with no value (-f, --force)
    path: flags.string({
      char: 'p',
      description: 'csv path',
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
    const { flags } = this.parse(Overwrite);
    const { sheetName: name, sheetId: id, path, credential, token } = flags;
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
        title: 'write file to csv',
        task: async () => {
          const csvFormat = Papa.unparse(values, { newline: '\n' });
          fs.writeFileSync(path, csvFormat);
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
