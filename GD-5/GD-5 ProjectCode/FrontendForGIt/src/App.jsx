import { BrowserRouter, Route, Routes , HashRouter } from 'react-router-dom'
import { useState, useEffect } from 'react';
import './App.css'
import Mainapp from './components/mainapp/Mainapp'
import Loginpage from './components/loginPage/Loginpage'
// import Registration from './components/Registrationcom/Registration'
import PrivateComponent from './components/privatecomponent/PrivateComponent'
import About from './components/About/About'
import FlowchartDisplay from './components/Flowchartdisplay/FlowchartDisplay'
import FlowchartEditor from './components/Flowchartdisplay/FlowchartEditor'
import StudentRegistration from './components/Registrationcom/Studentregistration'
import LoadingICON from './assets/hellologo5.gif';
import Notfound from './components/Notfound/Notfound';


function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust the timeout duration as needed
    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  return (
    <>
      {isLoading && (
        <div className='loading-screen'>
          <div className='loading-content d-flex flex-column justify-content-center align-items-center'>
            <img src={LoadingICON} alt="Loading..." className='loading-icon' />
            <h1 className='loading-text text-lg'>CodHelp</h1>
          </div>
        </div>
      )}
      {!isLoading && (
        <HashRouter>
          <Routes>
            <Route path='/' element={<Mainapp />} />
            <Route path='/about' element={<About />} />
            
            {/* here is the privateComponet */}
            <Route element={<PrivateComponent />}>
              <Route path='/Flowchartdisplay' element={<FlowchartDisplay />} />
              <Route path='/Flowcharteditor' element={<FlowchartEditor />} />
            </Route>

            <Route path='/login' element={<Loginpage />} />
            <Route path='/registration' element={<StudentRegistration />} />
            <Route path='*' element={<Notfound/>} />
          </Routes>
        </HashRouter>
      )}
    </>
  );
}

export default App;
