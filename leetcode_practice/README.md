# LeetCode 학습 (C / C++ / Python)

LeetCode 문제를 C, C++, Python 세 언어로 직접 풀어보며 학습하는 공간입니다.
각 문제 폴더에는 **직접 작성한 학습 노트**(`README.md`: 개요·힌트·시그니처) + **공식 문제 링크** + 언어별 풀이 템플릿이 들어 있습니다.

> ⚖️ **저작권 안내 (중요)**
> LeetCode의 **문제 설명·예제·제약 조건**은 LeetCode의 저작물이며, 약관상 복제·재배포가 금지됩니다.
> 따라서 이 저장소는 **문제 원문/번역을 싣지 않고**, 각 문제는 **공식 링크**로 연결합니다.
> 여기 포함된 것은 ① 제가 직접 쓴 학습 노트(개요·힌트), ② 제 풀이 코드뿐입니다. 문제 전문은 LeetCode에서 확인하세요.
>
> 📄 **라이선스**: 이 저장소의 풀이 코드·학습 노트는 [MIT License](LICENSE) (ⓒ 2026 sk)로 공개합니다. 단, LeetCode 문제 자체는 LeetCode 소유이며 라이선스 적용 대상이 아닙니다.

## 폴더 구조

```
04_Learning Machine/
  README.md                ← 지금 이 파일
  001_Two_Sum/
    README.md              ← 학습 노트(개요·힌트·시그니처) + 공식 문제 링크
    solution.c             ← C 풀이 (직접 작성)
    solution.cpp           ← C++ 풀이 (직접 작성)
    solution.py            ← Python 풀이 (직접 작성)
  002_Add_Two_Numbers/
  003_Longest_Substring_Without_Repeating_Characters/
  004_Median_of_Two_Sorted_Arrays/
  005_Longest_Palindromic_Substring/
  ...
```

## 진행 현황

| #  | 제목 | 난이도 | 주제 | 상태 |
|----|------|--------|------|------|
| 1  | Two Sum | Easy | 해시맵 | ⬜ |
| 2  | Add Two Numbers | Medium | 연결 리스트 | ⬜ |
| 3  | Longest Substring Without Repeating Characters | Medium | 슬라이딩 윈도우 | ⬜ |
| 4  | Median of Two Sorted Arrays | Hard | 이분 탐색 | ⬜ |
| 5  | Longest Palindromic Substring | Medium | 문자열 / DP | ⬜ |
| 6~20 | (1~5 확인 후 생성 예정) | | | ⬜ |

> 문제를 풀면 위 표의 ⬜ 를 ✅ 로 바꿔주세요.

## 컴파일 / 실행 방법 (Windows)

각 문제 폴더로 이동한 뒤:

**Python** — 현재 PC에서 바로 실행 가능 (Python 3.14)
```powershell
py solution.py
```
> 참고: 이 PC에서는 `python` 명령 대신 **`py`** 를 사용하세요. (`python` 은 Microsoft Store 스텁이라 동작하지 않습니다.)

**C** — 컴파일러 필요 (아래 설치 안내 참고)
```powershell
gcc solution.c -o sol.exe ; .\sol.exe
```

**C++**
```powershell
g++ solution.cpp -o sol.exe ; .\sol.exe
```

### ⚠️ C/C++ 컴파일러 설치 안내
현재 이 PC에는 C/C++ 컴파일러(gcc/g++/clang/cl)가 **설치되어 있지 않습니다**.
C/C++ 풀이를 실제로 컴파일·실행하려면 아래 중 하나를 설치하세요:

- **MSYS2 + MinGW-w64** (gcc/g++ 제공) — https://www.msys2.org/
  설치 후 `pacman -S mingw-w64-ucrt-x86_64-gcc` 로 gcc/g++ 설치
- **Visual Studio Build Tools** (cl.exe 제공) — https://visualstudio.microsoft.com/downloads/

> 컴파일러가 없어도 Claude가 코드를 **눈으로 검토(채점·해설)** 할 수 있습니다. 실제 실행 검증은 Python만 가능합니다.

## 채점 요청 방법

풀이를 작성한 뒤 Claude(저)에게 이렇게 말해주세요:

> "3번 채점해줘" / "Two Sum 파이썬 풀이 봐줘"

그러면 다음을 해드립니다:
1. **정확성 검토** — 논리 버그, 빠뜨린 엣지 케이스 점검
2. **실행 검증** — Python은 실제로 돌려서 확인 (C/C++은 컴파일러 설치 시)
3. **복잡도 분석** — 시간/공간 복잡도 계산
4. **해설 & 개선** — 더 나은 접근법, 모범 답안과 비교 (한국어)
