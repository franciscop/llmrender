import $ from "react-test";
import Markdown from "./index";

it("renders ruby annotation", () => {
  const ruby = $(<Markdown>{"[漢字]{かんじ}"}</Markdown>).find("ruby");
  expect(ruby.length).toBe(1);
  expect(ruby.find("rt").text()).toBe("かんじ");
});

it("renders ruby base text", () => {
  const ruby = $(<Markdown>{"[漢字]{かんじ}"}</Markdown>).find("ruby");
  expect(ruby.text()).toBe("漢字かんじ");
});

it("renders ruby annotation with title", () => {
  const ruby = $(<Markdown>{'[漢字]{かんじ "kanji"}'}</Markdown>).find("ruby");
  expect(ruby.attr("title")).toBe("kanji");
  expect(ruby.find("rt").text()).toBe("かんじ");
});

it("renders ruby with title preserving base text", () => {
  const ruby = $(<Markdown>{'[漢字]{かんじ "kanji"}'}</Markdown>).find("ruby");
  expect(ruby.text()).toBe("漢字かんじ");
});

it("renders ruby without title has no title attribute", () => {
  const ruby = $(<Markdown>{"[漢字]{かんじ}"}</Markdown>).find("ruby");
  expect(ruby.attr("title")).toBeFalsy();
});

it("renders ruby inline within paragraph text", () => {
  const $el = $(<Markdown>{"The word [漢字]{かんじ} means kanji."}</Markdown>);
  expect($el.find("ruby").length).toBe(1);
  expect($el.find("rt").text()).toBe("かんじ");
});

it("renders multiple ruby annotations", () => {
  const $el = $(<Markdown>{"[漢字]{かんじ} and [日本語]{にほんご}"}</Markdown>);
  expect($el.find("ruby").length).toBe(2);
  const rts = $el.find("rt");
  expect(rts.length).toBe(2);
});

it("does not confuse ruby with links", () => {
  const $el = $(
    <Markdown>{"[link](https://example.com) and [漢字]{かんじ}"}</Markdown>,
  );
  expect($el.find("a").length).toBe(1);
  expect($el.find("ruby").length).toBe(1);
});

it("allows parentheses in furigana", () => {
  const ruby = $(<Markdown>{"[漢字]{かんじ(test)}"}</Markdown>).find("ruby");
  expect(ruby.find("rt").text()).toBe("かんじ(test)");
});

it("allows parentheses in base text", () => {
  const ruby = $(<Markdown>{"[漢字(base)]{かんじ}"}</Markdown>).find("ruby");
  expect(ruby.text()).toContain("漢字(base)");
  expect(ruby.find("rt").text()).toBe("かんじ");
});

it("allows parentheses in title", () => {
  const ruby = $(<Markdown>{'[漢字]{かんじ "kanji (noun)"}'}</Markdown>).find(
    "ruby",
  );
  expect(ruby.attr("title")).toBe("kanji (noun)");
  expect(ruby.find("rt").text()).toBe("かんじ");
});
