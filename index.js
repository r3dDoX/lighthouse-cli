const fs = require('fs');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

const throttling = {
  rttMs: 100,
  throughputKbps: 5000,
  requestLatencyMs: 0,
  downloadThroughputKbps: 5000,
  uploadThroughputKbps: 5000,
  cpuSlowdownMultiplier: 4,
};

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const runnerResult = await lighthouse(
    process.argv[2] + '?hide=gtm,rating,cookie',
    {
      emulatedFormFactor: 'desktop',
      logLevel: 'info',
      output: 'html',
      throttling,
      onlyCategories: ['performance'],
      port: (new URL(browser.wsEndpoint())).port,
    });

  // `.report` is the HTML report as a string
  const reportHtml = runnerResult.report;
  fs.writeFileSync(`${process.argv[3]}-${new Date().toISOString()}.html`, reportHtml);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log('Report is done for', runnerResult.lhr.finalUrl);
  console.log('First Contentful Paint', runnerResult.lhr.audits['first-contentful-paint'].numericValue);
  console.log('Time To Interactive', runnerResult.lhr.audits['interactive'].numericValue);

  await browser.close();
})();