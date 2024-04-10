# Этап 1: Сборка приложения
FROM maven:3.8.4-openjdk-17 AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем файлы проекта Maven
COPY . .

# Собираем приложение с помощью Maven
RUN mvn clean package -DskipTests

# Этап 2: Создание образа для выполнения приложения
FROM openjdk:17-oraclelinux8

# Определяем переменные окружения
ENV APP_HOME=/app
ENV APP_JAR=target/*.jar

# Создаем не-root пользователя для запуска приложения
RUN useradd -m manager

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR $APP_HOME

# Копируем собранный JAR файл из предыдущего этапа
COPY --from=builder /usr/src/app/$APP_JAR .

# Устанавливаем права доступа для пользователя "manager"
RUN chown -R manager:manager $APP_HOME

# Переключаемся на пользователя "manager"
USER manager

# Устанавливаем точку входа (entry point) для запуска приложения
ENTRYPOINT ["java", "-jar", "arena_gantt.jar"]
