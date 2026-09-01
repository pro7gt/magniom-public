#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo " Magniom — Local Development Environment Setup"
echo "========================================================"

if [ ! -f ".env" ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
fi

if [ ! -f "apps/web/.env.local" ]; then
  echo "📋 Creating apps/web/.env.local..."
  cp apps/web/.env.example apps/web/.env.local
fi

echo "📦 Installing Monorepo Dependencies..."
npm install

echo "🔍 Running Requirements & Boundary Checks..."
npm run verify

echo "🔨 Building Monorepo..."
npm run build

echo "🧪 Running Unit Tests..."
npm test

echo "========================================================"
echo "✅ Magniom Local Environment Ready!"
echo "Run 'npm run dev' to launch the Clinician Workspace."
echo "========================================================"
