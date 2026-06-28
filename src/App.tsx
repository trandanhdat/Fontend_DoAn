import { AppRouter } from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";
import { ChatbotWidget } from "./components/chatbot/ChatbotWidget";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" reverseOrder={false} />
      <ChatbotWidget />
    </>
  );
}

export default App;
