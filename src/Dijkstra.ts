import Bomberman, { CELLS_HORIZONTAL, CELLS_VERTICAL } from "./Bomberman";
import Cell from "./Cell";
import PriorityQueue from "./data_structures/PriorityQueue";

export class Node {
  cell: Cell;
  _distance: number;
  _parent: Node | null;

  constructor(cell: Cell) {
    this.cell = cell;
    this._distance = Infinity;
    this._parent = null;
  }

  set distance(d: number) {
    this._distance = d;
  }

  get distance(): number {
    return this._distance;
  }
  
  set parent(p: Node | null) {
    this._parent = p;
  }

  get parent() {
    return this._parent;
  }

  get id(): number {
    return this.cell.get_id();
  }
}

export function adjacent_list(game: Bomberman): Node[][] {
  /*
  * Retorna lista de adjacência com todas as células
  * usando como base a matriz de células `this.cells`
  */
  let grafo: Node[][] = Array(CELLS_VERTICAL * CELLS_HORIZONTAL);
  let c = 0;
  for(let i=0; i < CELLS_VERTICAL; i++) {
    for(let j=0; j < CELLS_HORIZONTAL; j++) {
      // Varre todos os adjacêntes a célula
      let current_cell = game.get_cell(i, j);
      if(current_cell.is_obstacle()) continue;
      
      let adjacent = []
      // Vértice direita
      let right = j+1;
      if(right <= CELLS_HORIZONTAL && game.get_cell(i, right).is_obstacle() == false) {
        adjacent.push(new Node(game.get_cell(i, right)));
      }
      
      // Vértice esquerda
      let left = j-1;
      if(left >= 0 && game.get_cell(i, left).is_obstacle() == false) {
        adjacent.push(new Node(game.get_cell(i, left)));
      }
      
      // Vértice cima
      let up = i-1;
      if(up >= 0 && game.get_cell(up, j).is_obstacle() == false) {
        adjacent.push(new Node(game.get_cell(up, j)));
      }
      
      // Vértice baixo
      let bottom = i+1;
      if(bottom <= CELLS_VERTICAL && game.get_cell(bottom, j).is_obstacle() == false) {
        adjacent.push(new Node(game.get_cell(bottom, j)));
      }

      grafo[c] = adjacent;
      c++;
    }
  }
  return grafo;
}


export default function Dijkstra(game: Bomberman, s: Node): void {
  let G: Node[][] = adjacent_list(game); // Grafo é relaxado na geração da lista de adjacência

  let q = new PriorityQueue();
  q.insert(s);
  while(!q.is_empty()) {
    let u = q.extract_min();
    
  }
}