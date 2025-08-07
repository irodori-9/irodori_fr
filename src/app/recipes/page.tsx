import { Heart } from "lucide-react"

const challenges = [
  {
    title: "ジュースを水に変える魔法",
    description: "レシピの説明：日々の小さな浪費を見直したい人！",
    status: "適用中",
    isActive: true,
    details: [
      {
        label: "貯金",
        items: ["毎月の収入の10%を貯蓄"],
        color: "bg-purple-100 text-purple-800",
      },
      {
        label: "節約",
        items: ["毎日の「余計な習慣支出」を1日おきに減らすチャレンジ", "減らした分は自動で「目標貯金」へ移動"],
        color: "bg-green-100 text-green-800",
      },
    ],
  },
  {
    title: "ヒヨコ貯金チャレンジ",
    description: "レシピの説明：日々の小さな浪費を見直したい人！",
    status: "適用中",
    isActive: false,
    details: [
      {
        label: "貯金",
        items: [
          "月末に残った金額の10%を「おつり貯金」",
          "毎週500円ずつ自動で貯金",
          "支出の1%を自動で貯金",
          "(例: コンビニで300円→3円貯金)",
        ],
        color: "bg-purple-100 text-purple-800",
      },
      {
        label: "節約",
        items: ["お昼のランチ代を700円以内にする"],
        color: "bg-green-100 text-green-800",
      },
    ],
  },
  {
    title: "WHY 浪費 PEOPLE !? 🔥",
    description: "レシピの説明：ストイックに節約し資産形成！",
    isActive: false,
    details: [
      {
        label: "貯金",
        items: ["推し活・好き活ごとに使った金額の10%を貯金"],
        color: "bg-purple-100 text-purple-800",
      },
      {
        label: "投資",
        items: ["毎月の給与から30,000円をNISAで全世界株式を購入"],
        color: "bg-blue-100 text-blue-800",
      },
      {
        label: "節約",
        items: ["お昼のランチ代を500円以内にする", "コンビニでつい買ってしまうお菓子の購入は禁止"],
        color: "bg-green-100 text-green-800",
      },
    ],
  },
]

const PunchHoleSidebar = () => (
  <div className="w-16 bg-slate-100 rounded-l-2xl flex flex-col items-center justify-around py-4 border-r border-slate-200">
    {Array(6)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="w-5 h-5 bg-white rounded-full ring-1 ring-slate-200/50" />
      ))}
  </div>
)

export default function RecipesPage() {
  return (
    <div className="space-y-4">
      {challenges.map((challenge, index) => (
        <div
          key={index}
          className={`flex rounded-2xl overflow-hidden border-2 transition-all ${
            challenge.isActive ? "border-purple-400 shadow-lg shadow-purple-400/40" : "border-transparent shadow-md"
          }`}
        >
          <PunchHoleSidebar />
          <div className="flex-1 bg-white p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg text-gray-800">{challenge.title}</h3>
              {challenge.status && (
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    challenge.isActive ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {challenge.status}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-4">{challenge.description}</p>

            <div className="space-y-2">
              {challenge.details.map((detail, i) => (
                <div key={i} className={`${detail.color} p-3 rounded-lg`}>
                  <p className="text-xs font-bold">{detail.label}</p>
                  <ul className="mt-1 space-y-1">
                    {detail.items.map((item, j) => (
                      <li key={j} className="text-sm font-medium text-gray-800 list-disc list-inside">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              <Heart className="text-purple-400 fill-current" size={18} />
              <span className="text-sm font-semibold text-purple-600">いいね</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
