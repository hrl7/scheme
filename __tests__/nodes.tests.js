import { display } from "../src/nodes";
test("display test", () => {
  const list = {
    type: "PAIR",
    car: { type: "ATOM", name: "b" },
    cdr: {
      type: "PAIR",
      car: { type: "ATOM", name: "c" },
      cdr: { type: "NULL" },
    },
  };
  expect(display(list)).toBe("(b c)");
});
