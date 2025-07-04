"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Trophy,
  CheckCircle,
  X,
  ArrowRight,
  Zap,
  Target,
  Award,
  TrendingUp,
  Star,
  Timer,
  Brain,
  Lightbulb,
} from "lucide-react"
import GlassCard from "../GlassCard"
import { useCopyProtection } from "../../hooks/useCopyProtection"

interface Question {
  id: string
  question: string
  options: string[]
  timeLimit: number
  points: number
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  correctAnswer: number
}

interface PollQuestionsPageProps {
  roomCode: string
  onComplete?: () => void
}

const PollQuestionsPage: React.FC<PollQuestionsPageProps> = ({ roomCode, onComplete }) => {
  useCopyProtection(true);
  const [questions] = useState<Question[]>([
    {
      id: "1",
      question: "Which programming language is known as the 'language of the web'?",
      options: ["Python", "Java", "JavaScript", "C++"],
      timeLimit: 30,
      points: 100,
      difficulty: "Easy",
      category: "Programming",
      correctAnswer: 2,
    },
    {
      id: "2",
      question: "What does 'AI' stand for in technology?",
      options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Algorithmic Interface"],
      timeLimit: 25,
      points: 150,
      difficulty: "Medium",
      category: "Technology",
      correctAnswer: 1,
    },
    {
      id: "3",
      question: "Which company developed React.js?",
      options: ["Google", "Microsoft", "Facebook", "Apple"],
      timeLimit: 20,
      points: 200,
      difficulty: "Medium",
      category: "Programming",
      correctAnswer: 2,
    },
    {
      id: "4",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      timeLimit: 35,
      points: 250,
      difficulty: "Hard",
      category: "Computer Science",
      correctAnswer: 1,
    },
  ])

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 30)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)
  const [totalParticipants] = useState(47)
  const [answeredCount, setAnsweredCount] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // --- useEffect: timer logic ---
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isAnswered])

  // --- handleTimeUp ---
  const handleTimeUp = () => {
    setIsAnswered(true)
    setShowResult(true)
    setStreak(0) // Reset streak on timeout
    setTimeout(() => {
      nextQuestion()
    }, 3000)
  }

  // --- handleAnswerSelect ---
  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return

    setSelectedAnswer(answerIndex)
    setIsAnswered(true)
    setShowResult(true)
    setAnsweredCount(Math.floor(Math.random() * totalParticipants) + 20) // Simulate other participants

    const isCorrect = answerIndex === currentQuestion.correctAnswer
    if (isCorrect) {
      const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * 50)
      const totalPoints = currentQuestion.points + timeBonus
      setScore(score + totalPoints)
      setStreak(streak + 1)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      nextQuestion()
    }, 3000)
  }

  // --- nextQuestion ---
  const nextQuestion = () => {
    if (isLastQuestion) {
      onComplete?.()
      return
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setShowResult(false)
    setTimeLeft(questions[currentQuestionIndex + 1].timeLimit)
    setAnsweredCount(0)
  }

  // --- getDifficultyColor ---
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "from-green-500 to-emerald-500"
      case "Medium":
        return "from-yellow-500 to-orange-500"
      case "Hard":
        return "from-red-500 to-pink-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  // --- getTimerColor ---
  const getTimerColor = () => {
    if (timeLeft <= 5) return "text-red-400 animate-pulse"
    if (timeLeft <= 10) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-full px-6 py-2 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Live Session Active</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Interactive Poll</h1>
        {/* Show the room code here */}
        <p className="text-gray-400 truncate max-w-md mx-auto">{roomCode}</p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-primary-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-2xl font-bold text-white">{score}</span>
              </div>
              <p className="text-xs text-gray-400">Total Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-yellow-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-2xl font-bold text-white">{streak}</span>
              </div>
              <p className="text-xs text-gray-400">Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-2xl font-bold text-white">{totalParticipants}</span>
              </div>
              <p className="text-xs text-gray-400">Participants</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-400 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
              </div>
              <p className="text-xs text-gray-400">Progress</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4">
                <Brain className="w-32 h-32 text-white" />
              </div>
            </div>

            {/* Question Header */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                {/* Timer */}
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 ${getTimerColor()}`}>
                    <Timer className="w-6 h-6" />
                    <span className="font-bold text-3xl">{timeLeft}</span>
                    <span className="text-sm">sec</span>
                  </div>
                </div>

                {/* Question Info */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(currentQuestion.difficulty)} text-white text-sm font-medium`}
                  >
                    {currentQuestion.difficulty}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm">
                    {currentQuestion.category}
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="w-4 h-4" />
                    <span className="font-bold">{currentQuestion.points}</span>
                  </div>
                </div>
              </div>

              {/* Question Number & Text */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-full px-4 py-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-primary-400" />
                  <span className="text-primary-400 font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{currentQuestion.question}</h2>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = showResult && index === currentQuestion.correctAnswer
                  const isWrong = showResult && isSelected && !isCorrect
                  const optionLabels = ["A", "B", "C", "D"]

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                      whileHover={!isAnswered ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                        ${
                          isCorrect
                            ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20"
                            : isWrong
                              ? "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/20"
                              : isSelected
                                ? "bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/20"
                                : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 hover:shadow-lg"
                        }
                        ${isAnswered ? "cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      {/* Option Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`
                            w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                            ${
                              isCorrect
                                ? "bg-green-500 text-white"
                                : isWrong
                                  ? "bg-red-500 text-white"
                                  : isSelected
                                    ? "bg-primary-500 text-white"
                                    : "bg-white/10 text-gray-300 group-hover:bg-white/20"
                            }
                          `}
                          >
                            {optionLabels[index]}
                          </div>
                          <span
                            className={`
                            font-medium text-lg
                            ${
                              isCorrect
                                ? "text-green-400"
                                : isWrong
                                  ? "text-red-400"
                                  : isSelected
                                    ? "text-primary-400"
                                    : "text-white"
                            }
                          `}
                          >
                            {option}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {showResult && isCorrect && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1 text-green-400"
                            >
                              <CheckCircle className="w-6 h-6" />
                              <span className="font-bold">Correct!</span>
                            </motion.div>
                          )}
                          {showResult && isWrong && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1 text-red-400"
                            >
                              <X className="w-6 h-6" />
                              <span className="font-bold">Wrong</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Live Stats */}
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <GlassCard className="p-4 bg-white/5">
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>
                          {answeredCount}/{totalParticipants} answered
                        </span>
                      </div>
                      {selectedAnswer === currentQuestion.correctAnswer && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>
                            +{currentQuestion.points + Math.floor((timeLeft / currentQuestion.timeLimit) * 50)} points
                          </span>
                        </div>
                      )}
                      {streak > 1 && (
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Zap className="w-4 h-4" />
                          <span>{streak} streak!</span>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Next Question Button */}
              {isLastQuestion && isAnswered && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
                  <button
                    onClick={() => onComplete?.()}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg rounded-2xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Award className="w-6 h-6" />
                    <span>View Final Results</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default PollQuestionsPage
