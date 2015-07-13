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

function maxComparator(a, b) { return a - b; }
function minComparator(a, b) { return b - a; }
function maxRankComparator(a, b) { return a.rank - b.rank; }
function minRankComparator(a, b) { return b.rank - a.rank; }
function random(min, max) { return min + (max - min) * Math.random(); }
function min(arr) { return Math.min.apply(Math, arr); }
function max(arr) { return Math.max.apply(Math, arr); }

const rawData = [5,3,12,3,9, 1];

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
  });

  describe('size', function () {
    it('should support empty heap', function () {
      const heap = new Heapster();
      expect(heap.size()).toBe(0);
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

  describe('push', function () {
    it('should work with an empty heap', function () {
      const heap = new Heapster();
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        heap.push(random());
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap', function () {
      const heap = new Heapster(rawData, maxComparator);
      for (let i = 1; i < 100; ++i) {
        heap.push(random());
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap', function () {
      const heap = new Heapster(rawData, minComparator);
      for (let i = 1; i < 100; ++i) {
        heap.push(random());
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });
  });

  describe('pop', function () {

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
  });
});
