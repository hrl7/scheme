import React from "react";
import ReactDOM from "react-dom";
import Radium from "radium";
import REPL from "../repl";
import Lexer from "../lexer";
import Tokens from "./tokens"

class App extends React.Component {
  constructor() {
    super();
    this.repl = new REPL();
    this.lexer = new Lexer();
    this.input = null;
    this.state = {
      logs: [],
      results: [],
      buffer: ""
    };

    this.handleKeyPress = (e) => {
      if (e.key === "Enter" && this.input && this.input.value !== "") {
        this.input.value = "";
        const src = this.state.buffer;
        this.lexer.reset();
        this.lexer.tokenize(src);
        const tokens = this.lexer.tokens;
        this.setState({
          logs: this.state.logs.concat(tokens),
        }, () => this.runProgram(src));
      }
    };

    this.runProgram = (src) => {
      this.repl.run(src);
      this.setState({
        logs: this.state.logs.concat("==> " + this.repl.print()),
        buffer: ""
      });
    };

    this.handleChange = (e) => {
      this.setState({ buffer: e.currentTarget.value });
    };

    this.focusToInput = () => {
      this.input && this.input.focus();
    };
  }

  render() {
    return <div
      style={styles.container}
      onClick={this.focusToInput}>
      <div>
        <Tokens tokens={this.state.logs} />
      </div>
      >>><span>{this.state.buffer}</span>
      <input
        style={styles.hiddenInput}
        ref={ref => this.input = ref}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}/>
    </div>;
  }
}

const styles = {
  container: {
    background: "black",
    width: "50%",
    height: "100%",
    color: "#33ff33",
    fontFamily: "Consolas, 'Courier New', Courier, Monaco, monospace",
    padding: "1em"
  },
  hiddenInput: {
    position: "absolute",
    right: 0,
    bottom: 0
  }
};

window.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(React.createElement(Radium(App), null), document.getElementById("root"));
});
