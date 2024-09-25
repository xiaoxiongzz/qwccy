import React, { useState, useEffect } from 'react';
import { List } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useSelector } from 'react-redux';
import { updateUserInfo } from '@/api/api';
import axios from 'axios'; // 确保已安装 axios
import './index.css';

export function Task() {
    const initialTasks = [
        // 前三个任务保持不变
        { id: 1, title: '邀请好友', icon: '🍎', reward: 450, exclusive: true, pay: 2, maxClicks: 1, clicks: 0 },
        { id: 2, title: '加入Telegram', icon: '🍐', reward: 450, exclusive: false, pay: 2, maxClicks: 1, clicks: 0, link: 'https://t.me/+BRIJbuw5TScxYzM1' },
        { id: 3, title: '关注X', icon: '🍊', reward: 450, exclusive: true, pay: 2, maxClicks: 1, clicks: 0, link: 'https://x.com/LinHuazi71724' },
        // Twitter 分享任务，相关数据将从数据库获取
        { id: 4, title: 'Twitter转发', icon: '🍌', reward: 450, exclusive: true, pay: 2, maxClicks: Infinity, clicks: 0, tweetUrl: '', shareText: '', hashtags: '' }
    ];

    const [tasks, setTasks] = useState(initialTasks);
    const { user_id } = useSelector(state => state.userInfo);

    useEffect(() => {
        // 获取 Twitter 分享任务的相关数据
        const fetchTwitterData = async () => {
            try {
                const response = await axios.get('https://tgserver.welikescwl.top/tweet/api/twitter-share-data');
                console.log(response);
                const { tweetUrl, shareText, hashtags } = response.data;
                setTasks(prevTasks => prevTasks.map(task =>
                    task.id === 4 ? { ...task, tweetUrl, shareText, hashtags } : task
                ));
            } catch (error) {
                console.error('获取 Twitter 分享数据失败:', error);
            }
        };

        fetchTwitterData();
    }, []);

    const handleRetweet = (task) => {
        const { tweetUrl, shareText, hashtags } = task;
        const encodedTweetUrl = encodeURIComponent(tweetUrl);
        const encodedShareText = encodeURIComponent(shareText);
        const encodedHashtags = encodeURIComponent(hashtags);

        const shareUrl = `https://twitter.com/intent/tweet?url=${encodedTweetUrl}&text=${encodedShareText}&hashtags=${encodedHashtags}`;

        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

    const clickTask = async (id) => {
        const task = tasks.find(t => t.id === id);

        // 打开链接的逻辑
        if (id === 2 || id === 3) {
            if (task.link) {
                window.open(task.link, '_blank', 'noopener,noreferrer');
            }
        }

        if (id === 4 && task.tweetUrl) {
            handleRetweet(task);
        }

        if (task && task.clicks < task.maxClicks) {
            await updateUserInfo(user_id, { token_balance: task.pay });
            setTasks(prevTasks => prevTasks.map(t =>
                t.id === id ? { ...t, clicks: t.clicks + 1 } : t
            ));
            // 更新本地存储
            const updatedTasks = tasks.map(t =>
                t.id === id ? { ...t, clicks: t.clicks + 1 } : t
            );
            localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        }
    };

    return (
        <div className="task-container">
            <List className="task-list">
                {tasks.map(task => (
                    <List.Item
                        key={task.id}
                        prefix={<div className="task-icon">{task.icon}</div>}
                        extra={<RightOutline />}
                        arrow={false}
                        onClick={() => clickTask(task.id)}
                        className={task.clicks >= task.maxClicks && task.id !== 4 ? 'task-completed' : ''}
                    >
                        <div className="task-content">
                            <div className="task-name">{task.title}</div>
                            <div className="task-pay">+{task.pay} ERC</div>
                            <div className="task-progress">
                                ({task.clicks}/{task.maxClicks === Infinity ? '∞' : task.maxClicks})
                            </div>
                        </div>
                    </List.Item>
                ))}
            </List>
        </div>
    );
}
