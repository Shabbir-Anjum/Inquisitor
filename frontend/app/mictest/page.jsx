'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Head from 'next/head';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Lottie from 'react-lottie';

const AgentTalk = () => {
  const [animationData, setAnimationData] = useState(null);
  const email = useSelector((state) => state.chat.email);
  const { id } = useParams();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [agentName, setAgentName] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const audioRef = useRef(null);
  const [agentId, setAgentId] = useState(null);
  const [token, setToken] = useState(null);
  const hasGreetingRun = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const silenceTimer = useRef(null);
  const lastSpeechTime = useRef(Date.now());

  // Modified speech recognition setup with better silence detection
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        if (isListening) {
          recognitionRef.current.start(); // Restart if still supposed to be listening
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          stopListening();
        }
      };

      recognitionRef.current.onresult = (event) => {
        const latestResult = event.results[event.results.length - 1];
        if (latestResult.isFinal) {
          const finalTranscript = latestResult[0].transcript.trim();
          setTranscript(finalTranscript);
          lastSpeechTime.current = Date.now();
          
          // Clear any existing timeouts
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
          }
          
          // Set new timeout for silence detection
          silenceTimer.current = setTimeout(async () => {
            const timeSinceLastSpeech = Date.now() - lastSpeechTime.current;
            if (timeSinceLastSpeech >= 1500) { // 1.5 seconds of silence
              await sendTranscriptToBackend(finalTranscript);
            }
          }, 1500);
        }
      };
    }

    return () => {
      stopListening();
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
      }
    };
  }, [isListening]);

  const startListening = async () => {
    try {
      // Initialize audio context on user interaction
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      recognitionRef.current?.start();
      setIsListening(true);
      lastSpeechTime.current = Date.now();
    } catch (error) {
      console.error("Error starting microphone:", error);
      setShowAlert(true);
      setAlertMessage("Could not access microphone. Please check permissions.");
      stopListening();
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const generateSpeech = async (text) => {
    try {
      setIsSpeaking(true);
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}/stream`,
        {
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': process.env.NEXT_PUBLIC_XI_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        // Add event listeners for audio
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl); // Clean up the URL
        };

        audioRef.current.onerror = () => {
          console.error('Audio playback error');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        try {
          await audioRef.current.play();
        } catch (playError) {
          console.error('Playback error:', playError);
          setShowAlert(true);
          setAlertMessage("Click 'Start Conversation' to enable audio playback");
        }
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setShowAlert(true);
      setAlertMessage("Error generating speech. Please try again.");
      setIsSpeaking(false);
    }
  };

  const greeting = useCallback(async () => {
    if (!agentId || !token || hasGreetingRun.current) return;
    
    try {
      hasGreetingRun.current = true;
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/console/sync/${agentId}/`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "insomnia/9.3.2",
          Authorization: `JWT ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      if (responseData.ai_text) {
        await generateSpeech(responseData.ai_text);
      }
    } catch (error) {
      console.error('Error in greeting:', error);
      setShowAlert(true);
      setAlertMessage("Error starting conversation. Please try again.");
      hasGreetingRun.current = false;
    }
  }, [agentId, token]);

  return (
    <>
      <Head>
        <title>{agentName} - Agent Talk</title>
      </Head>
      <div className="flex flex-col items-center gap-5 justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">{agentName}</h1>
        <div className="w-96 h-96 rounded-full overflow-hidden mb-6">
          {/* <Lottie 
            options={{ 
              ...defaultOptions, 
              animationData 
            }} 
            height={400} 
            width={400} 
          /> */}
        </div>
        <div className="mb-8">
          <button
            onClick={toggleListening}
            className={`w-full py-3 px-4 rounded-lg ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
            disabled={isSpeaking}
          >
            {isListening ? 'Stop Conversation' : 'Start Conversation'}
          </button>
        </div>
        <audio ref={audioRef} className="hidden" />
        {showAlert && (
          <div className="mt-4 p-4 bg-red-600 text-white rounded-lg">
            <p>{alertMessage}</p>
          </div>
        )}
        {transcript && (
          <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
            <h3 className="font-bold">Transcript:</h3>
            <p>{transcript}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AgentTalk;