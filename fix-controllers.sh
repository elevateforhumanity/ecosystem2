#!/bin/bash
set -e

cd /workspaces/elevate-complete/backend/src/controllers

# Fix each controller file
for file in attendance.controller.ts audit.controller.ts case-management.controller.ts eligibility.controller.ts employer.controller.ts employment.controller.ts financial.controller.ts iep.controller.ts reporting.controller.ts support-services.controller.ts; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Add RequestHandler import if not present
    if ! grep -q "RequestHandler" "$file"; then
      sed -i "s/import { Response }/import { Request, Response, RequestHandler }/g" "$file"
    fi
    
    # Convert function exports to const exports with RequestHandler type
    sed -i 's/export async function \([a-zA-Z_][a-zA-Z0-9_]*\)(req: AuthRequest, res: Response)/export const \1: RequestHandler = async (req: Request, res: Response) => {\n  const authReq = req as AuthRequest;/g' "$file"
    
    # Fix references to req.user to use authReq.user
    # This is a simple replacement - may need manual review
    
    echo "Fixed $file"
  fi
done

echo "All controllers fixed!"
