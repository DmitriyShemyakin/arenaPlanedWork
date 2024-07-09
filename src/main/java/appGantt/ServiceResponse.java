package appGantt;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServiceResponse {
    private String name;
    private String dateEnd;
    private String dateStart;
    private String id;
    private String theme;
    private String state;
    private String techDirections;
    private String techCenter;
    private String priority;
}

