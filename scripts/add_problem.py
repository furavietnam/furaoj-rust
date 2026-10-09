#!/usr/bin/env python3
# Logic: Command-line problem management utility creating database records and generating authentic test cases.
# Input: CLI arguments (--code, --name, --desc, --preset, --time-limit, --memory-limit, --points).
# Output: Registered problem in PostgreSQL judge_problem and authentic testcase directory with init.yml.

import argparse
import json
import os
import random
import sys
import urllib.error
import urllib.request

MOD = 1_000_000_007


# Logic: Precomputes Fibonacci numbers modulo 10^9+7 up to max(queries) for high-performance testcase generation.
# Input: queries (list of non-negative integers).
# Output: list of answers (F_n mod 10^9+7) corresponding to each query.
def compute_fibonacci_list(queries: list) -> list:
    if not queries:
        return []
    max_val = max(queries)
    fib = [0] * (max_val + 1)
    if max_val >= 1:
        fib[1] = 1
    for i in range(2, max_val + 1):
        fib[i] = (fib[i - 1] + fib[i - 2]) % MOD
    return [fib[q] for q in queries]


# Logic: Precomputes Factorials modulo 10^9+7 up to max(queries) for high-performance testcase generation.
# Input: queries (list of non-negative integers).
# Output: list of answers (N! mod 10^9+7) corresponding to each query.
def compute_factorial_list(queries: list) -> list:
    if not queries:
        return []
    max_val = max(queries)
    fact = [1] * (max_val + 1)
    for i in range(2, max_val + 1):
        fact[i] = (fact[i - 1] * i) % MOD
    return [fact[q] for q in queries]


# Logic: Computes maximum subarray sum using Kadane's algorithm.
# Input: arr (list of integers).
# Output: int maximum contiguous subarray sum.
def compute_max_subarray(arr: list) -> int:
    max_so_far = arr[0]
    curr_max = arr[0]
    for x in arr[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far


# Logic: Generates authentic test case files and metadata for problem presets.
# Input: preset_name (str), target_dir (str).
# Output: tuple of (name, description, time_limit, memory_limit, points).
def generate_preset_problem(preset_name: str, target_dir: str):
    os.makedirs(target_dir, exist_ok=True)

    if preset_name == "fibonacci":
        name = "Số Fibonacci (Fibonacci Numbers)"
        desc = (
            "Cho số nguyên không âm $N$. Hãy tính số Fibonacci thứ $N$, lấy phần dư cho $10^9 + 7$.\n\n"
            "Dãy số Fibonacci được định nghĩa như sau:\n"
            "$$F_0 = 0, \\quad F_1 = 1, \\quad F_n = (F_{n-1} + F_{n-2}) \\pmod{10^9 + 7} \\quad (n \\ge 2)$$\n\n"
            "### Quy cách dữ liệu vào (Input)\n"
            "Dòng đầu tiên chứa số nguyên $T$ ($1 \\le T \\le 100\\,000$) là số lượng test case.\n"
            "$T$ dòng tiếp theo, mỗi dòng chứa một số nguyên $N$ ($0 \\le N \\le 1\\,000\\,000$).\n\n"
            "### Quy cách kết quả (Output)\n"
            "Với mỗi test case, in ra $F_N \\pmod{10^9 + 7}$ trên một dòng.\n\n"
            "### Ví dụ (Sample)\n"
            "#### Input\n"
            "```\n5\n0\n1\n2\n5\n10\n```\n"
            "#### Output\n"
            "```\n0\n1\n1\n5\n55\n```"
        )
        time_limit = 1.0
        memory_limit = 256
        points = 100.0

        # Case 1: Sample
        q1 = [0, 1, 2, 5, 10]
        with open(os.path.join(target_dir, "1.in"), "w") as f:
            f.write(f"{len(q1)}\n" + "\n".join(str(x) for x in q1) + "\n")
        with open(os.path.join(target_dir, "1.out"), "w") as f:
            f.write("\n".join(str(x) for x in compute_fibonacci_list(q1)) + "\n")

        # Case 2: Medium inputs
        q2 = [15, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
        with open(os.path.join(target_dir, "2.in"), "w") as f:
            f.write(f"{len(q2)}\n" + "\n".join(str(x) for x in q2) + "\n")
        with open(os.path.join(target_dir, "2.out"), "w") as f:
            f.write("\n".join(str(x) for x in compute_fibonacci_list(q2)) + "\n")

        # Case 3: Large authentic queries
        rnd = random.Random(42)
        q3 = [rnd.randint(10000, 200000) for _ in range(5000)]
        with open(os.path.join(target_dir, "3.in"), "w") as f:
            f.write(f"{len(q3)}\n" + "\n".join(str(x) for x in q3) + "\n")
        with open(os.path.join(target_dir, "3.out"), "w") as f:
            f.write("\n".join(str(x) for x in compute_fibonacci_list(q3)) + "\n")

        # init.yml
        init_yml = (
            "archive: fibonacci.zip\n\n"
            "test_cases:\n"
            "- {in: 1.in, out: 1.out, points: 20}\n"
            "- {in: 2.in, out: 2.out, points: 30}\n"
            "- {in: 3.in, out: 3.out, points: 50}\n"
        )
        with open(os.path.join(target_dir, "init.yml"), "w") as f:
            f.write(init_yml)

        return name, desc, time_limit, memory_limit, points

    elif preset_name == "factorial":
        name = "Giai Thừa Lấy Dư (Factorial Modulo)"
        desc = (
            "Cho số nguyên không âm $N$. Hãy tính giai thừa $N!$ lấy dư cho $10^9 + 7$.\n\n"
            "Định nghĩa:\n"
            "$$N! = 1 \\times 2 \\times 3 \\times \\dots \\times N, \\quad 0! = 1$$\n\n"
            "### Quy cách dữ liệu vào (Input)\n"
            "Dòng đầu chứa số nguyên $T$ ($1 \\le T \\le 100\\,000$) là số lượng test case.\n"
            "$T$ dòng tiếp theo, mỗi dòng chứa một số nguyên $N$ ($0 \\le N \\le 1\\,000\\,000$).\n\n"
            "### Quy cách kết quả (Output)\n"
            "In ra $N! \\pmod{10^9 + 7}$ cho mỗi test case trên một dòng.\n\n"
            "### Ví dụ (Sample)\n"
            "#### Input\n"
            "```\n5\n0\n1\n3\n5\n10\n```\n"
            "#### Output\n"
            "```\n1\n1\n6\n120\n3628800\n```"
        )
        time_limit = 1.0
        memory_limit = 256
        points = 100.0

        # Case 1
        q1 = [0, 1, 3, 5, 10]
        with open(os.path.join(target_dir, "1.in"), "w") as f:
            f.write(f"{len(q1)}\n" + "\n".join(str(x) for x in q1) + "\n")
        with open(os.path.join(target_dir, "1.out"), "w") as f:
            f.write("\n".join(str(x) for x in compute_factorial_list(q1)) + "\n")

        # Case 2
        q2 = [20, 50, 100, 200, 500, 1000, 2000, 5000]
        with open(os.path.join(target_dir, "2.in"), "w") as f:
            f.write(f"{len(q2)}\n" + "\n".join(str(x) for x in q2) + "\n")
        with open(os.path.join(target_dir, "2.out"), "w") as f:
            f.write("\n".join(str(x) for x in compute_factorial_list(q2)) + "\n")

        # Case 3
        rnd = random.Random(1337)
        q3 = [rnd.randint(5000, 100000) for _ in range(2000)]
        with open(os.path.join(target_dir, "3.in"), "w") as f:
            f.write(f"{len(q3)}\n" + "\n".join(str(x) for x in q3) + "\n")
        with open(os.path.join(target_dir, "3.out"), "w") as f:
            f.write("\n".join(str(x) for x in compute_factorial_list(q3)) + "\n")

        init_yml = (
            "archive: factorial.zip\n\n"
            "test_cases:\n"
            "- {in: 1.in, out: 1.out, points: 20}\n"
            "- {in: 2.in, out: 2.out, points: 30}\n"
            "- {in: 3.in, out: 3.out, points: 50}\n"
        )
        with open(os.path.join(target_dir, "init.yml"), "w") as f:
            f.write(init_yml)

        return name, desc, time_limit, memory_limit, points

    elif preset_name == "maxsubarray":
        name = "Dãy Con Tổng Lớn Nhất (Maximum Subarray Sum)"
        desc = (
            "Cho mảng gồm $N$ số nguyên $A_1, A_2, \\dots, A_N$. Hãy tìm một đoạn con liên tiếp "
            "không rỗng có tổng các phần tử lớn nhất:\n\n"
            "$$\\max_{1 \\le i \\le j \\le N} \\sum_{k=i}^{j} A_k$$\n\n"
            "### Quy cách dữ liệu vào (Input)\n"
            "Dòng đầu tiên chứa số nguyên $N$ ($1 \\le N \\le 200\\,000$).\n"
            "Dòng thứ hai chứa $N$ số nguyên $A_i$ ($-10^9 \\le A_i \\le 10^9$).\n\n"
            "### Quy cách kết quả (Output)\n"
            "In ra một số nguyên duy nhất là tổng đoạn con liên tiếp lớn nhất.\n\n"
            "### Ví dụ (Sample)\n"
            "#### Input\n"
            "```\n8\n-2 1 -3 4 -1 2 1 -5 4\n```\n"
            "#### Output\n"
            "```\n6\n```"
        )
        time_limit = 1.0
        memory_limit = 256
        points = 100.0

        # Case 1: Standard sample
        a1 = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
        with open(os.path.join(target_dir, "1.in"), "w") as f:
            f.write(f"{len(a1)}\n" + " ".join(str(x) for x in a1) + "\n")
        with open(os.path.join(target_dir, "1.out"), "w") as f:
            f.write(f"{compute_max_subarray(a1)}\n")

        # Case 2: All negative
        a2 = [-5, -2, -8, -1, -9]
        with open(os.path.join(target_dir, "2.in"), "w") as f:
            f.write(f"{len(a2)}\n" + " ".join(str(x) for x in a2) + "\n")
        with open(os.path.join(target_dir, "2.out"), "w") as f:
            f.write(f"{compute_max_subarray(a2)}\n")

        # Case 3: Large authentic random array
        rnd = random.Random(2026)
        a3 = [rnd.randint(-1000000, 1000000) for _ in range(50000)]
        with open(os.path.join(target_dir, "3.in"), "w") as f:
            f.write(f"{len(a3)}\n" + " ".join(str(x) for x in a3) + "\n")
        with open(os.path.join(target_dir, "3.out"), "w") as f:
            f.write(f"{compute_max_subarray(a3)}\n")

        init_yml = (
            "archive: maxsubarray.zip\n\n"
            "test_cases:\n"
            "- {in: 1.in, out: 1.out, points: 20}\n"
            "- {in: 2.in, out: 2.out, points: 20}\n"
            "- {in: 3.in, out: 3.out, points: 60}\n"
        )
        with open(os.path.join(target_dir, "init.yml"), "w") as f:
            f.write(init_yml)

        return name, desc, time_limit, memory_limit, points

    elif preset_name == "palindrome":
        name = "Kiểm Tra Xâu Đối Xứng (Palindrome Check)"
        desc = (
            "Một xâu ký tự được gọi là đối xứng (palindrome) nếu đọc từ trái sang phải cũng giống "
            "như đọc từ phải sang trái.\n\n"
            "Cho $T$ xâu ký tự chỉ gồm các chữ cái in thường từ 'a' đến 'z'. Với mỗi xâu, hãy xác định "
            "xâu đó có phải là xâu đối xứng hay không.\n\n"
            "### Quy cách dữ liệu vào (Input)\n"
            "Dòng đầu tiên chứa số nguyên $T$ ($1 \\le T \\le 1000$).\n"
            "$T$ dòng tiếp theo, mỗi dòng chứa một xâu ký tự $S$ ($1 \\le |S| \\le 100\\,000$).\n\n"
            "### Quy cách kết quả (Output)\n"
            "Với mỗi xâu, in ra `YES` nếu là xâu đối xứng, ngược lại in ra `NO`.\n\n"
            "### Ví dụ (Sample)\n"
            "#### Input\n"
            "```\n4\nracecar\nhello\nmadam\nfuraoj\n```\n"
            "#### Output\n"
            "```\nYES\nNO\nYES\nNO\n```"
        )
        time_limit = 1.0
        memory_limit = 256
        points = 100.0

        # Case 1
        s1 = ["racecar", "hello", "madam", "furaoj"]
        ans1 = ["YES" if x == x[::-1] else "NO" for x in s1]
        with open(os.path.join(target_dir, "1.in"), "w") as f:
            f.write(f"{len(s1)}\n" + "\n".join(s1) + "\n")
        with open(os.path.join(target_dir, "1.out"), "w") as f:
            f.write("\n".join(ans1) + "\n")

        # Case 2: Corner cases (single char, repetition, etc.)
        s2 = ["a", "aa", "ab", "aba", "abba", "abcba", "abcdefg", "zzzzzzzz"]
        ans2 = ["YES" if x == x[::-1] else "NO" for x in s2]
        with open(os.path.join(target_dir, "2.in"), "w") as f:
            f.write(f"{len(s2)}\n" + "\n".join(s2) + "\n")
        with open(os.path.join(target_dir, "2.out"), "w") as f:
            f.write("\n".join(ans2) + "\n")

        # Case 3: Long strings
        s3 = [
            "a" * 10000,
            "ab" * 5000,
            ("abcdefg" + "gfedcba") * 500,
            ("a" * 5000) + "b" + ("a" * 5000),
            ("a" * 5000) + "bc" + ("a" * 5000),
        ]
        ans3 = ["YES" if x == x[::-1] else "NO" for x in s3]
        with open(os.path.join(target_dir, "3.in"), "w") as f:
            f.write(f"{len(s3)}\n" + "\n".join(s3) + "\n")
        with open(os.path.join(target_dir, "3.out"), "w") as f:
            f.write("\n".join(ans3) + "\n")

        init_yml = (
            "archive: palindrome.zip\n\n"
            "test_cases:\n"
            "- {in: 1.in, out: 1.out, points: 20}\n"
            "- {in: 2.in, out: 2.out, points: 30}\n"
            "- {in: 3.in, out: 3.out, points: 50}\n"
        )
        with open(os.path.join(target_dir, "init.yml"), "w") as f:
            f.write(init_yml)

        return name, desc, time_limit, memory_limit, points

    else:
        raise ValueError(f"Unknown preset: {preset_name}")


# Logic: Sends problem registration request to FuraOJ REST API.
# Input: api_url (str), payload (dict).
# Output: dict JSON response returned from the server.
def register_problem_api(api_url: str, payload: dict) -> dict:
    req = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code} Error: {body}") from e


# Logic: Entry point parsing arguments and coordinating problem registration and test case writing.
# Input: Command line arguments.
# Output: Exit code 0 on success, non-zero on failure.
def main():
    parser = argparse.ArgumentParser(
        description="FuraOJ Dynamic Problem & Authentic Testcase Registrar"
    )
    parser.add_argument("--code", type=str, help="Problem unique code (e.g., fibonacci)")
    parser.add_argument("--name", type=str, help="Problem title")
    parser.add_argument("--desc", type=str, default="", help="Problem description (Markdown)")
    parser.add_argument("--time-limit", type=float, default=1.0, help="Time limit in seconds")
    parser.add_argument("--memory-limit", type=int, default=256, help="Memory limit in MB")
    parser.add_argument("--points", type=float, default=100.0, help="Max points")
    parser.add_argument(
        "--preset",
        type=str,
        choices=["fibonacci", "factorial", "maxsubarray", "palindrome"],
        help="Use built-in authentic competitive problem preset",
    )
    parser.add_argument(
        "--all-presets",
        action="store_true",
        help="Register all standard presets in sequence",
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default="http://localhost:8080/api/problems",
        help="FuraOJ REST API problem endpoint",
    )
    parser.add_argument(
        "--problems-dir",
        type=str,
        default="./problems",
        help="Root directory for problem testcases",
    )

    args = parser.parse_args()

    # Determine base directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.dirname(script_dir)
    target_problems_root = os.path.abspath(os.path.join(workspace_dir, args.problems_dir))

    presets_to_run = []
    if args.all_presets:
        presets_to_run = ["fibonacci", "factorial", "maxsubarray", "palindrome"]
    elif args.preset:
        presets_to_run = [args.preset]

    if presets_to_run:
        for p in presets_to_run:
            print(f"[*] Generating authentic test data for preset '{p}'...")
            p_dir = os.path.join(target_problems_root, p)
            name, desc, tl, ml, pts = generate_preset_problem(p, p_dir)

            payload = {
                "code": p,
                "name": name,
                "description": desc,
                "time_limit": tl,
                "memory_limit": ml,
                "points": pts,
            }

            print(f"[*] Registering '{p}' ({name}) via REST API: {args.api_url}...")
            try:
                res = register_problem_api(args.api_url, payload)
                print(f"[+] Success! Problem '{p}' registered with ID {res.get('id', 'N/A')}.")
                print(f"    - Problem Code: {res.get('code')}")
                print(f"    - Points: {res.get('points')}")
                print(f"    - Time Limit: {res.get('time_limit')}s")
                print(f"    - Testcases location: {p_dir}")
            except Exception as e:
                print(f"[!] Error registering '{p}' via API: {e}", file=sys.stderr)
                sys.exit(1)
        return

    if not args.code or not args.name:
        parser.print_help()
        sys.exit(1)

    p_dir = os.path.join(target_problems_root, args.code.lower())
    os.makedirs(p_dir, exist_ok=True)

    payload = {
        "code": args.code.lower(),
        "name": args.name,
        "description": args.desc,
        "time_limit": args.time_limit,
        "memory_limit": args.memory_limit,
        "points": args.points,
    }

    print(f"[*] Registering problem '{args.code}' via {args.api_url}...")
    try:
        res = register_problem_api(args.api_url, payload)
        print(f"[+] Success! Problem '{res.get('code')}' registered with ID {res.get('id')}.")
    except Exception as e:
        print(f"[!] Failed to register problem: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
