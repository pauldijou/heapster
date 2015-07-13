const comparator = function (a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

// O(log(n))
function siftUp(arr, pos, comp) {
  // console.log('-------------- up -------------');
  // console.log('idx', pos, ':', arr[pos], arr);
  const elem = arr[pos];
  while(pos > 0) {
    let parent = (pos - 1) >> 1;
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
function siftDown(arr, pos, end, comp) {
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
    return siftDown(arr, largest, end, comp);
  }
}

export default class Heapster {
  constructor (...args) {
    if (typeof args[0] === 'function') {
      this.elements = [];
      this.comparator = args[0];
    } else {
      // console.log('######################################################################');
      this.comparator = args[1] || comparator;
      // Clone the array to prevent side effects since we are mutating it in place
      this.elements = Heapster.heapify((args[0] || []).slice(0), this.comparator);
    }
  }

  // O(n.log(n))
  static heapify(arr, comp = comparator) {
    const size = arr.length;
    for (let i = (size - 1) >> 1; i >= 0; --i) {
      siftDown(arr, i, size, comp);
    }
    return arr;
  }

  // O(n.log(n))
  static heapSort(arr, comp = comparator) {
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
    if (elem) {
      const first = this.root();
      if (!first || this.comparator(elem, first) < 0) {
        return elem;
      } else {
        this.elements[0] = elem;
        siftDown(this.elements, 0, this.size(), this.comparator);
        return first;
      }
    }

    return this.elements[0];
  }

  // O(log(n))
  push (elem) {
    this.elements.push(elem);
    siftUp(this.elements, this.size() - 1, this.comparator);
    return this;
  }

  // O(log(n))
  pop () {
    let result = this.elements.pop();
    if (!this.isEmpty()) {
      result = this.root(result);
    }
    return result;
  }

  // O(1)
  copy () {
    const result = new Heapster(this.comparator);
    result.elements = this.elements.slice(0);
    return result;
  }

  // O(n.log(n))
  update (elem) {
    if (isNaN(elem)) {
      elem = this.elements.indexOf(elem);
    }

    if (elem > -1) {

    }

  }

  // O(n.log(n))
  delete (eleme) {
    if (isNaN(elem)) {
      elem = this.elements.indexOf(elem);
    }

    if (elem > -1) {

    }
  }

  merge () {

  }

  meld () {

  }

  // O(n.log(n))
  sort () {
    const result = this.elements.slice(0);
    for(let i = result.length; i > 0; --i) {
      const tmp = result[0];
      result[0] = result[i];
      result[i] = tmp;
      siftDown(result, 0, i - 1, this.comparator);
    }
    return result;
  }

  toArray () {
    return this.elements;
  }
}
