# Changelog

## 1.0.14

- Lists: indented content stays inside its item (sub-lists at any depth, paragraphs, code, math, quotes), loose lists stay one list, and an unindented line continues the last item instead of jumping above the list.
- Text right after a table renders below it.
- Dollar amounts like `$5 and $10` stay text, in paragraphs and in table cells.
- `\( \)` renders inline math, and `\[ \]` on their own lines (or as `\[ x \]`) render display math.
- Tables tolerate trailing spaces after the last pipe.
- Bare URLs no longer swallow trailing punctuation.
- Footnotes (`[^1]`) stay as text instead of rendering a broken link.
- Math: thin space after `\sin`, `\log` and friends, integral limits at the side, primes sit at the right height (`f′`), real minus sign, and no gap in `-\infty`.
- A lone `-` under a paragraph no longer turns it into a heading while a list streams in.

## 1.0.13

- `|v|`, `\vert`, `\lvert` and `\rvert` render as absolute value bars without stray spacing. `\mid` keeps its relation spacing.

## 1.0.12

- `\mathbf` renders bold in every browser, digits included.

## 1.0.11

- Smaller bundle.
- All Greek capitals, `\omicron` and `\varsigma`.

## 1.0.10

- Brace groups render without literal braces, so `1{,}000` works.
- Escaped characters (`\{`, `\}`, `\%`, `\_`, `\#`, `\&`) render as themselves.
- Spaces at the edges of `\text{ }` are kept.
- `\tfrac` and `\dfrac` set their size, and `\frac12` means one half.
- New: `\operatorname`, `\not`, `\boldsymbol`, `\mathfrak`, `\nmid`, `\bigcup`, `\bigcap`.

## 1.0.9

- Primes in math: `f'` and `f''`.

## 1.0.8

- No React key warnings, and no runtime import from a specific JSX package.

## 1.0.7

- `<details>` can span multiple lines (with `rawHtml`), with Markdown inside.

## 1.0.6

- Reference links and images (`[text][label]` with `[label]: url`).
- HTML entities are decoded.
- HTML comments are removed.
- Setext headings, tilde fences, lazy blockquote continuation, and more CommonMark fixes.

## 1.0.5

- Indented code keeps its position before a following paragraph or table.
- Many CommonMark fixes: escapes, headings, rules, emphasis, hard breaks.

## 1.0.4

- Duplicate headings get unique ids (`-1`, `-2`), like GitHub.

## 1.0.3

- `\<` and `\>` escape to literal characters.

## 1.0.2

- Long link text is no longer truncated, fixing linked images such as badges.

## 1.0.1

- Images with empty alt text render.
