# app.py
from flask import Flask, jsonify, request, render_template
import json, os, tempfile

app = Flask(__name__)
DATA_DIR = "data"

FRANCHISES = {
    "dimensions": "dimensions_charactermap.json",
    "skylanders": "skylanders.json",
    "infinity":   "infinity.json",
}

ACTIVE_FILE = os.path.join(DATA_DIR, "active.json")  # {"franchise": "skylanders", "id": 1}

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def save_json(filename, data):
    # Atomic write to avoid corruption on Pi Zero
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

def get_file(franchise):
    fname = FRANCHISES.get(franchise)
    if not fname:
        return None
    return fname

# ----- Generic routes -----

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/<franchise>", methods=["GET"])
def list_items(franchise):
    fname = get_file(franchise)
    if not fname:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    return jsonify(load_json(fname))

@app.route("/<franchise>/add", methods=["POST"])
def add_item(franchise):
    fname = get_file(franchise)
    if not fname:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    items = load_json(fname)
    new_item = request.json
    # Minimal validation
    if not isinstance(new_item, dict) or "id" not in new_item or "name" not in new_item:
        return jsonify({"status": "error", "message": "Invalid payload"}), 400
    # Prevent duplicate IDs
    if any(it.get("id") == new_item["id"] for it in items):
        return jsonify({"status": "error", "message": "ID already exists"}), 409
    items.append(new_item)
    save_json(fname, items)
    return jsonify({"status": "ok", "items": items})

@app.route("/<franchise>/swap", methods=["POST"])
def swap_item(franchise):
    fname = get_file(franchise)
    if not fname:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    items = load_json(fname)
    payload = request.json  # {"id": ..., "new": {...}}
    target_id = payload.get("id")
    new_obj = payload.get("new")
    if target_id is None or not isinstance(new_obj, dict):
        return jsonify({"status": "error", "message": "Invalid payload"}), 400
    for i, item in enumerate(items):
        if item.get("id") == target_id:
            items[i] = new_obj
            save_json(fname, items)
            return jsonify({"status": "ok", "items": items})
    return jsonify({"status": "error", "message": "Item not found"}), 404

@app.route("/active/set", methods=["POST"])
def set_active():
    payload = request.json  # {"franchise": "skylanders", "id": 1}
    franchise = payload.get("franchise")
    target_id = payload.get("id")
    fname = get_file(franchise)
    if not fname:
        return jsonify({"status": "error", "message": "Unknown franchise"}), 404
    items = load_json(fname)
    if not any(it.get("id") == target_id for it in items):
        return jsonify({"status": "error", "message": "ID not found"}), 404
    save_active({"franchise": franchise, "id": target_id})
    return jsonify({"status": "ok", "active": {"franchise": franchise, "id": target_id}})

@app.route("/active", methods=["GET"])
def get_active():
    return jsonify(load_active())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
