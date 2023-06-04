import { Node } from "../Dijkstra";

export default class PriorityQueue {

  private heap: Node[];
  
  constructor() {
    this.heap = [];
  }


  private set_index(i: number, node: Node): void {
    if(i < 1 || i > this.size()){
      throw new Error(`Índice inválido: ${i}, size atual é ${this.size()}`);
    }
    this.heap[i - 1] = node;
  }


  private get_index(i: number): Node {
    /* 
      Para simplificar implementação
      o get_index assume indexação apartir de 1
      para simplificar os métodos left, right
    */
    if(i < 1 || i > this.size()){
      throw new Error(`Índice inválido: ${i}, size atual é ${this.size()}`);
    }
    return this.heap[i - 1];
  }


  insert(value: Node) {
    // Insere como último elemento da árvore
    this.heap.push(value);
    if(this.size() > 1) {
      this.sift_up();
    }
  }


  extract_min(): Node | undefined {
    if(this.size() == 0) return undefined;

    let min = this.get_index(1);
    let last_node = this.size();
    this.set_index(1, this.get_index(last_node));
    this.heap.pop();
    this.sift_down();
    return min;
  }
  

  private sift_up() {
    /*
      Garante que após inserir um novo elemento, a heap mantém a propriedade min-heap,
      movimentanto o elemento novo para "baixo" até que o pai tenha valor menor que os filhos
    */
    let insert_element = this.size();
    let p = this.parent(insert_element);
    while(this.get_index(p).distance > this.get_index(insert_element).distance) {
      this.swap(p, insert_element);
      insert_element = p;
      p = this.parent(insert_element);
    }
  }
  

  private sift_down() {
    /*
      Garante que após remover menor elemento (nó raiz)
      a heap mantém a propriedade min-heap,
      tornando o último elemento a raiz, e movimentando-o para baixo por meio de swap
      de forma que a raiz seja o menor elemento.
    */

    let last_element = 1; // último elemento tornou-se raiz no extract_min()
    while(true) {
      let left_child  = this.left(last_element);
      let right_child = this.right(last_element);

      let smaller = last_element; // indíce do menor elemento na heap
      if(left_child <= this.size() && this.get_index(left_child).distance < this.get_index(smaller).distance) {
        smaller = left_child;
      }

      if(right_child <= this.size() && this.get_index(right_child).distance < this.get_index(smaller).distance) {
        smaller = right_child;
      }

      if(last_element == smaller) {
        // propriedade de min-heap é valida
        break;
      }

      this.swap(last_element, smaller);
      last_element = smaller;
    }
  }


  private swap(i: number, j:number) {
    let temp = this.get_index(i);
    this.set_index(i, this.get_index(j));
    this.set_index(j, temp);
  }


  private parent(i: number) {
    if(i <= 1) return 1;
    return Math.floor(i  / 2);
  }


  private left(i: number) {
    return i * 2;
  }
  

  private right(i: number) {
    return (i * 2) + 1;
  }


  public size(): number {
    return this.heap.length;
  }


  is_empty(): boolean {
    return this.size() == 0
  }


  show_heap() {
    console.log(this.heap);
  }


  show() {
    console.log(this.heap);
    while(this.size() != 0) {
      console.log(this.extract_min());
    }
  }
}