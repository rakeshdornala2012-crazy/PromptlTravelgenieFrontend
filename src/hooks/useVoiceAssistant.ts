import { useCallback, useEffect, useRef, useState } from "react";
import { chatWithVoya, VoyaMessage } from "@/lib/qwen";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface UseVoiceAssistantOptions {
  onSearch?: (query: string) => void;
}

export function useVoiceAssistant({ onSearch }: UseVoiceAssistantOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [history, setHistory] = useState<VoyaMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    synthRef.current.cancel();
    // Strip the [SEARCH: ...] tag before speaking
    const clean = text.replace(/\[SEARCH:.*?\]/g, "").trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.05;
    utt.pitch = 1;
    // Try to pick a good English voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
    ) ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
    if (preferred) utt.voice = preferred;
    utt.onend = () => {
      setState("idle");
      onEnd?.();
    };
    setState("speaking");
    synthRef.current.speak(utt);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setState("listening");
    setTranscript("");

    recognition.onresult = async (e: SpeechRecognitionEvent) => {
      const said = e.results[0][0].transcript;
      setTranscript(said);
      setState("thinking");

      try {
        const reply = await chatWithVoya(history, said);
        setLastReply(reply);

        const updatedHistory: VoyaMessage[] = [
          ...history,
          { role: "user", content: said },
          { role: "assistant", content: reply },
        ];
        setHistory(updatedHistory);

        // Check if Claude wants to trigger a search
        const searchMatch = reply.match(/\[SEARCH:\s*(.+?)\]/i);
        if (searchMatch && onSearch) {
          speak(reply, () => onSearch(searchMatch[1].trim()));
        } else {
          speak(reply);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Try again.");
        setState("idle");
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setError(`Mic error: ${e.error}`);
      setState("idle");
    };

    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

    recognition.start();
  }, [history, onSearch, speak, state]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    synthRef.current.cancel();
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setHistory([]);
    setTranscript("");
    setLastReply("");
    setError(null);
  }, [stopListening]);

  // Greet user on first open
  const greet = useCallback(() => {
    const greeting = "Hey! I'm Voya. Tell me where you'd like to go, your budget, and when — and I'll find the perfect trip.";
    setLastReply(greeting);
    speak(greeting);
  }, [speak]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      synthRef.current.cancel();
    };
  }, []);

  return {
    state,
    transcript,
    lastReply,
    history,
    error,
    startListening,
    stopListening,
    reset,
    greet,
  };
}