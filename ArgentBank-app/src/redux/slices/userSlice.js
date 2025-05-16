import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk pour l'authentification de l'utilisateur (connexion)
export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ email, password }, thunkAPI) => {
        try {
            console.log('Tentative de connexion avec', email, password);
            const response = await fetch('http://localhost:3001/api/v1/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                return thunkAPI.rejectWithValue(data || { message: 'Erreur inconnue' });
            }

            // Enregistrement du token dans le localStorage
            localStorage.setItem('token', data.body.token);

            return { token: data.body.token, email };
        } catch (error) {
            console.error('Erreur dans loginUser:', error);
            return thunkAPI.rejectWithValue({ message: 'Erreur réseau' });
        }
    }
);

// Thunk pour récupérer les infos de profil
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

            return data.body;
        } catch (error) {
            console.error('Erreur dans fetchUserProfile:', error);
            return thunkAPI.rejectWithValue({ message: 'Erreur serveur' });
        }
    }
);

// Thunk pour modifier le profil utilisateur
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

            return data.body;
        } catch (error) {
            console.error('Erreur dans updateUserProfile:', error);
            return thunkAPI.rejectWithValue({ message: 'Erreur serveur' });
        }
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserProfile: (state, action) => {
            if (state.user) {
                state.user.firstName = action.payload.firstName;
                state.user.lastName = action.payload.lastName;
            }
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
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

            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.user = {
                    ...state.user,
                    firstName: action.payload.firstName,
                    lastName: action.payload.lastName,
                    email: action.payload.email,
                };
            })

            .addCase(updateUserProfile.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.firstName = action.payload.firstName;
                    state.user.lastName = action.payload.lastName;
                }
            });
    },
});

export const { logout, setUserProfile } = userSlice.actions;
export default userSlice.reducer;