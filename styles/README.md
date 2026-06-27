# AlgoFlow styles layout

`index.html` loads these files directly during development.
`node build-single-file.js` inlines them into `build/algoflow.html` for distribution.

## Files

- `tokens.css`: design tokens and base page styles.
- `topbar.css`: app header and primary controls.
- `workspace.css`: panels, canvas container, tabs, focus mode.
- `diagram.css`: flowchart nodes, connectors, SVG diagram styling.
- `dialogs.css`: insert and property dialogs.
- `code-preview.css`: generated-code view.
- `sidebar-terminal.css`: variables table and terminal output.
- `theme-dark.css`: dark theme overrides.
- `console-input.css`: terminal input form.
- `responsive.css`: media-query driven layout changes.

Keep component-specific styles close to their feature file. Add tokens only
when a value is reused across more than one area.
