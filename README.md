# GrossRoutine (Next.js + Tailwind + Supabase)

`GrossRoutine.html` (단일 HTML/Vanilla JS 버전)을 **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase** 스택으로
그대로 이식한 프로젝트입니다. 기능·UX·디자인 시스템은 `GrossRoutine-기능명세서.md` 기준을 100% 따릅니다.

## 1. 사전 준비

- Node.js 18.18 이상 (Next.js 15 요구사항)
- Supabase 프로젝트 (이미 소스코드에 자격증명이 하드코딩되어 연동되어 있음 — 아래 3번 참고)

## 2. Supabase 스키마 생성 (최초 1회)

Supabase 대시보드 → SQL Editor에서 **`database/schema.sql`** 파일 내용을 그대로 붙여넣고 실행하세요.
다음이 생성됩니다.

- `routines`, `records` — 앱의 핵심 데이터 테이블 + RLS 정책(테스트 사이트라 인증 없이 공개 읽기/쓰기 허용)
- `app_stats` — "누적 기록 횟수" 실시간 카운터용 단일 행 테이블
- `increment_completions()` — `app_stats`를 원자적으로 1 증가시키는 RPC (클라이언트는 이 함수로만 값을 바꿀 수 있고, 테이블을 직접 UPDATE할 권한은 없음)
- `app_stats`를 Supabase Realtime 퍼블리케이션에 추가 (헤더의 실시간 카운터 반영용)

재실행해도 안전하게 작성되어 있습니다 (이미 있으면 건너뛰거나 덮어쓰는 방식).

## 3. Supabase 연동 정보

`.env.local` 같은 별도 환경변수 파일은 사용하지 않고, `lib/supabaseClient.ts`에 Project ID와
Publishable Key를 **직접 하드코딩**했습니다 (`supabase-info.md` 기준). Publishable Key는 RLS로
보호되는 클라이언트 공개 키라 프런트엔드 번들에 포함돼도 안전하도록 설계되어 있습니다.

다른 Supabase 프로젝트로 교체하려면 `lib/supabaseClient.ts`의 `SUPABASE_PROJECT_ID` /
`SUPABASE_PUBLISHABLE_KEY` 두 값만 바꾸면 됩니다.

## 4. 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

## 5. 폴더 구조

```
app/
  layout.tsx        루트 레이아웃 (다크 테마 기본 배경)
  page.tsx           엔트리 포인트 (GrossRoutineApp 렌더)
  globals.css         Tailwind 지시문 + 포커스 링 등 전역 스타일

components/
  GrossRoutineApp.tsx   전체 상태(루틴/기록/모달)를 소유하는 최상위 컴포넌트
  Header.tsx            브랜드 헤더 + 실시간 "누적 기록 횟수" 카운터 (Supabase Realtime 구독)
  NavTabs.tsx            루틴 관리 / 기록 탭 전환
  routines/              루틴 관리 탭: 목록, 카드, 생성/수정 모달, 상세 모달
  record/                기록 탭: 캘린더, 오늘의 운동 화면, 운동 항목, 루틴/이전기록 불러오기 모달, 운동 추가 모달
  shared/                공용 모달 셸, 운동 입력 폼(세트 수 스테퍼), 버튼 스타일 토큰

lib/
  types.ts              데이터 모델 타입 (Routine, RecordEntry, ExerciseEntry, SetEntry)
  supabaseClient.ts       Supabase 클라이언트 초기화 (자격증명 하드코딩)
  api.ts                  Supabase CRUD 함수 (routines/records/app_stats)
  colors.ts               루틴 6색 팔레트 (인덱스 → 그라데이션 매핑)
  utils.ts                날짜 포맷, 총 볼륨 계산, 최근 기록 탐색, 자동완성 후보 수집

database/
  schema.sql              테이블 + RLS 정책 + 통계 RPC + Realtime 설정 (전체 DDL)
```

## 6. 기능명세서 대비 구현 메모

- **데이터 모델**: `records.exercises[].sets[].completed`는 그날 실제 수행 여부이므로, 루틴/과거 기록을
  불러올 때(`이전 기록 불러오기`, `루틴 불러오기`) 항상 `false`로 초기화됩니다.
- **저장은 명시적으로만 발생**: 캘린더에서 날짜를 클릭하면 저장된 기록을 복사한 "임시 편집본(draft)"으로 진입하고,
  모든 조작은 React state(`draft`)에만 반영됩니다. "저장"을 눌러야 Supabase에 반영되고, "돌아가기"는 draft를 버립니다.
- **루틴은 항상 최신 정의를 따름**: 루틴 불러오기 시 운동 *목록*은 `routine.exercises` 기준, 세트 *값*만 동일
  루틴의 최근 기록이 있으면 그 값을 우선 사용합니다 (진행 과부하 추적 + 최신 루틴 반영 동시 충족).
- **저장 검증**: 오늘의 운동이 0개면 저장을 막고 안내 문구를 표시합니다.
- **색상 시스템**: 루틴은 생성 순서(배열 인덱스) 기준으로 6색이 순환 배정되며, 루틴 카드·불러오기 목록·캘린더 배지에서
  동일한 인덱스 매핑을 사용해 일관성을 유지합니다.
- **누적 기록 횟수**: "테스트 완료 = 운동 기록 저장"으로 간주해, 저장이 성공할 때마다 `increment_completions()`를
  호출합니다. 이 값은 실제로는 "총 저장 횟수"이며(회원 개념이 없어 서로 다른 사람인지는 구분할 수 없음),
  헤더에서 Supabase Realtime 구독으로 모든 접속자 화면에 실시간 반영됩니다.
