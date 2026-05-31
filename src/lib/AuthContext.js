import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children}){
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchProfile(userId){
        const { data, error } = await supabase
            .from('profiles')
            .select('id,full_name, role, is_active')
            .eq('id', userId).single();
        
        if(error){
            console.error('Error al cargar el perfil: ',error);
            return null;
        }
        return data;
    }

    useEffect(() => {
        async function loadSession(){
            const { data:{ session }} = await supabase.auth.getSession();

            if (session?.user){
                setUser(session.user);
                const profileData = await fetchProfile(session.user.id);
                setProfile(profileData);
            }
            setLoading(false);
        }

        loadSession();

        const { data:{ subscription }} = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user){
                    setUser(session.user);
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                } else{
                    setUser(null);
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function signIn({ email, password}){
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return {data, error};
    }

    async function signUp({ email, password, fullName }){
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options:{
                data: { full_name: fullName}
            }
        });
        return {data, error};
    }

    async function signOut(){
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
        isStaff: ['admin', 'manager'].includes(profile?.role) && profile?.is_active
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
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}