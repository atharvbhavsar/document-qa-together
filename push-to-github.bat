@echo off
echo Setting up Git repository for Document Q&A Chatbot

cd /d "C:\Users\athar\OneDrive\Desktop\3 DAYS HACKATHON (3)\3 DAYS HACKATHON\document-qa-chatbot"

echo Configuring Git...
git config --global user.name "Atharv Bhavsar"
git config --global user.email "atharvbhavsar99@gmail.com"

echo Initializing Git repository...
git init

echo Adding files to Git...
git add .

echo Committing files...
git commit -m "Initial commit - Document Q&A Chatbot"

echo Setting main as default branch...
git branch -M main

echo Adding GitHub remote...
git remote add origin https://github.com/atharvbhavsar/document-qa-chatbot.git

echo Pushing to GitHub...
git push -u origin main

echo Script completed. Check for any error messages above.
pause
