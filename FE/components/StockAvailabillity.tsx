import React from 'react'
import { FaCheck } from 'react-icons/fa6'
import { FaXmark } from "react-icons/fa6";


const StockAvailabillity = ({ stock, inStock } : { stock: number, inStock: number }) => {
  return (
    <p className='text-xl flex gap-x-2 max-[500px]:justify-center'>Tình trạng: 
    { inStock === 1 ? <span className='text-success flex items-center gap-x-1'>Còn hàng <FaCheck /></span> :  <span className='text-error flex items-center gap-x-1'>Hết hàng <FaXmark /></span>}
    
    
    </p>
  )
}

export default StockAvailabillity