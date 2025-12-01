// ===== 날짜 유틸 =====
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextSundayInclusive(date) {
  const d = startOfDay(date);
  const offset = (7 - d.getDay()) % 7; // 0=Sun → 0, Mon→6,...
  d.setDate(d.getDate() + offset);
  return d;
}

function enumerateSundays(fromDate, toDate) {
  const list = [];
  let cur = nextSundayInclusive(fromDate);
  while (cur <= toDate) {
    list.push(new Date(cur));
    cur.setDate(cur.getDate() + 7);
  }
  return list;
}

function getTargetFeb8(today) {
  const thisYear = today.getFullYear();
  const feb8ThisYear = new Date(thisYear, 1, 8); // 2월 → month=1
  return startOfDay(today) <= startOfDay(feb8ThisYear)
    ? feb8ThisYear
    : new Date(thisYear + 1, 1, 8);
}

function labelKoreanSunday(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일(일)`;
}

// ===== 렌더 =====
(function init() {
  const wrap = document.getElementById("schedule-buttons");
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (!wrap) return;

  const today = startOfDay(new Date());

  // ✅ 시즌 시작일: 지난 일요일들도 유지하고 싶으면
  //   여기 날짜만 원하는 시작일로 바꿔 쓰면 됨
  const seasonStart = startOfDay(new Date(2025, 10, 4)); // 2024-12-01 (12월=11)

  const target = getTargetFeb8(today);

  // ✅ 이제는 오늘이 아니라 시즌 시작일부터 타깃일까지의 모든 일요일
  const sundays = enumerateSundays(seasonStart, target);

  if (!sundays.length) {
    wrap.innerHTML =
      '<div class="small" style="color:#64748b">표시할 일요일이 없습니다.</div>';
    return;
  }

  // 달별 그룹화
  const groups = new Map(); // key: 'YYYY-MM'
  sundays.forEach((d) => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  });

  const sortedKeys = Array.from(groups.keys()).sort(
    (a, b) => new Date(a + "-01") - new Date(b + "-01")
  );

  wrap.innerHTML = "";
  const frag = document.createDocumentFragment();

  sortedKeys.forEach((key, groupIdx) => {
    const [y, mm] = key.split("-");

    const section = document.createElement("section");
    section.className = "month-group";

    const title = document.createElement("h3");
    title.className = "month-title";
    title.textContent = `${y}년 ${Number(mm)}월`;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "button-grid";

    const dates = groups.get(key);
    dates.forEach((d, idx) => {
      const btn = document.createElement("button");
      btn.className =
        "btn-date" +
        (startOfDay(d).getTime() === startOfDay(today).getTime()
          ? " is-today"
          : "") +
        (groupIdx === sortedKeys.length - 1 && idx === dates.length - 1
          ? " is-last"
          : "");
      btn.type = "button";
      btn.textContent = labelKoreanSunday(d);
      btn.setAttribute(
        "aria-label",
        `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일(일) 선택`
      );
      btn.dataset.iso = d.toISOString();

      btn.addEventListener("click", () => {
        const dt = new Date(btn.dataset.iso);
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        const file = `${m}_${day}.html`; // 예: 02_02.html
        window.location.href = file;
      });

      grid.appendChild(btn);
    });

    section.appendChild(grid);
    frag.appendChild(section);
  });

  wrap.appendChild(frag);
})();
