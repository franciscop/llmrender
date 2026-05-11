import server from "@server/next";
import Markdown from "../..";
import fsp from "fs/promises";

const style = `
  #root {
    max-width: 680px;
    margin-left: auto;
    margin-right: auto;
    background: #fff;
    padding: 3rem 4rem;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 6px 28px rgba(0,0,0,0.07);
  }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.65;
    color: #1a1a1a;
    background: #f0ede8;
    margin: 0;
    padding: 2.5rem 1rem;
    max-width: 780px;
    margin-left: auto;
    margin-right: auto;
  }
  h1, h2, h3, h4, h5, h6 {
    scroll-margin-top: 1rem;
  }
  h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {
    color: inherit;
    text-decoration: none;
  }
  pre {
    background: #f5f3ef !important;
    border: 1px solid #e8e4de;
  }
`;

export default server().get("/", async () => {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          {await fsp.readFile("../../themes/llmrender.css", "utf-8")}
        </style>
        <style>{style}</style>
      </head>
      <body>
        <Markdown id="root">
          {await fsp.readFile("./test.md", "utf-8")}
        </Markdown>
      </body>
    </html>
  );
});
