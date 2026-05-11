# llmrender stress test

Jump to: [Inline](#inline) · [Headings](#headings) · [Lists](#lists) · [Tables](#tables) · [Blockquotes](#blockquotes) · [Code](#code) · [Math](#math) · [Edge cases](#edge-cases)

---

## Inline

### Bold and italic

Plain **bold**, plain *italic*, plain ***bold italic***.

Underscored __bold__, _italic_, ___bold italic___.

Bold inside italic: *this is _nested_ emphasis*.

Italic inside bold: **a **double** bold** — and **bold with *italic* inside**.

Strikethrough: ~~deleted text~~, ~~**bold deleted**~~, ~~*italic deleted*~~.

Bold+italic shorthand: ***three stars***, ___three underscores___.

Adjacent markers with no space: word**bold**word, word*italic*word.

Multiple independent spans: **a** and **b** and *c* and *d*.

### Code spans

Inline `code`, backtick literal `` ` ``, double-backtick span `` `code` ``, code with spaces `` foo bar ``.

Code suppresses formatting: `**not bold**`, `_not italic_`, `~~not struck~~`.

Code in bold: **`bold code`**, code in italic: *`italic code`*.

### Links

Simple link: [example](https://example.com).

Link with title: [example](https://example.com "Example site").

Fragment: [jump to math](#math).

Link with parentheses in URL: [Bracket](https://en.wikipedia.org/wiki/Bracket_(mathematics)).

Another paren URL: [Limit](https://en.wikipedia.org/wiki/Limit_(mathematics)).

Auto-detected URL: https://example.com/path?q=1&r=2.

Bold link: [**bold label**](https://example.com).

Italic link: [*italic label*](https://example.com).

Code link: [`code label`](https://example.com).

Adjacent links: [first](https://example.com/1)[second](https://example.com/2).

Link with special chars in label: [a & b < c > d](https://example.com).

### Images

![Alt text](https://placehold.co/100x40 "A placeholder image").

Image inside a link: [![Alt](https://placehold.co/16x16)](https://example.com).

### Ruby / furigana

[東京]{とうきょう}, [日本語]{にほんご}, [漢字]{かんじ}.

### Escapes

Escaped asterisk: \*not italic\*, escaped underscore: \_not italic\_.

Escaped brackets: \[not a link\](https://example.com).

Escaped backtick: \`not code\`.

Escaped hash: \# not a heading (when at line start).

Escaped backslash: \\.

---

## Headings

# H1 with **bold** and *italic*
## H2 with `inline code`
### H3 with a [link](https://example.com)
#### H4 plain
##### H5 plain
###### H6 — the smallest

Consecutive headings with no gap:
### First consecutive
### Second consecutive
### Third consecutive

---

## Lists

### Unordered — all three markers

* asterisk one
* asterisk two
* asterisk three

+ plus one
+ plus two

- minus one
- minus two

### Ordered

1. First
2. Second
3. Third

Non-sequential numbers (output should still be ordered):

3. Bird
1. McHale
8. Parish

### Task lists

- [x] Completed task
- [ ] Pending task
- [x] Another done item with **bold** text
- [ ] Item with a [link](https://example.com)

### Inline formatting in list items

* **Bold item** — important
* *Italic item* — note
* `code item` — literal
* ~~struck item~~ — removed
* Item with [a link](https://example.com "title")

### Deeply nested lists

1. Level one A
   1. Level two A
      - Level three A
      - Level three B
   2. Level two B
2. Level one B
   - Level two C
      1. Level three C
      2. Level three D

### List item with a blockquote

* Item before quote
* Item with embedded quote:

  > Quoted text inside a list item.

* Item after quote

### List item with code block

* Item before code
* Item with embedded code:

      const x = 42;

* Item after code

---

## Tables

### Basic table

| Name    | Age | City          |
| ------- | --- | ------------- |
| Alice   | 30  | New York      |
| Bob     | 25  | London        |
| Charlie | 35  | Tokyo         |

### Alignment

| Left      | Center       | Right   |
| :-------- | :----------: | ------: |
| apple     | banana       | cherry  |
| 1         | 2            | 3       |
| longer    | cell content | x       |

### Formatting in cells

| Feature       | Syntax              | Result                  |
| ------------- | ------------------- | ----------------------- |
| Bold          | `**text**`          | **bold**                |
| Italic        | `*text*`            | *italic*                |
| Code          | `` `code` ``        | `code`                  |
| Strikethrough | `~~text~~`          | ~~struck~~              |
| Link          | `[label](url)`      | [example](https://example.com) |

### Table with math

| Expression | Formula |
| ---------- | ------- |
| Euler's identity | $e^{i\pi} + 1 = 0$ |
| Pythagorean theorem | $a^2 + b^2 = c^2$ |
| Quadratic formula | $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ |

### Single-column table

| Item |
| ---- |
| one  |
| two  |
| three |

---

## Blockquotes

### Simple

> A single-line blockquote.

### Multi-paragraph

> First paragraph of the quote. Lorem ipsum dolor sit amet.
>
> Second paragraph. Consecutive with a blank `>` separator.

### Lazy continuation

> First line of a lazy blockquote.
second line without the `>` marker.
third line also without.

### Nested blockquotes

> Outer level.
>
> > Inner level.
> >
> > > Triple nested.
> >
> > Back to inner.
>
> Back to outer.

### Blockquote with formatting

> **Bold** and *italic* and `code` and ~~struck~~ and a [link](https://example.com).

### Blockquote with a list

> 1. First item
> 2. Second item
> 3. Third item

### Blockquote with a heading and code

> ## Blockquoted heading
>
> Here's some code inside a blockquote:
>
>     const answer = 42;

---

## Code

### Fenced — language sampler

```js
// Closures and async/await
function makeCounter(start = 0) {
  let n = start;
  return {
    inc: () => ++n,
    dec: () => --n,
    get: () => n,
    reset: () => { n = start; },
  };
}

async function retry(fn, times = 3, delay = 300) {
  for (let i = 0; i < times; i++) {
    try { return await fn(); }
    catch (e) { if (i === times - 1) throw e; }
    await new Promise(r => setTimeout(r, delay * 2 ** i));
  }
}
```

```ts
type Brand<T, B> = T & { readonly __brand: B };
type UserId = Brand<string, "UserId">;
type Milliseconds = Brand<number, "Milliseconds">;

function userId(raw: string): UserId { return raw as UserId; }

type Result<T, E = Error> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

async function fetchUser(id: UserId): Promise<Result<{ name: string }>> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) return { ok: false, error: new Error(`HTTP ${res.status}`) };
  return { ok: true, value: await res.json() };
}
```

```py
from __future__ import annotations
from dataclasses import dataclass
from typing import Generic, TypeVar, Iterator

T = TypeVar("T")

@dataclass
class Node(Generic[T]):
    value: T
    next: Node[T] | None = None

class LinkedList(Generic[T]):
    def __init__(self) -> None:
        self._head: Node[T] | None = None
        self._size = 0

    def prepend(self, value: T) -> None:
        self._head = Node(value, self._head)
        self._size += 1

    def __iter__(self) -> Iterator[T]:
        cur = self._head
        while cur:
            yield cur.value
            cur = cur.next

    def __len__(self) -> int:
        return self._size
```

```go
package main

import (
	"context"
	"errors"
	"time"
)

type Semaphore chan struct{}

func NewSemaphore(n int) Semaphore { return make(Semaphore, n) }

func (s Semaphore) Acquire(ctx context.Context) error {
	select {
	case s <- struct{}{}:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (s Semaphore) Release() { <-s }

var ErrTimeout = errors.New("operation timed out")

func withTimeout[T any](ctx context.Context, d time.Duration, fn func() (T, error)) (T, error) {
	ctx, cancel := context.WithTimeout(ctx, d)
	defer cancel()
	ch := make(chan struct{ v T; e error }, 1)
	go func() { v, e := fn(); ch <- struct{ v T; e error }{v, e} }()
	select {
	case r := <-ch: return r.v, r.e
	case <-ctx.Done(): var z T; return z, ErrTimeout
	}
}
```

```rust
use std::sync::{Arc, Mutex};
use std::collections::VecDeque;

pub struct Channel<T> {
    inner: Arc<Mutex<VecDeque<T>>>,
}

impl<T> Channel<T> {
    pub fn new() -> (Sender<T>, Receiver<T>) {
        let inner = Arc::new(Mutex::new(VecDeque::new()));
        (Sender { inner: inner.clone() }, Receiver { inner })
    }
}

pub struct Sender<T> { inner: Arc<Mutex<VecDeque<T>>> }
pub struct Receiver<T> { inner: Arc<Mutex<VecDeque<T>>> }

impl<T> Sender<T> {
    pub fn send(&self, val: T) {
        self.inner.lock().unwrap().push_back(val);
    }
}

impl<T> Receiver<T> {
    pub fn recv(&self) -> Option<T> {
        self.inner.lock().unwrap().pop_front()
    }
}
```

```sql
WITH RECURSIVE org_tree AS (
  SELECT id, name, parent_id, 0 AS depth, name::text AS path
  FROM employees
  WHERE parent_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.parent_id, t.depth + 1, t.path || ' > ' || e.name
  FROM employees e
  JOIN org_tree t ON e.parent_id = t.id
)
SELECT
  depth,
  REPEAT('  ', depth) || name AS indented_name,
  path,
  COUNT(*) OVER (PARTITION BY depth) AS peers_at_level
FROM org_tree
ORDER BY path;
```

```bash
#!/usr/bin/env bash
set -euo pipefail

# Rotate logs: keep last N compressed files
rotate_logs() {
  local dir="$1" keep="${2:-7}" pattern="${3:-*.log}"
  find "$dir" -maxdepth 1 -name "$pattern" -mtime +1 | sort -r | while read -r f; do
    gzip -f "$f" && echo "Compressed: $f"
  done
  find "$dir" -maxdepth 1 -name "*.log.gz" | sort -r | tail -n +$((keep + 1)) | xargs -r rm -v
}

rotate_logs /var/log/myapp 14 "app-*.log"
```

```json
{
  "openapi": "3.1.0",
  "info": { "title": "Pets API", "version": "1.0.0" },
  "paths": {
    "/pets": {
      "get": {
        "summary": "List pets",
        "parameters": [
          { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 20 } },
          { "name": "tag",   "in": "query", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/PetList" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Pet": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id":   { "type": "integer" },
          "name": { "type": "string" },
          "tag":  { "type": "string" }
        }
      },
      "PetList": { "type": "array", "items": { "$ref": "#/components/schemas/Pet" } }
    }
  }
}
```

```css
/* Custom cascade layer + container queries */
@layer base, components, utilities;

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font: 1rem/1.5 system-ui, sans-serif; }
}

@layer components {
  .card {
    container-type: inline-size;
    background: var(--surface, #fff);
    border-radius: .5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgb(0 0 0 / .12);
  }

  @container (min-width: 30rem) {
    .card { padding: 1.5rem; display: grid; grid-template-columns: auto 1fr; gap: 1rem; }
  }
}

@layer utilities {
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Stress test</title>
</head>
<body>
  <!-- Comment: should not show -->
  <template id="tmpl">
    <li class="item">
      <span class="label"></span>
      <button type="button" aria-label="Remove">×</button>
    </li>
  </template>
  <script>
    // This should be shown as-is inside the code block
    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', e => console.log(e.currentTarget.dataset.action));
    });
  </script>
</body>
</html>
```

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

```diff
--- a/src/index.tsx
+++ b/src/index.tsx
@@ -1,7 +1,9 @@
-import React from "react";
+import type { ReactNode } from "react";
 
 export function render(md: string) {
-  return <div>{md}</div>;
+  const nodes: ReactNode[] = parse(md);
+  return <article>{nodes}</article>;
 }
 
+function parse(md: string): ReactNode[] { return []; }
```

### Indented code block (4 spaces)

This is a paragraph before.

    const indented = "code block via spaces";
    function foo() { return 42; }

This is a paragraph after.

---

## Math

Inline: $E = mc^2$, $\hat{x} \in \mathbb{R}^n$, $\vec{v} \approx \vec{w}$, $\forall \epsilon > 0$, $\int_0^\infty e^{-x}\,dx = 1$.

Mixed with text: The area of a circle is $A = \pi r^2$ where $r$ is the radius.

Block display in a sentence — the Gaussian integral: $$\int_{-\infty}^{+\infty} e^{-x^2}\,dx = \sqrt{\pi}$$

| Expression | Formula |
| ---------- | ------- |
| [Euler's identity](https://en.wikipedia.org/wiki/Euler%27s_identity) | $$e^{i\pi} + 1 = 0$$ |
| [Quadratic formula](https://en.wikipedia.org/wiki/Quadratic_formula) | $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ |
| [Power](https://en.wikipedia.org/wiki/Exponentiation) | $$x^{2} y^{2}$$ |
| [Fraction](https://en.wikipedia.org/wiki/Fraction) | $$\frac{x + y^2}{k + 1}$$ |
| [Nested exponent](https://en.wikipedia.org/wiki/Exponentiation) | $$x + y^{\frac{2}{k + 1}}$$ |
| [Continued fraction](https://en.wikipedia.org/wiki/Continued_fraction) | $$a_0 + \cfrac{1}{a_1 + \cfrac{1}{a_2 + \cfrac{1}{a_3 + \cfrac{1}{a_4}}}}$$ |
| [Binomial coefficient](https://en.wikipedia.org/wiki/Binomial_coefficient) | $$\binom{n}{k} = \frac{n!}{k!(n-k)!}$$ |
| [Square root](https://en.wikipedia.org/wiki/Square_root) | $$\sqrt{1 + \sqrt{1 + \sqrt{1 + \cdots}}}$$ |
| [nth root](https://en.wikipedia.org/wiki/Nth_root) | $$\sqrt[3]{x^2 + y^2}$$ |
| [Summation](https://en.wikipedia.org/wiki/Summation) | $$\sum_{k=1}^{n} \frac{k^2}{k^2 + 1}$$ |
| [Product notation](https://en.wikipedia.org/wiki/Multiplication#Product_of_a_sequence) | $$\prod_{i=1}^{n} (1 + x_i)$$ |
| [Integral](https://en.wikipedia.org/wiki/Integral) | $$\int_{0}^{\infty} x^2 e^{-ax}\,dx$$ |
| [Double integral](https://en.wikipedia.org/wiki/Multiple_integral) | $$\iint_{D} (x^2 + y^2)\,dA$$ |
| [Triple integral](https://en.wikipedia.org/wiki/Multiple_integral) | $$\iiint_{V} f\,dV$$ |
| [Contour integral](https://en.wikipedia.org/wiki/Contour_integration) | $$\oint_C \vec{F} \cdot d\vec{r}$$ |
| [Limit](https://en.wikipedia.org/wiki/Limit_(mathematics)) | $$\lim_{x \to 0} \frac{\sin x}{x} = 1$$ |
| [L'Hôpital](https://en.wikipedia.org/wiki/L%27H%C3%B4pital%27s_rule) | $$\lim_{x \to 0} \frac{e^x - 1}{x} = 1$$ |
| [Taylor series](https://en.wikipedia.org/wiki/Taylor_series) | $$e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}$$ |
| [Partial derivative](https://en.wikipedia.org/wiki/Partial_derivative) | $$\frac{\partial^2 f}{\partial x \partial y}$$ |
| [Gradient](https://en.wikipedia.org/wiki/Del) | $$\nabla f = \left(\frac{\partial f}{\partial x},\, \frac{\partial f}{\partial y},\, \frac{\partial f}{\partial z}\right)$$ |
| [Greek (lowercase)](https://en.wikipedia.org/wiki/Greek_alphabet) | $$\alpha\ \beta\ \gamma\ \delta\ \varepsilon\ \zeta\ \eta\ \theta\ \iota\ \kappa\ \lambda\ \mu\ \nu\ \xi\ \pi\ \rho\ \sigma\ \tau\ \upsilon\ \phi\ \chi\ \psi\ \omega$$ |
| [Greek (uppercase)](https://en.wikipedia.org/wiki/Greek_alphabet) | $$\Gamma\ \Delta\ \Theta\ \Lambda\ \Xi\ \Pi\ \Sigma\ \Phi\ \Psi\ \Omega$$ |
| [Arrows](https://en.wikipedia.org/wiki/Arrow_(symbol)#In_mathematics) | $$f: A \rightarrow B,\quad g \Rightarrow h,\quad A \Leftrightarrow B,\quad x \mapsto x^2$$ |
| [Relations](https://en.wikipedia.org/wiki/Relation_(mathematics)) | $$a \approx b,\quad x \equiv y \pmod{n},\quad p \propto q,\quad r \sim s$$ |
| [Logic](https://en.wikipedia.org/wiki/List_of_logic_symbols) | $$\forall x\; \exists y : y > x,\quad \neg(A \wedge B) \Leftrightarrow \neg A \vee \neg B$$ |
| [Sets](https://en.wikipedia.org/wiki/Set_(mathematics)) | $$A \cup B \subseteq C,\quad A \cap B = \emptyset,\quad x \notin \mathbb{Z}$$ |
| [Diacritics](https://en.wikipedia.org/wiki/Mathematical_notation) | $$\hat{x},\quad \bar{x},\quad \vec{v},\quad \tilde{\omega},\quad \dot{q},\quad \ddot{q},\quad \overline{AB}$$ |
| [Font variants](https://en.wikipedia.org/wiki/Blackboard_bold) | $$\mathbb{R},\; \mathbb{C},\; \mathbb{Z},\; \mathbf{v},\; \mathrm{d}x,\; \mathit{f},\; \mathcal{L}$$ |
| [Text in math](https://en.wikipedia.org/wiki/Mathematical_notation) | $$f(x) = x^2 \text{ for all } x \geq 0$$ |
| [Bracket](https://en.wikipedia.org/wiki/Bracket_(mathematics)) | $$\left(\frac{a}{b}\right)^2 = \left[\frac{a^2}{b^2}\right]$$ |
| [Norm](https://en.wikipedia.org/wiki/Norm_(mathematics)) | $$\left\| \vec{v} \right\| = \sqrt{v_1^2 + v_2^2 + v_3^2}$$ |
| [Set-builder](https://en.wikipedia.org/wiki/Set-builder_notation) | $$\left\{ x \in \mathbb{R} \mid x^2 < 1 \right\}$$ |
| [2×2 matrix](https://en.wikipedia.org/wiki/Matrix_(mathematics)) | $$\begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} ax+by \\ cx+dy \end{pmatrix}$$ |
| [Identity matrix](https://en.wikipedia.org/wiki/Identity_matrix) | $$I_3 = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix}$$ |
| [Determinant](https://en.wikipedia.org/wiki/Determinant) | $$\det(A) = \begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc$$ |
| [Piecewise](https://en.wikipedia.org/wiki/Piecewise_function) | $$\left|x\right| = \begin{cases} x & x \geq 0 \\ -x & x < 0 \end{cases}$$ |
| [Subscript + superscript](https://en.wikipedia.org/wiki/Subscript_and_superscript) | $$x_i^2 + x_j^2 = r_{ij}^2$$ |
| [Function composition](https://en.wikipedia.org/wiki/Function_composition) | $$(f \circ g)(x) = f(g(x))$$ |
| [Bayes' theorem](https://en.wikipedia.org/wiki/Bayes%27_theorem) | $$P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}$$ |
| [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution) | $$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}$$ |

---

## Edge cases

### Blank lines and paragraph boundaries

One paragraph.

Two paragraph. Same section.

Third paragraph after a double blank.

### Mixed inline in one paragraph

**Bold** at start, then *italic*, then `code`, then ~~struck~~, then [a link](https://example.com "with title"), then **bold *italic* bold**, then plain end.

### Nesting bold/italic across multiple words

**this entire phrase is bold and *this part is also italic* back to just bold**.

*italic wrapping **bold words** back to italic*.

### Inline code next to punctuation

Call `foo()`, `bar`, and `baz` — note commas and em-dash.

The function `render(md: string): ReactNode` returns nodes.

### Special characters

Ampersand: a & b, angles: <not a tag>, quotes: "double" and 'single'.

HTML entity-like text: &amp; &lt; &gt; &nbsp; (rendered as literal text, not entities).

### Horizontal rules

Three hyphens:

---

Three asterisks:

***

Three underscores:

___

### Long line

This is a very long line that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on. It should wrap gracefully and not cause any layout issues. **Bold near the end** of a long line.

### Unicode

Chinese: 你好世界. Japanese: こんにちは. Arabic: مرحبا. Emoji: 🎉 🚀 ✅ ❌.

Math unicode directly: α β γ ∑ ∫ ≠ ≤ ≥ ∞ (no LaTeX, just plain unicode characters).

### Inline math edge cases

$x$ adjacent to text$y$ adjacent.

Inline with operators: $a + b - c \times d \div e$.

Subscript and superscript: $x_1^2 + x_2^2 = r^2$.

Fraction in inline: $\frac{d}{dx}\sin x = \cos x$.

### Adjacent punctuation and formatting

End of sentence **bold**. Start of next.

Comma after *italic*, then more.

Parenthetical (*italic*) and (~~struck~~).

### Empty and minimal content

Inline code: `x`.

Single char bold: **x**.

Single char italic: *x*.

Single char link: [x](https://x.com).

### Links with complex labels

[Link with `code` inside](https://example.com).

[Link with **bold** inside](https://example.com).

[A & B](https://example.com/a-and-b).

[Wikipedia: Set (mathematics)](https://en.wikipedia.org/wiki/Set_(mathematics)).

[Wikipedia: Limit (mathematics)](https://en.wikipedia.org/wiki/Limit_(mathematics)).

### Blockquote + math

> The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.
>
> And Euler's identity: $$e^{i\pi} + 1 = 0$$

### Table inside a section with other content

Before the table, a paragraph with **bold** and *italic*.

| A | B |
|---|---|
| 1 | 2 |
| 3 | 4 |

After the table, another paragraph with `code`.

### Paragraph immediately after heading (no blank line in source)
#### Tight heading
This paragraph follows the heading with no blank line.

### Multiple code fences back to back

```js
const a = 1;
```
```js
const b = 2;
```
```js
const c = 3;
```

### Code block with HTML-like content

```
<div class="example">
  <p>This is HTML inside a code block — should not be parsed.</p>
  <script>alert("xss")</script>
  &amp; &lt; &gt;
</div>
```

### Code block with markdown-like content

```
# Not a heading
**Not bold**
[Not a link](https://example.com)
$Not math$
```
