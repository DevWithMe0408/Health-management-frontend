// Nhật ký bữa ăn — mock data (đủ 1 tháng để render Ngày/Tuần/Tháng)
const NH_MEAL_PLAN = {
  SANG:      [{ dishName: 'Phở gà', dishKcal: 380 }, { dishName: 'Trứng luộc', dishKcal: 70 }],
  PHU_SANG:  [{ dishName: 'Sữa chua Hy Lạp', dishKcal: 120 }, { dishName: 'Chuối', dishKcal: 90 }],
  TRUA:      [{ dishName: 'Cơm gạo lứt', dishKcal: 280 }, { dishName: 'Ức gà áp chảo', dishKcal: 220 }, { dishName: 'Canh rau ngót', dishKcal: 60 }],
  PHU_CHIEU: [{ dishName: 'Sữa hạt', dishKcal: 140 }, { dishName: 'Hạt điều', dishKcal: 110 }],
  TOI:       [{ dishName: 'Cơm trắng', dishKcal: 250 }, { dishName: 'Cá hồi áp chảo', dishKcal: 240 }, { dishName: 'Rau cải luộc', dishKcal: 45 }],
};

const NH_CUSTOM_NOTES = [
  'Đi ăn ngoài với đồng nghiệp — cơm gà xối mỡ',
  'Bún bò Huế gần nhà',
  'Bánh mì thịt + cà phê sữa',
  'Lẩu thái cuối tuần',
  'Cơm tấm sườn bì',
];
const NH_CUSTOM_KCAL = [620, 540, 480, 780, 700];

function nhGetSuggested(mealType) { return NH_MEAL_PLAN[mealType].map((x) => ({ ...x })); }

function nhBuildMonth(year, month) {
  let seed = year * 100 + month + 7;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const logs = [];
  const days = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const key = nhFmtKey(date);
    const future = date > NH_TODAY;
    const isToday = nhSameDay(date, NH_TODAY);

    NH_MEAL_ORDER.forEach((mealType, idx) => {
      const plan = NH_MEAL_PLAN[mealType];
      let status;
      if (future) status = 'SUGGESTED';
      else if (isToday) status = idx <= 2 ? (idx === 1 ? 'CUSTOM' : 'FOLLOWED') : 'SUGGESTED';
      else { const r = rand(); status = r < 0.6 ? 'FOLLOWED' : r < 0.82 ? 'CUSTOM' : r < 0.93 ? 'SKIPPED' : 'SUGGESTED'; }

      let dishes = [], customNote = null, totalKcalActual = 0;
      if (status === 'FOLLOWED') { dishes = plan.map((x) => ({ ...x })); totalKcalActual = dishes.reduce((s, x) => s + x.dishKcal, 0); }
      else if (status === 'CUSTOM') { const ni = Math.floor(rand() * NH_CUSTOM_NOTES.length); customNote = NH_CUSTOM_NOTES[ni]; totalKcalActual = NH_CUSTOM_KCAL[ni]; }
      else if (status === 'SUGGESTED') { dishes = plan.map((x) => ({ ...x })); }

      logs.push({ id: `${key}-${mealType}`, mealDate: key, mealType, status, customNote, totalKcalActual, dishes });
    });
  }
  return logs;
}

const NH_MOCK_LOGS = nhBuildMonth(NH_TODAY.getFullYear(), NH_TODAY.getMonth());

Object.assign(window, { NH_MEAL_PLAN, nhGetSuggested, nhBuildMonth, NH_MOCK_LOGS });
