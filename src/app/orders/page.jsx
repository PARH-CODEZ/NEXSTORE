'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import CategoryNav from '../components/Categories/Categories'
import { useSelector } from 'react-redux'
import EmptyCartContainer from '../components/EmptyCartContainer/EmptyCart'
import EmptyOrdersContainer from '../components/EmptyOrderContainer/EmptyOrder'

const page = () => {

    const user = useSelector((state) => state.user.user);
    const [empty, setEmpty] = useState(false)

    useEffect(() => {
        if (!user || user.role != 'customer') {
            setEmpty(true)
        }
    }, [user])

    return (
        <>
            <div className='overflow-x-hidden'>
                <Navbar />
                <CategoryNav />
                {empty ? (
                   <EmptyOrdersContainer/>
                ) : (

                    <div></div>
                )}


            </div>

        </>

    )
}

export default page