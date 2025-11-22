from flask import Flask, jsonify, request, render_template
import json, os

app = Flask(__name__)

DATA_DIR = "data"

def load_data(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def save_data(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

# --- Disney Infinity ---
@app.route("/infinity", methods=["GET"])
def get_infinity():
    return jsonify(load_data("infinity.json"))

@app.route("/infinity/add", methods=["POST"])
def add_infinity():
    figures = load_data("infinity.json")
    figures.append(request.json)
    save_data("infinity.json", figures)
    return jsonify({"status": "ok", "figures": figures})

@app.route("/infinity/swap", methods=["POST"])
def swap_infinity():
    figures = load_data("infinity.json")
    swap_data = request.json
    for i, fig in enumerate(figures):
        if fig["id"] == swap_data["id"]:
            figures[i] = swap_data["new"]
            save_data("infinity.json", figures)
            return jsonify({"status": "ok", "figures": figures})
    return jsonify({"status": "error", "message": "Figure not found"}), 404

# --- Skylanders ---
@app.route("/skylanders", methods=["GET"])
def get_skylanders():
    return jsonify(load_data("skylanders.json"))

@app.route("/skylanders/add", methods=["POST"])
def add_skylanders():
    figures = load_data("skylanders.json")
    figures.append(request.json)
    save_data("skylanders.json", figures)
    return jsonify({"status": "ok", "figures": figures})

@app.route("/skylanders/swap", methods=["POST"])
def swap_skylanders():
    figures = load_data("skylanders.json")
    swap_data = request.json
    for i, fig in enumerate(figures):
        if fig["id"] == swap_data["id"]:
            figures[i] = swap_data["new"]
            save_data("skylanders.json", figures)
            return jsonify({"status": "ok", "figures": figures})
    return jsonify({"status": "error", "message": "Figure not found"}), 404

# --- LEGO Dimensions ---
@app.route("/dimensions", methods=["GET"])
def get_dimensions():
    return jsonify(load_data("dimensions.json"))

@app.route("/dimensions/add", methods=["POST"])
def add_dimensions():
    figures = load_data("dimensions.json")
    figures.append(request.json)
    save_data("dimensions.json", figures)
    return jsonify({"status": "ok", "figures": figures})

@app.route("/dimensions/swap", methods=["POST"])
def swap_dimensions():
    figures = load_data("dimensions.json")
    swap_data = request.json
    for i, fig in enumerate(figures):
        if fig["id"] == swap_data["id"]:
            figures[i] = swap_data["new"]
            save_data("dimensions.json", figures)
            return jsonify({"status": "ok", "figures": figures})
    return jsonify({"status": "error", "message": "Figure not found"}), 404

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
