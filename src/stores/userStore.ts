import {create} from 'zustand';

interface UserState {
    permissions: PermissionModule[];
    setPermissions: (permissions: PermissionModule[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
    permissions: [],
    setPermissions: (permissions: PermissionModule[]) => set({ permissions }),
}));