@echo off
echo Setting up Git repository for Document Q&A Chatbot

echo Checking if Git is installed...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Please install Git from https://git-scm.com/downloads
    echo After installation, run this script again.
    pause
    exit /b
)

echo Git is installed. Proceeding...

echo Please enter your GitHub username:
set /p GITHUB_USERNAME=

echo Please enter your name for Git config:
set /p GIT_NAME=

echo Please enter your email for Git config:
set /p GIT_EMAIL=

echo Configuring Git...
git config --global user.name "%GIT_NAME%"
git config --global user.email "%GIT_EMAIL%"

echo Initializing Git repository...
git init

echo Adding files to Git...
git add .

echo Committing files...
git commit -m "Initial commit - Document Q&A Chatbot"

echo Setting main as default branch...
git branch -M main

echo Adding GitHub remote...
git remote add origin https://github.com/%GITHUB_USERNAME%/document-qa-chatbot.git

echo Ready to push to GitHub!
echo Before continuing, please make sure you have:
echo 1. Created a repository named 'document-qa-chatbot' on GitHub
echo 2. Have your GitHub credentials ready

echo Press any key to push to GitHub or Ctrl+C to cancel...
pause >nul

echo Pushing to GitHub...
git push -u origin main

echo Setup complete! Your repository should now be available at:
echo https://github.com/%GITHUB_USERNAME%/document-qa-chatbot
echo If you encountered any errors during the push, you might need to authenticate with GitHub.

pause
