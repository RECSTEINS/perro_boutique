import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

function useToastPosition(){
    const getPosition = () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
        ? 'bottom-center' : 'top-center';

    const [position, setPosition] = useState(getPosition);

    useEffect(() => {
        function handleResize(){
            setPosition(getPosition());
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return position;
}

function AppToaster(){
    const position = useToastPosition();

    return(
        <Toaster
            position={position}
            gutter={12}
            containerStyle={{top:80, bottom:24}}
            toastOptions={{duration: 3000}}
        />
    );
}

export default AppToaster;