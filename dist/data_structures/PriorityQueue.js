export default class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    set_index(i, elem) {
        if (i < 1 || i > this.size()) {
            throw new Error(`Índice inválido: ${i}, size atual é ${this.size()}`);
        }
        this.heap[i - 1] = elem;
    }
    get_index(i) {
        /*
          Para simplificar implementação
          o get_index assume indexação apartir de 1
        */
        if (i < 1 || i > this.size()) {
            throw new Error(`Índice inválido: ${i}, size atual é ${this.size()}`);
        }
        return this.heap[i - 1];
    }
    insert(value) {
        // Insere como último elemento da árvore
        this.heap.push(value);
        if (this.size() > 1) {
            this.sift_up();
        }
    }
    extract_min() {
        if (this.size() == 0)
            return undefined;
        let min = this.get_index(1);
        let last_node = this.size();
        this.set_index(1, this.get_index(last_node));
        this.heap.pop();
        this.sift_down();
        return min;
    }
    sift_up() {
        /*
          Garante que após inserir um novo elemento, a heap mantém a propriedade min-heap,
          movimentanto o elemento novo para "baixo" até que o pai tenha valor menor que os filhos
        */
        let insert_element = this.size();
        let p = this.parent(insert_element);
        while (this.get_index(p).value > this.get_index(insert_element).value) {
            this.swap(p, insert_element);
            insert_element = p;
            p = this.parent(insert_element);
        }
    }
    sift_down() {
        /*
          Garante que após remover menor elemento (nó raiz)
          a heap mantém a propriedade min-heap,
          tornando o último elemento a raiz, e movimentando-o para baixo por meio de swap
          de forma que a raiz seja o menor elemento.
        */
        let last_element = 1; // último elemento tornou-se raiz no extract_min()
        while (true) {
            let left_child = this.left(last_element);
            let right_child = this.right(last_element);
            let smaller = last_element; // indíce do menor elemento na heap
            if (left_child <= this.size() && this.get_index(left_child).value < this.get_index(smaller).value) {
                smaller = left_child;
            }
            if (right_child <= this.size() && this.get_index(right_child).value < this.get_index(smaller).value) {
                smaller = right_child;
            }
            if (last_element == smaller) {
                // propriedade de min-heap é valida
                break;
            }
            this.swap(last_element, smaller);
            last_element = smaller;
        }
    }
    swap(i, j) {
        let temp = this.get_index(i);
        this.set_index(i, this.get_index(j));
        this.set_index(j, temp);
    }
    parent(i) {
        if (i <= 1)
            return 1;
        return Math.floor(i / 2);
    }
    left(i) {
        return i * 2;
    }
    right(i) {
        return (i * 2) + 1;
    }
    size() {
        return this.heap.length;
    }
    is_empty() {
        return this.size() == 0;
    }
    show_heap() {
        console.log(this.heap);
    }
    show() {
        console.log(this.heap);
        while (this.size() != 0) {
            console.log(this.extract_min());
        }
    }
}
//# sourceMappingURL=PriorityQueue.js.map