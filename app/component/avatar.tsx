import React from 'react';
import type { MenuProps } from 'antd';
import { Dropdown, Avatar } from 'antd';
import Image  from 'next/image'

const onClick: MenuProps['onClick'] = ({ key }) => {
  console.log(key)
};

const items: MenuProps['items'] = [
  {
    label: 'Profile',
    key: '1',
  },
  {
    label: 'Logout',
    key: '2',
  },
];
const url = 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg';
const UserAvatar: React.FC = () => (
  <Dropdown menu={{ items, onClick }}>
    <Avatar src={<Image src={url} width={20} height={20} alt="avatar" />} />
  </Dropdown>
);

export default UserAvatar;