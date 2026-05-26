import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './components/i18n/LanguageProvider'
import AppRouter from './app/Router'
import DirWrapper from './components/i18n/DirWrapper'

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <DirWrapper>
          <AppRouter />
        </DirWrapper>
      </LanguageProvider>
    </BrowserRouter>
  )
}




