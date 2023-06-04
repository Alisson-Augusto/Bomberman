import { Point } from "./Bomberman";

export default class Cell {
  point: Point;
  type: string;

  constructor(point: Point, type: string) {
    this.point = point;
    this.type = type;
  }

  get_id() {
    return this.point.id;
  }

  set_type(type: string) {
    this.type = type;
  }

  get_color(): string {
    switch(this.type) {
      case "end-point":
        return "#009FBD"
      case "taken-path":
        return "#009FBD"
      case "available-path":
        return "#ffffff"
      case "obstacle":
        return "#404258";
      case "fixed-obstacle":
        return "#252633";
      default:
        return "#000000";
    }
  }

  is_obstacle(): boolean {
    return this.type == "fixed-obstacle";
  }

  can_break(): boolean {
    return this.type != "fixed-obstacle";
  }
}