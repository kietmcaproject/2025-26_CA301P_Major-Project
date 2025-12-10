import { useState, useRef, useEffect } from "react"
import { Copy, Download, Upload } from "lucide-react"
import React from "react"

// Card Components
const Card = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

const CardContent = ({ className = "", children, ...props }) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  )
}

// Button Component
const Button = ({ 
  variant = "default", 
  size = "default", 
  className = "", 
  children, 
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Main CodeEditor Component
export function CodeEditor({ language, initialCode, onCodeChange }) {
  const [code, setCode] = useState(initialCode || "")
  const [lineNumbers, setLineNumbers] = useState([1])
  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)

  // Update line numbers when code changes
  useEffect(() => {
    const lines = code.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }, [code])

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleCodeChange = (newCode) => {
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newCode = code.substring(0, start) + "    " + code.substring(end)
      handleCodeChange(newCode)

      // Set cursor position after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4
      }, 0)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const downloadCode = () => {
    const extension = language === "python" ? "py" : language === "java" ? "java" : "c"
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `solution.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const uploadCode = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".py,.java,.c,.txt"
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result
          if (typeof content === 'string') {
            handleCodeChange(content)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const getLanguageComment = () => {
    switch (language) {
      case "python":
        return "# Write your Python solution here"
      case "java":
        return "// Write your Java solution here"
      case "c":
        return "/* Write your C solution here */"
      default:
        return "// Write your solution here"
    }
  }

  const getLanguageDisplay = () => {
    switch (language) {
      case "python":
        return "Python 3"
      case "java":
        return "Java"
      case "c":
        return "C"
      default:
        return language?.charAt(0).toUpperCase() + language?.slice(1) || "Code"
    }
  }

  return (
    <Card className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {getLanguageDisplay()}
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Lines: {lineNumbers.length}</span>
            <span>•</span>
            <span>Chars: {code.length}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={uploadCode}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            title="Upload file"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToClipboard}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {/* <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadCode}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </Button> */}
        </div>
      </div>

      {/* Editor Content */}
      <CardContent className="p-0 flex-1 flex">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 px-3 py-4 text-right overflow-hidden select-none"
          style={{ width: "60px" }}
        >
          {lineNumbers.map((num) => (
            <div
              key={num}
              className="text-xs text-gray-400 dark:text-gray-500 font-mono leading-6"
              style={{ height: "24px" }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="w-full h-full resize-none border-none outline-none bg-transparent font-mono text-sm text-gray-900 dark:text-gray-100 p-4 leading-6 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder={getLanguageComment()}
            spellCheck={false}
            style={{
              tabSize: 4,
              lineHeight: "24px",
            }}
          />
        </div>
      </CardContent>

      {/* Status Bar */}
      <div className="bg-gray-50/30 dark:bg-gray-800/30 px-4 py-2 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>UTF-8</span>
            <span>Spaces: 4</span>
            <span className="capitalize">{language || "code"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Default export
export default CodeEditor
