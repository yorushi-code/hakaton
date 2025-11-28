#!/usr/bin/env bash
set -e

# Имя корневой папки (можно передать первым аргументом; по умолчанию dice-roller-app)
PROJECT_DIR="${1:-dice-roller-app}"

mkdir -p "$PROJECT_DIR"/{server,public/{css,js}}

# Файлы в server/
touch "$PROJECT_DIR"/server/index.js
touch "$PROJECT_DIR"/server/gameRooms.js
touch "$PROJECT_DIR"/server/package.json

# Файлы в public/
touch "$PROJECT_DIR"/public/index.html
touch "$PROJECT_DIR"/public/game.html
touch "$PROJECT_DIR"/public/about.html
touch "$PROJECT_DIR"/public/css/styles.css
touch "$PROJECT_DIR"/public/js/main.js
touch "$PROJECT_DIR"/public/js/gameLogic.js
touch "$PROJECT_DIR"/public/js/socketClient.js

# README
touch "$PROJECT_DIR"/README.md

echo "Структура проекта создана в: $PROJECT_DIR"
