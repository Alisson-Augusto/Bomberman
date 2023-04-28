import Cell from "./Cell.js";

export default class Bomb extends Cell{
  constructor(id, maze) {
    super(id, "bomb");
    setTimeout(this.explosion, 3000);
  }
  
  explosion() {
    console.log("boom");
  }

  get_color() {
    return "#F654A4"
  }
}