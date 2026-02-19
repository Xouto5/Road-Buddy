# Road App — Setup Guide

This README is only for getting set up and running the app.

If you’re looking for folder structure and “where code goes”, see: **ARCHITECTURE.md**

------------------------------------

# Requirements
Install these first:
1. **Node.js (LTS)**: https://nodejs.org/
2. **Git**: https://git-scm.com/downloads
3. **Expo Go App** (for phone testing): iOS App Store/Google Play Store
! Verify this:

```bash
node -v
npm -v
git -v
```

------------------------------------

# Set your Git identity (one-time)

```bash
git config --global user.name "Your Name"
git config --global user.email "your-noreply-email@example.com"
```
Replace "Your Name" with your Github username.
Replace "your-noreply-email@example.com" with your no-reply email from Github.
! Verify this:

```bash
git config --global --list
```

------------------------------------

# Get the latest updates from MASTER BRANCH

Before doing anything else, always make sure you are synced with master.

```bash
git fetch origin
git reset --hard origin/master
git push --force-with-lease
```

Make sure you are already on your branch with `git checkout "Your Name"`
`git push --force-with-lease` Updates your branch (sync)
⚠ WARNING:
`git reset --hard` will delete any uncommitted changes (local changes) on the current branch (This is what I do, but you can just `git merge origin/master` to save local changes and latest master updates)

------------------------------------

# Switching to Your Own Branch

! NEVER work directly on master. So after creating your own branch, switch branch:

```bash
git checkout "Your Name"
```
Replace "Your Name" with your Branch name.

------------------------------------

# Install Project Dependencies (node_modules)

Installation to all required packages:

```bash
cd road-app
npm install
```
This will create the `node_modules/` folder.
If something seems broken later, run the command again.

------------------------------------

# Environment Variables (.env)

! We DO NOT commit `.env` because it may contain sensitive information.

Create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in the required values (Firebase config, etc).

⚠ DO NOT fill out `.env.example`. NEVER commit `.env`.

------------------------------------

# To start the app (Expo)

Run:

```bash
cd road-app
npx expo start
```
Then you will scan the QR code.
If there are errors, it is usually outdated packages. To fix this check if these are up to date:

```bash
node -v
npx expo --version
```

If terminal is not allowing these commands, chances are terminal is restricted. So run this:

```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then try to run the commands.
If `npx expo start` runs, you are done with the setup for this app!

------------------------------------

# Closing Message for my Dream Budddies

If you have more questions on perhaps troubleshooting, please let me know (its me jerry teehee. hope this all makes sense).