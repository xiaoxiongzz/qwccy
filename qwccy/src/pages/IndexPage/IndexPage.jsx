import './IndexPage.css'
import WebApp from '@twa-dev/sdk';
import React, { useState, useEffect } from 'react';
import { Tabbar } from '@telegram-apps/telegram-ui';
import { useNavigate, Outlet } from 'react-router-dom';
import { addInvitee, addUserInfo } from '@/api/api';
import { useDispatch, useSelector } from 'react-redux'
import { getUserInfoAsync } from '@/store/features/index'
/**
 * @returns {JSX.Element}
 */


export function IndexPage() {
  const dispatch = useDispatch();
  const { user_id } = useSelector(state => state.userInfo);
  const initData = WebApp.initDataUnsafe;
  const userInfo = initData.user;
  const fetchUserInfo = async () => {
    if (initData.start_param) {
      await addInvitee({ inviter_id: initData.start_param, invitee_id: userInfo.id });
    }
    return
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        await addUserInfo(userInfo);
        console.log(userInfo);
        await dispatch(getUserInfoAsync(userInfo.id));
        // await fetchUserInfo();
      } catch (error) {
        console.error('初始化用户信息时出错：', error);
      }
    };

    initializeUser();
  }, [userInfo, userInfo.id]);

  const tabs = [
    { id: 'shouye', text: '首页', icon: '' },
    { id: 'invite', text: '邀请', icon: '' },
    { id: 'account', text: '账户', icon: '' },
    { id: 'task', text: '任务', icon: '' },
  ];
  const [currentTab, setCurrentTab] = useState(tabs[0].id);
  const navigate = useNavigate();

  useEffect(() => {
    // 组件挂载时导航到首页
    if (currentTab === tabs[0].id) {
      navigate(tabs[0].id);
      WebApp.expand()
    }
  }, [user_id]);

  const clickTab = (id) => {
    setCurrentTab(id)
    navigate(id);
  }

  return (
    <div className="index-page">
      <div className="content">
        <Outlet />
      </div>
      <div className="tabbar-container">
        <Tabbar>
          {tabs.map(({ id, text }) => (
            <Tabbar.Item
              key={id}
              text={text}
              selected={id === currentTab}
              onClick={() => clickTab(id)}
            />
          ))}
        </Tabbar>
      </div>
    </div>
  )
}
