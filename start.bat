@echo off
title PaperLens Research Agent
cd /d "%~dp0"
echo ==============================================================
echo Starting PaperLens: CS Research Agent & Architecture Visualizer
echo ==============================================================
echo Opening browser at http://localhost:5173/ ...
start http://localhost:5173/
node server.cjs
pause
