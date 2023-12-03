@echo off
cd /d "D:\Code Projects\Personal\money-tracker\server"
call pm2 start .\dist\app.js

cd /d "D:\Code Projects\Personal\money-tracker\client"
call pm2 start .\ecosystem.config.js