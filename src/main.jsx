import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Courseview from './Components/Courseview'
import './index.css'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Courseview />
  </StrictMode>
)
