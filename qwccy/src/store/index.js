import { configureStore } from '@reduxjs/toolkit';
import userInfo from './features/index';

// 创建 Redux store，并加载存储的状态
const store = configureStore({
    reducer: {
        userInfo
    },
});


export default store;