"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Star } from "lucide-react"

interface ProgressTrackerProps {
  totalLetters: number
  completedLetters: number
  currentStreak: number
  totalAttempts: number
  averageScore?: number
}

export function ProgressTracker({
  totalLetters,
  completedLetters,
  currentStreak,
  totalAttempts,
  averageScore = 0,
}: ProgressTrackerProps) {
  const progressPercentage = totalLetters > 0 ? Math.round((completedLetters / totalLetters) * 100) : 0

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg" style={{ color: "#2C3E50" }}>
          Progress Pembelajaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: "#2C3E50" }}>
              Huruf Selesai
            </span>
            <span className="text-sm text-gray-600">
              {completedLetters}/{totalLetters}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="text-center">
            <Badge
              variant={progressPercentage === 100 ? "default" : "secondary"}
              style={progressPercentage === 100 ? { backgroundColor: "#F1C40F", color: "#2C3E50" } : undefined}
            >
              {progressPercentage}% Selesai
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
              <span className="text-sm font-medium text-green-800">Selesai</span>
            </div>
            <div className="text-lg font-bold" style={{ color: "#2C3E50" }}>
              {completedLetters}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 mr-1 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Latihan</span>
            </div>
            <div className="text-lg font-bold" style={{ color: "#2C3E50" }}>
              {totalAttempts}
            </div>
          </div>
        </div>

        {/* Streak */}
        {currentStreak > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 mr-1" style={{ color: "#F1C40F" }} />
              <span className="text-sm font-medium" style={{ color: "#2C3E50" }}>
                Streak Belajar
              </span>
            </div>
            <div className="text-lg font-bold" style={{ color: "#2C3E50" }}>
              {currentStreak} hari
            </div>
          </div>
        )}

        {/* Average Score */}
        {averageScore > 0 && (
          <div className="text-center pt-2 border-t">
            <div className="text-sm text-gray-600 mb-1">Rata-rata Nilai</div>
            <div className="text-xl font-bold" style={{ color: "#2C3E50" }}>
              {averageScore}/100
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
