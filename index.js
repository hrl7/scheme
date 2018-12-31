const { run } = require("./src/index");

process.stdin.setEncoding("utf8");

console.log("welcome to simple scheme interpreter\n");
process.stdin.on("readable", () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(`=> ${run(chunk)}\n>>>`);
  }
});

process.stdin.on("end", () => {
  process.stdout.write("end");
});
