import {Command, flags} from '@oclif/command';
import * as Listr from 'listr';
import * as Papa from 'papaparse';
import * as fs from 'fs';

interface CsvInfo {
  line: number;
  key: string;
  context?: string;
  column?: string[];
}

function getIncludeWhiteSpaceColumn(row: string[], headerColumn: string[]): string[] {
  return row.reduce<string[]>((acc, curr, index) => {
    const hasWitespace = curr.trim() !== curr;
    if (hasWitespace) {
      acc.push(headerColumn[index]);
    }
    return acc;
  }, []);
}
export default class Lint extends Command {
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
    let data: any[];
    const { args: { file } } = this.parse(Lint);
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
          data = Papa.parse(csvFile).data;
        },
      },
      {
        title: 'check duplicate',
        task: () => {
          const duplicatePathList = data.reduce<CsvInfo[]>((list, row, index, array) => {
            const uniqId = `${row[0]}${row[1]}`;
            const duplicatePath = array.filter(compareRow => {
              const compareUniqId = `${compareRow[0]}${compareRow[1]}`;
              return compareUniqId === uniqId;
            });

            if (duplicatePath.length > 1) {
              list.push({
                line: index + 1,
                key: row[0],
                context: row[1],
              });
            }

            return list;
          }, []);

          if (duplicatePathList.length > 0) {
            throw new Error(`💣 Some duplicate rows: \n${duplicatePathList.map(({line, key}) => `line: ${line}, key: ${key}`).join(' \n')}`);
          }
        },
      },
      {
        title: 'check row count',
        task: () => {
          const csvheaderLength = data[0].length;
          const notMatchRow = data.reduce<CsvInfo[]>((acc, curr, index) => {
            if (curr.length !== csvheaderLength) {
              acc.push({ line: index + 1, key: curr[0] });
            }
            return acc;
          }, []);

          if (notMatchRow.length > 0) {
            throw new Error(`💣 Some unmatched rows: \n${notMatchRow.map(({line, key}) => `line: ${line}, key: ${key}`).join(' \n')}`);
          }
        },
      },
      {
        title: 'check column both end of whitespace',
        task: () => {
          const TOLERANCE_CONTEXTS = ['concatenator'];
          const headerColumn = data[0];
          const contextPostion = headerColumn.indexOf('context');
          const notMatchRow = data.reduce<CsvInfo[]>((acc, curr, index) => {
            const hasWhitespaceColumn = getIncludeWhiteSpaceColumn(curr, headerColumn);

            if (hasWhitespaceColumn.length > 0 && !TOLERANCE_CONTEXTS.some(c => c === curr[contextPostion])) {
              acc.push({ line: index + 1, column: hasWhitespaceColumn, key: curr[0] });
            }
            return acc;
          }, []);

          if (notMatchRow.length > 0) {
            throw new Error('💣 Some columns have whitespace on both ends');
          }
        },
      },
      {
        title: 'check en translation is capitalized',
        task: () => {
          type ErrorTable = {
            line: number;
            translation: string;
          };

          const isNotCapitalizedReg = /^[a-z]/;
          const notCapitalizedRow = data.slice(1).reduce<ErrorTable[]>((r, c, i) => {
            const enTranslation = c[6];
            if (isNotCapitalizedReg.test(enTranslation)) {
              r.push({
                line: i + 1,
                translation: enTranslation,
              });
            }

            return r;
          }, []);

          if (notCapitalizedRow.length > 0) {
            throw new Error(`💣 Some en translations are not capitalized: \n${notCapitalizedRow.map(({line, translation}) => `line: ${line}, translation: ${translation}`).join(' \n')}`);
          }
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
