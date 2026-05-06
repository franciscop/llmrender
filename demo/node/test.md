# Markdown: Syntax

*   [Overview](#overview)
*   [Block Elements](#block-elements)
    *   [Paragraphs and Line Breaks](#paragraphs-and-line-breaks)
    *   [Headers](#headers)
    *   [Blockquotes](#blockquotes)
    *   [Lists](#lists)
    *   [Code Blocks](#code-blocks)
*   [Span Elements](#span-elements)
    *   [Links](#links)
    *   [Emphasis](#emphasis)
    *   [Code](#code)
*   [Math](#math)
*   [Code Examples](#code-examples)

----

## Overview

Markdown is intended to be as easy-to-read and easy-to-write as is feasible.

Readability, however, is emphasized above all else. A Markdown-formatted
document should be publishable as-is, as plain text, without looking
like it's been marked up with tags or formatting instructions.

## Block Elements

### Paragraphs and Line Breaks

A paragraph is simply one or more consecutive lines of text, separated
by one or more blank lines. (A blank line is any line that looks like a
blank line -- a line containing nothing but spaces or tabs is considered
blank.) Normal paragraphs should not be indented with spaces or tabs.

The implication of the "one or more consecutive lines of text" rule is
that Markdown supports "hard-wrapped" text paragraphs. This differs
significantly from most other text-to-HTML formatters (including Movable
Type's "Convert Line Breaks" option) which translate every line break
character in a paragraph into a `<br />` tag.

When you *do* want to insert a `<br />` break tag using Markdown, you
end a line with two or more spaces, then type return.

### Headers

Markdown supports two styles of headers, [Setext] [1] and [atx] [2].

Optionally, you may "close" atx-style headers. This is purely
cosmetic -- you can use this if you think it looks better. The
closing hashes don't even need to match the number of hashes
used to open the header. (The number of opening hashes
determines the header level.)


### Blockquotes

Markdown uses email-style `>` characters for blockquoting. If you're
familiar with quoting passages of text in an email message, then you
know how to create a blockquote in Markdown. It looks best if you hard
wrap the text and put a `>` before every line:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
> 
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.

Markdown allows you to be lazy and only put the `>` before the first
line of a hard-wrapped paragraph:

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
id sem consectetuer libero luctus adipiscing.

Blockquotes can be nested (i.e. a blockquote-in-a-blockquote) by
adding additional levels of `>`:

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

Blockquotes can contain other Markdown elements, including headers, lists,
and code blocks:

> ## This is a header.
> 
> 1.   This is the first list item.
> 2.   This is the second list item.
> 
> Here's some example code:
> 
>     return shell_exec("echo $input | $markdown_script");

Any decent text editor should make email-style quoting easy. For
example, with BBEdit, you can make a selection and choose Increase
Quote Level from the Text menu.


### Lists

Markdown supports ordered (numbered) and unordered (bulleted) lists.

Unordered lists use asterisks, pluses, and hyphens -- interchangably
-- as list markers:

*   Red
*   Green
*   Blue

is equivalent to:

+   Red
+   Green
+   Blue

and:

-   Red
-   Green
-   Blue

Ordered lists use numbers followed by periods:

1.  Bird
2.  McHale
3.  Parish

It's important to note that the actual numbers you use to mark the
list have no effect on the HTML output Markdown produces. The HTML
Markdown produces from the above list is:

If you instead wrote the list in Markdown like this:

1.  Bird
1.  McHale
1.  Parish

or even:

3. Bird
1. McHale
8. Parish

You'd get the exact same HTML output. The point is, if you want to,
you can use ordinal numbers in your ordered Markdown lists, so that
the numbers in your source match the numbers in your published HTML.
But if you want to be lazy, you don't have to.

To put a blockquote within a list item, the blockquote's `>`
delimiters need to be indented:

*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.

To put a code block within a list item, the code block needs
to be indented *twice* -- 8 spaces or two tabs:

*   A list item with a code block:

        <code goes here>

### Math

Inline math: $E = mc^2$ and $a^2 + b^2 = c^2$.

| Expression                 | Formula                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| Power                      | $$x^{2} y^{2}$$                                                             |
| Fraction                   | $$\frac{x + y^2}{k + 1}$$                                                   |
| Nested exponent            | $$x + y^{\frac{2}{k + 1}}$$                                                 |
| Division                   | $$\frac{a}{b/2}$$                                                           |
| Continued fraction (cfrac) | $$a_0 + \cfrac{1}{a_1 + \cfrac{1}{a_2 + \cfrac{1}{a_3 + \cfrac{1}{a_4}}}}$$ |
| Continued fraction (frac)  | $$a_0 + \frac{1}{a_1 + \frac{1}{a_2 + \frac{1}{a_3 + \frac{1}{a_4}}}}$$     |
| Binomial                   | $$\binom{n}{k/2}$$                                                          |
| Mixed binomial             | $$\binom{p}{2} x^{2y} p^{-2}$$                                              |
| Nested sqrt                | $$\sqrt{1 + \sqrt{1 + \sqrt{1 + \cdots}}}$$                                 |
| Integral with limits       | $$\int_{0}^{\infty} x^2 e^{-ax} , dx$$                                      |
| Double integral            | $$\iint_{D} (x^2 + y^2), dA$$                                               |
| Summation with conditions  | $$\sum_{k=1}^{n} \frac{k^2}{k^2 + 1}$$                                      |
| Product notation           | $$\prod_{i=1}^{n} (1 + x_i)$$                                               |
| Piecewise function         | $$f(x) = \begin{cases} x^2 & x \ge 0 \ -x & x < 0 \end{cases}$$             |
| Matrix                     | $$\begin{bmatrix} a & b \ c & d \end{bmatrix}$$                             |
| Determinant                | $$\begin{vmatrix} x & y \ z & w \end{vmatrix} = xw - yz$$                   |
| Partial derivatives        | $$\frac{\partial^2 f}{\partial x \partial y}$$                              |
| Limit expression           | $$\lim_{x \to 0} \frac{\sin x}{x}$$                                         |
| Series expansion           | $$e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}$$                                |



### Code blocks

Pre-formatted code blocks are used for writing about programming or
markup source code. Rather than forming normal paragraphs, the lines
of a code block are interpreted literally. Markdown wraps a code block
in both `<pre>` and `<code>` tags.

To produce a code block in Markdown, simply indent every line of the block by at least 4 spaces or 1 tab. Or wrap them with 3 backticks + language on the first one:

```js
class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const fns = this.#listeners.get(event);
    if (fns) this.#listeners.set(event, fns.filter(f => f !== fn));
  }

  emit(event, ...args) {
    this.#listeners.get(event)?.forEach(fn => fn(...args));
  }
}

async function fetchWithRetry(url, { retries = 3, delay = 500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay * 2 ** attempt));
    }
  }
}
```

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

async function fetchPage<T>(
  url: string,
  page: number,
  pageSize = 20,
): Promise<Result<PaginatedResponse<T>>> {
  try {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${url}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const value = await res.json() as PaginatedResponse<T>;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
```

```py
from dataclasses import dataclass, field
from typing import Iterator
import heapq


@dataclass(order=True)
class Task:
    priority: int
    name: str = field(compare=False)
    payload: dict = field(default_factory=dict, compare=False)


class PriorityQueue:
    def __init__(self) -> None:
        self._heap: list[Task] = []

    def push(self, task: Task) -> None:
        heapq.heappush(self._heap, task)

    def pop(self) -> Task:
        if not self._heap:
            raise IndexError("pop from empty queue")
        return heapq.heappop(self._heap)

    def __len__(self) -> int:
        return len(self._heap)

    def __iter__(self) -> Iterator[Task]:
        snapshot = sorted(self._heap)
        yield from snapshot


def word_frequency(text: str) -> dict[str, int]:
    freq: dict[str, int] = {}
    for word in text.lower().split():
        freq[word] = freq.get(word, 0) + 1
    return dict(sorted(freq.items(), key=lambda kv: kv[1], reverse=True))
```

```go
package cache

import (
	"sync"
	"time"
)

type entry[V any] struct {
	value     V
	expiresAt time.Time
}

type TTLCache[K comparable, V any] struct {
	mu      sync.RWMutex
	items   map[K]entry[V]
	ttl     time.Duration
}

func New[K comparable, V any](ttl time.Duration) *TTLCache[K, V] {
	return &TTLCache[K, V]{items: make(map[K]entry[V]), ttl: ttl}
}

func (c *TTLCache[K, V]) Set(key K, value V) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = entry[V]{value: value, expiresAt: time.Now().Add(c.ttl)}
}

func (c *TTLCache[K, V]) Get(key K) (V, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	e, ok := c.items[key]
	if !ok || time.Now().After(e.expiresAt) {
		var zero V
		return zero, false
	}
	return e.value, true
}

func (c *TTLCache[K, V]) Delete(key K) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}
```

```rust
use std::collections::HashMap;
use std::hash::Hash;

pub struct Graph<T> {
    edges: HashMap<T, Vec<T>>,
}

impl<T: Eq + Hash + Clone> Graph<T> {
    pub fn new() -> Self {
        Self { edges: HashMap::new() }
    }

    pub fn add_edge(&mut self, from: T, to: T) {
        self.edges.entry(from).or_default().push(to);
    }

    pub fn bfs(&self, start: &T) -> Vec<T> {
        let mut visited = vec![start.clone()];
        let mut queue = std::collections::VecDeque::from([start.clone()]);

        while let Some(node) = queue.pop_front() {
            if let Some(neighbors) = self.edges.get(&node) {
                for next in neighbors {
                    if !visited.contains(next) {
                        visited.push(next.clone());
                        queue.push_back(next.clone());
                    }
                }
            }
        }
        visited
    }

    pub fn has_cycle(&self) -> bool {
        let mut visited = HashMap::new();
        for node in self.edges.keys() {
            if self.dfs_cycle(node, &mut visited) {
                return true;
            }
        }
        false
    }

    fn dfs_cycle(&self, node: &T, visited: &mut HashMap<T, bool>) -> bool {
        match visited.get(node) {
            Some(&true) => return true,
            Some(&false) => return false,
            None => {}
        }
        visited.insert(node.clone(), true);
        if let Some(neighbors) = self.edges.get(node) {
            for next in neighbors {
                if self.dfs_cycle(next, visited) {
                    return true;
                }
            }
        }
        visited.insert(node.clone(), false);
        false
    }
}
```

```sql
WITH monthly_revenue AS (
  SELECT
    DATE_TRUNC('month', o.created_at) AS month,
    p.category,
    SUM(oi.quantity * oi.unit_price) AS revenue,
    COUNT(DISTINCT o.user_id) AS unique_buyers
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status = 'completed'
    AND o.created_at >= NOW() - INTERVAL '12 months'
  GROUP BY 1, 2
),
ranked AS (
  SELECT
    *,
    LAG(revenue) OVER (PARTITION BY category ORDER BY month) AS prev_revenue,
    RANK() OVER (PARTITION BY month ORDER BY revenue DESC) AS rank
  FROM monthly_revenue
)
SELECT
  month,
  category,
  revenue,
  unique_buyers,
  ROUND(100.0 * (revenue - prev_revenue) / NULLIF(prev_revenue, 0), 2) AS mom_growth_pct
FROM ranked
WHERE rank <= 5
ORDER BY month DESC, revenue DESC;
```

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #6366f1;
  --color-surface: #f8f8f8;
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f0f0f;
    --color-text: #e5e5e5;
    --color-surface: #1a1a1a;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.card__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25em 0.6em;
  border-radius: 999px;
  font-size: 0.75rem;
  background: var(--color-primary);
  color: #fff;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <header class="site-header">
      <nav aria-label="Main navigation">
        <a href="/" class="logo">Acme</a>
        <ul role="list">
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
    <main id="content">
      <article class="post">
        <header>
          <h1>Hello World</h1>
          <time datetime="2025-01-01">January 1, 2025</time>
        </header>
        <p>This is the first paragraph of the article.</p>
      </article>
    </main>
    <script type="module" src="/app.js"></script>
  </body>
</html>
```

```bash
#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ENV="${1:-staging}"
IMAGE_TAG="${2:-latest}"
REGISTRY="ghcr.io/acme"

log() { echo "[$(date +%H:%M:%S)] $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

[[ "$DEPLOY_ENV" =~ ^(staging|production)$ ]] \
  || die "Unknown environment: $DEPLOY_ENV"

log "Building image $REGISTRY/app:$IMAGE_TAG..."
docker build \
  --build-arg ENV="$DEPLOY_ENV" \
  --tag "$REGISTRY/app:$IMAGE_TAG" \
  --cache-from "$REGISTRY/app:latest" \
  .

log "Pushing to registry..."
docker push "$REGISTRY/app:$IMAGE_TAG"

log "Deploying to $DEPLOY_ENV..."
kubectl set image deployment/app \
  app="$REGISTRY/app:$IMAGE_TAG" \
  --namespace="$DEPLOY_ENV"

kubectl rollout status deployment/app --namespace="$DEPLOY_ENV" --timeout=120s

log "Done. $DEPLOY_ENV is running $IMAGE_TAG."
```

```json
{
  "name": "llmrender",
  "version": "1.0.0",
  "description": "A tiny Markdown renderer for React",
  "keywords": ["markdown", "react", "syntax-highlight"],
  "license": "MIT",
  "type": "module",
  "main": "./index.min.js",
  "types": "./src/index.d.ts",
  "files": ["index.min.js", "src/index.d.ts", "*.css"],
  "scripts": {
    "build": "bun build src/index.tsx --outfile index.min.js --minify --external react",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "react-test": "^1.0.0"
  }
}
```

```tsx
import { useState, useEffect, useCallback } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface PostListProps {
  userId?: number;
  pageSize?: number;
}

export function PostList({ userId, pageSize = 10 }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        _page: String(page),
        _limit: String(pageSize),
        ...(userId ? { userId: String(userId) } : {}),
      });
      const res = await fetch(`/api/posts?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Post[] = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, userId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="post-list">
      {loading && <div className="spinner" aria-label="Loading..." />}
      <ul>
        {posts.map(post => (
          <li key={post.id} className="post-item">
            <h2>{post.title}</h2>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
      <nav className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={posts.length < pageSize}>
          Next
        </button>
      </nav>
    </div>
  );
}
```

```jsx
import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(i => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <CartContext.Provider value={{ ...state, total, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
```

## Span Elements

### Links

Markdown supports two style of links: *inline* and *reference*.

In both styles, the link text is delimited by [square brackets].

To create an inline link, use a set of regular parentheses immediately
after the link text's closing square bracket. Inside the parentheses,
put the URL where you want the link to point, along with an *optional*
title for the link, surrounded in quotes. For example:

This is [an example](http://example.com/) inline link.

[This link](http://example.net/) has no title attribute.

### Emphasis

Markdown treats asterisks (`*`) and underscores (`_`) as indicators of
emphasis. Text wrapped with one `*` or `_` will be wrapped with an
HTML `<em>` tag; double `*`'s or `_`'s will be wrapped with an HTML
`<strong>` tag. E.g., this input:

*single asterisks*

_single underscores_

**double asterisks**

__double underscores__

### Code

To indicate a span of code, wrap it with backtick quotes (`` ` ``).
Unlike a pre-formatted code block, a code span indicates code within a
normal paragraph. For example:

Use the `printf()` function.

---


## Span Elements

### Links

Markdown supports two style of links: *inline* and *reference*.

In both styles, the link text is delimited by [square brackets].

To create an inline link, use a set of regular parentheses immediately
after the link text's closing square bracket. Inside the parentheses,
put the URL where you want the link to point, along with an *optional*
title for the link, surrounded in quotes. For example:

This is [an example](http://example.com/) inline link.

[This link](http://example.net/) has no title attribute.

### Emphasis

Markdown treats asterisks (`*`) and underscores (`_`) as indicators of
emphasis. Text wrapped with one `*` or `_` will be wrapped with an
HTML `<em>` tag; double `*`'s or `_`'s will be wrapped with an HTML
`<strong>` tag. E.g., this input:

*single asterisks*

_single underscores_

**double asterisks**

__double underscores__

### Code

To indicate a span of code, wrap it with backtick quotes (`` ` ``).
Unlike a pre-formatted code block, a code span indicates code within a
normal paragraph. For example:

Use the `printf()` function.

---
