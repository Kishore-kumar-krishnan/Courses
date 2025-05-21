import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CourseList from './Components/CourseList'
import './index.css'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CourseList />
  </StrictMode>
)
