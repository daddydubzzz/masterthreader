#!/bin/bash

# MasterThreader API Testing Script
# Tests all critical API endpoints for recursion and learning

echo "🚀 MasterThreader API Testing Suite"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract body (all but last line)
    body=$(echo "$response" | head -n -1 2>/dev/null || echo "$response")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $status_code"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Pretty print JSON if it's valid
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "Response preview:"
            echo "$body" | jq -C . | head -10
        else
            echo "Response: $body"
        fi
    else
        echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $status_code"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Check if server is running
echo -e "\n${YELLOW}Checking if server is running...${NC}"
if ! curl -s "$BASE_URL" >/dev/null; then
    echo -e "${RED}❌ Server not running at $BASE_URL${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Test 1: Thread Generation
test_api "Thread Generation" "POST" "/api/generate" '{
    "script": "Test script for API testing - productivity tips for developers",
    "megaPromptVersion": "v1.0"
}' "200"

# Test 2: Pattern Analysis
test_api "Pattern Analysis" "GET" "/api/analyze-patterns" "" "200"

# Test 3: Vector Capture (Edit Storage)
test_api "Vector Capture" "POST" "/api/capture-edit" '{
    "original_tweet": "Original tweet text for testing",
    "annotation": "This could be improved by adding more specificity",
    "final_edit": "Improved tweet text with specific examples and better clarity",
    "quality_rating": 4,
    "script_title": "API Test Script"
}' "200"

# Test 4: Recursion Process
test_api "Recursion Process" "POST" "/api/recursion" '{
    "originalScript": "Test script for recursion - productivity tips for developers",
    "threads": [
        {
            "id": "test-1",
            "content": "Original thread content that needs improvement",
            "edits": [
                {
                    "id": "edit-1",
                    "originalText": "Original thread content that needs improvement",
                    "editedText": "Improved content with better clarity",
                    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
                }
            ],
            "annotations": [
                {
                    "id": "annotation-1",
                    "text": "Make this more engaging",
                    "type": "improvement",
                    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
                }
            ]
        }
    ],
    "megaPromptVersion": "v1.0"
}' "200"

# Test 5: Invalid Requests (Error Handling)
echo -e "\n${YELLOW}Testing Error Handling...${NC}"

test_api "Invalid Generation Request" "POST" "/api/generate" '{
    "invalid": "data"
}' "400"

test_api "Invalid Recursion Request" "POST" "/api/recursion" '{
    "threads": []
}' "400"

# Summary
echo -e "\n${BLUE}===================${NC}"
echo -e "${BLUE}Test Results Summary${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! API is ready for production.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the API implementation.${NC}"
    exit 1
fi 