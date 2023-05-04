import Cell from "./Cell.js"

export default class Enemy extends Cell {
  constructor(point, adjacent_list) {
    super(point, "enemy");
    this.adjacent_list = adjacent_list;
    this.path = []; // Lista com os caminhos que o inimigo deve seguir para chegar no player
  }

  set_adjacent_list(adjacent_list) {
    this.adjacent_list = adjacent_list;
  }

  generate_path() {

  }

  get_next_moviment() {
    // Retorna posição em que o inimigo irá se mover
    if(this.path.length === 0) return;
    return this.path.shift();
  }

  get_color() {
    return "#316650";
  }
}