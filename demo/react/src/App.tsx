import Markdown from "llmrender";
import "./llmrender.css";
import "./App.css";
import content from "./test.md?raw";

function App() {
  return <Markdown>{content}</Markdown>;
}

export default App;
