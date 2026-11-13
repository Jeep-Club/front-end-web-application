import { QueryClient } from '@tanstack/react-query';
import UserProvider from '@/providers/auth/UserProvider';

const cleanups: (() => void)[] = [];
const client = new QueryClient();
jest.mock('react', () => ({ ...jest.requireActual('react'), useEffect: (effect: () => (() => void) | undefined) => { const cleanup = effect(); if (cleanup) cleanups.push(cleanup); } }));
jest.mock('@tanstack/react-query', () => ({ ...jest.requireActual('@tanstack/react-query'), useQueryClient: () => client }));
jest.mock('@/stores/userStore', () => ({ useUserStore: (select: (state: { setPermissions: () => void }) => unknown) => select({ setPermissions: jest.fn() }) }));

it('remove somente Publications ao sair da sessão autenticada, mesmo com permissions iguais', () => {
    client.setQueryData(['publications', 'detail', 1, []], { likedByMe: true });
    client.setQueryData(['publications', 'feed-sidebar', 'NOTICE'], { content: [{ id: 1 }] });
    client.setQueryData(['unrelated'], 'preservado');
    // Effect harness only; this test proves cache cleanup, not React lifecycle/DOM.
    UserProvider({ permissions: [], children: null });
    cleanups.splice(0).forEach(cleanup => cleanup());
    expect(client.getQueriesData({ queryKey: ['publications'] })).toEqual([]);
    expect(client.getQueryData(['unrelated'])).toBe('preservado');
    client.clear();
});
