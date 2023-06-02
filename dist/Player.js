import Cell from "./Cell.js";
export default class Player extends Cell {
    constructor(point) {
        super(point, "charactere");
    }
    get_color() {
        return "#CAC228";
    }
}
//# sourceMappingURL=Player.js.map