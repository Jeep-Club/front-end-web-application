'use server'

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper"
import { logout } from "@/utils/auth/logout";
import { HttpAPIRoutes } from "@/utils/http/api";
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
        // Limpa todos os cookies da sessao
        
        // Faz chamada na api para realizar logout no usuario
        await actionFetchWrapper({
            url: HttpAPIRoutes.LOGOUT,
            method: `POST`,
            schema: z.string().nullable()
        })
        
        await logout();
    }
    catch(error : unknown){
        throw new Error('Erro ao realizar logout', {cause: error})
    }
}