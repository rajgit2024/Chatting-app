import React from 'react'
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const socket=io("http://localhost:5000");

  useEffect(()=>{
    socket.on("connect",()=>{
     console.log("Connected!",socket.id);
    })
    socket.on("welcome",(s)=>{
      console.log(`Welcome ${s}`);
      
    })
  },[])
  return (
    <div>
      App
    </div>
  )
}

export default App
