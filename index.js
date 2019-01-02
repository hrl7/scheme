const REPL = require("./src/repl");

process.stdin.setEncoding("utf8");

const PROMPT = ">>>";
console.log("welcome to simple scheme interpreter\n");
process.stdout.write(PROMPT);
const repl = new REPL();
process.stdin.on("readable", () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(`=> ${repl.run(chunk)}\n${PROMPT}`);
  }
});

process.stdin.on("end", () => {
  process.stdout.write("\ngood bye\n");
});
