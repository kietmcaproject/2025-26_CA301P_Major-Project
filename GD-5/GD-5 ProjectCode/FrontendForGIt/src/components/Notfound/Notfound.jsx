
import NOTFOUNDIMG from '../../assets/404-svg-animation.svg';

const Notfound = () =>{
    return(
        <>
        
            <img src={NOTFOUNDIMG} className='w-full' style={{
                height: '100vh',
                width: '100vw', 
            }} alt="404 not found..." />
        </>
    )
}

export default Notfound;