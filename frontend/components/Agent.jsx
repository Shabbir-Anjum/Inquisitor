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
 
 
          setTimeout(function () {
  
            sendTranscriptToBackend(finalTranscript);
          }, 1000);
          
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
        generateSpeech(responseData.ai_text);
      } else {
        console.error('AI text not found in the response');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      }
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      hasGreetingRun.current = false;
    }
  }, [agentId, token]);

 
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: null, // This will be set later with the fetched JSON data
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  useEffect(()=>{
    fetch('https://lottie.host/3ddc7b2c-c80b-41ac-b690-8e6d9472ebb8/vouBmvBfoT.json')
    .then(response => response.json())
    .then(data => setAnimationData(data));

    const storedAgentId = localStorage.getItem("currentAgentId");
    const storedAgentName = localStorage.getItem('currentAgentName');
    const storedToken = localStorage.getItem("access");
    const storedVoiceId = localStorage.getItem('voiceID');
    
    if (storedVoiceId) {
      setSelectedVoice(storedVoiceId);
    }
    
    setAgentId(storedAgentId);
    setAgentName(storedAgentName || "unknown");
    setToken(storedToken);
  },[])


  useEffect(() => {
    if (agentId && token && !hasGreetingRun.current) {
      greeting();
    }
  }, [agentId, token, greeting]);

  const sendTranscriptToBackend = async (text) => {
    if (!text.trim() || !agentId || !token) return;
    console.log(text)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/console/talk/${agentId}/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "insomnia/9.3.2",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          "email": email,
          "human_text": text.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      if (responseData.ai_text) {
        await generateSpeech(responseData.ai_text);
      } else {
        throw new Error('AI text not found in the response');
      }
    } catch (error) {
      console.error('Error sending text to backend:', error);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const generateSpeech = async (text) => {
    try {
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
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return (
    <>
      <Head>
        <title>{agentName} - Agent Talk</title>
      </Head>
      <div className="flex flex-col items-center gap-5 justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">{agentName}</h1>
        <div className="w-96 h-96 rounded-full overflow-hidden mb-6">
          <Lottie options={{ ...defaultOptions, animationData }} height={400} width={400} />
        </div>
        <div className="mb-8 ">
          <button
            onClick={toggleListening}
            className={`w-full py-3 rounded-lg px-4 mb-4 ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            {isListening ? 'Stop Conversation' : 'Start Conversation'}
          </button>
        </div>
        <audio ref={audioRef} className="hidden" />
        {showAlert && (
          <div className="mt-4 p-4 bg-red-600 text-white rounded-lg">
            <h3 className="font-bold">Error</h3>
            <p>{alertMessage}</p>
          </div>
        )}
        {/* {transcript && (
          <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
            <h3 className="font-bold">Transcript:</h3>
            <p>{transcript}</p>
          </div>
        )} */}
      </div>
    </>
  );
};

export default AgentTalk;