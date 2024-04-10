# Этап 1: Сборка приложения
FROM maven:3.8.4-openjdk-17 AS builder
# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем файлы проекта Maven
COPY . .

# Собираем приложение с помощью Maven
RUN mvn package -B

# Этап 2: Создание образа для выполнения приложения
FROM openjdk:17-oraclelinux8

# Определяем переменные окружения
ARG APP
ENV APP_HOME=/app \
    APP_JAR="$APP.jar"

# Создаем не-root пользователя для запуска приложения
RUN useradd -m manager

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR $APP_HOME

# Копируем собранные файлы из предыдущего этапа
COPY --from=builder /usr/src/app/target/ .

# Устанавливаем права доступа для пользователя "manager"
RUN chown -R manager:manager $APP_HOME

# Переключаемся на пользователя "manager"
USER manager

# Устанавливаем точку входа (entry point) для запуска приложения
ENTRYPOINT java $JAVA_OPTS -jar "$APP_HOME/$APP_JAR"