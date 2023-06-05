import Cell from "./Cell.js";
// Define quantidade de frames necessário para liberar movimentação
const FRAMES_BETWEEN_MOVEMENT = 30;
export default class Enemy extends Cell {
    constructor(point, canvas, bomberman, target = undefined) {
        super(point, "enemy");
        this.path = []; // Lista com os caminhos que o inimigo deve seguir para chegar no player
        this.target = target;
        this.canvas = canvas;
        this.bomberman = bomberman;
    }
    set_path(path) {
        this.path = path;
    }
    set_target(target) {
        this.target = target;
    }
    get_next_moviment() {
        // Retorna posição em que o inimigo irá se mover
        if (this.path.length == 0)
            return undefined;
        if (this.canvas.frameCount % FRAMES_BETWEEN_MOVEMENT != 0) {
            return undefined;
        }
        if (this.bomberman.is_valid_move(this.path[0])) {
            // Movimento liberado!
            return this.path.shift();
        }
        // Caminho esta obstruído
        console.log("Inimigo lança bomba!");
        this.bomberman.add_bomb(this.point, this);
        return undefined;
    }
    get_color() {
        return "#316650";
    }
}
//# sourceMappingURL=Enemy.js.map