import React, { useEffect } from "react";
import { TonConnectButton, useTonWallet, useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserInfoAsync } from '@/store/features/index';
import { updateUserInfo } from '@/api/api';
import { Toast } from 'antd-mobile';
import './index.css';

export function Account() {
    const wallet = useTonWallet();
    const { wallet_address, user_id, token_balance } = useSelector(state => state.userInfo);
    const userFriendlyAddress = useTonAddress();
    const dispatch = useDispatch();
    const { open } = useTonConnectModal();
    useEffect(() => {
        if (wallet && !wallet_address) {
            console.log(wallet);
            updateUserInfo(user_id, { wallet_address: userFriendlyAddress });
        }
    }, [wallet, wallet_address, user_id, userFriendlyAddress]);

    useEffect(() => {
        dispatch(getUserInfoAsync(user_id));
    }, [user_id]);

    const handleClaim = () => {
        if (!wallet) {
            open();
            return
        }
        console.log('claim');
        Toast.show({
            content: '未到开放时间',
        });
    };

    return (
        <div className="body">
            <div className="button">
                <TonConnectButton />
            </div>
            <div className="balance-container">
                <div className="balance-info">
                    <div className="balance-text">Balance</div>
                    <div className="balance-value">
                        {token_balance ? <div>{token_balance} ERC</div> : <div>0 ERC</div>}
                    </div>
                    <div className="claim-button-container">
                        <button className="claim-button" onClick={handleClaim}>Claim</button>
                    </div>
                </div>
            </div>
        </div>
    );
}