import Heapster from '../index';

function logElement(elem) {
  return isNaN(elem) ? elem.rank : elem;
}

function logArray(arr) {
  return isNaN(arr[0]) ? arr.map( e => e.rank ) : arr;
}

function hypeMessage(arr, pos, child, side) {
  return `${side} child [${child}:${logElement(arr[child])}] is greater than parent [${pos}:${logElement(arr[pos])}], ${logArray(arr)}`;
}

function isValidHeap(arr, comp) {
  const result = { pass: true };
  for (let i = 0, l = arr.length; i < l; ++i) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < l && comp(arr[i], arr[left]) < 0) {
      result.pass = false;
      result.message = hypeMessage(arr, i, left, 'Left');
    }
    if (right < l && comp(arr[i], arr[right]) < 0) {
      result.pass = false;
      result.message = hypeMessage(arr, i, right, 'Right');
    }
  }
  return result;
}

const customMatchers = {
  toBeHype: function (util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        return isValidHeap(actual.elements, actual.comparator);
      }
    };
  },
  toBeEmpty: function () {
    return {
      compare: function (actual) {
        const result = actual.isEmpty();
        const message = `Actually, the heap has ${actual.size()} elements: ${logArray(actual.elements)}`;
        return {
          pass: result,
          message: message
        };
      }
    }
  }
};

function maxComparator(a, b) { return a - b; }
function minComparator(a, b) { return b - a; }
function maxRankComparator(a, b) { return a.rank - b.rank; }
function minRankComparator(a, b) { return b.rank - a.rank; }
function random(min, max) { return min + (max - min) * Math.random(); }
function min(arr) { return Math.min.apply(Math, arr); }
function max(arr) { return Math.max.apply(Math, arr); }
function root(arr, comp) {
  return arr.reduce(function (acc, value) {
    if (comp(acc, value) < 0) {
      acc = value;
    }
    return acc;
  }, arr[0]);
}

const rawData = [5, 3, 12, 3, 9, 1];
const rawRankData = [{rank: 5}, {rank: 3}, {rank: 12}, {rank: 3}, {rank: 9}, {rank: 1}];

describe('Heapster', function () {
  beforeAll(function () {
    jasmine.addMatchers(customMatchers);
  });

  describe('constructor', function () {
    it('should init a new empty heap', function () {
      const heap = new Heapster();
      expect(heap).toBeHype();
      expect(heap.elements).toEqual([]);
      expect(heap.comparator).toEqual(jasmine.any(Function));
    });

    it('should init a new heap with custom comporator', function () {
      const heap = new Heapster(maxRankComparator);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual([]);
      expect(heap.comparator).toBe(maxRankComparator);
    });

    it('should init a new heap', function () {
      const heap = new Heapster(rawData);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual(jasmine.any(Array));
      expect(heap.comparator).toEqual(jasmine.any(Function));
    });

    it('should init a new max heap', function () {
      const heap = new Heapster(rawData, maxComparator);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual(jasmine.any(Array));
      expect(heap.comparator).toEqual(jasmine.any(Function));
    });

    it('should init a new min heap', function () {
      const heap = new Heapster(rawData, minComparator);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual(jasmine.any(Array));
      expect(heap.comparator).toEqual(jasmine.any(Function));
    });

    it('should init a new max heap with objects', function () {
      const heap = new Heapster(rawRankData, maxRankComparator);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual(jasmine.any(Array));
      expect(heap.comparator).toEqual(jasmine.any(Function));
    });

    it('should init a new min heap with objects', function () {
      const heap = new Heapster(rawRankData, minRankComparator);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual(jasmine.any(Array));
      expect(heap.comparator).toEqual(jasmine.any(Function));
    });
  });

  describe('size', function () {
    it('should support empty heap', function () {
      const heap = new Heapster();
      expect(heap).toBeEmpty();
    });

    it('should support non-empty heap', function () {
      const heap = new Heapster(rawData);
      expect(heap.size()).toBe(rawData.length);
    });

    it('should work', function () {
      const heap = new Heapster();
      expect(heap.size()).toBe(0);
      heap.push(1);
      expect(heap.size()).toBe(1);
      heap.pop();
      expect(heap.size()).toBe(0);
      heap.pop();
      expect(heap.size()).toBe(0);
      heap.pop();
      expect(heap.size()).toBe(0);
      heap.push(1);
      expect(heap.size()).toBe(1);
      heap.push(3);
      expect(heap.size()).toBe(2);
      heap.push(2);
      expect(heap.size()).toBe(3);
      heap.pop();
      expect(heap.size()).toBe(2);
      heap.push(5);
      expect(heap.size()).toBe(3);
      heap.push(-1);
      expect(heap.size()).toBe(4);
      expect(heap).toBeHype();
    });
  });

  describe('isEmpty', function () {
    it('should return true for empty heaps', function () {
      const heap1 = new Heapster();
      expect(heap1.isEmpty()).toBe(true);
      const heap2 = new Heapster([]);
      expect(heap2.isEmpty()).toBe(true);
      const heap3 = new Heapster();
      heap3.push(1, 3);
      heap3.pop();
      heap3.pop();
      expect(heap3.isEmpty()).toBe(true);
    });

    it('should return false for non-empty heaps', function () {
      const heap1 = new Heapster([1, 4, 5]);
      expect(heap1.isEmpty()).toBe(false);
      const heap3 = new Heapster();
      heap3.push(1, 3);
      expect(heap3.isEmpty()).toBe(false);
    });
  });

  describe('push', function () {
    it('should work with an empty heap', function () {
      const heap = new Heapster();
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push(random(-100, 100))).toBe(i);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap', function () {
      const heap = new Heapster(rawData, maxComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push(random(-100, 100))).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap', function () {
      const heap = new Heapster(rawData, minComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push(random(-100, 100))).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with an empty heap (objects)', function () {
      const heap = new Heapster(maxRankComparator);
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push({rank: random(-100, 100)})).toBe(i);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap (objects)', function () {
      const heap = new Heapster(rawRankData, maxRankComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push({rank: random(-100, 100)})).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap (objects)', function () {
      const heap = new Heapster(rawRankData, minRankComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push({rank: random(-100, 100)})).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with several elements', function () {
      const heap = new Heapster();
      heap.push(1, 4, -2, 5);
      expect(heap.size()).toBe(4);
      expect(heap).toBeHype();
      heap.push(-2, 10, 1, 1, 6, 2);
      expect(heap.size()).toBe(10);
      expect(heap).toBeHype();
    })
  });

  describe('add', function () {
    it('should work with an empty heap', function () {
      const heap = new Heapster();
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add(random(-100, 100))).toBe(heap);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap', function () {
      const heap = new Heapster(rawData, maxComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add(random(-100, 100))).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap', function () {
      const heap = new Heapster(rawData, minComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add(random(-100, 100))).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with an empty heap (objects)', function () {
      const heap = new Heapster(maxRankComparator);
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add({rank: random(-100, 100)})).toBe(heap);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap (objects)', function () {
      const heap = new Heapster(rawRankData, maxRankComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add({rank: random(-100, 100)})).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap (objects)', function () {
      const heap = new Heapster(rawRankData, minRankComparator);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add({rank: random(-100, 100)})).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with several elements', function () {
      const heap = new Heapster();
      heap.add(1).add(4).add(-2).add(5);
      expect(heap.size()).toBe(4);
      expect(heap).toBeHype();
      heap.add(-2).add(10).add(1).add(1).add(6).add(2);
      expect(heap.size()).toBe(10);
      expect(heap).toBeHype();
    })
  });

  describe('pop', function () {
    it('should corn', function () {
      const heap = new Heapster();
      expect(heap.pop()).toBe(undefined);
      expect(heap.pop()).toBe(undefined);
      heap.push(1);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(undefined);
      heap.push(1, 3, 5, 2, 4);
      expect(heap.pop()).toBe(5);
      expect(heap.pop()).toBe(4);
      expect(heap.pop()).toBe(3);
      expect(heap.pop()).toBe(2);
      heap.push(6, 10, -4, 0.5, Math.PI);
      expect(heap.pop()).toBe(10);
      expect(heap.pop()).toBe(6);
      expect(heap.pop()).toBe(Math.PI);
      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(0.5);
      expect(heap.pop()).toBe(-4);
    });
  });

  describe('root', function () {
    it('should be a getter', function () {
      const heap = new Heapster();
      expect(heap.root()).toBe(undefined);
      heap.push(1);
      expect(heap.root()).toBe(1);
      heap.push(1);
      expect(heap.root()).toBe(1);
      heap.push(4);
      expect(heap.root()).toBe(4);
      heap.push(2);
      expect(heap.root()).toBe(4);
      heap.push(10);
      expect(heap.root()).toBe(10);
      heap.push(10);
      expect(heap.root()).toBe(10);
      heap.push(-2);
      expect(heap.root()).toBe(10);
    });

    it('should still be a getter', function () {
      const heap = new Heapster(rawData, minComparator);
      const minValue = min(rawData);
      expect(heap.root()).toBe(minValue);
      heap.push(1);
      expect(heap.root()).toBe(Math.min(1, minValue));
      heap.push(1/2);
      expect(heap.root()).toBe(Math.min(1/2, minValue));
      heap.push(-1);
      expect(heap.root()).toBe(Math.min(-1, minValue));
      heap.push(2);
      expect(heap.root()).toBe(Math.min(-1, minValue));
      heap.push(10);
      expect(heap.root()).toBe(Math.min(-1, minValue));
      heap.push(10);
      expect(heap.root()).toBe(Math.min(-1, minValue));
      heap.push(-2);
      expect(heap.root()).toBe(Math.min(-2, minValue));
    });

    it('should be a setter', function () {
      const heap = new Heapster();
      expect(heap.root(1)).toBe(1);
      expect(heap).toBeEmpty();
      heap.push(5, 3, 10, 6, 1);

      expect(heap.root(7)).toBe(10);
      expect(heap.root()).toBe(7);
      expect(heap.size()).toBe(5);
      expect(heap).toBeHype();

      expect(heap.root(4)).toBe(7);
      expect(heap.root()).toBe(6);
      expect(heap.size()).toBe(5);
      expect(heap).toBeHype();

      expect(heap.root(11)).toBe(11);
      expect(heap.root()).toBe(6);
      expect(heap.size()).toBe(5);
      expect(heap).toBeHype();

      expect(heap.root(-1)).toBe(6);
      expect(heap.root()).toBe(5);
      expect(heap.size()).toBe(5);
      expect(heap).toBeHype();
    });
  });

  describe('clone', function () {
    it('should create a clone', function () {
      const heap = new Heapster([1, -1, 2, 4, 5]);
      const clone = heap.clone();
      expect(clone).toBeHype();
      expect(clone.elements).toEqual(heap.elements);
      expect(clone.elements).not.toBe(heap.elements);
      expect(clone.comparator).toBe(heap.comparator);
    });
  });

  describe('has', function () {

  });
  
  describe('update', function () {

  });

  describe('delete', function () {

  });

  describe('merge', function () {

  });

  describe('meld', function () {

  });

  describe('sort', function () {

  });
});
