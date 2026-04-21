'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Sparkles, Zap, Brain } from 'lucide-react'

interface Model {
  id: string
  name: string
  provider: string
  description: string
  icon: React.ReactNode
}

const models: Model[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Best for complex reasoning',
    icon: <Brain className="w-4 h-4" />
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Fast multimodal',
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'Anthropic',
    description: 'Long context expert',
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable',
    icon: <Brain className="w-4 h-4" />
  }
]

interface ModelSelectorProps {
  selectedModel: string
  onSelect: (modelId: string) => void
  aiEnabled: boolean
  onToggleAI: (enabled: boolean) => void
}

export function ModelSelector({ 
  selectedModel, 
  onSelect, 
  aiEnabled,
  onToggleAI 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentModel = models.find(m => m.id === selectedModel) || models[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center gap-2">
      {/* AI Toggle */}
      <button
        onClick={() => onToggleAI(!aiEnabled)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          aiEnabled 
            ? 'bg-primary/10 text-primary hover:bg-primary/20' 
            : 'bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title={aiEnabled ? 'AI is on' : 'AI is off'}
      >
        <Sparkles className={`w-4 h-4 ${aiEnabled ? 'animate-pulse' : ''}`} />
        <span className="hidden sm:inline">{aiEnabled ? 'AI On' : 'AI Off'}</span>
      </button>

      {/* Model Selector */}
      {aiEnabled && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            {currentModel.icon}
            <span className="hidden sm:inline">{currentModel.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelect(model.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-muted transition-colors ${
                    selectedModel === model.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="mt-0.5">{model.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
