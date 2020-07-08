import { Command, flags } from '@oclif/command';
import * as Listr from 'listr';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

export default class ToJson extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'file',
    required: true,
    description: 'csv file to lint',
  }];

  async run() {
    type locale = {
      key: string;
      'zh-CN': string;
      'zh-TW': string;
      'en-US': string;
      'ja-JP': string;
    };
    type rawLocales = locale & { path: string; namespace: string };
    let data: any[];
    const structure: {
      [key: string]: locale[];
    } = {};
    const { args: { file } } = this.parse(ToJson);
    const tasks = new Listr([
      {
        title: `check if ${file} exists`,
        task: () => {
          const exists = fs.existsSync(file);
          if (!exists) {
            throw new Error(`${file} not found`);
          }
        },
      },
      {
        title: `read data from ${file} && parse csv`,
        task: () => {
          const csvFile = fs.readFileSync(file, 'utf8');
          data = Papa.parse(csvFile, { header: true }).data;
        },
      },
      {
        title: 'parse data to json',
        task: () => {
          data.forEach(val => {
            const ns: string = val.namespace;
            structure[ns] = structure[ns] || [];
            structure[ns].push({
              key: val.path,
              'zh-CN': val['zh-CN'],
              'zh-TW': val['zh-TW'],
              'en-US': val['en-US'],
              'ja-JP': val['ja-JP'],
            });
          });
        },
      },
      {
        title: 'generate json file by language and namespace',
        task: async () => {
          const lang: {
            [index: string]: {
              [index: string]: {
                [index: string]: string;
              };
            };
          } = {
            'zh-CN': {},
            'zh-TW': {},
            'en-US': {},
            'ja-JP': {},
          };

          Object.keys(structure).forEach(val => {
            const ns = structure[val];
            ns.forEach(pkg => {
              _.setWith(lang, `zh-CN.${val}["${pkg.key.replace(/"/g, '\\"')}"]`, pkg['zh-CN'], Object);
              _.setWith(lang, `zh-TW.${val}["${pkg.key.replace(/"/g, '\\"')}"]`, pkg['zh-TW'], Object);
              _.setWith(lang, `en-US.${val}["${pkg.key.replace(/"/g, '\\"')}"]`, pkg['en-US'], Object);
              _.setWith(lang, `ja-JP.${val}["${pkg.key.replace(/"/g, '\\"')}"]`, pkg['ja-JP'], Object);
            });
          });

          _.mapKeys(lang, (value, lng) => {
            _.mapKeys(value, (val, ns) => {
              fs.writeFileSync(path.join('locales', lng, `${ns}.json`), JSON.stringify(val, null, 2));
            });
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
