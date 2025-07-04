"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckSquare,
  ToggleLeft,
  Edit,
  BarChart3,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Send,
} from "lucide-react"
import GlassCard from "../components/GlassCard"
import DashboardLayout from "../components/DashboardLayout"

interface PollOption {
  id: string
  text: string
}

interface PollData {
  title: string
  types: "mcq" | "truefalse" | "shortanswer" | "opinion"
  options: PollOption[]
  timerEnabled: boolean
  timerDuration: number
  timerUnit: "seconds" | "minutes"
  shortAnswerPlaceholder?: string
  correctAnswer?: string // id of the correct option for MCQ/TrueFalse
}

interface ValidationErrors {
  title?: string
  options?: string
  timer?: string
}

const CreateManualPoll = () => {
  const [pollData, setPollData] = useState<PollData>({
    title: "",
    types: "mcq",
    options: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" },
    ],
    timerEnabled: false,
    timerDuration: 30,
    timerUnit: "seconds",
    shortAnswerPlaceholder: "",
    correctAnswer: undefined,
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const questionTypes = [
    { id: "mcq", label: "Multiple Choice", icon: CheckSquare, description: "A, B, C, D options" },
    { id: "truefalse", label: "True/False", icon: ToggleLeft, description: "Yes or No question" },
    { id: "shortanswer", label: "Short Answer", icon: Edit, description: "Text response" },
    { id: "opinion", label: "Opinion Poll", icon: BarChart3, description: "Rating scale" },
  ]

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Validate title
    if (!pollData.title.trim()) {
      newErrors.title = "Poll question is required"
    }

    // Validate options for MCQ
    if (pollData.types === "mcq") {
      const filledOptions = pollData.options.filter((opt) => opt.text.trim())
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options are required for multiple choice"
      } else {
        const texts = filledOptions.map((opt) => opt.text.trim().toLowerCase())
        const uniqueTexts = new Set(texts)
        if (uniqueTexts.size !== texts.length) {
          newErrors.options = "All options must be unique for multiple choice"
        }
      }
    }

    // Validate options for Opinion
    if (pollData.types === "opinion") {
      const filledOptions = pollData.options.filter((opt) => opt.text.trim())
      if (filledOptions.length < 2) {
        newErrors.options = "At least 2 options are required for opinion poll"
      } else {
        const texts = filledOptions.map((opt) => opt.text.trim().toLowerCase())
        const uniqueTexts = new Set(texts)
        if (uniqueTexts.size !== texts.length) {
          newErrors.options = "All options must be unique for opinion poll"
        }
      }
    }

    // Validate timer
    if (pollData.timerEnabled && pollData.timerDuration <= 0) {
      newErrors.timer = "Timer duration must be greater than 0"
    }

    // Require correct answer for MCQ and True/False
    if ((pollData.types === "mcq" || pollData.types === "truefalse")) {
      if (!pollData.correctAnswer || !pollData.options.some(opt => opt.text.trim() === pollData.correctAnswer?.trim())) {
        newErrors.options = "Please enter the correct answer exactly as one of the options above before creating the poll"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
  console.log(pollData);
  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    const response = await fetch("http://localhost:5001/save_manual_poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pollData),
    });

    if (!response.ok) {
      throw new Error("Failed to save poll");
    }

    // const result = await response.json();
    console.log("Manual Poll saved");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setPollData({
        title: "",
        types: "mcq",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        timerEnabled: false,
        timerDuration: 30,
        timerUnit: "seconds",
        shortAnswerPlaceholder: "",
      });
      setErrors({});
    }, 3000);
  } catch (err) {
    console.error("❌ Error submitting poll:", err);
    alert("Failed to submit poll");
  } finally {
    setIsSubmitting(false);
  }
};


  const updateOption = (id: string, text: string) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, text } : opt)),
    }))
  }

  const addOption = () => {
    const newId = String.fromCharCode(97 + pollData.options.length) // a, b, c, d, e, f...
    setPollData((prev) => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "" }],
    }))
  }

  const removeOption = (id: string) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }))
  }

  const handleTypeChange = (newType: PollData["types"]) => {
    let newOptions: PollOption[] = []

    switch (newType) {
      case "mcq":
        newOptions = [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ]
        break
      case "truefalse":
        newOptions = [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ]
        break
      case "shortanswer":
        newOptions = []
        break
      case "opinion":
        newOptions = [
          { id: "1", text: "" },
          { id: "2", text: "" },
        ]
        break
    }

    setPollData((prev) => ({
      ...prev,
      type: newType,
      options: newOptions,
      shortAnswerPlaceholder: newType === "shortanswer" ? "" : undefined,
      correctAnswer: undefined,
    }))
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Create Manual Poll</h1>
            <p className="text-gray-400">Design and launch your custom poll question</p>
          </motion.div>

          {/* Success Alert */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="mb-6"
              >
                <GlassCard className="p-4 border-green-500/30 bg-green-500/10">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Poll created successfully!</span>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Poll Question */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <label className="block text-lg font-semibold text-white">Poll Question</label>
                    <div className="relative">
                      <textarea
                        value={pollData.title}
                        onChange={(e) => {
                          setPollData((prev) => ({ ...prev, title: e.target.value }))
                          if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
                        }}
                        placeholder="Type your question here..."
                        rows={3}
                        className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 ${errors.title ? "border-red-500/50" : "border-white/10"
                          }`}
                      />
                      {errors.title && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-2 mt-2 text-red-400 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.title}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Question Type Selector */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <label className="block text-lg font-semibold text-white">Question Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {questionTypes.map((type) => {
                        const isSelected = pollData.types === type.id
                        const Icon = type.icon

                        return (
                          <motion.button
                            key={type.id}
                            onClick={() => handleTypeChange(type.id as PollData["types"])}
                            className={`p-4 rounded-lg border transition-all duration-200 text-left ${isSelected
                                ? "bg-primary-500/20 text-primary-400 border-primary-500/30 shadow-lg shadow-primary-500/20"
                                : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10"
                              }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${isSelected ? "bg-primary-500/30" : "bg-white/10"}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm opacity-75">{type.description}</div>
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Dynamic Options Based on Question Type */}
              <AnimatePresence>
                {(pollData.types === "mcq" ||
                  pollData.types === "truefalse" ||
                  pollData.types === "shortanswer" ||
                  pollData.types === "opinion") && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -20, height: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <GlassCard className="p-6">
                        <div className="space-y-4">
                          {/* MCQ Options */}
                          {pollData.types === "mcq" && (
                            <>
                              <div className="flex items-center justify-between">
                                <label className="block text-lg font-semibold text-white">Answer Options</label>
                                {pollData.options.length < 6 && (
                                  <motion.button
                                    onClick={addOption}
                                    className="flex items-center space-x-2 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30 hover:bg-primary-500/30 transition-colors duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm">Add Option</span>
                                  </motion.button>
                                )}
                              </div>

                              <div className="space-y-3">
                                {pollData.options.map((option, index) => (
                                  <motion.div
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="flex items-center space-x-3"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                      {option.id.toUpperCase()}
                                    </div>
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={e => {
                                        updateOption(option.id, e.target.value)
                                        if (errors.options && pollData.types === "mcq") {
                                          const filledOptions = pollData.options.map(opt => opt.id === option.id ? e.target.value : opt.text).filter(text => text.trim())
                                          const texts = filledOptions.map(text => text.trim().toLowerCase())
                                          const uniqueTexts = new Set(texts)
                                          if (filledOptions.length < 2) {
                                            setErrors(prev => ({ ...prev, options: "At least 2 options are required for multiple choice" }))
                                          } else if (uniqueTexts.size !== texts.length) {
                                            setErrors(prev => ({ ...prev, options: "All options must be unique for multiple choice" }))
                                          } else {
                                            setErrors(prev => ({ ...prev, options: undefined }))
                                          }
                                        }
                                      }}
                                      placeholder={`Option ${option.id.toUpperCase()}`}
                                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                                    />
                                    {pollData.options.length > 2 && (
                                      <motion.button
                                        onClick={() => removeOption(option.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </motion.button>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-white mb-1">What is the correct answer?</label>
                                <input
                                  type="text"
                                  value={pollData.correctAnswer || ""}
                                  onChange={e => {
                                    setPollData(prev => ({ ...prev, correctAnswer: e.target.value }))
                                    if (errors.options && pollData.options.some(opt => opt.text.trim() === e.target.value.trim())) {
                                      setErrors(prev => ({ ...prev, options: undefined }))
                                    }
                                  }}
                                  placeholder="Type the correct answer exactly as one of the options"
                                  className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 ${errors.options ? "border-red-500/50" : "border-white/10"}`}
                                />
                                <div className="text-xs text-gray-400 mt-1">Enter the correct answer exactly as it appears in the options above.</div>
                              </div>
                            </>
                          )}

                          {/* True/False Options */}
                          {pollData.types === "truefalse" && (
                            <>
                              <label className="block text-lg font-semibold text-white">Answer Options</label>
                              <div className="space-y-3">
                                {pollData.options.map((option) => (
                                  <div key={option.id} className="flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${option.id === "true" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-rose-500"}`}>{option.id === "true" ? "T" : "F"}</div>
                                    <span className="text-white font-medium">{option.text}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-white mb-1">What is the correct answer?</label>
                                <input
                                  type="text"
                                  value={pollData.correctAnswer || ""}
                                  onChange={e => {
                                    setPollData(prev => ({ ...prev, correctAnswer: e.target.value }))
                                    if (errors.options && pollData.options.some(opt => opt.text.trim() === e.target.value.trim())) {
                                      setErrors(prev => ({ ...prev, options: undefined }))
                                    }
                                  }}
                                  placeholder="Type the correct answer exactly as one of the options (True or False)"
                                  className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 ${errors.options ? "border-red-500/50" : "border-white/10"}`}
                                />
                                <div className="text-xs text-gray-400 mt-1">Enter the correct answer exactly as it appears in the options above.</div>
                              </div>
                            </>
                          )}

                          {/* Short Answer */}
                          {pollData.types === "shortanswer" && (
                            <>
                              <label className="block text-lg font-semibold text-white">Answer Configuration</label>
                              <div className="space-y-3">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <Edit className="w-5 h-5 text-primary-400" />
                                    <span className="text-white font-medium">Text Response Field</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={pollData.shortAnswerPlaceholder || ""}
                                    onChange={(e) =>
                                      setPollData((prev) => ({ ...prev, shortAnswerPlaceholder: e.target.value }))
                                    }
                                    placeholder="Enter placeholder text for answer field..."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                                  />
                                  <p className="text-gray-400 text-sm mt-2">
                                    Students will see a text input with this placeholder
                                  </p>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Opinion Poll */}
                          {pollData.types === "opinion" && (
                            <>
                              <div className="flex items-center justify-between">
                                <label className="block text-lg font-semibold text-white">Opinion Options</label>
                                {pollData.options.length < 4 && (
                                  <motion.button
                                    onClick={addOption}
                                    className="flex items-center space-x-2 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30 hover:bg-primary-500/30 transition-colors duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm">Add Opinion</span>
                                  </motion.button>
                                )}
                              </div>

                              <div className="space-y-3">
                                {pollData.options.map((option, index) => (
                                  <motion.div
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="flex items-center space-x-3"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => updateOption(option.id, e.target.value)}
                                      placeholder={`Opinion ${index + 1}`}
                                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                                    />
                                    {pollData.options.length > 2 && (
                                      <motion.button
                                        onClick={() => removeOption(option.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </motion.button>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </>
                          )}

                          {errors.options && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center space-x-2 text-red-400 text-sm"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.options}</span>
                            </motion.div>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Timer Settings */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <label className="block text-lg font-semibold text-white">Timer Settings</label>

                    {/* Timer Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Enable Timer</span>
                      </div>
                      <motion.button
                        onClick={() => setPollData((prev) => ({ ...prev, timerEnabled: !prev.timerEnabled }))}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${pollData.timerEnabled ? "bg-primary-500" : "bg-gray-600"
                          }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                          animate={{ x: pollData.timerEnabled ? 24 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </div>

                    {/* Timer Duration */}
                    <AnimatePresence>
                      {pollData.timerEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="number"
                            value={pollData.timerDuration}
                            onChange={(e) =>
                              setPollData((prev) => ({ ...prev, timerDuration: Number.parseInt(e.target.value) || 0 }))
                            }
                            min="1"
                            className={`w-20 px-3 py-2 bg-white/5 border rounded-lg text-white text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 ${errors.timer ? "border-red-500/50" : "border-white/10"
                              }`}
                          />
                          <select
                            value={pollData.timerUnit}
                            onChange={(e) =>
                              setPollData((prev) => ({ ...prev, timerUnit: e.target.value as "seconds" | "minutes" }))
                            }
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                          >
                            <option value="seconds" className="bg-gray-800">Seconds</option>
                            <option value="minutes" className="bg-gray-800">Minutes</option>
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errors.timer && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.timer}</span>
                      </motion.div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="sticky top-6"
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>

                  <div className="space-y-4">
                    {/* Preview Question */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white font-medium">{pollData.title || "Your question will appear here..."}</p>
                      
                    </div>
                    
                    {/* Preview Options */}
                    {pollData.types === "mcq" && (
                      <div className="space-y-2">
                        {pollData.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                            <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded text-white text-xs flex items-center justify-center font-bold">
                              {option.id.toUpperCase()}
                            </div>
                            <span className="text-gray-300 text-sm">
                              {option.text || `Option ${option.id.toUpperCase()}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {pollData.types === "truefalse" && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                          <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">
                            T
                          </div>
                          <span className="text-gray-300 text-sm">True</span>
                        </div>
                        <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                          <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                            F
                          </div>
                          <span className="text-gray-300 text-sm">False</span>
                        </div>
                      </div>
                    )}

                    {pollData.types === "shortanswer" && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <input
                          type="text"
                          placeholder={pollData.shortAnswerPlaceholder || "Type your answer here..."}
                          disabled
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-gray-400 text-sm"
                        />
                      </div>
                    )}

                    {pollData.types === "opinion" && (
                      <div className="space-y-2">
                        {pollData.options.map((option, index) => (
                          <div key={option.id} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <span className="text-gray-300 text-sm">{option.text || `Opinion ${index + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preview Timer */}
                    {pollData.timerEnabled && (
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {pollData.timerDuration} {pollData.timerUnit}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span>{isSubmitting ? "Creating..." : "Create Poll"}</span>
                    </div>
                  </motion.button>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CreateManualPoll
