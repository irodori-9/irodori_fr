export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-xl mb-4">ページが見つかりません</h2>
      <p className="text-gray-600 mb-8 text-center">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <a 
        href="/" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        ホームに戻る
      </a>
    </div>
  )
}