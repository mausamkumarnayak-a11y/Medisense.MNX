#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=================================================="
echo "  MediSense Production Build for Render"
echo "=================================================="

echo "--> Installing frontend dependencies and building bundle..."
cd frontend
npm install
npm run build
cd ..

echo "--> Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "=================================================="
echo "  MediSense Build Completed Successfully!"
echo "=================================================="
