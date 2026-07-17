# CodeMatch Seed Problems Answer Key

This document contains the correct working solutions for the default seeded coding problems in the CodeMatch platform. Use these template solutions for testing the Monaco IDE compiler and verification run workflows.

---

## 1. Two Sum

### Problem Statement
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
* **Input format**: A JSON string containing `nums` array and `target` value, e.g. `{"nums": [2, 7, 11, 15], "target": 9}`.
* **Output format**: Indices as a JSON array of two numbers, e.g. `[0, 1]`.

### JavaScript Solution
```javascript
function solve(input) {
  const data = JSON.parse(input);
  const nums = data.nums;
  const target = data.target;
  
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return JSON.stringify([map.get(complement), i]);
    }
    map.set(nums[i], i);
  }
  return JSON.stringify([]);
}
```

---

## 2. Reverse String

### Problem Statement
Write a function that reverses a string. The input string is given as an array of characters `s`.
* **Input format**: A JSON array of characters, e.g. `["h","e","l","l","o"]`.
* **Output format**: Reversed JSON array of characters, e.g. `["o","l","l","e","h"]`.

### JavaScript Solution
```javascript
function solve(input) {
  const arr = JSON.parse(input);
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
  }
  return JSON.stringify(arr);
}
```

---

## 3. Fibonacci Number

### Problem Statement
The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.
* **Input format**: The integer `n` as a string, e.g. `"4"`.
* **Output format**: The Fibonacci number at index `n` as a string, e.g. `"3"`.

### JavaScript Solution
```javascript
function solve(input) {
  const n = parseInt(input.trim(), 10);
  if (n === 0) return "0";
  if (n === 1) return "1";
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return String(b);
}
```
