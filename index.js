const comparator = function (a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

// O(log(n))
function siftUp(arr, comp, pos) {
  // console.log('-------------- up -------------');
  // console.log('idx', pos, ':', arr[pos], arr);
  const elem = arr[pos];
  while(pos > 0) {
    const parent = (pos - 1) >> 1;
    // console.log('parent', parent, ':', arr[parent], comp(elem, arr[parent]));
    if (pos > 0 && comp(elem, arr[parent]) > 0) {
      arr[pos] = arr[parent];
      pos = parent;
    } else {
      break;
    }
  }
  arr[pos] = elem;
  return arr;
}

// O(log(n))
function siftDown(arr, comp, pos, end) {
  if (isNaN(end)) {
    end = arr.length;
  }
  // console.log('-----------------------');
  // console.log('idx', pos, ':', arr[pos],'end', end, 'arr', arr);
  let largest;
  const left = 2 * pos + 1,
        right = 2 * pos + 2;
  if (left < end && comp(arr[left], arr[pos]) > 0) {
    largest = left;
  } else {
    largest = pos;
  }

  // console.log('left', left, ':', arr[left], left < end, comp(arr[left], arr[pos]));
  // console.log('right', right, ':', arr[right], right < end, comp(arr[right], arr[largest]));
  if (right < end && comp(arr[right], arr[largest]) > 0) {
    largest = right;
  }

  // console.log('largest', largest);
  if (largest === pos) {
    // console.log('done', largest, arr);
    return arr;
  } else {
    const tmp = arr[pos];
    arr[pos] = arr[largest];
    arr[largest] = tmp;
    return siftDown(arr, comp, largest, end);
  }
}

export default class Heapster {
  constructor (...args) {
    if (typeof args[0] === 'function') {
      this.comparator = args[0];
      this.elements = [];
    } else {
      // console.log('######################################################################');
      this.comparator = args[1] || comparator;
      // Clone the array to prevent side effects since we are mutating it in place
      this.elements = Heapster.heapify((args[0] || []).slice(0), this.comparator);
    }
  }

  // O(n.log(n))
  static heapify(arr, comp = comparator) {
    if (arr === undefined || arr === null) { return arr; }
    const size = arr.length;
    for (let i = (size - 1) >> 1; i >= 0; --i) {
      siftDown(arr, comp, i);
    }
    return arr;
  }

  // O(n.log(n))
  static sort(arr, comp = comparator) {
    return new Heapster(arr, comp).sort();
  }

  // O(1)
  size () {
    return this.elements.length;
  }

  // O(1)
  isEmpty () {
    return this.size() === 0;
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
        siftDown(this.elements, this.comparator, 0);
        return first;
      }
    }

    return this.elements[0];
  }

  // O(log(n)) for each element
  push (...elems) {
    for (let elem of elems) {
      this.elements.push(elem);
      siftUp(this.elements, this.comparator, this.size() - 1);
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

  // O(n)
  has (elem) {
    return this.elements.indexOf(elem) > -1;
  }

  // O(n.log(n))
  update (elem) {
    return this.updateAt(this.elements.indexOf(elem), elem);
  }

  // O(log(n))
  updateAt (index, value) {
    if (index > -1 && index < this.size()) {
      this.elements[index] = value;
      siftUp(this.elements, this.comparator, index);
      siftDown(this.elements, this.comparator, index);
    }
    return this;
  }

  // O(n.log(n))
  delete (elem) {
    return this.deleteAt(this.elements.indexOf(elem));
  }

  // O(log(n))
  deleteAt (index) {
    if (index > -1 && index < this.size()) {
      if (index === this.size() - 1) {
        this.elements.pop();
      } else {
        this.elements[index] = this.elements.pop();
        siftDown(this.elements, this.comporator, index);
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
    for(let i = result.length; i > 0; --i) {
      const tmp = result[0];
      result[0] = result[i];
      result[i] = tmp;
      siftDown(result, this.comparator, 0, i - 1);
    }
    return result;
  }

  toArray () {
    return this.elements.slice(0);
  }
}
