# Интеграция диаграммы Ганта (DHTMLX Gantt) с Naumen Service Desk

## Описание проекта 

Веб-приложение для визуализации плановых работ (ЗНИ) на диаграмме Ганта. Система позволяет отслеживать состояние, сроки и приоритет работ по различным техцентрам и направлениям. Основной целью является контроль наложения работ и планирования.

Приложение построено с использованием:

- Java + Spring Boot (бэкенд)
- HTML/CSS/JS + библиотека [DHTMLX Gantt](https://dhtmlx.com/) (фронтенд)
- Интеграция с Naumen Service Desk для получения данных о ЗНИ

## Основной функционал

- Отображение задач на диаграмме Ганта
- Фильтрация по:
  - техцентрам
  - направлениям
  - статусам работ
  - важным работам
- Указание даты для отображения задач
- Кнопки "Сегодня", "Вчера", "Сброс"
- Выбор масштаба диаграммы: час, день, месяц
- Горизонтальная прокрутка диаграммы
- Маркер текущего времени, обновляемый каждую минуту

## Технологии

### Frontend:

- HTML5, CSS3
- JavaScript (jQuery)
- [DHTMLX Gantt](https://dhtmlx.com/)

### Backend:

- Java 17+
- Spring Boot
- REST API (POST `/update`)

### Прочее:

- JSON для обмена данными между клиентом и сервером
- Интеграция с Naumen Service Desk API (внутри Java-бэкенда)


## Работа приложения

1. При загрузке страницы отправляется POST-запрос на `/update` с текущей датой.
2. Сервер запрашивает список ЗНИ из Naumen Service Desk, фильтрует, преобразует и возвращает в формате, совместимом с DHTMLX Gantt.
3. Полученные данные отображаются в виде задач с временем начала, завершения, статусом и прочими полями.
4. Пользователь может выбрать другую дату, отфильтровать по параметрам или изменить масштаб.

## Запуск
Убедитесь, что настроено подключение к Naumen Service Desk (авторизация, URL и т.д.)

Соберите и запустите Spring Boot-приложение.

Перейдите по адресу http://localhost:8080 для доступа к интерфейсу Gantt.

## Модуль на стороне Naumen Service Desk

```
import org.hibernate.transform.AliasToEntityMapResultTransformer;
import java.util.Calendar;

//Автор: dshemyakin
//Дата создания: 27.04.2024
//Назначение:
/**
 * Бекенд для встроенного приложения Диаграмма Ганта
*/
//Категория: Скрипты для встроенного приложения



//МЕТОДЫ---------------------------------------------------------------

/**
 * Логирует сообщение
 * @param msg сообщение
 * @param level уровень логирования
 * @param exception исключение (для отображения стектрейса)
 */
def log(def msg, def level = 'info', def exception = null)
{
    logger."$level"("BPA-702> $msg", exception)
}

/**
 * Получение значения по коду из requestContent
 * @param requestContent запрос c параметрами
 * @param code из request
 * @param toLower указывает, нужно ли преобразовать значение к нижнему регистру перед возвратом
 */
def getSafe(def requestContent, def code, def toLower = false){
  def value = null;
  if(requestContent.containsKey(code)){
    value = requestContent.get(code);
    if(value && value instanceof String && toLower){
      value = value.toLowerCase();
    }
  }
  return value;
}


/**
 * Возвращает все ЗНИ по переданному в requestContent параметру 'days'
 * @param requestContent запрос c параметрами
 */
def dataServiceCallChg(def requestContent){
  def daysCode = getSafe(requestContent, 'days');
  
  if(daysCode != null){    
    def date = utils.formatters.strToDate(daysCode);
    
        // Определение начала дня
    Calendar calStart = Calendar.getInstance();
    calStart.setTime(date);
    calStart.set(Calendar.HOUR_OF_DAY, 0);
    calStart.set(Calendar.MINUTE, 0);
    calStart.set(Calendar.SECOND, 0);
    calStart.set(Calendar.MILLISECOND, 0);
    def startOfDay = calStart.getTime();
    
    // Определение конца дня
    Calendar calEnd = Calendar.getInstance();
    calEnd.setTime(date);
    calEnd.set(Calendar.HOUR_OF_DAY, 23);
    calEnd.set(Calendar.MINUTE, 59);
    calEnd.set(Calendar.SECOND, 59);
    calEnd.set(Calendar.MILLISECOND, 999);
    def endOfDay = calEnd.getTime();
    
    def chgHQL = api.db.query("""
        SELECT cast(chg.id AS string) as id, chg.title as name, chg.state as state, 
        chg.dateStartWork as dateStart, chg.dateEndWork as dateEnd, priority.title.ru as priority,
        chg.theme as theme, techDirections.title as techDirections, techCenters.title as techCenter
        FROM serviceCall\$chg chg
        LEFT JOIN chg.techDirections techDirections
        LEFT JOIN chg.techCenters techCenters
        LEFT JOIN chg.urgency priority
        WHERE (chg.dateStartWork <= :endOfDay AND chg.dateEndWork >= :startOfDay)
        ORDER BY chg.registrationDate DESC
    """)
    .set('startOfDay', startOfDay)
    .set('endOfDay', endOfDay)
    .hq.setResultTransformer(AliasToEntityMapResultTransformer.INSTANCE).list();
    
    return groovy.json.JsonOutput.toJson(chgHQL);  
  }else{
    return groovy.json.JsonOutput.toJson('exeption');  
  }
}

```

## Возможные улучшения
1. Выгрузка в Excel/PDF
2. Интеграция с календарями
3. Уведомления при наложении работ

## Лицензия
Внутренний корпоративный проект.

## Интерфейс
![photo_2024-04-04_13-06-30](https://github.com/user-attachments/assets/1c689dd5-d04c-441c-b91e-0f44d089d29e)


## Пример формата получения данных от Naumen Service Desk

```json
{
  "id": 123,
  "text": "Замена оборудования",
  "start_date": "2025-06-21T08:00:00",
  "end_date": "2025-06-21T12:00:00",
  "state": "Согласован",
  "techCenter": "Екатеринбургский центр",
  "techDirections": "Ю-З",
  "priority": "Высокий"
}

