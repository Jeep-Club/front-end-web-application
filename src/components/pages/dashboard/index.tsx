'use client';

import Header from '@/components/common/header';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#f5f5f5]">

            <Header />

            <section className="relative w-full overflow-hidden">

                {/* Background blur */}
                <div className="
                    absolute
                    top-[-120px]
                    left-[-120px]
                    w-[320px]
                    h-[320px]
                    bg-blue-100
                    rounded-full
                    blur-3xl
                    opacity-40
                " />

                <div className="
                    max-w-[1400px]
                    mx-auto
                    px-6
                    sm:px-10
                    lg:px-20
                    py-10
                    lg:py-16
                ">

                    <div className="
                        flex
                        flex-col
                        lg:flex-row
                        items-center
                        justify-between
                        gap-14
                    ">

                        {/* TEXTO */}
                        <div className="
                            flex-1
                            w-full
                            text-center
                            lg:text-left
                        ">

                            <h1
                                className="
                                    text-[58px]
                                    sm:text-[82px]
                                    md:text-[110px]
                                    lg:text-[140px]
                                    leading-[0.9]
                                    text-black
                                    italic
                                    font-light
                                    tracking-wide
                                "
                                style={{
                                    fontFamily: 'cursive',
                                }}
                            >
                                BEM <br />
                                VINDO
                            </h1>

                            <p className="
                                mt-5
                                text-xs
                                sm:text-sm
                                uppercase
                                tracking-[0.25em]
                                text-gray-400
                            ">
                                Você está no Jeep_Club_Tamoios
                            </p>

                        </div>

                        {/* IMAGEM */}
                        <div className="
                            relative
                            w-full
                            flex
                            justify-center
                            lg:justify-end
                            flex-1
                        ">

                            <div className="
                                absolute
                                top-10
                                right-5
                                w-[90%]
                                h-[90%]
                                bg-blue-200
                                rounded-[50px]
                                blur-3xl
                                opacity-30
                            " />

                            <div className="
                                relative
                                w-full
                                max-w-[280px]
                                sm:max-w-[340px]
                                lg:max-w-[380px]
                                rounded-[28px]
                                overflow-hidden
                                shadow-2xl
                            ">

                                <img
                                    src="/images/Expe_jeep.jpg"
                                    alt="Jeep na trilha"
                                    className="
                                        w-full
                                        h-[420px]
                                        sm:h-[520px]
                                        lg:h-[620px]
                                        object-cover
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}