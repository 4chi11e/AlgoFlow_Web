const nodeDefinitions = {
  input: {
    label: "Input",
    shapeClass: "flow-node-input",
    dialogTitle: "Input Properties",
    description: "Legge un valore dall'utente e lo salva in una variabile.",
    fieldLabel: "Inserisci il nome della variabile:",
    placeholder: "variabile",
  },
  output: {
    label: "Output",
    shapeClass: "flow-node-output",
    dialogTitle: "Output Properties",
    description: "Mostra un testo formattato. Usa {nomeVariabile} per inserire variabili nel messaggio.",
    fieldLabel: "Inserisci il testo da mostrare:",
    placeholder: "",
  },
  declare: {
    label: "Declare",
    shapeClass: "flow-node-declare",
    dialogTitle: "Declare Properties",
    description: "Crea variabili o array da usare durante l'esecuzione del programma.",
    fieldLabel: "Inserisci la dichiarazione:",
    placeholder: "nome variabile",
  },
  assign: {
    label: "Assign",
    shapeClass: "flow-node-assign",
    dialogTitle: "Assign Properties",
    description: "Assegna un valore a una variabile esistente.",
    fieldLabel: "Inserisci l'assegnazione:",
    placeholder: "variabile = espressione oppure variabile += espressione",
  },
  if: {
    label: "If",
    shapeClass: "flow-node-if",
    dialogTitle: "If Properties",
    description: "Valuta una condizione e dirige il flusso in base al risultato.",
    fieldLabel: "Inserisci la condizione:",
    placeholder: "condizione",
  },
  call: {
    label: "Call",
    shapeClass: "flow-node-call",
    dialogTitle: "Call Properties",
    description: "Richiama una funzione o una procedura definita altrove.",
    fieldLabel: "Inserisci il nome della chiamata:",
    placeholder: "chiamata",
  },
  while: {
    label: "While",
    shapeClass: "flow-node-while",
    dialogTitle: "While Properties",
    description: "Ripete il blocco finché la condizione resta vera.",
    fieldLabel: "Inserisci la condizione del ciclo:",
    placeholder: "condizione",
  },
  for: {
    label: "For",
    shapeClass: "flow-node-for",
    dialogTitle: "For Properties",
    description: "Ripete il blocco usando un contatore e un intervallo definito.",
    fieldLabel: "Inserisci il controllo del ciclo:",
    placeholder: "i = 0 to 10",
  },
  do: {
    label: "Do-While",
    shapeClass: "flow-node-do",
    dialogTitle: "Do-While Properties",
    description: "Esegue il blocco almeno una volta prima di valutare la condizione.",
    fieldLabel: "Inserisci la condizione del ciclo:",
    placeholder: "condizione",
  },
  comment: {
    label: "Comment",
    shapeClass: "flow-node-comment",
    dialogTitle: "Comment Properties",
    description: "Aggiunge un commento descrittivo al diagramma.",
    fieldLabel: "Inserisci il commento:",
    placeholder: "commento",
  },
};

const flowNodes = [];
const structuredNodeBranchLabels = {
  if: {
    falseBranch: "False",
    trueBranch: "True",
  },
  while: {
    body: "True",
    exit: "False",
  },
  for: {
    body: "Next",
    exit: "Done",
  },
  do: {
    body: "True",
    exit: "False",
  },
};
