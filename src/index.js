const functions = {
  "+": args => args.reduce((acc, n) => acc + n, 0),
  "*": args => args.reduce((acc, n) => acc * n, 1),
};

const run = srcStr => {
  const src = srcStr.replace(/\s+/g, " ").replace(/\)/g, ") ");
  if (src === "") {
    return "";
  }
  return src
    .split(" ")
    .map(t => (isNaN(Number(t)) ? t : Number(t)))
    .reduce(
      (ctx, t) => {
        if (t[0] === "(") {
          ctx.depth++;
          if (ctx.op != null) {
            ctx.env.push({ op: ctx.op, args: ctx.args });
            ctx.op = null;
            ctx.args = [];
          }

          ctx.op = functions[t.slice(1)];

          if (ctx.op == null) {
            throw new Error(`invalid function ${t.slice(1)}`);
          }
        } else if (t[t.length - 1] === ")") {
          ctx.depth--;
          ctx.args.push(Number(t.slice(0, t.length - 1)));
          ctx.args = [ctx.op(ctx.args)];
          ctx.op = null;

          if (ctx.env.length !== 0) {
            const env = ctx.env.pop();
            const result = ctx.args;
            ctx.args = env.args.concat(result);
            ctx.op = env.op;
          }

          if (ctx.depth === 0 && ctx.op != null) {
            ctx.args = ctx.op(ctx.args);
          }
        } else {
          ctx.args.push(t);
        }
        return ctx;
      },
      { op: null, args: [], env: [], depth: 0 }
    ).args[0];
};

module.exports = {
  run,
};
