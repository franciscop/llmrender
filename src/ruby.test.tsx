import $ from "react-test";
import Markdown from "./index";

it("renders ruby annotation", () => {
  const $el = $(<Markdown>{"[漢字]{かんじ}"}</Markdown>);
  expect($el.find("p")).toHaveHtml("<ruby>漢字<rt>かんじ</rt></ruby>");
});

it("renders ruby base text", () => {
  const ruby = $(<Markdown>{"[漢字]{かんじ}"}</Markdown>).find("ruby");
  expect(ruby.text()).toBe("漢字かんじ");
});

it("renders ruby annotation with title", () => {
  const $el = $(<Markdown>{'[漢字]{かんじ "kanji"}'}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<ruby title="kanji">漢字<rt>かんじ</rt></ruby>',
  );
});

it("renders ruby with title preserving base text", () => {
  const ruby = $(<Markdown>{'[漢字]{かんじ "kanji"}'}</Markdown>).find("ruby");
  expect(ruby.text()).toBe("漢字かんじ");
});

it("renders ruby without title has no title attribute", () => {
  const $el = $(<Markdown>{"[漢字]{かんじ}"}</Markdown>);
  expect($el.find("p")).toHaveHtml("<ruby>漢字<rt>かんじ</rt></ruby>");
});

it("renders ruby inline within paragraph text", () => {
  const $el = $(<Markdown>{"The word [漢字]{かんじ} means kanji."}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    "The word <ruby>漢字<rt>かんじ</rt></ruby> means kanji.",
  );
});

it("renders multiple ruby annotations", () => {
  const $el = $(<Markdown>{"[漢字]{かんじ} and [日本語]{にほんご}"}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    "<ruby>漢字<rt>かんじ</rt></ruby> and <ruby>日本語<rt>にほんご</rt></ruby>",
  );
});

it("renders ruby with title when not inside a link", () => {
  const input =
    '[大学]{だいがく "An institution of higher education and research"}２[年生]{ねんせい "A student in a particular school year or grade"}';
  const $el = $(<Markdown>{input}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<ruby title="An institution of higher education and research">大学<rt>だいがく</rt></ruby>２<ruby title="A student in a particular school year or grade">年生<rt>ねんせい</rt></ruby>',
  );
});

it("renders ruby inside link text", () => {
  const $el = $(<Markdown>{"[[行]{い}く](#)"}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<a href="#"><ruby>行<rt>い</rt></ruby>く</a>',
  );
});

it("renders multiple ruby annotations inside link text", () => {
  const $el = $(<Markdown>{"[[行]{い}きたいと[思]{おも}](#)"}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<a href="#"><ruby>行<rt>い</rt></ruby>きたいと<ruby>思<rt>おも</rt></ruby></a>',
  );
});

it("renders full nested ruby link with title", () => {
  const input =
    'に[[行]{い}きたいと[思]{おも}](# "Vたいと＋思う; expressing desire or intention")っていました';
  const $el = $(<Markdown>{input}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    'に<a href="#" title="Vたいと＋思う; expressing desire or intention"><ruby>行<rt>い</rt></ruby>きたいと<ruby>思<rt>おも</rt></ruby></a>っていました',
  );
});

it("does not confuse ruby with links", () => {
  const $el = $(
    <Markdown>{"[link](https://example.com) and [漢字]{かんじ}"}</Markdown>,
  );
  expect($el.find("p")).toHaveHtml(
    '<a href="https://example.com">link</a> and <ruby>漢字<rt>かんじ</rt></ruby>',
  );
});

it("allows parentheses in furigana", () => {
  const $el = $(<Markdown>{"[漢字]{かんじ(test)}"}</Markdown>);
  expect($el.find("p")).toHaveHtml("<ruby>漢字<rt>かんじ(test)</rt></ruby>");
});

it("allows parentheses in base text", () => {
  const $el = $(<Markdown>{"[漢字(base)]{かんじ}"}</Markdown>);
  expect($el.find("p")).toHaveHtml("<ruby>漢字(base)<rt>かんじ</rt></ruby>");
});

it("renders full complex paragraph with mixed ruby and links", () => {
  const input = "[大学]{だいがく}[text](#)";
  const $el = $(<Markdown>{input}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<ruby>大学<rt>だいがく</rt></ruby><a href="#">text</a>',
  );
});

it("allows parentheses in title", () => {
  const $el = $(<Markdown>{'[漢字]{かんじ "kanji (noun)"}'}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<ruby title="kanji (noun)">漢字<rt>かんじ</rt></ruby>',
  );
});
