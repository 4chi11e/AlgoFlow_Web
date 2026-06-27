const renderVariablesPanel = () => {
  if (!variablesBody) {
    return;
  }

  const variables = runtimeState?.variableMeta ?? collectRuntimeVariableMeta();
  const rows = Array.from(variables.values()).map((variable) => ({
    name: variable.name,
    typeLabel: variable.typeLabel,
    value: runtimeState ? formatRuntimeValue(runtimeState.variableValues.get(variable.name)) : "",
  }));
  const renderSignature = JSON.stringify(rows);

  if (variablesBody.dataset.renderSignature === renderSignature) {
    return;
  }

  variablesBody.dataset.renderSignature = renderSignature;

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

  variablesBody.innerHTML = rows
    .map(
      (variable) => {
        return `
        <div class="table-row">
          <span>${escapeHtml(variable.name)}</span>
          <span>${escapeHtml(variable.typeLabel)}</span>
          <span>${escapeHtml(variable.value)}</span>
        </div>
      `;
      }
    )
    .join("");
};
