@echo off
echo Starting postgres container...
docker start postgres

echo Starting development server...



REM Open browser
start http://localhost:5173

cd /d "C:\Users\rodolfo25476\Documents\practice-code\personal\invoice-creator\invoice-create"




REM start the dev server (this will keep running in this window)
REM npm run dev
npm run dev

REM This will run when npm run dev exits (either normally or via Ctrl+C)
echo Stopping postgres container...
docker stop postgres