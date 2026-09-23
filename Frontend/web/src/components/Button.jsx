import React from 'react'

function Button({
    children,
    className='',
    type='button',
    props,

}) {
  return (
    <div>
        <button
         className={`${className}`} 
         type={type} 
         {...props}>
            {children}
        </button>
    </div>
  )
}

export default Button
