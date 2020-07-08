import {Command, flags} from '@oclif/command';
import * as fs from 'fs';
import * as Listr from 'listr';
import GoogleSheet from '../libs/googleSheets';

export default class Update extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    sheetId: flags.string({
      char: 's',
      description: 'sheet ID',
      required: true,
    }),
    file: flags.string({
      char: 'f',
      description: 'diff.json path',
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
    let googleSheet: GoogleSheet;
    let data: any;
    const { flags } = this.parse(Update);
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
          data = JSON.parse(rawData);
        },
      },
      {
        title: `clear sheet: ${name}`,
        task: async () => {
          await googleSheet.clearSheet({ sheetName: name, spreadsheetId: id });
        },
      },
      {
        title: `update sheet: ${name}`,
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
