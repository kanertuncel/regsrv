import @doping/whois from '../dist/index.js';
import { writeFile } from 'fs/promises';

async function testDomains() {
  // Filtered list: only domains that did not result in errors in test-results.json
  const domains = [
    'nic.com',
    'nic.de', 'nic.fr', 'nic.no',
    'nic.ch', 'nic.pl',
    // 'nic.at', 'nic.pt', 'nic.ro', 'nic.ru', 'nic.sa', 'nic.ae', 'nic.ar', 'nic.au',
    'nic.br',
    // 'nic.ca', 'nic.cl', 'nic.cn',
    // 'nic.cr', 'nic.cy',
    // 'nic.ee',
    // 'nic.gr', 'nic.hk', 'nic.hu', 'nic.id',
    // 'nic.ie', 'nic.il', 'nic.jp', 'nic.eu', 'nic.li', 'nic.kr',
    'iana.org', 'example.net',
    // 'test.xyz', 'nic.io', 'nic.app', 'nic.dev', 'nic.page',
    'nic.blog', 'nic.shop', 'nic.online', 'nic.site', 'nic.store', 'nic.tech',
    // 'nic.web',
    'nic.info', 'nic.biz',
    // 'nic.us', 'nic.mobi', 'nic.pro', 'nic.tel', 'nic.asia', 'nic.cat', 'nic.jobs', 'nic.travel',
    'nic.museum',
    // 'nic.int', 'nic.edu', 'nic.gov', 'nic.mil',
    'nic.name', 'nic.aero', 'nic.coop', 'nic.post'
  ];

  const results = {};

  for (const domain of domains) {
    try {
      console.log(`\n--- Looking up ${domain} ---`);
      const data = await @doping/whois(domain);
      results[domain] = data;
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      results[domain] = { error: error.message };
      console.error(`Error for ${domain}:`, error.message);
    }
  }

  // Save all results to a JSON file
  await writeFile('scripts/test-results.json', JSON.stringify(results, null, 2));
  console.log('\nAll results saved to scripts/test-results.json');
}

testDomains();