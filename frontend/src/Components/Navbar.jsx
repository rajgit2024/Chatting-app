import { MdOutlineMenuOpen } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import React from 'react'
  
  const Navbar = () => {
    return (
    <div>
        <nav className="fixed top-0 left-0 right-0 bg-opacity-30 backdrop-blur-md p-4 z-50 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-4xl font-extrabold drop-shadow-lg">Voter Dashboard</h1>
          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-4">
           
            <li>
              <button
                onClick={() => navigate("/profile")}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/disclaimer")}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Disclaimer
              </button>
            </li>
            <li>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-800  px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </li>
          </ul>
          {/* Mobile Menu Toggle */}
          <button
            className="text-white md:hidden"
            onClick={() => setIsSliderOpen(true)} // Open slider
          >
            <MdOutlineMenuOpen className="text-[30px]"/>
          </button>
        </div>
      </nav>
    
      {/* Right-Side Slider for Mobile */}
      <div
        className={`fixed top-0 right-0 h-full bg-white bg-opacity-30 backdrop-blur-md  text-white shadow-lg transform ${
          isSliderOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50 w-64`}
      >
        <div className="p-4 ">
          <button
            className="text-red-500 font-bold text-lg"
            onClick={() => setIsSliderOpen(false)} // Close slider
          >
            <IoMdClose className="text-[25px] text-black"/>
          </button>
          <ul className="mt-8 space-y-4">
            <li>
              <button
                onClick={logout}
                className="w-full text-left bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsSliderOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsSliderOpen(false);
                  navigate("/disclaimer");
                }}
                className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Disclaimer
              </button>
            </li>
          </ul>
        </div>
      </div>
      </div>
    )
  };
  
  export default Navbar
  
