import $ from "react-test";
import Markdown from "./index";

it("renders strikethrough text", () => {
  expect(
    $(<Markdown>{"~~deleted~~"}</Markdown>)
      .find("del")
      .text(),
  ).toBe("deleted");
});

it("renders strikethrough alongside other inline elements", () => {
  const $el = $(<Markdown>{"~~strike~~ and **bold**"}</Markdown>);
  expect($el.find("del").text()).toBe("strike");
  expect($el.find("strong").text()).toBe("bold");
});
