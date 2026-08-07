import $ from "react-test";
import Markdown from "./index";

const D = (md: string) => $(<Markdown rawHtml>{md}</Markdown>);

it("renders details with a summary and a body", () => {
  const $el = D(
    "<details>\n<summary>More</summary>\n\nHidden body.\n\n</details>",
  );
  expect($el.find("details").length).toBe(1);
  expect($el.find("summary").text()).toBe("More");
  expect($el.find("details").find("p").text()).toBe("Hidden body.");
});

it("keeps the body inside the details element", () => {
  const $el = D("<details>\n<summary>S</summary>\n\nBody.\n\n</details>");
  expect($el.find("details").find("p").length).toBe(1);
  // nothing leaks out as a sibling
  expect($el.find("p").length).toBe(1);
});

it("parses block markdown in the body", () => {
  const $el = D(
    "<details>\n<summary>S</summary>\n\n- one\n- two\n\n```js\nx\n```\n\n</details>",
  );
  expect($el.find("details").find("li").length).toBe(2);
  expect($el.find("details").find("pre").length).toBe(1);
});

it("parses inline markdown in the body", () => {
  expect(
    D("<details>\n<summary>S</summary>\n\nA **bold** word.\n\n</details>")
      .find("strong")
      .text(),
  ).toBe("bold");
});

it("parses inline markdown in the summary", () => {
  expect(
    D("<details>\n<summary>Show *more*</summary>\n\nBody.\n\n</details>")
      .find("summary")
      .find("em")
      .text(),
  ).toBe("more");
});

it("supports the open attribute", () => {
  const el = D("<details open>\n<summary>S</summary>\n\nBody.\n\n</details>")
    .find("details")
    .get(0) as HTMLDetailsElement;
  expect(el.open).toBe(true);
});

it("leaves details closed by default", () => {
  const el = D("<details>\n<summary>S</summary>\n\nBody.\n\n</details>")
    .find("details")
    .get(0) as HTMLDetailsElement;
  expect(el.open).toBe(false);
});

it("works without a blank line around the body", () => {
  const $el = D("<details>\n<summary>S</summary>\nBody.\n</details>");
  expect($el.find("summary").text()).toBe("S");
  expect($el.find("details").text()).toContain("Body.");
});

it("works without a summary", () => {
  const $el = D("<details>\n\nJust a body.\n\n</details>");
  expect($el.find("details").length).toBe(1);
  expect($el.find("summary").length).toBe(0);
  expect($el.find("details").find("p").text()).toBe("Just a body.");
});

it("accepts up to three spaces of indentation", () => {
  expect(
    D(
      "   <details>\n   <summary>S</summary>\n\n   Body.\n\n   </details>",
    ).find("details").length,
  ).toBe(1);
});

it("continues normal parsing after the closing tag", () => {
  const $el = D(
    "<details>\n<summary>S</summary>\n\nInside.\n\n</details>\n\n# After",
  );
  expect($el.find("h1").text()).toBe("After");
  expect($el.find("details").find("h1").length).toBe(0);
});

it("renders a details that is entirely on one line", () => {
  const $el = D("<details><summary>S</summary>Body</details>");
  expect($el.find("details").length).toBe(1);
  expect($el.find("summary").text()).toBe("S");
});

it("closes an unterminated details at the end of input", () => {
  // Streaming: the closing tag has not arrived yet.
  const $el = D("<details>\n<summary>S</summary>\n\nPartial body");
  expect($el.find("details").length).toBe(1);
  expect($el.find("summary").text()).toBe("S");
  expect($el.find("details").text()).toContain("Partial body");
});

it("does not render details without rawHtml", () => {
  const $el = $(
    <Markdown>
      {"<details>\n<summary>S</summary>\n\nBody.\n\n</details>"}
    </Markdown>,
  );
  expect($el.find("details").length).toBe(0);
  expect($el.text()).toContain("<details>");
});

it("does not treat details inside a fenced block as markup", () => {
  const $el = D("```html\n<details>\n<summary>S</summary>\n</details>\n```");
  expect($el.find("details").length).toBe(0);
  expect($el.find("pre code").text()).toContain("<details>");
});

it("still refuses other multi-line html", () => {
  const $el = D("<div>\n\nNot supported.\n\n</div>");
  expect($el.find("div").find("p").length).toBe(0);
});

it("sanitizes a dangerous attribute on details", () => {
  expect(
    D('<details onclick="alert(1)">\n<summary>S</summary>\n\nB.\n\n</details>')
      .find("details")
      .attr("onclick"),
  ).toBeFalsy();
});
