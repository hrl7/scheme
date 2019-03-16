import { TRUE, FALSE, buildPair } from "../nodes";
import { NODE_TYPES } from "../constants";

export const BASE_PROCEDURES = [
  [["*", "*"], "cons", operands => buildPair(operands[0], operands[1])],
  [["PAIR"], "car", operands => operands[0].car],
  [["PAIR"], "cdr", operands => operands[0].cdr],
  [["*"], "null?", operands => operands[0].type === "NULL" ? TRUE : FALSE],
  [["*"], "pair?", operands => operands[0].type === "PAIR" ? TRUE : FALSE],
  [["BOOLEAN","BOOLEAN"], "and", operands => (operands[0].value && operands[1].value) ? TRUE : FALSE],
  [["BOOLEAN","BOOLEAN"], "or", operands => (operands[0].value || operands[1].value) ? TRUE : FALSE],
  [["BOOLEAN"], "not", operands => (operands[0].value) ?  FALSE : TRUE],
  [["*", "*"], "eq?", operands => {
    switch(operands[0].type){
      case NODE_TYPES.ATOM:
        return operands[0].name === operands[1].name ? TRUE : FALSE;
      case NODE_TYPES.NUMBER:
        return operands[0].value === operands[1].value ? TRUE : FALSE;
      default:
        const msg = `unrecognized type for eq? : ${operands[0].type}, ${operands[1].type}`;
        throw new Error(msg)
    }
  }]
];

