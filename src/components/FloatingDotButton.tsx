"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import TanabotaPopup from "./TanabotaPopup"

export default function FloatingDotButton() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const handleButtonClick = () => {
    console.log('FloatingDotButton clicked!')
    console.log('Current isPopupOpen:', isPopupOpen)
    setIsPopupOpen(true)
    console.log('After setIsPopupOpen(true)')
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-[9997]">
        <button
          onClick={handleButtonClick}
          className="w-10 h-10 bg-red-500 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <MoreHorizontal size={20} className="text-white" />
        </button>
        <div className="text-xs bg-yellow-300 p-1 mt-1 rounded">
          State: {isPopupOpen.toString()}
        </div>
      </div>
      
      <TanabotaPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  )
}