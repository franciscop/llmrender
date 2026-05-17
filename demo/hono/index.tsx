import { Hono } from "hono";
import Markdown from "../..";
import { readFileSync } from "fs";

const css = readFileSync("../../themes/default.css", "utf-8");
const md = readFileSync("../node/test.md", "utf-8");

const style = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.65;
    color: #1a1a1a;
    background: #f0ede8;
    margin: 0;
    padding: 2.5rem 1rem;
  }
  h1 a, h2 a, h3 a, h4 a, h5 a, h6 a { color: inherit; text-decoration: none; }
  pre { background: #f5f3ef !important; border: 1px solid #e8e4de; }
  #root {
    max-width: 680px;
    margin: 0 auto;
    background: #fff;
    padding: 3rem 4rem;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 6px 28px rgba(0,0,0,0.07);
  }
`;

const app = new Hono();

app.get("/", (c) =>
  c.html(
    <html>
      <head>
        <meta charset="utf-8" />
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </head>
      <body>
        <Markdown id="root">{md}</Markdown>
      </body>
    </html>
  )
);

export default app;
