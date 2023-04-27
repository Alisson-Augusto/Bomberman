/*
Vértices = regiões do mapa (Células) disponíveis para se mover
Arestas  = regiões disponíveis que se conectam
*/
let WIDTH  = 400;
let HEIGHT = 400;

class Cell {
  constructor(id, type, line, column, size) {
    this.id = id;
    this.type = type;
    this.line = line;
    this.column = column;
    this.size = size;
    this.show_lables = false;
  }

  get_id() {
    return this.id;
  }

  draw() {
    fill(this.get_color());

    // Renderiza quadrado na posição (X, Y)
    square(this.column * this.size, this.line * this.size, this.size);
  
    if(this.show_lables) {
      fill(color(0,0,0));
      text(`${this.line},${this.column}`,
      this.column * this.size + 10,
            this.line * this.size + (this.size / 2))
    }
  }

  set_type(type) {
    this.type = type;
    this.draw();
  }

  get_color() {
    switch(this.type) {
      case "begin-point":
        return color("#ED2B2A");
      case "end-point":
        return color("#009FBD")
      case "available-path":
        return color(255, 255, 255);
      case "suggested-path":
        return color(0, 155, 255);
      case "obstacle":
        return color("#404258");
      default:
        return color(255, 255, 255);
    }
  }

  is_obstacle() {
    return this.type == "obstacle";
  }
}

class Maze {
  
  constructor(width, height) {
    this.width  = width;
    this.height = height;
    this.cells_vertical   = 10;
    this.cells_horizontal = 10;
    this.cell_size = width / this.cells_horizontal;
    this.begin = null;
    this.end   = null;
    this.cells = Array(this.cells_vertical);
    
    let id = 0;
    for(let i=0; i < this.cells_vertical; i++) {
      let line = Array(this.cells_horizontal);
      for(let j=0; j < this.cells_horizontal; j++) {
        line[j] = new Cell(id, "available-path", i, j, this.cell_size);
        id++;
      }
      this.cells[i] = line;
    }
  }

  render_maze() {
    for(let i=0; i < this.cells_vertical; i++) {
      for(let j=0; j < this.cells_horizontal; j++) {
        this.cells[i][j].draw();
      }
    }
  }

  get_cell(line, column) {
    return this.cells[line][column];
  }

  get_adjacent_list() {
    /*
    * Retorna lista de adjacência com todas as células
    * usando como base a matriz de células `this.cells`
    */
    grafo = [];
    for(let i=0; i < this.cells_vertical; i++) {
      for(let j=0; j < this.cells_horizontal; j++) {
        // Varre todos os adjacêntes a célula
        current_cell = this.get_cell(i, j);
        if(current_cell.is_obstacle()) continue;
        
        // Vértice direita
        if(current_cell.get_cell(i, j+1).is_obstacle() == false) {
          // grafo[]
        }
      }
    }
    return grafo;
  }

  is_mouse_on_canvas(mouseX, mouseY) {
    if(mouseX > this.width || mouseX < 0 || mouseY > this.height || mouseY < 0)
      return false;
    return true;
  }

  listen_event() {
    // Ignora quando usuário clicar fora do canvas
    if(!this.is_mouse_on_canvas(mouseX, mouseY)) return;
    
    // Ação de modificar o maze
    if(mouseButton == LEFT) {

      let cell_line   = Math.floor(mouseY / this.cell_size);
      let cell_column = Math.floor(mouseX / this.cell_size);
      let selected_cell = this.get_cell(cell_line, cell_column);

      if(keyIsDown(CONTROL)) {
        if(selected_cell.type != "obstacle" && selected_cell.type != "available-path") {
          console.error("Posição de obstáculo inválida")
          return;
        }
        if(selected_cell.type == "obstacle") {
          selected_cell.set_type("available-path");
          return;
        }
        selected_cell.set_type("obstacle");
        return;
      }

      if(selected_cell.type == "obstacle") {
        console.error("Não pode definir início e fim em obstáculo");
        return;
      }

      if(keyIsDown(SHIFT)) {
        // Define ponto de fim
        if(this.end === null) {
          this.end = selected_cell;
          this.end.set_type("end-point");
          return;
        }
        this.end.set_type("available-path");
        this.end = selected_cell;
        this.end.set_type("end-point");
        return;
      }

      // Define ponto de início
      if(this.begin === null) {
        this.begin = selected_cell;
        this.begin.set_type("begin-point");
        return;
      }
      this.begin.set_type("available-path");
      this.begin = selected_cell;
      this.begin.set_type("begin-point");
    }
  }
}

maze = new Maze(WIDTH, HEIGHT)
function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0);
  maze.render_maze();
}

function mouseClicked() {
  maze.listen_event();
}