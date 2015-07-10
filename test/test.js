import Heapster from '../index';

function isValidHeap(arr, comp) {
  const result = { pass: true };
  for (let i = 0, l = arr.length; i < l; ++i) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < l && comp(arr[i], arr[left]) < 0) {
      result.pass = false;
      result.message = `Left child [${left}:${arr[left]}] is greater than parent [${i}:${arr[i]}], ${arr}`;
    }
    if (right < l && comp(arr[i], arr[right]) < 0) {
      result.pass = false;
      result.message = `Right child [${right}:${arr[right]}] is greater than parent [${i}:${arr[i]}], ${arr}`;
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
  }
};

function maxRankComparator(a, b) {
  return a.rank - b.rank;
}

function minRankComparator(a, b) {
  return b.rank - a.rank;
}

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

    it('should init a new heap', function () {
      const heap = new Heapster(maxRankComparator);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual([]);
      expect(heap.comparator).toBe(maxRankComparator);
    });

    it('should init a new heap', function () {
      const heap = new Heapster([5,3,12,3,9, 1]);
      expect(heap).toBeHype();
      expect(heap.elements).toEqual(jasmine.any(Array));
      expect(heap.comparator).toEqual(jasmine.any(Function));
    });
  });
});
