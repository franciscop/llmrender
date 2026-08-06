import $ from "react-test";
import Markdown from "./index";

it("renders a blockquote", () => {
  expect(
    $(<Markdown>{"> hello"}</Markdown>)
      .find("blockquote")
      .find("p")
      .text(),
  ).toBe("hello");
});

it("joins consecutive blockquote lines", () => {
  expect(
    $(<Markdown>{"> line one\n> line two"}</Markdown>)
      .find("blockquote")
      .find("p")
      .text(),
  ).toBe("line one line two");
});

it("renders inline markup inside blockquotes", () => {
  expect(
    $(<Markdown>{"> **bold**"}</Markdown>)
      .find("blockquote")
      .find("p"),
  ).toHaveHtml("<strong>bold</strong>");
});

it("renders a blockquote with an empty > line as paragraph break", () => {
  const src = "> first\n>\n> second";
  const component = $(<Markdown>{src}</Markdown>);
  expect(component.find("blockquote").length).toBe(1);
  const paras = component.find("blockquote").find("p");
  expect(paras.length).toBe(2);
});

it("renders nested blockquote separated by empty > lines", () => {
  const src =
    "> This is the first level of quoting.\n>\n> > This is nested blockquote.\n>\n> Back to the first level.";
  const component = $(<Markdown>{src}</Markdown>);
  expect(component.find("blockquote").length).toBe(2);
  expect(component.find("blockquote blockquote").find("p").text()).toBe(
    "This is nested blockquote.",
  );
});

it("renders nested blockquotes", () => {
  const component = $(<Markdown>{"> outer\n> > inner"}</Markdown>);
  expect(component.find("blockquote").length).toBe(2);
  const inner = component.find("blockquote blockquote");
  expect(inner.length).toBe(1);
  expect(inner.find("p").text()).toBe("inner");
});

it("continues a blockquote across a line with no marker", () => {
  const $el = $(<Markdown>{"> bar\nbaz"}</Markdown>);
  expect($el.find("blockquote").find("p").text()).toBe("bar baz");
  expect($el.find("blockquote").length).toBe(1);
});

it("ends a blockquote at a blank quoted line", () => {
  const $el = $(<Markdown>{"> bar\n>\nbaz"}</Markdown>);
  expect($el.find("blockquote").find("p").text()).toBe("bar");
  expect($el.find("p").array("textContent")).toContain("baz");
});

it("keeps a blockquote before the paragraph that follows it", () => {
  const node = $(<Markdown>{"> bar\n\nbaz"}</Markdown>)
    .find("blockquote")
    .get(0)!;
  expect(node.nextSibling!.nodeName).toBe("P");
});

it("accepts a blockquote marker with no space after it", () => {
  expect(
    $(<Markdown>{">bar"}</Markdown>)
      .find("blockquote")
      .text(),
  ).toBe("bar");
});

it("accepts a blockquote indented up to three spaces", () => {
  expect(
    $(<Markdown>{"   > bar"}</Markdown>)
      .find("blockquote")
      .text(),
  ).toBe("bar");
});
