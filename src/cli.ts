#!/usr/bin/env node
import whois from './index.js';

const [, , ...args] = process.argv;
const input = args[0];

if (!input) {
  console.error('Usage: whois <domain|url>');
  process.exit(1);
}

(async () => {
  try {
    const data = await whois(input);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error:', err.message);
    } else {
      console.error('Error:', err);
    }
    process.exit(2);
  }
})(); 