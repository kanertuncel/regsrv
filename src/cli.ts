#!/usr/bin/env node
import whojs from './index.js';

const [, , ...args] = process.argv;
const input = args[0];

if (!input) {
  console.error('Usage: whojs <domain|url>');
  process.exit(1);
}

(async () => {
  try {
    const data = await whojs(input);
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