import $ from "react-test";
import Markdown from "./index";

it("renders an unchecked task item", () => {
  const $el = $(<Markdown>{"- [ ] todo"}</Markdown>);
  const checkbox = $el.find("input");
  expect(checkbox.attr("type")).toBe("checkbox");
  expect(checkbox.attr("checked")).toBeNull();
});

it("renders a checked task item", () => {
  const $el = $(<Markdown>{"- [x] done"}</Markdown>);
  expect($el.find("input").attr("checked")).toBe("");
});

it("renders mixed task and regular items in the same list", () => {
  const $el = $(<Markdown>{"- [ ] todo\n- [x] done\n- plain"}</Markdown>);
  expect($el.find("li").length).toBe(3);
  expect($el.find("input").length).toBe(2);
});

it("renders task item label text", () => {
  const $el = $(<Markdown>{"- [ ] buy milk"}</Markdown>);
  expect($el.find("li").text()).toBe("buy milk");
});
