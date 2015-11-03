const comparator = function (a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const symbols = {
  index: Symbol && Symbol('index')
};

function isNumber(value) {
  return typeof value === 'number';
}

function indexOf(arr, elem, sym) {
  if(sym && isNumber(elem[sym])) {
    return elem[sym];
  } else {
    return arr.indexOf(elem);
  }
}

function updateIndexAt(arr, index, sym) {
  if (sym && typeof arr[index] === 'object') {
    arr[index][sym] = index;
  }
}

// O(log(n))
function siftUp(arr, comp, pos, sym) {
  const elem = arr[pos];
  while(pos > 0) {
    const parentPos = (pos - 1) >> 1;
    const parent = arr[parentPos];
    if (pos > 0 && comp(elem, parent) > 0) {
      arr[pos] = parent;
      updateIndexAt(arr, pos, sym);
      pos = parentPos;
    } else {
      break;
    }
  }
  arr[pos] = elem;
  updateIndexAt(arr, pos, sym);
  return arr;
}

// O(log(n))
function siftDown(arr, comp, pos, end, sym) {
  if (!isNumber(end)) {
    sym = end;
    end = arr.length;
  }
  let largest;
  const left = 2 * pos + 1,
        right = 2 * pos + 2;
  if (left < end && comp(arr[left], arr[pos]) > 0) {
    largest = left;
  } else {
    largest = pos;
  }

  if (right < end && comp(arr[right], arr[largest]) > 0) {
    largest = right;
  }

  if (largest === pos) {
    updateIndexAt(arr, pos, sym);
    return arr;
  } else {
    const tmp = arr[pos];
    arr[pos] = arr[largest];
    arr[largest] = tmp;
    updateIndexAt(arr, pos, sym);
    updateIndexAt(arr, largest, sym);
    return siftDown(arr, comp, largest, end, sym);
  }
}

export default class Heapster {
  constructor (elems, comp, opts) {
    if (!Array.isArray(elems)) {
      opts = comp;
      comp = elems;
      elems = [];
    }

    if (typeof comp !== 'function') {
      opts = comp;
      comp = comparator;
    }

    if (opts === undefined) {
      opts = {};
    }

    this.comparator = comp;
    this.symbols = {};

    if (opts.indexed) {
      this.symbols.index = symbols.index;
    }

    this.elements = Heapster.heapify(elems.slice(0), this.comparator, this.symbols.index);
  }

  // O(n.log(n))
  static heapify(arr, comp = comparator, sym) {
    if (!Array.isArray(arr)) { return arr; }

    const pivot = (arr.length - 1) >> 1;

    if (sym) {
      for (let i = arr.length - 1; i > pivot; --i) {
        updateIndexAt(arr, i, sym);
      }
    }

    for (let i = pivot; i >= 0; --i) {
      siftDown(arr, comp, i, sym);
    }

    return arr;
  }

  // O(n.log(n))
  static sort(arr, comp, opts) {
    return new Heapster(arr, comp, opts).sort();
  }

  // O(1)
  static clean(elem) {
    if (symbols.index) {
      delete elem[symbols.index];
    }
    return elem;
  }

  // O(1)
  size () {
    return this.elements.length;
  }

  // O(1)
  isEmpty () {
    return this.size() === 0;
  }

  // O(1)
  clean (elem) {
    return Heapster.clean(elem);
  }

  // get: O(1)
  // set: O(log(n))
  root (elem) {
    if (elem !== undefined) {
      const first = this.root();
      if (first === undefined || this.comparator(first, elem) < 0) {
        return elem;
      } else {
        this.elements[0] = elem;
        siftDown(this.elements, this.comparator, 0, this.symbols.index);
        return first;
      }
    }

    return this.elements[0];
  }

  // O(log(n)) for each element
  push (...elems) {
    for (let elem of elems) {
      this.elements.push(elem);
      siftUp(this.elements, this.comparator, this.size() - 1, this.symbols.index);
    }
    return this.size();
  }

  // O(log(n))
  add (elem) {
    this.push(elem);
    return this;
  }

  // O(log(n))
  pop () {
    return this.root(this.elements.pop());
  }

  // O(1)
  clone () {
    const result = new Heapster(this.comparator);
    result.elements = this.elements.slice(0);
    return result;
  }

  // O(n) or O(1)
  has (elem) {
    if (this.symbols.index && typeof elem === 'object') {
      return isNumber(elem[this.symbols.index]) && (elem === this.elements[elem[this.symbols.index]]);
    } else {
      return this.elements.indexOf(elem) > -1;
    }
  }

  // O(n) or O(log(n)) if indexed
  update (elem) {
    return this.updateAt(indexOf(this.elements, elem, this.symbols.index), elem);
  }

  // O(log(n))
  updateAt (index, value) {
    if (index > -1 && index < this.size()) {
      if (this.elements[index] !== value) {
        this.elements[index] = value;
      }
      siftUp(this.elements, this.comparator, index, this.symbols.index);
      siftDown(this.elements, this.comparator, index, this.symbols.index);
    }
    return this;
  }

  // O(n) or O(log(n)) if indexed
  remove (elem) {
    return this.removeAt(indexOf(this.elements, elem, this.symbols.index));
  }

  // O(log(n))
  removeAt (index) {
    if (index > -1 && index < this.size()) {
      if (index === this.size() - 1) {
        this.elements.pop();
      } else {
        this.elements[index] = this.elements.pop();
        siftUp(this.elements, this.comparator, index, this.symbols.index);
        siftDown(this.elements, this.comparator, index, this.symbols.index);
      }
      return true;
    }
    return false;
  }

  merge (heap) {
    const result = this.clone();
    result.push.apply(result, heap.elements);
    return result;
  }

  meld (heap) {
    this.push.apply(this, heap.elements);
    return this;
  }

  // O(n.log(n))
  sort () {
    const result = this.elements.slice(0);
    for(let i = result.length - 1; i > 0; --i) {
      const tmp = result[0];
      result[0] = result[i];
      result[i] = tmp;
      siftDown(result, this.comparator, 0, i, this.symbols.index);
    }
    return result;
  }

  toArray () {
    return this.elements.slice(0);
  }
}
