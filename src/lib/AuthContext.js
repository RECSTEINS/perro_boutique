import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

function withTimeout(promise, ms = 5000, label = 'operation') {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout en ${label} (${ms}ms)`)), ms)
        ),
    ]);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchProfile(userId) {
        try {
            const { data, error } = await withTimeout(
                supabase.from('profiles')
                .select('id, full_name, role, is_active')
                .eq('id', userId).single(),
                5000,
                'fetchProfile'
            );
            if (error) {
                console.error('Error al cargar el perfil:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.error('fetchProfile falló:', err.message);
        return null;
        }
    }

    useEffect(() => {
        let mounted = true;
        let lastLoadedUserId = null;

        async function handleSession(session, forceRefresh = false) {
            if (!mounted) return;
            
            if (session?.user) {
                setUser(session.user);
                if (forceRefresh || session.user.id !== lastLoadedUserId) {
                    const profileData = await fetchProfile(session.user.id);
                    if (mounted) {
                        setProfile(profileData);
                        lastLoadedUserId = session.user.id;
                    }
                }
            } else {
                setUser(null);
                setProfile(null);
                lastLoadedUserId = null;
            }
            if (mounted) setLoading(false);
        }
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const importantEvents = ['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'PASSWORD_RECOVERY'];
            
            if (importantEvents.includes(event)) {
                handleSession(session, true);
            } else {
                handleSession(session, false);
            }
        }
    );
    
    return () => {
        mounted = false;
        subscription.unsubscribe();
        };
    }, []);
    
    async function signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    }

    async function signUp({ email, password, fullName }){
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        return {data, error};
    }

    async function signOut() {
        await supabase.auth.signOut();
    }

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        isAdmin: profile?.role === 'admin' && profile?.is_active,
        isStaff: ['admin', 'manager'].includes(profile?.role) && profile?.is_active,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const context = useContext(AuthContext);
    if(context === null){
        throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    }
    return context;
}