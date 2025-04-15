import { useState } from "react";

export default function SoulStageApp() {
  const [results, setResults] = useState(["--/--", "--/--", "--/--", "--/--", "--/--"]);
  const [lunarResults, setLunarResults] = useState(["--/--", "--/--", "--/--", "--/--", "--/--"]);
  const [input, setInput] = useState({ date: "", hour: "", minute: "" });
  const [lunarInput, setLunarInput] = useState({ date: "", hour: "", minute: "", leap: false });
  const [errorMsg, setErrorMsg] = useState("");

  const formatBornCode = (data) => {
    const datePart = data.date.replace(/-/g, "");
    return datePart + (data.hour || "") + (data.minute || "");
  };

  const countSoulZeros = (data) => {
    const digits = formatBornCode(data);
    if (!data.date) return "";
    const zeroCount = digits.split('').filter(d => d === '0').length;
    if (zeroCount === 0) return '🍼 嬰兒靈（三次元）';
    if (zeroCount === 1) return '👶 幼兒靈（四次元）';
    if (zeroCount === 2) return '🧒 青年靈（五次元）';
    if (zeroCount === 3) return '🧙 成熟靈（六次元）';
    if (zeroCount === 4) return '🧘 老年靈（七次元）';
    if (zeroCount === 5) return '🪐 超自然（八次元）';
    return '♾️ 無限靈（九次元）';
  };

  const getCoreDigitIdentity = (data) => {
    const code = formatBornCode(data);
    const yearStr = data.date.slice(0, 4);
    const yearNum = parseInt(yearStr);
    const freq = {};

    code.split('').forEach(d => {
      freq[d] = (freq[d] || 0) + 1;
    });

    const filtered = Object.entries(freq)
      .filter(([d, count]) => (yearNum >= 2000 ? count >= 2 : count >= 3))
      .map(([d]) => d);

    let maxCount = Math.max(...Object.values(freq), 0);

    let freqTableRows = Array.from({ length: 10 }, (_, i) => String(i))
      .map((d) => {
        const count = freq[d] || 0;
        const isHighFreq = yearNum >= 2000 ? count >= 2 : count >= 3;
        const isMax = count === maxCount && count > 0;
        const className = count === 0
          ? 'text-gray-400 italic'
          : isMax
            ? 'bg-red-100 font-bold text-red-700'
            : isHighFreq
              ? (data === lunarInput ? 'bg-yellow-200 font-bold text-black' : 'bg-yellow-200 font-bold')
              : '';
        return `<tr class='${className}'><td class='border px-2 py-1'>${d}</td><td class='border px-2 py-1'>${count} 次</td></tr>`;
      })
      .join('');

    let tableHTML = freqTableRows ? `<table class='mt-2 text-xs border border-collapse'><thead><tr><th class='border px-2 py-1'>數字</th><th class='border px-2 py-1'>出現次數</th></tr></thead><tbody>${freqTableRows}</tbody></table>` : '';

    return `${filtered.length > 0 ? `數字頻率高：${filtered.join('、')}` : ''}${tableHTML}`;
  };

  const handleInput = (type, value, isLunar = false) => {
    const currentData = isLunar ? lunarInput : input;
    let cleaned = (value || '').toString().replace(/[^0-9]/g, '');
    let error = '';

    if (type === 'hour') {
      if (cleaned.length > 2) cleaned = cleaned.slice(0, 2);
      const num = parseInt(cleaned, 10);
      if (num < 0 || num > 23) error = '⚠️ 小時範圍為 00～23';
    }

    if (type === 'minute') {
      if (cleaned.length > 2) cleaned = cleaned.slice(0, 2);
      const num = parseInt(cleaned, 10);
      if (num < 0 || num > 59) error = '⚠️ 分鐘範圍為 00～59';
    }

    if (type === 'date') {
      const [year, month, day] = value.split('-').map((v) => parseInt(v, 10));
      if (year < 1911 || year > new Date().getFullYear()) {
        error = '⚠️ 年份需在 1911 至系統年份之間';
      } else if (month < 1 || month > 12) {
        error = '⚠️ 月份需為 01～12';
      } else {
        const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 29 : 28,
          31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day < 1 || day > daysInMonth[month - 1]) {
          error = `⚠️ ${month} 月最多 ${daysInMonth[month - 1]} 天`;
        }
      }
    }

    if (error) {
      setErrorMsg(error);
      return;
    } else {
      setErrorMsg('');
    }

    const update = { ...currentData, [type]: type === 'date' ? value : cleaned };

    const calculateStages = ({ date, hour, minute }) => {
      if (!date) return ["--/--", "--/--", "--/--", "--/--", "--/--"];
      const [year, month, day] = date.split('-');
      const yDigits = year.split('').map(Number);
      const ySum = yDigits.reduce((a, b) => a + b, 0);
      const mDigits = month.split('').map(Number);
      const mSum = ySum + mDigits.reduce((a, b) => a + b, 0);
      const dDigits = day.split('').map(Number);
      const dSum = mSum + dDigits.reduce((a, b) => a + b, 0);

      const calcStage = (base, addends) => {
        const total = base + addends.reduce((a, b) => a + b, 0);
        const first = String(total).split('').reduce((a, b) => a + Number(b), 0);
        const second = String(first).length > 1 ? String(first).split('').reduce((a, b) => a + Number(b), 0) : null;
        return total < 10 ? `${total}` : second === null ? `${total}/${first}` : `${total}/${first}/${second}`;
      };

      let hStage = "--/--";
      let mStage = "--/--";

      if (hour) {
        const hDigits = hour.split('').map(Number);
        const hSum = dSum + hDigits.reduce((a, b) => a + b, 0);
        hStage = calcStage(dSum, hDigits);

        if (minute) {
          const minDigits = minute.split('').map(Number);
          mStage = calcStage(hSum, minDigits);
        }
      }

      return [
        calcStage(0, yDigits),
        calcStage(ySum, mDigits),
        calcStage(mSum, dDigits),
        hStage,
        mStage
      ];
    };

    if (isLunar) {
      setLunarInput(update);
      setLunarResults(calculateStages(update));
    } else {
      setInput(update);
      setResults(calculateStages(update));
    }
  };

  const renderStages = (data, isLunar = false) => {
    const inputData = isLunar ? lunarInput : input;
    const hasDate = inputData.date;
    const hasTime = inputData.hour && inputData.minute;
    const bornCode = (isLunar ? `陰(-)${inputData.leap ? '[閏]' : ''}` : '陽(+)') + formatBornCode(inputData);

    return (
      <div className={`grid grid-cols-1 gap-2 text-xs text-center rounded-xl p-2 border ${isLunar ? 'bg-purple-200 text-white' : 'bg-purple-50 text-gray-800'}`}>
        {hasDate && (
          <div className="p-2 rounded border bg-blue-400 text-white font-bold">
            <p>先天數</p>
            <p>{bornCode}</p>
          </div>
        )}
        {[{ label: '晚年數 (61-)', value: data[0] },
          { label: '中年數 (41-60)', value: data[1] },
          { label: '主命數 (21-40)', value: data[2], highlight: true },
          { label: '青年數 (11-20)', value: hasTime ? data[3] : '--/--', disabled: !hasTime },
          { label: '幼年數 (0-10)', value: hasTime ? data[4] : '--/--', disabled: !hasTime }
        ].map((stage, i) => (
          <div
            key={i}
            className={`p-2 rounded border ${
              stage.highlight ? (isLunar ? 'bg-yellow-500 text-black font-bold' : 'bg-yellow-100 font-bold') :
              stage.disabled ? 'bg-gray-100 text-gray-400 italic' :
              isLunar ? 'bg-purple-900 text-gray-100' : 'bg-white'
            }`}
          >
            <p>{stage.label}</p>
            <p>{stage.value}</p>
          </div>
        ))}
        {!hasTime && hasDate && (
          <p className={`text-xs italic mt-1 ${isLunar ? 'text-white' : 'text-gray-500'}`}>
            ⏰ 請輸入「時」與「分」才能計算青年與幼年階段的數字
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-200 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 text-center">靈魂五階段計算器</h1>
      {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white p-4 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-purple-700">國曆輸入</h2>
          <input
            type="date" min="1911-01-01" max={new Date().toISOString().split('T')[0]}
            value={input.date}
            onChange={(e) => handleInput("date", e.target.value, false)}
            className="w-full border px-2 py-1 rounded text-sm"
          />
          {['hour', 'minute'].map((type) => (
            <input
              key={type}
              placeholder={type}
              value={input[type]}
              onChange={(e) => handleInput(type, e.target.value, false)}
              className="w-full border px-2 py-1 rounded text-sm"
            />
          ))}
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow space-y-4">
          {lunarInput.leap && lunarInput.date && (
            <div className="bg-yellow-100 text-yellow-900 border border-yellow-400 p-2 rounded text-sm">
              ⚠️ 閏月出生，建議以農曆對應當年國曆的生日多分析一組生命靈數
            </div>
          )}
          <h2 className="text-lg font-semibold text-white">農曆輸入</h2>
          <input
            type="date" min="1911-01-01" max={new Date().toISOString().split('T')[0]}
            value={lunarInput.date}
            onChange={(e) => handleInput("date", e.target.value, true)}
            className="w-full border px-2 py-1 rounded text-sm text-black"
          />
          {['hour', 'minute'].map((type) => (
            <input
              key={type}
              placeholder={type}
              value={lunarInput[type]}
              onChange={(e) => handleInput(type, e.target.value, true)}
              className="w-full border px-2 py-1 rounded text-sm text-black"
            />
          ))}
          <label className="flex items-center space-x-2 text-white text-sm pt-2">
            <input
              type="checkbox"
              checked={lunarInput.leap}
              onChange={(e) => setLunarInput({ ...lunarInput, leap: e.target.checked })}
              className="accent-purple-500"
            />
            <span>閏月</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-purple-700">國曆分析結果</h2>
          <div className="space-y-2 text-sm">
            {renderStages(results)}
            {countSoulZeros(input) && <p className="mt-2">靈魂年齡：{countSoulZeros(input)}</p>}
            {results[2] && results[2] !== "--/--" && (
  <p className="text-purple-800 font-semibold">
    <strong>主命數(+)： {results[2].match(new RegExp("\\d+$"))?.[0]} 號人</strong>
  </p>
)}
<p dangerouslySetInnerHTML={{ __html: getCoreDigitIdentity(input) }} />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-white">農曆分析結果</h2>
          <div className="space-y-2 text-sm">
            {renderStages(lunarResults, true)}
            {countSoulZeros(lunarInput) && <p className="mt-2 text-white">靈魂年齡：{countSoulZeros(lunarInput)}</p>}
            {lunarResults[2] && lunarResults[2] !== "--/--" && (
  <p className="text-yellow-200 font-semibold">
    <strong>主命數(-)： {lunarResults[2].match(new RegExp("\\d+$"))?.[0]} 號人</strong>
  </p>
)}
<p className="text-white" dangerouslySetInnerHTML={{ __html: getCoreDigitIdentity(lunarInput) }} />
          </div>
        </div>
      </div>
    </div>
  );
}
