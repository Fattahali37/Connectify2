# Flask ML API Troubleshooting Guide

## Current Issue

Your Flask API is running but returning:
```json
{"error":"Model not loaded properly"}
```

This means the ML model file is missing or failed to load.

## ✅ What's Working

- ✅ Flask server is running
- ✅ Ngrok tunnel is active: `https://exosmotic-israel-intercostally.ngrok-free.dev`
- ✅ Backend can connect to Flask API
- ✅ `/predict` endpoint exists

## ❌ What Needs Fixing

Your Flask app needs to successfully load the ML model file.

## 🔧 Common Solutions

### 1. Check Your Flask App Code

Your Flask `app.py` (or main file) should have something like:

```python
import pickle
import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the model
try:
    model = joblib.load('model.pkl')  # or pickle.load()
    print("[INFO] Model loaded successfully")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded properly"}), 500
    
    try:
        data = request.get_json()
        
        # Extract features in correct order
        features = [
            data.get('profile pic', 0),
            data.get('nums/length username', 0),
            data.get('fullname words', 0),
            data.get('nums/length fullname', 0),
            data.get('name==username', 0),
            data.get('description length', 0),
            data.get('external URL', 0),
            data.get('private', 0),
            data.get('#posts', 0),
            data.get('#followers', 0),
            data.get('#following', 0)
        ]
        
        # Make prediction
        prediction = model.predict([features])[0]
        probabilities = model.predict_proba([features])[0]
        
        return jsonify({
            "prediction": {
                "is_fake": int(prediction),
                "status": "fake" if prediction == 1 else "real"
            },
            "confidence": {
                "real_profile_prob": float(probabilities[0]),
                "fake_profile_prob": float(probabilities[1])
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
```

### 2. Verify Model File Exists

Check if your model file is in the Flask app directory:

```bash
ls -la model.pkl
# or
ls -la model.joblib
# or whatever your model filename is
```

### 3. Check Model Loading Error

Look at your Flask console output when it starts. It should show:
```
[INFO] Model and features loaded successfully.
```

If it shows an error, that's what needs to be fixed.

### 4. Common Model Loading Issues

**Issue A: File Not Found**
```python
# Make sure the path is correct
import os
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
model = joblib.load(model_path)
```

**Issue B: Missing Dependencies**
```bash
pip install scikit-learn joblib pandas numpy
```

**Issue C: Wrong Loading Method**
```python
# Try different loading methods
import pickle
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

# OR
import joblib
model = joblib.load('model.pkl')
```

**Issue D: Model Version Mismatch**
Make sure scikit-learn version matches the one used to save the model:
```bash
pip list | grep scikit-learn
```

## 🧪 Test Your Flask API Directly

### Test 1: Check if model loaded
```bash
curl https://exosmotic-israel-intercostally.ngrok-free.dev/ \
  -H "ngrok-skip-browser-warning: true"
```

### Test 2: Test prediction endpoint
```bash
curl -X POST https://exosmotic-israel-intercostally.ngrok-free.dev/predict \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "profile pic": 1,
    "nums/length username": 0.1,
    "fullname words": 2,
    "nums/length fullname": 0,
    "name==username": 0,
    "description length": 50,
    "external URL": 1,
    "private": 0,
    "#posts": 25,
    "#followers": 150,
    "#following": 100
  }'
```

Expected successful response:
```json
{
  "prediction": {
    "is_fake": 0,
    "status": "real"
  },
  "confidence": {
    "real_profile_prob": 0.8766,
    "fake_profile_prob": 0.1234
  }
}
```

## 🔄 After Fixing

1. Restart your Flask app
2. Check the console output for "[INFO] Model loaded successfully"
3. Test the endpoint using curl command above
4. If successful, try clicking "Verify" in the admin dashboard

## 📋 Checklist

- [ ] Flask app code loads model correctly
- [ ] Model file exists in the correct location
- [ ] Required Python packages installed
- [ ] Model loads without errors on startup
- [ ] `/predict` endpoint returns predictions (not errors)
- [ ] Ngrok tunnel is active
- [ ] Backend `.env` has correct `FLASK_API_URL`

## 💡 Quick Fix (Mock Response for Testing)

If you need to test the UI while fixing the model, temporarily add this to your Flask app:

```python
@app.route('/predict', methods=['POST'])
def predict():
    # Mock response for testing UI
    return jsonify({
        "prediction": {
            "is_fake": 0,
            "status": "real"
        },
        "confidence": {
            "real_profile_prob": 0.85,
            "fake_profile_prob": 0.15
        }
    })
```

This will let you test the integration while you fix the actual model loading.

---

## 🆘 Need More Help?

Share the following information:
1. Flask app startup console output
2. Model file location and name
3. Python version: `python --version`
4. Installed packages: `pip list | grep -E "sklearn|joblib|pandas|numpy"`
