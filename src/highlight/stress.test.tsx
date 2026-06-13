import $ from "react-test";
import highlight from "./highlight";

// Each test feeds a realistic multi-token snippet and asserts the overall
// token mix looks right — not just "keyword exists" but the right count and
// coexistence with strings, numbers, operators, etc.

describe("JS/TS stress", () => {
  const src = `
async function fetchUser(id: number): Promise<User> {
  const BASE_URL = "https://api.example.com";
  // validate
  if (id <= 0) throw new Error(\`Invalid id: \${id}\`);
  const res = await fetch(\`\${BASE_URL}/users/\${id}\`);
  if (!res.ok) return null;
  const data = await res.json();
  return { ...data, fetchedAt: Date.now() };
}
`.trim();

  it("finds multiple keywords", () => {
    const el = $(<div>{highlight(src, "ts")}</div>);
    const kws = [...el.find(".keyword")].map((n) => n.textContent);
    for (const kw of [
      "async",
      "function",
      "const",
      "if",
      "return",
      "await",
      "new",
      "null",
    ]) {
      expect(kws).toContain(kw);
    }
  });

  it("finds strings", () => {
    const el = $(<div>{highlight(src, "ts")}</div>);
    expect(el.find(".string").length).toBeGreaterThanOrEqual(1);
  });

  it("finds comment", () => {
    const el = $(<div>{highlight(src, "ts")}</div>);
    expect(el.find(".comment").text()).toContain("validate");
  });

  it("finds numbers", () => {
    const el = $(<div>{highlight(src, "ts")}</div>);
    expect(el.find(".number").length).toBeGreaterThanOrEqual(1);
  });

  it("finds operators", () => {
    const el = $(<div>{highlight(src, "ts")}</div>);
    expect(el.find(".operator").length).toBeGreaterThanOrEqual(3);
  });

  it("finds function calls", () => {
    const el = $(<div>{highlight(src, "ts")}</div>);
    const fns = [...el.find(".function")].map((n) => n.textContent);
    expect(fns).toContain("fetch");
  });

  it("finds type names", () => {
    const el = $(<div>{highlight(src, "ts")}</div>);
    const types = [...el.find(".type")].map((n) => n.textContent);
    expect(types).toContain("Promise");
    expect(types).toContain("Error");
  });
});

describe("Python stress", () => {
  const src = `
@dataclass
class Vector:
    x: float
    y: float

    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    @staticmethod
    def dot(a: "Vector", b: "Vector") -> float:
        # inner product
        return a.x * b.x + a.y * b.y

v1 = Vector(1.0, 2.5)
v2 = Vector(-3.0, 0.0)
result = Vector.dot(v1, v2)
assert result == -3.0, f"expected -3.0, got {result}"
`.trim();

  it("finds keywords", () => {
    const el = $(<div>{highlight(src, "py")}</div>);
    const kws = [...el.find(".keyword")].map((n) => n.textContent);
    for (const kw of ["class", "def", "return", "assert", "self"]) {
      expect(kws).toContain(kw);
    }
  });

  it("finds decorators as keywords", () => {
    const el = $(<div>{highlight(src, "py")}</div>);
    const kws = [...el.find(".keyword")].map((n) => n.textContent);
    expect(kws).toContain("@dataclass");
    expect(kws).toContain("@staticmethod");
  });

  it("finds strings", () => {
    const el = $(<div>{highlight(src, "py")}</div>);
    expect(el.find(".string").length).toBeGreaterThanOrEqual(2);
  });

  it("finds comment", () => {
    const el = $(<div>{highlight(src, "py")}</div>);
    expect(el.find(".comment").text()).toContain("inner product");
  });

  it("finds numbers including floats", () => {
    const el = $(<div>{highlight(src, "py")}</div>);
    const nums = [...el.find(".number")].map((n) => n.textContent);
    expect(nums).toContain("1.0");
    expect(nums).toContain("2.5");
  });

  it("finds class and function names as types/functions", () => {
    const el = $(<div>{highlight(src, "py")}</div>);
    const types = [...el.find(".type")].map((n) => n.textContent);
    expect(types).toContain("Vector");
  });
});

describe("Rust stress", () => {
  const src = `
#[derive(Debug, Clone)]
pub struct Matrix<T> {
    rows: usize,
    cols: usize,
    data: Vec<T>,
}

impl<T: Copy + Default> Matrix<T> {
    pub fn new(rows: usize, cols: usize) -> Self {
        Self { rows, cols, data: vec![T::default(); rows * cols] }
    }

    pub fn get(&self, r: usize, c: usize) -> T {
        let idx = r * self.cols + c;
        self.data[idx]
    }
}

fn main() {
    let m: Matrix<f64> = Matrix::new(3, 4);
    println!("{:?}", m.get(2, 1));
}
`.trim();

  it("finds keywords", () => {
    const el = $(<div>{highlight(src, "rust")}</div>);
    const kws = [...el.find(".keyword")].map((n) => n.textContent);
    for (const kw of ["pub", "struct", "impl", "fn", "let", "self", "usize"]) {
      expect(kws.some((k) => k?.includes(kw))).toBe(true);
    }
  });

  it("finds attribute opener", () => {
    const el = $(<div>{highlight(src, "rust")}</div>);
    const kws = [...el.find(".keyword")].map((n) => n.textContent);
    expect(kws.some((k) => k?.includes("#["))).toBe(true);
  });

  it("finds type names", () => {
    const el = $(<div>{highlight(src, "rust")}</div>);
    const types = [...el.find(".type")].map((n) => n.textContent);
    expect(types).toContain("Matrix");
    expect(types).toContain("Self");
    expect(types).toContain("Vec");
  });

  it("finds numbers", () => {
    const el = $(<div>{highlight(src, "rust")}</div>);
    expect(el.find(".number").length).toBeGreaterThanOrEqual(1);
  });
});

describe("SQL stress", () => {
  const src = `
-- monthly revenue by region
SELECT
  r.name        AS region,
  DATE_TRUNC('month', o.created_at) AS month,
  COUNT(*)      AS orders,
  SUM(o.total)  AS revenue
FROM orders o
JOIN regions r ON r.id = o.region_id
WHERE o.status = 'completed'
  AND o.created_at >= '2024-01-01'
GROUP BY r.name, month
HAVING SUM(o.total) > 10000
ORDER BY month DESC, revenue DESC
LIMIT 100;
`.trim();

  it("finds SQL keywords", () => {
    const el = $(<div>{highlight(src, "sql")}</div>);
    const kws = [...el.find(".keyword")].map((n) =>
      n.textContent?.toUpperCase(),
    );
    for (const kw of [
      "SELECT",
      "FROM",
      "JOIN",
      "WHERE",
      "GROUP",
      "HAVING",
      "ORDER",
      "LIMIT",
    ]) {
      expect(kws.some((k) => k?.includes(kw))).toBe(true);
    }
  });

  it("finds strings", () => {
    const el = $(<div>{highlight(src, "sql")}</div>);
    const strs = [...el.find(".string")].map((n) => n.textContent);
    expect(strs).toContain("'completed'");
    expect(strs).toContain("'month'");
  });

  it("finds comment", () => {
    const el = $(<div>{highlight(src, "sql")}</div>);
    expect(el.find(".comment").text()).toContain("monthly revenue");
  });

  it("finds numbers", () => {
    const el = $(<div>{highlight(src, "sql")}</div>);
    const nums = [...el.find(".number")].map((n) => n.textContent);
    expect(nums).toContain("10000");
    expect(nums).toContain("100");
  });

  it("finds function calls", () => {
    const el = $(<div>{highlight(src, "sql")}</div>);
    const fns = [...el.find(".function")].map((n) => n.textContent);
    expect(fns.some((f) => f?.includes("COUNT") || f?.includes("SUM"))).toBe(
      true,
    );
  });
});

describe("diff stress", () => {
  const src = `
@@ -12,7 +12,9 @@ export function parseInline(text: string): ReactNode[] {
   const parts: ReactNode[] = [];
-  let remaining = text;
+  let remaining = text.trim();
+  let offset = 0;
   while (remaining.length > 0) {
-    const m = PATTERN.exec(remaining);
+    const m = ACTIVE.exec(remaining);
     if (!m) break;
`.trim();

  it("marks added lines as .string", () => {
    const el = $(<div>{highlight(src, "diff")}</div>);
    const additions = [...el.find(".string")].map((n) => n.textContent);
    expect(additions.some((a) => a?.includes("+  let remaining"))).toBe(true);
  });

  it("marks removed lines as .keyword", () => {
    const el = $(<div>{highlight(src, "diff")}</div>);
    const deletions = [...el.find(".keyword")].map((n) => n.textContent);
    expect(deletions.some((d) => d?.includes("-  let remaining"))).toBe(true);
  });

  it("marks hunk header as .comment", () => {
    const el = $(<div>{highlight(src, "diff")}</div>);
    expect(el.find(".comment").text()).toContain("@@");
  });

  it("has more additions than deletions", () => {
    const el = $(<div>{highlight(src, "diff")}</div>);
    expect(el.find(".string").length).toBeGreaterThan(
      el.find(".keyword").length,
    );
  });
});

describe("CSS stress", () => {
  const src = `
:root {
  --primary: #3b82f6;
  --radius: 0.5rem;
}

.card:hover > .card__body {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .card { padding: 1rem; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`.trim();

  it("finds at-rules as keywords", () => {
    const el = $(<div>{highlight(src, "css")}</div>);
    const kws = [...el.find(".keyword")].map((n) => n.textContent);
    expect(kws.some((k) => k?.includes("@media"))).toBe(true);
    expect(kws.some((k) => k?.includes("@keyframes"))).toBe(true);
  });

  it("finds selectors as types", () => {
    const el = $(<div>{highlight(src, "css")}</div>);
    const types = [...el.find(".type")].map((n) => n.textContent);
    expect(types.some((t) => t?.includes(".card"))).toBe(true);
  });

  it("finds property names as functions", () => {
    const el = $(<div>{highlight(src, "css")}</div>);
    const props = [...el.find(".function")].map((n) => n.textContent);
    expect(props.some((p) => p?.includes("transform"))).toBe(true);
  });

  it("finds hex and unit numbers", () => {
    const el = $(<div>{highlight(src, "css")}</div>);
    const nums = [...el.find(".number")].map((n) => n.textContent);
    expect(nums.some((n) => n?.includes("0.5rem"))).toBe(true);
    expect(nums.some((n) => n?.includes("768px"))).toBe(true);
  });
});
