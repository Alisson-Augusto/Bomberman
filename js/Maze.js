import Cell from "./Cell.js"
import Bomb from "./Bomb.js"
import Character from "./Charactere.js";
import MAP from "./Scene1.js";

const RIGHT  = 68;
const LEFT   = 65;
const BOTTOM = 83;
const TOP    = 87;
const SPACE  = 32;
const DEBUG_KEY = 76;


export class Point {
  constructor(id, line, column) {
    this.id = id;
    this.line = line;
    this.column = column;
  }
}


function create_cell(type, point, maze) {
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
    return;
  }

  switch(type) {
    case 0:
      return new Cell(point, "available-path");
    case 1:
      return new Cell(point, "fixed-obstacle");
    case 2:
      return new Cell(point, "obstacle");
    case 3:
      maze.charactere = new Character(point)
      return new Character(point);
    case 4:
      return new Cell(point);
  }
}


export default class Maze {
  
  constructor(canvas, width, height, font) {
    this.canvas = canvas;
    this.width  = width;
    this.height = height;
    this.font   = font;
    this.cells_vertical   = 13;
    this.cells_horizontal = 16;
    this.cell_size = 40;
    this.bombs = [];
    this.charactere = null;
    this.cells = Array(this.cells_vertical);
    this.show_lables = false;
    this.is_game_running = true;
    this.validate_canvas_size();
    this.load_maze_from_matrix(MAP);
  }

  validate_canvas_size() {
    let expected_widht  = this.cell_size * this.cells_horizontal;
    let expected_height = this.cell_size * this.cells_vertical;

    if(expected_widht != this.width || expected_height != this.height) {
      console.error("Dimensões do canvas incompatível");
      console.error(`Dimensões esperadas: (${expected_widht}x${expected_height})`);
    }
  }

  load_maze_from_matrix(matrix) {
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


  render_cell(line, column) {
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

  
  add_bomb(point) {
    let bomb = new Bomb(point, this.canvas);
    this.bombs.push(bomb);
  }

  
  explosion(point) {
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


  hit_detection(point) {
    // Detecta se houve colisão com player ou inimigo
    if(this.charactere.point.id == point.id) {
      this.is_game_running = false;
    } 
  }


  set_cell_from_type(point, type) {
    const {line, column} = point;
    this.cells[line][column] = create_cell(type, point);
    this.render_cell(line, column);
  }

  
  set_cell(point, cell) {
    const {line, column} = point;
    this.cells[line][column] = cell;
    this.render_cell(line, column);
  }


  calculate_id(line, column) {
    return line*this.cells_horizontal + column; 
  }


  get_point(line, column) {
    return new Point(this.calculate_id(line, column), line, column);
  }


  get_cell(line, column) {
    return this.cells[line][column];
  }

  listen_keyboard_event() {
    if(this.canvas.keyCode == SPACE) {
      this.add_bomb(this.charactere.point);
    }
    if(this.canvas.keyCode == DEBUG_KEY) {
      this.show_lables = !this.show_lables;
      this.render_maze();
      console.table(this.get_adjacent_list());
    }

    this.handle_moviment();
  }

  is_valid_position(line, column) {
    if(line < 0 || line > this.cells_vertical) {
      return false;
    }
    if(column < 0 || column > this.cells_horizontal) {
      return false;
    }
    return true;
  }


  handle_moviment() {
    // Função que lida com a movimentação do personagem
    let {line, column} = this.charactere.point;
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

    if(!this.is_valid_position(n_line, n_column)) {
      return;
    }

    let next_point = this.get_point(n_line, n_column);
    if(this.get_cell(next_point.line, next_point.column).type == "available-path") {
      this.set_cell_from_type(this.charactere.point, 0);
      this.set_cell(next_point, this.charactere);
      this.charactere.point = next_point;
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
  }
}
