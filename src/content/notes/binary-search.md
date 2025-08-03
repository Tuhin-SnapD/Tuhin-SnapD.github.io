---
title: "Binary Search Implementation"
description: "Complete guide to binary search with examples in Python, JavaScript, and Java"
tags: ["algorithms", "python", "javascript", "java", "search"]
date: "2024-01-15"
readTime: "5 min read"
category: "algorithms"
difficulty: "intermediate"
published: true
featured: true
---

# Binary Search Implementation

Binary search is one of the most fundamental algorithms in computer science. It's an efficient search algorithm that works on sorted arrays and has a time complexity of O(log n).

## How It Works

Binary search works by repeatedly dividing the search interval in half. If the value of the search key is less than the item in the middle of the interval, narrow the interval to the lower half. Otherwise, narrow it to the upper half.

## Algorithm Steps

1. Compare the target value with the middle element
2. If they match, return the index
3. If the target is less than the middle element, search the left half
4. If the target is greater than the middle element, search the right half
5. Repeat until the element is found or the search space is empty

## Python Implementation

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Element not found

# Example usage
arr = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = binary_search(arr, target)
print(f"Element {target} found at index: {result}")
```

## JavaScript Implementation

```javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // Element not found
}

// Example usage
const arr = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;
const result = binarySearch(arr, target);
console.log(`Element ${target} found at index: ${result}`);
```

## Java Implementation

```java
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Element not found
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13, 15};
        int target = 7;
        int result = binarySearch(arr, target);
        System.out.println("Element " + target + " found at index: " + result);
    }
}
```

## Time and Space Complexity

- **Time Complexity**: O(log n)
- **Space Complexity**: O(1) for iterative implementation
- **Space Complexity**: O(log n) for recursive implementation (due to call stack)

## Common Variations

### 1. Finding First Occurrence

```python
def binary_search_first(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            result = mid
            right = mid - 1  # Continue searching left
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result
```

### 2. Finding Last Occurrence

```python
def binary_search_last(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            result = mid
            left = mid + 1  # Continue searching right
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result
```

## Common Mistakes to Avoid

1. **Integer Overflow**: Use `left + (right - left) / 2` instead of `(left + right) / 2`
2. **Infinite Loops**: Ensure the loop condition is `left <= right` and update bounds correctly
3. **Off-by-one Errors**: Be careful with boundary conditions

## Practice Problems

1. [LeetCode 704: Binary Search](https://leetcode.com/problems/binary-search/)
2. [LeetCode 34: Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)
3. [LeetCode 35: Search Insert Position](https://leetcode.com/problems/search-insert-position/)

## Key Takeaways

- Binary search only works on sorted arrays
- Always consider edge cases (empty array, single element, target not found)
- The algorithm is very efficient for large datasets
- Many problems can be solved using binary search on the answer space 