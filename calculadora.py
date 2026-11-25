from flask import Flask, render_template, jsonify, request
import math
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculadora', methods=['POST'])
def calculate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie dados JSON válidos."}), 400
    
    try:
        num1 = float(data['num1'])
        num2 = float(data['num2'])
    except (KeyError, ValueError, TypeError, OverflowError):
        return jsonify({"error": "Informe dois números válidos."}), 400
    if not math.isfinite(num1) or not math.isfinite(num2):
        return jsonify({"error": "Os números devem ser finitos."}), 400
    
    operacion = data.get('operacion')

    if operacion == "+":
        result = num1 + num2
    elif operacion == "-":
        result = num1 - num2
    elif operacion == "*":
        result = num1 * num2
    elif operacion == "/":
        if num2 == 0:
            return jsonify({"error": "Não é possível dividir por zero."}), 400
        result = num1/num2
    else:
        return jsonify({"error": "Operação inválida."}), 400
    if not math.isfinite(result):
        return jsonify({"error": "O resultado não é finito."}), 400
    return jsonify({"result": result})
if __name__ == '__main__':
    app.run(debug=True)