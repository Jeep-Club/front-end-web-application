'use client';
import { useState } from "react";

export default function RootComponent() {
    const [data, setData] = useState<string>("Click me!");
    return (
        <div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setData("Button clicked!")}>
                {data}
            </button>
        </div>
    );
}