import $ from "react-test";
import Markdown from "./index";

it("renders a horizontal rule with ---", () => {
  expect($(<Markdown>---</Markdown>).find("hr").length).toBe(1);
});

it("renders a horizontal rule with ***", () => {
  expect($(<Markdown>***</Markdown>).find("hr").length).toBe(1);
});

it("renders a horizontal rule with ___", () => {
  expect($(<Markdown>___</Markdown>).find("hr").length).toBe(1);
});

it("separates content around a horizontal rule", () => {
  const $el = $(<Markdown>{"above\n\n---\n\nbelow"}</Markdown>);
  expect($el.find("p").length).toBe(2);
  expect($el.find("hr").length).toBe(1);
});

it("renders a horizontal rule with spaces between the markers", () => {
  expect($(<Markdown>{"- - -"}</Markdown>).find("hr").length).toBe(1);
  expect($(<Markdown>{"* * *"}</Markdown>).find("hr").length).toBe(1);
  expect($(<Markdown>{"_ _ _"}</Markdown>).find("hr").length).toBe(1);
});

it("does not treat a spaced rule as a list item", () => {
  expect($(<Markdown>{"- - -"}</Markdown>).find("li").length).toBe(0);
});
