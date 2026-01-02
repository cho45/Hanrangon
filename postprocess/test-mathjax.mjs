import MathJax from 'mathjax';

console.log('MathJax:', Object.keys(MathJax));
console.log('MathJax.tex2svg:', typeof MathJax.tex2svg);
console.log('MathJax.tex2mml:', typeof MathJax.tex2mml);
console.log('MathJax.tex2chtml:', typeof MathJax.tex2chtml);

// 使えそうなメソッドを探す
for (const key of Object.keys(MathJax)) {
  if (typeof MathJax[key] === 'function' && key.includes('tex')) {
    console.log(`${key}:`, typeof MathJax[key]);
  }
}
