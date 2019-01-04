import React from "react";
import ReactDOM from "react-dom";
import Radium from "radium";
import REPL from "../repl";

class App extends React.Component {
  constructor() {
    super();
    this.repl = new REPL();
    this.input = null;
    this.state = {
      logs: [],
      results: [],
      buffer: ""
    };
    this.handleKeyPress = (e) => {
      if (e.key === "Enter") {
        if (this.input && this.input.value !== "") {
          this.input.value = "";
          this.setState({
            logs: this.state.logs.concat(this.state.buffer ),
          }, () => {
            this.repl.run(this.state.buffer);
            this.setState({
              logs: this.state.logs.concat("==> " + this.repl.print()),
              buffer: ""
            });
          });
        }
      }
    };
    this.handleChange = (e) => {
      this.setState({ buffer: e.currentTarget.value });
    };
  }

  render() {
    return <div
      style={styles.container}
      onClick={() => console.log(this.input) || this.input && this.input.focus}>
      <div>
        {this.state.logs.map(log => [<tt>{log}</tt>,<br/>])}
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
    fontFamily: "Consolas, 'Courier New', Courier, Monaco, monospace"
  },
  hiddenInput: {
    position: "absolute",
    right: 0,
    bottom: 0
  }
};

window.addEventListener("DOMContentLoaded", () => {
  console.log(document.getElementById("root"));
  ReactDOM.render(React.createElement(Radium(App), null), document.getElementById("root"));
});
