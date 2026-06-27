const renderVariablesPanel = () => {
  if (!variablesBody) {
    return;
  }

  const variables = runtimeState?.variableMeta ?? collectRuntimeVariableMeta();

  if (variables.size === 0) {
    variablesBody.innerHTML = `
      <div class="table-row muted">
        <span>Nessuna variabile</span>
        <span>-</span>
        <span>-</span>
      </div>
    `;
    return;
  }

  variablesBody.innerHTML = Array.from(variables.values())
    .map(
      (variable) => {
        const runtimeValue = runtimeState?.variableValues.get(variable.name);

        return `
        <div class="table-row">
          <span>${escapeHtml(variable.name)}</span>
          <span>${escapeHtml(variable.typeLabel)}</span>
          <span>${escapeHtml(runtimeState ? formatRuntimeValue(runtimeValue) : "")}</span>
        </div>
      `;
      }
    )
    .join("");
};
