import React from "react";
import Radium from "radium";
import { TOKEN_TYPES } from "../constants";

const Tokens = ({tokens}) => {
  const results = [];
  let lastToken = null,i ;
  for (i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (typeof(token) === "string") {
      results.push([<br/>,<span>{token}</span>, <br/>]);
      continue;
    }
    if (lastToken != null) {
      const width =token.loc.start.col - lastToken.loc.end.col;
      if(width > 1) {
        results.push(<span style={{width: 14 * width + "px"}}> </span>)
      }
    }
    results.push(<Token token={tokens[i]} />);
    lastToken = tokens[i];
  }
  return results;

};

const Token = Radium(({token}) => {
  switch(token.type) {
    case TOKEN_TYPES.LPAREN:
      return <span style={styles.paren}>(</span>;
    case TOKEN_TYPES.RPAREN:
      return <span style={styles.paren}>)</span>;
    case TOKEN_TYPES.KEYWORD:
      return <span style={styles.keyword}>{token.keyword}</span>;
    case TOKEN_TYPES.IDENTIFIER:
      return <span style={styles.identifier}>{token.identifier}</span>;
    case TOKEN_TYPES.NUMBER:
      return <span style={styles.number}>{token.value}</span>;
    case TOKEN_TYPES.QUOTE:
      return <span style={styles.quote}>'</span>;
    default:
      return <span>{JSON.stringify(token)}</span>;
  }
});

const styles = {
  paren: {
    color: "red"
  },
  keyword: {
    color: "skyblue"
  },
  identifier: {
    color: "white"
  },
  quote: {
    color: "gray"
  },

};


export default Tokens;
