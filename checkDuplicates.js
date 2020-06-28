const wordlist = require('./src/server/a-word-please/wordlist');

//const combined = wordlist.concat(newWords);
const combined = wordlist;
const wordCount = {};
combined.forEach(word => {
  if (!wordCount[word] && wordCount[word] !== 0) {
    wordCount[word] = 0;
  }
  ++wordCount[word];
});

Object.keys(wordCount).forEach(word => {
  if (wordCount[word] > 1) {
    console.log(word);
  }
});
