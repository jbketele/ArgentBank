import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk asynchrone pour la connexion utilisateur (Redux Toolkit)
export const loginUser = createAsyncThunk(
    'user/loginUser', // nom de l'action
    async ({ email, password }, thunkAPI) => { // fonction asynchrone appelée lors du dispatch
        try {
            // Appel API pour se connecter
            const response = await fetch('http://localhost:3001/api/v1/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // Vérifie si la réponse est bien du JSON
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;

            // Si erreur, on la remonte à Redux
            if (!response.ok) {
                return thunkAPI.rejectWithValue(data || { message: 'Erreur inconnue' });
            }

            // Stocke le token dans le localStorage
            localStorage.setItem('token', data.body.token);

            // Retourne le token et l'email pour le reducer
            return { token: data.body.token, email };
        } catch {
            // Gestion des erreurs réseau
            return thunkAPI.rejectWithValue({ message: 'Erreur réseau' });
        }
    }
);

// Thunk asynchrone pour récupérer le profil utilisateur
export const fetchUserProfile = createAsyncThunk(
    'user/fetchUserProfile',
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/v1/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data.body; // Données du profil utilisateur
        } catch {
            return thunkAPI.rejectWithValue({ message: 'Erreur serveur' });
        }
    }
);

// Thunk asynchrone pour modifier le profil utilisateur
export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async ({ firstName, lastName }, thunkAPI) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/v1/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ firstName, lastName }),
            });

            const data = await response.json();

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data);
            }

            return data.body; // Nouveau profil utilisateur
        } catch {
            return thunkAPI.rejectWithValue({ message: 'Erreur serveur' });
        }
    }
);

// État initial du slice utilisateur
const initialState = {
    user: null, // Données du profil utilisateur
    token: localStorage.getItem('token') || null, // Token JWT
    loading: false, // Indique si une requête est en cours
    error: null, // Message d'erreur éventuel
};

// Création du slice Redux pour l'utilisateur
const userSlice = createSlice({
    name: 'user', // Nom du slice
    initialState, // État initial
    reducers: {
        // Action pour mettre à jour le profil utilisateur dans le state
        setUserProfile: (state, action) => {
            if (state.user) {
                state.user.firstName = action.payload.firstName;
                state.user.lastName = action.payload.lastName;
            }
        },
        // Action pour déconnecter l'utilisateur
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
    },
    // Gestion des actions asynchrones (thunks)
    extraReducers: (builder) => {
        builder
            // loginUser
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = { email: action.payload.email }; // Le reste du profil sera mis à jour après fetchUserProfile
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Erreur lors de la connexion';
            })
            // fetchUserProfile
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.user = {
                    ...state.user,
                    firstName: action.payload.firstName,
                    lastName: action.payload.lastName,
                    email: action.payload.email,
                };
            })
            // updateUserProfile
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.firstName = action.payload.firstName;
                    state.user.lastName = action.payload.lastName;
                }
            });
    },
});

// Export des actions synchrones
export const { logout, setUserProfile } = userSlice.actions;
// Export du reducer pour le store Redux
export default userSlice.reducer;