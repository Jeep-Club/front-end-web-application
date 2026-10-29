'use client';

import { Button } from '@/components/common/button';
import { ListPagination } from '@/components/common/table/ListPagination';
import { useModal } from '@/providers/ModalProvider';
import { listDependentsAction } from '@/server/actions/dependents';
import { maskCPF,maskPhoneNumber } from '@/utils/masks';
import { useQuery } from '@tanstack/react-query';
import { Eye,Pencil,Plus,RefreshCw,Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CreateDependentModal } from './CreateDependentModal';
import { DeleteDependentModal } from './DeleteDependentModal';
import { DependentPhoto } from './DependentPhoto';
import { ViewDependentModal } from './ViewDependentModal';

const RELATIONSHIP_LABELS:Record<MemberDependentRelationshipType,string>={
    CHILD:'Filho(a)',GUEST:'Convidado(a)',OTHER:'Outro',PARENT:'Pai/Mãe',SIBLING:'Irmão/Irmã',SPOUSE:'Cônjuge',
};

export function DependentsTabContent(){
    const {setContent,setOpen}=useModal();
    const [pagination,setPagination]=useState({pageIndex:0,pageSize:10});
    const {data=[],isLoading,isError,isFetching,refetch}=useQuery({queryKey:['dependents'],queryFn:listDependentsAction});
    const pageCount=Math.ceil(data.length/pagination.pageSize);
    const pageIndex=Math.min(pagination.pageIndex,Math.max(0,pageCount-1));
    const visibleDependents=data.slice(pageIndex*pagination.pageSize,(pageIndex+1)*pagination.pageSize);
    const open=(content:React.ReactNode)=>{setContent(content);setOpen()};

    return <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-j-gray-700">Meus dependentes</h3>
            <Button onClick={()=>open(<CreateDependentModal/>)} className="h-11 w-24 shrink-0 justify-center whitespace-nowrap sm:w-52"><Plus size={16}/><span className="hidden sm:inline">Incluir dependente</span><span className="sm:hidden">Incluir</span></Button>
        </div>
        {isLoading&&<p className="text-sm text-j-gray-400">Carregando dependentes...</p>}
        {isError&&<div className="flex flex-col items-start gap-3"><p className="text-sm text-j-red-400">Não foi possível carregar seus dependentes.</p><Button onClick={()=>refetch()} disabled={isFetching}><RefreshCw size={16} className={isFetching?'animate-spin':''}/>Tentar novamente</Button></div>}
        {!isLoading&&!isError&&!data.length&&<p className="text-sm text-j-gray-400">Você ainda não tem dependentes cadastrados.</p>}
        {!isLoading&&!isError&&data.length>0&&<div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(130px,0.8fr)_minmax(140px,0.9fr)_minmax(110px,0.7fr)_280px] gap-3 border-b border-j-gray-200 bg-j-gray-100/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400 xl:grid">
                <span>Dependente</span><span className="text-center">CPF</span><span className="text-center">Telefone</span><span className="text-center">Parentesco</span><span className="text-center">Ações</span>
            </div>
            <div className="divide-y divide-j-gray-100">{visibleDependents.map(dependent=><div key={dependent.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-blue-50/30 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(130px,0.8fr)_minmax(140px,0.9fr)_minmax(110px,0.7fr)_280px] xl:items-center xl:gap-3">
                <div className="flex min-w-0 items-center gap-3"><DependentPhoto dependent={dependent} /><div className="min-w-0"><p className="truncate font-extrabold text-j-blue-800">{dependent.name}</p><p className="text-xs text-j-gray-400 xl:hidden">{RELATIONSHIP_LABELS[dependent.relationshipType]}</p></div></div>
                <p className="text-sm text-j-gray-600 xl:text-center"><span className="mr-1 text-xs font-bold xl:hidden">CPF:</span>{maskCPF(dependent.cpf)}</p>
                <p className="text-sm text-j-gray-600 xl:text-center"><span className="mr-1 text-xs font-bold xl:hidden">Telefone:</span>{dependent.phoneNumber ? maskPhoneNumber(dependent.phoneNumber) : '—'}</p>
                <span className="hidden w-fit justify-self-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-j-blue-700 xl:inline-flex">{RELATIONSHIP_LABELS[dependent.relationshipType]}</span>
                <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={()=>open(<ViewDependentModal dependent={dependent}/>)} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-bold text-j-blue-700 transition-colors hover:bg-blue-100"><Eye size={15}/><span className="hidden sm:inline">Visualizar</span></button>
                    <button type="button" onClick={()=>open(<CreateDependentModal dependent={dependent}/>)} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-2 py-2 text-xs font-bold text-j-gray-700 transition-colors hover:bg-yellow-100"><Pencil size={15} className="text-j-yellow-500"/><span className="hidden sm:inline">Editar</span></button>
                    <button type="button" onClick={()=>open(<DeleteDependentModal dependent={dependent}/>)} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-100"><Trash2 size={15}/><span className="hidden sm:inline">Excluir</span></button>
                </div>
            </div>)}</div>
        </div>}
        {!isLoading&&!isError&&data.length>0&&<ListPagination itemLabel="dependente" isFetching={isFetching} pagination={{pageIndex,pageSize:pagination.pageSize,pageCount,rowCount:data.length,onChange:(next)=>setPagination({pageIndex:next.pageSize!==pagination.pageSize?0:next.pageIndex,pageSize:next.pageSize})}}/>}
    </div>;
}
