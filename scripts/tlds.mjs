import { writeFile } from 'fs/promises';
import { join } from 'path';

const IANA_RDAP_DNS_URL = 'https://data.iana.org/rdap/dns.json';
const IANA_TLD_LIST_URL = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt';
const OUTPUT_PATH = join(process.cwd(), 'src', 'data', 'dns.json');

async function updateTldList() {
    try {
        console.log(`Fetching latest TLD list from ${IANA_RDAP_DNS_URL}...`);
        const response = await fetch(IANA_RDAP_DNS_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Basic validation
        if (!data || !data.services || !Array.isArray(data.services)) {
            throw new Error('Invalid data format from IANA.');
        }

        await writeFile(OUTPUT_PATH, JSON.stringify(data, null, 2));
        console.log(`Successfully updated TLD list at ${OUTPUT_PATH}`);
    } catch (error) {
        console.error('Error updating TLD list:', error);
        process.exit(1);
    }
}

async function buildComprehensiveTldRdapMap() {
  // Fetch RDAP bootstrap
  const rdapData = await fetch(IANA_RDAP_DNS_URL).then(r => r.json());
  // Fetch TLD list
  const tldList = await fetch(IANA_TLD_LIST_URL).then(r => r.text());

  // Build RDAP map from bootstrap
  const rdapMap = new Map();
  for (const [tlds, urls] of rdapData.services) {
    for (const tld of tlds) {
      rdapMap.set(tld.toLowerCase(), urls[0]);
    }
  }

  // Build comprehensive map
  const allTlds = tldList
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(tld => tld.toLowerCase());

  const tldToRdap = {};
  for (const tld of allTlds) {
    tldToRdap[tld] = rdapMap.get(tld) || null;
  }
}

buildComprehensiveTldRdapMap();
updateTldList();