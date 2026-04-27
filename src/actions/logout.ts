'use server'

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper"
import { logout } from "@/utils/auth/logout";
import { z } from "zod";

/**
 * Logout Action
 * 
 * Responsavel por: 
 * - Realizar logout do usuario
 *   - Faz uma chamada na API `/logout` - deslogando a sessao na API
 *   - Faz a limpeza dos cookies da sessao do usuario
 * - Por fim redireciona para rota inicial
 */
export default async function logoutAction(){
    try{
        // Faz chamada na api para realizar logout no usuario
        await actionFetchWrapper({
            url: `api/logout`,
            method: `GET`,
            schema: z.object() // obrigatorio possuir schema porem logout nao possui nenhum no momento
        })

        // Limpa todos os cookies da sessao
        await logout();
    }
    catch(error : unknown){
        throw new Error('Erro ao realizar logout', {cause: error})
    }
}