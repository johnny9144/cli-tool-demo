import {Command, flags} from '@oclif/command';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import * as Listr from 'listr';
enum SupportLanguage {
  EN_US = 'en-US',
  ZH_TW = 'zh-TW',
  ZH_CN = 'zh-CN',
  JA_JP = 'ja-JP',
}

export default class MakeDiff extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'source1',
      required: true,
      description: 'base csv file path',
    },
    {
      name: 'source2',
      required: true,
      description: 'new csv file path',
    },
  ];

  async run() {
    let data1: any[];
    let data2: any[];
    let diffByTranslations: any[];
    let diffByKeys: any[];
    let pathPostion: string | number;
    let contextPostion: string | number;
    const { args } = this.parse(MakeDiff);
    const { source1 } = args;
    const { source2 } = args;
    const tasks = new Listr([
      {
        title: `check if ${source1}, ${source2} exists`,
        task: () => {
          const exists1 = fs.existsSync(source1);
          const exists2 = fs.existsSync(source2);

          if (!exists1) {
            throw new Error(`${source1} not found`);
          } else if (!exists2) {
            throw new Error(`${source2} not found`);
          }
        },
      },
      {
        title: `read data from ${source1} && parse csv`,
        task: () => {
          const csvFile = fs.readFileSync(source1, 'utf8');
          data1 = Papa.parse(csvFile).data;
        },
      },
      {
        title: `read data from ${source2} && parse csv`,
        task: () => {
          const csvFile = fs.readFileSync(source2, 'utf8');
          data2 = Papa.parse(csvFile).data;
        },
      },
      {
        title: 'diff by translations',
        task: () => {
          pathPostion = data1[0].indexOf('path');
          contextPostion = data1[0].indexOf('context');
          const commentPosition = data1[0].indexOf('comment');
          const langColPositions = Object.values(SupportLanguage).map((o: any) => data1[0].indexOf(o));
          const baseCsvKeys = data1.map(r => `${r[pathPostion]}-${r[contextPostion]}`);

          diffByTranslations = data2.filter(r => {
            const key = `${r[pathPostion]}-${r[contextPostion]}`;
            const idx = baseCsvKeys.findIndex((v: string) => v === key);

            if (idx === -1) {
              return false;
            }

            const hasDiffTrans = langColPositions.some((o: string | number) => data1[idx][o] !== r[o]);

            return data1[idx][commentPosition] !== r[commentPosition] || hasDiffTrans;
          });
        },
      },
      {
        title: 'diff by keys',
        task: () => {
          const newCsvKeys = data2.map(r => `${r[pathPostion]}-${r[contextPostion]}`);
          diffByKeys = newCsvKeys
          .filter(o => !data1.includes(o))
          .map(k => {
            const idx = newCsvKeys.findIndex(v => v === k);
            return data2[idx];
          });
        },
      },
      {
        title: 'generate diff.json',
        task: async () => {
          fs.writeFileSync('./diff.json', JSON.stringify([data1[0], ...diffByTranslations, ...diffByKeys]));
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
