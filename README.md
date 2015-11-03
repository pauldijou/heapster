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

// Static heap sort
// Default to max-heap => from min to max
console.log(Heapster.sort([4, -1, 5, 2])); // [-1, 2, 4, 5]
// Or use a custom comparator function
console.log(Heapster.sort([4, -1, 5, 2], (a,b) => b - a)); // [5, 4, 2, -1]
```

## Pro-tip

Since it's a default export, you can name the import whatever you want. If you prefer using `Heap` as the name of the class, just do:

```javascript
import Heap from 'heapster';

const heap = new Heap();
```

## API

### constructor([elements: Array], [comparator: Function], [options: Object]): Heapster

**O(n.log(n))** Create a new heap.

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

**Options**

- indexed: Boolean = improve performance by tracking indexes. [Read more](#optimizations)

### size(): Number

**O(1)** Return the size of the heap.

```javascript
new Heapster([1, 2, 3]).size(); // 3
```

### isEmpty(): Boolean

**O(1)** Test if the heap is empty or not.

```javascript
new Heapster().isEmpty(); // true
new Heapster([1]).isEmpty(); // false
```

### push(...elements: Any): Number

**O(log(n)) for each element** Push one or more elements to the heap and return its new size.

```javascript
new Heapster().push(5); // 1, heap is [5]
new Heapster().push(1, 5, 7); // 3, heap is [7, 1, 5]
```

### pop(): Any

**O(log(n))** Remove the root of the heap and return it.

```javascript
new Heapster().pop(); // undefined, heap is []
new Heapster([4, 2, 10]).pop(); // 10, heap is [4, 2]
```

### add(element: Any): Heapster

**O(log(n))** Just like push but accept only one element at a time and return the heap itself to do chaining.

```javascript
new Heapster().add(1).add(5).add(3); // heap is [5, 1, 3]
```

### root([element: Any]): Any

**O(1) or O(log(n))** If no argument, return the root of the heap as a normal getter. If one argument, it will try to set the root of the heap with the argument and return the deleted root. It's like doing a push() and a pop() at the same time with some optimizations. If the argument is greater than the current root (according to the heap comparator), it will return the argument and do nothing.

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

**O(n)** Return true if the heap contains the element, false is not.

```javascript
const element = {rank: 4};
const heap = new Heapster([{rank: 1}, {rank: 4}], (a,b) => b.rank - a.rank);
heap.has(element); // false, works by reference
heap.push(element);
heap.has(element); // true
```

Can be [optimized](#optimizations) to **O(1)**.

### update(element: Any): Heapster

**O(n)** Call this method if you edited an element and it might change its place in the heap.

```javascript
const elements = [{rank: 4}, {rank: 1}, {rank: 2}, {rank: 6}, {rank: 8}];
const heap = new Heapster(elements, (a,b) => b.rank - a.rank);
heap.root(); // {rank: 1}
elements[1].rank = 5;
// Right now, the heap is not longer valid, don't do any operation on it before calling the next line:
heap.update(elements[1]);
// Heap is valid again
heap.root(); // {rank: 2}
```

Can be [optimized](#optimizations) to **O(log(n))**.

### remove(element: Any): Boolean

**O(n)** Try to remove an element of the heap. Return true if it did remove something and false if not.

```javascript
const heap = new Heapster([1, 2, 2, 3, 4]);
heap.remove(3); // true
heap.remove(5); // false
heap.remove(2); // true
heap.remove(2); // true
heap.remove(2); // false
```

Can be [optimized](#optimizations) to **O(log(n))**.

### sort(): Array

**O(n.log(n))** Sort the elements of the heap according to its comparator and return the resulting array.

```javascript
// Max-heap
new Heapster([4, 1, 5, 3]).sort(); // [1, 3, 4, 5]
// Min-heap
new Heapster([4, 1, 5, 3], (a,b) => b - a).sort(); // [5, 4, 3, 1]
```

### merge(heap: Heapster): Heapster

**O(m.log(n))** Merge the current heap with another one and create a new resulting heap.

```javascript
const heap1 = new Heapster([2, 3, 4]);
const heap2 = new Heapster([1, 5, 2]);
const heap3 = heap1.merge(heap2); // [5, 4, 2, 3, 1, 2]
console.log(heap3 === heap1); // false
```

### meld(heap: Heapster): Heapster

**O(m.log(n))** Merge another heap inside the current one.

```javascript
const heap1 = new Heapster([2, 3, 4]);
const heap2 = new Heapster([1, 5, 2]);
const heap3 = heap1.meld(heap2); // [5, 4, 2, 3, 1, 2]
console.log(heap3 === heap1); // true
```

### clone(): Heapster

**O(1)** Clone the heap into a new identical one.

```javascript
const heap1 = new Heapster([1, 2, 3, 4]);
const heap2 = heap1.clone();
console.log(heap1 === heap2); // false
console.log(heap1.elements === heap2.elements); // false
console.log(heap1.size() === heap2.size()); // true
for (let i = 0, l = heap1.size(); i < l; ++i) {
  console.log(heap1[i] === heap2[i]); // true
}
```

### toArray(): Array

**O(1)** Return a copy of the elements of the heap as an array.

```javascript
const heap = new Heapster([3, 6, 1, 2]);
const arr = heap.toArray();
console.log(Array.isArray(arr)); // true
console.log(arr.length); // 4
console.log(arr[0]); // 6, the root of the heap
console.log(arr); // Might be [6, 3, 1, 2]
```

### static heapify(elements: Array, [comparator: Function]): Array

**O(n.log(n))** Transform in place an array to the representation of a heap. See [the `elements` property](#elements) below.

```javascript
Heapster.heapify([5, 3, 7, 1, 2, 10, 8]); // Might be [10, 3, 8, 1, 2, 7, 5]
```

### static sort(elements: Array, [comparator: Function]): Array

**O(n.log(n))** Perform an heap sort on the elements of the array. It's just the same as creating a new heap from the elements and calling `.sort()` on it.

```javascript
Heapster.sort([5, 3, 7, 1, 2, 10, 8]); // [1, 2, 3, 5, 7, 8, 10]
```

## Properties

### elements

The array containing all the elements of the heap. The first element is the root. The two children of an element at index `i` are at indexes `2i+1` and `2i+2`. There are no rule that the left child should be greater or lower than the right child so don't rely on anything except that a parent will always be greater than its children according to the heap comparator.

```javascript
const heap = new Heapster([5, 3, 7, 1, 2, 10, 8]);
console.log(heap.elements); // Might be [10, 3, 8, 1, 2, 7, 5]
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

## Optimizations

One problem with using an array to store the heap is that everything is index based. It means that all methods which need to access a particular element (like `update`, `remove` and `has`) will need to first call `indexOf` on the array of elements to retrieve its index and then do the logic. It's counter-productive regarding the fact that all those methods are, at most, **O(log(n))** while `indexOf` is **O(n)**, destroying all performances.

One way to solve that is to track the indexes of all elements while moving them inside the array. Some libs use a hashmap to link one element to its index but the final user will need to provide a hash function for the lib to know how to actually compute the hash. I decided to use another approach and store the index directly inside the element. It has some limitations too. In order to enable it, you need to specify `{ indexed: true }` in the options when creating the heap.

First of all, it cannot work with primitives since you cannot store any new properties in them, so you will be forced to use objects. Most of the time, it's ok because you don't really need to call the previous methods on primitives. But if you really need to, just wrap your data inside objects: `{value: 'your primitive'}` and map them back to primitives when needed.

Then, we need to avoid any collision with existing properties. It's done using [Symbol](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Symbol) which assure that it cannot clash. You will need a polyfill for that in some browsers, Babel has one.

And, obviously, it will dirty all your objects. You shouldn't be concerned about that, it's just a small number, but if it really bother you, you can clean it anytime. Be sure that the element is no longer inside the heap before cleaning it or the heap will implose and the universe collapse.

```javascript
const element = heap.pop();
// Ask the heap to clean it
heap.clean(element);
// Or the static way
Heapster.clean(element);
```

## License

This software is licensed under the Apache 2 license, quoted below.

Copyright 2015 Paul Dijou ([http://pauldijou.fr](http://pauldijou.fr)).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
