

export const getCurrentDateAndTime = ()=>{
    const d = new Date();

    const date = d.toLocaleDateString('pt-BR');
    const time = d.toLocaleTimeString('pt-BR');
    const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

    return({
        date,
        time,
        daysOfWeek,
        day: d.getDate().toString().padStart(2, '0'),
        dayOfWeek: daysOfWeek[d.getDate()],
        month: (d.getMonth() + 1).toString().padStart(2, '0'),
        year: d.getFullYear(),
        hour: d.getHours().toString().padStart(2, '0'),
        hourNumber: d.getHours(),
        minute: d.getMinutes().toString().padStart(2, '0'),
        secude: d.getSeconds().toString().padStart(2, '0'),
    })
}