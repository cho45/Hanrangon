#!/bin/bash
# Go からの postprocess 呼び出しをテストするスクリプト

cd "$(dirname "$0")"

# テスト用 HTML
HTML='<p>Math test: \(a^2 + b^2 = c^2\)</p>
<pre class="code lang-python">def hello():
    return "world"</pre>
<img src="http://lh6.ggpht.com/-test/s320/photo.jpg" />
<iframe src="http://www.youtube.com/embed/test123"></iframe>'

echo "Input HTML:"
echo "$HTML"
echo ""
echo "---"
echo ""
echo "Output HTML:"
echo "$HTML" | node main.js

echo ""
echo "---"
echo "Test completed!"
