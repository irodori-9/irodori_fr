"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Receipt } from "lucide-react"
import Image from "next/image"

interface TanabotaPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function TanabotaPopup({ isOpen, onClose }: TanabotaPopupProps) {
  console.log('TanabotaPopup render - isOpen:', isOpen)
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed inset-x-4 top-20 z-[9999] mx-auto max-w-sm"
          >
            <div className="bg-gradient-to-b from-purple-500 to-purple-600 rounded-t-3xl p-4">
              <h2 className="text-white font-bold text-center text-lg">たなぼた!</h2>
            </div>
            
            <div className="bg-white rounded-b-3xl p-6 space-y-6">
              <div className="text-center">
                <p className="font-bold text-gray-800 mb-4">今日も推し事お疲れ様プヒ！</p>
                
                <div className="mb-4">
                  <Image src="/piggy-bank.png" alt="TANABOTA character" width={80} height={80} className="mx-auto" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-6">TANABOTAされました！</h3>
              </div>
              
              <div className="bg-purple-100 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Receipt className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">2025/07/01</p>
                    <p className="font-bold text-gray-800">ちけっとふくだま</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">+¥2,000</p>
                  <p className="text-sm text-gray-600 mt-1">貯金口座に追加</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-2xl"
              >
                かくにん
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}