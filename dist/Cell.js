export default class Cell {
    constructor(point, type) {
        this.point = point;
        this.type = type;
    }
    get_id() {
        return this.point.id;
    }
    set_type(type) {
        this.type = type;
    }
    get_color() {
        switch (this.type) {
            case "end-point":
                return "#009FBD";
            case "taken-path":
                return "#009FBD";
            case "available-path":
                return "#ffffff";
            case "obstacle":
                return "#404258";
            case "fixed-obstacle":
                return "#252633";
            default:
                return "#000000";
        }
    }
    is_obstacle() {
        return this.type == "fixed-obstacle";
    }
    can_break() {
        return this.type != "fixed-obstacle";
    }
}
//# sourceMappingURL=Cell.js.map