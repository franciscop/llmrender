import $ from "react-test";
import Markdown from "./index";

it("renders h1", () => {
  expect(
    $(<Markdown># Hello</Markdown>)
      .find("h1")
      .text(),
  ).toBe("Hello");
});

it("renders h2", () => {
  expect(
    $(<Markdown>## World</Markdown>)
      .find("h2")
      .text(),
  ).toBe("World");
});

it("renders h3 through h6", () => {
  for (let i = 3; i <= 6; i++) {
    expect(
      $(<Markdown>{"#".repeat(i) + " Title"}</Markdown>)
        .find(`h${i}`)
        .text(),
    ).toBe("Title");
  }
});

it("renders bold inside a heading", () => {
  expect(
    $(<Markdown># **bold heading**</Markdown>)
      .find("h1")
      .find("strong")
      .text(),
  ).toBe("bold heading");
});

it("adds id to heading from text", () => {
  expect(
    $(<Markdown>## Hello World</Markdown>)
      .find("h2")
      .attr("id"),
  ).toBe("hello-world");
});

it("renders anchor link inside heading", () => {
  const h = $(<Markdown># My Heading</Markdown>).find("h1");
  expect(h.attr("id")).toBe("my-heading");
  expect(h).toHaveHtml('<a href="#my-heading">My Heading</a>');
});

it("slugifies heading with special characters", () => {
  expect(
    $(<Markdown>## Hello, World!</Markdown>)
      .find("h2")
      .attr("id"),
  ).toBe("hello-world");
});

it("slugifies heading with multiple spaces", () => {
  expect(
    $(<Markdown>### Foo Bar</Markdown>)
      .find("h3")
      .attr("id"),
  ).toBe("foo-bar");
});

it("preserves CJK characters in heading id", () => {
  expect(
    $(<Markdown>{"## 日本語"}</Markdown>)
      .find("h2")
      .attr("id"),
  ).toBe("日本語");
});

it("preserves accented characters in heading id", () => {
  expect(
    $(<Markdown>{"## Café"}</Markdown>)
      .find("h2")
      .attr("id"),
  ).toBe("café");
});

it("preserves Greek characters in heading id", () => {
  expect(
    $(<Markdown>{"## Ελληνικά"}</Markdown>)
      .find("h2")
      .attr("id"),
  ).toBe("ελληνικά");
});

it("appends -1 to duplicate heading ids", () => {
  const $el = $(<Markdown>{"## Foo\n\n## Foo"}</Markdown>);
  expect(($el.find("h2").get(0) as HTMLElement).id).toBe("foo");
  expect(($el.find("h2").get(1) as HTMLElement).id).toBe("foo-1");
});

it("appends -2 for a third duplicate heading", () => {
  const $el = $(<Markdown>{"## Foo\n\n## Foo\n\n## Foo"}</Markdown>);
  expect(($el.find("h2").get(0) as HTMLElement).id).toBe("foo");
  expect(($el.find("h2").get(1) as HTMLElement).id).toBe("foo-1");
  expect(($el.find("h2").get(2) as HTMLElement).id).toBe("foo-2");
});

it("allows up to three spaces before a heading", () => {
  expect(
    $(<Markdown>{"   ### Indented"}</Markdown>)
      .find("h3")
      .text(),
  ).toBe("Indented");
});

it("strips a closing sequence of hashes", () => {
  expect(
    $(<Markdown>{"## Foo ##"}</Markdown>)
      .find("h2")
      .text(),
  ).toBe("Foo");
});

it("keeps hashes that are part of the heading text", () => {
  expect(
    $(<Markdown>{"## Foo #bar"}</Markdown>)
      .find("h2")
      .text(),
  ).toBe("Foo #bar");
});
