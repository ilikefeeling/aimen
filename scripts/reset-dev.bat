@echo off
echo Resetting Next.js Environment...
taskkill /F /IM node.exe /T
del /S /Q .next\dev\lock
rd /S /Q .next
echo Done. You can now run 'npm run dev' safely.
