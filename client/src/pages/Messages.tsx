import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function Messages() {
  const { data: messages } = trpc.messages.list.useQuery();
  const [newMessage, setNewMessage] = useState("");
  const sendMutation = trpc.messages.send.useMutation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <Card className="p-6">
          <div className="mb-6 max-h-96 overflow-y-auto">
            {messages?.map((msg: any) => (
              <div key={msg.id} className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">From: User {msg.senderId}</p>
                <p className="mt-2">{msg.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button>Send</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
