"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Volume2 } from "lucide-react";
import { createAgent } from '@/app/api/agents';
import { useDispatch } from 'react-redux';
import { setAgentId } from '@/store/ChatSlice';
import GenerateAvatar from '@/lib/GenerateAvatar'

const CreateAgentPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const [agentData, setAgentData] = useState({
    name: "",
    language: "",
    voice: "charlie",
    avatar: "",
    jobField: "",
    greeting: "",
    prompt: "",
    llm: "",
    customKnowledge: "",
    files: [],
  });

  const voices = [
    { voice_id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
    { voice_id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
    { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
    { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
    { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
    { voice_id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },
    { voice_id: 'iP95p4xoKVk53GoZ742B', name: 'Chris' },
    { voice_id: 'nPczCjzI2devNBz1zQrb', name: 'Brian' },
    { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' },
    { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily' },
    { voice_id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill' }
  ];

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && showAlert) {
      setShowAlert(false);
    }
    return () => clearInterval(timer);
  }, [countdown, showAlert]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAgentData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAgentData((prevData) => ({ ...prevData, files: [...e.target.files] }));
  };

  const handleGenerateAvatar = async () => {
    if (!agentData.avatar.trim()) {
      alert("Please enter a job field first");
      return;
    }
    
    setIsGeneratingAvatar(true);
    setShowAlert(true);
    setCountdown(40);
    
    try {
      const avatarUrl = await GenerateAvatar(agentData.avatar);
      setAgentData(prevData => ({
        ...prevData,
        avatar: avatarUrl || DEFAULT_AVATAR_URL
      }));
    } catch (error) {
      console.error(error)
    } finally {
      setIsGeneratingAvatar(false);
      setShowAlert(false);
      setCountdown(0);
    }
  };

  const playVoiceSample = async (e, voiceName) => {
    e.stopPropagation();

    if (currentlyPlaying) {
      currentlyPlaying.pause();
      currentlyPlaying.currentTime = 0;
    }

    try {
      const response = await fetch(`https://intervuo.store/api/media/voices/inquisitor_${voiceName.toLowerCase()}`);
      if (!response.ok) throw new Error('Failed to fetch voice sample');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setCurrentlyPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };

      setCurrentlyPlaying(audio);
      await audio.play();
    } catch (error) {
      console.error('Error playing voice sample:', error);
      alert('Failed to play voice sample');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("agent.identity.agent_name", agentData.name);
    formData.append("agent.identity.language", agentData.language);
    formData.append("agent.identity.voice", agentData.voice);
    formData.append("agent.identity.avatar", agentData.avatar);
    formData.append("agent.behaviour.agent_greeting", agentData.greeting);
    formData.append("agent.behaviour.agent_prompt", agentData.prompt);
    formData.append("agent.knowledge.agent_llm", agentData.agent_llm);
    formData.append("agent.knowledge.custom_knowledge", agentData.customKnowledge);

    agentData.files.forEach((file, index) => {
      formData.append(`file${index}`, file, file.name);
    });

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("Not logged in");
        return;
      }
      const result = await createAgent(formData, token);

      dispatch(setAgentId(result));
      router.push('/assistants');
    } catch (error) {
      console.error("Error creating agent:", error.message);
    }
  };

  const nextStep = async (e) => {
    e.preventDefault();
    if (step + 1 === 2 && !agentData.avatar.trim()) {
      alert("Please enter a job field before proceeding");
      return;
    }
    if (step + 1 === 2) {
      handleGenerateAvatar();
    }
    setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Original Sidebar */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } min-h-screen bg-gray-800 border-r border-gray-700`}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "ml-18" : "ml-18"}`}>
          <div className="min-h-screen p-4 lg:p-8">
            <h1 className="mb-6 lg:mb-12 text-center text-2xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Setup Assistant
            </h1>

            {/* Alert */}
            {showAlert && (
              <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn text-sm">
                <p className="font-semibold">Generating Avatar...</p>
                <p>Please wait {countdown} seconds</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-4 lg:p-6">
                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-white">Step 1: Identity</h2>
                    
                    <div>
                      <label className="block mb-1 text-sm text-white">Agent Name</label>
                      <input
                        type="text"
                        name="name"
                        value={agentData.name}
                        onChange={handleInputChange}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white placeholder-gray-300"
                        placeholder="Enter agent name"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-white">Language</label>
                      <select
                        name="language"
                        value={agentData.language}
                        onChange={handleInputChange}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white"
                      >
                        <option value="" className="bg-gray-800">Select a language</option>
                        <option value="english" className="bg-gray-800">English</option>
                        <option value="spanish" className="bg-gray-800">Spanish</option>
                        <option value="french" className="bg-gray-800">French</option>
                        <option value="german" className="bg-gray-800">German</option>
                        <option value="hindi" className="bg-gray-800">Hindi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-white">Voice</label>
                      <div className="relative">
                        <select
                          name="voice"
                          value={agentData.voice}
                          onChange={handleInputChange}
                          className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white pr-10"
                        >
                          {voices.map((voice) => (
                            <option key={voice.voice_id} value={voice.name.toLowerCase()} className="bg-gray-800">
                              {voice.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={(e) => playVoiceSample(e, agentData.voice)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-400 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-white">Job Field for Avatar</label>
                      <input
                        type="text"
                        name="avatar"
                        value={agentData.avatar}
                        onChange={handleInputChange}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white placeholder-gray-300"
                        placeholder="e.g., Python Developer, Doctor"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-white">Step 2: Behavior</h2>
                    
                    <div>
                      <label className="block mb-1 text-sm text-white">Agent Greeting (max 250 characters)</label>
                      <textarea
                        name="greeting"
                        value={agentData.greeting}
                        onChange={handleInputChange}
                        maxLength={250}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white h-20"
                        placeholder="Enter agent greeting"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-white">Agent Prompt</label>
                      <textarea
                        name="prompt"
                        value={agentData.prompt}
                        onChange={handleInputChange}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white h-24"
                        placeholder="Enter agent prompt"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-white">Step 3: Knowledge</h2>

                    <div>
                      <label className="block mb-1 text-sm text-white">Agent LLM</label>
                      <select
                        name="agent_llm"
                        value={agentData.agent_llm}
                        onChange={handleInputChange}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white"
                      >
                        <option value="" className="bg-gray-800">Select LLM</option>
                        <option value="gpt-4o-mini" className="bg-gray-800">GPT-4o-Mini</option>
                        <option value="gpt-4o" className="bg-gray-800">GPT-4o</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-white">Custom Knowledge</label>
                      <textarea
                        name="customKnowledge"
                        value={agentData.customKnowledge}
                        onChange={handleInputChange}
                        maxLength={30000}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white h-24"
                        placeholder="Enter custom knowledge"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm text-white">Upload Knowledge Files</label>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="w-full bg-white bg-opacity-20 rounded p-2 text-sm text-white"
                      />
                      <p className="text-xs text-gray-300 mt-1">
                        Supported: PDF, TXT, EPUB, and more.
                        <Link href="/supported-files" className="text-blue-300 hover:underline ml-1">
                          See full list
                        </Link>
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-6 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isGeneratingAvatar}
                      className={`px-4 py-2 text-sm bg-gray-600 text-white rounded transition-colors ${
                        isGeneratingAvatar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-500'
                      }`}
                    >
                      Previous
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded transition-colors hover:bg-blue-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isGeneratingAvatar}
                      className={`px-4 py-2 text-sm bg-green-600 text-white rounded transition-colors ${
                        isGeneratingAvatar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'
                      }`}
                    >
                      Create Agent
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgentPage;