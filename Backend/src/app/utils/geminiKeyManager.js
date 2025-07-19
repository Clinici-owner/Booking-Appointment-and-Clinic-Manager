const keys = [
  { key: process.env.GEMINI_KEY_1, count: 0, lastReset: Date.now() },
  { key: process.env.GEMINI_KEY_2, count: 0, lastReset: Date.now() },
  { key: process.env.GEMINI_KEY_3, count: 0, lastReset: Date.now() },
  { key: process.env.GEMINI_KEY_4, count: 0, lastReset: Date.now() },
];

const MAX_PER_DAY = 20;

function getValidKey() {
  const now = Date.now();

  for (const entry of keys) {
    if (now - entry.lastReset > 24 * 60 * 60 * 1000) {
      entry.count = 0;
      entry.lastReset = now;
    }

    if (entry.count < MAX_PER_DAY) {
      entry.count++;
      return entry.key;
    }
  }

  return null;
}

module.exports = { getValidKey };
