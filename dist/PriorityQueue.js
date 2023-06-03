export default class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    insert(value) {
        // Insere como último elemento da árvore
        this.heap.push(value);
        this.sift_up();
    }
    extract_min() {
        if (this.size() == 0)
            return undefined;
        let min = this.heap[0];
        let last_node = this.size() - 1;
        this.heap[0] = this.heap[last_node];
        this.heap.pop();
        this.sift_down();
        return min;
    }
    sift_up() {
        /*
          Garante que após inserir um novo elemento, a heap mantém a propriedade min-heap,
          movimentanto o elemento novo para "baixo" até que o pai tenha valor menor que os filhos
        */
        let insert_element = this.size() - 1;
        let p = this.parent(insert_element);
        while (this.heap[p] > this.heap[insert_element]) {
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
        let last_element = 0; // último elemento tornou-se raiz no extract_min()
        while (true) {
            let left_child = this.left(last_element);
            let right_child = this.right(last_element);
            let smaller = last_element; // indíce do menor elemento na heap
            if (this.heap[left_child] < this.heap[smaller]) {
                smaller = left_child;
            }
            if (this.heap[right_child] < this.heap[smaller]) {
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
        let temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    parent(i) {
        if (i == 0) {
            return 0;
        }
        return Math.floor((i - 1) / 2);
    }
    left(i) {
        return i * 2;
    }
    right(i) {
        return i * 2 + 1;
    }
    size() {
        return this.heap.length;
    }
    show() {
        console.log(this.heap);
        while (this.size() != 0) {
            console.log(this.extract_min());
        }
    }
}
//# sourceMappingURL=PriorityQueue.js.map