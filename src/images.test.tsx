import $ from "react-test";
import Markdown from "./index";

it("renders an image", () => {
  const img = $(
    <Markdown>![alt text](https://example.com/img.png)</Markdown>,
  ).find("img");
  expect(img.attr("src")).toBe("https://example.com/img.png");
  expect(img.attr("alt")).toBe("alt text");
});

it("does not render image as a link", () => {
  const $el = $(<Markdown>![alt](https://example.com/img.png)</Markdown>);
  expect($el.find("a").length).toBe(0);
  expect($el.find("img").length).toBe(1);
});

it("renders image with title", () => {
  const img = $(
    <Markdown>
      {'![alt text](https://example.com/img.png "My Image")'}
    </Markdown>,
  ).find("img");
  expect(img.attr("src")).toBe("https://example.com/img.png");
  expect(img.attr("alt")).toBe("alt text");
  expect(img.attr("title")).toBe("My Image");
});

it("renders image without title and has no title attribute", () => {
  const img = $(
    <Markdown>{"![alt](https://example.com/img.png)"}</Markdown>,
  ).find("img");
  expect(img.attr("title")).toBeFalsy();
});

it("renders image and link in same paragraph", () => {
  const $el = $(
    <Markdown>
      {"![img](https://example.com/a.png) and [link](https://example.com)"}
    </Markdown>,
  );
  expect($el.find("img").length).toBe(1);
  expect($el.find("a").length).toBe(1);
});
