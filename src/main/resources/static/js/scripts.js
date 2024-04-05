$(document).ready(function() {
    // Функция для загрузки данных по указанной дате
    function loadData(date, direction, centr) {
        var requestData = {
            date: date,
            direction: direction,
            centr: centr
        }; // Формируем объект с данными для отправки на сервер

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/update",
            data: JSON.stringify(requestData), // Преобразуем данные в формат JSON
            dataType: 'json',
            success: function(response) {
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
                            state: item.state,
                            techCenter: item.techCenter
                        };
                    });

                    // Инициализация и отрисовка диаграммы Gantt
                    gantt.clearAll();
                    gantt.init("gantt-chart");
                    gantt.parse({data: tasks});
                }else {
                    // Если ответ пустой, очищаем диаграмму
                    gantt.clearAll();
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    }

    // Отправляем запрос с текущей датой при загрузке страницы
    var currentDate = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате YYYY-MM-DD
    loadData(currentDate);
    // Заполняем поле с датой текущей датой
    $('#dateInput').val(currentDate);


    // Обработчик события для кнопки "Обновить"
    $('#updateForm').submit(function(event) {
        event.preventDefault(); // Предотвращаем отправку формы по умолчанию
        var formData = {
            date: $('#dateInput').val(),
            direction: null,
            centr: null
        };

        if ($('#dropdown2').val() === "1") {
            formData.direction = null;
        } else {
            formData.direction = $('#dropdown2').val();
        }

        if ($('#dropdown1').val() === "1") {
            formData.centr = null;
        } else {
            formData.centr = $('#dropdown1').val();
        }
        loadData(formData.date, formData.direction, formData.centr);
    });


    // Обработчик события для кнопки "Сбросить"
    $('#resetDate').click(function() {
        var currentDate = new Date().toISOString().split('T')[0]; // Получаем текущую дату в формате YYYY-MM-DD
        $('#dateInput').val(currentDate); // Устанавливаем текущую дату в поле ввода
        $('#dropdown1').val('1'); // Сбрасываем выбранное значение dropdown1
        $('#dropdown2').val('1'); // Сбрасываем выбранное значение dropdown2
        loadData(currentDate, null, null);
    });

    // Обработчик события для кнопки "Сегодня"
    $('#todayButton').click(function() {
        // Заполняем поле с датой текущей датой
        $('#dateInput').val(currentDate);
        var formData = {
            direction: null,
            centr: null
        };

        if ($('#dropdown2').val() === "1") {
            formData.direction = null;
        } else {
            formData.direction = $('#dropdown2').val();
        }


        if ($('#dropdown1').val() === "1") {
            formData.centr = null;
        } else {
            formData.centr = $('#dropdown1').val();
        }

        loadData(currentDate, formData.direction, formData.centr); // Загружаем данные по текущей дате с пустыми дополнительными параметрами
    });

    // Обработчик события для кнопки "Вчера"
    $('#yesterdayButton').click(function() {

        var currentDate = new Date();

        var previousDate = new Date(currentDate); // Создаем копию текущей даты

        // Вычитаем один день из текущей даты
        previousDate.setDate(currentDate.getDate() - 1);

        // Форматируем дату в формат YYYY-MM-DD
        var formattedPreviousDate = previousDate.toISOString().split('T')[0];

        // Заполняем поле с датой вчерашней датой
        $('#dateInput').val(formattedPreviousDate);
        var formData = {
            direction: null,
            centr: null
        };

        if ($('#dropdown2').val() === "1") {
            formData.direction = null;
        } else {
            formData.direction = $('#dropdown2').val();
        }

        if ($('#dropdown1').val() === "1") {
            formData.centr = null;
        } else {
            formData.centr = $('#dropdown1').val();
        }
        loadData(formattedPreviousDate, formData.direction, formData.centr);
    });

    // Обработчик события для двойного клика на таск
    gantt.attachEvent("onTaskDblClick", function(id, e) {
        var task = gantt.getTask(id);
        if (task) {
            window.open("https://arena-test.motivtelecom.ru/sd/operator/#uuid:serviceCall$" + id, "_blank");
        }
    });

    // Настройки DHTMLX Gantt
    gantt.config.scale_unit = "hour"; // Единица времени - час
    gantt.config.date_scale = "%H:%i"; // Формат даты на шкале (часы:минуты)
    gantt.config.scale_height = 50; // Высота шкалы
    gantt.config.show_progress = false; // Отключаем отображение прогресса задачи
    gantt.config.readonly = true; // Диаграмма только в режиме чтения

    // Настройка столбцов слева от диаграммы
    gantt.config.columns = [
        { name: "text", label: "Номер", tree: true, width: 150 },
        { name: "start_date", label: "Начало", align: "center", width: 150, template: function(task) {
                return task.start_date.toLocaleString();
            }},
        { name: "end_date", label: "Конец", align: "center", width: 150, template: function(task) {
                return task.end_date.toLocaleString();
            }}
    ];

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
                        "<br/><b>Направление:</b> " + task.techDirections +
                        "<br/><b>Техцентр:</b> " + task.techCenter;
                    showTooltip(e.pageX, e.pageY, tooltipText);
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