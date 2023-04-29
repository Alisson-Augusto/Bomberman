import Cell from "./Cell.js"
import Character from "./Charactere.js";
import MAP from "./Scene1.js";

export class Point {
  constructor(id, line, column) {
    this.id = id;
    this.line = line;
    this.column = column;
  }
}


class Bomb {
  constructor(point, canvas) {
    this.point = point;
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
    if(this.time_trail_hide - Date.now() > 0) {
      return false;
    }
    return true;
  }


  draw_trails(trail) {
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
    console.log("sprite")
    const {line, column} = this.point;
    this.canvas.fill("#FF0000")
    this.canvas.circle(
      column * 40 + 20,
      line   * 40 + 20,
      40*0.75)
  }
}


function create_cell(type, point) {
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
      return new Character(point);
    case 4:
      return new Cell(point);
  }
}


export default class Maze {
  
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width  = width;
    this.height = height;
    this.cells_vertical   = 13;
    this.cells_horizontal = 16;
    this.cell_size = 40;
    this.bombs = [];
    this.charactere = null;
    this.cells = Array(this.cells_vertical);
    this.show_lables = false;
    
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
        line[j] = create_cell(matrix[i][j], new Point(id, i, j), this.cells);
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


  // TODO
  get_adjacent_list() {
    /*
    * Retorna lista de adjacência com todas as células
    * usando como base a matriz de células `this.cells`
    */
    grafo = Array(this.cells_vertical * this.cells_horizontal);
    let c = 0;
    for(let i=0; i < this.cells_vertical; i++) {
      for(let j=0; j < this.cells_horizontal; j++) {
        // Varre todos os adjacêntes a célula
        current_cell = this.get_cell(i, j);
        if(current_cell.is_obstacle()) continue;
        adjacent = []
        
        // Vértice direita
        if(this.get_cell(i, j+1).is_obstacle() == false) {
          adjacent.push(this.get_cell(i, j+1));
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
    let propagation = 4;
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
    for(let j=column; j >= right; j++) {
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
      this.set_cell(points[i], 0);
    }
    
    return points;
  }


  set_cell(point, type) {
    const {line, column} = point;
    this.cells[line][column] = create_cell(type, point);
    this.render_cell(line, column);
  }


  calculate_id(line, column) {
    return line*this.cells_horizontal + column; 
  }


  get_cell(line, column) {
    return this.cells[line][column];
  }


  listen_keyboard_event() {
    console.log("OI!");
    this.add_bomb(new Point(68, 3, 4))
  }


  update() {
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
          this.set_cell(trails[i], 0);          
        }
        this.bombs.shift();
      }
    }
  }
}
