import { useId } from "react"
import React from 'react'

const Input = React.forwardRef(function Input({
    label,
    type = 'text',
    className='',
    placeholder="Enter Text",
    backgroundColor ='transparent',
    color='white',
    border='1px solid white',
    ...props
},ref) {
    const id = useId();
    return (
        <div>
            {label && <label 
            className="input-label"
            htmlFor={id}>
                {label}
            </label>}
            
            <input
            type={type} 
            className={`input-field ${className}`}
            placeholder={placeholder}
            ref={ref}
            {...props}
            id={id}
            ></input>
        </div>
    )
})
export default Input
