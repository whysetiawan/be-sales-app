/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Problem: Mini-Max Sum
 * 1st Question
 */
function miniMaxSum(arr: number[]): string {
  const sortedArr = arr.sort((a, b) => a - b);
  const firstFour = sortedArr.slice(0, 4);
  const lastFour = sortedArr.slice(1, 5);

  const minSum = firstFour.reduce((acc, curr) => acc + curr, 0);
  const maxSum = lastFour.reduce((acc, curr) => acc + curr, 0);

  return minSum + ' ' + maxSum;
}

/**
 * Problem: Plus Minus
 * 2nd Question
 */
function plusMinus(arr: number[]): void {
  let positive = 0;
  let negative = 0;
  let zero = 0;

  arr.forEach((num) => {
    if (num > 0) {
      positive++;
    } else if (num < 0) {
      negative++;
    } else {
      zero++;
    }
  });

  console.log((positive / arr.length).toFixed(6));
  console.log((negative / arr.length).toFixed(6));
  console.log((zero / arr.length).toFixed(6));
}

function timeConversion(time: string) {
  const [hh, mm, ss] = time.split(':');
  const AMPM = ss.slice(2, 4);
  const hour = parseInt(hh, 10);

  let newHour = hour;
  if (AMPM === 'PM' && hour !== 12) {
    newHour = hour + 12;
  } else if (AMPM === 'AM' && hour === 12) {
    newHour = 0;
  }

  return `${String(newHour).padStart(2, '0')}:${mm}:${ss.slice(0, 2)}`;
}
