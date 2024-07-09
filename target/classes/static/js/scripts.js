$(document).ready(function() {
    gantt.plugins({
        marker: true
    });

    var currentTimeMarkerId = null; // Переменная для хранения идентификатора маркера текущего времени
    var currentTimeIntervalId = null; // Переменная для хранения идентификатора интервала обновления маркера

// Функция для добавления вертикальной линии текущего времени
    function addCurrentTimeLine() {
        // Удаляем существующую линию текущего времени, если она есть
        if (currentTimeMarkerId !== null) {
            gantt.deleteMarker(currentTimeMarkerId);
            currentTimeMarkerId = null; // Сбрасываем идентификатор маркера
        }

        var currentTime = new Date();
        var dateToStr = gantt.date.date_to_str(gantt.config.task_date);

        // Создаем новую линию текущего времени
        currentTimeMarkerId = gantt.addMarker({
            start_date: currentTime,
            css: "current-time-line",
            text: "<div class='current-time-indicator'></div><div class='current-time-label'>" + currentTime.getHours() + ":" + (currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes()) + "</div>",
            title: dateToStr(currentTime)
        });

        // Устанавливаем интервал для обновления маркера каждую минуту, если он еще не установлен
        if (!currentTimeIntervalId) {
            currentTimeIntervalId = setInterval(function () {
                var today = gantt.getMarker(currentTimeMarkerId);
                today.start_date = new Date();
                today.title = dateToStr(today.start_date);
                gantt.updateMarker(currentTimeMarkerId);
            }, 1000 * 60); // Обновление каждую минуту
        }
    }


    var stateMapping = {
        "registered": "Планирование",
        "verification": "Верификация",
        "negotiation": "На согласовании",
        "accepted": "Согласован",
        "inprogress": "В работе",
        "resumed": "На приемке",
        "postponed": "Отложен",
        "resolved": "Завершен",
        "closed": "Закрыт"
    };

    gantt.init("gantt-chart");

 // Функция для загрузки данных по указанной дате
    function loadData(date) {
        var requestData = {
            days: date
        }; // Формируем объект с данными для отправки на сервер

        // Показываем спиннер перед отправкой запроса
        $('#spinner-container').show();

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/update",
            data: JSON.stringify(requestData), // Преобразуем данные в формат JSON
            dataType: 'json',
            success: function(response) {
                // Скрываем спиннер после получения ответа
                $('#spinner-container').hide();

                if (response.length > 0) {
                    // Преобразование данных из JSON в формат задач для Gantt
                    var tasks = response.map(function(item, index) {
                        return {
                            id: item.id,
                            text: item.name,
                            start_date: new Date(item.dateStart),
                            end_date: new Date(item.dateEnd),
                            task_height: 30,
                            techDirections: item.techDirections,
                            theme: item.theme,
                            state: stateMapping[item.state] || item.state,
                            techCenter: item.techCenter,
                            priority: item.priority
                        };
                    });

                    // Инициализация и отрисовка диаграммы Gantt
                    gantt.clearAll();
                    gantt.init("gantt-chart");
                    gantt.parse({data: tasks});
                    addCurrentTimeLine();
                    // Определяем дату для прокрутки
                    var scrollDate = date ? new Date(date) : new Date();
                    gantt.showDate(scrollDate); // Прокручиваем диаграмму к указанной или текущей дате
                } else {
                    // Если ответ пустой, очищаем диаграмму
                    gantt.clearAll();
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
                // Скрываем спиннер в случае ошибки
                $('#spinner-container').hide();
                // Выводим ошибку в диалоговое окно
                showDialog("Error! Failed to load data", "Произошла ошибка при получении данных из CRM. Повторите попытку позже");
            }
        });
    }

    function showDialog(title, message) {
        alert(title + ": " + message);
    }



    // Отправляем запрос с текущей датой при загрузке страницы
    var currentDate = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате YYYY-MM-DD
    loadData(currentDate);
    // Заполняем поле с датой текущей датой
    $('#dateInput').val(currentDate);


    // Добавляем обработчик события "change" для поля ввода даты
    $('#dateInput').change(function() {
        var selectedDate = $(this).val(); // Получаем выбранную дату
        loadData(selectedDate); // Отправляем POST запрос с выбранной датой
    });

    // // Обработчик события для кнопки "Обновить"
    // $('#updateForm').submit(function(event) {
    //     event.preventDefault(); // Предотвращаем отправку формы по умолчанию
    //     var formData = {
    //         date: $('#dateInput').val(),
    //     };
    //
    //     loadData(formData.date);
    // });

    // Обработчик события для кнопки "Сбросить"
    $('#resetDate').click(function() {
        var currentDate = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате YYYY-MM-DD
        $('#dateInput').val(currentDate); // Устанавливаем текущую дату в поле ввода
        $('#dropdown1').val('1'); // Сбрасываем выбранное значение dropdown1
        $('#dropdown2').val('1'); // Сбрасываем выбранное значение dropdown2
        $('#dropdown3').val('1'); // Сбрасываем выбранное значение dropdown2
        $('#importantTasksCheckbox').prop('checked', false); // Сбрасываем состояние чекбокса

        loadData(currentDate);
    });

// Флаг для отслеживания добавления вертикальной линии текущего времени
    var currentTimeLineAdded = false;

// Обработчик события для кнопки "Сегодня"
    $('#todayButton').click(function(event) {
        event.preventDefault(); // Предотвращаем переход по ссылке
        var currentDate = new Date().toISOString().split('T')[0];
        $('#dateInput').val(currentDate); // Устанавливаем в поле ввода дату вчерашнего дня
        loadData(currentDate);
        // Проверяем, была ли уже добавлена вертикальная линия текущего времени
        if (!currentTimeLineAdded) {
            addCurrentTimeLine(); // Добавляем вертикальную линию только если она еще не была добавлена
            currentTimeLineAdded = true; // Устанавливаем флаг в true, чтобы указать, что линия уже была добавлена
        }
    });

// Обработчик события для кнопки "Вчера"
    $('#yesterdayButton').click(function(event) {
        event.preventDefault(); // Предотвращаем переход по ссылке
        var currentDate = new Date(); // Получаем текущую дату
        currentDate.setDate(currentDate.getDate() - 1); // Устанавливаем значение на один день назад
        var formattedDate = currentDate.toISOString().split('T')[0]; // Преобразуем в строку в формате YYYY-MM-DD
        $('#dateInput').val(formattedDate); // Устанавливаем в поле ввода дату вчерашнего дня
        loadData(formattedDate); // Загружаем данные для вчерашней даты
    });



    // Обработчик события для двойного клика на таск
    gantt.attachEvent("onTaskDblClick", function(id, e) {
        var task = gantt.getTask(id);
        if (task) {
            window.open("https://arena-test.motivtelecom.ru/sd/operator/#uuid:serviceCall$" + id, "_blank");
        }
    });

    // Настройки DHTMLX Gantt
    gantt.plugins({marker: true});
    gantt.config.scale_unit = "hour"; // Единица времени - час
    gantt.config.date_scale = "%H:%i"; // Формат даты на шкале (часы:минуты)
    gantt.config.scale_height = 50; // Высота шкалы
    gantt.config.show_progress = false; // Отключаем отображение прогресса задачи
    gantt.config.readonly = true; // Диаграмма только в режиме чтения
    gantt.config.subscales = [
        {unit: "day", step: 1, date: "%d.%m"} // Добавляем дополнительные метки времени над главной шкалой
    ];

    // Настройка столбцов слева от диаграммы
    gantt.config.columns = [
        { name: "text", label: "Номер", tree: true, width: 200 },
        { name: "start_date", label: "Начало", align: "center", width: 150, template: function(task) {
                return task.start_date.toLocaleString();
            }},
        { name: "end_date", label: "Конец", align: "center", width: 150, template: function(task) {
                return task.end_date.toLocaleString();
            }}
    ];

    gantt.attachEvent("onBeforeTaskDisplay", function(id, task) {
        var centerFilter = $('#dropdown1').val();
        var directionFilter = $('#dropdown2').val();
        var statusFilter = $('#dropdown3').val();
        var showImportantOnly = $('#importantTasksCheckbox').is(':checked');

        var statusFilterMapping = stateMapping[statusFilter] || statusFilter;

        // Проверяем, соответствует ли задача выбранным фильтрам
        var matchesFilter = (centerFilter === "1" || task.techCenter === centerFilter) &&
            (directionFilter === "1" || task.techDirections === directionFilter) &&
            (statusFilter === "1" || task.state === statusFilterMapping);

        // Если выбран фильтр для показа только важных работ,
        // то задачи с приоритетом Наивысшая должны быть видимы
        if (showImportantOnly) {
            matchesFilter = matchesFilter && (task.priority === "Наивысшая");
        }

        return matchesFilter;
    });


    // Функция для фильтрации задач при изменении значений фильтров
    function filterTasks() {
        gantt.render();
    }

    // Обработчик события изменения чекбокс
    $('#importantTasksCheckbox').change(function() {
        filterTasks();
    });

    // Обработчик события изменения значения в dropdown1
    $('#dropdown1').change(function() {
        filterTasks();
    });

    // Обработчик события изменения значения в dropdown2
    $('#dropdown2').change(function() {
        filterTasks();
    });

    // Обработчик события изменения значения в dropdown3
    $('#dropdown3').change(function() {
        filterTasks();
    });

// Функция для изменения сетки диаграммы Gantt в зависимости от выбора пользователя
    function changeGridScale(scale) {
        switch (scale) {
            case "hour":
                gantt.config.scale_unit = "hour"; // Единица времени - час
                gantt.config.date_scale = "%H:%i"; // Формат даты на шкале (часы:минуты)
                gantt.config.subscales = [
                    { unit: "day", step: 1, date: "%d.%m" }
                ];
                break;
            case "day":
                gantt.config.scale_unit = "day";
                gantt.config.date_scale = "%d.%m"; // Формат даты на шкале (день месяца месяц)
                gantt.config.subscales = [
                    { unit: "month", step: 1, date: "%M" }
                ];
                break;
            case "month":
                gantt.config.scale_unit = "month";
                gantt.config.date_scale = "%M"; // Формат даты на шкале (месяц год)
                gantt.config.subscales = [
                    { unit: "year", step: 1, date: "%Y" }
                ];
                break;
            default:
                break;
        }
        gantt.render(); // Перерисовываем диаграмму с новыми настройками сетки
    }


// Обработчик события выбора значения в выпадающем списке или радиокнопках
    $('#gridScaleSelect').change(function() {
        var selectedScale = $(this).val(); // Получаем выбранный пользователем период сетки
        changeGridScale(selectedScale); // Вызываем функцию изменения сетки
        var selectedDate = $('#dateInput').val(); // Получаем выбранную дату
        loadData(selectedDate); // Отправляем POST запрос с выбранной датой
    });


    $(document).ready(function() {
        // Переменная для хранения ссылки на всплывающее окно
        var tooltip;

        function showTooltip(x, y, text) {
            // Если всплывающее окно уже существует, обновляем его содержимое и позицию
            if (tooltip) {
                tooltip.innerHTML = text;
                tooltip.style.left = x + "px";
                tooltip.style.top = y + "px";
            } else { // Если всплывающее окно не существует, создаем его
                tooltip = document.createElement("div");
                tooltip.innerHTML = text;
                tooltip.style.position = "absolute";
                tooltip.style.left = x + "px";
                tooltip.style.top = y + "px";
                tooltip.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                tooltip.style.padding = "10px";
                tooltip.style.border = "1px solid #ccc";
                tooltip.style.borderRadius = "5px";
                tooltip.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.3)";

                // Добавляем созданный элемент в тело документа
                document.body.appendChild(tooltip);
            }
        }

        // Показываем всплывающее окно при наведении на таск
        gantt.attachEvent("onMouseMove", function(id, e) {
            if (id !== null) {
                var task = gantt.getTask(id);
                if (task) { // Проверяем, найден ли таск
                    var start = task.start_date;
                    var end = task.end_date;
                    var tooltipText = "<b>Тема:</b> "+ task.theme +
                        "<br/><b>Статус:</b> " + task.state +
                        "<br/><b>Приоритетность:</b> " + task.priority +
                        "<br/><b>Направление:</b> " + task.techDirections +
                        "<br/><b>Техцентр:</b> " + task.techCenter;
                    showTooltip(e.pageX, e.pageY - 150, tooltipText);
                }
            } else { // Если курсор ушел с таска, скрываем всплывающее окно
                if (tooltip) {
                    document.body.removeChild(tooltip);
                    tooltip = null; // Очищаем ссылку на всплывающее окно
                }
            }
        });
    });
});