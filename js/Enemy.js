import Cell from "./Cell.js"

// Define quantidade de frames necessário para liberar movimentação
const FRAMES_BETWEEN_MOVEMENT = 60;

export default class Enemy extends Cell {
  constructor(point, canvas, target=null) {
    super(point, "enemy");
    this.path = []; // Lista com os caminhos que o inimigo deve seguir para chegar no player
    this.target = target;
    this.canvas = canvas;
  }

  set_path(path) {
    this.path = path;
  }

  set_target(target) {
    this.target = target;
  }

  get_next_moviment() {
    // Retorna posição em que o inimigo irá se mover
    if(this.path.length == 0) return null;
    if(this.canvas.frameCount % FRAMES_BETWEEN_MOVEMENT != 0) {
      return null;
    }
    // Movimento liberado!
    return this.path.shift();
  }

  get_color() {
    return "#316650";
  }
}