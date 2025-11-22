from flask import Flask, jsonify, request, render_template
import json, os, tempfile

app = Flask(__name__)
DATA_DIR = "data"

FRANCHISES = {
    "skylanders": "skylanders.json",
    "infinity": "infinity.json",
    "dimensions": "dimensions.json"
}

ACTIVE_FILE = os.path.join(DATA_DIR, "active.json")

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def save_json(filename, data):
    path = os.path.join(DATA_DIR, filename)
    fd, tmp = tempfile.mkstemp(dir=DATA_DIR)
    with os.fdopen(fd, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, path)

def load_active():
    if not os.path.exists(ACTIVE_FILE):
        return {}
    with open(ACTIVE_FILE, "r") as f:
        return json.load(f)

def save_active(active):
    fd, tmp = tempfile.mkstemp(dir=DATA_DIR)
    with os.fdopen(fd, "w") as f:
        json.dump(active, f, indent=2)
    os.replace(tmp, ACTIVE_FILE)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/<franchise>", methods=["GET"])
def list_items(franchise):
    if franchise not in FRANCHISES:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    return jsonify(load_json(FRANCHISES[franchise]))

@app.route("/<franchise>/add", methods=["POST"])
def add_item(franchise):
    if franchise not in FRANCHISES:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    items = load_json(FRANCHISES[franchise])
    new_item = request.json
    items.append(new_item)
    save_json(FRANCHISES[franchise], items)
    return jsonify({"status": "ok", "items": items})

@app.route("/<franchise>/swap", methods=["POST"])
def swap_item(franchise):
    if franchise not in FRANCHISES:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    items = load_json(FRANCHISES[franchise])
    payload = request.json  # expects {"id": ..., "new": {...}}
    for i, item in enumerate(items):
        if item.get("id") == payload.get("id"):
            items[i] = payload["new"]
            save_json(FRANCHISES[franchise], items)
            return jsonify({"status": "ok", "items": items})
    return jsonify({"status": "error", "message": "Item not found"}), 404

@app.route("/active/set", methods=["POST"])
def set_active():
    payload = request.json  # {"franchise": "skylanders", "id": 1}
    franchise = payload.get("franchise")
    target_id = payload.get("id")
    if franchise not in FRANCHISES:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    items = load_json(FRANCHISES[franchise])
    if not any(it.get("id") == target_id for it in items):
        return jsonify({"status": "error", "message": "ID not found"}), 404
    save_active({"franchise": franchise, "id": target_id})
    return jsonify({"status": "ok", "active": {"franchise": franchise, "id": target_id}})

@app.route("/active", methods=["GET"])
def get_active():
    return jsonify(load_active())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
