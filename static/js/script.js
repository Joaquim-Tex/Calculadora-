const display = document.getElementById("resultado");
const expression = document.getElementById("expressao");
const keypad = document.querySelector(".teclado");
const statusMessage = document.getElementById("calculadora-status");
const historyList = document.getElementById("lista-historico");
const emptyHistoryMessage = document.getElementById("historico-vazio");
const displayHistory = document.getElementById("visor-historico");

const operationSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 12,
  useGrouping: false,
});

let currentInput = "0";
let previousValue = null;
let selectedOperation = null;
let waitingForOperand = false;
let isCalculating = false;

function setStatus(message, state = "normal") {
  statusMessage.textContent = message;
  statusMessage.dataset.estado = state;
}

function parseInput() {
  const normalized = currentInput.replace(",", ".").replace(/\.$/, "");
  return Number(normalized);
}

function formatNumber(value) {
  return numberFormatter.format(value);
}

function updateDisplay() {
  display.textContent = currentInput;
}

function countDigits(value) {
  return value.replace(/\D/g, "").length;
}

function enterDigit(digit) {
  if (waitingForOperand) {
    currentInput = digit;
    waitingForOperand = false;
  } else if (currentInput === "0") {
    currentInput = digit;
  } else if (currentInput === "-0") {
    currentInput = `-${digit}`;
  } else if (countDigits(currentInput) < 15) {
    currentInput += digit;
  }

  updateDisplay();
  setStatus("Use os botões ou o teclado para calcular.");
}

function enterDecimal() {
  if (waitingForOperand) {
    currentInput = "0,";
    waitingForOperand = false;
  } else if (!currentInput.includes(",")) {
    currentInput += ",";
  }

  updateDisplay();
}

function clearCalculator() {
  currentInput = "0";
  previousValue = null;
  selectedOperation = null;
  waitingForOperand = false;
  expression.textContent = "";
  updateDisplay();
  setStatus("Use os botões ou o teclado para calcular.");
}

function backspace() {
  if (waitingForOperand) {
    currentInput = "0";
    waitingForOperand = false;
  } else {
    currentInput = currentInput.slice(0, -1);
    if (currentInput === "" || currentInput === "-") {
      currentInput = "0";
    }
  }

  updateDisplay();
}

function toggleSign() {
  if (waitingForOperand) {
    currentInput = "0";
    waitingForOperand = false;
  }

  currentInput = currentInput.startsWith("-")
    ? currentInput.slice(1)
    : `-${currentInput}`;
  updateDisplay();
}

function applyPercentage() {
  if (waitingForOperand) {
    return;
  }

  const value = parseInput();
  const isRelativePercentage =
    previousValue !== null &&
    (selectedOperation === "+" || selectedOperation === "-");
  const percentage = isRelativePercentage
    ? (previousValue * value) / 100
    : value / 100;

  currentInput = formatNumber(percentage);
  waitingForOperand = false;
  updateDisplay();
}

function setCalculating(calculating) {
  isCalculating = calculating;
  keypad.querySelectorAll("button").forEach((button) => {
    button.disabled = calculating;
  });
}

function addToHistory(calculation, result) {
  const item = document.createElement("li");
  const calculationText = document.createElement("span");
  const resultText = document.createElement("strong");

  calculationText.textContent = calculation;
  resultText.textContent = result;
  item.append(calculationText, resultText);
  historyList.prepend(item);

  while (historyList.children.length > 5) {
    historyList.lastElementChild.remove();
  }

  emptyHistoryMessage.hidden = true;

  const displayItem = document.createElement("div");
  displayItem.textContent = `${calculation} = ${result}`;
  displayHistory.prepend(displayItem);
  while (displayHistory.children.length > 2) {
    displayHistory.lastElementChild.remove();
  }
}

function calculateInBrowser(firstNumber, secondNumber, operation) {
  let result;

  if (operation === "+") {
    result = firstNumber + secondNumber;
  } else if (operation === "-") {
    result = firstNumber - secondNumber;
  } else if (operation === "*") {
    result = firstNumber * secondNumber;
  } else if (operation === "/") {
    if (secondNumber === 0) {
      throw new Error("Não é possível dividir por zero.");
    }
    result = firstNumber / secondNumber;
  } else {
    throw new Error("Operação inválida.");
  }

  if (!Number.isFinite(result)) {
    throw new Error("O resultado não é finito.");
  }

  return result;
}

async function calculate() {
  if (
    selectedOperation === null ||
    previousValue === null ||
    waitingForOperand ||
    isCalculating
  ) {
    return false;
  }

  const firstNumber = previousValue;
  const secondNumber = parseInput();
  const operation = selectedOperation;
  const calculation = `${formatNumber(firstNumber)} ${operationSymbols[operation]} ${formatNumber(secondNumber)}`;

  setCalculating(true);
  setStatus("Calculando...");

  try {
    let result;
    if (document.body.dataset.calculationMode === "static") {
      result = calculateInBrowser(firstNumber, secondNumber, operation);
    } else {
      const response = await fetch("/api/calculadora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num1: firstNumber,
          num2: secondNumber,
          operacion: operation,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível realizar o cálculo.");
      }
      result = data.result;
    }

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("O servidor retornou um resultado inválido.");
    }

    currentInput = formatNumber(result);
    expression.textContent = `${calculation} =`;
    addToHistory(calculation, currentInput);
    previousValue = null;
    selectedOperation = null;
    waitingForOperand = true;
    updateDisplay();
    setStatus("Cálculo concluído.");
    return true;
  } catch (error) {
    setStatus(error.message || "Não foi possível conectar ao servidor.", "erro");
    return false;
  } finally {
    setCalculating(false);
  }
}

async function chooseOperation(operation) {
  if (isCalculating) {
    return;
  }

  if (selectedOperation !== null && !waitingForOperand) {
    const completed = await calculate();
    if (!completed) {
      return;
    }
  }

  previousValue = parseInput();
  selectedOperation = operation;
  waitingForOperand = true;
  expression.textContent = `${formatNumber(previousValue)} ${operationSymbols[operation]}`;
}

function initializeCalculator() {
  currentInput = "0";
  expression.textContent = "";
  display.textContent = currentInput;
  historyList.replaceChildren();
  displayHistory.replaceChildren();
  emptyHistoryMessage.hidden = false;
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || isCalculating) {
    return;
  }

  const { valor, operador, acao } = button.dataset;

  if (valor !== undefined) {
    if (valor === ".") {
      enterDecimal();
    } else {
      enterDigit(valor);
    }
  } else if (operador !== undefined) {
    chooseOperation(operador);
  } else if (acao === "limpar") {
    clearCalculator();
  } else if (acao === "apagar") {
    backspace();
  } else if (acao === "porcentagem") {
    applyPercentage();
  } else if (acao === "trocar-sinal") {
    toggleSign();
  } else if (acao === "igual") {
    calculate();
  }
});

document.addEventListener("keydown", (event) => {
  if (isCalculating) {
    return;
  }

  if (/^[0-9]$/.test(event.key)) {
    enterDigit(event.key);
  } else if (event.key === "." || event.key === ",") {
    enterDecimal();
  } else if (Object.hasOwn(operationSymbols, event.key)) {
    chooseOperation(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (event.key === "Escape") {
    clearCalculator();
  } else if (event.key === "%") {
    applyPercentage();
  }
});

initializeCalculator();
