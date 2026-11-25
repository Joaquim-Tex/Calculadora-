# Calculadora

Calculadora web responsiva desenvolvida com HTML, CSS, JavaScript e Python/Flask.

## Funcionalidades

- Soma, subtração, multiplicação e divisão.
- Porcentagem e troca de sinal.
- Entrada por botões ou pelo teclado.
- Histórico das contas realizadas enquanto a página está aberta.
- Validação de entradas e aviso para divisão por zero.

O histórico fica apenas na página e é limpo ao recarregá-la.

## Requisitos

- Python 3.9 ou superior.

## Como executar

Abra o PowerShell na pasta do projeto e execute:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

Com o servidor em execução, abra no navegador:

**http://127.0.0.1:5000/**

Para encerrar o servidor, pressione `Ctrl+C` no terminal. Esse endereço é local: funciona na máquina onde o servidor está rodando e não representa uma versão hospedada publicamente.

## Como funciona

1. O Flask em `calculadora.py` exibe a página HTML e disponibiliza a rota `/api/calculadora`.
2. O JavaScript lê os valores da calculadora e envia as operações básicas à API como JSON.
3. O Python valida os valores, calcula o resultado e o devolve ao navegador. A interface atualiza o visor e o histórico.
4. Porcentagem e troca de sinal são tratadas no JavaScript. O CSS define o visual responsivo da página.
