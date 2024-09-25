import WebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';
import { Toast, Button, Input, List, DotLoading } from 'antd-mobile';
import './index.css';
import { useSelector } from 'react-redux';
import { allUserInfoList } from '@/api/api';

export function Invite() {
    const { user_id, invited_users } = useSelector(state => state.userInfo);
    const [inviteLink, setInviteLink] = useState('');
    const [inviteList, setInviteList] = useState([]);

    useEffect(() => {
        allUserInfoList().then(res => {
            const matchedInviteList = invited_users.map(invitedUserId => {
                const userInfo = res.find(user => user.user_id == invitedUserId);
                return userInfo
            }).filter(Boolean);  // 过滤掉null值
            setInviteList(matchedInviteList)
        })
        setInviteLink('')
        setInviteLink(`https://t.me/qwccy_bot/qwccy?startapp=${user_id}`);
    }, [user_id]);

    const handleInvite = () => {
        const url = encodeURIComponent(inviteLink);
        const text = encodeURIComponent("\n~邀请您来玩一个有趣的游戏! ");
        const messageUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        WebApp.openTelegramLink(messageUrl);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            Toast.show({
                icon: 'success',
                content: '邀请链接已复制'
            });
        }).catch(() => {
            Toast.show({
                icon: 'fail',
                content: '复制失败,请重试'
            });
        });
    };

    return (
        <div className="invite-container">
            <div className="invite-card">
                <h1 className="invite-title">邀请好友</h1>
                <p className="invite-description">邀请好友加入游戏,一起享受乐趣!</p>
                <div className="invite-link-container">
                    <Input readOnly value={inviteLink} className="invite-link-input" />
                    <Button onClick={handleCopyLink} className="invite-copy-button">
                        复制
                    </Button>
                </div>
                <div className="invite-button-container">
                    <Button onClick={handleInvite} color='primary' className="invite-button">
                        邀请好友
                    </Button>
                </div>
                <div className="invite-list-wrapper">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="invite-list-title">邀请列表</div>
                        <div >{inviteList.length}人</div>
                    </div>
                    <div className="invite-list-scroll">
                        {inviteList.length === 0 ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}> {inviteList.length === 0 ? '邀请列表为空' : <DotLoading />}</div> : (
                            <List>
                                {inviteList.map(item => (
                                    <List.Item
                                        key={item.user_id}
                                        description={item.username}
                                    >
                                        {item.first_name} {item.last_name}
                                    </List.Item>
                                ))}
                            </List>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}