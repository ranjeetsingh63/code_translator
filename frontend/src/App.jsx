import { useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";

const languages = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Kotlin",
  "Swift",
];

const getMonacoLanguage = (language) => {
  const languageMap = {
    Python: "python",
    JavaScript: "javascript",
    TypeScript: "typescript",
    Java: "java",
    C: "c",
    "C++": "cpp",
    "C#": "csharp",
    Go: "go",
    Rust: "rust",
    PHP: "php",
    Ruby: "ruby",
    Kotlin: "kotlin",
    Swift: "swift",
  };

  return languageMap[language] || "plaintext";
};

function App() {
  const [sourceLanguage, setSourceLanguage] = useState("Swift");
  const [targetLanguage, setTargetLanguage] = useState("C++");

  const [darkMode, setDarkMode] = useState(true);

  const [sourceCode, setSourceCode] = useState("");
  const [translatedCode, setTranslatedCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);


const translateCode = async () => {
  if (!sourceCode.trim()) {
    setError("Please enter some source code.");
    return;
  }

  if (sourceLanguage === targetLanguage) {
    setError("Source and target languages must be different.");
    return;
  }

  setLoading(true);
  setError("");
  setCopied(false);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/translate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_language: sourceLanguage,
          target_language: targetLanguage,
          code: sourceCode,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Translation failed."
      );
    }

    setTranslatedCode(data.translated_code);

  } catch (error) {
    console.error("Translation error:", error);

    setError(
      error.message ||
      "Something went wrong while translating."
    );

  } finally {
    setLoading(false);
  }
};


 const copyCode = async () => {
  if (!translatedCode.trim()) {
    setError("There is no translated code to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(translatedCode);

    setCopied(true);
    setError("");

    setTimeout(() => {
      setCopied(false);
    }, 2000);

  } catch (error) {
    console.error("Copy error:", error);
    setError("Failed to copy code.");
  }
};
  return (
    <div className={darkMode ? "app dark" : "app light"}>

      {/* Header */}
      <header className="app-header">

        <div className="header-content">

          <h1>AI Code Translator</h1>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </div>

      </header>

      <main className="translator-container">

        {/* Language Selection */}
        <section className="language-section">

          <div className="language-box">

            <label htmlFor="source-language">
              Source Language
            </label>

            <select
              id="source-language"
              value={sourceLanguage}
              onChange={(e) =>
                setSourceLanguage(e.target.value)
              }
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

          </div>

          <div className="swap-placeholder">
            →
          </div>

          <div className="language-box">

            <label htmlFor="target-language">
              Target Language
            </label>

            <select
              id="target-language"
              value={targetLanguage}
              onChange={(e) =>
                setTargetLanguage(e.target.value)
              }
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* Editors */}
        <section className="editor-section">

          {/* Source Editor */}
          <div className="editor-wrapper">

            <div className="editor-header">
              <span>Source Code</span>
            </div>

            <Editor
              height="500px"
              language={getMonacoLanguage(sourceLanguage)}
              value={sourceCode}
              onChange={(value) =>
                setSourceCode(value || "")
              }
              theme={darkMode ? "vs-dark" : "light"}
              options={{
                minimap: {
                  enabled: false,
                },
                fontSize: 14,
                automaticLayout: true,
                padding: {
                  top: 15,
                },
              }}
            />

          </div>

          {/* Translated Editor */}
        <div className="editor-wrapper">

          <div className="editor-header">
            <span>Translated Code</span>

            <button
          className="copy-button"
          onClick={copyCode}
          disabled={!translatedCode.trim() || copied}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
          </div>

          <Editor
            height="500px"
            language={getMonacoLanguage(targetLanguage)}
            value={translatedCode}
            theme={darkMode ? "vs-dark" : "light"}
            options={{
              readOnly: true,

              minimap: {
                enabled: false,
              },

              fontSize: 14,

              automaticLayout: true,

              padding: {
                top: 15,
              },

              cursorBlinking: "solid",
            }}
          />

        </div>

        </section>

        {/* Translate Button */}
        <div className="translate-section">
          <button
            className="translate-button"
            onClick={translateCode}
            disabled={loading}
          >
            {loading ? "Translating..." : "Translate Code"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

      </main>

    </div>
  );
}

export default App;