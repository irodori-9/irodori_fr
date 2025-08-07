import { ChevronRight, Tv, Music, Coffee } from "lucide-react"
import Image from "next/image"

const categories = ["アニメ", "アイドル", "コラボカフェ"]
const newsItems = [
  {
    tag: "アニメ",
    title: "限定アクリルスタンド",
    description: "世代を超えて愛される「サンリオキャラクターズ」のアクリルキーホルダー...",
    icon: Tv,
  },
  {
    tag: "アイドル",
    title: "ファンミーティング",
    description: "ITZYが、ファンミーティング「ITZY The 4th Fan Meeting...」を開催する...",
    icon: Music,
  },
  {
    tag: "コラボカフェ",
    title: "コラボカフェ",
    description: "YouTubeアニメ「混血のカレコレ」のコラボカフェを開催します...",
    icon: Coffee,
  },
]

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3">
        {categories.map((cat, index) => (
          <button
            key={cat}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              index === 1 ? "bg-green-400 text-white shadow-md" : "bg-white/80 text-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <div key={index} className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <item.icon size={32} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.tag === "アニメ" 
                      ? "bg-purple-200 text-purple-800" 
                      : item.tag === "アイドル"
                      ? "bg-green-200 text-green-800"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {item.tag}
                </span>
                <h3 className="font-bold mt-1">{item.title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-sm font-bold text-purple-700 flex items-center justify-end gap-1">
                開く <ChevronRight size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
