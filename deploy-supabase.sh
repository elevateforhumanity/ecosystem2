#!/bin/bash
set -e

echo "🚀 Deploying to Supabase..."
echo "Project: cuxzzpsyufcewtmicszk"
echo ""

# Supabase connection details from supabaseClient.js
SUPABASE_URL="https://cuxzzpsyufcewtmicszk.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA"

echo "✅ Supabase instance already configured"
echo "   URL: $SUPABASE_URL"
echo ""
echo "📊 Database schema: supabase/migrations/001_initial_schema.sql"
echo "🌱 Seed data: supabase/seed.sql"
echo ""
echo "⚠️  Manual deployment required:"
echo "   1. Go to https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk"
echo "   2. Navigate to SQL Editor"
echo "   3. Run the migration file: supabase/migrations/001_initial_schema.sql"
echo "   4. Run the seed file: supabase/seed.sql"
echo ""
echo "Or use Supabase CLI with access token:"
echo "   npx supabase login"
echo "   npx supabase link --project-ref cuxzzpsyufcewtmicszk"
echo "   npx supabase db push"
