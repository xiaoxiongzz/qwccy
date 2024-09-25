import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserInfo } from '@/api/api';

const getUserInfoAsync = createAsyncThunk(
    'userInfo/getUserInfo',
    async (userId, thunkAPI) => {
        try {
            const response = await getUserInfo(userId);
            return response; // 假设API返回的数据中包含gamecoin_balance
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message); // 处理请求错误
        }
    }
);
const userInfo = createSlice({
    name: 'userInfo',
    initialState: {
        user_id: "",
        wallet_address: null,
        gamecoin_balance: null,
        token_balance: "0",
        highest_score: 0,
        first_name: "",
        last_name: "",
        username: "",
        language_code: "",
        invited_by: null,
        invited_users: [],
        loading: false,
        error: null
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserInfoAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserInfoAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.user_id = action.payload.user_id;
                state.wallet_address = action.payload.wallet_address;
                state.gamecoin_balance = action.payload.gamecoin_balance;
                state.token_balance = action.payload.token_balance;
                state.highest_score = action.payload.highest_score;
                state.first_name = action.payload.first_name;
                state.last_name = action.payload.last_name;
                state.username = action.payload.username;
                state.language_code = action.payload.language_code;
                state.invited_by = action.payload.invited_by;
                state.invited_users = action.payload.invited_users;
            })
            .addCase(getUserInfoAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// 导出异步action creator
export { getUserInfoAsync };

export default userInfo.reducer