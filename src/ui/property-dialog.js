const openPropertyDialog = (nodeId) => {
  if (isProgramRunning) {
    return;
  }

  const node = findNodeById(nodeId);

  if (!node) {
    return;
  }

  const definition = getNodeDefinition(node.type);
  editingNodeId = nodeId;

  hidePropertyError();
  propertyDialogTitle.textContent = definition.dialogTitle;
  propertyDescription.textContent = definition.description;
  propertyFieldLabel.textContent = definition.fieldLabel;
  propertyInput.placeholder = definition.placeholder;
  propertyInput.value = node.value;
  propertyPreview.innerHTML = `<div class="flowchart-node ${definition.shapeClass}">${escapeHtml(definition.label)}</div>`;
  const isDeclare = node.type === "declare";
  const isAssign = node.type === "assign";
  const isFor = node.type === "for";
  const isOutput = node.type === "output";
  const isLongText = node.type === "output" || node.type === "comment";

  genericPropertyField.hidden = isDeclare || isFor || isOutput;
  genericPropertyField.classList.toggle("is-output", isLongText);
  propertyInput.dataset.autosize = String(isLongText);
  declareFields.hidden = !isDeclare;
  forFields.hidden = !isFor;
  if (outputFields) {
    outputFields.hidden = !isOutput;
  }
  mountAssignSuggestions();

  if (isAssign) {
    renderAssignSuggestions(propertyInput.value);
  } else if (isFor) {
    renderAssignSuggestions(forVariableInput.value);
  } else {
    hideAssignSuggestions();
  }

  if (isDeclare) {
    const declareConfig = node.declareConfig ?? {
      names: node.value
        ? node.value.split(",").map((name) => name.trim()).filter(Boolean)
        : [],
      dataType: "Integer",
      isArray: false,
      arrayLength: null,
    };

    declareNameInput.value = declareConfig.names.join(", ");
    declareArrayInput.checked = Boolean(declareConfig.isArray);
    if (declareArrayLengthField) {
      declareArrayLengthField.hidden = !declareConfig.isArray;
    }
    if (declareArrayLengthInput) {
      declareArrayLengthInput.value = declareConfig.isArray && Number.isInteger(declareConfig.arrayLength)
        ? String(declareConfig.arrayLength)
        : "";
    }
    declareTypeInputs.forEach((input) => {
      input.checked = input.value === declareConfig.dataType;
    });
  }

  if (isFor) {
    const forConfig = node.forConfig ?? {
      variable: "",
      start: "",
      end: "",
      step: "",
      includeEnd: true,
    };

    forVariableInput.value = forConfig.variable;
    forStartInput.value = forConfig.start;
    forEndInput.value = forConfig.end;
    forStepInput.value = forConfig.step;
    if (forIncludeEndInput) {
      forIncludeEndInput.checked = forConfig.includeEnd !== false;
    }
  }

  if (isOutput && outputNewlineInput) {
    outputNewlineInput.checked = node.outputConfig?.appendNewline !== false;
  }

  if (outputQuotedPreview) {
    outputQuotedPreview.hidden = !isOutput;
  }

  if (isOutput) {
    syncOutputQuotedPreview();
  }

  propertyDialogBackdrop.hidden = false;
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    syncPropertyInputSize();

    if (isDeclare) {
      declareNameInput.focus();
      declareNameInput.select();
    } else if (isFor) {
      forVariableInput.focus();
      forVariableInput.select();
    } else if (isOutput) {
      focusOutputQuotedEditorAtEnd();
    } else {
      propertyInput.focus();
      propertyInput.select();
    }
  });
};

const closePropertyDialog = ({ restoreFocus = true } = {}) => {
  propertyDialogBackdrop.hidden = true;

  if (!insertDialogBackdrop.hidden) {
    return;
  }

  document.body.style.overflow = "";

  if (restoreFocus && lastConnectorButton && typeof lastConnectorButton.focus === "function") {
    lastConnectorButton.focus();
  }
};
