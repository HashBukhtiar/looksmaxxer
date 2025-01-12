import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AIChatPage.css";

const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Call scrollToBottom whenever a new message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Delay the rendering of the chatbox
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatBoxVisible(true);
    }, 500); // Adjust the delay as needed
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Process the selected file as needed
      console.log("Selected file:", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Base64 image:", typeof reader.result, reader.result);
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    document.getElementById("hiddenFileInput").click();
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() && !selectedImage) return;

    fetch("http://localhost:5000/api/analyze_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64_string: selectedImage }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Analysis result:", data))
      .catch((error) => console.error("Error:", error));

    const newMessage = {
      role: "user",
      content: userInput,
      image: selectedImage,
      id: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput("");
    setSelectedImage(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/send-message",
        {
          userInput,
          selectedImage,
        }
      );

      const aiResponse = response.data.response;
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "ai", content: aiResponse.content, id: Date.now() },
      ]);
    } catch (error) {
      console.error("Error sending message to the backend:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="header">
        <h1>AI Stylist Chat</h1>
        <button
          className="wardrobe-button"
          onClick={() => navigate("/wardrobe")}
        >
          Wardrobe
        </button>
      </div>
      {isChatBoxVisible && (
        <div className="chat-box animate">
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role} enter`}>
                {msg.image && (
                  <img src={msg.image} alt="Sent" className="sent-image" />
                )}
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {selectedImage && (
            <img src={selectedImage} alt="Selected" className="image-preview" />
          )}
          <div className="input-container">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
            />
            <button onClick={handleSendMessage}>Send</button>
            <button onClick={triggerFileSelect}>Select Picture</button>
            <input
              type="file"
              id="hiddenFileInput"
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatPage;
