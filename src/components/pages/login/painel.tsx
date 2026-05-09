'use client';

import { Mountain, Compass, Haze, SunDim, Sun, Moon, MoonStar } from "lucide-react";
import { getCurrentDateAndTime } from "@/utils/several/getCurrentDateAndTime";

export default function PainelLogin() {

    const {hour, minute, hourNumber} = getCurrentDateAndTime();

    const iconWeather = ()=>{
        const s = 20;
        if(hourNumber <= 7 && hourNumber >= 5) return <Haze size={s}/>;
        if(hourNumber <= 11 && hourNumber >= 8) return <SunDim size={s}/>
        if(hourNumber <= 18 && hourNumber >= 12) return <Sun size={s}/>
        if(hourNumber <= 21 && hourNumber >= 19) return <Moon size={s}/>
        else return <MoonStar size={s}/>
    }

    return (
        <>
            <div className="flex p-5 gap-3 text-j-transparent-gray items-center">
                <div className="flex flex-col items-center">
                    <Mountain size={20}/>
                    <p className="text-[10px] font-light">1,240M</p>
                </div>
                <hr className="bg-j-transparent-black border-l h-2/3"/>
                <div className="flex flex-col items-center">
                    <Compass size={20}/>
                    <p className="text-[10px] font-light">S 23.5505º</p>
                </div>
                <hr className="bg-j-transparent-black border-l h-2/3"/>
                <div className="flex flex-col items-center">
                    {iconWeather()}
                    <p className="text-[10px] font-light">{hour}H{minute}</p>
                </div>
            </div>
            <p className="text-j-transparent-gray text-[10px] text-center"
                >&copy; 2026 JEEP CLUBE TAMOIOS • OFF-ROAD PERFORMANCE</p>
        </>
    );
}