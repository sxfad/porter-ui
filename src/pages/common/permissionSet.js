import React from "react";
import {browserHistory} from "react-router";

// export const permissionSet = [{
//     title: '权限设置',
//     dataIndex: 'PermissionSet',
//     key: 'PermissionSet',
//     render: (text, record) => (
//         <a
//             onClick={
//                 () => handlePermissionSet(record)
//             }
//         >
//             设置
//         </a>
//     )
// }];

export const handlePermissionSet = (record) => {
    let routeText = location;
    browserHistory.push({
        pathname: `/dataSource/+PermissionSet/${record.id}`,
        state: {
            dataSign:record.dataSign,
            path:routeText.pathname,
            text:record.pageTitle
        }
    })
};
