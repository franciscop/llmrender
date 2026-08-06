import $ from "react-test";
import Markdown from "./index";

it("resolves a full reference link", () => {
  const a = $(<Markdown>{'[foo][bar]\n\n[bar]: /url "title"'}</Markdown>).find(
    "a",
  );
  expect(a.attr("href")).toBe("/url");
  expect(a.attr("title")).toBe("title");
  expect(a.text()).toBe("foo");
});

it("resolves a collapsed reference link", () => {
  expect(
    $(<Markdown>{"[foo][]\n\n[foo]: /url"}</Markdown>)
      .find("a")
      .attr("href"),
  ).toBe("/url");
});

it("resolves a shortcut reference link", () => {
  expect(
    $(<Markdown>{"[foo]\n\n[foo]: /url"}</Markdown>)
      .find("a")
      .attr("href"),
  ).toBe("/url");
});

it("resolves a definition that appears before its use", () => {
  expect(
    $(<Markdown>{"[foo]: /url\n\n[foo]"}</Markdown>)
      .find("a")
      .attr("href"),
  ).toBe("/url");
});

it("matches labels case-insensitively", () => {
  expect(
    $(<Markdown>{"[Foo][BAR]\n\n[bar]: /url"}</Markdown>)
      .find("a")
      .attr("href"),
  ).toBe("/url");
});

it("resolves a reference image", () => {
  const img = $(<Markdown>{"![alt][pic]\n\n[pic]: /img.png"}</Markdown>).find(
    "img",
  );
  expect(img.attr("src")).toBe("/img.png");
  expect(img.attr("alt")).toBe("alt");
});

it("does not render definitions as visible text", () => {
  expect(
    $(<Markdown>{"[foo]\n\n[foo]: /url"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("foo");
});

it("keeps brackets literal when no definition matches", () => {
  const $el = $(<Markdown>{"[missing]\n\n[other]: /url"}</Markdown>);
  expect($el.find("a").length).toBe(0);
  expect($el.find("p").text()).toBe("[missing]");
});

it("still parses inline markup inside an unresolved bracket run", () => {
  expect(
    $(<Markdown>{"[*emph*]\n\n[other]: /url"}</Markdown>)
      .find("em")
      .text(),
  ).toBe("emph");
});

it("prefers an inline link over a reference of the same name", () => {
  expect(
    $(<Markdown>{"[foo](/inline)\n\n[foo]: /ref"}</Markdown>)
      .find("a")
      .attr("href"),
  ).toBe("/inline");
});

it("does not treat a definition inside a fenced block as a definition", () => {
  const $el = $(<Markdown>{"```\n[foo]: /url\n```"}</Markdown>);
  expect($el.find("code").text()).toBe("[foo]: /url");
});

it("sanitizes a dangerous reference destination", () => {
  expect(
    $(<Markdown>{"[click]\n\n[click]: javascript:alert(1)"}</Markdown>)
      .find("a")
      .attr("href"),
  ).toBe("#");
});
