import Bomb from "./Bomb.js";
import p5 from "p5";
import Cell from "./Cell.js";
import Player from "./Player.js";
import Enemy from "./Enemy.js";
import MAP from "./Scene1.js";

const RIGHT  = 68;
const LEFT   = 65;
const BOTTOM = 83;
const TOP    = 87;
const SPACE  = 32;
const DEBUG_KEY = 76;


export class Point {
  id: number;
  line: number;
  column: number;

  constructor(id: number, line: number, column: number) {
    this.id     = id;
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
      let enemy = new Enemy(point, bomberman.canvas);
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
  font: string;
  cells_vertical: number;
  cells_horizontal: number;
  cell_size: number;
  bombs: Array<Bomb>;
  enemies: Array<Enemy>;
  player?: Player;
  cells: Array<Array<Cell>>;
  show_lables: boolean;
  is_game_running: boolean;


  constructor(canvas: p5, width: number, height: number, font: string) {
    this.canvas = canvas;
    this.width  = width;
    this.height = height;
    this.font   = font;
    this.cells_vertical   = 13;
    this.cells_horizontal = 16;
    this.cell_size = 40;
    this.bombs = [];
    this.enemies = [];
    this.player = undefined;
    this.cells = Array(this.cells_vertical);
    this.show_lables = false;
    this.is_game_running = true;
    this.validate_canvas_size();
    this.load_maze_from_matrix(MAP);
    this.init_enemies();
  }


  validate_canvas_size() {
    let expected_widht  = this.cell_size * this.cells_horizontal;
    let expected_height = this.cell_size * this.cells_vertical;

    if(expected_widht != this.width || expected_height != this.height) {
      console.error("Dimensões do canvas incompatível");
      console.error(`Dimensões esperadas: (${expected_widht}x${expected_height})`);
    }
  }


  init_enemies() {
    /* Inicializa inimigos, definindo alvos */
    for(let i=0; i < this.enemies.length; i++) {
      if(this.player == undefined) continue;

      this.enemies[i].set_target(this.player.point);
      this.enemies[i].set_path(
        this.generate_path_from_enemy_to_target(this.enemies[i])
      )
    }
  }


  load_maze_from_matrix(matrix: Array<Array<number>>) {
    // Carrega mapa apartir de uma matriz de inteiros
    if(matrix.length != this.cells_vertical || matrix[0].length != this.cells_horizontal) {
      console.error("Matriz de tamanho incompatível")
      return;
    }
    
    let id = 0;
    for(let i=0; i < this.cells_vertical; i++) {
      let line = Array(this.cells_horizontal);
      for(let j=0; j < this.cells_horizontal; j++) {
        line[j] = create_cell(matrix[i][j], new Point(id, i, j), this);
        id++;
      }
      this.cells[i] = line;
    }
  }


  render_maze() {
    for(let i=0; i < this.cells_vertical; i++) {
      for(let j=0; j < this.cells_horizontal; j++) {
        this.render_cell(i, j);
      }
    }
  }


  get_adjacent_list() {
    /*
    * Retorna lista de adjacência com todas as células
    * usando como base a matriz de células `this.cells`
    */
    let grafo = Array(this.cells_vertical * this.cells_horizontal);
    let c = 0;
    for(let i=0; i < this.cells_vertical; i++) {
      for(let j=0; j < this.cells_horizontal; j++) {
        // Varre todos os adjacêntes a célula
        let current_cell = this.get_cell(i, j);
        if(current_cell.is_obstacle()) continue;
        
        let adjacent = []
        // Vértice direita
        let right = j+1;
        if(right <= this.cells_horizontal && this.get_cell(i, right).is_obstacle() == false) {
          adjacent.push(this.get_cell(i, right));
        }
        
        // Vértice esquerda
        let left = j-1;
        if(left >= 0 && this.get_cell(i, left).is_obstacle() == false) {
          adjacent.push(this.get_cell(i, left));
        }
        
        // Vértice cima
        let up = i-1;
        if(up >= 0 && this.get_cell(up, j).is_obstacle() == false) {
          adjacent.push(this.get_cell(up, j));
        }
        
        // Vértice baixo
        let bottom = i+1;
        if(bottom <= this.cells_vertical && this.get_cell(bottom, j).is_obstacle() == false) {
          adjacent.push(this.get_cell(bottom, j));
        }

        grafo[c] = adjacent;
        c++;
      }
    }
    return grafo;
  }


  generate_path_from_enemy_to_target(enemy: Enemy) {
    let path:Array<Point> = [];
    if(enemy.target == null) { 
      console.info("inimigo sem alvo");  
      return path;
    }
    
    path = [
      this.get_point(1, 13),
      this.get_point(1, 12),
      this.get_point(1, 11),
      this.get_point(1, 10),
      this.get_point(2, 10),
      this.get_point(3, 10),
      this.get_point(4, 10),
    ]
    
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
          `${line},${column}`,
          column * this.cell_size + 5,
          line   * this.cell_size + (this.cell_size / 2))
    }
  }

  
  add_bomb(point: Point) {
    // Valida se já existe uma bomba na posição
    for(let i=0; i < this.bombs.length; i++) {
      if(this.bombs[i].point.id === point.id) {
        return;
      }
    }
    let bomb = new Bomb(point, this.canvas);
    this.bombs.push(bomb);
  }

  
  explosion(point: Point) {
    let {line, column} = point;
    // quantidade de blocos que serão afetados na vertical/horizontal
    let propagation = 2;
    let points = [];
    let p;

    // horizontal - esquerda
    let left  = Math.max(0, column-propagation);
    for(let j=column; j >= left; j--) {
      p = new Point(this.calculate_id(line, j), line, j);
      if(!this.get_cell(line, j).can_break()) {
        break;
      }

      points.push(p);
    }
    
    // horizontal - direita
    let right = Math.min(this.cells_horizontal, column+propagation);
    for(let j=column; j <= right; j++) {
      p = new Point(this.calculate_id(line, j), line, j);
      if(!this.get_cell(line, j).can_break()) {
        break;
      }
      
      points.push(p);
    }

    // vertical - cima
    let up = Math.max(0, line-propagation);
    for(let i=line; i >= up; i--) {
      p = new Point(this.calculate_id(i, column), i, column);
      if(!this.get_cell(i, column).can_break()) {
        break;
      }

      points.push(p);
    }
    
    // vertical - baixo
    let down = Math.min(this.cells_vertical, line+propagation);
    for(let i=line; i <= down; i++) {
      p = new Point(this.calculate_id(i, column), i, column);
      if(!this.get_cell(i, column).can_break()) {
        break;
      }

      points.push(p);
    }

    for(let i=0; i < points.length; i++) {
      this.hit_detection(points[i])
      this.set_cell_from_type(points[i], 0);
    }
    
    return points;
  }


  hit_detection(point: Point) {
    // Detecta se houve colisão com player ou inimigo
    if(this.player != undefined && this.player.point.id == point.id) {
      this.is_game_running = false;
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


  calculate_id(line: number, column: number) {
    return line*this.cells_horizontal + column; 
  }


  get_point(line: number, column: number) {
    return new Point(this.calculate_id(line, column), line, column);
  }


  get_cell(line:number, column:number) {
    return this.cells[line][column];
  }


  listen_keyboard_event() {
    if(this.player == undefined) return;

    if(this.canvas.keyCode == SPACE) {
      this.add_bomb(this.player.point);
    }
    if(this.canvas.keyCode == DEBUG_KEY) {
      this.show_lables = !this.show_lables;
      this.render_maze();
      console.table(this.get_adjacent_list());
    }

    this.handle_moviment();
  }

  is_valid_move(position: Point) {
    /* Valida se ator pode se mover para essa célula */
    if(this.is_valid_position(position.line, position.column) == false) {
      return false;
    }

    if(this.get_cell(position.line, position.column).type == "available-path") {
      return true;
    }

    return false;
  }

  is_valid_position(line: number, column: number) {
    /* Valida se posição esta dentro do tabuleiro */
    if(line < 0 || line > this.cells_vertical) {
      return false;
    }
    if(column < 0 || column > this.cells_horizontal) {
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

    let next_point = this.get_point(n_line, n_column);
    if(this.is_valid_move(next_point)) {
      this.set_cell_from_type(this.player.point, 0);
      this.set_cell(next_point, this.player);
      this.player.point = next_point;
    }
  }


  update() {
    if(!this.is_game_running) {
      let font_size = 60;
      let text = "GAME OVER";
      this.canvas.textSize(font_size);
      this.canvas.textFont(this.font);
      this.canvas.stroke(1);
      this.canvas.fill(this.canvas.color(255, 255, 255));
      this.canvas.text(text, this.width/2 - (text.length * font_size) / 2, this.height/2);
      return;
    } 

    for(let i=0; i < this.bombs.length; i++) {
      if(this.bombs[i].has_exploded()) {
        // Bomba acabou de explodir
        let trail = this.explosion(this.bombs[i].point);
        this.bombs[i].draw_trails(trail);
        
        let {line, column} = this.bombs[i].point;
        this.render_cell(line, column);
      }else {
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

    for(let i=0; i < this.enemies.length; i++) {
      let position = this.enemies[i].get_next_moviment()
      if(position == undefined || !this.is_valid_position(position.line, position.column)) continue;

      this.set_cell_from_type(this.enemies[i].point, 0);
      this.set_cell(position, this.enemies[i]);
      this.enemies[i].point = position;
    } 
  }
}