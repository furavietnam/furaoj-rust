// Logic: Authentic DMOJ / FuraOJ Custom Output Checkers documentation page matching /custom_checkers.
// Input: Markdown guide content detailing Python and C++ checker protocols and testlib.h integration.
// Output: JSX.Element responsive view with KaTeX math formula rendering and syntax highlighted code blocks.

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const CHECKERS_GUIDE_MARKDOWN = `
Một số bài tập có thể có nhiều output đúng, vì vậy đôi lúc ta cần phải viết checker để kiểm tra xem output có đúng hay chưa.

# 1. Checker mặc định
FuraOJ hỗ trợ các checker mặc định của DMOJ:
* **line**: So sánh từng dòng, bỏ qua khoảng trắng thừa ở cuối mỗi dòng.
* **token**: So sánh từng từ/token phân cách bởi khoảng trắng.
* **floats**: So sánh số thực với độ chính xác tuyệt đối hoặc tương đối (mặc định $10^{-6}$).
* **identical**: So sánh chính xác từng byte.

---

# 2. Custom Checker (Python)
Một \`checker\` được viết bằng Python cần cài đặt một hàm như sau:

\`\`\`python
def check(process_output, judge_output, **kwargs):
    # logic kiểm tra
\`\`\`

Trong đó:
* \`process_output\`: output của bài nộp (\`bytes\`)
* \`judge_output\`: đáp án chuẩn (\`bytes\`)

\`**kwargs\` chứa các tham số bổ sung:
* \`judge_input\`: dữ liệu đầu vào của test case (\`bytes\`)
* \`point_value\`: số điểm tối đa của test case đang chấm (\`float\`)
* \`case_position\`: số thứ tự của test case (\`int\`)
* \`batch\`: số thứ tự batch (dành cho bài chấm theo subtask)
* \`submission_language\`: mã ngôn ngữ của bài nộp (\`str\`)
* \`execution_time\`: thời gian chạy của bài nộp (giây)

### Giá trị trả về (Return)
Hàm \`check\` có 2 cách return:
1. **Return boolean (\`True\` / \`False\`):** Trả về \`True\` nếu đúng hoàn toàn (nhận 100% điểm), ngược lại trả về \`False\` (0 điểm).
2. **Return \`CheckerResult\`:** Trả về \`CheckerResult(passed, points_awarded, feedback)\` để cung cấp phản hồi chi tiết cho thí sinh:
   * \`passed\`: \`True\` nếu bài nộp đúng, \`False\` nếu sai.
   * \`points_awarded\`: Số điểm thực tế nhận được cho test case này.
   * \`feedback\`: Chuỗi thông báo gửi tới thí sinh (ví dụ: \`"Đáp án chính xác"\`).

### Ví dụ Python Checker mẫu (A + B)
\`\`\`python
from dmoj.result import CheckerResult

def check(process_output, judge_output, judge_input, point_value, **kwargs):
    # Chuyển đổi từ bytes sang chuỗi văn bản
    proc_str = process_output.decode("utf-8").strip()
    inp_str = judge_input.decode("utf-8").strip()
    
    a, b = map(int, inp_str.split())
    try:
        user_sum = int(proc_str)
    except ValueError:
        return CheckerResult(False, 0, "Kết quả không phải là số nguyên")
        
    if user_sum == a + b:
        return CheckerResult(True, point_value, "Kết quả chính xác!")
    else:
        return CheckerResult(False, 0, f"Sai kết quả: {user_sum} != {a + b}")
\`\`\`

---

# 3. Custom Checker (C++)
Để viết C++ checker, ta cài đặt một chương trình C++ nhận vào 3 tham số dòng lệnh theo thứ tự:
\`\`\`bash
./checker <input_file> <output_file> <answer_file>
\`\`\`

### Giá trị trả về (Exit Codes)
Hàm \`main\` của chương trình trả về các mã thoát (exit code) sau:
* **\`0\`**: AC (Accepted - nhận 100% điểm)
* **\`1\`**: WA (Wrong Answer - nhận 0 điểm)
* **\`7\`**: Điểm thành phần (Partial Points). Khi trả về mã 7, chương trình cần in ra dòng đầu tiên của \`stderr\` một số thực trong đoạn $[0, 1]$ thể hiện tỷ lệ điểm nhận được.

### Ví dụ C++ Checker mẫu
Chương trình sau chấm bài toán: Cho số nguyên dương $n$, tìm hai số tự nhiên $a, b$ sao cho $a + b = n$.

\`\`\`cpp
#include <iostream>
#include <fstream>

using namespace std;

int main(int argc, char** argv) {
    if (argc < 4) return 1;

    ifstream inp(argv[1]);
    ifstream out(argv[2]);
    ifstream ans(argv[3]);

    long long n, a, b;
    if (!(inp >> n)) return 1;
    if (!(out >> a >> b)) {
        cerr << "Không đọc được 2 số nguyên từ output\n";
        return 1; // WA
    }

    if (a + b != n) {
        cerr << "Tổng a + b != n\n";
        return 1; // WA
    }

    if (a < 0 || b < 0) {
        // Cho 50% số điểm nếu có số âm
        cerr << 0.5 << "\\n";
        cerr << "Một trong hai số âm, nhận 50% số điểm\\n";
        return 7; // PARTIAL
    }

    cerr << "Kết quả hoàn toàn chính xác\\n";
    return 0; // AC
}
\`\`\`

---

# 4. Hỗ trợ testlib.h (Codeforces Standard)
FuraOJ hỗ trợ các trình chấm sử dụng thư viện chuẩn \`testlib.h\`:

\`\`\`cpp
#include "testlib.h"

int main(int argc, char* argv[]) {
    registerTestlibCmd(argc, argv);

    int n = inf.readInt();
    int a = ouf.readInt();
    int b = ouf.readInt();

    ensuref(a + b == n, "a + b != n");

    if (a < 0 || b < 0) {
        quitp(0.5, "Có số âm, nhận 50% số điểm");
    }

    quitf(_ok, "Đáp án chính xác!");
}
\`\`\`
`;

// Logic: Renders official Custom Checkers documentation page with full markdown parsing.
// Input: Static markdown specification.
// Output: JSX.Element rendered article view.
export function CustomCheckersPage(): JSX.Element {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 8px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', color: '#1e293b' }}>
        Trình chấm tùy biến (Custom Checkers)
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
        Tài liệu kỹ thuật hướng dẫn xây dựng trình kiểm tra kết quả bài tập trên hệ thống FuraOJ.
      </p>
      <hr style={{ margin: '0 0 24px 0', borderColor: '#e2e8f0' }} />

      <div
        className="problem-statement-content"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          lineHeight: '1.7',
          color: '#334155',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '24px 0 12px 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                {children}
              </h3>
            ),
            h2: ({ children }) => (
              <h4 style={{ fontSize: '17px', fontWeight: 700, margin: '20px 0 10px 0', color: '#1e293b' }}>
                {children}
              </h4>
            ),
            h3: ({ children }) => (
              <h5 style={{ fontSize: '15px', fontWeight: 600, margin: '16px 0 8px 0', color: '#334155' }}>
                {children}
              </h5>
            ),
            code: ({ inline, className, children, ...props }: any) => {
              if (inline) {
                return (
                  <code
                    style={{
                      background: '#f1f5f9',
                      color: '#0066ff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <pre
                  style={{
                    background: '#090d16',
                    color: '#e2e8f0',
                    padding: '16px',
                    borderRadius: '8px',
                    overflowX: 'auto',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    margin: '12px 0',
                  }}
                >
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            ul: ({ children }) => <ul style={{ paddingLeft: '24px', margin: '10px 0' }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ paddingLeft: '24px', margin: '10px 0' }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: '6px' }}>{children}</li>,
          }}
        >
          {CHECKERS_GUIDE_MARKDOWN}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default CustomCheckersPage;
