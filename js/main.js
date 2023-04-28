/*
Vértices = regiões do mapa (Células) disponíveis para se mover
Arestas  = regiões disponíveis que se conectam
*/
import Maze from "./Maze.js";

let WIDTH  = 640;
let HEIGHT = 520;
let maze;

let canvas = new p5(function(p5) {
  p5.setup = function setup() {
    maze = new Maze(canvas, WIDTH, HEIGHT)
    p5.createCanvas(WIDTH, HEIGHT);
    p5.background(0);
    maze.render_maze();
  }

  p5.draw = function draw() {
    maze.render_maze();
  }
  
  p5.keyPressed = function keyPressed() {
    maze.listen_keyboard_event();
  }
})

