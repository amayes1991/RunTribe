#!/bin/bash

# Replace with your actual Railway URL
# Get it from Railway Dashboard → runners-app → Settings → Domains
API_URL="${1:-https://your-railway-app.railway.app}"

echo "🧪 Testing Railway API: $API_URL"
echo ""

echo "1️⃣ Testing /weatherforecast endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/weatherforecast")
if [ "$response" = "200" ]; then
    echo "✅ Success! API is responding (Status: $response)"
    echo "Response preview:"
    curl -s "$API_URL/weatherforecast" | head -c 300
    echo ""
else
    echo "❌ Failed with status code: $response"
    echo "Full response:"
    curl -s "$API_URL/weatherforecast"
fi

echo ""
echo "2️⃣ Testing /swagger endpoint..."
swagger_response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/swagger")
if [ "$swagger_response" = "200" ]; then
    echo "✅ Swagger is available at: $API_URL/swagger"
else
    echo "⚠️  Swagger not available (status: $swagger_response)"
fi

echo ""
echo "3️⃣ Testing CORS headers..."
cors_headers=$(curl -s -I -H "Origin: https://runtribe.vercel.app" "$API_URL/weatherforecast" | grep -i "access-control")
if [ -n "$cors_headers" ]; then
    echo "✅ CORS headers present:"
    echo "$cors_headers"
else
    echo "⚠️  No CORS headers found - you may need to configure CORS in Railway"
fi

echo ""
echo "✅ Test complete!"
