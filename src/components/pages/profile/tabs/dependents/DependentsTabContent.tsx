'use client';

import { useQuery } from '@tanstack/react-query';
import { Eye,Pencil,Plus,RefreshCw,Trash2,UserRound } from 'lucide-react';
import { listDependentsAction } from '@/actions/dependents';
import { Button } from '@/components/common/button';
import { useModal } from '@/providers/ModalProvider';
import { CreateDependentModal } from './CreateDependentModal';
import { DeleteDependentModal } from './DeleteDependentModal';
import { ViewDependentModal } from './ViewDependentModal';

const RELATIONSHIP_LABELS:Record<MemberDependentRelationshipType,string>={
    CHILD:'Filho(a)',GUEST:'Convidado(a)',OTHER:'Outro',PARENT:'Pai/Mãe',SIBLING:'Irmão/Irmã',SPOUSE:'Cônjuge',
};

export function DependentsTabContent(){
    const {setContent,setOpen}=useModal();
    const {data=[],isLoading,isError,isFetching,refetch}=useQuery({queryKey:['dependents'],queryFn:listDependentsAction});
    const open=(content:React.ReactNode)=>{setContent(content);setOpen()};

    return <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-j-gray-700">Meus dependentes</h3>
            <Button onClick={()=>open(<CreateDependentModal/>)}><Plus size={16}/><span className="hidden sm:inline">Incluir dependente</span><span className="sm:hidden">Incluir</span></Button>
        </div>
        {isLoading&&<p className="text-sm text-j-gray-400">Carregando dependentes...</p>}
        {isError&&<div className="flex flex-col items-start gap-3"><p className="text-sm text-j-red-400">Não foi possível carregar seus dependentes.</p><Button onClick={()=>refetch()} disabled={isFetching}><RefreshCw size={16} className={isFetching?'animate-spin':''}/>Tentar novamente</Button></div>}
        {!isLoading&&!isError&&!data.length&&<p className="text-sm text-j-gray-400">Você ainda não tem dependentes cadastrados.</p>}
        {!isLoading&&!isError&&data.length>0&&<div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
            <div className="hidden grid-cols-[minmax(0,1fr)_160px_300px] gap-4 border-b border-j-gray-200 bg-j-gray-100/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400 md:grid">
                <span>Dependente</span><span>Parentesco</span><span className="text-center">Ações</span>
            </div>
            <div className="divide-y divide-j-gray-100">{data.map(dependent=><div key={dependent.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-blue-50/30 md:grid md:grid-cols-[minmax(0,1fr)_160px_300px] md:items-center md:gap-4">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300"><UserRound size={19}/></span><div className="min-w-0"><p className="truncate font-extrabold text-j-blue-800">{dependent.name}</p><p className="text-xs text-j-gray-400 md:hidden">{RELATIONSHIP_LABELS[dependent.relationshipType]}</p></div></div>
                <span className="hidden w-fit rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-j-blue-700 md:inline-flex">{RELATIONSHIP_LABELS[dependent.relationshipType]}</span>
                <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={()=>open(<ViewDependentModal dependent={dependent}/>)} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-bold text-j-blue-700 transition-colors hover:bg-blue-100"><Eye size={15}/><span className="hidden sm:inline">Visualizar</span></button>
                    <button type="button" onClick={()=>open(<CreateDependentModal dependent={dependent}/>)} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-2 py-2 text-xs font-bold text-j-gray-700 transition-colors hover:bg-yellow-100"><Pencil size={15} className="text-j-yellow-500"/><span className="hidden sm:inline">Editar</span></button>
                    <button type="button" onClick={()=>open(<DeleteDependentModal dependent={dependent}/>)} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-100"><Trash2 size={15}/><span className="hidden sm:inline">Excluir</span></button>
                </div>
            </div>)}</div>
        </div>}
    </div>;
}