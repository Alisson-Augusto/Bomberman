import { Point } from "./Bomberman.js";
import Cell from "./Cell.js"

export default class Player extends Cell {
  constructor(point: Point) {
    super(point, "charactere");
  }    

  override get_color(): string {
    return "#CAC228"
  }
}