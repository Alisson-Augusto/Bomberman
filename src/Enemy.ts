import p5 from "p5";
import Bomberman, { Point } from "./Bomberman.js";
import Cell from "./Cell.js";

// Define quantidade de frames necessário para liberar movimentação
const FRAMES_BETWEEN_MOVEMENT:number = 20;

function get_random_color(): string {
  let colors = ["#316650", "#537188", "#FC4F00", "#FF6000"];
  let index = Math.floor(Math.random() * colors.length);
  return colors[index];
}


export default class Enemy extends Cell {
  path: Array<Point>;
  target?: Point;
  canvas: p5;
  bomberman: Bomberman;
  color: string;

  constructor(point: Point, canvas: p5, bomberman: Bomberman, target=undefined) {
    super(point, "enemy");
    this.path = []; // Lista com os caminhos que o inimigo deve seguir para chegar no player
    this.target = target;
    this.canvas = canvas;
    this.bomberman = bomberman;
    this.color = get_random_color();
  }

  set_path(path: Array<Point>) {
    this.path = path;
  }

  set_target(target: Point) {
    this.target = target;
  }

  get_next_moviment(): Point|undefined {
    // Retorna posição em que o inimigo irá se mover
    if(this.path.length == 0 || this.bomberman.player == undefined) return undefined;
    if(this.canvas.frameCount % FRAMES_BETWEEN_MOVEMENT != 0) {
      return undefined;
    }

    let player_on_path = this.path[0].id == this.bomberman.player.get_id()
    if(this.bomberman.is_valid_move(this.path[0]) && !player_on_path) {
      // Movimento liberado!
      return this.path.shift();
    }

    // Caminho esta obstruído
    this.bomberman.add_bomb(this.point, this);
    return undefined;
  }

  get_color() {
    return this.color;
  }
}