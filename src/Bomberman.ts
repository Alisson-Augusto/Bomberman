import Bomb from "./Bomb.js";
import p5, { Font } from "p5";
import Cell from "./Cell.js";
import Player from "./Player.js";
import Enemy from "./Enemy.js";
import MAP from "./Scene1.js";
import Dijkstra, { adjacent_list, Node } from "./Dijkstra";

const RIGHT  = 68;
const LEFT   = 65;
const BOTTOM = 83;
const TOP    = 87;
const SPACE  = 32;
const DEBUG_KEY = 76;
export const CELLS_VERTICAL   = 13;
export const CELLS_HORIZONTAL = 16;

export class Point {
  id: number;
  line: number;
  column: number;

  constructor(line: number, column: number) {
    this.id     = line*CELLS_HORIZONTAL + column;
    this.line   = line;
    this.column = column;
  }
}

function create_cell(type: number, point:Point, bomberman:Bomberman): Cell {
  /*
  * Gera uma célula apartir de um número inteiro `type`
  * 0 = região livre para
  * 1 = obstáculo fixo (não pode ser destruido)
  * 2 = obstáculo padrão
  * 3 = personagem
  * 4 = inimigo
  */
  if(type < 0 || type > 4) {
    console.error("Tipo inválido");
    throw new Error("Tipo de célula inválida!");
  }

  switch(type) {
    case 0:
      return new Cell(point, "available-path");
    case 1:
      return new Cell(point, "fixed-obstacle");
    case 2:
      return new Cell(point, "obstacle");
    case 3:
      bomberman.player = new Player(point)
      return bomberman.player;
    case 4:
      let enemy = new Enemy(point, bomberman.canvas, bomberman);
      bomberman.enemies.push(enemy)
      return enemy;
    default:
      return new Cell(point, "available-path");
  }
}


export default class Bomberman {
  canvas: p5;
  width: number;
  height: number;
  font: Font;
  cell_size: number;
  bombs: Array<Bomb>;
  enemies: Array<Enemy>;
  player?: Player;
  cells: Array<Array<Cell>>;
  show_lables: boolean;
  is_game_running: boolean;
  player_win: boolean;

  constructor(canvas: p5, width: number, height: number, font: Font) {
    this.canvas = canvas;
    this.width  = width;
    this.height = height;
    this.font   = font;
    this.cell_size = 40;
    this.bombs = [];
    this.enemies = [];
    this.player = undefined;
    this.cells = Array(CELLS_VERTICAL);
    this.show_lables = false;
    this.is_game_running = true;
    this.player_win = false;
    this.validate_canvas_size();
    this.load_maze_from_matrix(MAP);
    this.init_enemies();
  }


  validate_canvas_size() {
    let expected_widht  = this.cell_size * CELLS_HORIZONTAL;
    let expected_height = this.cell_size * CELLS_VERTICAL;

    if(expected_widht != this.width || expected_height != this.height) {
      console.error("Dimensões do canvas incompatível");
      console.error(`Dimensões esperadas: (${expected_widht}x${expected_height})`);
    }
  }


  init_enemies(): void {
    /* Inicializa inimigos, definindo alvos e calculando caminho até o player */
    for(let i=0; i < this.enemies.length; i++) {
      if(this.player == undefined) continue;

      this.enemies[i].set_target(this.player.point);
      this.enemies[i].set_path(this.generate_path_from_enemy_to_target(this.enemies[i]))
    }
  }


  load_maze_from_matrix(matrix: Array<Array<number>>): void {
    // Carrega mapa apartir de uma matriz de inteiros
    if(matrix.length != CELLS_VERTICAL || matrix[0].length != CELLS_HORIZONTAL) {
      console.error("Matriz de tamanho incompatível")
      return;
    }
    
    let id = 0;
    for(let i=0; i < CELLS_VERTICAL; i++) {
      let line = Array(CELLS_HORIZONTAL);
      for(let j=0; j < CELLS_HORIZONTAL; j++) {
        line[j] = create_cell(matrix[i][j], new Point(i, j), this);
        id++;
      }
      this.cells[i] = line;
    }
  }


  render_maze(): void {
    for(let i=0; i < CELLS_VERTICAL; i++) {
      for(let j=0; j < CELLS_HORIZONTAL; j++) {
        this.render_cell(i, j);
      }
    }
  }


  generate_path_from_enemy_to_target(enemy: Enemy): Point[] {
    let path:Array<Point> = [];
    if(enemy.target == null) { 
      console.info("inimigo sem alvo");  
      return path;
    }

    let source = new Node(enemy);
    source.distance = 0;
    source.value = 0;

    path = Dijkstra(this, source, enemy.target).reverse();
    return path;
  }


  render_cell(line: number, column: number) {
    let cell = this.cells[line][column];
    this.canvas.fill(this.canvas.color(cell.get_color()));

    // Renderiza quadrado na posição (X, Y)
    this.canvas.square(column * this.cell_size, line * this.cell_size, this.cell_size);
  
    if(this.show_lables) {
      this.canvas.fill(this.canvas.color(0,0,0));
      this.canvas.text(
          `${cell.get_id()}`,
          column * this.cell_size + 15,
          line   * this.cell_size + (this.cell_size / 2))
    }
  }

  
  add_bomb(point: Point, originate: Cell) {
    // Valida se já existe uma bomba na posição
    for(let i=0; i < this.bombs.length; i++) {
      if(this.bombs[i].point.id === point.id) {
        return;
      }
    }
    let bomb = new Bomb(point, originate, this.canvas);
    this.bombs.push(bomb);
  }

  
  explosion(bomb: Bomb): Point[] {
    let {line, column} = bomb.point;
    // quantidade de blocos que serão afetados na vertical/horizontal
    let propagation = 2;
    let points = [];

    // horizontal - esquerda
    let left  = Math.max(0, column-propagation);
    for(let j=column; j >= left; j--) {
      let p = new Point(line, j);
      if(!this.get_cell(line, j).can_break()) {
        break;
      }

      if(this.get_cell(line, j).type == "obstacle") {
        points.push(p);
        break;
      }

      points.push(p);
    }
    
    // horizontal - direita
    let right = Math.min(CELLS_HORIZONTAL, column+propagation);
    for(let j=column; j <= right; j++) {
      let p = new Point(line, j);
      if(!this.get_cell(line, j).can_break()) {
        break;
      }

      if(this.get_cell(line, j).type == "obstacle") {
        points.push(p);
        break;
      }
      
      points.push(p);
    }

    // vertical - cima
    let up = Math.max(0, line-propagation);
    for(let i=line; i >= up; i--) {
      let p = new Point(i, column);
      if(!this.get_cell(i, column).can_break()) {
        break;
      }

      if(this.get_cell(i, column).type == "obstacle") {
        points.push(p);
        break;
      }

      points.push(p);
    }
    
    // vertical - baixo
    let down = Math.min(CELLS_VERTICAL, line+propagation);
    for(let i=line; i <= down; i++) {
      let p = new Point(i, column);
      if(!this.get_cell(i, column).can_break()) {
        break;
      }

      if(this.get_cell(i, column).type == "obstacle") {
        points.push(p);
        break;
      }

      points.push(p);
    }

    for(let i=0; i < points.length; i++) {
      if(bomb.originate.type == "enemy") {
        // Inimigo não é afetado pela própria bomba
        if(points[i].id == bomb.originate.point.id) {
          continue;
        }
      }

      this.hit_detection(points[i])
      this.set_cell_from_type(points[i], 0);
    }
    
    return points;
  }


  hit_detection(point: Point) {
    if(this.player == undefined) return;
    // Detecta se houve colisão com player ou inimigo
    if(this.player.point.id == point.id) {
      this.is_game_running = false;
    }

    for(let i=0; i < this.enemies.length; i++) {
      if(this.enemies[i].get_id() == point.id) {
        // Bomba acertou um inimigo
        this.enemies.splice(i, 1);
        if(this.enemies.length == 0) { // Player matou todos os inimigos
          this.player_win = true;
          this.is_game_running = false;
        }
        break;
      }
    }
  }


  set_cell_from_type(point: Point, type: number) {
    const {line, column} = point;
    this.cells[line][column] = create_cell(type, point, this);
    this.render_cell(line, column);
  }

  
  set_cell(point: Point, cell: Cell) {
    const {line, column} = point;
    this.cells[line][column] = cell;
    this.render_cell(line, column);
  }


  get_cell(line:number, column:number) {
    return this.cells[line][column];
  }


  listen_keyboard_event() {
    if(this.player == undefined) return;

    if(this.canvas.keyCode == SPACE) {
      this.add_bomb(this.player.point, this.player);
    }
    if(this.canvas.keyCode == DEBUG_KEY) {
      this.show_lables = !this.show_lables;
      this.render_maze();
      console.table(adjacent_list(this));
    }

    this.handle_moviment();
  }


  is_valid_move(position: Point) {
    /* Valida se ator pode se mover para essa célula */
    if(this.is_valid_position(position.line, position.column) == false) {
      return false;
    }

    let cell_type = this.get_cell(position.line, position.column).type;
    if(cell_type != "obstacle" && cell_type != "fixed-obstacle") {
      return true;
    }

    return false;
  }

  is_valid_position(line: number, column: number) {
    /* Valida se posição esta dentro do tabuleiro */
    if(line < 0 || line > CELLS_VERTICAL) {
      return false;
    }
    if(column < 0 || column > CELLS_HORIZONTAL) {
      return false;
    }
    return true;
  }


  handle_moviment() {
    if(this.player == undefined) return;
    // Função que lida com a movimentação do personagem
    let {line, column} = this.player.point;
    let n_line   = line;
    let n_column = column;

    switch(this.canvas.keyCode) {
      case RIGHT:
        n_column++;
        break;  
      case LEFT:
        n_column--;
        break;
      case TOP:
        n_line--;
        break;
      case BOTTOM:
        n_line++;
        break;
    }

    let next_point = new Point(n_line, n_column);
    if(this.is_valid_move(next_point) && this.get_cell(n_line, n_column).type != "enemy") {
      this.set_cell_from_type(this.player.point, 0);
      this.set_cell(next_point, this.player);
      this.player.point = next_point;
    }
  }


  update() {
    if(!this.is_game_running) {
      let font_size = 60;
      let text = "";
      if(this.player_win) {
        text = "YOU WIN!";
      }
      else {
        text = "GAME OVER";
      }
      this.canvas.textSize(font_size);
      this.canvas.textFont(this.font);
      this.canvas.stroke(1);
      this.canvas.fill(this.canvas.color(255, 255, 255));
      this.canvas.text(text, this.width/2 - (text.length * font_size) / 2, this.height/2);
      return;
    }

    if(this.canvas.frameCount % 60 == 0) {
      console.log("Calculando novo caminho mínimo dos inimigos");
      this.init_enemies();
    }

    for(let i=0; i < this.bombs.length; i++) {
      if(this.bombs[i].has_exploded() && this.bombs[i].trails.length == 0) {
        // Bomba acabou de explodir
        let trail = this.explosion(this.bombs[i]);
        this.bombs[i].draw_trails(trail);
        
        let {line, column} = this.bombs[i].point;
        this.render_cell(line, column);
      }
      if(!this.bombs[i].has_exploded()){
        this.bombs[i].draw();
      }

      // Remove efeito de explosão
      if(this.bombs[i].trail_has_gone()) {
        let trails = this.bombs[i].trails;
        for(let i=0; i < trails.length; i++) {
          this.set_cell_from_type(trails[i], 0);          
        }
        this.bombs.shift();
      }
    }

    // Movimentação dos inimigos
    for(let i=0; i < this.enemies.length; i++) {
      let position = this.enemies[i].get_next_moviment()
      if(position == undefined || !this.is_valid_move(position)) continue;

      this.set_cell_from_type(this.enemies[i].point, 0);
      this.set_cell(position, this.enemies[i]);
      this.enemies[i].point = position;

      if(this.show_lables) { // Desenha caminhos para debug
        this.enemies[i].path.forEach(p => {
          this.set_cell(p, new Cell(p, "taken-path"));
        })
      }
    } 
  }
}
