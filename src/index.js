const functions = {
  "+": args => args.reduce((acc, n) => acc + n, 0),
};

const run = srcStr => {
  const src = srcStr.replace(/\s+/g, " ");
  return src
    .split(" ")
    .map(t => (isNaN(Number(t)) ? t : Number(t)))
    .reduce(
      (ctx, t) => {
        console.log(t);
        if (t[0] === "(") {
          ctx.op = functions[t.slice(1)];
          if (ctx.op == null) {
            throw new Error(`invalid function ${t.slice(1)}`);
          }
        } else if (t[t.length - 1] === ")") {
          ctx.args.push(Number(t.slice(0, t.length - 1)));
          ctx.args = [ctx.op(ctx.args)];
        } else {
          ctx.args.push(t);
        }
        return ctx;
      },
      { op: null, args: [] }
    ).args[0];
};

module.exports = {
  run,
};
