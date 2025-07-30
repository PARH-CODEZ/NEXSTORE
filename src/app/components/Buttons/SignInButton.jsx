import React from 'react';

const SignInButton = ({ onClick, className = "" , text }) => {
  return (
    <button
      onClick={onClick}
      className={`w-[50%] bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded transition-colors duration-200 ${className}`}
    >
        {text}
    </button>
  );
};

export default SignInButton;