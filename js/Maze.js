import Bomb from "./Bomb.js";
import Cell from "./Cell.js"
import Character from "./Charactere.js";

let MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
  [5, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 4, 1], 
  [2, 1, 2, 1, 0, 1, 2, 1, 0, 1, 0, 1, 2, 1, 0, 1], 
  [0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 2, 1], 
  [0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1], 
  [2, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1], 
  [0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1], 
  [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 0, 0, 1], 
  [2, 1, 0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1, 0, 1], 
  [0, 2, 0, 0, 0, 0, 2, 2, 2, 0, 2, 0, 2, 0, 0, 1], 
  [2, 1, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 1],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];


function create_cell(type, id) {
  /*
  * Gera uma célula apartir de um número inteiro `type`
  * 0 = região livre para
  * 1 = obstáculo fixo (não pode ser destruido)
  * 2 = obstáculo padrão
  * 3 = personagem
  * 4 = inimigo
  * 5 = bomba
  */
  if(type < 0 || type > 5) {
    console.error("Tipo inválido");
    return;
  }

  switch(type) {
    case 0:
      return new Cell(id, "available-path");
    case 1:
      return new Cell(id, "fixed-obstacle");
    case 2:
      return new Cell(id, "obstacle");
    case 3:
      return new Character(id);
    case 4:
      return new Cell(id);
    case 5:
      return new Bomb(id);
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
    this.begin = null;
    this.end   = null;
    this.cells = Array(this.cells_vertical);
    this.show_lables = true;
    
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
        line[j] = create_cell(matrix[i][j], id, this);
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


  render_cell(line, column) {
    let cell = this.cells[line][column];
    this.canvas.fill(this.canvas.color(cell.get_color()));

    // Renderiza quadrado na posição (X, Y)
    this.canvas.square(column * this.cell_size, line * this.cell_size, this.cell_size);
  
    if(this.show_lables) {
      this.canvas.fill(this.canvas.color(0,0,0));
      this.canvas.text(
          `${line},${column}`,
          column * this.cell_size + 10,
          line   * this.cell_size + (this.size / 2))
    }
  }


  set_cell(id, type) {
    const [line, column] = this.get_line_column_from_id(id);
    console.table(this.cells)
    this.cells[line][column] = create_cell(type, id, this);
    this.render_cell(line, column);
  }


  get_line_column_from_id(id) {
    let column = id % this.cells_horizontal;
    let line = Math.ceil(id / this.cells_horizontal) - 1; // -1 pois indexação começa em 0
    return [line, column];
  }


  get_cell(line, column) {
    return this.cells[line][column];
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


  listen_keyboard_event() {
    console.log("OI!");
  }
}
