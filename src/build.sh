#!/bin/bash

# Переменная для имени образа
IMAGE_NAME="arena_gantt"

# Переменная для пути к каталогу с Dockerfile
DOCKERFILE_DIR="src"

# Проверяем наличие Dockerfile
if [ ! -f "$DOCKERFILE_DIR/Dockerfile" ]; then
  echo "Ошибка: Dockerfile не найден в каталоге $DOCKERFILE_DIR"
  exit 1
fi

# Сборка Docker-образа
docker build -t $IMAGE_NAME $DOCKERFILE_DIR
