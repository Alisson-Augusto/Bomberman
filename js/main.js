/*
Vértices = regiões do mapa (Células) disponíveis para se mover
Arestas  = regiões disponíveis que se conectam
*/
import Maze from "./Maze.js";

let WIDTH  = 640;
let HEIGHT = 520;
let default_font;
let maze;

let canvas = new p5(function(p5) {
  p5.preload = function preload() {
    default_font = p5.loadFont('font/PressStart2P-Regular.ttf');
  }

  p5.setup = function setup() {
    maze = new Maze(canvas, WIDTH, HEIGHT, default_font)
    p5.createCanvas(WIDTH, HEIGHT);
    p5.background(0);
    maze.render_maze();
  }

  p5.draw = function draw() {
    maze.update();
  }
  
  p5.keyPressed = function keyPressed() {
    if(!maze.is_game_running) return;
    maze.listen_keyboard_event();
  }
})

