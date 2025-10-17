#!/bin/bash

echo "=========================================="
echo "Testing Flask ML API Connection"
echo "=========================================="
echo ""

# Test data for prediction
TEST_DATA='{
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

echo "Sending test prediction request to http://127.0.0.1:5000/predict"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP Status Code: $HTTP_CODE"
echo ""
echo "Response Body:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Flask API is working correctly!"
else
    echo "❌ Flask API returned unexpected status code"
    echo "Make sure your Flask app has a /predict endpoint"
fi

echo ""
echo "=========================================="
