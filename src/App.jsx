
import { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { Solar } from "lunar-javascript";


function SoulStageApp() {
  const [input, setInput] = useState({ date: "", hour: "", minute: "", leap: false });
  const [lunarText, setLunarText] = useState("");
  const [lunarCode, setLunarCode] = useState("");
  const [lunarResults, setLunarResults] = useState(["--/--", "--/--", "--/--", "--/--", "--/--"]);
  const [results, setResults] = useState(["--/--", "--/--", "--/--", "--/--", "--/--"]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // ✅ 自動監聽 input 變動並更新農曆資訊
  useEffect(() => {
    if (input.date) {
      updateLunarInfo(input);
    }
  }, [input]);

  const formatBornCode = (data) => {
    const datePart = data.date.replace(/-/g, "");
    return datePart + (data.hour || "") + (data.minute || "");
  };

    // 判斷靈魂等級（1～7），依據先天數與階段值
    const determineSoulStageLevel = (bornCode, stageValue) => {
      if (!stageValue || stageValue.includes("--")) return "";

      const digits = bornCode.split(""); // 先天數字
      let parts = stageValue.split("/");

      // 補格式，例如 5 → 05/5
      if (parts.length === 1) parts = ["0" + parts[0], parts[0]];

      const firstLayer = parts[0].split(""); // 第一層 2 個數字
      const lastDigit = parts[parts.length - 1].slice(-1); // 個位數

      // ✅ 條件 A：個位數不在先天數 ➜ 判斷第一層對應 1～3 級
      if (!digits.includes(lastDigit)) {
        const matchCount = firstLayer.filter(d => digits.includes(d)).length;
        if (matchCount === 0) return "(1)";
        if (matchCount === 1) return "(2)";
        return "(3)";
      }

      // ✅ 條件 B：個位數有在先天數 ➜ 判斷第一層對應 4～7 級
      const matchCount = firstLayer.filter(d => digits.includes(d)).length;

      if (matchCount === 0) return "(4)";
      if (matchCount === 1) return "(5)";
      if (matchCount === 2) {
        // 檢查擋修：1～8 中出現次數 ≥ 3
        const freq = {};
        digits.forEach(d => {
          if ("12345678".includes(d)) freq[d] = (freq[d] || 0) + 1;
        });
        const blockList = Object.entries(freq)
          .filter(([_, count]) => count >= 3)
          .map(([d]) => d)
          .sort();

        return blockList.length > 0
          ? `(6 擋修${blockList.join("、")})`
          : "(7)";
      }

      return "";
    };


  const countSoulZeros = (data) => {
    const digits = formatBornCode(data);
    if (!data.date) return "";
    const zeroCount = digits.split('').filter(d => d === '0').length;
    return [
      '🍼 嬰兒靈（三次元）', 
      '👶 幼兒靈（四次元）', 
      '🧒 青年靈（五次元）',
      '🧙 成熟靈（六次元）', 
      '🧘 老年靈（七次元）', 
      '🪐 超自然（八次元）'
    ][zeroCount] || '♾️ 無限靈（九次元）';
  };

  const CoreDigitTable = ({ code, yearNum, isDark = false }) => {
   const freq = {};
   code.split('').forEach(d => { freq[d] = (freq[d] || 0) + 1; });
   const filtered = Object.entries(freq)
      .filter(([d, c]) => yearNum >= 2000 ? c >= 2 : c >= 3)
      .map(([d]) => d);
   const maxCount = Math.max(...Object.values(freq), 0);
   const textColor = isDark ? 'text-white' : 'text-black';

  return (
    <div>
      {filtered.length > 0 && (
        <p className={`font-medium text-sm ${textColor}`}>
          數字頻率高：{filtered.join('、')}
        </p>
      )}
      <table className="mt-2 text-xs border border-collapse w-auto">
        <thead>
          <tr>
            <th className={`border px-2 py-1 text-center font-bold ${textColor}`}>數字</th>
            <th className={`border px-2 py-1 text-center font-bold ${textColor}`}>出現次數</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, i) => String(i)).map(d => {
            const c = freq[d] || 0;
            const high = yearNum >= 2000 ? c >= 2 : c >= 3;
            const isMax = c === maxCount && c > 0;
            const isZero = c === 0;
            const className = isZero
              ? 'text-gray-400 italic text-center'
              : isMax
                ? 'bg-red-200 font-bold text-red-700 text-center'
                : high
                  ? 'bg-yellow-200 font-bold text-center'
                  : `text-center ${textColor}`;

            return (
              <tr key={d} className={className}>
                <td className="border px-2 py-1">{d}</td>
                <td className="border px-2 py-1">{c} 次</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


  const calculateStages = ({ date, hour, minute }) => {
    if (!date) return Array(5).fill("--/--");
    const [year, month, day] = date.split('-');
    const yDigits = year.split('').map(Number);
    const mDigits = month.split('').map(Number);
    const dDigits = day.split('').map(Number);
    const ySum = yDigits.reduce((a, b) => a + b, 0);
    const mSum = ySum + mDigits.reduce((a, b) => a + b, 0);
    const dSum = mSum + dDigits.reduce((a, b) => a + b, 0);

    const calc = (base, adds) => {
      const total = base + adds.reduce((a, b) => a + b, 0);
      const first = String(total).split('').reduce((a, b) => a + Number(b), 0);
      const second = first > 9 ? String(first).split('').reduce((a, b) => a + Number(b), 0) : null;
      return total < 10 ? `${total}` : second ? `${total}/${first}/${second}` : `${total}/${first}`;
    };

    const hStage = hour ? calc(dSum, hour.split('').map(Number)) : "--/--";
    const mStage = hour && minute ? calc(dSum + hour.split('').map(Number).reduce((a,b)=>a+b,0), minute.split('').map(Number)) : "--/--";

    return [
      calc(0, yDigits),
      calc(ySum, mDigits),
      calc(mSum, dDigits),
      hStage,
      mStage
    ];
  };

   const updateLunarInfo = (updated) => {
    try {
      const [y, m, d] = updated.date.split('-').map(Number);
      const lunar = Solar.fromYmd(y, m, d).getLunar();
      const lunarYMD = `${lunar.getYear()}-${String(lunar.getMonth()).padStart(2, '0')}-${String(lunar.getDay()).padStart(2, '0')}`;
      // ✅ 將月份名稱的簡體「闰」轉為繁體「閏」
      const lunarMonth = lunar.getMonthInChinese().replace("闰", "閏"); 
      const lunarTextFormatted = `農曆${lunar.getYear()}年${lunarMonth}月${lunar.getDayInChinese()}`;
      setLunarText(lunarTextFormatted);
     
      const lunarBornCode = lunarYMD.replace(/-/g, '') + (updated.hour || '') + (updated.minute || '');
      setLunarCode(`陰(-)${lunar.isLeapMonth ? '[閏]' : ''}${lunarBornCode}`);
      
      setLunarResults(calculateStages({
        date: lunarYMD,
        hour: updated.hour,
        minute: updated.minute
      }));
    } catch (err) {
      console.error("轉換農曆錯誤", err);
      setLunarText("");
      setLunarCode("");
      setLunarResults(["--/--", "--/--", "--/--", "--/--", "--/--"]);
    }
  };

  const handleInput = (type, value) => {
    setInput((prev) => ({ ...prev, [type]: value }));
  };

  const handleAnalyze = () => {
    if (!input.date) {
      setErrorMsg("請輸入完整日期");
      return;
    }
    setErrorMsg("");
    setIsAnalyzed(true);
    setResults(calculateStages(input));
    updateLunarInfo(input); // ✅ 確保農曆也被更新
};


  const exportPDF = () => {
    const element = document.getElementById('pdf-content');
    const opt = {
      margin: 0.5,
      filename: '靈魂五階段分析報告.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-200 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 text-center">靈魂五階段計算器</h1>
      
      {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}

      {/* 國曆輸入區塊 */}
<div className="bg-white p-4 rounded-xl shadow space-y-4">
  <h2 className="text-lg font-semibold text-purple-700">國曆輸入</h2>

  {/* 日期輸入 */}
  <input
    type="date"
    min="1911-01-01"
    max={new Date().toISOString().split("T")[0]}
    value={input.date}
    onChange={(e) => handleInput("date", e.target.value)}
    className="w-full border px-2 py-1 rounded text-sm"
  />

  {/* 時與分輸入 */}
  {["hour", "minute"].map((type) => (
    <div key={type}>
      <input
        type="text"
        inputMode="numeric"
        placeholder={type === "hour" ? "時 (00-23)" : "分 (00-59)"}
        maxLength={2}
        value={input[type] || ""}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          if (val.length <= 2) {
            setInput((prev) => ({ ...prev, [type]: val }));
          }
        }}
        onBlur={(e) => {
          let val = e.target.value;
          const num = Number(val);
          if (val === "") return;
          if (
            (type === "hour" && (isNaN(num) || num < 0 || num > 23)) ||
            (type === "minute" && (isNaN(num) || num < 0 || num > 59))
          ) {
            setErrorMsg(
              `請輸入有效的「${type === "hour" ? "時" : "分"}」：${type === "hour" ? "00~23" : "00~59"}`
            );
            setInput((prev) => ({ ...prev, [type]: "" }));
            return;
          }
          if (val.length === 1) val = "0" + val;
          setErrorMsg("");
          setInput((prev) => ({ ...prev, [type]: val }));
        }}
        className="w-full border px-2 py-1 rounded text-sm tracking-widest text-center"
      />
    </div>
  ))}

   {/* 🔘 閏月勾選（若有使用） */}
    <div className="flex flex-col space-y-2 mt-2">
      <label className="inline-flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          checked={input.leap}
          onChange={(e) => handleInput("leap", e.target.checked)}
        />
        <span>是否為閏月</span>
      </label>

      <button
        onClick={handleAnalyze}
        className="bg-purple-300 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
      >
        🔍 開始計算
      </button>
    </div>
    
  {/* ✅ 成功轉換後農曆提示 */}
  {lunarText && (
    <p className="text-sm text-gray-600 mt-2">📅 對應農曆日期：{lunarText}</p>
  )}

   {/* ⚠️ 無法轉換農曆的錯誤提示（可選） */}
  {!lunarText && isAnalyzed && (
    <p className="text-sm text-red-600 mt-2">⚠️ 無法取得農曆轉換結果，請確認輸入是否正確</p>
  )}
</div>

    {/* 分析內容區塊 */}
    {isAnalyzed && (
    <div id="pdf-content" className="flex flex-col md:flex-row gap-4">

      {/* 國曆分析結果 */}
      <div className="w-full md:w-1/2 bg-white p-4 rounded-xl shadow space-y-4"
      style={{ breakInside: "avoid" }}
      >
        <h2 className="text-lg font-semibold text-purple-700">國曆分析結果</h2>
        <div className="bg-blue-100 text-center p-2 rounded font-bold text-sm">
           先天數：陽(+){formatBornCode(input)}
        </div>

        {results.map((r, i) => {
          const labels = ["💜 晚年數", "💙 中年數", "🌟 主命數", "🧡 青年數", "🍼 幼年數"];
          const bgClass = i % 2 === 0 ? "bg-blue-50" : "bg-purple-50";
          const bornCode = formatBornCode(input);
          const level = determineSoulStageLevel(bornCode, r);
          return (
            <div key={i} className={`border rounded p-2 my-2 ${bgClass}`}>
              <p className="font-semibold">
                {labels[i]}：{r}
                {level && <span className="ml-2 text-sm text-purple-700">{level}</span>}
              </p>
            </div>
          );
        })}

        <p className="mt-2">靈魂年齡：{countSoulZeros(input)}</p>

        {/* 國曆後天數（只抓主命數） */}
        {(() => {
          const mainStage = results[2]; // 第三階段為主命數
          const parts = mainStage.split("/");
          let afterNumber = "";
          if (parts.length === 3) afterNumber = `${parts[0]}/${parts[1]}`;
          else if (parts.length === 2) afterNumber = `${parts[0]}`;
          return afterNumber ? (
            <p className="mt-2 text-sm text-purple-800 font-medium">
              🔎 後天數：{afterNumber}
            </p>
          ) : null;
        })()}

        <CoreDigitTable
          code={formatBornCode(input)}
          yearNum={parseInt(input.date?.match(/\d{4}/)?.[0]) || 2000}
        />
      </div>

      {/* 農曆分析結果 */}
        <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-xl shadow space-y-4"
        style={{ breakInside: "avoid" }}
        >
          <h2 className="text-lg font-semibold text-white">農曆分析結果</h2>
          <div className="bg-blue-400 text-center p-2 rounded font-bold text-sm text-white">
            先天數：{lunarCode}
          </div>
          
          {lunarResults.map((r, i) => {
            const labels = ["💜 晚年數", "💙 中年數", "🌟 主命數", "🧡 青年數", "🍼 幼年數"];
            const bgClass = i % 2 === 0 ? "bg-blue-700/10" : "bg-purple-700/10";
            const bornCode = lunarCode;
            const level = determineSoulStageLevel(bornCode, r);
            return (
              <div key={i} className={`border rounded p-2 my-2 ${bgClass}`}>
                <p className="font-semibold text-white">
                  {labels[i]}：{r}
                  {level && <span className="ml-2 text-sm text-yellow-200">{level}</span>}
                </p>
              </div>
            );
          })}
      
            <p className="mt-2 text-sm text-white">靈魂年齡：{countSoulZeros(input)}</p>

            {/* 顯示農曆後天數（只抓主命數） */}
            {(() => {
              const mainStage = lunarResults[2]; // 主命數在第三項
              const parts = mainStage.split("/");
              let afterNumber = "";
              if (parts.length === 3) afterNumber = `${parts[0]}/${parts[1]}`;
              else if (parts.length === 2) afterNumber = `${parts[0]}`;
              return afterNumber ? (
                <p className="mt-2 text-sm text-yellow-200 font-medium">
                  🔎 後天數：{afterNumber}
                </p>
              ) : null;
            })()}

          <CoreDigitTable
            code={lunarCode.replace(/[^\d]/g, '')}
            yearNum={parseInt(lunarText.match(/\d{4}/)?.[0]) || 1900}
            isDark={true}
          />

        </div>
      </div>
      )}
              
      {/* * PDF 匯出按鈕 */}
      <div className="text-center mt-6">
        <button
          onClick={exportPDF}
          className="bg-pink-200 hover:bg-pink-300 text-black font-bold py-2 px-6 rounded-full shadow-lg"
        >
          匯出 PDF
        </button>
      </div>
    </div>
  );
}

export default SoulStageApp;
