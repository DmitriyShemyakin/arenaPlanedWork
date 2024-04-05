package appGantt;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Controller
public class GanttController {

//    @Value("${url}")
//    private String LINK;
//
//    @Value("${access}")
//    private String ACCESS_KEY;

    private static final String SERVICE_URL = "https://arena-test.motivtelecom.ru/sd/services/rest/exec-post?func=modules.gant.dataServiceCallChg&params=requestContent&accessKey=7f53b56e-8c9c-4d2a-8b99-16b4b7bbe474";

    @GetMapping("/ganttChart")
    public String index() {
        return "index";
    }

    @PostMapping("/update")
    @ResponseBody
    public List<ServiceResponse> update(@RequestBody UpdateRequest updateRequest) {
        // Преобразуем дату из строки в LocalDate
        LocalDate localDate = LocalDate.parse(updateRequest.getDate());

        // Отправляем POST запрос к сервису
        RestTemplate restTemplate = new RestTemplate();
        ServiceResponse[] responses = restTemplate.postForObject(SERVICE_URL, createRequest(localDate, updateRequest.getDirection(), updateRequest.getCentr()), ServiceResponse[].class);

        return List.of(responses);
    }

    // Метод для создания объекта запроса с дополнительными параметрами
    private ServiceRequest createRequest(@NotNull LocalDate date, String direction, String centr) {
        ServiceRequest request = new ServiceRequest();
        request.setDays(date.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

        if (direction != null) {
            request.setDirection(direction);
        }
        if (centr != null) {
            request.setCentr(centr);
        }
        return request;
    }
}
