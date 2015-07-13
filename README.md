# Heapster

A binary heap implementation so hype it's using ES 2015 (aka ES6) syntax only. Gluten and dependency free of course.

## Install

```
npm install heapster
```

```
bower install heapster
```

## Usage

```javascript
import Heapster from 'heapster';

// Default is an empty max-heap
const maxHeap = new Heapster();
maxHeap.push(1, 4, 5, 6);
console.log(maxHeap.root()); // 6
console.log(maxHeap.size()); // 4
console.log(maxHeap.pop()); // 6
console.log(maxHeap.root()); // 5

// Init a non-empty min-heap
const minHeap = new Heapster([-2, 4, 3], (a,b) => b - a);
console.log(minHeap.root()); // -2
console.log(minHeap.pop()); // -2
console.log(minHeap.root()); // 3
minHeap.push(3, 2, 1, 7);
console.log(minHeap.sort()); // [1, 2, 3, 3, 4, 7]

// Static heap sort
// Default to max-heap => from max to min
console.log(Heapster.sort([4, -1, 5, 2])); // [5, 4, 2, -1]
// You can reverse to have from min to max
console.log(Heapster.sort([4, -1, 5, 2]).reverse()); // [-1, 2, 4, 5]
// Or use a custom comparator function
console.log(Heapster.sort([4, -1, 5, 2]), (a,b) => b - a); // [-1, 2, 4, 5]
```

## Pro-tip

Since it's a default export, you can name the import whatever you want. If you prefer using `Heap` as the name of the class, just do:

```javascript
import Heap from 'heapster';

const heap = new Heap();
```

## API

### constructor([elements: Array], [comparator: Function]): Heapster

Create a new heap.

```javascript
// Empty max-heap with default comparator
new Heapster();
// Non-empty max-heap with default comparator
new Heapster([1, 3, 4]);
// Empty min-heap with custom comparator
new Heapster((a,b) => b - a);
// Non-empty min-heap with custom comparator
new Heapster([{rank: 1, rank: 3}], (a,b) => b.rank - a.rank);
```

### size(): Number

Return the size of the heap.

```javascript
new Heapster([1, 2, 3]).size(); // 3
```

### isEmpty(): Boolean

Test if the heap is empty or not.

```javascript
new Heapster().isEmpty(); // true
new Heapster([1]).isEmpty(); // false
```

### push(...elements: Any): Number

Push one or more elements to the heap and return its new size.

```javascript
new Heapster().push(5); // 1, heap is [5]
new Heapster().push(1, 5, 7); // 3, heap is [7, 1, 5]
```

### pop(): Any

Remove the root of the heap and return it.

```javascript
new Heapster().pop(); // undefined, heap is []
new Heapster([4, 2, 10]).pop(); // 10, heap is [4, 2]
```

### add(element: Any): Heapster

Just like push but accept only one element at a time and return the heap itself to do chaining.

```javascript
new Heapster().add(1).add(5).add(3); // heap is [5, 1, 3]
```

### root([element: Any]): Any

If not argument, return the root of the heap as a normal getter. If one argument, it will try to set the root of the heap with the argument and return the deleted heap. It's like doing a push() and a pop() at the same time with some optimizations. If the argument is greater than the current root (according to the heap comparator), it will return the argument and do nothing.

```javascript
// Getter
new Heapster([1, 5, 3]).root(); // 5
new Heapster([1, 5, 3], (a,b) => b - a).root(); // 1
// Setter
const heap = new Heapster([4, 2, 3]);
heap.root(1); // return 4, the heap is now [3, 2, 1]
heap.root(10); // return 10, the heap is still [3, 2, 1]
```

### has(element: Any): Boolean

Return true if the heap contains the element, false is not.

```javascript
const element = {rank: 4};
const heap = new Heapster([{rank: 1}, {rank: 4}], (a,b) => b.rank - a.rank);
heap.has(element); // false, works by reference
heap.push(element);
heap.has(element); // true
```

### update(element: Any): Heapster

Call this method if you edited an element and it might change its place in the heap.

```javascript
const elements = [{rank: 4}, {rank: 1}, {rank: 2}, {rank: 6}, {rank: 8}];
const heap = new Heapster(elements, (a,b) => b.rank - a.rank);
console.log(heap.root()); // {rank: 1}
elements[1].rank = 5;
// Right now, the heap is not longer valid, don't do any operation on it before calling the next line:
heap.update(elements[1]);
// Heap is valid again
console.log(heap.root()); // {rank: 2}
```

### delete(element: Any): Boolean

Try to delete an element of the heap. Return true if it did delete something and false if not.

```javascript
const heap = new Heapster([1, 2, 2, 3, 4]);
heap.delete(3); // true
heap.delete(5); // false
heap.delete(2); // true
heap.delete(2); // true
heap.delete(2); // false
```

### sort(): Array

Sort the elements of the heap according to its comparator and return the resulting array.

```javascript
// Max-heap
new Heapster([4, 1, 5, 3]).sort(); // [5, 4, 3, 1]
// Min-heap
new Heapster([4, 1, 5, 3], (a,b) => b - a).sort(); // [1, 3, 4, 5]
```

### merge(heap: Heapster): Heapster

Merge the current heap with another one and create a new resulting heap.

```javascript
const heap1 = new Heapster([2, 3, 4]);
const heap2 = new Heapster([1, 5, 2]);
const heap3 = heap1.merge(heap2); // [5, 3, 4, 2, 1, 2]
console.log(heap3 === heap1); // false
```

### meld(heap: Heapster): Heaspter

Merge another heap inside the current one.

```javascript
const heap1 = new Heapster([2, 3, 4]);
const heap2 = new Heapster([1, 5, 2]);
const heap3 = heap1.merge(heap2); // [5, 3, 4, 2, 1, 2]
console.log(heap3 === heap1); // true
```

### toArray(): Array

Return a copy of the elements of the heap as an array.

```javascript
const heap = new Heapster([3, 6, 1, 2]);
const arr = heap.toArray();
console.log(Array.isArray(arr)); // true
console.log(arr.length); // 4
console.log(arr[0]); // 6, the root of the heap
console.log(arr); // Might be [6, 3, 1, 2]
```

## Properties

### elements

The array containing all the elements of the heap. The first element is the root. The two children of an element at index `i` are at indexes `2i+1` and `2i+2`. There are no rule that the left child should be greater or lower than the right child so don't rely on anything except that a parent will always be greater than its children according to the heap comparator.

```javascript
const heap = new Heapster([5, 3, 7, 1, 2, 10, 8]);
console.log(heap.elements); // Might be [10, 7, 8, 5, 3, 1, 2]
```

### comparator

The function which is responsible to compare two elements of the heap. It should return a positive number if the first one is greater than the second one, a negative number on the other case and 0 if they are equal. If you don't specify any comparator, here is the default one:

```javascript
const comparator = function (a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
```

Meaning the default heap will be a max-heap with the biggest value at the top. If you want a min-heap, just specify your own comparator which return the opposite result.

```javascript
// For a min heap, a smaller number is actually considered as greater
const minComparator = function (a, b) {
  return b - a;
};
// A min-heap
const heap = new Heapster(minComparator);
// Test the property, just for fun
console.log(heap.comparator === minComparator); // true
```

## License

This software is licensed under the Apache 2 license, quoted below.

Copyright 2015 Paul Dijou ([http://pauldijou.fr](http://pauldijou.fr)).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
