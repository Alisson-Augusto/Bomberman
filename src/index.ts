/*
Vértices = regiões do mapa (Células) disponíveis para se mover
Arestas  = regiões disponíveis que se conectam
*/
import p5 from "p5";
import Bomberman from "./Bomberman";

let WIDTH  = 640;
let HEIGHT = 520;
let default_font: string;
let bomberman: Bomberman;

let canvas = new p5(function(p5) {
  p5.preload = function preload() {
    default_font = p5.loadFont('font/PressStart2P-Regular.ttf');
  }

  p5.setup = function setup() {
    bomberman = new Bomberman(canvas, WIDTH, HEIGHT, default_font)
    p5.createCanvas(WIDTH, HEIGHT);
    p5.background(0);
    bomberman.render_maze();
  }

  p5.draw = function draw() {
    bomberman.update();
  }
  
  p5.keyPressed = function keyPressed() {
    if(!bomberman.is_game_running) return;
    bomberman.listen_keyboard_event();
  }
})

