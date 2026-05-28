import fs from 'fs';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/data');
    const text = await res.text();
    fs.writeFileSync('test_output.txt', `STATUS: ${res.status}\nHEADERS: ${JSON.stringify(Object.fromEntries(res.headers.entries()))}\nCONTENT:\n${text}`);
  } catch (err) {
    fs.writeFileSync('test_output.txt', `ERROR: ${err.message}\nSTACK: ${err.stack}`);
  }
}

test();
