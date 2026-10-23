from flask import Flask, render_template, jsonify, request
import math
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculadora', methods=['POST'])
def calculate():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    try:
        num1 = float(data['num1'])
        num2 = float(data['num2'])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid numbers"}), 400
    if not matg.isfinite(num1) or not math.isfinite(num2):
        return jsonify({"error": "Numbers must be finite"}), 400
    
    operacion = data['operacion']

    if operacion == "+":
        result = num1 + num2
    elif operacion == "-":
        result = num1 - num2
    elif operacion == "*":
        result = num1 * num2
    elif operacion == "/":
        if num2 == 0:
            return jsonify({"error": "You can't divide by zero"}), 400
        result = num1/num2
    else:
        return jsonify({"error": "Invalid operation"}), 400
    if not math.isfinite(result):
        return jsonify({"error": "Result is not finite"}), 400
    return jsonify({"result": result})
if __name__ == '__main__':
    app.run(debug=True)