import p5 from "p5";
import { Point } from "./Bomberman";
import Cell from "./Cell";

export default class Bomb {
  point: Point;
  canvas: p5;
  originate: Cell;
  trails: Array<Point>;
  time_explosion: number; // tempo até explodir
  time_trail_hide: number;
  
  constructor(point: Point, originate: Cell, canvas: p5) {
    this.point = point;
    this.originate = originate; 
    this.canvas = canvas;
    this.trails = [];
    this.time_explosion = Date.now() + 3000; // tempo até explodir
    this.time_trail_hide = this.time_explosion + 1000;
  }

  has_exploded() {
    if(this.time_explosion - Date.now() > 0) {
      return false;
    }
    return true;
  }


  trail_has_gone() {
    /*
      Valida se o tempo de explosão já superou
      o tempo programado, de forma que retornará verdadeiro
      quando o "rastro" de explosão já tiver partido.
    */
    if(this.time_trail_hide - Date.now() > 0) {
      return false;
    }
    return true;
  }


  draw_trails(trail: Array<Point>) {
    this.trails = trail;

    for(let i=0; i < trail.length; i++) {
      // Mostra sprite de bomba
      const {line, column} = trail[i];
      this.canvas.fill("#FFF000")
      this.canvas.circle(
        column * 40 + 20,
        line   * 40 + 20,
        40*0.75)
    }
  }

  draw() {
    // Mostra sprite de bomba
    const {line, column} = this.point;
    this.canvas.fill("#FF0000")
    this.canvas.circle(
      column * 40 + 20,
      line   * 40 + 20,
      40*0.75)
  }
}