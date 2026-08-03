
/**
 * Função para obter a data e hora atual formatada em português do Brasil.
 * @description Esta função retorna um objeto contendo a data e hora atual formatada, incluindo o nome dos dias da semana em português do Brasil, além de informações detalhadas sobre o dia, mês, ano, hora, minuto e segundo.
 * @returns {Object} Objeto contendo a data e hora atual formatada, incluindo:
 *   - `date`: Data formatada em português do Brasil
 *   - `time`: Hora formatada em português do Brasil
 *   - `daysOfWeek`: Array com os nomes dos dias da semana em português do Brasil
 *   - `day`: Dia do mês (com dois dígitos)
 *   - `dayOfWeek`: Nome do dia da semana em português do Brasil
 *   - `month`: Mês (com dois dígitos)
 *   - `year`: Ano
 *   - `hour`: Hora (com dois dígitos)
 *   - `hourNumber`: Número da hora
 *   - `minute`: Minuto (com dois dígitos)
 *   - `second`: Segundo (com dois dígitos)
 */
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
        second: d.getSeconds().toString().padStart(2, '0'),
    })
}