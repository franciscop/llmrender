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
