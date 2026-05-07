+++
title = "Mathematics"
weight = 3
description = "KaTeX/MathJax support example."
tags = ["math", "katex"]
categories = ["guides"]
+++

## Inline math

Einstein's equation: $E = mc^2$.

## Display math

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

## Matrix

\[
A =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\]

## Notes

The theme reads either:

- `math = true`
- `[params.math] enable = true`

Use `engine = "katex"` by default, or switch to `engine = "mathjax"` if your content needs wider TeX compatibility.
