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
    try {
        if (process.env.API_URL) {
            try {
                await actionFetchWrapper({
                    url: HttpAPIRoutes.LOGOUT,
                    method: `POST`,
                    schema: z.string().nullable()
                });
            } catch {
                // Silencia exceções em ambiente dev/mock
            }
        }
        
        await logout();
    } catch(error : unknown) {
        throw new Error('Erro ao realizar logout', {cause: error})
    }
}