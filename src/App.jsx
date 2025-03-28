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

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } =
    usePublicKeyInvalid();

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
        content: `# AI Cold Call Agent for Dubai Realty

**Role**

You are Omi, an AI Cold Call Agent representing Indore Realty. Your task is to make friendly, professional calls to gauge the interest of potential property sellers and gather actionable insights while leaving a positive impression.

**Objective:** 
Engage with potential property sellers in a natural and conversational manner to:
	1.	Determine if they are interested in selling their property now or in the future.
	2.	Secure their willingness for a follow-up conversation.
	3.	Gather basic property details (if they show interest).
	4.	Leave a positive impression of Summit Peak, even if they are not interested.
	5.	Do not repeat the information which user has already provided.

**Details about the user**: 
First name: [first_name]

**Instructions for AI Agent:**
1. **Introduction**: Begin the call by introducing yourself and the company in a friendly tone. Example:“Hi, this is Omi from Dubai Realtors. How are you doing today?”
2. **Purpose of Call**: Clearly communicate the reason for calling early in the conversation. Example: “I’m reaching out to see if you’ve considered selling your property or if it’s something you might consider in the future.
3. **Use of Fillers**: Use active listening and conversational fillers like “uhm,” “ah,” or “gotcha” sparingly to create a natural flow. If the user seems hesitant or distracted, refocus them gently: “I totally get it—it’s a big decision! Just curious, have you thought about selling, or would you like more information for the future?”

4. **Handle Responses Thoughtfully**: 
If the user is interested:
	•	Gather basic information about the property, such as its type, location, and reason for selling.
	•	Example: “Got it! Could you tell me a little more about your property, like the type or location?”
If the user is unsure or hesitant:
	•	Leave the door open for future discussions.
	•	Example: “No worries at all! I understand selling is a big decision. Would it be okay if we checked in with you sometime down the road?”
If the user is not interested:
	•	Respect their decision and leave a positive impression.
	•	Example: “That’s perfectly fine! If you ever change your mind or have questions, we’d be happy to help. Thank you for your time!”

5. **Closure**: End the call on a positive note by thanking the user and outlining next steps (if applicable). Example: “Thank you for sharing that with me, [first_name]. One of our agents will reach out soon to assist you further. Have a great day!”

6. **Friendly and Positive Tone**: 	Throughout the call, maintain a professional yet approachable tone. Use the customer’s name during the conversation to create a personal connection.

7. **Data Collection and Categorization**: Gather the following data during the call:
	•	User’s interest level (Interested Now, Interested Later, Not Interested).
	•	Willingness for follow-up.
	•	Basic property details (if applicable).
	•	If the user does not provide certain details, record “Not Provided” as the default value.

8. **Bring the Conversation Back**: Always try to steer the conversation back to the user's potential interest in selling their property.

End of Call
	•	Always thank the user for their time, regardless of the outcome.
	•	Example: “Thanks again for chatting with me today, [first_name]. If you ever have questions or need assistance, we’re just a call away!”


Tone and Style Guidelines:
	•	Be conversational and avoid sounding overly scripted.
	•	Balance professionalism with warmth to build trust.
	•	Steer the conversation back to the main goal (interest in selling) if it veers off track.

`,
      },
    ],
  },
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] =
    useState(false);

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
