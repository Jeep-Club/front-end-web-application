import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { type LegalSection } from "@/components/common/legal-document";
import LegalContact from "@/components/common/legal-contact";

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
        id: "dados-encerramento", title: "Privacidade e encerramento",
        content: <><p>A <Link href="/politica-de-privacidade">Política de Privacidade</Link> descreve os dados tratados, finalidades, bases legais, cookies, compartilhamentos e direitos. O aceite destes termos não substitui uma autorização específica exigida para dados sensíveis.</p><p>Você pode deixar de utilizar o site e pedir o encerramento da conta pelo <Link href="/contato">contato da administração</Link>. Solicitações de exclusão serão avaliadas conforme a LGPD, inclusive obrigações de conservação. Sair da sessão não exclui a conta; encerrar a conta digital não encerra automaticamente o vínculo associativo, que deve ser tratado com o clube.</p></>,
    },
    {
        id: "alteracoes-legislacao", title: "Atualizações e legislação brasileira",
        content: <><p>Novas versões terão data e identificação nesta página. Mudanças relevantes devem ser comunicadas de modo acessível antes de produzir efeitos, quando possível. Novas finalidades de tratamento não ficam autorizadas por uma alteração silenciosa; um novo consentimento será solicitado quando necessário.</p><p>Aplicam-se as leis brasileiras, especialmente a LGPD, o Marco Civil da Internet, as normas de propriedade intelectual e o Código de Defesa do Consumidor quando houver relação de consumo. Nenhuma cláusula limita direitos obrigatórios. Eventuais controvérsias serão tratadas no foro competente por lei, preservado o foro do domicílio do consumidor quando aplicável.</p></>,
    },
];

export default function TermsPage() {
    return <LegalDocument title="Termos de Uso" introduction="Conheça as regras de utilização do site e as responsabilidades de cada participante. Nosso compromisso é oferecer informações claras, respeitar seus direitos e permitir uma operação responsável do serviço." sections={sections} />;
}
