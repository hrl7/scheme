import Interpreter from "./interpreter";
import { display } from "./nodes";

class REPL {
  constructor() {
    this.interpreter = new Interpreter();
    this.result = null;
  }

  run(src) {
    if (src === "") {
      return "";
    }
    this.interpreter.run(src);
    this.result = this.interpreter.result;
    return this.print();
  }

  print() {
    return display(this.result);
  }
}

export default REPL;
