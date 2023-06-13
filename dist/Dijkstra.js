import { CELLS_HORIZONTAL, CELLS_VERTICAL } from "./Bomberman";
export class Node {
    constructor(cell) {
        this.cell = cell;
        this._parent = null;
        this._distance = this.calculate_distance();
        this.value = Infinity;
    }
    calculate_distance() {
        switch (this.cell.type) {
            case "available-path":
            case "taken-path":
            case "charactere":
                return 1;
            case "obstacle":
                return 2;
            default:
                return Infinity;
        }
    }
    set distance(d) {
        this._distance = d;
    }
    get distance() {
        return this._distance;
    }
    set parent(p) {
        this._parent = p;
    }
    get parent() {
        return this._parent;
    }
    get id() {
        return this.cell.get_id();
    }
}
export function adjacent_list(game) {
    /*
    * Retorna lista de adjacência com todas as células
    * usando como base a matriz de células `this.cells`
    */
    let grafo = Array(CELLS_VERTICAL * CELLS_HORIZONTAL);
    let c = 0;
    for (let i = 0; i < CELLS_VERTICAL; i++) {
        for (let j = 0; j < CELLS_HORIZONTAL; j++) {
            // Varre todos os adjacêntes a célula
            let current_cell = game.get_cell(i, j);
            if (current_cell.is_obstacle()) {
                grafo[c] = [];
                c++;
                continue;
            }
            let adjacent = [];
            // Vértice direita
            let right = j + 1;
            if (right <= CELLS_HORIZONTAL && game.get_cell(i, right).is_obstacle() == false) {
                adjacent.push(new Node(game.get_cell(i, right)));
            }
            // Vértice esquerda
            let left = j - 1;
            if (left >= 0 && game.get_cell(i, left).is_obstacle() == false) {
                adjacent.push(new Node(game.get_cell(i, left)));
            }
            // Vértice cima
            let up = i - 1;
            if (up >= 0 && game.get_cell(up, j).is_obstacle() == false) {
                adjacent.push(new Node(game.get_cell(up, j)));
            }
            // Vértice baixo
            let bottom = i + 1;
            if (bottom <= CELLS_VERTICAL && game.get_cell(bottom, j).is_obstacle() == false) {
                adjacent.push(new Node(game.get_cell(bottom, j)));
            }
            grafo[c] = adjacent;
            c++;
        }
    }
    return grafo;
}
function extract_nodes(game, s) {
    /*
      Retorna vetor de nós para ser usado pelo dijkstra;
      e aplica relaxamento em todos os vértices
    */
    let nodes = Array(CELLS_VERTICAL * CELLS_HORIZONTAL);
    let id = 0;
    for (let i = 0; i < game.cells.length; i++) {
        for (let j = 0; j < game.cells[i].length; j++) {
            nodes[id] = new Node(game.get_cell(i, j));
            nodes[id].value = Infinity;
            id++;
        }
    }
    s.distance = 0;
    s.value = 0;
    nodes[s.id] = s;
    return nodes;
}
function relax(u_id, adjacent_id, nodes) {
    let u = nodes[u_id];
    let adjacent = nodes[adjacent_id];
    if (u.value + adjacent.distance < adjacent.value) {
        adjacent.value = u.value + adjacent.distance;
        adjacent.parent = u;
        nodes[adjacent_id] = adjacent;
    }
}
function extract_min(nodes, extracted_nodes) {
    if (nodes.length == 0)
        return undefined;
    let min_value = Infinity;
    let index = -1;
    let min;
    for (let i = 0; i < nodes.length; i++) {
        // Ignora nós já visitados
        if (extracted_nodes.find(node_id_visited => node_id_visited == nodes[i].id)) {
            continue;
        }
        if (nodes[i].value < min_value) {
            min_value = nodes[i].value;
            min = nodes[i];
            index = i;
        }
    }
    if (index == -1)
        return undefined;
    extracted_nodes.push(nodes[index].id);
    return min;
}
export default function Dijkstra(game, s, target) {
    let G = adjacent_list(game);
    let nodes = extract_nodes(game, s);
    let extracted_nodes = [];
    while (true) {
        let u = extract_min(nodes, extracted_nodes);
        if (u == undefined)
            break;
        for (let i = 0; i < G[u.id].length; i++) {
            let adjacent = G[u.id][i];
            relax(u.id, adjacent.id, nodes);
        }
    }
    let p = nodes[target.id];
    let path = [];
    if (p.value != Infinity) {
        path.push(p.cell.point);
    }
    while (true) {
        if (p == null)
            break;
        p = p.parent;
        if (p == undefined)
            break;
        path.push(p.cell.point);
    }
    return path;
}
//# sourceMappingURL=Dijkstra.js.map