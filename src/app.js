/* 제약 바이오 EBRS 목업 — 예시 데이터로 모든 메뉴·버튼이 동작하는 단일 페이지 */
const S = Object.fromEntries(SPEC.map(s => [s.id, s]));
const ic = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24">${IC[n] || IC.fileText}</svg>`;
const IC_LOGO = ic("flask");

/* ================= 다국어 ================= */
let LANG = (() => { try { return localStorage.getItem("ebrs-lang") || "ko"; } catch (e) { return "ko"; } })();
const MISS = new Set();
function t(s, v) {
  if (s == null) return "";
  s = String(s); let r = s;
  if (LANG !== "ko") {
    const D = I18N[LANG] || {};
    if (D[s] != null) r = D[s];
    else {
      const m = s.match(/^(.*\S)(\s+[\d][\d.\-/]*)$/);
      if (m && D[m[1]] != null) r = D[m[1]] + m[2];
      else if (/[가-힣]/.test(s)) MISS.add(s);
    }
  }
  if (v) r = r.replace(/\{(\w+)\}/g, (x, k) => (v[k] ?? x));
  return r;
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const tt = (s, v) => esc(t(s, v));
function setLang(l) {
  LANG = l; try { localStorage.setItem("ebrs-lang", l); } catch (e) {}
  document.documentElement.lang = l;
  applyStatic();
  if (!document.getElementById("app").classList.contains("hidden")) { document.getElementById("menu").innerHTML = menuHTML(); openScreen(CUR, true); }
  if (!document.getElementById("pop").classList.contains("hidden")) renderPop();
  document.querySelectorAll("#modalRoot .mask").forEach(m => m.remove());
}
function applyStatic() {
  document.querySelectorAll("[data-t]").forEach(e => { e.textContent = t(e.dataset.t); });
  document.querySelectorAll("[data-tp]").forEach(e => { e.placeholder = t(e.dataset.tp); });
  document.querySelectorAll(".langsw button").forEach(b => b.classList.toggle("on", b.dataset.l === LANG));
  const mn = document.getElementById("meName"); if (mn) { mn.textContent = t(ME); document.getElementById("meAv").textContent = t(ME)[0]; }
  document.title = t("제약 바이오 EBRS");
}
function langSw() { return `<div class="langsw">${ic("globe")}${[["ko", "한"], ["en", "EN"], ["ja", "日"]].map(([l, x]) => `<button data-l="${l}" class="${l === LANG ? "on" : ""}" onclick="setLang('${l}')">${x}</button>`).join("")}</div>`; }

/* ================= 날짜·예시 값 ================= */
const TODAY = new Date(2026, 9, 19);
function d(off) { const x = new Date(TODAY); x.setDate(x.getDate() - off); return x.toISOString().slice(0, 10); }
function dt(off, h) { return d(off) + " " + String(8 + (h % 10)).padStart(2, "0") + ":" + String((h * 17) % 60).padStart(2, "0"); }
function now() { const x = new Date(); return d(0) + " " + String(x.getHours()).padStart(2, "0") + ":" + String(x.getMinutes()).padStart(2, "0"); }
function num(i, base, sp, dp = 1) { return (base + ((i * 37) % 100) / 100 * sp).toFixed(dp); }
function rnd(i, arr) { return arr[i % arr.length]; }
const ME = "김민준", POPME = "박지훈";
const PRODUCTS = [["API-A101", "P-10021"], ["Intermediate B-205", "P-10034"], ["API-C330", "P-10057"], ["Compound D-712", "P-10068"], ["API-E118", "P-10072"], ["Intermediate F-090", "P-10085"], ["API-G245", "P-10091"], ["Excipient H-02", "P-10103"]];
const PEOPLE = ["김민준", "이서연", "박지훈", "최유진", "정하늘", "강도윤", "윤서아", "장민재"];
const DEPTS = ["생산1팀", "생산2팀", "품질보증팀", "제조기술팀", "EHS팀"];
const MATS = [["Toluene", "M-2001"], ["Methanol", "M-2014"], ["Sodium hydroxide", "M-2030"], ["Acetic acid", "M-2042"], ["Ethyl acetate", "M-2055"], ["Purified water", "M-2060"], ["Hydrochloric acid", "M-2071"], ["Activated carbon", "M-2088"]];
const EQUIP = ["R-1201 반응기", "R-1202 반응기", "D-1301 건조기", "F-1401 여과기", "C-1501 농축기", "T-1207 저장탱크", "X-1451 연속반응기", "P-1601 포장기"];
const ROOMS = ["건조실", "칭량 포장실", "분쇄실", "원료 보관실", "반응실 A", "반응실 B", "Air lock", "복도"];
const STEPS = ["원료 투입", "반응", "숙성", "여과", "농축", "건조", "포장"];
const GSTAT = ["임시저장", "검토중", "승인완료", "시행", "결재대기", "반려"];

/* 열 이름으로 값 종류와 예시 값을 정한다: [종류, 값] */
function gen(C, i) {
  const k = i * 3 + C.length;
  if (/^no\.?$|^no$|순서|^seq|^rank$/i.test(C)) return ["text", String(i + 1)];
  if (/상세보기|보기$|^pop$|^paper$|executed br|configuration/i.test(C)) return ["btn", /paper/i.test(C) ? "Paper" : /pop/i.test(C) ? "POP" : "상세보기"];
  if (/사용여부|사용 여부|반영 여부|^use/i.test(C)) return ["status", i % 5 == 4 ? "미사용" : "사용"];
  if (/잠금여부/.test(C)) return ["status", i % 6 == 5 ? "잠금" : "정상"];
  if (/^tmp|참고사항/i.test(C)) return ["text", "-"];
  if (/이메일|email/i.test(C)) return ["text", "user" + (i + 1) + "@example.com"];
  if (/연락처|전화/.test(C)) return ["text", "010-0000-" + (1201 + i)];
  if (/사용자 ?id|^id$/i.test(C)) return ["text", "user" + String(i + 1).padStart(3, "0")];
  if (/^성명$|사용자명|이름/.test(C)) return ["text", rnd(i, PEOPLE)];
  if (/권한/.test(C)) return ["text", rnd(i, ["MBR 관리자", "작업자", "품질보증", "시스템 관리자"])];
  if (/직급/.test(C)) return ["text", rnd(i, ["사원", "대리", "과장", "차장", "부장"])];
  if (/직위/.test(C)) return ["text", rnd(i, ["팀원", "파트장", "팀장"])];
  if (/근무조/.test(C)) return ["text", rnd(i, ["A조", "B조", "C조", "주간"])];
  if (/cas/i.test(C)) return ["text", rnd(i, ["108-88-3", "67-56-1", "1310-73-2", "64-19-7", "141-78-6", "7732-18-5"])];
  if (/제조사|supplier|공급/i.test(C)) return ["text", rnd(i, ["Vendor A", "Vendor B", "Vendor C"])];
  if (/유해성 ?등급/.test(C)) return ["text", "Grade " + (1 + i % 4)];
  if (/h-code/i.test(C)) return ["text", rnd(i, ["H225", "H301", "H314", "H319"])];
  if (/성상/.test(C)) return ["text", rnd(i, ["액체", "고체", "분말"])];
  if (/^(bp|fp|mp)$/i.test(C)) return ["text", num(k, 20, 120, 0) + " ℃"];
  if (/주의사항|조치|보호구 \(|선택 보호구|제안 보호구/.test(C)) return ["text", rnd(i, ["보안경·내화학 장갑 착용", "국소배기 가동 확인", "방독마스크 착용", "정전기 방지 조치"])];
  if (/보호구명|보호구구분/.test(C)) return ["text", rnd(i, ["방독마스크", "보안경", "내화학 장갑", "보호복", "안전화"])];
  if (/세션|횟수|기간\(일\)|시간\(일\)|시간\(분\)/.test(C)) return ["input", String(rnd(i, [30, 5, 90, 7]))];
  if (/서명|supervisor|operator|작업자|확인자|점검자|담당자|검토자|승인|approved|written|engineer|manager|writer|작성자|수정자|등록자|기안자|결재자|채취자|전달자|지시자|발행자|수신자|initial|제조관리|품질보증/i.test(C)) {
    if (/날짜|date|일시|등록일|작성일|수정일/i.test(C)) return ["text", dt(i, i)];
    if (/구획/.test(C)) return ["status", i % 3 ? "사용" : "미사용"];
    return ["sign", i % 4 == 3 ? "" : rnd(i + C.length, PEOPLE) + "|" + dt(i % 3, i)];
  }
  if (/product name|제품명|제품 명|생산제품명|제조품목|^제품$|^item$/i.test(C)) return ["text", rnd(i, PRODUCTS)[0]];
  if (/product code|제품 ?id|제품코드|제품id번호|물질 id|material id/i.test(C)) return ["text", /물질|material/i.test(C) ? rnd(i, MATS)[1] : rnd(i, PRODUCTS)[1]];
  if (/물질명|material name|취급물질 name|물질 name|취급원료|취급 원료|취급 물질명/i.test(C)) return ["text", rnd(i, MATS)[0]];
  if (/물질코드|취급물질 code/i.test(C)) return ["text", rnd(i, MATS)[1]];
  if (/plant|제조소|공장/i.test(C)) return ["text", "Plant " + (1 + i % 2)];
  if (/process ?type/i.test(C)) return ["text", ["Chemical", "Bio", "Packaging"][i % 3]];
  if (/br no|mbr 번호|mbr번호|br 번호|mbr no/i.test(C)) return ["text", "MBR-26-" + String(101 + i).padStart(4, "0")];
  if (/ver|버전|개정/i.test(C)) return ["text", ["1.0", "1.1", "2.0", "1.0"][i % 4]];
  if (/campaign|캠페인/i.test(C)) return ["text", "CP-26" + String(10 + i % 4).padStart(2, "0")];
  if (/batch|제조번호/i.test(C)) return ["text", "B26-" + String(1012 + i).padStart(4, "0")];
  if (/대 ?공정/.test(C) && !/구분/.test(C)) return ["text", rnd(i, STEPS)];
  if (/소 ?공정/.test(C)) return ["text", rnd(i, STEPS) + " " + (1 + i % 2)];
  if (/step/i.test(C)) return ["text", String(10 + i * 10)];
  if (/created no/i.test(C)) return ["text", "C-" + (300 + i)];
  if (/title|결재명|제목/i.test(C)) return ["text", rnd(i, ["Master 제조지시서", "공정 변경 승인 요청", "BR 반납 검토 결재", "MBR 개정 승인"])];
  if (/^class$/i.test(C)) return ["text", i % 3 == 0 ? "Parent" : "Child"];
  if (/알람 ?유형|^유형$|remark 유형/i.test(C)) return ["text", rnd(i, ["온도 이탈", "시간 초과", "설비 알람", "기록 누락"])];
  if (/status|상태|진행|현황|결과/i.test(C)) return ["status", GSTAT[i % 6]];
  if (/부서/.test(C)) return ["text", rnd(i, DEPTS)];
  if (/양식/.test(C)) return ["text", rnd(i, ["MBR 승인", "BR 반납 검토", "공정 변경", "일탈 보고"])];
  if (/결재번호/.test(C)) return ["text", "AP-2610-" + String(31 + i).padStart(4, "0")];
  if (/단계/.test(C)) return ["text", (1 + i % 3) + " / 3"];
  if (/date|일자|일시|시점|시작일|종료일|예정|기안일|완료일|등록일|작성일|수정일|사용일|폐기일|작업일|확인일|시작$|종료$|updated/i.test(C))
    return ["date", (/obsolete|폐기/i.test(C) && i % 3) ? "-" : dt(i * 2, i).slice(0, /시점|일시|시작$|종료$/.test(C) ? 16 : 10)];
  if (/^(ti|mi|pdi)-/i.test(C)) return ["text", C.split("-")[0].toUpperCase() + "-" + (1201 + i)];
  if (/tag|pdi/i.test(C)) return ["text", ["TI-", "PDI-", "TT-"][i % 3] + (1201 + i)];
  if (/실명|위치|장소|보관/.test(C)) return ["text", rnd(i, ROOMS)];
  if (/장비|설비|equipment/i.test(C)) return ["text", rnd(i, EQUIP)];
  if (/온도|temp|℃/i.test(C)) return ["input", num(k, 18, 5)];
  if (/습도/.test(C)) return ["input", num(k, 35, 15, 0)];
  if (/차압|압력|pressure/i.test(C)) return ["input", num(k, 12, 8)];
  if (/gross|tare|net|wt|무게|중량|측정값|실측|적산|사용량|검체량|amount|target|kg|value|record$/i.test(C)) return ["input", num(k, 20, 180, 2)];
  if (/unit|단위/i.test(C)) return ["text", ["kg", "L", "℃", "min"][i % 4]];
  if (/p\/f|pass|합격|육안|확인$|여부|건조|밀봉/i.test(C)) return ["status", i % 5 == 4 ? "N/A" : "적합"];
  if (/^s\/f/i.test(C)) return ["text", i % 2 ? "F" : "S"];
  if (/인수 ?번호/.test(C)) return ["text", "RC-2610-" + String(41 + i).padStart(4, "0")];
  if (/drum/i.test(C)) return ["text", "D-" + String(i + 1).padStart(2, "0")];
  if (/계산인자|factor/i.test(C)) return ["text", (0.95 + ((i * 7) % 5) / 100).toFixed(3)];
  if (/량|수율|값|eq\.|vol\.|밀도|분자량|min\.|max\./i.test(C)) return ["text", num(k, 10, 240, 2)];
  if (/min|max|범위|range|기준|standard|sp$|pv$|ll$|hh$|std|equals/i.test(C)) return ["text", num(k, 1, 99, 1)];
  if (/알람|alarm/i.test(C)) return ["status", i % 4 == 2 ? "경고" : "정상"];
  if (/특이사항|비고|remark|기타|comment|의견|내용|내역|절차|contents/i.test(C)) return ["text", i % 2 ? "-" : "이상 없음"];
  if (/상위그룹명|그룹명/.test(C)) return ["text", rnd(i, ["진행상태", "공정구분", "단위", "설비유형", "보호구 유형", "결재상태"])];
  if (/하위코드명|코드명/.test(C)) return ["text", rnd(i, ["대기", "발행", "생산중", "생산 종료", "회수", "반납"])];
  if (/번호|no\.?$/i.test(C)) return ["text", "N-26" + String(501 + i).padStart(4, "0")];
  if (/코드|code|id$/i.test(C)) return ["text", "CD" + String(100 + i * 3)];
  if (/구분|type|분류|유형|방식/i.test(C)) return ["text", rnd(i, ["일반", "세척", "점검", "사용"])];
  if (/명$|name/i.test(C)) return ["text", rnd(i, ["항목 A", "항목 B", "항목 C", "항목 D"])];
  if (/주기/.test(C)) return ["text", rnd(i, ["1", "2", "4", "8"])];
  return ["text", ["-", "확인", "-", "완료"][i % 4]];
}
const colType = C => gen(C, 0)[0];

/* ================= 예시 데이터 저장소 ================= */
const DBKEY = "ebrs-mock-v3";
let DB = (() => { try { return JSON.parse(localStorage.getItem(DBKEY)) || null; } catch (e) { return null; } })() || {};
let saveTimer;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(DBKEY, JSON.stringify(DB)); } catch (e) {} }, 150); }
let UID = 1000; const uid = () => "r" + (++UID) + Math.random().toString(36).slice(2, 6);
function rowsFor(key, cols, n) {
  if (!DB.g) DB.g = {};
  if (!DB.g[key]) { DB.g[key] = Array.from({ length: n }, (_, i) => ({ id: uid(), v: cols.map(c => gen(c, i)[1]) })); save(); }
  return DB.g[key];
}
function seed() {
  if (DB.mbr) return;
  const MS = ["임시저장", "검토중", "승인완료", "시행", "시행", "폐기", "시행", "시행", "임시저장", "시행", "시행", "승인완료"];
  DB.mbr = MS.map((st, i) => { const p = rnd(i, PRODUCTS); return { id: uid(), no: "MBR-26-" + String(101 + i).padStart(4, "0"), ver: ["1.0", "1.1", "2.0"][i % 3], prod: p[0], code: p[1], plant: "Plant " + (1 + i % 2), ptype: ["Chemical", "Bio", "Packaging"][i % 3], created: "C-" + (300 + i), title: "Master 제조지시서", cls: i % 3 ? "Child" : "Parent", st, writer: rnd(i, PEOPLE), upd: d(i * 3), eff: (st === "시행" || st === "폐기") ? d(i * 3 + 20) : "", obs: st === "폐기" ? d(1) : "", mgr: [ME] }; });
  const ES = ["대기", "발행 완료", "제조지시 완료", "설정 완료", "BR 불출", "생산중", "생산중", "생산 종료", "반납 검토", "작업중단", "회수", "반납 완료", "생산중", "대기"];
  DB.ebr = ES.map((st, i) => { const p = rnd(i, PRODUCTS); const k = EORDER.indexOf(st); const kk = k < 0 ? 6 : k;
    return { id: uid(), prod: p[0], code: p[1], mbr: "MBR-26-" + String(101 + (i % 12)).padStart(4, "0"), ver: ["1.0", "1.1", "2.0"][i % 3], cp: "CP-26" + (10 + i % 4), batch: "B26-" + (1012 + i), st, prev: st === "작업중단" ? "생산중" : "",
      iss: kk >= 1 ? d(20 - i) : "", ord: kk >= 2 ? d(18 - i) : "", plan: kk >= 3 ? d(12 - i) : "", start: kk >= 5 ? dt(Math.max(0, 9 - i), i) : "", end: kk >= 6 ? dt(Math.max(0, 6 - i), i + 3) : "", hold: st === "작업중단" ? "R-1201 재킷 온도 상한 초과" : "" }; });
  DB.ebr.forEach((e, i) => { if (e.st === "생산중") (DB.pop = DB.pop || {})[e.batch] = { cur: 2 + (i % 3), rec: {} }; if (e.st === "작업중단") (DB.pop = DB.pop || {})[e.batch] = { cur: 2, rec: {} }; });
  const AS = ["결재대기", "결재대기", "결재대기", "결재대기", "결재대기", "진행중", "진행중", "승인완료", "승인완료", "반려", "승인완료", "회수"];
  DB.appr = AS.map((st, i) => ({ id: uid(), no: "AP-2610-" + String(31 + i).padStart(4, "0"), form: rnd(i, ["MBR 승인", "BR 반납 검토", "공정 변경", "MBR 승인", "일탈 보고"]), title: rnd(i, ["MBR 개정 승인", "BR 반납 검토 결재", "공정 변경 승인 요청", "Master 제조지시서 승인", "일탈 보고"]) + " · " + (i < 3 ? DB.mbr[i].no : "B26-" + (1012 + i)), st, stage: st === "승인완료" ? "3 / 3" : st === "결재대기" ? "2 / 3" : "1 / 3", draft: d(i + 1), done: st === "승인완료" || st === "반려" ? d(i) : "", dept: rnd(i, DEPTS), drafter: i % 4 == 0 ? ME : rnd(i + 1, PEOPLE), link: i < 3 ? { t: "mbr", no: DB.mbr[i].no } : null, comment: "" }));
  DB.remarks = []; DB.logs = {}; DB.alarm = { tr: [55, 70], tj: [50, 70], ag: [80, 150], pr: [0, 1] }; DB.results = [];
  save();
}
const EORDER = ["대기", "발행 완료", "제조지시 완료", "설정 완료", "BR 불출", "생산중", "생산 종료", "반납 검토", "반납 완료"];
const ECLS = { "대기": "", "발행 완료": "info", "제조지시 완료": "info", "설정 완료": "pur", "BR 불출": "teal", "생산중": "teal", "생산 종료": "ok", "반납 검토": "warn", "반납 완료": "ok", "작업중단": "err", "회수": "", "Drop": "err" };
const CHIPCLS = { "승인완료": "ok", "시행": "teal", "임시저장": "", "검토중": "info", "결재대기": "warn", "진행중": "info", "반려": "err", "회수": "", "폐기": "err", "적합": "ok", "부적합": "err", "정상": "ok", "경고": "warn", "N/A": "", "사용": "ok", "미사용": "", "잠금": "err", "완료": "ok", ...ECLS };
function pill(s, cls) { return `<span class="pill ${cls ?? CHIPCLS[s] ?? ""}"><span class="d"></span>${tt(s)}</span>`; }
function signedHTML(v) { const [n, ts] = String(v).split("|"); return `<span class="signed">${tt(n)}<small>${esc((ts || "").slice(5))}</small></span>`; }

/* ================= 그리드 컴포넌트 ================= */
const GRIDS = {}, VS = {};
const gid = k => "g_" + k.replace(/[^a-zA-Z0-9_]/g, "_");
function gridBox(key, g, n = 6, opt = {}) {
  GRIDS[key] = { cols: g.cols, title: g.title, opt };
  rowsFor(key, g.cols, n);
  VS[key] = VS[key] || { page: 0, sort: null, sel: new Set(), filter: null };
  return `<div id="${gid(key)}">${gridInner(key)}</div>`;
}
function gridCard(key, g, n, tools = "") {
  GRIDS[key] = { cols: g.cols, title: g.title, opt: {} };
  rowsFor(key, g.cols, n);
  VS[key] = VS[key] || { page: 0, sort: null, sel: new Set(), filter: null };
  return `<div class="card"><div class="card-h">${tt(g.title)}<span class="cnt" id="${gid(key)}_cnt"></span><div class="tools"><button class="btn sm" onclick="sortReset('${key}')">${ic("refresh")}${tt("정렬 초기화")}</button><button class="btn sm" onclick="exportCSV('${key}')">${ic("download")}${tt("엑셀 저장")}</button>${tools}</div></div><div id="${gid(key)}">${gridInner(key)}</div></div>`;
}
function viewRows(key) {
  let rows = DB.g[key].slice(); const v = VS[key], G = GRIDS[key];
  if (v.filter) rows = rows.filter(r => v.filter(r.v, G.cols));
  if (v.sort) { const [ci, dir] = v.sort; rows.sort((a, b) => String(a.v[ci]).localeCompare(String(b.v[ci]), undefined, { numeric: true }) * dir); }
  return rows;
}
function gridInner(key) {
  const G = GRIDS[key], v = VS[key], rows = viewRows(key), per = G.opt.per || 10, pages = Math.max(1, Math.ceil(rows.length / per));
  if (v.page >= pages) v.page = pages - 1;
  const pr = rows.slice(v.page * per, v.page * per + per);
  const types = G.cols.map(colType);
  setTimeout(() => { const c = document.getElementById(gid(key) + "_cnt"); if (c) c.textContent = t("{n}건", { n: rows.length }); });
  let h = `<div class="grid-wrap"><table class="grid"><thead><tr><th class="ck"><input type="checkbox" onclick="selAll('${key}',this.checked)"></th>${G.cols.map((c, i) => `<th onclick="sortBy('${key}',${i})">${tt(c)}${v.sort && v.sort[0] === i ? (v.sort[1] > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead><tbody>`;
  if (!pr.length) h += `<tr><td colspan="${G.cols.length + 1}" class="empty">${tt("조회된 데이터가 없습니다.")}</td></tr>`;
  for (const r of pr) {
    h += `<tr class="${v.sel.has(r.id) ? "sel" : ""}" onclick="rowClick(event,'${key}','${r.id}')"><td class="ck"><input type="checkbox" ${v.sel.has(r.id) ? "checked" : ""}></td>`;
    G.cols.forEach((c, ci) => {
      const val = r.v[ci], ty = types[ci];
      let x;
      if (ty === "btn") x = `<button class="btn sm" onclick="event.stopPropagation();gridBtn('${key}','${r.id}','${esc(val)}')">${tt(val)}</button>`;
      else if (ty === "status") x = pill(val);
      else if (ty === "sign") x = val ? signedHTML(val) : `<button class="btn sm acc" onclick="event.stopPropagation();signRow('${key}','${r.id}',${ci})">${ic("pen")}${tt("서명")}</button>`;
      else if (ty === "input") x = `<input value="${esc(val)}" onclick="event.stopPropagation()" onchange="setVal('${key}','${r.id}',${ci},this.value)">`;
      else x = tt(val);
      h += `<td>${x}</td>`;
    });
    h += "</tr>";
  }
  h += "</tbody></table></div>";
  if (rows.length > per || G.opt.pager) h += `<div class="pager"><span>${tt("총 {n}건", { n: rows.length })}</span><div class="pg"><span onclick="goPage('${key}',${v.page - 1})">‹</span>${Array.from({ length: pages }, (_, i) => `<span class="${i === v.page ? "on" : ""}" onclick="goPage('${key}',${i})">${i + 1}</span>`).join("")}<span onclick="goPage('${key}',${v.page + 1})">›</span></div></div>`;
  return h;
}
function rerender(key) { const e = document.getElementById(gid(key)); if (e) e.innerHTML = gridInner(key); }
function goPage(key, p) { const v = VS[key], rows = viewRows(key), per = GRIDS[key].opt.per || 10; v.page = Math.max(0, Math.min(p, Math.ceil(rows.length / per) - 1)); rerender(key); }
function sortBy(key, ci) { const v = VS[key]; v.sort = v.sort && v.sort[0] === ci ? [ci, -v.sort[1]] : [ci, 1]; rerender(key); }
function sortReset(key) { VS[key].sort = null; rerender(key); toast(t("정렬을 초기화했습니다.")); }
function selAll(key, on) { const v = VS[key]; v.sel = new Set(on ? viewRows(key).map(r => r.id) : []); rerender(key); }
function rowClick(ev, key, id) { const v = VS[key]; if (v.sel.has(id)) v.sel.delete(id); else { if (!ev.target.matches("input[type=checkbox]")) v.sel.clear(); v.sel.add(id); } ACTIVE = key; rerender(key); }
function setVal(key, id, ci, val) { const r = DB.g[key].find(x => x.id === id); if (r) { r.v[ci] = val; save(); } }
function signRow(key, id, ci) { esign(t("서명"), () => { const r = DB.g[key].find(x => x.id === id); r.v[ci] = ME + "|" + now(); save(); rerender(key); }); }
function selected(key) { return DB.g[key].filter(r => VS[key].sel.has(r.id)); }
function exportCSV(key, rows, cols) {
  cols = cols || GRIDS[key].cols; rows = rows || viewRows(key).map(r => r.v);
  const q = s => `"${String(t(String(s).split("|")[0])).replace(/"/g, '""')}"`;
  const csv = "﻿" + [cols.map(c => q(c)).join(","), ...rows.map(r => r.map(q).join(","))].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = (key || "export").replace(/[^\w-]/g, "_") + "_" + d(0) + ".csv"; document.body.appendChild(a); a.click(); a.remove();
  toast(t("{n}건을 엑셀(CSV)로 저장했습니다.", { n: rows.length }));
}
function gridBtn(key, id, label) {
  const r = DB.g[key].find(x => x.id === id);
  if (label === "POP") return openPop();
  if (label === "Paper") return brReport(DB.ebr.find(e => r.v.includes(e.batch)) || DB.ebr[5]);
  detailModal(GRIDS[key].title, GRIDS[key].cols, r.v);
}
function detailModal(title, cols, vals) {
  modal(t(title) + " · " + t("상세"), `<div class="kvgrid">${cols.map((c, i) => colType(c) === "btn" ? "" : `<div><span>${tt(c)}</span><b>${colType(c) === "sign" ? (vals[i] ? signedHTML(vals[i]) : tt("미서명")) : colType(c) === "status" ? pill(vals[i]) : tt(vals[i] || "-")}</b></div>`).join("")}</div>`, "md");
}

/* 그리드 버튼(스펙 버튼) 동작 */
let ACTIVE = null;
function actFor(b) {
  if (/엑셀|excel/i.test(b)) return "excel";
  if (/pdf/i.test(b)) return "pdf";
  if (/정렬 초기화/.test(b)) return "sortreset";
  if (/취소/.test(b)) return "cancel";
  if (/초기화|지우기|되돌리기/.test(b)) return "reset";
  if (/삭제/.test(b)) return "delete";
  if (/등록|추가|신규/.test(b)) return "add";
  if (/수정|편집|설정$/.test(b) && !/잠금/.test(b)) return "edit";
  if (/copy|복사/i.test(b)) return "copy";
  if (/위로/.test(b)) return "up";
  if (/아래로/.test(b)) return "down";
  if (/저장/.test(b)) return "save";
  if (/잠금해제/.test(b)) return "unlock";
  if (/paper|보기|규칙|입력/i.test(b)) return "view";
  if (/서명|결재|승인|반려|transfer|전송|발행|확정|완료|validation|상신|n\/a/i.test(b)) return "sign";
  return "misc";
}
function act(b, key) {
  key = key || ACTIVE;
  if (key && !(GRIDS[key] && VS[key])) { const pre = key.replace(/:t?\d+$/, ""); key = Object.keys(GRIDS).find(k => k.startsWith(pre) && VS[k] && document.getElementById(gid(k))) || null; }
  const a = actFor(b), G = key && GRIDS[key];
  const need = () => { const s = selected(key); if (!s.length) { toast(t("먼저 목록에서 행을 선택하세요.")); return null; } return s; };
  switch (a) {
    case "excel": return key ? exportCSV(key) : toast(t("내보낼 목록이 없습니다."));
    case "pdf": return printDoc(t(b));
    case "sortreset": return key && sortReset(key);
    case "cancel": if (key) { VS[key].sel.clear(); rerender(key); } return toast(t("변경을 취소했습니다."));
    case "reset": if (key) { VS[key].filter = null; VS[key].sel.clear(); rerender(key); } return toast(t("초기화했습니다."));
    case "add": if (!G) return toast(t("완료했습니다.")); return rowForm(key, null, b);
    case "edit": { if (!G) return toast(t("완료했습니다.")); const s = need(); if (s) rowForm(key, s[0], b); return; }
    case "delete": { const s = need(); if (s) esign(t(b), () => { DB.g[key] = DB.g[key].filter(r => !VS[key].sel.has(r.id)); VS[key].sel.clear(); save(); rerender(key); toast(t("{n}건을 삭제했습니다.", { n: s.length })); }); return; }
    case "copy": { const s = need(); if (s) { s.forEach(r => DB.g[key].push({ id: uid(), v: r.v.slice() })); save(); rerender(key); toast(t("{n}건을 복사했습니다.", { n: s.length })); } return; }
    case "up": case "down": { const s = need(); if (!s) return; const arr = DB.g[key], i = arr.indexOf(s[0]), j = a === "up" ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; save(); rerender(key); return; }
    case "save": save(); return toast(t("저장했습니다."));
    case "unlock": { const s = need(); if (!s) return; const ci = G.cols.findIndex(c => /잠금여부/.test(c)); s.forEach(r => { if (ci >= 0) r.v[ci] = "정상"; }); save(); rerender(key); return toast(t("잠금을 해제했습니다.")); }
    case "view": { if (key && selected(key).length) return detailModal(G.title, G.cols, selected(key)[0].v); return brReport(DB.ebr[5]); }
    case "sign": return esign(t(b), () => {
      if (key) { const s = selected(key); const si = G.cols.findIndex(c => colType(c) === "status"); s.forEach(r => { if (si >= 0) r.v[si] = /반려/.test(b) ? "반려" : "승인완료"; }); save(); rerender(key); }
      toast(t("{b} 처리했습니다.", { b: t(b) }));
    });
    default: return toast(t("{b} 처리했습니다.", { b: t(b) }));
  }
}
function rowForm(key, row, b) {
  const G = GRIDS[key];
  const fields = G.cols.map((c, i) => [c, i, colType(c)]).filter(([c, i, ty]) => ty !== "btn" && ty !== "sign" && !/^no\.?$/i.test(c));
  const body = `<div class="form-grid">${fields.map(([c, i, ty]) => {
    const val = row ? row.v[i] : "";
    if (ty === "status") { const opts = [...new Set(DB.g[key].map(r => r.v[i]))]; return `<div class="fld"><label>${tt(c)}</label><select data-i="${i}">${opts.map(o => `<option value="${esc(o)}" ${o === val ? "selected" : ""}>${tt(o)}</option>`).join("")}</select></div>`; }
    return `<div class="fld"><label>${tt(c)}</label><input type="${ty === "date" && String(val).length <= 10 ? "date" : "text"}" data-i="${i}" value="${esc(val === "-" ? "" : val)}"></div>`;
  }).join("")}</div>`;
  const id = modal(t(b) + " · " + t(G.title), body, "md", [[t("취소")], [t("저장"), "pri", () => {
    const m = document.getElementById(id); const vals = {};
    m.querySelectorAll("[data-i]").forEach(e => vals[e.dataset.i] = e.value.trim());
    if (!Object.values(vals).some(x => x)) return toast(t("값을 하나 이상 입력하세요."));
    if (row) Object.entries(vals).forEach(([i, v]) => row.v[i] = v || "-");
    else { const v = G.cols.map((c, i) => vals[i] != null ? (vals[i] || "-") : /^no\.?$/i.test(c) ? String(DB.g[key].length + 1) : colType(c) === "sign" ? "" : gen(c, 0)[1]); DB.g[key].unshift({ id: uid(), v }); }
    save(); closeModal(id); rerender(key); toast(row ? t("수정했습니다.") : t("등록했습니다."));
  }]]);
}

/* ================= 조회 조건 ================= */
const norm = s => String(s).toLowerCase().replace(/[\s.()\[\]#_\-/]/g, "").replace(/명$/, "");
function matchCol(field, cols) {
  const f = norm(field.split("~")[0].replace(/검색|조회기간|발생|시작일|종료일|최종/g, ""));
  let i = cols.findIndex(c => norm(c) === f); if (i >= 0) return i;
  return cols.findIndex(c => f && (norm(c).includes(f) || f.includes(norm(c))) && norm(c).length > 1);
}
function searchHTML(fields, key, custom) {
  if (!fields || !fields.length) return "";
  const cols = key ? GRIDS[key].cols : [];
  return `<div class="card"><form class="search" onsubmit="return false" id="sf_${gid(key || custom)}">${fields.map(f => {
    if (/~/.test(f) || /^기간$/.test(f)) return `<div class="fld span2"><label>${tt(f.split("~")[0].replace(/(검색|조회기간|발생|이슈발행) ?시작일/, "기간").trim() || "기간")}</label><div class="ctl"><input type="date" data-k="from" value="${d(90)}"><span class="muted">~</span><input type="date" data-k="to" value="${d(0)}"></div></div>`;
    if (/기간무시|기간 무시/.test(f)) return `<div class="fld chk"><label><input type="checkbox" data-k="ignore"> ${tt("기간 무시")}</label></div>`;
    if (/포함|제외/.test(f)) return `<div class="fld chk"><label><input type="checkbox" data-k="${/제외/.test(f) ? "excl" : "incl"}" checked> ${tt(f)}</label></div>`;
    if (/시작일$|종료일$/.test(f)) return `<div class="fld"><label>${tt(f)}</label><input type="date" data-k="${/종료/.test(f) ? "to" : "from"}" value="${/종료/.test(f) ? d(0) : d(90)}"></div>`;
    const ci = key ? matchCol(f, cols) : -1;
    const opts = custom && SELOPTS[custom] && SELOPTS[custom][f];
    if (opts || (ci >= 0 && colType(cols[ci]) === "status")) {
      const o = opts || [...new Set(DB.g[key].map(r => r.v[ci]))];
      return `<div class="fld"><label title="${tt(f)}">${tt(f)}</label><select data-f="${esc(f)}" data-ci="${ci}"><option value="">${tt("전체")}</option>${o.map(x => `<option value="${esc(x)}">${tt(x)}</option>`).join("")}</select></div>`;
    }
    return `<div class="fld"><label title="${tt(f)}">${tt(f)}</label><input type="text" data-f="${esc(f)}" data-ci="${ci}" placeholder="${tt("입력")}" onkeydown="if(event.key==='Enter')runSearch('${key || ""}','${custom || ""}')"></div>`;
  }).join("")}</form><div class="search-act"><button class="btn" onclick="resetSearch('${key || ""}','${custom || ""}')">${ic("refresh")}${tt("초기화")}</button><button class="btn pri" onclick="runSearch('${key || ""}','${custom || ""}')">${ic("search")}${tt("조회")}</button></div></div>`;
}
function readSearch(key, custom) {
  const f = document.getElementById("sf_" + gid(key || custom)); const q = { terms: [], from: "", to: "", ignore: false, excl: true, incl: true };
  f.querySelectorAll("[data-f]").forEach(e => { if (e.value.trim()) q.terms.push({ f: e.dataset.f, ci: +e.dataset.ci, v: e.value.trim(), exact: e.tagName === "SELECT" }); });
  f.querySelectorAll("[data-k]").forEach(e => { if (e.type === "checkbox") q[e.dataset.k] = e.checked; else q[e.dataset.k] = e.value; });
  return q;
}
const hit = (val, q, exact) => { const a = String(val).split("|")[0]; return exact ? a === q : (a.toLowerCase().includes(q.toLowerCase()) || t(a).toLowerCase().includes(q.toLowerCase())); };
function dateOk(val, q) { if (q.ignore || !val || !/^\d{4}-\d\d-\d\d/.test(val)) return true; const x = val.slice(0, 10); return (!q.from || x >= q.from) && (!q.to || x <= q.to); }
function runSearch(key, custom) {
  if (custom) { SEARCH[custom] = readSearch(key, custom); RENDER[custom](); return toast(t("조회했습니다.")); }
  const q = readSearch(key), G = GRIDS[key];
  const di = G.cols.findIndex(c => colType(c) === "date");
  VS[key].filter = (v, cols) => q.terms.every(x => x.ci >= 0 ? hit(v[x.ci], x.v, x.exact) : v.some(y => hit(y, x.v, x.exact))) && (di < 0 || dateOk(v[di], q));
  VS[key].page = 0; rerender(key); toast(t("조회했습니다. {n}건", { n: viewRows(key).length }));
}
function resetSearch(key, custom) {
  const f = document.getElementById("sf_" + gid(key || custom)); f.reset();
  f.querySelectorAll("[data-k=from]").forEach(e => e.value = d(90)); f.querySelectorAll("[data-k=to]").forEach(e => e.value = d(0));
  if (custom) { SEARCH[custom] = null; RENDER[custom](); } else { VS[key].filter = null; rerender(key); }
  toast(t("조회 조건을 초기화했습니다."));
}
const SEARCH = {}, RENDER = {}, SELOPTS = {};

/* ================= 메뉴·화면 전환 ================= */
const LOGBOOKS = SPEC.filter(s => s.kind === "logbook").map(s => s.id);
const MENU = () => [
  { sec: "Work", items: [["HOME", "홈", "오늘 확인할 일", "home"], ["C202070", "MBR Creation", "Master 제조지시서 작성·승인", "fileText"], ["C203000", "EBR 관리", "배치 기록 발행·불출·반납", "layers", DB.ebr.filter(e => ["대기", "생산 종료", "작업중단"].includes(e.st)).length], ["POP", "공정 POP", "현장 Step 진행·기록", "play"], ["LOGBOOK", "개별 작업 기록", "Logbook " + LOGBOOKS.length + "종", "clipboard"], ["C208000", "Remarks 관리", "Step 특이사항 이력", "message"], ["C807000", "결재 관리", "결재·반려·기안회수", "check", DB.appr.filter(a => a.st === "결재대기").length]] },
  { sec: "Master data", items: [["C803000", "공통 코드 관리", "코드 그룹·상세 코드", "database"], ["C809100", "General Inst 기본값 관리", "BR 일반 지시 기본 문구", "sliders"], ["C809300", "제조 지시 알람", "지시 알림 대상·조건", "bell"], ["C609010", "보호구관리", "EHS · 보호구 기준", "shield"], ["C609020", "CRA REPORT", "EHS · 화학물질 위험성 평가", "alert"]] },
  { sec: "System", items: [["C801000", "사용자 관리", "계정·소속·전자서명", "users"], ["C804000", "시스템 설정 관리", "운영 파라미터", "settings"], ["C810000", "Sitemap", "전체 메뉴 한눈에", "map"]] }
];
function title(id) {
  for (const g of MENU()) for (const x of g.items) if (x[0] === id) return [g.sec, t(x[1])];
  if (LOGBOOKS.includes(id)) return ["Work", t("개별 작업 기록") + " · " + t(S[id].name)];
  if (id === "MBR-EDIT") return ["Work", "MBR Creation · " + t("편집")];
  return ["Work", t((S[id] || {}).name || id)];
}
function menuHTML() { return MENU().map(g => `<nav class="nav"><div class="sec">${g.sec}</div>${g.items.map(([id, tl, sub, icn, badge]) => `<a data-id="${id}" onclick="openScreen('${id}')">${ic(icn)}<span class="nl"><span>${tt(tl)}</span><small>${tt(sub)}</small></span>${badge ? `<span class="badge-n">${badge}</span>` : ""}</a>`).join("")}</nav>`).join(""); }
let CUR = "HOME", EDIT_MBR = null;
const PAGES = {};
function openScreen(id, keep) {
  if (id === "POP") { openPop(); return; }
  CUR = id; if (!keep) ACTIVE = null;
  document.getElementById("menu").innerHTML = menuHTML();
  const navId = LOGBOOKS.includes(id) ? "LOGBOOK" : id === "MBR-EDIT" ? "C202070" : id;
  document.querySelectorAll(".nav a").forEach(e => e.classList.toggle("on", e.dataset.id === navId));
  const [sec, tl] = title(id);
  document.getElementById("crumb").innerHTML = `${esc(sec)} ${ic("chev")} <b>${esc(tl)}</b>`;
  const el = document.getElementById("content");
  el.innerHTML = PAGES[id] ? PAGES[id]() : (S[id] && S[id].kind === "logbook") ? pageLogbook(S[id]) : pageGeneric(S[id]);
  if (!keep) window.scrollTo(0, 0);
}
function refresh() { openScreen(CUR, true); }

/* ================= 공통 조각 ================= */
function head(s, acts = "") { return `<div class="page-head"><div><h1>${tt(s.name.replace(/^.* - /, ""))} <span class="pid">${s.id}</span></h1><p class="lede">${tt(s.purpose)}</p></div><div class="acts">${acts}<button class="btn" onclick="toggleDesc()">${ic("info")}${tt("사용 방법")}</button></div></div>${descHTML(s)}`; }
function toggleDesc() { const e = document.querySelector("#content .desc"); if (e) e.classList.toggle("hidden"); }
function descHTML(s) { return `<div class="desc hidden"><b>${tt("사용 방법")}</b>${s.steps && s.steps.length ? `<ol>${s.steps.map(x => `<li>${tt(x)}</li>`).join("")}</ol>` : ""}${(s.notes || []).map(n => `<div class="nt">※ ${tt(n)}</div>`).join("")}</div>`; }
const TB_SKIP = /^(조회|초기화|이전|다음|Logout|닫기|정렬 초기화|엑셀 저장)$/;
const GRID_BTNS = ["보기", "상세보기", "설정", "발행", "제조 지시", "POP", "Paper", "Executed BR", "서명", "기록", "선택", "파일"];
function toolbar(btns, key) { return (btns || []).filter(b => !TB_SKIP.test(b) && !GRID_BTNS.includes(b)).map(b => { const a = actFor(b); return `<button class="btn sm ${a === "add" || a === "save" || a === "sign" ? "pri" : a === "delete" ? "danger" : ""}" onclick="act('${esc(b)}'${key ? `,'${key}'` : ""})">${a === "add" ? ic("plus") : a === "delete" ? ic("trash") : a === "edit" ? ic("pen") : ""}${tt(b)}</button>`; }).join(""); }
function kcard(l, v, u, dd, icn, c, go) { return `<div class="kcard ${go ? "go" : ""}" style="--kc:${c}" ${go ? `onclick="${go}"` : ""}><span class="ki">${ic(icn)}</span><span class="kl">${tt(l)}</span><span class="kv">${v}<small>${tt(u)}</small></span><span class="kd">${tt(dd)}</span></div>`; }
function subTab(uid, i, key) { document.querySelectorAll("#" + uid + ">div").forEach((e, j) => e.classList.toggle("on", i === j)); document.querySelectorAll("." + uid).forEach((e, j) => e.classList.toggle("hidden", i !== j)); if (key) ACTIVE = key; }

/* ================= 일반 화면 ================= */
function treeHTML() {
  let h = `<div class="th">${tt("공정 트리")}</div><div class="tn l1">${ic("folder")} MBR-26-0101 · Ver 1.0</div>`;
  STEPS.forEach((b, i) => { h += `<div class="tn l2 ${i == 1 ? "on" : ""}" onclick="treeSel(this)">${(i + 1) * 10}. ${tt(b)}</div>`; for (let j = 1; j <= 2; j++) h += `<div class="tn l3" onclick="treeSel(this)">└ Step ${(i + 1) * 10 + j} · ${tt(b)} ${j}</div>`; });
  return `<div class="tree">${h}</div>`;
}
function treeSel(el) { el.closest(".tree").querySelectorAll(".tn").forEach(x => x.classList.remove("on")); el.classList.add("on"); toast(t("{s} 선택", { s: el.textContent.trim() })); }
function formBody(key) {
  DB.forms = DB.forms || {};
  const f = ["문서번호", "문서명", "제품명", "제품 ID", "공정 유형", "작성자", "작성일", "시행일", "비고"];
  const vals = DB.forms[key] || (DB.forms[key] = f.map(x => { const [ty, v] = gen(x, 1); return ty === "sign" ? v.split("|")[0] : v; }));
  return `<div class="card"><div class="card-h">${tt("기본 정보")}<div class="tools"><button class="btn sm pri" onclick="saveForm('${key}')">${tt("저장")}</button></div></div><div class="card-b"><div class="form-grid" id="fm_${gid(key)}">${f.map((x, i) => `<div class="fld"><label>${tt(x)}</label><input type="text" value="${esc(t(vals[i]))}"></div>`).join("")}</div></div></div>`;
}
function saveForm(key) { DB.forms[key] = [...document.querySelectorAll("#fm_" + gid(key) + " input")].map(e => e.value); save(); toast(t("저장했습니다.")); }
function tabsCard(s, base) {
  const grids = s.grids || [];
  if (!s.tabs || !s.tabs.length) {
    if (!grids.length) return formBody(base);
    if (!ACTIVE) ACTIVE = base + ":0";
    return grids.map((g, i) => gridCard(base + ":" + i, g, grids.length === 1 ? 12 : 6)).join("");
  }
  const u = "u" + gid(base);
  if (!ACTIVE) ACTIVE = base + ":t0";
  return `<div class="card"><div class="subtabs" id="${u}">${s.tabs.map((tb, i) => `<div class="${i ? "" : "on"}" onclick="subTab('${u}',${i},'${base}:t${i}')">${tt(tb)}</div>`).join("")}</div>${s.tabs.map((tb, i) => { const g = grids[i] ? grids[i] : grids.length ? { title: tb, cols: grids[i % grids.length].cols } : null; return `<div class="${u} ${i ? "hidden" : ""}">${g ? gridBox(base + ":t" + i, g, 5) : formBody(base + ":t" + i)}</div>`; }).join("")}</div>`;
}
function pageGeneric(s) {
  if (!s) return `<div class="card card-b">${tt("화면이 없습니다.")}</div>`;
  const base = s.id;
  const body = s.kind === "tree" ? `<div class="split">${treeHTML()}<div>${tabsCard(s, base)}</div></div>` : tabsCard(s, base);
  const main = (s.tabs && s.tabs.length) ? base + ":t0" : base + ":0";
  const extra = s.id === "C804000" ? `<button class="btn danger" onclick="resetData()">${ic("refresh")}${tt("예시 데이터 초기화")}</button>` : "";
  return head(s, extra + toolbar(s.buttons)) + (GRIDS[main] || (s.grids || []).length ? searchHTML(s.search, GRIDS[main] ? main : null) : "") + body;
}
function resetData() { confirmBox(t("모든 예시 데이터를 처음 상태로 되돌릴까요?"), () => { try { localStorage.removeItem(DBKEY); } catch (e) {} DB = {}; seed(); for (const k in VS) delete VS[k]; VS.mbr = { sel: new Set() }; VS.ebr = { sel: new Set() }; for (const k in SEARCH) SEARCH[k] = null; openScreen("HOME"); toast(t("예시 데이터를 초기화했습니다.")); }); }

/* ================= 홈 ================= */
PAGES.HOME = () => {
  const E = DB.ebr, hold = E.filter(e => e.st === "작업중단"), rev = E.filter(e => e.st === "생산 종료"), wait = DB.appr.filter(a => a.st === "결재대기"), prod = E.filter(e => e.st === "생산중");
  const unsigned = LOGBOOKS.filter(id => !(DB.logs[id] && DB.logs[id].done)).length;
  const alerts = [
    ...hold.map(e => `<div class="alert" style="--sc:var(--crit)"><span class="sev"></span><div><b>${tt("{b} 배치가 작업중단(Hold) 상태입니다", { b: e.batch })}</b><p>${tt(e.prod)} · ${tt(e.hold || "-")}. ${tt("Drop 또는 Holding 해제를 결정해 주세요.")}</p></div><div class="acts"><button class="btn pri" onclick="ebrHold('${e.id}')">Holding Config</button><button class="btn" onclick="openScreen('C203000')">${tt("EBR 관리 열기")}</button></div></div>`),
    rev.length ? `<div class="alert" style="--sc:var(--warn)"><span class="sev"></span><div><b>${tt("반납 검토 대기 {n}건", { n: rev.length })}</b><p>${tt("생산이 끝난 배치의 Executed BR 검토와 결재 요청이 남아 있습니다.")} (${rev.map(e => e.batch).join(", ")})</p></div><div class="acts"><button class="btn" onclick="ebrReview('${rev[0].id}')">${tt("반납 검토")}</button></div></div>` : "",
    wait.length ? `<div class="alert" style="--sc:var(--accent)"><span class="sev"></span><div><b>${tt("결재 대기 문서 {n}건", { n: wait.length })}</b><p>${tt("내 결재 차례인 문서입니다.")} ${wait.slice(0, 3).map(a => esc(t(a.title.split(" · ")[0]))).join(", ")}</p></div><div class="acts"><button class="btn" onclick="openScreen('C807000')">${tt("결재 관리 열기")}</button></div></div>` : ""
  ].join("");
  const hist = (DB.hist || []).slice(-6).reverse();
  return `<div class="hero"><span class="eyebrow">${ic("sparkle")} ${tt("Plant 1 · 원료의약품 제조동")}</span><h1>${tt("{n}님, 오늘 확인할 일 ({c})", { n: t(ME), c: hold.length + (rev.length ? 1 : 0) + (wait.length ? 1 : 0) })}</h1><p>${tt("작업중단 배치, 반납 검토가 필요한 배치, 결재 대기 문서를 한 곳에 모았습니다. 항목을 누르면 해당 화면으로 이동합니다.")}</p>
  <div class="hstats"><div class="hstat" style="--c:#FB7185"><i></i>${tt("작업중단")} <b>${hold.length}</b></div><div class="hstat" style="--c:#FBBF24"><i></i>${tt("결재 대기")} <b>${wait.length}</b></div><div class="hstat" style="--c:#34D399"><i></i>${tt("생산중 배치")} <b>${prod.length}</b></div><div class="hstat" style="--c:#38BDF8"><i></i>${tt("시행중 MBR")} <b>${DB.mbr.filter(m => m.st === "시행").length}</b></div></div></div>
  <div class="alerts">${alerts || `<div class="card card-b muted">${tt("지금 처리할 일이 없습니다.")}</div>`}</div>
  <div class="g4">${kcard("발행 대기 EBR", E.filter(e => e.st === "대기").length, "건", "MBR 시행 기준 생성", "fileText", "var(--accent)", "openScreen('C203000')")}${kcard("생산중 배치", prod.length, "배치", "공정 POP 기록 진행", "activity", "var(--ok)", "openPop()")}${kcard("반납 검토 대기", rev.length, "건", "생산 종료 후 검토", "clock", "var(--warn)", "openScreen('C203000')")}${kcard("미완료 작업 기록", unsigned, "건", "Logbook 오늘 기준", "pen", "var(--crit)", "openScreen('LOGBOOK')")}</div>
  <div class="g2"><div class="card"><div class="card-h">${tt("진행중 배치")}<div class="tools"><button class="btn sm" onclick="openPop()">${tt("공정 POP 열기")}</button></div></div><div class="card-b" style="display:grid;gap:18px">${prod.length ? prod.slice(0, 4).map(e => { const c = (DB.pop[e.batch] || { cur: 0 }).cur; return `<div class="click" onclick="openPop('${e.batch}')"><div style="display:flex;justify-content:space-between;align-items:center"><div><b class="mono">${e.batch}</b> <span class="muted">· ${tt(e.prod)}</span></div>${pill("생산중")}</div><ol class="stepper">${STEPS.map((s, i) => `<li class="st ${i < c ? "done" : i == c ? "cur" : ""}"><i></i>${tt(s)}</li>`).join("")}</ol></div>`; }).join("") : `<span class="muted">${tt("생산중인 배치가 없습니다.")}</span>`}</div></div>
  <div class="card"><div class="card-h">${tt("최근 전자서명 이력")}<span class="cnt">Audit trail</span></div><div class="grid-wrap"><table class="grid"><thead><tr><th>${tt("시각")}</th><th>${tt("작업")}</th><th>${tt("서명자")}</th></tr></thead><tbody>${hist.length ? hist.map(h => `<tr><td class="mono">${h.at.slice(5)}</td><td>${esc(h.what)}</td><td>${tt(h.who)}</td></tr>`).join("") : [["MBR-26-0104 · 승인", 9], ["B26-1016 · BR 불출", 8], ["B26-1014 · 제조 지시", 7], ["작업소 온/습도 점검 · 서명", 6]].map(([a, i]) => `<tr><td class="mono">${dt(0, i).slice(5)}</td><td>${tt(a.split(" · ")[0])} · ${tt(a.split(" · ")[1])}</td><td>${tt(rnd(i, PEOPLE))}</td></tr>`).join("")}</tbody></table></div></div></div>`;
};

/* ================= Sitemap · Logbook 목록 ================= */
PAGES.C810000 = () => head(S.C810000) + MENU().map(g => `<div class="sec-t">${g.sec}</div><div class="tiles">${g.items.filter(x => x[0] !== "C810000").map(([id, tl, sub, icn]) => `<button class="tile" onclick="openScreen('${id}')"><span class="ti">${ic(icn)}</span><span><b>${tt(tl)}</b><span class="muted small">${tt(sub)}</span></span></button>`).join("")}</div>`).join("") +
  `<div class="sec-t">${tt("개별 작업 기록")}</div><div class="tiles">${LOGBOOKS.map(id => `<button class="tile" onclick="openScreen('${id}')"><span class="ti">${ic("clipboard")}</span><span><b>${tt(S[id].name)}</b><small>${id.replace("POP_", "")}</small></span></button>`).join("")}</div>`;
const LOGGROUPS = [["작업소 환경", ["POP_C203001", "POP_C203002"]], ["저울 · 계량", ["POP_C203012", "POP_C203013", "POP_C203014", "POP_C203015", "POP_C203016", "POP_C203009"]], ["설비 · 장비 사용", ["POP_C203006", "POP_C203010", "POP_C203011", "POP_C203017", "POP_C203018", "POP_C203019", "POP_C203020", "POP_C203034", "POP_C203007", "POP_C203008", "POP_C203024"]], ["운전 · 공정 점검", ["POP_C203028", "POP_C203029", "POP_C203030", "POP_C203031", "POP_C203032", "POP_C203033", "POP_C203025"]], ["기록 검토 · 기타", ["POP_C203005", "POP_C203022", "POP_C203023"]]];
function logState(id) { const L = DB.logs[id]; return !L ? "미작성" : L.done ? "완료" : L.saved ? "서명 대기" : "작성중"; }
PAGES.LOGBOOK = () => {
  const used = new Set(LOGGROUPS.flatMap(g => g[1])); const groups = LOGGROUPS.concat(LOGBOOKS.filter(x => !used.has(x)).length ? [["기타", LOGBOOKS.filter(x => !used.has(x))]] : []);
  const st = LOGBOOKS.map(logState);
  return `<div class="page-head"><div><h1>${tt("개별 작업 기록")}</h1><p class="lede">${tt("작업소 환경 점검, 저울 성능검사, 설비 사용 Logbook 등 배치와 별도로 남기는 작업 기록입니다. 양식을 열어 당일 기록을 입력하고 점검자·확인자가 전자서명합니다.")}</p></div></div>
  <div class="g4">${kcard("전체 양식", LOGBOOKS.length, "종", "오늘 기준", "clipboard", "var(--accent)")}${kcard("서명 대기", st.filter(x => x === "서명 대기").length, "건", "저장 후 서명 누락", "pen", "var(--warn)")}${kcard("미작성", st.filter(x => x === "미작성").length, "건", "오늘 아직 기록 없음", "alert", "var(--crit)")}${kcard("완료", st.filter(x => x === "완료").length, "건", "작성·서명 완료", "check", "var(--ok)")}</div>` +
    groups.map(([g, ids]) => `<div class="sec-t">${tt(g)}</div><div class="tiles">${ids.filter(id => S[id]).map(id => { const s = logState(id); return `<button class="tile" onclick="openScreen('${id}')"><span class="ti">${ic("clipboard")}</span><span style="flex:1"><b>${tt(S[id].name)}</b><small>${id.replace("POP_", "")}</small></span>${pill(s, { "미작성": "", "작성중": "info", "서명 대기": "warn", "완료": "ok" }[s])}</button>`; }).join("")}</div>`).join("");
};

/* ================= MBR ================= */
SELOPTS.mbr = { "Plant": ["Plant 1", "Plant 2"], "Process type": ["Chemical", "Bio", "Packaging"], "진행현황": ["임시저장", "검토중", "승인완료", "시행", "폐기"] };
const MCLS = { "임시저장": "", "검토중": "info", "승인완료": "ok", "시행": "teal", "폐기": "err", "반려": "err" };
VS.mbr = { sel: new Set() };
function mbrRows() {
  const q = SEARCH.mbr; let r = DB.mbr.slice();
  if (q) {
    const F = { "Product Name": "prod", "Product Code": "code", "Plant": "plant", "Process type": "ptype", "진행현황": "st", "BR No.": "no", "Ver.": "ver", "Created No.": "created", "최종 작성자": "writer" };
    r = r.filter(m => q.terms.every(x => hit(m[F[x.f]] ?? "", x.v, x.exact)) && dateOk(m.upd, q) && (q.excl ? m.st !== "폐기" : true) && (q.incl ? true : m.cls !== "Child"));
  } else r = r.filter(m => m.st !== "폐기");
  return r;
}
RENDER.mbr = () => { const e = document.getElementById("mbrTbl"); if (e) e.innerHTML = mbrTable(); };
function mbrTable() {
  const g = S.C202070.grids[0], rows = mbrRows();
  return `<div class="grid-wrap"><table class="grid"><thead><tr><th class="ck"></th>${g.cols.map(c => `<th>${tt(c)}</th>`).join("")}<th>Configuration</th><th>BR</th></tr></thead><tbody>${rows.length ? rows.map(m => `<tr class="${VS.mbr.sel.has(m.id) ? "sel" : ""} ${m.st === "폐기" ? "dim" : ""}" onclick="mbrSel('${m.id}')"><td class="ck"><input type="checkbox" ${VS.mbr.sel.has(m.id) ? "checked" : ""}></td><td>${tt(m.prod)}</td><td class="mono">${m.code}</td><td>${m.plant}</td><td>${m.ptype}</td><td class="mono">${m.no}</td><td>${m.ver}</td><td class="mono">${m.created}</td><td>${tt(m.prod)} ${tt(m.title)}</td><td>${m.cls}</td><td>${pill(m.st, MCLS[m.st])}</td><td>${tt(m.writer)}</td><td>${m.upd}</td>
  <td>${m.eff ? m.eff : m.st === "승인완료" ? `<button class="btn sm acc" onclick="event.stopPropagation();mbrDate('${m.id}','eff')">${tt("지정")}</button>` : "-"}</td><td>${m.obs ? m.obs : m.st === "시행" ? `<button class="btn sm" onclick="event.stopPropagation();mbrDate('${m.id}','obs')">${tt("지정")}</button>` : "-"}</td>
  <td><button class="btn sm acc" onclick="event.stopPropagation();mbrEdit('${m.id}')">${tt(m.st === "임시저장" || m.st === "반려" ? "편집" : "보기")}</button></td><td><button class="btn sm" onclick="event.stopPropagation();mbrPaper('${m.id}')">${tt("상세보기")}</button></td></tr>`).join("") : `<tr><td colspan="17" class="empty">${tt("조회된 데이터가 없습니다.")}</td></tr>`}</tbody></table></div><div class="pager"><span>${tt("총 {n}건", { n: rows.length })}</span><span></span></div>`;
}
function mbrSel(id) { const v = VS.mbr.sel; if (v.has(id)) v.delete(id); else { v.clear(); v.add(id); } RENDER.mbr(); }
const mbrPick = () => { const m = DB.mbr.find(x => VS.mbr.sel.has(x.id)); if (!m) toast(t("먼저 목록에서 MBR을 선택하세요.")); return m; };
PAGES.C202070 = () => { const s = S.C202070, M = DB.mbr;
  return head(s, `<button class="btn" onclick="mbrManager()">${ic("users")}${tt("관리자 설정")}</button><button class="btn pri" onclick="mbrRegister()">${ic("plus")}${tt("MBR 등록")}</button>`) +
    `<div class="g4">${kcard("시행중 MBR", M.filter(m => m.st === "시행").length, "건", "Effective date 도래", "check", "var(--ok)")}${kcard("검토 · 승인 대기", M.filter(m => m.st === "검토중").length, "건", "결재 진행중", "clock", "var(--warn)", "openScreen('C807000')")}${kcard("임시저장", M.filter(m => m.st === "임시저장").length, "건", "작성중인 MBR", "pen", "var(--accent)")}${kcard("폐기", M.filter(m => m.st === "폐기").length, "건", "Obsolete date 기준", "archive", "var(--crit)")}</div>` +
    searchHTML(s.search, null, "mbr") + `<div class="card"><div class="card-h">${tt(s.grids[0].title)}<div class="tools"><button class="btn sm" onclick="exportCSV('MBR',mbrRows().map(m=>[m.prod,m.code,m.plant,m.ptype,m.no,m.ver,m.created,m.title,m.cls,m.st,m.writer,m.upd,m.eff,m.obs]),S.C202070.grids[0].cols)">${ic("download")}${tt("엑셀 저장")}</button><button class="btn sm" onclick="mbrClass()">${tt("Class 설정")}</button><button class="btn sm" onclick="mbrCopy()">COPY</button><button class="btn sm" onclick="mbrValid()">Validation</button><button class="btn sm acc" onclick="mbrTransfer()">EBR TRANSFER</button><button class="btn sm danger" onclick="mbrDelete()">${ic("trash")}${tt("삭제")}</button></div></div><div id="mbrTbl">${mbrTable()}</div></div>`; };
function nextMbrNo() { return "MBR-26-" + String(101 + DB.mbr.length + Math.floor(Math.random() * 50) + 20).padStart(4, "0"); }
function mbrRegister(base) {
  const id = modal(t("MBR 기본 등록정보 및 Class 설정"), `<div class="form-grid">
  <div class="fld"><label>${tt("Product Name")}</label><select id="mr_p">${PRODUCTS.map((p, i) => `<option value="${i}">${tt(p[0])} (${p[1]})</option>`).join("")}</select></div>
  <div class="fld"><label>Plant</label><select id="mr_pl"><option>Plant 1</option><option>Plant 2</option></select></div>
  <div class="fld"><label>Process type</label><select id="mr_pt"><option>Chemical</option><option>Bio</option><option>Packaging</option></select></div>
  <div class="fld"><label>Ver.</label><input id="mr_v" type="text" value="1.0"></div>
  <div class="fld span2"><label>BR Title</label><input id="mr_t" type="text" value="${tt("Master 제조지시서")}"></div>
  <div class="fld"><label>Class</label><select id="mr_c"><option>Parent</option><option>Child</option></select></div></div>`, "md", [[t("취소")], [t("저장"), "pri", () => {
    const p = PRODUCTS[+document.getElementById("mr_p").value];
    const m = { id: uid(), no: nextMbrNo(), ver: document.getElementById("mr_v").value || "1.0", prod: p[0], code: p[1], plant: document.getElementById("mr_pl").value, ptype: document.getElementById("mr_pt").value, created: "C-" + (400 + DB.mbr.length), title: "Master 제조지시서", cls: document.getElementById("mr_c").value, st: "임시저장", writer: ME, upd: d(0), eff: "", obs: "", mgr: [ME] };
    DB.mbr.unshift(m); save(); closeModal(id); VS.mbr.sel = new Set([m.id]); RENDER.mbr(); toast(t("{no} MBR을 임시저장 상태로 등록했습니다.", { no: m.no }));
  }]]);
}
function mbrClass() { const m = mbrPick(); if (!m) return; const id = modal(t("Class 설정") + " · " + m.no, `<div class="form-grid"><div class="fld"><label>Class</label><select id="mc_c"><option ${m.cls === "Parent" ? "selected" : ""}>Parent</option><option ${m.cls === "Child" ? "selected" : ""}>Child</option></select></div><div class="fld"><label>Parent MBR</label><select id="mc_p"><option value="">-</option>${DB.mbr.filter(x => x.cls === "Parent" && x.id !== m.id).map(x => `<option>${x.no}</option>`).join("")}</select></div></div>`, "", [[t("취소")], [t("저장"), "pri", () => { m.cls = document.getElementById("mc_c").value; m.parent = document.getElementById("mc_p").value; save(); closeModal(id); RENDER.mbr(); toast(t("Class를 저장했습니다.")); }]]); }
function mbrCopy() { const m = mbrPick(); if (!m) return; esign("COPY", () => { const c = { ...m, id: uid(), no: nextMbrNo(), st: "임시저장", writer: ME, upd: d(0), eff: "", obs: "", ver: "1.0" }; DB.mbr.unshift(c); save(); VS.mbr.sel = new Set([c.id]); RENDER.mbr(); toast(t("{a}을 복사해 {b}를 만들었습니다.", { a: m.no, b: c.no })); }); }
function mbrValid() { const m = mbrPick(); if (!m) return; modal("Validation · " + m.no, `<div class="vlist">${["Cover 문서정보 입력", "투입 원료 Material Balance 합계", "단위공정 Step 순서", "공정 허용범위 Min ≤ Max", "전자서명 구획 지정"].map(x => `<div>${pill("적합")} ${tt(x)}</div>`).join("")}</div><p class="note">${tt("오류 0건 · 경고 0건")}</p>`); }
function mbrTransfer() { const m = mbrPick(); if (!m) return; if (m.st !== "시행") return toast(t("시행 상태인 MBR만 EBR로 전송할 수 있습니다."));
  esign("EBR TRANSFER", () => { const n = Math.max(...DB.ebr.map(e => +e.batch.slice(4))) + 1; const e = { id: uid(), prod: m.prod, code: m.code, mbr: m.no, ver: m.ver, cp: "CP-2614", batch: "B26-" + n, st: "대기", iss: "", ord: "", plan: "", start: "", end: "", hold: "", prev: "" }; DB.ebr.unshift(e); save(); toast(t("{b} 배치 EBR을 생성했습니다. EBR 관리에서 발행하세요.", { b: e.batch })); RENDER.mbr(); }); }
function mbrDelete() { const m = mbrPick(); if (!m) return; if (m.st !== "임시저장") return toast(t("임시저장 상태인 MBR만 삭제할 수 있습니다.")); esign(t("삭제"), () => { DB.mbr = DB.mbr.filter(x => x !== m); VS.mbr.sel.clear(); save(); RENDER.mbr(); toast(t("{no}를 삭제했습니다.", { no: m.no })); }); }
function mbrDate(id, k) { const m = DB.mbr.find(x => x.id === id); const md = modal(k === "eff" ? "Effective date" : "Obsolete date", `<div class="fld"><label>${tt(k === "eff" ? "시행일" : "폐기일")}</label><input type="date" id="md_d" min="${d(0)}" value="${d(-7)}"></div><p class="note">${tt("오늘 이전 날짜는 선택할 수 없습니다.")}</p>`, "", [[t("취소")], [t("저장"), "pri", () => { const v = document.getElementById("md_d").value; if (!v || v < d(0)) return toast(t("오늘 이후 날짜를 선택하세요.")); m[k] = v; if (k === "eff") m.st = "시행"; else m.st = "폐기"; save(); closeModal(md); RENDER.mbr(); toast(t("저장했습니다.")); }]]); }
function mbrManager() { const m = mbrPick(); if (!m) return; m.mgr = m.mgr || [ME]; const id = modal(t("관리자 설정 (최대 5명)") + " · " + m.no, `<div class="vlist">${PEOPLE.map(p => `<label class="chkrow"><input type="checkbox" value="${p}" ${m.mgr.includes(p) ? "checked" : ""}> ${tt(p)}</label>`).join("")}</div><p class="note">${tt("MBR을 편집할 수 있는 관리자를 지정합니다.")}</p>`, "", [[t("취소")], [t("저장"), "pri", () => { const v = [...document.querySelectorAll("#" + id + " input:checked")].map(e => e.value); if (v.length > 5) return toast(t("관리자는 최대 5명까지 지정할 수 있습니다.")); m.mgr = v; save(); closeModal(id); toast(t("관리자 {n}명을 지정했습니다.", { n: v.length })); }]]); }
function mbrEdit(id) { EDIT_MBR = id; openScreen("MBR-EDIT"); }
function mbrPaper(id) { const m = DB.mbr.find(x => x.id === id); modal("Paper BR · " + m.no, `<div class="br-doc"><h3>Master Batch Record</h3><div class="sub">${tt(m.prod)} · ${m.no} Ver ${m.ver}</div><table><tr><th>${tt("제품명")}</th><td>${tt(m.prod)}</td><th>${tt("제품 ID")}</th><td>${m.code}</td></tr><tr><th>Plant</th><td>${m.plant}</td><th>Process type</th><td>${m.ptype}</td></tr><tr><th>${tt("상태")}</th><td>${pill(m.st, MCLS[m.st])}</td><th>${tt("작성자")}</th><td>${tt(m.writer)}</td></tr><tr><th>Effective date</th><td>${m.eff || "-"}</td><th>Obsolete date</th><td>${m.obs || "-"}</td></tr></table><table><tr><th style="width:auto">Step</th><th style="width:auto">${tt("공정")}</th><th style="width:auto">${tt("주요 지시")}</th></tr>${STEPS.map((x, i) => `<tr><td>${(i + 1) * 10}</td><td>${tt(x)}</td><td>${tt(["원료 칭량 후 반응기에 투입", "60~65 ℃ 유지, 4시간 반응", "2시간 숙성 후 IPC 확인", "여과 및 세척 2회", "감압 농축", "LOD 0.5 % 이하까지 건조", "Drum 포장 후 라벨 부착"][i])}</td></tr>`).join("")}</table></div>`, "md", [[t("인쇄"), "", () => printDoc("Paper BR")], [t("닫기"), "pri"]]); }
PAGES["MBR-EDIT"] = () => {
  const m = DB.mbr.find(x => x.id === EDIT_MBR) || DB.mbr[0]; EDIT_MBR = m.id;
  const ro = !(m.st === "임시저장" || m.st === "반려");
  const tabs = [["C202070-T1", "Cover"], ["C202070-T2", "MSDS / PPE Summary"], ["C202070-T3", "Input material Summary"], ["C202070-T5", "단위공정 세부 설정"], ["C202070-T6", "BR 본문 작성"], ["C202070-T7", "정형화 테이블 설정"]];
  if (!ACTIVE) ACTIVE = "MBR:" + m.no + ":C202070-T1:0";
  return `<div class="page-head"><div><h1>${tt("Master 제조지시서 편집")} <span class="pid">${m.no}</span> ${pill(m.st, MCLS[m.st])}</h1><p class="lede">${tt("문서 정보부터 원료·안전 요약, 단위공정과 BR 본문까지 탭을 따라 작성한 뒤 검토·상신합니다.")}${ro ? " " + tt("(임시저장 상태가 아니어서 읽기 전용입니다)") : ""}</p></div><div class="acts"><button class="btn" onclick="openScreen('C202070')">${ic("back")}${tt("목록")}</button>${ro ? "" : `<button class="btn" onclick="save();m_touch();toast(t('임시저장했습니다.'))">${tt("임시저장")}</button><button class="btn pri" onclick="mbrSubmit('${m.id}')">${tt("검토 · 상신")}</button>`}</div></div>
  <div class="g4">${[["제품", t(m.prod), m.code], ["BR No. / Ver.", m.no, "Ver " + m.ver + " · " + m.ptype], ["작성자", t(m.writer), t("관리자") + " " + (m.mgr || []).length + t("명")], ["최종 수정", m.upd, t(m.st)]].map(([a, b, c]) => `<div class="kcard" style="--kc:var(--accent)"><span class="kl">${tt(a)}</span><span class="kv" style="font-size:19px">${esc(b)}</span><span class="kd">${esc(c)}</span></div>`).join("")}</div>
  <div class="card"><div class="subtabs" id="mbrT">${tabs.map((x, i) => `<div class="${i ? "" : "on"}" onclick="subTab('mbrT',${i},'MBR:${m.no}:${x[0]}:0')">${tt(x[1])}</div>`).join("")}</div>
  ${tabs.map(([sid], i) => { const s = S[sid], base = "MBR:" + m.no + ":" + sid; const tb = ro ? "" : toolbar(s.buttons); const inner = s.kind === "tree" ? `<div class="split">${treeHTML()}<div>${mbrInner(s, base)}</div></div>` : (sid === "C202070-T1" ? coverForm(m, ro) : "") + mbrInner(s, base); return `<div class="card-b mbrT ${i ? "hidden" : ""}"><p class="muted small" style="margin:0 0 12px">${tt(s.purpose)}</p>${tb ? `<div class="tbar">${tb}</div>` : ""}${inner}</div>`; }).join("")}</div>`;
};
function m_touch() { const m = DB.mbr.find(x => x.id === EDIT_MBR); if (m) { m.upd = d(0); save(); } }
function mbrInner(s, base) {
  const grids = s.grids || [];
  if (!s.tabs || !s.tabs.length) return grids.map((g, i) => `<div class="card"><div class="card-h">${tt(g.title)}<span class="cnt" id="${gid(base + ":" + i)}_cnt"></span></div>${gridBox(base + ":" + i, g, 5)}</div>`).join("");
  const u = "u" + gid(base);
  return `<div class="card"><div class="subtabs" id="${u}">${s.tabs.map((tb, i) => `<div class="${i ? "" : "on"}" onclick="subTab('${u}',${i},'${base}:t${i}')">${tt(tb)}</div>`).join("")}</div>${s.tabs.map((tb, i) => { const g = grids[i] ? grids[i] : grids.length ? { title: tb, cols: grids[i % grids.length].cols } : { title: tb, cols: ["No", "항목", "기준값", "단위", "비고"] }; return `<div class="${u} ${i ? "hidden" : ""}">${gridBox(base + ":t" + i, g, 5)}</div>`; }).join("")}</div>`;
}
function coverForm(m, ro) {
  m.cover = m.cover || { "문서번호": m.no, "문서명": t(m.prod) + " " + t("Master 제조지시서"), "Batch size": "250 kg", "유효기간": "24개월", "작성 부서": "생산1팀", "보관 조건": "실온, 차광" };
  return `<div class="card"><div class="card-h">${tt("Cover · 문서 정보")}${ro ? "" : `<div class="tools"><button class="btn sm pri" onclick="coverSave('${m.id}')">${tt("저장")}</button></div>`}</div><div class="card-b"><div class="form-grid" id="cvF">${Object.entries(m.cover).map(([k, v]) => `<div class="fld"><label>${tt(k)}</label><input type="text" data-k="${esc(k)}" value="${esc(t(v))}" ${ro ? "readonly" : ""}></div>`).join("")}</div></div></div>`;
}
function coverSave(id) { const m = DB.mbr.find(x => x.id === id); document.querySelectorAll("#cvF input").forEach(e => m.cover[e.dataset.k] = e.value); m.upd = d(0); save(); toast(t("저장했습니다.")); }
function mbrSubmit(id) { const m = DB.mbr.find(x => x.id === id); esign(t("검토 · 상신"), () => { m.st = "검토중"; m.upd = d(0); DB.appr.unshift({ id: uid(), no: "AP-2610-" + String(60 + DB.appr.length).padStart(4, "0"), form: "MBR 승인", title: "Master 제조지시서 승인 · " + m.no, st: "결재대기", stage: "1 / 3", draft: d(0), done: "", dept: "생산1팀", drafter: ME, link: { t: "mbr", no: m.no }, comment: "" }); save(); refresh(); toast(t("결재를 상신했습니다. 결재 관리에서 진행 상황을 볼 수 있습니다.")); }); }

/* ================= EBR ================= */
SELOPTS.ebr = { "Process Type": ["Chemical", "Bio", "Packaging"], "진행현황": [...EORDER, "작업중단", "회수", "Drop"], "검색 기준": ["이슈발행일", "생산 시작일"] };
VS.ebr = { sel: new Set() };
function ebrRows() {
  const q = SEARCH.ebr; if (!q) return DB.ebr.filter(e => e.st !== "회수" && e.st !== "Drop");
  const F = { "Product Name": "prod", "Product Code": "code", "BR No.": "mbr", "Ver.": "ver", "Campaign No.": "cp", "Batch No.": "batch", "진행현황": "st" };
  return DB.ebr.filter(e => q.terms.every(x => !F[x.f] || hit(e[F[x.f]] ?? "", x.v, x.exact)) && (q.ignore || !e.iss || dateOk(e.iss, q)));
}
RENDER.ebr = () => { const e = document.getElementById("ebrTbl"); if (e) e.innerHTML = ebrTable(); };
function ebrTable() {
  const g = S.C203000.grids[0], rows = ebrRows();
  const ok = v => `<span class="okv">✓ ${v}</span>`;
  const b = (txt, fn, cls = "") => `<button class="btn sm ${cls}" onclick="event.stopPropagation();${fn}">${tt(txt)}</button>`;
  return `<div class="grid-wrap"><table class="grid"><thead><tr><th class="ck"></th>${g.cols.map(c => `<th>${tt(c)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map(e => { const k = EORDER.indexOf(e.st), kk = k < 0 ? 5 : k;
    return `<tr class="${VS.ebr.sel.has(e.id) ? "sel" : ""} ${e.st === "회수" || e.st === "Drop" ? "dim" : ""}" onclick="ebrSel('${e.id}')"><td class="ck"><input type="checkbox" ${VS.ebr.sel.has(e.id) ? "checked" : ""}></td><td>${tt(e.prod)}</td><td class="mono">${e.code}</td><td class="mono">${e.mbr}</td><td>${e.ver}</td><td class="mono">${e.cp}</td><td class="mono">${e.batch}</td>
    <td>${pill(e.st, ECLS[e.st])}${e.st === "생산 종료" ? " " + b("반납 검토", `ebrReview('${e.id}')`, "acc") : e.st === "작업중단" ? " " + b("Holding", `ebrHold('${e.id}')`, "danger") : e.st === "반납 검토" ? " " + b("결재 현황", `openScreen('C807000')`) : ""}</td>
    <td>${e.st === "대기" ? b("발행", `ebrIssue('${e.id}')`, "pri") : e.iss ? ok(e.iss) : "-"}</td>
    <td>${e.st === "발행 완료" ? b("제조 지시", `ebrOrder('${e.id}')`, "pri") : e.ord ? ok(e.ord) : "-"}</td>
    <td>${e.st === "제조지시 완료" ? b("설정", `ebrSetting('${e.id}')`, "acc") : kk >= 3 && e.ord ? b("보기", `ebrSetting('${e.id}')`) : "-"}</td>
    <td>${e.st === "설정 완료" ? b("BR 불출", `ebrRelease('${e.id}')`, "pri") : e.plan || "-"}</td>
    <td>${e.start || "-"}</td><td>${e.end || "-"}</td>
    <td>${e.start || e.st === "BR 불출" ? b("상세보기", `brReport('${e.id}')`) : "-"}${e.st === "BR 불출" || e.st === "생산중" ? " " + b("POP", `openPop('${e.batch}')`, "acc") : ""}</td></tr>`; }).join("") : `<tr><td colspan="15" class="empty">${tt("조회된 데이터가 없습니다.")}</td></tr>`}</tbody></table></div><div class="pager"><span>${tt("총 {n}건", { n: rows.length })}</span><span></span></div>`;
}
function ebrSel(id) { const v = VS.ebr.sel; if (v.has(id)) v.delete(id); else { v.clear(); v.add(id); } RENDER.ebr(); }
const ebrPick = () => { const e = DB.ebr.find(x => VS.ebr.sel.has(x.id)); if (!e) toast(t("먼저 목록에서 배치를 선택하세요.")); return e; };
const E = id => DB.ebr.find(x => x.id === id);
PAGES.C203000 = () => { const s = S.C203000, L = DB.ebr;
  return head(s, `<button class="btn" onclick="ebrDate()">${ic("calendar")}${tt("시작 예정일 수정")}</button>`) +
    `<div class="g4">${kcard("발행 대기", L.filter(e => e.st === "대기").length, "건", "MBR 시행 기준 생성", "fileText", "var(--accent)")}${kcard("생산중", L.filter(e => e.st === "생산중").length, "배치", "공정 POP 기록 진행", "activity", "var(--ok)", "openPop()")}${kcard("반납 검토 대기", L.filter(e => e.st === "생산 종료").length, "건", "생산 종료 후 검토", "clock", "var(--warn)")}${kcard("작업중단(Hold)", L.filter(e => e.st === "작업중단").length, "건", "Drop · 해제 결정 필요", "alert", "var(--crit)")}</div>` +
    `<div class="card"><div class="card-h">${tt("진행 흐름")}</div><div class="card-b"><ol class="stepper">${["대기", "발행", "제조 지시", "상세설정", "BR 불출", "생산(POP)", "반납 검토"].map((x, i) => `<li class="st done"><i></i>${tt(x)}</li>`).join("")}</ol></div></div>` +
    searchHTML(s.search, null, "ebr") + `<div class="card"><div class="card-h">${tt(s.grids[0].title)}<div class="tools"><button class="btn sm" onclick="exportCSV('EBR',ebrRows().map(e=>[e.prod,e.code,e.mbr,e.ver,e.cp,e.batch,e.st,e.iss,e.ord,'',e.plan,e.start,e.end,'']),S.C203000.grids[0].cols)">${ic("download")}${tt("엑셀 저장")}</button><button class="btn sm danger" onclick="ebrRecall()">${tt("회수")}</button><button class="btn sm danger" onclick="ebrStop()">${tt("작업중단")}</button></div></div><div id="ebrTbl">${ebrTable()}</div></div>`; };
function log(what) { (DB.hist = DB.hist || []).push({ at: now(), what, who: ME }); }
function ebrIssue(id) { const e = E(id); modal(t("Electronic BR 발행 확인") + " · " + e.batch, `<div class="br-doc"><h3>Electronic Batch Record</h3><div class="sub">${tt(e.prod)} · ${e.mbr} Ver ${e.ver}</div><table><tr><th>Batch No.</th><td>${e.batch}</td><th>Campaign No.</th><td>${e.cp}</td></tr><tr><th>${tt("제품 ID")}</th><td>${e.code}</td><th>${tt("발행일")}</th><td>${d(0)}</td></tr></table></div>`, "md", [[t("취소")], [t("발행"), "pri", () => esign(t("BR 발행"), () => { e.st = "발행 완료"; e.iss = d(0); log(e.batch + " · " + t("발행")); save(); closeAll(); refresh(); toast(t("{b} 발행을 완료했습니다.", { b: e.batch })); })]]); }
function ebrOrder(id) { const e = E(id); esign(t("제조 지시"), () => { e.st = "제조지시 완료"; e.ord = d(0); log(e.batch + " · " + t("제조 지시")); save(); refresh(); toast(t("{b} 제조 지시를 완료했습니다. 상세설정(설비)을 진행하세요.", { b: e.batch })); }); }
function ebrSetting(id) {
  const e = E(id), ro = e.st !== "제조지시 완료" && e.st !== "설정 완료";
  const tabs = [["C203000-S1", "Cover"], ["C203000-S2", "MSDS Summary"], ["C203000-S4", "Input material Summary"], ["C203000-S6", "단위공정 및 마감정보"], ["C203000-S7", "BR 본문"], ["C203000-S8", "Main Dashboard 설정"]];
  e.equip = e.equip || "R-1201 반응기";
  const btns = ro ? [[t("닫기"), "pri"]] : e.st === "설정 완료" ? [[t("설정 해제"), "danger", () => esign(t("설정 해제"), () => { e.st = "제조지시 완료"; save(); closeAll(); refresh(); toast(t("설정을 해제했습니다.")); })], [t("닫기")]] : [[t("닫기")], [t("설정 완료"), "pri", () => { e.equip = document.getElementById("eqSel").value; esign(t("설정 완료"), () => { e.st = "설정 완료"; log(e.batch + " · " + t("설정 완료")); save(); closeAll(); refresh(); toast(t("설정을 완료했습니다. BR 불출이 가능합니다.")); }); }]];
  modal(t("Electronic BR 설정") + " · " + e.batch, `<div class="mtop">${pill(e.st, ECLS[e.st])}<span class="muted">${tt(e.prod)} · ${e.mbr} Ver ${e.ver} · ${e.cp}</span><div class="fld" style="margin-left:auto;flex-direction:row;align-items:center;gap:8px"><label>${tt("사용 설비")}</label><select id="eqSel" ${ro || e.st === "설정 완료" ? "disabled" : ""}>${EQUIP.map(q => `<option ${q === e.equip ? "selected" : ""}>${tt(q)}</option>`).join("")}</select></div></div>
  <div class="card" style="margin:0"><div class="subtabs" id="ebsT">${tabs.map((x, i) => `<div class="${i ? "" : "on"}" onclick="subTab('ebsT',${i})">${tt(x[1])}</div>`).join("")}</div>${tabs.map(([sid], i) => `<div class="card-b ebsT ${i ? "hidden" : ""}">${mbrInner(S[sid], "EBR:" + e.batch + ":" + sid)}</div>`).join("")}</div>`, "lg", btns);
}
function ebrRelease(id) { const e = E(id); const m = modal(t("BR 불출") + " · " + e.batch, `<div class="form-grid"><div class="fld"><label>${tt("생산 시작 예정일")}</label><input type="date" id="rl_d" value="${e.plan || d(-1)}"></div><div class="fld"><label>${tt("불출 대상 작업장")}</label><select id="rl_w"><option>${tt("반응실 A")}</option><option>${tt("반응실 B")}</option></select></div></div>`, "", [[t("취소")], [t("BR 불출"), "pri", () => { const v = document.getElementById("rl_d").value; if (!v) return toast(t("생산 시작 예정일을 입력하세요.")); esign(t("BR 불출"), () => { e.plan = v; e.st = "BR 불출"; log(e.batch + " · " + t("BR 불출")); save(); closeAll(); refresh(); toast(t("{b} BR을 불출했습니다. 공정 POP에서 생산을 시작할 수 있습니다.", { b: e.batch })); }); }]]); }
function ebrDate() { const e = ebrPick(); if (!e) return; if (!["설정 완료", "BR 불출"].includes(e.st)) return toast(t("설정 완료 또는 BR 불출 상태에서만 수정할 수 있습니다.")); const m = modal(t("시작 예정일 수정") + " · " + e.batch, `<div class="fld"><label>${tt("생산 시작 예정일")}</label><input type="date" id="pd_d" value="${e.plan || d(0)}"></div>`, "", [[t("취소")], [t("저장"), "pri", () => { e.plan = document.getElementById("pd_d").value; save(); closeModal(m); refresh(); toast(t("저장했습니다.")); }]]); }
function ebrRecall() { const e = ebrPick(); if (!e) return; if (!["발행 완료", "제조지시 완료", "설정 완료", "BR 불출"].includes(e.st)) return toast(t("생산 시작 전(발행~BR 불출) 배치만 회수할 수 있습니다.")); esign(t("회수"), () => { e.st = "회수"; log(e.batch + " · " + t("회수")); save(); refresh(); toast(t("{b}를 회수했습니다.", { b: e.batch })); }); }
function ebrStop(eid) { const e = eid ? E(eid) : ebrPick(); if (!e) return; if (e.st !== "생산중") return toast(t("생산중인 배치만 작업중단할 수 있습니다.")); const m = modal(t("작업중단") + " · " + e.batch, `<div class="fld"><label>${tt("사유")}</label><input type="text" id="st_r" placeholder="${tt("예: 설비 점검")}"></div>`, "", [[t("취소")], [t("작업중단"), "danger", () => { const r = document.getElementById("st_r").value.trim(); if (!r) return toast(t("사유를 입력하세요.")); esign(t("작업중단"), () => { e.prev = e.st; e.st = "작업중단"; e.hold = r; log(e.batch + " · " + t("작업중단")); save(); closeAll(); if (!document.getElementById("pop").classList.contains("hidden")) { POPMODE = "home"; renderPop(); } else refresh(); toast(t("{b} 작업을 중단했습니다.", { b: e.batch })); }); }]]); }
function ebrHold(id) { const e = E(id); modal("Holding Config · " + e.batch, `<div class="kvgrid"><div><span>${tt("상태")}</span><b>${pill(e.st, ECLS[e.st])}</b></div><div><span>${tt("사유")}</span><b>${tt(e.hold || "-")}</b></div></div><div class="esign" style="margin-top:14px"><div class="warn">${tt("Drop 처리하면 해당 배치는 더 이상 진행할 수 없습니다. Holding을 해제하면 중단된 Step부터 다시 진행합니다.")}</div></div>`, "", [["Drop", "danger", () => esign("Drop", () => { e.st = "Drop"; log(e.batch + " · Drop"); save(); closeAll(); refresh(); toast(t("{b}를 Drop 처리했습니다.", { b: e.batch })); })], [t("Holding 해제"), "pri", () => esign(t("Holding 해제"), () => { e.st = e.prev || "생산중"; e.hold = ""; log(e.batch + " · " + t("Holding 해제")); save(); closeAll(); refresh(); toast(t("{b} 작업을 재개했습니다.", { b: e.batch })); })]]); }
function ebrReview(id) { const e = E(id); const key = "REV:" + e.batch;
  modal(t("반납 검토 (BR Review)") + " · " + e.batch, `<p class="muted small" style="margin-top:0">${tt("검토 중 발견한 이슈를 기록하고 확인 내용을 남긴 뒤 결재를 요청합니다.")}</p><div class="tbar"><button class="btn sm pri" onclick="act('행 추가','${key}')">${ic("plus")}${tt("이슈 추가")}</button><button class="btn sm" onclick="act('수정','${key}')">${ic("pen")}${tt("수정")}</button><button class="btn sm danger" onclick="act('삭제','${key}')">${tt("삭제")}</button></div><div class="inner">${gridBox(key, { title: "제조기록서 검토 서식", cols: ["Step No.", "Page No", "이슈, 질문 기술 (Issue Comment)", "서명 (Initial)", "날짜 (Date)", "확인된 내용", "서명 (Initial)"] }, 2)}</div>`, "lg",
    [[t("닫기")], [t("결재 요청"), "pri", () => esign(t("결재 요청"), () => { e.st = "반납 검토"; DB.appr.unshift({ id: uid(), no: "AP-2610-" + String(60 + DB.appr.length).padStart(4, "0"), form: "BR 반납 검토", title: "BR 반납 검토 결재 · " + e.batch, st: "결재대기", stage: "1 / 3", draft: d(0), done: "", dept: "생산1팀", drafter: ME, link: { t: "ebr", batch: e.batch }, comment: "" }); log(e.batch + " · " + t("결재 요청")); save(); closeAll(); refresh(); toast(t("결재를 요청했습니다.")); })]]); }
function brReport(x) { const e = typeof x === "string" ? (E(x) || DB.ebr.find(y => y.batch === x)) : x; const P = DB.pop[e.batch] || { cur: 0, rec: {} };
  modal(t("Executed BR 리포트") + " · " + e.batch, `<div class="br-doc"><h3>Batch Production Record</h3><div class="sub">${tt("전자 배치 기록서 · Executed BR")}</div>
  <table><tr><th>${tt("제품명")}</th><td>${tt(e.prod)}</td><th>${tt("제품 ID")}</th><td>${e.code}</td></tr><tr><th>${tt("MBR 번호 / 버전")}</th><td>${e.mbr} / ${e.ver}</td><th>Batch No.</th><td>${e.batch}</td></tr><tr><th>Campaign No.</th><td>${e.cp}</td><th>${tt("진행 현황")}</th><td>${pill(e.st, ECLS[e.st])}</td></tr><tr><th>${tt("생산 시작")}</th><td>${e.start || "-"}</td><th>${tt("생산 종료")}</th><td>${e.end || "-"}</td></tr></table>
  <table><tr><th style="width:auto">Step</th><th style="width:auto">${tt("공정")}</th><th style="width:auto">${tt("기록 요약")}</th><th style="width:auto">${tt("상태")}</th></tr>${STEPS.map((x, i) => `<tr><td>${(i + 1) * 10}</td><td>${tt(x)}</td><td>${tt(["투입량 250.12 kg (허용 ±1%)", "Tr 62.4 ℃ / 4h 10m", "pH 7.1 · 2h", "여과 완료 · 세척 2회", "감압 농축 완료", "LOD 0.3 % 이하", "Net 238.40 kg · Drum 6"][i])}</td><td>${i < P.cur || e.end ? pill("완료") : i === P.cur && e.st === "생산중" ? pill("진행중") : pill("대기", "")}</td></tr>`).join("")}</table>
  <table><tr><th>${tt("제조관리자")}</th><td>${tt(ME)} · ${tt("전자서명")}</td><th>${tt("품질보증책임자")}</th><td>${e.st === "반납 완료" ? tt("이서연") + " · " + tt("전자서명") : tt("미서명")}</td></tr></table></div>`, "md", [[t("인쇄"), "", () => printDoc("Executed BR " + e.batch)], [t("닫기"), "pri"]]); }
function printDoc(name) { toast(t("{n} 인쇄 미리보기를 엽니다.", { n: name })); setTimeout(() => window.print(), 300); }

/* ================= 결재 ================= */
SELOPTS.appr = { "양식명": ["MBR 승인", "BR 반납 검토", "공정 변경", "일탈 보고"], "결재상태": ["결재대기", "진행중", "승인완료", "반려", "회수"] };
function apprRows() { const q = SEARCH.appr; let r = DB.appr.slice(); if (q) { const F = { "양식명": "form", "결재명": "title", "기안자": "drafter", "결재상태": "st" }; r = r.filter(a => q.terms.every(x => hit(a[F[x.f]] ?? "", x.v, x.exact)) && dateOk(a.draft, q)); } return r; }
RENDER.appr = () => { const e = document.getElementById("apTbl"); if (e) e.innerHTML = apprTable(); };
function apprTable() { const g = S.C807000.grids[0], rows = apprRows();
  return `<div class="grid-wrap"><table class="grid"><thead><tr>${g.cols.map(c => `<th>${tt(c)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((a, i) => `<tr onclick="apprDetail('${a.id}')" class="click"><td>${i + 1}</td><td class="mono">${a.no}</td><td>${tt(a.form)}</td><td>${tt(a.title.split(" · ")[0])}${a.title.includes(" · ") ? " · " + esc(a.title.split(" · ")[1]) : ""}</td><td>${pill(a.st)}</td><td>${a.stage}</td><td>${a.draft}</td><td>${a.done || "-"}</td><td>${tt(a.dept)}</td><td>${tt(a.drafter)}</td><td><button class="btn sm" onclick="event.stopPropagation();apprDetail('${a.id}')">${tt("상세보기")}</button></td></tr>`).join("") : `<tr><td colspan="11" class="empty">${tt("조회된 데이터가 없습니다.")}</td></tr>`}</tbody></table></div><div class="pager"><span>${tt("총 {n}건", { n: rows.length })}</span><span></span></div>`; }
PAGES.C807000 = () => { const s = S.C807000, A = DB.appr;
  return head(s) + `<div class="g4">${kcard("내 결재 차례", A.filter(a => a.st === "결재대기").length, "건", "오늘 기준", "pen", "var(--warn)")}${kcard("진행중", A.filter(a => a.st === "진행중").length, "건", "결재선 진행", "clock", "var(--accent)")}${kcard("승인 완료", A.filter(a => a.st === "승인완료").length, "건", "누적", "check", "var(--ok)")}${kcard("반려", A.filter(a => a.st === "반려").length, "건", "재상신 필요", "alert", "var(--crit)")}</div>` +
    searchHTML(s.search, null, "appr") + `<div class="card"><div class="card-h">${tt(s.grids[0].title)}<div class="tools"><button class="btn sm" onclick="exportCSV('APPROVAL',apprRows().map((a,i)=>[i+1,a.no,a.form,a.title,a.st,a.stage,a.draft,a.done,a.dept,a.drafter,'']),S.C807000.grids[0].cols)">${ic("download")}${tt("엑셀 저장")}</button></div></div><div id="apTbl">${apprTable()}</div></div>`; };
function apprDetail(id) {
  const a = DB.appr.find(x => x.id === id), g = S.C807000.grids[1];
  const n = +a.stage[0];
  const line = [["1", "기안", "생산1팀", a.drafter, "기안", a.draft, "-"], ["2", "검토", "제조기술팀", "최유진", n >= 2 || a.st === "승인완료" ? "승인" : a.st === "결재대기" ? "대기" : "대기", n >= 2 ? a.draft : "-", "-"], ["3", "승인", "품질보증팀", ME, a.st === "승인완료" ? "승인" : a.st === "반려" ? "반려" : a.st === "결재대기" ? "결재 차례" : "대기", a.done || "-", a.comment || "-"]];
  const mine = a.drafter === ME, turn = a.st === "결재대기";
  const btns = [];
  if (mine && ["결재대기", "진행중"].includes(a.st)) btns.push([t("기안회수"), "danger", () => apprAct(a, "기안회수")]);
  if (turn) { btns.push([t("반려"), "danger", () => apprAct(a, "반려")]); btns.push([t("결재"), "pri", () => apprAct(a, "결재")]); }
  btns.push([t("닫기")]);
  modal(t("결재 상세보기") + " · " + a.no, `<div class="kvgrid">${[["제목", t(a.title.split(" · ")[0]) + (a.title.includes(" · ") ? " · " + a.title.split(" · ")[1] : "")], ["양식명", t(a.form)], ["소속부서", t(a.dept)], ["요청자", t(a.drafter)], ["기안일", a.draft], ["결재상태", ""]].map(([k, v]) => `<div><span>${tt(k)}</span><b>${k === "결재상태" ? pill(a.st) : esc(v)}</b></div>`).join("")}</div>
  <div class="sec-t">${tt("결재선")}</div><div class="inner"><table class="grid"><thead><tr>${g.cols.map(c => `<th>${tt(c)}</th>`).join("")}</tr></thead><tbody>${line.map(r => `<tr>${r.map((x, i) => `<td>${i === 4 ? pill(x, { "승인": "ok", "기안": "info", "반려": "err", "결재 차례": "warn", "대기": "" }[x]) : tt(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  <div class="sec-t">${tt("본문")}</div><div class="desc" style="margin:0">${tt("다음 문서의 결재를 요청합니다.")} <b>${esc(a.title.split(" · ")[1] || a.no)}</b><br>· ${tt("제조기록서 운영 방식: 전자 (EBR)")}<br>· ${tt("첨부: 검토 의견서, Paper BR")}</div>
  <div style="margin-top:12px"><button class="btn sm" onclick="modal(t('첨부파일 관리'),'<div class=vlist><div>📎 '+tt('검토 의견서')+'.pdf · 214 KB</div><div>📎 Paper BR.pdf · 1.2 MB</div></div>')">${ic("clip")}${tt("파일 보기")} (2)</button>${a.link ? ` <button class="btn sm acc" onclick="closeAll();${a.link.t === "mbr" ? `mbrEdit('${(DB.mbr.find(m => m.no === a.link.no) || {}).id}')` : `brReport('${a.link.batch}')`}">${tt("연결 문서 열기")}</button>` : ""}</div>`, "md", btns);
}
function apprAct(a, kind) {
  const m = modal(t(kind) + " · " + a.no, `<div class="fld"><label>${tt("결재의견")}</label><textarea class="input" id="ap_c" style="height:80px;padding:10px">${kind === "결재" ? tt("검토 결과 이상 없음") : ""}</textarea></div>`, "", [[t("취소")], [t(kind), kind === "결재" ? "pri" : "danger", () => {
    const c = document.getElementById("ap_c").value.trim(); if (kind !== "결재" && !c) return toast(t("의견을 입력하세요."));
    esign(t(kind), () => {
      a.comment = c; a.done = d(0);
      if (kind === "결재") { a.st = "승인완료"; a.stage = "3 / 3"; if (a.link && a.link.t === "mbr") { const mb = DB.mbr.find(x => x.no === a.link.no); if (mb) mb.st = "승인완료"; } if (a.link && a.link.t === "ebr") { const e = DB.ebr.find(x => x.batch === a.link.batch); if (e) e.st = "반납 완료"; } }
      else if (kind === "반려") { a.st = "반려"; if (a.link && a.link.t === "mbr") { const mb = DB.mbr.find(x => x.no === a.link.no); if (mb) mb.st = "반려"; } if (a.link && a.link.t === "ebr") { const e = DB.ebr.find(x => x.batch === a.link.batch); if (e) e.st = "생산 종료"; } }
      else { a.st = "회수"; a.done = ""; if (a.link && a.link.t === "mbr") { const mb = DB.mbr.find(x => x.no === a.link.no); if (mb) mb.st = "임시저장"; } if (a.link && a.link.t === "ebr") { const e = DB.ebr.find(x => x.batch === a.link.batch); if (e) e.st = "생산 종료"; } }
      log(a.no + " · " + t(kind)); save(); closeAll(); refresh(); toast(t("{k} 처리했습니다.", { k: t(kind) }));
    });
  }]]);
}

/* ================= Remarks 관리 (POP Remark 연동) ================= */
PAGES.C208000 = () => { const s = S.C208000, key = "C208000:0"; GRIDS[key] = { cols: s.grids[0].cols, title: s.grids[0].title, opt: {} }; rowsFor(key, s.grids[0].cols, 8); VS[key] = VS[key] || { page: 0, sort: null, sel: new Set(), filter: null }; ACTIVE = key;
  return head(s) + searchHTML(s.search, key) + `<div class="card"><div class="card-h">${tt(s.grids[0].title)}<span class="cnt" id="${gid(key)}_cnt"></span><div class="tools"><button class="btn sm" onclick="sortReset('${key}')">${ic("refresh")}${tt("정렬 초기화")}</button><button class="btn sm" onclick="exportCSV('${key}')">${ic("download")}${tt("엑셀 저장")}</button></div></div><div id="${gid(key)}">${gridInner(key)}</div></div>`; };

/* ================= Logbook 양식 ================= */
function pageLogbook(s) {
  const L = DB.logs[s.id] = DB.logs[s.id] || { sign: {}, note: "이상 없음", saved: false, done: false };
  const signGrids = s.grids.filter(g => /서명|검토\/승인|서명란/.test(g.title) && g.cols.length <= 5);
  const body = s.grids.filter(g => !signGrids.includes(g));
  const signers = signGrids.flatMap(g => g.cols.filter(c => !/특이사항|기타/.test(c)));
  if (body.length) ACTIVE = "LOG:" + s.id + ":0";
  const extraBtns = (s.buttons || []).filter(b => !/^(저장|초기화|서명)$/.test(b) && !TB_SKIP.test(b));
  return `<div class="page-head"><div><h1>${tt(s.name)} <span class="pid">${s.id.replace("POP_", "")}</span> ${pill(logState(s.id), { "미작성": "", "작성중": "info", "서명 대기": "warn", "완료": "ok" }[logState(s.id)])}</h1><p class="lede">${tt(s.purpose)}</p></div><div class="acts"><button class="btn" onclick="openScreen('LOGBOOK')">${ic("back")}${tt("목록")}</button><button class="btn" onclick="logReset('${s.id}')">${ic("refresh")}${tt("초기화")}</button>${toolbar(extraBtns, body.length ? "LOG:" + s.id + ":0" : null)}<button class="btn pri" onclick="logSave('${s.id}')">${tt("저장")}</button><button class="btn" onclick="toggleDesc()">${ic("info")}${tt("사용 방법")}</button></div></div>${descHTML(s)}` +
    `<div class="paper"><div class="ph"><div style="justify-content:center"><div class="logo" style="width:44px;height:44px">${IC_LOGO}</div></div><div class="ttl">${tt(s.name)}</div><div class="meta"><div><span>${tt("문서번호")}</span><span class="mono">LB-${s.id.replace("POP_C", "")}</span></div><div><span>${tt("개정번호")}</span><span>Rev. 03</span></div><div><span>${tt("작업일자")}</span><span>${d(0)}</span></div></div></div>
  ${body.map((g, i) => `<h5>${tt(g.title)}<span class="h5t"><button class="btn sm" onclick="act('행 추가','LOG:${s.id}:${i}')">${ic("plus")}${tt("행 추가")}</button><button class="btn sm danger" onclick="act('삭제','LOG:${s.id}:${i}')">${ic("trash")}</button></span></h5><div class="tw">${gridBox("LOG:" + s.id + ":" + i, g, g.cols.length > 10 ? 3 : 5, { per: 20 })}</div>`).join("")}
  ${signGrids.some(g => g.cols.some(c => /특이사항|기타/.test(c))) ? `<h5>${tt("특이사항")}</h5><textarea id="lgNote" onchange="DB.logs['${s.id}'].note=this.value;save()">${tt(L.note)}</textarea>` : ""}
  ${signers.length ? `<h5>${tt("서명")}</h5><div class="sign-row">${signers.map(x => `<div class="sign"><div class="st">${tt(x)}</div><div class="sb">${L.sign[x] ? signedHTML(L.sign[x]) : `<button class="btn sm acc" onclick="logSign('${s.id}','${esc(x)}')">${ic("pen")}${tt("서명")}</button>`}</div></div>`).join("")}</div>` : ""}</div>`;
}
function logSave(id) { const L = DB.logs[id]; L.saved = true; L.done = logAllSigned(id); save(); refresh(); toast(t("저장했습니다. 서명란에서 전자서명을 진행하세요.")); }
function logReset(id) { confirmBox(t("입력한 값을 모두 비울까요?"), () => { Object.keys(DB.g).filter(k => k.startsWith("LOG:" + id + ":")).forEach(k => DB.g[k].forEach(r => r.v = r.v.map((v, i) => colType(GRIDS[k] ? GRIDS[k].cols[i] : "") === "input" ? "" : v))); DB.logs[id] = { sign: {}, note: "", saved: false, done: false }; save(); refresh(); toast(t("초기화했습니다.")); }); }
function logSigners(id) { const s = S[id]; return s.grids.filter(g => /서명|검토\/승인|서명란/.test(g.title) && g.cols.length <= 5).flatMap(g => g.cols.filter(c => !/특이사항|기타/.test(c))); }
function logAllSigned(id) { const L = DB.logs[id], sg = logSigners(id); return L.saved && sg.length > 0 && sg.every(x => L.sign[x]) || (L.saved && !sg.length); }
function logSign(id, who) { const L = DB.logs[id]; if (!L.saved) return toast(t("먼저 [저장]한 뒤 서명하세요.")); esign(t(who) + " " + t("서명"), () => { L.sign[who] = ME + "|" + now(); L.done = logAllSigned(id); log(t(S[id].name) + " · " + t(who)); save(); refresh(); toast(t("서명했습니다.")); }); }

/* ================= 모달·확인·전자서명·토스트 ================= */
function modal(title, body, size = "", btns) {
  btns = btns || [[t("닫기"), "pri"]];
  const root = document.getElementById("modalRoot"); const id = "m" + Date.now() + Math.floor(Math.random() * 999);
  const wrap = document.createElement("div"); wrap.className = "mask"; wrap.id = id;
  wrap.innerHTML = `<div class="modal ${size}" role="dialog"><div class="mh">${esc(title)}<button class="x" onclick="closeModal('${id}')">${ic("x")}</button></div><div class="mb">${body}</div><div class="mf"></div></div>`;
  const mf = wrap.querySelector(".mf");
  btns.forEach(([tx, cls, fn]) => { const b = document.createElement("button"); b.className = "btn " + (cls || ""); b.textContent = tx; b.onclick = () => { if (fn) fn(); else closeModal(id); }; mf.appendChild(b); });
  wrap.addEventListener("mousedown", e => { if (e.target === wrap) closeModal(id); });
  root.appendChild(wrap); return id;
}
function closeModal(id) { const e = document.getElementById(id); if (e) e.remove(); }
function closeAll() { document.querySelectorAll("#modalRoot .mask").forEach(m => m.remove()); }
function confirmBox(msg, fn) { const id = modal(t("확인"), `<p style="margin:0">${esc(msg)}</p>`, "", [[t("취소")], [t("확인"), "pri", () => { closeModal(id); fn(); }]]); }
function esign(action, cb) {
  const id = modal(t("전자서명"), `<div class="esign"><div class="warn"><b>[${esc(action)}]</b> ${tt("작업을 진행합니다. 본인 확인을 위해 ID와 비밀번호를 입력하세요. 전자서명은 수기 서명과 같은 효력을 가지며 감사 추적(Audit trail)에 기록됩니다.")}</div>
  <label>${tt("사용자 ID")}</label><input class="input" value="ebrs.admin"><label>${tt("비밀번호")}</label><input class="input" type="password" id="es_pw" placeholder="${tt("비밀번호 입력 (예시: 아무 값)")}"><label>${tt("서명 의미")}</label><select class="input"><option>${tt("작성 (Author)")}</option><option>${tt("검토 (Review)")}</option><option>${tt("승인 (Approve)")}</option></select><div class="errmsg hidden" id="es_err">${tt("비밀번호를 입력하세요.")}</div></div>`, "", [[t("취소")], [t("서명"), "pri", () => {
    if (!document.getElementById("es_pw").value) { document.getElementById("es_err").classList.remove("hidden"); return; }
    closeModal(id); log(action); save(); cb && cb();
  }]]);
  setTimeout(() => { const p = document.getElementById("es_pw"); if (p) { p.focus(); p.onkeydown = e => { if (e.key === "Enter") document.querySelector("#" + id + " .mf .pri").click(); }; } }, 50);
}
let ttm; function toast(m) { let e = document.querySelector(".toast"); if (!e) { e = document.createElement("div"); e.className = "toast"; document.body.appendChild(e); } e.textContent = m; e.style.display = "block"; clearTimeout(ttm); ttm = setTimeout(() => e.style.display = "none", 2200); }

/* ================= 상단 검색·알림 ================= */
function globalSearch(q) {
  q = q.trim(); if (!q) return toast(t("검색어를 입력하세요."));
  const L = x => x.toLowerCase().includes(q.toLowerCase()) || t(x).toLowerCase().includes(q.toLowerCase());
  const e = DB.ebr.filter(x => [x.batch, x.prod, x.code, x.mbr, x.cp].some(L)), m = DB.mbr.filter(x => [x.no, x.prod, x.code].some(L)), a = DB.appr.filter(x => [x.no, x.title, x.form].some(L));
  const menus = MENU().flatMap(g => g.items).filter(x => L(x[1])).concat(LOGBOOKS.filter(id => L(S[id].name)).map(id => [id, S[id].name]));
  const sec = (tl, arr, f) => arr.length ? `<div class="sec-t">${tt(tl)} · ${arr.length}</div><div class="vlist">${arr.slice(0, 8).map(f).join("")}</div>` : "";
  modal(t("검색 결과") + " · " + q, (sec("배치 (EBR)", e, x => `<div class="click" onclick="closeAll();openScreen('C203000');VS.ebr.sel=new Set(['${x.id}']);RENDER.ebr()"><b class="mono">${x.batch}</b> ${tt(x.prod)} ${pill(x.st, ECLS[x.st])}</div>`) + sec("MBR", m, x => `<div class="click" onclick="closeAll();mbrEdit('${x.id}')"><b class="mono">${x.no}</b> ${tt(x.prod)} ${pill(x.st, MCLS[x.st])}</div>`) + sec("결재", a, x => `<div class="click" onclick="closeAll();openScreen('C807000');apprDetail('${x.id}')"><b class="mono">${x.no}</b> ${tt(x.title.split(" · ")[0])} ${pill(x.st)}</div>`) + sec("메뉴", menus, x => `<div class="click" onclick="closeAll();openScreen('${x[0]}')">${tt(x[1])}</div>`)) || `<p class="muted">${tt("검색 결과가 없습니다.")}</p>`, "md");
}
function notifs() {
  const n = [...DB.ebr.filter(e => e.st === "작업중단").map(e => [t("{b} 배치가 작업중단(Hold) 상태입니다", { b: e.batch }), "C203000"]), ...DB.appr.filter(a => a.st === "결재대기").map(a => [t("결재 요청") + " · " + a.no + " " + t(a.title.split(" · ")[0]), "C807000"]), ...DB.ebr.filter(e => e.st === "생산 종료").map(e => [t("반납 검토 대기") + " · " + e.batch, "C203000"])];
  modal(t("알림"), n.length ? `<div class="vlist">${n.map(([x, g]) => `<div class="click" onclick="closeAll();openScreen('${g}')">${ic("bell")} ${esc(x)}</div>`).join("")}</div>` : `<p class="muted">${tt("새 알림이 없습니다.")}</p>`);
}

/* ================= 공정 POP ================= */
let POPMODE = "home", fromLogin = false, POPB = null, VIEWSTEP = 0, GTIMER = null, GV = { tr: 62.4, tj: 68.2, ag: 120, pr: .32 };
SELOPTS.pop = { "진행상황": ["BR 불출", "생산중", "생산 종료", "작업중단"] };
function openPop(batch) { closeAll(); document.getElementById("pop").classList.remove("hidden"); if (batch) return popEnter(batch); POPMODE = "home"; renderPop(); }
function closePop() { clearInterval(GTIMER); if (fromLogin) { logout(); return; } document.getElementById("pop").classList.add("hidden"); if (!document.getElementById("app").classList.contains("hidden")) refresh(); }
function popEnter(batch) {
  const e = DB.ebr.find(x => x.batch === batch);
  if (!e) return;
  if (e.st === "BR 불출") return confirmBox(t("{b} 생산을 시작할까요? 생산 시작 시각이 기록됩니다.", { b: batch }), () => esign(t("생산 시작"), () => { e.st = "생산중"; e.start = now(); DB.pop[batch] = DB.pop[batch] || { cur: 0, rec: {} }; save(); popEnter(batch); toast(t("생산을 시작했습니다.")); }));
  if (e.st === "작업중단") return toast(t("작업중단 상태입니다. EBR 관리에서 Holding을 해제하세요."));
  if (!["생산중", "생산 종료", "반납 검토", "반납 완료"].includes(e.st)) return toast(t("생산이 시작되지 않아 이동할 수 없습니다."));
  DB.pop[batch] = DB.pop[batch] || { cur: e.st === "생산중" ? 0 : 7, rec: {} };
  POPB = batch; VIEWSTEP = Math.min(DB.pop[batch].cur, 6); POPMODE = "step"; RTAB = 0; renderPop();
}
function popRows() { const q = SEARCH.pop; let r = DB.ebr.filter(e => ["BR 불출", "생산중", "생산 종료", "작업중단"].includes(e.st)); if (q) r = r.filter(e => q.terms.every(x => hit({ "제품": e.prod, "제품 ID": e.code, "진행상황": e.st }[x.f] ?? "", x.v, x.exact))); return r; }
RENDER.pop = () => renderPop();
function renderPop() {
  clearInterval(GTIMER);
  const el = document.getElementById("pop");
  const hdr = (tl, right) => `<div class="ph"><div class="logo">${IC_LOGO}</div><div class="ttl"><b>${tt(tl)}</b><span>${tt("제약 바이오 EBRS · 공정 POP")}</span></div><div class="r">${right}${langSw()}<span class="scopechip">${ic("pin")} Plant 1 · ${tt("반응실 A")}</span><div class="who"><div class="avatar" style="width:28px;height:28px">${esc(t(POPME)[0])}</div><div class="wn"><b>${tt(POPME)}</b><small>${tt("생산1팀 A조")}</small></div></div><button class="btn" onclick="closePop()">${fromLogin ? ic("logout") + "Logout" : ic("x") + tt("닫기")}</button></div></div>`;
  if (POPMODE === "home") {
    const s = S.C204060, rows = popRows();
    const tbl = (tl, list) => `<div class="card"><div class="card-h">${tt(tl)}<span class="cnt">${tt("{n}건", { n: list.length })}</span></div><div class="grid-wrap"><table class="grid"><thead><tr>${s.grids[0].cols.map(c => `<th>${tt(c)}</th>`).join("")}</tr></thead><tbody>${list.length ? list.map((e, i) => `<tr><td>${i + 1}</td><td>${tt(e.prod)}</td><td class="mono">${e.code}</td><td class="mono">${e.cp}</td><td class="mono">${e.batch}</td><td>${e.start ? e.start.slice(0, 10) : "-"}</td><td>${e.end ? e.end.slice(0, 10) : "-"}</td><td>${e.plan || "-"}</td><td>${pill(e.st, ECLS[e.st])}</td><td><button class="btn sm ${e.st === "생산중" || e.st === "BR 불출" ? "pri" : ""}" onclick="popEnter('${e.batch}')">POP</button></td><td><button class="btn sm" onclick="brReport('${e.id}')">Paper</button></td></tr>`).join("") : `<tr><td colspan="11" class="empty">${tt("조회된 데이터가 없습니다.")}</td></tr>`}</tbody></table></div></div>`;
    el.innerHTML = hdr("POP 홈", "") + `<div class="pb"><div class="g4">${kcard("내 배치", rows.filter((e, i) => i % 2 == 0).length, "건", "오늘 배정", "user", "var(--accent)")}${kcard("생산중", rows.filter(e => e.st === "생산중").length, "배치", "Step 진행중", "activity", "var(--ok)")}${kcard("생산 대기", rows.filter(e => e.st === "BR 불출").length, "건", "BR 불출 완료", "clock", "var(--warn)")}${kcard("작업중단", rows.filter(e => e.st === "작업중단").length, "건", "Holding", "alert", "var(--crit)")}</div>
    ${searchHTML(s.search.map(f => f === "기간" ? "기간~" : f), null, "pop")}${tbl("Batch 작업 조회 (본인)", rows.filter((e, i) => i % 2 == 0))}${tbl("Batch 작업 조회 (전체)", rows)}</div>`;
    return;
  }
  const e = DB.ebr.find(x => x.batch === POPB), P = DB.pop[POPB], s = S.C204070, live = e.st === "생산중";
  const A = DB.alarm;
  const spark = (seed, c) => { let p = ""; for (let i = 0; i < 30; i++) p += `${i * 10},${26 - 12 * Math.sin((i + seed) / 4) - ((i * seed) % 7)} `; return `<svg class="spark" viewBox="0 0 290 46" preserveAspectRatio="none"><polyline fill="none" stroke="${c}" stroke-width="2" points="${p}"/></svg>`; };
  const gauge = (id, k, u, rg, seed) => { const v = GV[id], al = v < rg[0] || v > rg[1], pct = Math.max(2, Math.min(100, (v - rg[0]) / ((rg[1] - rg[0]) || 1) * 100)); return `<div class="gauge ${al ? "alarm" : ""}" id="gg_${id}"><div class="k"><span>${tt(k)}</span>${al ? pill("HIGH", "warn") : pill("정상", "ok")}</div><div class="v">${v.toFixed(id === "pr" ? 2 : 1)}<small>${u}</small></div><div class="bar"><i style="width:${pct}%"></i></div><div class="rg"><span>LL ${rg[0]}</span><span>HH ${rg[1]}</span></div>${spark(seed, al ? "#FBBF24" : "#38BDF8")}</div>`; };
  const stepCls = i => i < P.cur ? "done" : i === P.cur && live ? "cur" : "";
  el.innerHTML = hdr("공정 POP · Step 진행", `<button class="btn" onclick="POPMODE='home';renderPop()">${ic("home")}${tt("POP 홈")}</button>`) + `<div class="pb">
  <div class="card"><div class="card-h"><span class="mono">${e.batch}</span> · ${tt(e.prod)} ${pill(e.st, ECLS[e.st])}<span class="cnt">${e.mbr} Ver ${e.ver} · ${e.cp}</span><div class="tools">${["Navigation", "Batch 현황", "Record 보기", "연계문서", "MSDS", "CRA"].map(b => `<button class="btn sm" onclick="popInfo('${b}')">${tt(b)}</button>`).join("")}</div></div>
  <div class="card-b"><div class="steps">${STEPS.map((x, i) => `<div class="step ${stepCls(i)} ${i === VIEWSTEP ? "view" : ""}" onclick="VIEWSTEP=${i};RTAB=0;renderPop()"><div class="n">STEP ${(i + 1) * 10}</div><div class="t">${tt(x)}</div><div class="s">${i < P.cur ? "✓ " + tt("완료") : i === P.cur && live ? "● " + tt("진행중") : tt("대기")}</div></div>`).join("")}</div></div></div>
  <div class="tbar"><button class="btn" onclick="VIEWSTEP=Math.max(0,VIEWSTEP-1);RTAB=0;renderPop()">◀ ${tt("이전")}</button><button class="btn" onclick="VIEWSTEP=Math.min(6,VIEWSTEP+1);RTAB=0;renderPop()">${tt("다음")} ▶</button>${live && VIEWSTEP === P.cur ? `<button class="btn pri" onclick="stepDone()">${ic("check")}${tt(P.cur === 6 ? "Step 완료 · 생산 종료" : "Step 완료")}</button>` : ""}<span style="flex:1"></span>${live ? `<button class="btn danger" onclick="ebrStop('${e.id}')">Hold</button>` : ""}<button class="btn" onclick="popRemark()">Remark</button><button class="btn" onclick="popShift()">SHIFT</button><button class="btn" onclick="popResult()">${tt("제조실적")}</button><button class="btn" onclick="popAlarm()">${tt("알람 설정")}</button>${live ? `<button class="btn" onclick="popNA()">${tt("미기록 N/A처리")}</button>` : ""}</div>
  <div class="card"><div class="card-h">${tt("Batch 대시보드")} · ${tt(e.equip || "R-1201 반응기")}<span class="cnt">${live ? tt("3초마다 자동 갱신") : tt("생산중이 아닙니다")}</span></div><div class="card-b"><div class="g4" style="margin:0" id="gauges">${gauge("tr", "Tr (반응 온도)", "℃", A.tr, 1)}${gauge("tj", "Tj (재킷 온도)", "℃", A.tj, 3)}${gauge("ag", "Agitator", "rpm", A.ag, 5)}${gauge("pr", "Pressure", "kg/㎠", A.pr, 7)}</div></div></div>
  <div class="g2"><div class="card"><div class="card-h">${tt("Step 정보")}</div>${popKV(s.grids[0].cols, [e.batch, String((VIEWSTEP + 1) * 10), t(STEPS[VIEWSTEP]), t(STEPS[VIEWSTEP]) + " 1", "-", VIEWSTEP < 6 ? String((VIEWSTEP + 2) * 10) : "-", "-"])}</div>
  <div class="card"><div class="card-h">${tt("시간 정보")}</div>${popKV(s.grids[2].cols, [e.start || "-", P.stepAt && P.stepAt[VIEWSTEP] || (e.start || "-"), VIEWSTEP < P.cur ? (P.doneAt && P.doneAt[VIEWSTEP] || "-") : "-", "-", t("2h 이상"), "2h 00m", "1h 24m", "1h 24m", pill("정상", "ok")])}</div></div>
  <div class="card"><div class="card-h">${tt("취급물질 정보")}</div>${gridBox("POPMAT:" + POPB + ":" + VIEWSTEP, s.grids[1], 3, { per: 10 })}</div>
  <div class="card"><div class="card-h">${tt("기록 시트")} · Step ${(VIEWSTEP + 1) * 10}${live && VIEWSTEP === P.cur ? "" : `<span class="cnt">${tt("읽기 전용")}</span>`}</div><div class="subtabs" id="rt">${S["C204070-R"].tabs.map((x, i) => `<div class="${i === RTAB ? "on" : ""}" onclick="RTAB=${i};document.getElementById('rtb').innerHTML=recordSheet();document.querySelectorAll('#rt>div').forEach((e,j)=>e.classList.toggle('on',j===${i}))">${tt(x.replace(/\(TAB.*\)/, ""))}</div>`).join("")}</div><div id="rtb">${recordSheet()}</div></div></div>`;
  if (live) GTIMER = setInterval(tickGauges, 3000);
}
function tickGauges() {
  if (document.getElementById("pop").classList.contains("hidden") || POPMODE !== "step") return clearInterval(GTIMER);
  const A = DB.alarm, jit = (v, s, lo, hi) => Math.max(lo, Math.min(hi, v + (Math.random() - .5) * s));
  GV.tr = jit(GV.tr, .6, 58, 67); GV.tj = jit(GV.tj, 1.2, 62, 73); GV.ag = jit(GV.ag, 4, 100, 140); GV.pr = jit(GV.pr, .03, .2, .5);
  const box = document.getElementById("gauges"); if (!box) return;
  [["tr", "℃", A.tr], ["tj", "℃", A.tj], ["ag", "rpm", A.ag], ["pr", "kg/㎠", A.pr]].forEach(([id, u, rg]) => { const g = document.getElementById("gg_" + id), v = GV[id], al = v < rg[0] || v > rg[1]; g.classList.toggle("alarm", al); g.querySelector(".v").innerHTML = v.toFixed(id === "pr" ? 2 : 1) + `<small>${u}</small>`; g.querySelector(".k").lastElementChild.outerHTML = al ? pill("HIGH", "warn") : pill("정상", "ok"); g.querySelector(".bar i").style.width = Math.max(2, Math.min(100, (v - rg[0]) / ((rg[1] - rg[0]) || 1) * 100)) + "%"; });
}
function popKV(cols, vals) { return `<table class="kvt"><tbody>${cols.map((c, i) => `<tr><th>${tt(c)}</th><td>${String(vals[i] ?? "-").startsWith("<span") ? vals[i] : esc(vals[i] ?? "-")}</td></tr>`).join("")}</tbody></table>`; }
let RTAB = 0;
function recKey(r, c) { return VIEWSTEP + ":" + RTAB + ":" + r + ":" + c; }
function recordSheet() {
  const R = S["C204070-R"], P = DB.pop[POPB], e = DB.ebr.find(x => x.batch === POPB), editable = e.st === "생산중" && VIEWSTEP === P.cur, past = VIEWSTEP < P.cur;
  const cols = RTAB === 0 ? R.grids[0].cols : RTAB === 1 ? R.grids[1].cols : RTAB === 8 ? R.grids[2].cols : ["No", "항목", "목표값", "실측값", "Unit", "작업 시작 기록", "작업 종료 기록", "작업자", "Supervisor"];
  const PROC = ["반응기 내부 온도를 60~65 ℃로 유지한다", "교반 속도를 120 rpm으로 설정한다", "공정 시간을 확인하고 기록한다", "IPC 시료를 채취하여 결과를 확인한다"];
  const rec = P.rec;
  let h = `<div class="grid-wrap"><table class="grid"><thead><tr>${cols.map(c => `<th>${tt(c)}</th>`).join("")}</tr></thead><tbody>`;
  for (let r = 0; r < 4; r++) {
    h += "<tr>" + cols.map((c, ci) => {
      const k = recKey(r, ci), v = rec[k] ?? (past ? (colType(c) === "sign" || /기록|작업자|supervisor|확인자/i.test(c) ? (/기록$/.test(c) ? dt(1, r + ci) : rnd(r + ci, PEOPLE) + "|" + dt(1, r)) : gen(c, r)[1]) : null);
      if (/^contents$/i.test(c) || c === "항목") return `<td>${r + 1}. ${tt(RTAB === 0 ? PROC[r] : ["시료 1", "시료 2", "시료 3", "시료 4"][r])}</td>`;
      if (/작업기록|작업 시작 기록|작업 종료 기록/.test(c)) return `<td>${v ? `<div class="rec-done">${esc(String(v).slice(11) || v)}<small>${tt(rec[k + ":w"] || POPME)}</small></div>` : v === "N/A" ? pill("N/A") : editable ? `<button class="btn sm acc" onclick="recNow('${k}')">${tt("기록")}</button>` : "-"}</td>`;
      if (/operator|supervisor|작업자|확인자/i.test(c)) return `<td>${v && v !== "N/A" ? signedHTML(v) : v === "N/A" ? pill("N/A") : editable ? `<button class="btn sm ${/operator|작업자/i.test(c) ? "pri" : ""}" onclick="recSign('${k}')">${tt("전자서명")}</button>` : "-"}</td>`;
      const ty = colType(c);
      if (ty === "input" || /record|목표값|실측값/i.test(c)) return `<td>${editable ? `<input value="${esc(v ?? "")}" onchange="DB.pop['${POPB}'].rec['${k}']=this.value;save()">` : esc(v ?? "-")}</td>`;
      return `<td>${ty === "status" ? pill(v ?? gen(c, r)[1]) : tt(v ?? gen(c, r)[1])}</td>`;
    }).join("") + "</tr>";
  }
  return h + `</tbody></table></div>${editable ? `<div class="tbar end"><button class="btn sm" onclick="recUndo()">${tt("되돌리기")}</button><button class="btn sm" onclick="recClear()">${tt("지우기")}</button><button class="btn sm danger" onclick="recUnsign()">${tt("서명해제")}</button></div>` : ""}`;
}
let LASTREC = [];
function recNow(k) { const P = DB.pop[POPB]; P.rec[k] = now(); P.rec[k + ":w"] = POPME; LASTREC.push(k); save(); document.getElementById("rtb").innerHTML = recordSheet(); }
function recSign(k) { esign(t("전자서명"), () => { DB.pop[POPB].rec[k] = POPME + "|" + now(); LASTREC.push(k); save(); document.getElementById("rtb").innerHTML = recordSheet(); }); }
function recUndo() { const k = LASTREC.pop(); if (!k) return toast(t("되돌릴 기록이 없습니다.")); delete DB.pop[POPB].rec[k]; save(); document.getElementById("rtb").innerHTML = recordSheet(); toast(t("마지막 기록을 되돌렸습니다.")); }
function recClear() { const P = DB.pop[POPB], pre = VIEWSTEP + ":" + RTAB + ":"; Object.keys(P.rec).filter(k => k.startsWith(pre) && !String(P.rec[k]).includes("|")).forEach(k => delete P.rec[k]); save(); document.getElementById("rtb").innerHTML = recordSheet(); toast(t("서명되지 않은 기록을 지웠습니다.")); }
function recUnsign() { const P = DB.pop[POPB], pre = VIEWSTEP + ":" + RTAB + ":"; esign(t("서명해제"), () => { Object.keys(P.rec).filter(k => k.startsWith(pre) && String(P.rec[k]).includes("|")).forEach(k => delete P.rec[k]); save(); document.getElementById("rtb").innerHTML = recordSheet(); toast(t("이 시트의 서명을 해제했습니다.")); }); }
function popNA() { esign(t("미기록 N/A처리"), () => { const P = DB.pop[POPB]; for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) { const k = VIEWSTEP + ":" + RTAB + ":" + r + ":" + c; if (P.rec[k] == null) P.rec[k] = "N/A"; } save(); document.getElementById("rtb").innerHTML = recordSheet(); toast(t("미기록 항목을 N/A로 처리했습니다.")); }); }
function stepDone() {
  const e = DB.ebr.find(x => x.batch === POPB), P = DB.pop[POPB];
  const last = P.cur === 6;
  confirmBox(last ? t("마지막 Step입니다. 생산을 종료할까요?") : t("Step {n} 작업을 완료하고 다음 Step으로 넘어갈까요?", { n: (P.cur + 1) * 10 }), () => esign(t(last ? "생산 종료" : "Step 완료"), () => {
    (P.doneAt = P.doneAt || {})[P.cur] = now(); P.cur++; (P.stepAt = P.stepAt || {})[P.cur] = now();
    if (last) { e.st = "생산 종료"; e.end = now(); log(e.batch + " · " + t("생산 종료")); toast(t("생산을 종료했습니다. EBR 관리에서 반납 검토를 진행하세요.")); }
    else toast(t("Step {n}으로 넘어갔습니다.", { n: (P.cur + 1) * 10 }));
    VIEWSTEP = Math.min(P.cur, 6); RTAB = 0; save(); renderPop();
  }));
}
function popInfo(b) {
  const e = DB.ebr.find(x => x.batch === POPB), P = DB.pop[POPB];
  if (b === "Navigation") return modal("Navigation", `<div class="vlist">${STEPS.map((x, i) => `<div class="click" onclick="closeAll();VIEWSTEP=${i};RTAB=0;renderPop()">Step ${(i + 1) * 10} · ${tt(x)} ${i < P.cur ? pill("완료") : i === P.cur ? pill("진행중") : pill("대기", "")}</div>`).join("")}</div>`);
  if (b === "Batch 현황") return modal(t("Batch 현황") + " · " + e.batch, `<div class="kvgrid">${[["제품명", t(e.prod)], ["Batch No.", e.batch], ["진행 현황", t(e.st)], ["생산 시작", e.start || "-"], ["완료 Step", P.cur + " / 7"], ["Remark", (DB.remarks || []).filter(r => r.batch === e.batch).length + t("건")]].map(([k, v]) => `<div><span>${tt(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>`);
  if (b === "Record 보기") return brReport(e);
  if (b === "MSDS") return modal("MSDS", `<div class="inner">${gridBox("MSDS:" + e.batch, S["C203000-S2"].grids[0], 5)}</div>`, "lg");
  if (b === "CRA") return modal("CRA", `<div class="inner">${gridBox("CRA:" + e.batch, S["C202070-T2"].grids[1], 4)}</div>`, "lg");
  return modal(t("연계문서"), `<div class="vlist">${["SOP-PR-012 반응 공정 표준작업절차", "SOP-EQ-031 반응기 세척 절차", "MSDS · Toluene", "IPC 시험 방법서"].map(x => `<div class="click" onclick="toast(t('{n} 문서를 엽니다.',{n:t('${x}')}))">${ic("fileText")} ${tt(x)}</div>`).join("")}</div>`);
}
function popRemark() {
  const e = DB.ebr.find(x => x.batch === POPB);
  const list = (DB.remarks || []).filter(r => r.batch === e.batch);
  const id = modal(t("Remark (Step 특이사항)"), `<div class="inner"><table class="grid"><thead><tr><th>No.</th><th>Step No</th><th>${tt("등록일시")}</th><th>${tt("작성자")}</th><th>${tt("구분")}</th><th>${tt("내용")}</th></tr></thead><tbody>${list.length ? list.map((r, i) => `<tr><td>${i + 1}</td><td>${r.step}</td><td>${r.at}</td><td>${tt(r.who)}</td><td>${tt(r.kind)}</td><td>${esc(r.text)}</td></tr>`).join("") : `<tr><td colspan="6" class="empty">${tt("등록된 Remark가 없습니다.")}</td></tr>`}</tbody></table></div><div class="form-grid" style="margin-top:12px"><div class="fld"><label>${tt("구분")}</label><select id="rm_k"><option>${tt("특이사항")}</option><option>${tt("일탈")}</option><option>${tt("설비")}</option></select></div></div><textarea class="input" id="rm_t" style="width:100%;height:76px;margin-top:10px;padding:10px" placeholder="${tt("특이사항을 입력하세요")}"></textarea>`, "md", [[t("닫기")], [t("등록"), "pri", () => {
    const tx = document.getElementById("rm_t").value.trim(); if (!tx) return toast(t("내용을 입력하세요."));
    const r = { batch: e.batch, step: (VIEWSTEP + 1) * 10, at: now(), who: POPME, kind: document.getElementById("rm_k").value, text: tx }; (DB.remarks = DB.remarks || []).push(r);
    const s = S.C208000, key = "C208000:0"; rowsFor(key, s.grids[0].cols, 8);
    DB.g[key].unshift({ id: uid(), v: s.grids[0].cols.map(c => ({ "No.": String(DB.g[key].length + 1), "발생일시": r.at, "제품명": e.prod, "제품ID": e.code, "Campaign No.": e.cp, "Batch No.": e.batch, "장비명": e.equip || "R-1201 반응기", "Step No.": String(r.step), "대공정": STEPS[VIEWSTEP], "소공정": STEPS[VIEWSTEP] + " 1", "구분": "Step", "유형": r.kind, "작성자": POPME + "|" + r.at, "상세보기": "상세보기" }[c] ?? "-")) });
    save(); closeModal(id); toast(t("Remark를 등록했습니다. Remarks 관리에서도 볼 수 있습니다."));
  }]]);
}
function popShift() { const key = "SHIFT:" + POPB; modal(t("Shift 설정 (근무조 인수인계)"), `<div class="inner">${gridBox(key, { title: "Shift", cols: ["근무조", "작업자", "시작", "종료", "인계자 서명", "인수자 서명"] }, 3)}</div><p class="note">${tt("서명 버튼으로 인계자·인수자 전자서명을 남깁니다.")}</p>`, "md"); }
function popResult() {
  const e = DB.ebr.find(x => x.batch === POPB), list = (DB.results || []).filter(r => r.batch === e.batch);
  const id = modal(t("제조실적"), `<div class="inner"><table class="grid"><thead><tr><th>Step</th><th>${tt("물질명")}</th><th>${tt("투입량")}</th><th>${tt("단위")}</th><th>${tt("등록일시")}</th></tr></thead><tbody>${list.length ? list.map(r => `<tr><td>${r.step}</td><td>${tt(r.mat)}</td><td>${r.qty}</td><td>kg</td><td>${r.at}</td></tr>`).join("") : `<tr><td colspan="5" class="empty">${tt("등록된 실적이 없습니다.")}</td></tr>`}</tbody></table></div><div class="form-grid" style="margin-top:12px"><div class="fld"><label>${tt("물질명")}</label><select id="rs_m">${MATS.map(m => `<option>${m[0]}</option>`).join("")}</select></div><div class="fld"><label>${tt("투입량")} (kg)</label><input type="text" id="rs_q" placeholder="0.00"></div></div>`, "md", [[t("닫기")], [t("저장"), "pri", () => { const q = parseFloat(document.getElementById("rs_q").value); if (!(q > 0)) return toast(t("투입량을 숫자로 입력하세요.")); (DB.results = DB.results || []).push({ batch: e.batch, step: (VIEWSTEP + 1) * 10, mat: document.getElementById("rs_m").value, qty: q.toFixed(2), at: now() }); save(); closeModal(id); popResult(); toast(t("제조실적을 저장했습니다.")); }]]);
}
function popAlarm() { const A = DB.alarm; const rows = [["tr", "Tr (반응 온도)"], ["tj", "Tj (재킷 온도)"], ["ag", "Agitator"], ["pr", "Pressure"]];
  const id = modal(t("알람 설정"), `<div class="inner"><table class="grid"><thead><tr><th>${tt("항목")}</th><th>LL</th><th>HH</th></tr></thead><tbody>${rows.map(([k, n]) => `<tr><td>${tt(n)}</td><td><input id="al_${k}_0" value="${A[k][0]}"></td><td><input id="al_${k}_1" value="${A[k][1]}"></td></tr>`).join("")}</tbody></table></div>`, "", [[t("취소")], [t("저장"), "pri", () => { for (const [k] of rows) { const lo = parseFloat(document.getElementById(`al_${k}_0`).value), hi = parseFloat(document.getElementById(`al_${k}_1`).value); if (isNaN(lo) || isNaN(hi) || lo >= hi) return toast(t("LL은 HH보다 작은 숫자여야 합니다.")); A[k] = [lo, hi]; } save(); closeModal(id); renderPop(); toast(t("알람 기준을 저장했습니다.")); }]]); }

/* ================= 시작 ================= */
let LOGIN_MODE = "web";
function doLogin() {
  const pw = document.getElementById("lpw").value, idv = document.getElementById("lid").value.trim();
  if (!idv || !pw) { document.getElementById("lerr").classList.remove("hidden"); return; }
  document.getElementById("lerr").classList.add("hidden");
  document.getElementById("login").classList.add("hidden");
  if (LOGIN_MODE === "pop") { fromLogin = true; openPop(); return; }
  fromLogin = false; document.getElementById("app").classList.remove("hidden"); openScreen("HOME");
}
function logout() { clearInterval(GTIMER); closeAll(); document.getElementById("app").classList.add("hidden"); document.getElementById("pop").classList.add("hidden"); document.getElementById("login").classList.remove("hidden"); fromLogin = false; }
function setTheme(n) { document.documentElement.dataset.theme = n; document.getElementById("themeBtn").innerHTML = ic(n === "dark" ? "sun" : "moon"); try { localStorage.setItem("ebrs-theme", n); } catch (e) {} }
function boot() {
  seed();
  document.querySelectorAll("[data-ic]").forEach(e => e.innerHTML = ic(e.dataset.ic));
  document.querySelectorAll(".lslot").forEach(e => e.innerHTML = langSw());
  document.querySelectorAll(".modes button").forEach(b => b.onclick = () => { document.querySelectorAll(".modes button").forEach(x => x.classList.remove("on")); b.classList.add("on"); LOGIN_MODE = b.dataset.m; });
  document.getElementById("btnLogin").onclick = doLogin;
  document.getElementById("lpw").onkeydown = e => { if (e.key === "Enter") doLogin(); };
  document.getElementById("logout").onclick = logout;
  document.getElementById("goPop").onclick = () => { fromLogin = false; openPop(); };
  document.getElementById("themeBtn").onclick = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  document.getElementById("bellBtn").onclick = notifs;
  document.getElementById("gsearch").onkeydown = e => { if (e.key === "Enter") globalSearch(e.target.value); };
  try { const th = localStorage.getItem("ebrs-theme"); setTheme(th || "dark"); } catch (e) { setTheme("dark"); }
  document.documentElement.lang = LANG;
  applyStatic();
  document.addEventListener("keydown", e => { if (e.key === "Escape") { const m = document.querySelectorAll("#modalRoot .mask"); if (m.length) m[m.length - 1].remove(); } });
}
boot();
