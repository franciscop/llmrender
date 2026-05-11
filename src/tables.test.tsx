import $ from "react-test";
import Markdown from "./index";

const src = "| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |";

it("renders a table", () => {
  expect($(<Markdown>{src}</Markdown>).find("table").length).toBe(1);
});

it("renders table headers", () => {
  const headers = $(<Markdown>{src}</Markdown>).find("th");
  expect(headers.length).toBe(2);
  expect(headers.array("textContent")).toEqual(["Name", "Age"]);
});

it("renders table rows", () => {
  const rows = $(<Markdown>{src}</Markdown>)
    .find("tbody")
    .find("tr");
  expect(rows.length).toBe(2);
});

it("renders table cells", () => {
  const cells = $(<Markdown>{src}</Markdown>).find("td");
  expect(cells.array("textContent")).toEqual(["Alice", "30", "Bob", "25"]);
});

it("renders inline markup inside table cells", () => {
  const src = "| Col |\n| --- |\n| **bold** |";
  expect(
    $(<Markdown>{src}</Markdown>)
      .find("td")
      .find("strong")
      .text(),
  ).toBe("bold");
});

it("renders an aligned table", () => {
  const alignedSrc =
    "| Left-Aligned | Center-Aligned | Right-Aligned |\n|:-------------|:--------------:|--------------:|\n| Item A | Value 1 | 100 |";
  const component = $(<Markdown>{alignedSrc}</Markdown>);
  expect(component.find("table").length).toBe(1);
  const headers = component.find("th");
  expect(headers.length).toBe(3);
  expect(headers.array("textContent")).toEqual([
    "Left-Aligned",
    "Center-Aligned",
    "Right-Aligned",
  ]);
  const cells = component.find("td");
  expect(cells.length).toBe(3);
  expect(cells.array("textContent")).toEqual(["Item A", "Value 1", "100"]);
  expect(
    headers.array((h: Node) => (h as HTMLElement).style.textAlign),
  ).toEqual(["left", "center", "right"]);
  expect(cells.array((h: Node) => (h as HTMLElement).style.textAlign)).toEqual([
    "left",
    "center",
    "right",
  ]);
});

it("renders a multiline table", () => {
  const multiSrc =
    "| Header | Description |\n|--------|-------------|\n| Item 1 | This is a multiline<br>description that spans<br>multiple lines. |";
  const component = $(<Markdown>{multiSrc}</Markdown>);
  expect(component.find("table").length).toBe(1);
  const cell = $(component.find("td").get(1));
  expect(cell.find("br").length).toBe(2);
  expect(cell.text()).toBe(
    "This is a multilinedescription that spansmultiple lines.",
  );
});

it("renders a headerless table", () => {
  const headerlessSrc =
    "| Col 1 | Col 2 |\n|-------|-------|\n| Data A | Data B |\n| Data C | Data D |";
  const component = $(<Markdown>{headerlessSrc}</Markdown>);
  expect(component.find("table").length).toBe(1);
  const headers = component.find("th");
  expect(headers.length).toBe(2);
  expect(headers.array("textContent")).toEqual(["Col 1", "Col 2"]);
  const cells = component.find("td");
  expect(cells.length).toBe(4);
  expect(cells.array("textContent")).toEqual([
    "Data A",
    "Data B",
    "Data C",
    "Data D",
  ]);
});

it("renders a table with escaped pipes", () => {
  const escapedSrc =
    "| Header | Content with Pipe |\n|--------|-------------------|\n| Row 1  | Value \\| with pipe |";
  const component = $(<Markdown>{escapedSrc}</Markdown>);
  expect(component.find("table").length).toBe(1);
  const cells = component.find("td");
  expect(cells.length).toBe(2);
  expect(cells.array("textContent")).toEqual(["Row 1", "Value | with pipe"]);
});

it("does not split table cell on | inside $$...$$", () => {
  const src = "| Label | Formula |\n|---|---|\n| Abs | $$\\left|x\\right|$$ |";
  const el = $(<Markdown>{src}</Markdown>);
  expect(el.find("td").length).toBe(2);
  expect(el.find("td").get(1)?.textContent).not.toContain("$$");
});
