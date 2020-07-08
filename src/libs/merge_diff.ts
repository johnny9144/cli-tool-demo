import * as Papa from 'papaparse';

function mergeDiffCsv(baseCsvString: string, diffCsvString: string) {
  const baseCsv = Papa.parse(baseCsvString, { header: true }).data;
  const diffCsv = Papa.parse(diffCsvString, { header: true }).data;
  const baseCsvKeys = baseCsv.map(val => `${val.path}-${val.namespace}-${val.context}`);
  const diffCsvKeys = diffCsv.map(val => `${val.path}-${val.namespace}-${val.context}`);

  diffCsvKeys.forEach((k, i) => {
    const idx = baseCsvKeys.findIndex(o => o === k);
    if (idx !== -1) {
      baseCsv[idx] = diffCsv[i];
    }
  });

  return baseCsv;
}

export default mergeDiffCsv;
