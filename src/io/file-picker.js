const getSuggestedDiagramFileName = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return `diagram-${datePart}${ALGOFLOW_FILE_EXTENSION}`;
};

const getSuggestedPdfFileName = () => getSuggestedDiagramFileName().replace(/\.algoflow\.json$/i, ALGOFLOW_PDF_EXTENSION);

const openAlgoFlowPickerDatabase = () =>
  new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(ALGOFLOW_PICKER_DB_NAME, 1);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(ALGOFLOW_PICKER_STORE_NAME)) {
        database.createObjectStore(ALGOFLOW_PICKER_STORE_NAME);
      }
    });

    request.addEventListener("success", () => {
      resolve(request.result);
    });

    request.addEventListener("error", () => {
      reject(request.error ?? new Error("Impossibile aprire il database dei file picker."));
    });
  });

const loadLastAlgoFlowPickerHandle = async () => {
  const database = await openAlgoFlowPickerDatabase();

  if (!database) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ALGOFLOW_PICKER_STORE_NAME, "readonly");
    const store = transaction.objectStore(ALGOFLOW_PICKER_STORE_NAME);
    const request = store.get(ALGOFLOW_PICKER_HANDLE_KEY);

    request.addEventListener("success", () => {
      resolve(request.result ?? null);
      database.close();
    });

    request.addEventListener("error", () => {
      database.close();
      reject(request.error ?? new Error("Impossibile leggere l'ultima posizione usata."));
    });
  });
};

const saveLastAlgoFlowPickerHandle = async (handle) => {
  if (!handle) {
    return;
  }

  const database = await openAlgoFlowPickerDatabase();

  if (!database) {
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ALGOFLOW_PICKER_STORE_NAME, "readwrite");
    const store = transaction.objectStore(ALGOFLOW_PICKER_STORE_NAME);
    const request = store.put(handle, ALGOFLOW_PICKER_HANDLE_KEY);

    request.addEventListener("success", () => {
      resolve();
    });

    request.addEventListener("error", () => {
      reject(request.error ?? new Error("Impossibile salvare l'ultima posizione usata."));
    });

    transaction.addEventListener("complete", () => {
      database.close();
    });

    transaction.addEventListener("error", () => {
      database.close();
    });

    transaction.addEventListener("abort", () => {
      database.close();
    });
  });
};

const buildAlgoFlowPickerOptions = async () => {
  const options = {
    id: ALGOFLOW_FILE_PICKER_ID,
    types: [
      {
        description: "AlgoFlow JSON",
        accept: {
          "application/json": [ALGOFLOW_FILE_EXTENSION, ".json"],
        },
      },
    ],
  };

  const lastHandle = await loadLastAlgoFlowPickerHandle().catch(() => null);

  if (lastHandle) {
    options.startIn = lastHandle;
  } else {
    options.startIn = "downloads";
  }

  return options;
};

const buildAlgoFlowSavePickerOptions = async () => {
  const options = await buildAlgoFlowPickerOptions();

  options.types = [
    {
      description: "AlgoFlow JSON",
      accept: {
        "application/json": [ALGOFLOW_FILE_EXTENSION, ".json"],
      },
    },
    {
      description: "Flowgorithm FPRG",
      accept: {
        "application/xml": [FLOWGORITHM_FILE_EXTENSION],
        "text/xml": [FLOWGORITHM_FILE_EXTENSION],
      },
    },
    {
      description: "PDF con diagramma AlgoFlow",
      accept: {
        "application/pdf": [ALGOFLOW_PDF_EXTENSION],
      },
    },
  ];

  return options;
};

const buildAlgoFlowImportPickerOptions = async () => {
  const options = await buildAlgoFlowPickerOptions();

  options.types = [
    {
      description: "Diagrammi AlgoFlow",
      accept: {
        "application/json": [ALGOFLOW_FILE_EXTENSION, ".json"],
        "application/pdf": [ALGOFLOW_PDF_EXTENSION],
        "application/xml": [FLOWGORITHM_FILE_EXTENSION],
        "text/xml": [FLOWGORITHM_FILE_EXTENSION],
      },
    },
  ];

  return options;
};
