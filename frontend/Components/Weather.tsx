"use client";
import { useState } from 'react'



const Weather = () => {
    const [location, setLocation] = useState("Delhi");
    

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:5000/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ location }),
            });

            const res = await response.json();
            console.log(res.data);


        } catch (err) {
            console.log('caught error', err)
        }
    }

    return (
        <div className='min-h-screen p-2 flex flex-col items-center gap-10'>
            <div className='flex items-start gap-10'>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className='bg-slate-500 rounded-md px-2 py-1 font-semibold'
                />
                <button
                    onClick={handleSubmit}
                    type='submit'
                    className='bg-slate-500 rounded-md px-2 py-1 font-semibold'
                >Submit</button>
            </div>

            <div className='text-white flex gap-10'>
                <span>
                    <h1 className='text-2xl'>Temparature</h1>
                    <div>
                        <p>Min Temparature: </p>
                        <p>Curr Temparature:</p>
                        <p>Max Temparature:</p>
                    </div>
                </span>

                <span>
                    <h1 className='text-2xl'>Atmospheric Conditions</h1>
                    <p>Precipitation: </p>
                    <p>Relative Humidity:</p>
                    <p>UV Index: </p>
                </span>

                <span>
                    <h1 className='text-2xl'>Sun Cycle</h1>
                    <p>Sunrise: </p>
                    <p>Sunset:</p>
                </span>

                <span>
                    <h1 className='text-2xl'>Wind & Air</h1>
                    <p>Max Wind Speed: </p>
                    <p>Precipitation Probability Max: </p>
                </span>

                <span>
                    <h1>Air Quality</h1>
                    <p>AQI: </p>
                    <p>PM10</p>
                    <p>PM2.5</p>
                    <p>Carbon Monoxide</p>
                    <p>Carbon Oxide</p>
                    <p>Nitrogen Oxide</p>
                    <p>Sulphur Oxide</p>
                </span>


            </div>
        </div>
    )
}

export default Weather
