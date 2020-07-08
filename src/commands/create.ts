import {Command, flags} from '@oclif/command';
import * as Listr from 'listr';
import GoogleSheet from '../libs/googleSheets';
import { sheets_v4 } from 'googleapis';

export default class Create extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    sheetId: flags.string({
      char: 's',
      description: 'sheet ID',
      required: true,
    }),
    // target sheet name
    sheetName: flags.string({
      char: 'n',
      description: 'target sheet name',
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
    let targetSheet: sheets_v4.Schema$Sheet | undefined;
    const { flags } = this.parse(Create);
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
        title: `check if sheet:${name} exists`,
        task: async () => {
          const { data } = await googleSheet.listSheets(id);
          targetSheet = data.sheets!.find(s => s.properties!.title === name);
        },
      },
      {
        title: `create sheet:${name}`,
        skip: () => {
          if (targetSheet) {
            return 'sheet exists';
          }
        },
        task: async () => {
          await googleSheet.createSheet({ spreadsheetId: id, sheetName: name });
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
