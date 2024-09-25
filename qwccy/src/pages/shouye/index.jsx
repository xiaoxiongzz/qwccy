import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import WebApp from '@twa-dev/sdk';

export function Shouye() {
    const { user_id, first_name, last_name, token_balance } = useSelector(state => state.userInfo);
    const [iframeHeight, setIframeHeight] = useState('100%');

    useEffect(() => {
        WebApp.expand()
    }, [user_id]);
    useEffect(() => {
        const updateHeight = () => {
            const windowHeight = window.innerHeight;
            const navbarHeight = 50; // 假设导航栏高度为50px，请根据实际情况调整
            const footerHeight = 50; // 假设底部标签栏高度为50px，请根据实际情况调整
            const availableHeight = windowHeight - navbarHeight - footerHeight;
            setIframeHeight(`${availableHeight}px`);
        };

        window.addEventListener('resize', updateHeight);
        updateHeight();

        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '15px', backgroundColor: '#B0DFF7', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', fontFamily: 'Comic Sans MS, cursive, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.5em', color: '#d32f2f' }}>{first_name} {last_name}</span>
                    <span style={{ color: '#1976d2', fontSize: '1.2em' }}>Balance: {token_balance} ERC</span>
                </div>
                {user_id && <iframe
                    src={`https://telegram.welikescwl.top/html5qwccy/?user_id=${encodeURIComponent(user_id)}`}
                    width="100%"
                    height={iframeHeight}
                    style={{ border: 'none', display: 'block' }}
                    title="青蛙吃苍蝇游戏"
                ></iframe>}

            </div>
        </div>
    );
}