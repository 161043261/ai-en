---
name: daisyui
description: Build, modify, review, and debug UI that uses daisyUI 5 with Tailwind CSS 4. Use this skill whenever the user mentions daisyUI, Daisy UI, Tailwind component classes, daisyUI themes, `@plugin "daisyui"`, `data-theme`, daisyUI v4 to v5 migration, or asks to create web UI specifically with daisyUI components. Also use it when converting custom markup to daisyUI class-based components or checking whether daisyUI class names and theme usage are correct.
---

# daisyUI 5

Use this skill for daisyUI 5 work in Tailwind CSS 4 projects. daisyUI is a class-based component library, so prefer composing documented daisyUI component, part, color, size, placement, behavior, modifier, and variant classes before writing custom CSS.

## Reference

The bundled reference file is the official daisyUI 5 LLM documentation:

- `llms.txt`: install notes, Tailwind CSS 4 integration, config syntax, theme syntax, color rules, and component class names.

Read `llms.txt` when the task needs exact component classes, theme configuration, migration guidance, or a component-specific API. The file is long, so search it by heading first. Useful headings include:

- `## daisyUI 5 install notes`
- `## daisyUI 5 usage rules`
- `## Config`
- `## daisyUI 5 colors`
- `## daisyUI 5 components`
- Component headings such as `### button`, `### card`, `### modal`, `### dropdown`, `### table`, `### navbar`, `### form`, `### input`, `### select`, `### drawer`, `### toast`, and `### theme-controller`

## Install And Config

For Tailwind CSS 4 projects, install daisyUI as a dependency and configure it in CSS:

```css
@import "tailwindcss";
@plugin "daisyui";
```

Do not create or rely on `tailwind.config.js` for Tailwind CSS 4-only setup unless the existing project already has a deliberate compatibility reason.

Use plugin configuration blocks for theme and class control:

```css
@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark;
  logs: false;
}
```

## Design Rules

- Start with daisyUI classes such as `btn`, `card`, `modal`, `navbar`, `menu`, `input`, `select`, `table`, `badge`, `alert`, and `drawer`.
- Add part classes and modifier classes only when the component supports them.
- Use Tailwind CSS utilities for layout and small adjustments that daisyUI does not cover.
- Avoid custom CSS selectors unless daisyUI classes plus Tailwind utilities cannot express the result.
- Use Tailwind responsive prefixes for flex and grid layouts.
- Use `!` important utilities only as a last resort for specificity conflicts.
- Use daisyUI semantic color tokens such as `primary`, `secondary`, `accent`, `neutral`, `base-*`, `info`, `success`, `warning`, and `error`.
- Avoid setting `bg-base-100 text-base-content` on `body` unless the page actually needs it.

## Workflow

1. Identify whether the project already uses Tailwind CSS 4 and daisyUI.
2. If installation or setup is needed, update dependencies and the existing global CSS entry point.
3. Read the relevant section of `llms.txt` before using unfamiliar component classes.
4. Compose UI using daisyUI component classes first, then Tailwind utilities for layout.
5. Keep HTML and JSX accessible with semantic elements, labels, roles, keyboard behavior, and focus states.
6. Verify with the project's existing build, lint, typecheck, or test commands when code was edited.

## React Usage

Use `className` in JSX and keep class strings readable:

```tsx
export function ExampleCard() {
  return (
    <article className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Course ready</h2>
        <p className="text-base-content/70">
          Continue learning with your saved progress.
        </p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Continue</button>
        </div>
      </div>
    </article>
  );
}
```

## Review Checklist

When reviewing daisyUI code, check:

- The project uses Tailwind CSS 4 plugin syntax for daisyUI.
- Component classes exist in daisyUI 5 and match the intended component.
- Theme names and `data-theme` usage are valid.
- Layout uses responsive Tailwind utilities where needed.
- Custom CSS is avoided or clearly justified.
- Accessibility is preserved for forms, dialogs, menus, navigation, and dynamic feedback.
- The implementation does not mix daisyUI v4-only assumptions into daisyUI 5 code.
