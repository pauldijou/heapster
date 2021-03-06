import Heapster from '../index';
import textTable from 'text-table';

// Play with those configurations if you need to...

// Log tests that take more than
const reportTimingOver = 10; // ms

// Sort test timings with the following rule
// Possible values:
// default: same order as the tests
// fullName: ordered by spec name
// elapsed: the longer the test takes to run, the higher on the table
// siblings: put default and indexed versions side by side to compare them
const timingsSort = 'elapsed';

// Run benchmarks.
// Since they takes several seconds, you might want to disable them to iterate faster
const withBenchmark = true;

// Log all the README samples, just to be sure we didn't put any crap in it
const withReadme = false;

// Default basic data for most of the tests
const rawData = [5, 3, 12, 3, 9, 1];
const rawRankData = [{rank: 5}, {rank: 3}, {rank: 12}, {rank: 3}, {rank: 9}, {rank: 1}];

// Some utils functions
function logElement(elem) {
  return isNaN(elem) ? elem.rank : elem;
}

function logArray(arr) {
  if (arr.length > 20) {
    return ['really big array']
  } else {
    return isNaN(arr[0]) ? arr.map( e => e.rank ) : arr;
  }
}

function hypeMessage(arr, pos, child, side) {
  return `${side} child [${child}:${logElement(arr[child])}] is greater than parent [${pos}:${logElement(arr[pos])}], ${logArray(arr)}`;
}

function append(message, more) {
  return (message ? message + '\n' : '') + more;
}

function isValidHeap(arr, comp, sym) {
  const result = { pass: true };
  for (let i = 0, l = arr.length; i < l; ++i) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < l && comp(arr[i], arr[left]) < 0) {
      result.pass = false;
      result.message = append(result.message, hypeMessage(arr, i, left, 'Left'));
    }
    if (right < l && comp(arr[i], arr[right]) < 0) {
      result.pass = false;
      result.message = append(result.message, hypeMessage(arr, i, right, 'Right'));
    }
    if (sym && typeof arr[i] === 'object' && arr[i][sym] !== i) {
      result.pass = false;
      result.message = append(result.message, `Wrong cached index: ${i} !== ${arr[i][sym]}`);
    }
  }
  return result;
}

const customMatchers = {
  toBeHype: function (util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        return isValidHeap(actual.elements, actual.comparator, actual.symbols.index);
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
  },
  toEqualByRank: function (util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        let pass = actual.length === expected.length;

        if (pass) {
          for (let i = 0, l = actual.length; i < l; ++i) {
            pass = pass && (actual[i].rank === expected[i].rank);
          }
        }

        return {
          pass: pass
        };
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
function root(arr, comp) {
  return arr.reduce(function (acc, value) {
    if (comp(acc, value) < 0) {
      acc = value;
    }
    return acc;
  }, arr[0]);
}

const timings = [];

const timingRepoter = {
  specStarted: function (spec) {
    timings.push({
      spec: spec,
      start: new Date()
    });
  },
  specDone: function (spec) {
    var timing = timings[timings.length - 1];
    timing.end = new Date();
    timing.elapsed = timing.end - timing.start;
  }
};

describe('Heapster', function () {
  beforeAll(function () {
    jasmine.addMatchers(customMatchers);
    jasmine.getEnv().addReporter(timingRepoter);
  });

  afterAll(function () {
    const displayedTimings = timings.filter(t => t.elapsed >= reportTimingOver)

    if (timingsSort && timingsSort !== 'default') {
      displayedTimings.sort(function (t1, t2) {
        switch (timingsSort) {
          case 'elapsed':
            return t2.elapsed - t1.elapsed
          case 'fullName':
            if (t1.spec.fullName < t2.spec.fullName) return -1;
            else if (t1.spec.fullName > t2.spec.fullName) return 1;
            else return 0;
          case 'siblings':
            const parts1 = t1.spec.fullName.split('] ');
            const parts2 = t2.spec.fullName.split('] ');
            if (parts1[1] < parts2[1]) return -1;
            else if (parts1[1] > parts2[1]) return 1;
            else if (parts1[0] < parts2[0]) return -1;
            else if (parts1[0] > parts2[0]) return 1;
            else return 0;
          default:
            return -1;
        }
      });
    }

    console.log('Timings:\n' + textTable(
      displayedTimings.map(function (t) {
        return [t.spec.fullName, t.elapsed, 'ms'];
      })
    , { align: [ 'l', 'r', 'l' ] }));
    console.log('----------------');
    console.log('Total: ' + timings.length + ' tests in ' + timings.reduce( (acc, t)=> acc + t.elapsed, 0) + 'ms');
  });

  describe('[default]', function () {
    runAllTests();
  });

  describe('[indexed]', function () {
    runAllTests({
      indexed: true
    });
  });

  if (withReadme) {
    runReadmeTests();
  }
});

function runAllTests(options) {
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
      const heap = new Heapster(options);
      expect(heap).toBeEmpty();
    });

    it('should support non-empty heap', function () {
      const heap = new Heapster(rawData);
      expect(heap.size()).toBe(rawData.length);
    });

    it('should work', function () {
      const heap = new Heapster(options);
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
      const heap1 = new Heapster(options);
      expect(heap1.isEmpty()).toBe(true);
      const heap2 = new Heapster([], options);
      expect(heap2.isEmpty()).toBe(true);
      const heap3 = new Heapster(options);
      heap3.push(1, 3);
      heap3.pop();
      heap3.pop();
      expect(heap3.isEmpty()).toBe(true);
    });

    it('should return false for non-empty heaps', function () {
      const heap1 = new Heapster([1, 4, 5], options);
      expect(heap1.isEmpty()).toBe(false);
      const heap3 = new Heapster(options);
      heap3.push(1, 3);
      expect(heap3.isEmpty()).toBe(false);
    });
  });

  describe('push', function () {
    it('should work with an empty heap', function () {
      const heap = new Heapster(options);
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push(random(-100, 100))).toBe(i);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap', function () {
      const heap = new Heapster(rawData, maxComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push(random(-100, 100))).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap', function () {
      const heap = new Heapster(rawData, minComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push(random(-100, 100))).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with an empty heap (objects)', function () {
      const heap = new Heapster(maxRankComparator, options);
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push({rank: random(-100, 100)})).toBe(i);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap (objects)', function () {
      const heap = new Heapster(rawRankData, maxRankComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push({rank: random(-100, 100)})).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap (objects)', function () {
      const heap = new Heapster(rawRankData, minRankComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.push({rank: random(-100, 100)})).toBe(i + rawData.length);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with several elements', function () {
      const heap = new Heapster(options);
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
      const heap = new Heapster(options);
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add(random(-100, 100))).toBe(heap);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap', function () {
      const heap = new Heapster(rawData, maxComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add(random(-100, 100))).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap', function () {
      const heap = new Heapster(rawData, minComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add(random(-100, 100))).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with an empty heap (objects)', function () {
      const heap = new Heapster(maxRankComparator, options);
      expect(heap.isEmpty()).toBe(true);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add({rank: random(-100, 100)})).toBe(heap);
        expect(heap.size()).toBe(i);
        expect(heap).toBeHype();
      }
    });

    it('should work with a max heap (objects)', function () {
      const heap = new Heapster(rawRankData, maxRankComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add({rank: random(-100, 100)})).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with a min heap (objects)', function () {
      const heap = new Heapster(rawRankData, minRankComparator, options);
      for (let i = 1; i < 100; ++i) {
        expect(heap.add({rank: random(-100, 100)})).toBe(heap);
        expect(heap.size()).toBe(i + rawData.length);
        expect(heap).toBeHype();
      }
    });

    it('should work with several elements', function () {
      const heap = new Heapster(options);
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
      const heap = new Heapster(options);
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
      const heap = new Heapster(options);
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
      const heap = new Heapster(rawData, minComparator, options);
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
      const heap = new Heapster(options);
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
      const heap = new Heapster([1, -1, 2, 4, 5], options);
      const clone = heap.clone();
      expect(clone).toBeHype();
      expect(clone.elements).toEqual(heap.elements);
      expect(clone.elements).not.toBe(heap.elements);
      expect(clone.comparator).toBe(heap.comparator);
    });
  });

  describe('has', function () {
    it('should work with primitives', function () {
      const heap = new Heapster([1, 2, 3], options);
      expect(heap.has(1)).toBe(true);
      expect(heap.has(4)).toBe(false);
      heap.push(4);
      expect(heap.has(4)).toBe(true);
    });

    it('should work with objects', function () {
      const heap = new Heapster(rawRankData, maxRankComparator, options);
      const element = {rank: Infinity};
      expect(heap.has(element)).toBe(false);
      heap.push(element);
      expect(heap.has(element)).toBe(true);
      heap.pop();
      expect(heap.has(element)).toBe(false);
    });
  });

  describe('update', function () {
    it('should keep the heap valid', function () {
      const heap = new Heapster(rawRankData, maxRankComparator, options);
      const element = heap.elements[3];
      const initRank = element.rank;
      expect(heap).toBeHype();
      element.rank = Infinity;
      expect(heap).not.toBeHype();
      expect(heap.root()).not.toBe(element);
      heap.update(element);
      expect(heap).toBeHype();
      expect(heap.root()).toBe(element);
      // Reset for next tests
      element.rank = initRank;
    });
  });

  describe('remove', function () {
    it('should remove an element', function () {
      const heap = new Heapster(rawRankData, maxRankComparator, options);
      const element = heap.elements[3];
      expect(heap.has(element)).toBe(true);
      heap.remove(element);
      expect(heap.has(element)).not.toBe(true);
      expect(heap).toBeHype();
    });
  });

  describe('merge', function () {
    it('should handle empty heaps', function () {
      const heap1 = new Heapster(options);
      const heap2 = new Heapster(options);
      const heap3 = heap1.merge(heap2);
      expect(heap3).not.toBe(heap1);
      expect(heap3.elements).toEqual([]);
    });

    it('should handle first empty heap', function () {
      const heap1 = new Heapster([1], options);
      const heap2 = new Heapster(options);
      const heap3 = heap1.merge(heap2);
      expect(heap3).not.toBe(heap1);
      expect(heap3.elements).toEqual([1]);
    });

    it('should handle second empty heap', function () {
      const heap1 = new Heapster(options);
      const heap2 = new Heapster([2], options);
      const heap3 = heap1.merge(heap2);
      expect(heap3).not.toBe(heap1);
      expect(heap3.elements).toEqual([2]);
    });

    it('should create a new heap', function () {
      const heap1 = new Heapster([1, 5, 3], options);
      const heap2 = new Heapster([8, 2, 6, 3], options);
      const heap3 = heap1.merge(heap2);
      expect(heap3).not.toBe(heap1);
      expect(heap3).toBeHype();
      expect(heap3.size()).toBe(7);
      expect(heap3.root()).toBe(8);
    });
  });

  describe('meld', function () {
    it('should handle empty heaps', function () {
      const heap1 = new Heapster(options);
      const heap2 = new Heapster(options);
      const heap3 = heap1.meld(heap2);
      expect(heap3).toBe(heap1);
      expect(heap3.elements).toEqual([]);
    });

    it('should handle first empty heap', function () {
      const heap1 = new Heapster([1], options);
      const heap2 = new Heapster(options);
      const heap3 = heap1.meld(heap2);
      expect(heap3).toBe(heap1);
      expect(heap3.elements).toEqual([1]);
    });

    it('should handle second empty heap', function () {
      const heap1 = new Heapster(options);
      const heap2 = new Heapster([2], options);
      const heap3 = heap1.meld(heap2);
      expect(heap3).toBe(heap1);
      expect(heap3.elements).toEqual([2]);
    });

    it('should create a new heap', function () {
      const heap1 = new Heapster([1, 5, 3], options);
      const heap2 = new Heapster([8, 2, 6, 3], options);
      const heap3 = heap1.meld(heap2);
      expect(heap3).toBe(heap1);
      expect(heap3).toBeHype();
      expect(heap3.size()).toBe(7);
      expect(heap3.root()).toBe(8);
    });
  });

  describe('sort', function () {
    it('should support empty heap', function () {
      const arr = new Heapster(options).sort();
      expect(arr).toEqual([]);
    });

    it('should sort an array of primitives', function () {
      const heap = new Heapster(rawData, options);
      expect(heap.sort()).toEqual(rawData.sort(heap.comparator));
    });

    it('should sort an array of primitives with custom comparator', function () {
      const heap = new Heapster(rawData, minComparator, options);
      expect(heap.sort()).toEqual(rawData.sort(minComparator));
    });

    it('should sort an array of objects', function () {
      const heap = new Heapster(rawRankData, maxRankComparator, options);
      expect(heap.sort()).toEqualByRank(rawRankData.sort(heap.comparator));
    });

    it('should sort an array of objects with custom comparator', function () {
      const heap = new Heapster(rawRankData, minRankComparator, options);
      expect(heap.sort()).toEqualByRank(rawRankData.sort(minRankComparator));
    });
  });

  if (withBenchmark) {
    runBenchmarkTest(options);
  }
}

function runBenchmarkTest(options) {
  describe('benchmark', function () {
    const heap = new Heapster(maxRankComparator, options);
    const size = 50000;
    const updated = 10000;
    const deleted = 10000;
    const contained = updated / 2;

    it('should push tons of elements - O(log(n))', function () {
      for(let i = 0; i < size; ++i) {
        heap.push({rank: random(-1000, 1000)});
      }
      expect(heap).toBeHype();
      expect(heap.size()).toBe(size);
    });

    it('should update random elements - O(n) vs O(log(n))', function () {
      for(let i = 0; i < updated; ++i) {
        const index = Math.floor(random(0, heap.size()));
        heap.elements[index].rank = random(-1000, 1000);
        heap.update(heap.elements[index]);
      }
      expect(heap).toBeHype();
    });

    it('should remove random elements - O(n) vs O(log(n))', function () {
      for(let i = 0; i < deleted; ++i) {
        const index = Math.floor(random(0, heap.size()));
        heap.remove(heap.elements[index]);
      }
      expect(heap).toBeHype();
    });

    it('should test if contains or not elements - O(n) vs O(1)', function () {
      const size = heap.size();
      let result = true;
      for(let i = 0; i < contained; ++i) {
        const index = Math.floor(random(0, size));
        result = result && heap.has(heap.elements[index]);
      }
      for(let i = 0; i < contained; ++i) {
        result = result && !heap.has({rank: random(-1000, 1000)});
      }
      expect(result).toBe(true);
    });

    it('should sort elements - O(n.log(n))', function () {
      // Just to measure perfs for now
      const arr = heap.sort();
      expect(arr.length).toBe(heap.size());
    });

    it('should compare to native sort', function () {
      const sorted = heap.elements.slice(0).sort(heap.comparator);
      expect(sorted.length).toBe(heap.size());
    });

    if (!options) {
      it('should measure indexOf - O(n)', function () {
        for(let i = 0; i < updated; ++i) {
          const index = Math.floor(random(0, heap.size()));
          heap.elements.indexOf(heap.elements[index]);
        }
      });
    }
  })
}

function runReadmeTests() {
  describe('README', function () {
    function section(title) {
      console.log('--------------------------------');
      console.log('## ' + title);
    }

    it('should print usage', function () {
      section('Usage');

      const maxHeap = new Heapster();
      maxHeap.push(1, 9, 3, -1, 5, 0);
      console.log(maxHeap.root()); // 9
      console.log(maxHeap.size()); // 6
      console.log(maxHeap.pop()); // 9
      console.log(maxHeap.root()); // 5
      console.log(maxHeap.sort()); // [-1, 0, 1, 3, 5]

      // Init a non-empty min-heap
      const minHeap = new Heapster([-2, 4, 3], (a,b) => b - a);
      console.log(minHeap.root()); // -2
      console.log(minHeap.pop()); // -2
      console.log(minHeap.root()); // 3
      minHeap.push(3, 2, 1, 7);

      // Static heap sort
      // Default to max-heap => from min to max
      console.log(Heapster.sort([4, -1, 5, 2])); // [-1, 2, 4, 5]
      // Or use a custom comparator function
      console.log(Heapster.sort([4, -1, 5, 2], (a,b) => b - a)); // [5, 4, 2, -1]
    });

    it('size', function () {
      section('Size');
      console.log(new Heapster([1, 2, 3]).size());
    });

    it('isEmpty', function () {
      section('isEmpty');
      console.log(new Heapster().isEmpty());
      console.log(new Heapster([1]).isEmpty());
    });

    it('push', function () {
      section('push');
      console.log(new Heapster().push(5));
      console.log(new Heapster().push(1, 5, 7));
    });

    it('pop', function () {
      section('pop');
      console.log(new Heapster().pop());
      console.log(new Heapster([4, 2, 10]).pop());
    });

    it('add', function () {
      section('add');
      console.log(new Heapster().add(1).add(5).add(3).elements);
    });

    it('root', function () {
      section('root');
      console.log(new Heapster([1, 5, 3]).root()); // 5
      console.log(new Heapster([1, 5, 3], (a,b) => b - a).root()); // 1
      // Setter
      const heap = new Heapster([4, 2, 3]);
      console.log(heap.root(1)); // return 4, the heap is now [3, 2, 1]
      console.log(heap.root(10)); // return 10, the heap is still [3, 2, 1]
    });

    it('has', function () {
      section('has');
      const element = {rank: 4};
      const heap = new Heapster([{rank: 1}, {rank: 4}], (a,b) => b.rank - a.rank);
      console.log(heap.has(element)); // false, works by reference
      heap.push(element);
      console.log(heap.has(element)); // true
    });

    it('update', function () {
      section('update');
      const elements = [{rank: 4}, {rank: 1}, {rank: 2}, {rank: 6}, {rank: 8}];
      const heap = new Heapster(elements, (a,b) => b.rank - a.rank);
      console.log(heap.root()); // {rank: 1}
      elements[1].rank = 5;
      // Right now, the heap is not longer valid, don't do any operation on it before calling the next line:
      heap.update(elements[1]);
      // Heap is valid again
      console.log(heap.root()); // {rank: 2}
    });

    it('remove', function () {
      section('remove');
      const heap = new Heapster([1, 2, 2, 3, 4]);
      console.log(heap.remove(3)); // true
      console.log(heap.remove(5)); // false
      console.log(heap.remove(2)); // true
      console.log(heap.remove(2)); // true
      console.log(heap.remove(2)); // false
    });


    it('sort', function () {
      section('sort');
      // Max-heap
      console.log(new Heapster([4, 1, 5, 3]).sort()); // [1, 3, 4, 5]
      // Min-heap
      console.log(new Heapster([4, 1, 5, 3], (a,b) => b - a).sort()); // [5, 4, 3, 1]
    });

    it('merge', function () {
      section('merge');
      const heap1 = new Heapster([2, 3, 4]);
      const heap2 = new Heapster([1, 5, 2]);
      const heap3 = heap1.merge(heap2); // [5, 4, 2, 3, 1, 2]
      console.log(heap3.elements);
      console.log(heap3 === heap1); // false
    });

    it('meld', function () {
      section('meld');
      const heap1 = new Heapster([2, 3, 4]);
      const heap2 = new Heapster([1, 5, 2]);
      const heap3 = heap1.meld(heap2); // [5, 4, 2, 3, 1, 2]
      console.log(heap3.elements);
      console.log(heap3 === heap1); // true
    });

    it('clone', function () {
      section('clone');
      const heap1 = new Heapster([1, 2, 3, 4]);
      const heap2 = heap1.clone();
      console.log(heap1 === heap2); // false
      console.log(heap1.elements === heap2.elements); // false
      console.log(heap1.size() === heap2.size()); // true
      for (let i = 0, l = heap1.size(); i < l; ++i) {
        console.log(heap1[i] === heap2[i]); // true
      }
    });

    it('toArray', function () {
      section('toArray');
      const heap = new Heapster([3, 6, 1, 2]);
      const arr = heap.toArray();
      console.log(Array.isArray(arr)); // true
      console.log(arr.length); // 4
      console.log(arr[0]); // 6, the root of the heap
      console.log(arr); // Might be [6, 3, 1, 2]
    });

    it('static heapify', function () {
      section('static heapify');
      console.log(Heapster.heapify([5, 3, 7, 1, 2, 10, 8]));
    });

    it('static sort', function () {
      section('static sort');
      console.log(Heapster.sort([5, 3, 7, 1, 2, 10, 8]));
    });

    it('elements', function () {
      section('elements');
      const heap = new Heapster([5, 3, 7, 1, 2, 10, 8]);
      console.log(heap.elements); // Might be [10, 3, 8, 1, 2, 7, 5]
    })
  });
}
