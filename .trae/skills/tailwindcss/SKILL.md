---
name: TailwindCSS
description: Some tailwindcss skills. Use this skill when the user asks about tailwindcss.
---

# TailwindCSS

## Using a custom palette

Use --color-\*: initial to completely disable all of the default colors and define your own custom color palette:

```css
@import "tailwindcss";
@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-purple: #3f3cbb;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
```
