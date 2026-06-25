# AlgoFlow source layout

`index.html` loads these files directly during development.
`node build-single-file.js` inlines them into `build/algoflow.html` for distribution.

## Boundaries

- `app/`: application state, bootstrapping, persistence, history, preferences.
- `diagram/`: flowchart node definitions, model operations, validation, editing actions.
- `runtime/`: program execution, expression handling, runtime panels.
- `codegen/`: source-code generation for supported languages.
- `io/`: file picker integration and import/export formats.
- `render/`: diagram, SVG, code preview, and variables rendering.
- `ui/`: DOM references, layout, dialogs, selection, and event bindings.
- `shared/`: small cross-cutting utilities that do not belong to a feature area.

The current code still shares one browser scope because the
legacy implementation used globals heavily. Keep new logic inside the most
specific feature folder, and prefer pure functions that receive their inputs
explicitly. That makes future conversion to ES modules straightforward.
