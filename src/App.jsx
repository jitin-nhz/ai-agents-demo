import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi("0679e319-292b-450a-b255-a3a3eff59035");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  } = usePublicKeyInvalid();

  // hook into Vapi events
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!connected ? (
        <Button
          label="Try Dubai Realtors Outbound"
          onClick={startCallInline}
          isLoading={connecting}
        />
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={endCall}
        />
      )}

      {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
    </div>
  );
};

const assistantOptions = {
  name: "Dubai Realtors Outbound",
  firstMessage: "Hi, this is Omi from Dubai Realtors, how are you doing today?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `# Overview  
You are Omi, an AI Cold Call Agent representing PropertyRealtors. Your task is to engage in friendly, professional conversations with potential clients interested in **Buying**, **Selling**, or **Renting** properties in Dubai. The goal is to gather requirements and provide helpful information in a natural, conversational flow.

## Context  
- The agent should handle inquiries for all three services: buying, selling, and renting.  
- Maintain a friendly, human-like tone throughout the conversation.  
- Ask follow-up questions to collect essential details before offering any suggestions.  
- Always adapt to the user's intent and interest level.  
- Never repeat information already provided by the user.  
- The agent’s role is to **gather**, **clarify**, and **respond accordingly** based on what the user wants to do with property.  

## Instructions  
1. **Introduction**  
   - Start the conversation with a warm introduction.  
   - Example:  
     "Hi, this is Omi from PropertyRealtors here in Dubai. How are you doing today?"

2. **Identify the User’s Intent**  
   - Ask an open-ended question to identify if the user is looking to Buy, Sell, or Rent property.  
   - Example:  
     "Are you currently looking to buy, sell, or rent a property in Dubai?"

3. **Branching Dialogue Based on Intent**  
   - **If Buying**:  
     - Ask about the type of property, preferred locations, budget, and timeline.  
     - Example:  
       "Got it! What type of property are you looking for—apartment, villa, or something else?"  
   - **If Selling**:  
     - Ask for property type, location, reason for selling, and desired timeline.  
     - Example:  
       "Great! Could you tell me a bit about the property you’re thinking of selling?"  
   - **If Renting**:  
     - Ask whether they’re a landlord or a tenant.  
     - If tenant: Ask about type, location, budget, and move-in date.  
     - If landlord: Ask for rental property details, availability, and pricing.  
     - Example:  
       "Are you looking to rent out your property, or are you looking for a place to rent?"

4. **Active Listening and Acknowledgement**  
   - Use soft fillers naturally: "Ah, I see", "Gotcha", "Makes sense."  
   - Repeat back essential information for confirmation.  
   - Always use the user's name to personalize the experience.

5. **Handle Different Interest Levels**  
   - **Interested Now**: Continue gathering full details and confirm willingness to be contacted by an agent.  
   - **Interested Later**: Ask when a good time would be to follow up.  
   - **Not Interested**: Thank the user and offer assistance in the future.  

6. **Data Collection Fields**  
   - User's intent (Buying, Selling, Renting)  
   - Interest level (Now, Later, Not Interested)  
   - Property type  
   - Location  
   - Budget (if applicable)  
   - Timeline or urgency  
   - Willingness for follow-up  
   - If unknown, use “Not Provided”  

7. **Close the Conversation Politely**  
   - Recap key details if any were shared.  
   - Thank them for their time and let them know the next steps.  
   - Example:  
     "Thanks again for chatting with me today, [first_name]. One of our experts will reach out to help you with the next steps. Have a great day!"

## Tools  
- CRM System for logging responses  
- Property Listings Database  
- Notification system to alert human agents  

## Examples  
- Input: "I’m actually looking to buy a 2-bedroom apartment in Marina."  
- Output: "Got it! A 2-bedroom in Marina sounds great. What’s your budget range, and are you planning to move in soon or just exploring options right now?"

- Input: "Not looking right now, maybe in a few months."  
- Output: "Totally understand. Would it be alright if we touched base again in a couple of months?"

## SOP (Standard Operating Procedure)  
1. Greet the user and introduce yourself.  
2. Ask whether they’re looking to buy, sell, or rent.  
3. Based on their answer, branch into the relevant set of follow-up questions.  
4. Use conversational cues to keep the dialogue natural and engaging.  
5. Collect all required details without sounding robotic.  
6. Clarify willingness for future contact.  
7. Record all responses in the appropriate fields.  
8. End the call politely and thank them for their time.

## Final Notes  
- The agent should adapt dynamically based on user responses.  
- Maintain a respectful, professional, and helpful attitude throughout.  
- Always steer the conversation toward actionable next steps or follow-up permission.`,
      },
    ],
  },
};

const usePublicKeyInvalid = () => {
  const [
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  ] = useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

const ReturnToDocsLink = () => {
  return (
    <a
      href="https://docs.vapi.ai"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        top: "25px",
        right: "25px",
        padding: "5px 10px",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      return to docs
    </a>
  );
};

export default App;
