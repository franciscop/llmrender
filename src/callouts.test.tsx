import $ from "react-test";
import Markdown from "./index";

it("renders a note callout", () => {
  const component = $(<Markdown>{"> [!NOTE]\n> This is a note"}</Markdown>);
  expect(component.find("blockquote.callout-note").length).toBe(1);
  expect(component.find(".callout-title").text()).toBe("Note");
  expect(component.find("blockquote p:not(.callout-title)").text()).toBe(
    "This is a note",
  );
});

it("renders a warning callout", () => {
  const component = $(<Markdown>{"> [!WARNING]\n> Be careful"}</Markdown>);
  expect(component.find("blockquote.callout-warning").length).toBe(1);
  expect(component.find(".callout-title").text()).toBe("Warning");
});

it("renders a tip callout", () => {
  const component = $(<Markdown>{"> [!TIP]\n> Pro tip"}</Markdown>);
  expect(component.find("blockquote.callout-tip").length).toBe(1);
  expect(component.find(".callout-title").text()).toBe("Tip");
});

it("renders an important callout", () => {
  const component = $(<Markdown>{"> [!IMPORTANT]\n> Key info"}</Markdown>);
  expect(component.find("blockquote.callout-important").length).toBe(1);
  expect(component.find(".callout-title").text()).toBe("Important");
});

it("renders a caution callout", () => {
  const component = $(<Markdown>{"> [!CAUTION]\n> Watch out"}</Markdown>);
  expect(component.find("blockquote.callout-caution").length).toBe(1);
  expect(component.find(".callout-title").text()).toBe("Caution");
});

it("renders callout type case-insensitively", () => {
  const component = $(<Markdown>{"> [!note]\n> lowercase"}</Markdown>);
  expect(component.find("blockquote.callout-note").length).toBe(1);
  expect(component.find(".callout-title").text()).toBe("Note");
});

it("renders callout body as paragraph", () => {
  const component = $(
    <Markdown>{"> [!NOTE]\n> line one\n> line two"}</Markdown>,
  );
  expect(component.find("blockquote p:not(.callout-title)").text()).toBe(
    "line one line two",
  );
});

it("renders inline markup inside callout body", () => {
  const component = $(<Markdown>{"> [!NOTE]\n> **bold** text"}</Markdown>);
  expect(component.find("blockquote strong").text()).toBe("bold");
});

it("renders a plain blockquote when type is unrecognized", () => {
  const component = $(<Markdown>{"> [!CUSTOM]\n> content"}</Markdown>);
  expect(component.find("blockquote.callout-custom").length).toBe(0);
  expect(component.find("blockquote").length).toBe(1);
});
