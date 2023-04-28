import Cell from "./Cell.js"

export default class Character extends Cell {
  constructor(id) {
    super(id, "charactere");
  }    

  get_color() {
    return "#CAC228"
  }
}