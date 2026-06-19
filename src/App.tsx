
import { AppProvider } from "./context/AppContext";
import { WindowProvider } from "./context/WindowContext";
import { AuthProvider } from "./context/AuthContext";
import PageRouter from "./pages/pageRouter/pageRouter";
import { RootProvider } from './context/RootContext';
import Toast from './components/toast/toast';
import { FileProvider } from './context/FileContext';

function App() {
  return (
    <RootProvider>
      <WindowProvider>
        <AppProvider>
          <FileProvider>
            <AuthProvider>

              <div
                className="flex min-h-screen w-full">
                <PageRouter />
              </div >
              <Toast />

            </AuthProvider>
          </FileProvider>
        </AppProvider>
      </WindowProvider>
    </RootProvider >
  )
}

export default App