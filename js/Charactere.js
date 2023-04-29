import Cell from "./Cell.js"

export default class Character extends Cell {
  constructor(point) {
    super(point, "charactere");
  }    

  get_color() {
    return "#CAC228"
  }
}