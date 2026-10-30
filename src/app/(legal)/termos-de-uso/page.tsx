import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { type LegalSection } from "@/components/common/legal-document";
import LegalContact from "@/components/common/legal-contact";
import { getLegalContact } from "@/config/legal";

export const metadata: Metadata = { title: "Termos de Uso | Jeep Clube Tamoios", description: "Conheça as funcionalidades do site, as regras de uso, as responsabilidades e seus direitos." };

const sections: LegalSection[] = [
    {
        id: "responsavel", title: "Responsável e aplicação",
        content: <><p>Estes termos disciplinam o uso do site Jeep Clube Tamoios. A administração do clube responde pelas decisões de operação e pelas finalidades do tratamento de dados. A identificação e os canais disponíveis constam abaixo.</p><LegalContact /><p>Os documentos permanecem disponíveis para consulta. Conhecer esta política ou navegar pelo site não representa consentimento genérico para tratar dados pessoais, receber publicidade ou utilizar sua imagem.</p></>,
    },
    {
        id: "funcionalidades", title: "O que o site oferece",
        content: <><ul>
            <li>Apresentação do clube, de suas experiências off-road e de suas iniciativas sociais.</li>
            <li>Acesso por CPF e senha, recuperação e redefinição de senha, gerenciamento da sessão e permissões.</li>
            <li>Cadastro e consulta de perfil, dados pessoais e carteirinha de associado, com exportação em PNG ou PDF no dispositivo.</li>
            <li>Inclusão, consulta, edição e exclusão de veículos vinculados ao associado, conforme suas permissões.</li>
            <li>Área administrativa com funções de gestão de associados, perfis médicos, papéis e permissões, conforme o acesso autorizado.</li>
        </ul><p>Algumas telas estão em desenvolvimento. O feed ainda não oferece publicação de conteúdo; a edição de dados pessoais atualmente altera a visualização durante o uso, sem confirmação de gravação permanente no servidor. Consulte a administração para efetivar correções. A existência de uma tela não garante a disponibilidade de todos os serviços.</p><p>O site não oferece, nesta versão, contratação de seguro, atendimento médico, pagamentos ou inscrição eletrônica em eventos. Criar uma conta não confirma aprovação como associado, benefícios, participação em trilhas ou cobertura de despesas. Regras associativas e de eventos devem ser informadas separadamente antes da adesão ou contratação.</p></>,
    },
    {
        id: "conta", title: "Conta e segurança de acesso",
        content: <><p>Informe dados corretos e solicite a correção de inexatidões. Não use a identidade ou os documentos de outra pessoa. Proteja sua senha, evite compartilhar a sessão e encerre o acesso em dispositivos compartilhados. Havendo suspeita de uso indevido, procure a administração.</p><p>Contas de menores de idade e dados de dependentes exigem avaliação da administração e representação ou assistência legal quando aplicável. Nenhum cadastro dispensa as medidas de proteção de crianças e adolescentes descritas na Política de Privacidade.</p><p>Permissões administrativas são restritas às atividades autorizadas. Ter acesso técnico a um dado não autoriza consulta por curiosidade, divulgação ou uso particular.</p></>,
    },
    {
        id: "uso-responsavel", title: "Uso responsável e medidas de proteção",
        content: <><p>Não é permitido fraudar cadastros, contornar permissões, acessar contas alheias, extrair dados pessoais sem autorização, distribuir programas maliciosos, sobrecarregar o serviço ou inserir conteúdo ilícito, discriminatório ou que viole direitos de terceiros. Testes de segurança dependem de autorização e escopo definidos com a administração.</p><p>Para conter um risco concreto, a administração poderá restringir funções ou suspender o acesso de maneira proporcional. Deverá informar o motivo quando isso não comprometer a segurança, obrigações legais ou a apuração, e permitir esclarecimentos e revisão pelo <Link href="/contato">canal de contato</Link>. Erros de boa-fé devem admitir correção; não há perda automática de direitos ou de dados por uma simples divergência cadastral.</p></>,
    },
    {
        id: "conteudo", title: "Conteúdo, imagens e propriedade intelectual",
        content: <><p>Marcas, textos, imagens e software pertencem aos respectivos titulares e estão sujeitos às licenças aplicáveis. O acesso permite utilizar as funções oferecidas e baixar sua própria carteirinha. Outros usos devem respeitar autorização, licença e as exceções previstas em lei.</p><p>Você conserva os direitos sobre fotos e informações que fornecer. A administração poderá processá-las apenas na medida necessária para a função solicitada, como exibir a foto no perfil ou no veículo e gerar a carteirinha. Isso não concede licença ilimitada nem autoriza campanhas, venda de imagens ou divulgação pública de dados médicos. Usos promocionais identificáveis exigem fundamento próprio e informação específica.</p><p>Envie apenas material que você possa utilizar. Ao baixar uma carteirinha, cuide de onde o arquivo será salvo e compartilhado, pois ele pode conter dados pessoais.</p></>,
    },
    {
        id: "responsabilidades", title: "Responsabilidades e disponibilidade",
        content: <><p>A administração deve manter o serviço com diligência, adotar medidas de segurança adequadas, atender solicitações e corrigir falhas sob sua responsabilidade. Podem ocorrer manutenções e indisponibilidades; alterações relevantes devem ser comunicadas com antecedência razoável quando possível.</p><p>Cada pessoa responde por seus atos na medida prevista em lei, considerando sua participação, o dano e as regras aplicáveis. Estes termos não transferem todos os riscos ao usuário nem afastam responsabilidade legal do clube, de fornecedores ou de desenvolvedores. A atuação da equipe técnica deve ser avaliada conforme seu papel e suas obrigações, sem garantia de funcionamento infalível ou responsabilidade pessoal automática por todo incidente.</p><p>Informações sobre trilhas são institucionais. Não substituem avaliação das condições locais, preparo do veículo, habilitação, orientações dos organizadores ou atendimento de emergência. A participação em atividades não implica renúncia antecipada à reparação por danos.</p><p>Serviços externos, quando acessados por links, possuem regras próprias. O clube permanece responsável pelo que lhe couber na escolha e integração de fornecedores; a presença de terceiros não elimina direitos do usuário.</p></>,
    },
    {
        id: "imagem-voz", title: "Uso de imagem e voz",
        content: <><p>Estas cláusulas integram os Termos de Uso e estabelecem os limites para captação, armazenamento e utilização de imagem, voz, nome e registros identificáveis de veículos em eventos, trilhas, passeios e confraternizações do Jeep Clube Tamoios.</p>
        <h3 className="font-bold text-j-blue-800">Finalidades e canais</h3>
        <p>Mediante autorização válida e específica do titular para as finalidades correspondentes, o clube poderá utilizar fotos e vídeos para:</p>
        <ul><li>Divulgação institucional no site www.jeeptamoios.com.br e nos perfis oficiais do clube no Instagram, Facebook e YouTube.</li><li>Comunicação sobre atividades nos canais oficiais de WhatsApp informados aos participantes, considerando que destinatários podem salvar ou encaminhar os registros.</li><li>Materiais do próprio clube sobre trilhas, eventos e patrocinadores. Isso não autoriza cessão para publicidade independente de terceiros nem endosso pessoal de marcas ou produtos.</li><li>Acervo histórico das atividades, com revisão da necessidade de guarda. Conservar um registro não libera automaticamente novas publicações para outras finalidades.</li><li>Transmissões ao vivo, quando houver autorização específica e informação prévia sobre a captação.</li></ul>
        <p>A foto fornecida para perfil ou carteirinha tem finalidade própria de identificação e gestão associativa. Esse uso não autoriza a divulgação da carteirinha, de seus dados ou da foto em campanhas. Documentos, informações médicas e placas legíveis não devem ser expostos em materiais promocionais sem necessidade e fundamento próprios.</p>
        <h3 className="font-bold text-j-blue-800">Autorização, gratuidade e duração</h3>
        <p>O uso autorizado é gratuito, não exclusivo e restrito às finalidades informadas, enquanto elas subsistirem e até eventual revogação. Não há cessão definitiva ou irrevogável dos direitos da personalidade. A gratuidade não afasta reparação por uso indevido, exposição ofensiva, discriminatória ou enganosa, ou desrespeito aos limites da autorização. O clube não comercializará as imagens autorizadas.</p>
        <p>A inclusão dessas regras nos Termos de Uso informa as condições aplicáveis; o acesso ao site, o cadastro ou um aceite genérico dos termos não substituem a manifestação específica exigida quando o tratamento se basear em consentimento. A autorização promocional é opcional e sua recusa não constitui impedimento geral para participar das atividades. A organização deverá adotar medidas razoáveis para evitar a exposição de quem não autorizou.</p>
        <h3 className="font-bold text-j-blue-800">Família, acompanhantes e menores</h3>
        <p>Cada adulto decide sobre sua própria imagem. Não há autorização automática para familiares ou passageiros. Para menores, a organização deverá verificar a representação legal e obter autorização específica e destacada quando aplicável, sempre com prevalência do melhor interesse do menor e consideração de sua manifestação conforme idade e compreensão. Os deveres de proteção do clube não são transferidos integralmente ao responsável.</p>
        <h3 className="font-bold text-j-blue-800">Revogação, exclusão e desfoque</h3>
        <p>O titular ou representante pode revogar a autorização ou solicitar exclusão ou desfoque de imagem específica, sem necessidade de justificar, pelo <PrivacyEmailLink />. Informe o evento ou link que permita localizar o registro, evitando enviar documentos completos no primeiro contato.</p>
        <p>O clube adotará medidas de retirada, substituição ou desfoque em seus canais e materiais digitais sob seu controle em até 15 dias do recebimento de pedido identificável, sem prejuízo de urgências e prazos legais. Trata-se de compromisso operacional do clube, não de prazo geral da LGPD. Havendo impedimento concreto, deverá explicar as providências e a previsão de solução.</p>
        <p>A revogação impede novos usos com base no consentimento revogado, sem tornar ilícitos os usos anteriores que tenham sido regulares. Não há garantia de recolher todos os impressos já distribuídos, cópias de terceiros ou exposição já ocorrida em uma transmissão ao vivo; ainda assim, o clube deve interromper novas distribuições, retirar o que controla e adotar providências razoáveis junto a destinatários conhecidos. Gravações e materiais antigos sob seu controle não são genericamente irrevogáveis.</p></>,
    },
    {
        id: "riscos-trilhas", title: "Ciência dos riscos e participação em trilhas",
        content: <><p>Ao aderir às condições de uma atividade, o participante declara ciência dos riscos inerentes ao off-road, observa os deveres abaixo e decide sobre sua participação de forma livre e informada. A organização deve esclarecer previamente percurso, dificuldade, duração estimada, restrições, equipamentos, custos, comunicação e apoio disponível. A simples leitura destes termos não comprova inscrição, assinatura ou concordância individual registrada.</p>
        <h3 className="font-bold text-j-blue-800">Riscos da atividade</h3>
        <p>Trilhas podem envolver riscos graves, inclusive lesão corporal e morte, mesmo com medidas preventivas. Incluem capotamento, colisão, atolamento, queda em ribanceira, submersão, afogamento, incêndio, falhas mecânicas, de freios ou pneus, picadas de animais, exposição ao frio ou calor, danos materiais ao veículo e a terceiros. Isolamento e falhas de comunicação podem dificultar ou atrasar o socorro.</p>
        <h3 className="font-bold text-j-blue-800">Condutor, veículo e segurança</h3>
        <p>O condutor deve possuir habilitação válida e compatível quando exigida, experiência adequada, veículo em condições seguras e manutenção em dia. Deve conferir freios, pneus, cintos, lotação, equipamentos de recuperação, rádio e demais itens necessários ao percurso, observando a legislação e as exigências específicas informadas pela organização. Capacete e dispositivos de retenção devem atender às regras aplicáveis ao veículo e aos passageiros.</p>
        <p>É vedado conduzir sob efeito de álcool, drogas ou medicamentos que comprometam a direção. O participante deve respeitar distâncias, limites e orientações lícitas e seguras, informar impedimentos relevantes e interromper a condução se não houver condições adequadas. A organização pode recusar ou interromper a participação por motivo objetivo de segurança, explicar a decisão, alterar a rota ou cancelar a atividade por condições do terreno, clima ou determinação de autoridade.</p>
        <h3 className="font-bold text-j-blue-800">Acompanhantes e menores</h3>
        <p>Cada acompanhante adulto deve receber informações e manifestar sua própria vontade. O condutor não pode renunciar a direitos em nome de outros adultos. A presença de menores exige avaliação de adequação da atividade, representação legal e medidas de proteção, observadas as regras de guarda e viagem aplicáveis. Não há exigência automática de autorização dos dois pais com firma reconhecida para qualquer menor de 12 anos, nem autorização irrestrita decorrente da presença de um responsável.</p>
        <h3 className="font-bold text-j-blue-800">Meio ambiente e comunidades</h3>
        <p>Respeite autorizações de acesso, áreas protegidas, restrições ambientais, porteiras, animais e comunidades locais. Não descarte lixo, provoque incêndios, corte vegetação ou entre em áreas com acesso proibido. A orientação de um integrante do grupo não autoriza infrações. A responsabilidade por danos ambientais será apurada conforme a lei e a participação de cada envolvido.</p>
        <h3 className="font-bold text-j-blue-800">Seguro, apoio e emergência</h3>
        <p>O clube não inclui automaticamente seguro pessoal ou do veículo nem garante serviço próprio de resgate médico ou mecânico. A organização deve informar as coberturas e o apoio efetivamente disponíveis em cada evento. O participante pode contratar seguro adequado, verificando exclusões para off-road.</p>
        <p>Em emergência, a organização adotará as providências de auxílio e acionamento dos serviços competentes que lhe couberem, podendo ser necessário comunicar o contato de emergência. Isso não autoriza procedimentos médicos irrestritos. Despesas de resgate, remoção, hospital ou mecânica dependem dos contratos, coberturas e responsabilidades legais no caso concreto, sem atribuição automática de todos os custos ao participante.</p>
        <h3 className="font-bold text-j-blue-800">Limites da assunção de risco e dados pessoais</h3>
        <p>A ciência e a assunção voluntária dos riscos inerentes à atividade não constituem isenção total de responsabilidade civil ou criminal, promessa de não recorrer à Justiça ou autorização para negligência, imprudência e atos ilícitos. Participantes, clube, diretoria, organizadores, guias, voluntários, patrocinadores, prestadores e proprietários das áreas respondem conforme suas obrigações, atuação e legislação aplicável.</p>
        <p>Dados necessários de identificação, habilitação, veículo e contato de emergência destinam-se à organização e segurança da atividade, com base legal adequada, acesso restrito e conservação proporcional. Dados de saúde exigem fundamento próprio, como consentimento específico para registro preventivo ou proteção da vida em emergência real. A ciência de riscos não autoriza publicidade com a imagem do participante; aplicam-se as condições da seção anterior e a <Link href="/politica-de-privacidade">Política de Privacidade</Link>.</p></>,
    },
    {
        id: "dados-encerramento", title: "Privacidade e encerramento",
        content: <><p>A <Link href="/politica-de-privacidade">Política de Privacidade</Link> descreve os dados tratados, finalidades, bases legais, cookies, compartilhamentos e direitos. O aceite destes termos não substitui uma autorização específica exigida para dados sensíveis.</p><p>Você pode deixar de utilizar o site e pedir o encerramento da conta pelo <Link href="/contato">contato da administração</Link>. Solicitações de exclusão serão avaliadas conforme a LGPD, inclusive obrigações de conservação. Sair da sessão não exclui a conta; encerrar a conta digital não encerra automaticamente o vínculo associativo, que deve ser tratado com o clube.</p></>,
    },
    {
        id: "alteracoes-legislacao", title: "Atualizações e legislação brasileira",
        content: <><p>Novas versões terão data e identificação nesta página. Mudanças relevantes devem ser comunicadas de modo acessível antes de produzir efeitos, quando possível. Novas finalidades de tratamento não ficam autorizadas por uma alteração silenciosa; um novo consentimento será solicitado quando necessário.</p><p>Aplicam-se as leis brasileiras, especialmente a LGPD, o Marco Civil da Internet, as normas de propriedade intelectual e o Código de Defesa do Consumidor quando houver relação de consumo. Nenhuma cláusula limita direitos obrigatórios. Eventuais controvérsias serão tratadas no foro competente por lei, preservado o foro do domicílio do consumidor quando aplicável.</p></>,
    },
];

export default function TermsPage() {
    return <LegalDocument title="Termos de Uso" introduction="Conheça as regras de utilização do site, as condições de uso de imagem e voz e a ciência dos riscos das atividades off-road. Nosso compromisso é oferecer informações claras e respeitar os direitos e responsabilidades de cada participante." sections={sections} version="1.2" updatedAt="2026-10-30" />;
}

function PrivacyEmailLink() {
    const { privacyEmail } = getLegalContact();
    return <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>;
}
