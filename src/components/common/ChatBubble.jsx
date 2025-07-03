import React from "react";
import { LiveChatWidget } from "@livechat/widget-react";

const ChatBubble = () => {
  return (
    <div style={{ backgroundColor: "transparent" }}>
      <LiveChatWidget
        license="19221915"
        onNewEvent={(event) => {
          console.log("LiveChat Event:", event.type, event);
        }}
      />
    </div>
  );
};

export default ChatBubble;
