import React from 'react'
import Button from './ui/Button'
import { useOutletContext } from 'react-router';

const Navbar = () => {
    const {isSignedIn, userName, refreshAuth, signIn, signOut} = useOutletContext<AuthContext>();
    const handleAuthClick = async () => {
        if(isSignedIn){
            try {
                await signOut();
                
            } catch (error) {
                console.error(error);
            }
            return;
        }
        try {
            await signIn();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <header className='navbar'>
            <nav className='inner'>
                <div className='left'>
                    <div className='brand'>
                        <img src="/logo.svg" alt="Roomi" className='logo-img w-6 h-6 mr-2' />
                        <span className='name'>Roomi</span>
                    </div>

                    <ul className='links'>
                        <a href="#">Products</a>
                        <a href="#">Pricing</a>
                        <a href="#">Community</a>
                        <a href="#">Enterprise</a>
                    </ul>
                </div>
                <div className='actions'>
                    {isSignedIn ? (
                   <>
                    <span className='greetings'>
                        {userName ?`Hi, ${userName}` : 'Signed in' }
                    </span>
                    <Button size="sm" onClick={handleAuthClick} className='btn'>Logout</Button>
                    </>
                    ) : (
                        <>
                        <Button onClick={handleAuthClick} size='sm' variant='ghost'>Log in</Button>
                        <a href="#upload" className='cta'>Get Started</a>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar